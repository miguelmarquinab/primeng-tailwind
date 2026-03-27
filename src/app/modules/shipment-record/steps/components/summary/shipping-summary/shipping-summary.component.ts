import { Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Divider } from 'primeng/divider';
import { Button } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ShippingSummaryStepOriginComponent } from '@shipment-record/steps/components/summary/shipping-summary-step-origin/shipping-summary-step-origin.component';
import { ShippingSummaryStepDestinationsComponent } from '@shipment-record/steps/components/summary/shipping-summary-step-destinations/shipping-summary-step-destinations.component';
import { CartService } from '@shipment-record/services/cart.service';
import { debounceTime, distinctUntilChanged, filter, shareReplay, skip, Subject, Subscription, takeUntil } from 'rxjs';
import { CartEntityDataResponse, CartEntityResponse, CartOriginEntityResponse, CartPersonEntityResponse, CartState } from '@shipment-record/models/cart.model';
import { CartSessionStorageService } from '@shipment-record/services/cart-session-storage.service';
import { SessionStorageService } from '@shared/services/storage/session-storage.service';
import { PaymentMethodModalComponent } from '@shared/payment-method-modal/payment-method-modal.component';
import { RegistrationSuccessModalComponent } from '@shared/registration-success-modal/registration-success-modal.component';
import { PinModal } from '@shipment-record/steps/components/step3/shipment-record-pin-modal/pin-modal.component';
import { ShipmentRecordDeclarationAffidavitModalComponent } from '@shipment-record/steps/components/step3/shipment-record-declaration-affidavit-modal/shipment-record-declaration-affidavit-modal.component';
import { CartSessionStorage } from '@shipment-record/models/cart-session-storage.model';
import { CartItemEntityResponse } from '@shipment-record/models/cart-item.model';
import { DELIVERY_TYPE, PAYMENT_TYPES, PAYMENT_TYPES_CODES } from '@shipment-record/contansts/shipment-record-step.constant';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { ShippingSummaryPaymentDeniedComponent } from '@shipment-record/steps/components/summary/shipping-summary-payment-denied/shipping-summary-payment-denied.component';

@Component({
    selector: 'app-shipping-summary',
    imports: [Divider, ShippingSummaryStepOriginComponent, ShippingSummaryStepDestinationsComponent, Button, FormsModule, InputTextModule],
    templateUrl: './shipping-summary.component.html',
    standalone: true,
    styleUrl: './shipping-summary.component.scss',
    providers: [DialogService]
})
export class ShippingSummaryComponent implements OnInit, OnChanges, OnDestroy {
    origin: CartOriginEntityResponse | null = null;
    whoSend: CartPersonEntityResponse | null = null;
    isLoading = false;
    cartResponse!: any;

    private readonly cartService = inject(CartService);
    private readonly destroy$ = new Subject<void>();
    private readonly cartSessionService = inject(CartSessionStorageService);
    private readonly sessionStorageService = inject(SessionStorageService);
    private readonly messageService = inject(MessageService);
    private readonly confirmationService = inject(ConfirmationService);

    private readonly router = inject(Router);

    private cartSubscription: Subscription | null = null;
    private readonly CART_DATA_KEY = 'cartData';

    dialog = inject(DialogService);
    ref: DynamicDialogRef | null = null;

    cartData!: CartSessionStorage;

    couponCode = '';
    couponApplying = false;
    couponAppliedCode: string | null = null;

    private readonly couponInput$ = new Subject<string>();
    private lastProcessedCouponCode = '';

    @Input() stepNumber!: number;
    cart!: CartEntityDataResponse | undefined;

    ngOnInit(): void {
        this.cartData = this.cartSessionService.getCartData();
        this.couponAppliedCode = this.cartSessionService.getAppliedCouponCode();
        this.couponCode = this.couponAppliedCode ?? '';

        this.suscribeToCart();
        this.getLatestCart();
        this.initCouponAutoApply();
    }

    ngOnChanges(simpleChanges: SimpleChanges): void {
        // this.getLatestCart();
        console.log('ngOnChanges detected:', simpleChanges);

        if (simpleChanges['stepNumber'] && !simpleChanges['stepNumber'].firstChange) {
            console.log('Step number changed to:', simpleChanges['stepNumber'].currentValue);
            // this.getLatestCart();
            if (simpleChanges['stepNumber'].currentValue === 1) {
                this.whoSend = null;
                this.origin = null;
                this.cartData = this.cartSessionService.getCartData();
            }
        }
    }

    suscribeToCart(): void {
        if (this.cartSubscription) {
            return;
        }

        this.cartSubscription = this.cartService.cartStore$
            .pipe(
                skip(1),
                filter((cart) => cart !== null),
                distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
                shareReplay(1),
                takeUntil(this.destroy$)
            )
            .subscribe((cart: CartState) => {
                console.log(cart);

                if (cart && !cart.reset) {
                    this.getLatestCart();
                }
            });
    }

    getCartByUuid(uuid: string): void {
        this.cartService
            .getByUuid(uuid)
            .pipe(shareReplay(1), takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    console.log(response);
                    this.cartResponse = response;

                    if (response.data?.person) {
                        this.whoSend = response.data.person;
                    }

                    if (response.data?.origin) {
                        this.origin = response.data.origin;
                    }

                    this.cart = response.data;
                    this.cartSessionService.setItems(response.data?.items ?? []);
                    this.cartSessionService.setPricing(response.data?.pricing ?? {});
                    this.cartData = this.cartSessionService.getCartData();

                    if (this.cart?.payment?.status === 'denied') {
                        // alert('Denied');
                        this.openPaymentDeniedModal();
                    }
                },
                error: (error) => {
                    console.error('Error fetching cart by UUID:', error);

                    if (error.status === 404) {
                        console.warn('Cart not found for UUID:', uuid);
                        this.sessionStorageService.remove(this.CART_DATA_KEY);
                        this.cartSessionService.clear();
                        this.cartService.setStepNumber(1);
                    }
                }
            });
    }

    getLatestCart(): void {
        const cartId = this.cartSessionService.getCartId();

        if (cartId) {
            this.getCartByUuid(cartId);
        }
    }

    onCouponCodeChange(value: string): void {
        const normalizedValue = (value ?? '').toUpperCase();
        this.couponCode = normalizedValue;
        this.couponInput$.next(normalizedValue);
    }

    private initCouponAutoApply(): void {
        this.couponInput$.pipe(debounceTime(1500), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe((code) => {
            const normalizedCode = code.trim();

            if (!normalizedCode) {
                this.resetCouponState();
                return;
            }

            if (normalizedCode === this.lastProcessedCouponCode) {
                return;
            }

            this.applyCoupon(normalizedCode);
        });
    }

    private applyCoupon(code: string): void {
        const cartId = this.cartSessionService.getCartId();

        if (!cartId) {
            this.messageService.add({
                severity: 'error',
                summary: 'Cupón',
                detail: 'No hay carrito activo.'
            });
            return;
        }

        this.couponApplying = true;

        this.cartService
            .validateCoupon(code)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (validation) => {
                    if (validation?.status !== 'OK') {
                        this.couponApplying = false;
                        this.lastProcessedCouponCode = '';
                        this.showInvalidCouponModal();
                        return;
                    }

                    this.cartService
                        .applyCoupon(cartId, code)
                        .pipe(takeUntil(this.destroy$))
                        .subscribe({
                            next: (response) => {
                                this.cartSessionService.setItems(response.data?.items ?? []);
                                this.cartSessionService.setPricing(response.data?.pricing ?? {});
                                this.cartSessionService.setAppliedCouponCode(code);

                                this.cartData = this.cartSessionService.getCartData();
                                this.couponAppliedCode = code;
                                this.lastProcessedCouponCode = code;
                                this.couponApplying = false;

                                this.messageService.add({
                                    severity: 'success',
                                    summary: 'Cupón aplicado',
                                    detail: 'Descuento aplicado correctamente.'
                                });
                            },
                            error: () => {
                                this.couponApplying = false;
                                this.lastProcessedCouponCode = '';
                                this.messageService.add({
                                    severity: 'error',
                                    summary: 'Error',
                                    detail: 'No se pudo aplicar el cupón. Intenta de nuevo.'
                                });
                            }
                        });
                },
                error: () => {
                    this.couponApplying = false;
                    this.lastProcessedCouponCode = '';
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo validar el cupón.'
                    });
                }
            });
    }

    clearAppliedCoupon(): void {
        this.couponCode = '';
        this.resetCouponState();
    }

    private resetCouponState(): void {
        this.cartSessionService.setAppliedCouponCode(null);
        this.couponAppliedCode = null;
        this.lastProcessedCouponCode = '';
        this.getLatestCart();
    }

    private showInvalidCouponModal(): void {
        this.confirmationService.confirm({
            message: '<span class="font-montserrat">El codigo de cupon ingresado es invalido.</span>',
            header: 'Cupón inválido',
            icon: 'pi pi-exclamation-triangle',
            rejectVisible: false,
            acceptButtonProps: {
                label: 'Aceptar',
                severity: 'primary'
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.cartSubscription?.unsubscribe();
    }

    nextStep(): void {
        const cartData = this.getCurrentCartData();
        const hasDeclaracionPreview = this.hasDeclaracionJurada(cartData);

        console.log('Abriendo PinModal con cartData:', cartData);

        const cartUuid = this.cartSessionService.getCartId();
        console.log('Cart UUID para PinModal:', cartUuid);
        console.log('Cart haveOfficeDelivery:', this.haveOfficeDelivery());

        if (hasDeclaracionPreview) {
            const cartDataReal = this.getCurrentCartData();
            const shipmentsToDeclare = this.buildShipmentsToDeclare(cartDataReal);

            this.openDeclaracionJuradaModal(shipmentsToDeclare);
            return;
        }

        if (this.haveOfficeDelivery()) {
            this.openPinModal();
        } else {
            this.openPaymentMethodModal();
        }
    }

    haveOfficeDelivery(): boolean {
        const cartData = this.cartSessionService.getCartData();
        const items = cartData?.items ?? [];

        return items.some((item: CartItemEntityResponse) => {
            const deliveryType = item?.service?.delivery_type ?? '';
            return deliveryType === DELIVERY_TYPE.OFFICE;
        });
    }

    openPinModal(): void {
        this.ref = this.dialog.open(PinModal, {
            header: '',
            width: '371px',
            contentStyle: { 'max-height': '500px', overflow: 'auto' },
            closable: true,
            data: {
                cartUuid: this.cartSessionService.getCartId()
            }
        });

        this.ref?.onClose.subscribe({
            next: (data) => {
                console.log('Modal closed with data:', data);

                const pinValue = typeof data === 'string' ? data : data?.pin;

                if (!pinValue) {
                    return;
                }

                if (this.cartData?.header?.whoPay === PAYMENT_TYPES_CODES.ONLINE) {
                    this.openPaymentMethodModal();
                    return;
                }

                if (this.cartData?.header?.whoPay === PAYMENT_TYPES_CODES.DESTINATION) {
                    // @TODO CREATE DESTIONATION PAYMENT
                    this.createOfflinePayment();
                    return;
                }
            }
        });
    }

    createOfflinePayment(): void {
        const cartUuid = this.cartSessionService.getCartId() ?? '';

        this.cartService.createOfflinePayment(cartUuid).subscribe({
            next: (data) => {
                alert('Redirect');
                // shipment-record/finish
                this.router.navigate(['/shipment-record/finish']);
            }
        });
    }
    private getCurrentCartData(): CartSessionStorage {
        return this.cartSessionService.getCartData();
    }

    private getCartTotalNumber(cartData: any): number {
        return this.cartData.pricing?.total ?? 0;
        // if (total != null && typeof total === 'number') {
        //     return total;
        // }
        //
        // const items = cartData?.items ?? [];
        // return items.reduce((sum: number, item: any) => {
        //     return sum + Number(item?.pricing?.amount ?? item?.amount ?? 0);
        // }, 0);
    }

    private hasDeclaracionJurada(cartData: any): boolean {
        const items = cartData?.items ?? [];

        if (items.length > 0) {
            return items.some((item: any) => this.getItemDeclaredValue(item) >= 500);
        }

        return this.getCartTotalNumber(cartData) > 500;
    }

    private getItemDeclaredValue(item: CartItemEntityResponse): number {
        return Number(item?.what_send?.declared_value ?? 0);
    }

    private getItemContenido(item: any, idx: number): string {
        const articleName = item?.what_send?.article_name ?? item?.article_name;

        if (articleName) {
            return articleName;
        }

        const articleId = item?.what_send?.article_id ?? item?.article_id;

        if (articleId != null) {
            return `Artículo ${articleId}`;
        }

        return `Envío ${idx + 1}`;
    }

    private buildShipmentsToDeclare(cartData: CartEntityDataResponse): CartItemEntityResponse[] {
        const items = cartData?.items ?? [];

        return items.filter((item: CartItemEntityResponse) => {
            const numericValue = Number(String(item.what_send?.declared_value));
            return numericValue > 500;
        });
    }

    private getPaymentAmount(): number {
        const total = this.getCartTotalNumber(this.getCurrentCartData());
        return total > 0 ? total : 0;
    }

    openPaymentMethodModal(): void {
        this.ref = this.dialog.open(PaymentMethodModalComponent, {
            width: '571px',
            contentStyle: { 'max-height': '600px', overflow: 'auto' },
            closable: true,
            data: {
                selectedPaymentMethod: 'niubiz',
                error: null,
                paymentAmount: this.getPaymentAmount(),
                showFinalHeader: true,
                totalSteps: 2,
                currentStep: 2
            }
        });
    }

    openDeclaracionJuradaModal(shipmentsToDeclare: CartItemEntityResponse[]): void {
        this.ref = this.dialog.open(ShipmentRecordDeclarationAffidavitModalComponent, {
            header: '',
            width: '627px',
            contentStyle: { 'max-height': '600px', overflow: 'auto' },
            closable: true,
            data: {
                shipmentsToDeclare
            }
        });

        this.ref?.onClose.subscribe({
            next: (accepted) => {
                if (accepted) {
                    if (this.haveOfficeDelivery()) {
                        this.openPinModal();
                    } else {
                        this.openPaymentMethodModal();
                    }
                }
            }
        });
    }

    get totalPago(): string {
        return `S/${this.getPaymentAmount().toFixed(2)}`;
    }

    get tipoPago(): string {
        const data = this.getCurrentCartData();
        const paymentTypeLabel = this.getPaymenTypeByCode(data?.header?.whoPay ?? '');
        return paymentTypeLabel;
    }

    getPaymenTypeByCode(code: string): string {
        return PAYMENT_TYPES.find((type) => type.code === code)?.title ?? 'Pago en línea';
    }

    get cantidadEnvios(): number {
        const items = this.getCurrentCartData()?.items ?? [];
        return items.length;
    }

    get igvFormatted(): number {
        const data = this.getCurrentCartData();
        return data?.pricing?.igv_total ?? 0;
    }

    openRegistrationSuccessModal(): void {
        this.ref = this.dialog.open(RegistrationSuccessModalComponent, {
            width: '660px',
            contentStyle: { 'max-height': '600px', overflow: 'auto' },
            closable: true,
            data: {
                registrationNumber: '202408118705',
                dateTime: '24/09/25 - 12:49:24',
                transaction: '#12345678',
                card: '447411******2240 (visa)',
                amountPaid: 'S/15.56',
                amountToPay: 'S/15.56'
            }
        });
    }

    openPaymentDeniedModal(): void {
        this.ref = this.dialog.open(ShippingSummaryPaymentDeniedComponent, {
            width: '660px',
            contentStyle: { 'max-height': '600px', overflow: 'auto' },
            closable: false,
            data: {
                cart: this.cart
            }
        });

        this.ref?.onClose.subscribe({
            next: (response) => {
                if (response?.action === 'retry') {
                    this.openPaymentMethodModal();
                }
            }
        });
    }
}
