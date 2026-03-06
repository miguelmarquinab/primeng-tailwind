import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Divider } from 'primeng/divider';
import { Button } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ShippingSummaryStepOriginComponent } from '@shipment-record/steps/components/summary/shipping-summary-step-origin/shipping-summary-step-origin.component';
import { ShippingSummaryStepDestinationsComponent } from '@shipment-record/steps/components/summary/shipping-summary-step-destinations/shipping-summary-step-destinations.component';
import { CartService } from '@shipment-record/services/cart.service';
import { distinctUntilChanged, filter, shareReplay, skip, Subject, Subscription, takeUntil } from 'rxjs';
import { CartOriginEntityResponse, CartPersonEntityResponse, CartState } from '@shipment-record/models/cart.model';
import { CartSessionStorageService } from '@shipment-record/services/cart-session-storage.service';
import { SessionStorageService } from '@shared/services/storage/session-storage.service';
import { PaymentMethodModalComponent } from '@shared/payment-method-modal/payment-method-modal.component';
import { RegistrationSuccessModalComponent } from '@shared/registration-success-modal/registration-success-modal.component';
import { PinModal } from '@shipment-record/steps/components/step3/shipment-record-pin-modal/pin-modal.component';
import {
    ShipmentRecordFinalStepsModalComponent
} from '@shipment-record/steps/components/step3/shipment-record-final-steps-modal/shipment-record-final-steps-modal.component';
import {
    ShipmentRecordDeclarationAffidavitModalComponent
} from '@shipment-record/steps/components/step3/shipment-record-declaration-affidavit-modal/shipment-record-declaration-affidavit-modal.component';


@Component({
    selector: 'app-shipping-summary',
    imports: [Divider, ShippingSummaryStepOriginComponent, ShippingSummaryStepDestinationsComponent, Button],
    templateUrl: './shipping-summary.component.html',
    standalone: true,
    styleUrl: './shipping-summary.component.scss',
    providers: [DialogService]
})
export class ShippingSummaryComponent implements OnInit, OnDestroy {
    origin: CartOriginEntityResponse | null = null;
    whoSend: CartPersonEntityResponse | null = null;
    isLoading = false;
    cartResponse!: any;
    private readonly cartService = inject(CartService);
    private readonly destroy$ = new Subject<void>();
    private readonly cartSessionService = inject(CartSessionStorageService);
    private readonly sessionStorageService = inject(SessionStorageService);
    private cartSubscription: Subscription | null = null;
    private readonly CART_DATA_KEY = 'cartData';
    dialog = inject(DialogService);
    ref: DynamicDialogRef | null = null;

    @Input() stepNumber!: number;

    ngOnInit(): void {
        this.suscribeToCart();
        this.getLatestCart();
    }

    suscribeToCart() {
        if (this.cartSubscription) {
            return;
        }

        this.cartSubscription = this.cartService.cartStore$
            .pipe(
                skip(1),
                filter((cart) => cart !== null), // Filtra valores vacíos
                distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
                shareReplay(1),
                takeUntil(this.destroy$)
            )
            .subscribe((cart: CartState) => {
                if (cart && !cart.reset) {
                    this.getLatestCart();
                }
            });
    }

    getCartByUuid(uuid: string) {
        this.cartService
            .getByUuid(uuid)
            .pipe(shareReplay(1), takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.cartResponse = response;
                    if (response.data?.person) {
                        this.whoSend = response.data.person;
                    }
                    if (response.data?.origin) {
                        this.origin = response.data.origin;
                    }

                    // this.sessionStorageService.set(this.CART_DATA_KEY, response.data);
                    this.cartSessionService.setItems(response.data?.items ?? []);

                    // this.cartService.setItems(response.data?.items ?? []);
                },
                error: (error) => {
                    console.error('Error fetching cart by UUID:', error);
                    if (error.status === 404) {
                        // Manejar el caso cuando el carrito no se encuentra
                        console.warn('Cart not found for UUID:', uuid);
                        this.sessionStorageService.remove(this.CART_DATA_KEY);
                        this.cartSessionService.clear();
                        this.cartService.setStepNumber(1);
                    }
                }
            });
    }

    getLatestCart() {
        const cartId = this.cartSessionService.getCartId();

        // Cargar el carrito una sola vez al inicio si existe
        if (cartId) {
            this.getCartByUuid(cartId);
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    openPinModal() {
        const cartData = this.cartResponse?.data ?? this.sessionStorageService.get(this.CART_DATA_KEY);
        const hasDeclaracionPreview = this.hasDeclaracionJurada(cartData);

        const cartUuid = this.cartSessionService.getCartId();
        this.ref = this.dialog.open(PinModal, {
            header: '',
            width: '627px',
            contentStyle: { padding: 0, maxHeight: '90vh', overflow: 'auto' },
            closable: false,
            styleClass: 'shipment-step-dialog',
            data: {
                hasDeclaracionPreview,
                cartUuid
            }
        });

        this.ref?.onClose.subscribe({
            next: (data) => {
                const pinValue = typeof data === 'string' ? data : data?.pin;

                if (!pinValue) {
                    return;
                }

                // Ítems del registro de envío (carrito cargado por getCartByUuid)
                const cartDataReal = this.cartResponse?.data ?? this.sessionStorageService.get(this.CART_DATA_KEY);
                const hasDeclaracion = this.hasDeclaracionJurada(cartDataReal);
                const shipmentsToDeclare = this.buildShipmentsToDeclare(cartDataReal);

                if (hasDeclaracion) {
                    this.openDeclaracionJuradaModal(shipmentsToDeclare);
                } else {
                    this.openPaymentMethodModal(2);
                }
            }
        });
    }

    // ===== Helpers internos (no cambian nombres existentes) =====

    private getCartTotalNumber(cartData: any): number {
        const total = cartData?.total ?? cartData?.summary?.total;
        if (total != null && typeof total === 'number') return total;
        const items = cartData?.items ?? [];
        return items.reduce((sum: number, it: any) => sum + (Number(it?.pricing?.amount ?? it?.amount ?? 0)), 0);
    }

    private hasDeclaracionJurada(cartData: any): boolean {
        return this.getCartTotalNumber(cartData) >= 500;
    }

    /** Valor declarado del ítem (API puede traer what_send.declared_value o declared_value en raíz). */
    private getItemDeclaredValue(item: any): number {
        return Number(item?.what_send?.declared_value ?? item?.declared_value ?? 0);
    }

    /** Nombre o referencia del ítem para la tabla (desde registro de envío). */
    private getItemContenido(item: any, idx: number): string {
        const name = item?.what_send?.article_name ?? item?.article_name;
        if (name) return name;
        const articleId = item?.what_send?.article_id ?? item?.article_id;
        if (articleId != null) return `Artículo ${articleId}`;
        return `Envío ${idx + 1}`;
    }

    /** Construye la lista de envíos a declarar (ítems con valor declarado >= 500). Solo se muestra el paso cuando el total del pago >= 500. */
    private buildShipmentsToDeclare(cartData: any): Array<{ item: number; contenido: string; valor: string }> {
        const items = cartData?.items ?? [];
        const filtered = items
            .map((x: any, idx: number) => {
                const declaredValue = this.getItemDeclaredValue(x);
                return {
                    item: idx + 1,
                    contenido: this.getItemContenido(x, idx),
                    valor: `S/${declaredValue.toFixed(2)}`
                };
            })
            .filter((x: any) => {
                const num = Number(String(x.valor).replace('S/', ''));
                return num >= 500;
            });

        return filtered;
    }

    openPaymentMethodModal(totalSteps: 2 | 3 = 3): void {
        const paymentAmount = this.getPaymentAmount();
        this.ref = this.dialog.open(PaymentMethodModalComponent, {
            header: '',
            width: '627px',
            contentStyle: { padding: 0, maxHeight: '90vh', overflow: 'auto' },
            closable: false,
            styleClass: 'shipment-step-dialog',
            data: {
                selectedPaymentMethod: 'niubiz',
                error: null,
                paymentAmount,
                totalSteps
            }
        });
    }

    private getPaymentAmount(): string {
        const cart = this.cartResponse?.data ?? this.sessionStorageService.get(this.CART_DATA_KEY);
        const total = this.getCartTotalNumber(cart);
        if (total > 0) return `S/${total.toFixed(2)}`;
        return 'S/0.00';
    }

    get totalPago(): string {
        return this.getPaymentAmount();
    }

    get cartData(): any {
        return this.cartResponse?.data ?? this.sessionStorageService.get(this.CART_DATA_KEY);
    }

    get tipoPago(): string {
        const data = this.cartData;
        return data?.payment_type ?? data?.summary?.payment_type ?? 'Pago en línea';
    }

    get cantidadEnvios(): number {
        const items = this.cartData?.items ?? [];
        return items.length;
    }

    get igvFormatted(): string {
        const data = this.cartData;
        const igv = data?.summary?.igv ?? data?.igv;
        if (igv != null && typeof igv === 'number') return `S/ ${igv.toFixed(2)}`;
        const total = this.getCartTotalNumber(data);
        if (total <= 0) return 'S/ 0.00';
        const igvCalculated = total * (0.18 / 1.18);
        return `S/ ${igvCalculated.toFixed(2)}`;
    }

    openDeclaracionJuradaModal(shipmentsToDeclare: Array<{ item: number; contenido: string; valor: string }>): void {
        this.ref = this.dialog.open(ShipmentRecordDeclarationAffidavitModalComponent, {
            header: '',
            width: '627px',
            contentStyle: { padding: 0, maxHeight: '90vh', overflow: 'auto' },
            closable: false,
            styleClass: 'shipment-step-dialog',
            data: {
                shipmentsToDeclare
            }
        });

        this.ref?.onClose.subscribe({
            next: (accepted) => {
                if (accepted) {
                    const paymentAmount = this.getPaymentAmount();
                    this.ref = this.dialog.open(PaymentMethodModalComponent, {
                        header: '',
                        width: '627px',
                        contentStyle: { padding: 0, maxHeight: '90vh', overflow: 'auto' },
                        closable: false,
                        styleClass: 'shipment-step-dialog',
                        data: {
                            selectedPaymentMethod: 'niubiz',
                            error: null,
                            paymentAmount,
                            totalSteps: 3
                        }
                    });
                }
            }
        });
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
                amountToPay: 'S/15.56' // opcional, muestra recordatorio si está presente
            }
        });
    }
}
