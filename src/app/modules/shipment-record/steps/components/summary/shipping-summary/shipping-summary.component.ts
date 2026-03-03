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
                console.log(cart);
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
                    console.log(response);
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

    // openPinModal() {
    //     this.ref = this.dialog.open(ShipmentRecordFinalStepsModalComponent, {
    //         header: '',
    //         width: '371px',
    //         contentStyle: { 'max-height': '500px', overflow: 'auto' },
    //         // baseZIndex: 10000,
    //         closable: true
    //     });
    //
    //     this.ref?.onClose.subscribe({
    //         next: (data) => {
    //             console.log('Modal closed with data:', data);
    //
    //             this.openPaymentMethodModal();
    //         }
    //     });
    // }

    openPinModal() {
        // Solo para dibujar el step-bar del PIN (2 o 3)
        const cartData = this.sessionStorageService.get(this.CART_DATA_KEY);
        const hasDeclaracionPreview = this.hasDeclaracionJurada(cartData);

        console.log('Abriendo PinModal con cartData:', cartData);


        const cartUuid = this.cartSessionService.getCartId();
        console.log('Cart UUID para PinModal:', cartUuid);
        this.ref = this.dialog.open(PinModal, {
            header: '',
            width: '371px',
            contentStyle: { 'max-height': '500px', overflow: 'auto' },
            closable: true,
            data: {
                // ✅ lo usará PinModal para pintar 2 o 3 segmentos
                hasDeclaracionPreview,
                cartUuid
            }
        });

        this.ref?.onClose.subscribe({
            next: (data) => {
                console.log('Modal closed with data:', data);

                // data puede ser string (pin) o { pin: string }
                const pinValue = typeof data === 'string' ? data : data?.pin;

                if (!pinValue) {
                    return;
                }

                // ✅ AQUÍ se hace la evaluación real (por ahora desde cartData).
                // Luego lo conectamos a endpoint: "obtener predios/envíos"
                const cartDataReal = this.sessionStorageService.get(this.CART_DATA_KEY);
                const hasDeclaracion = this.hasDeclaracionJurada(cartDataReal);
                const shipmentsToDeclare = this.buildShipmentsToDeclare(cartDataReal);

                if (hasDeclaracion) {
                    this.openDeclaracionJuradaModal(shipmentsToDeclare);
                } else {
                    this.openPaymentMethodModal();
                }
            }
        });
    }

    // ===== Helpers internos (no cambian nombres existentes) =====

    private hasDeclaracionJurada(cartData: any): boolean {
        const items = cartData?.items ?? [];
        return items.some((x: any) => Number(x?.declared_value ?? 0) >= 500);
    }

    private buildShipmentsToDeclare(cartData: any): Array<{ item: number; contenido: string; valor: string }> {
        const items = cartData?.items ?? [];
        const filtered = items
            .map((x: any, idx: number) => ({
                item: idx + 1,
                contenido: x?.article_id ? `Artículo ${x.article_id}` : `Envío ${idx + 1}`,
                valor: `S/${Number(x?.declared_value ?? 0).toFixed(2)}`
            }))
            .filter((x: any) => {
                const num = Number(String(x.valor).replace('S/', ''));
                return num >= 500;
            });

        return filtered;
    }

    // openPaymentMethodModal(): void {
    //     this.ref = this.dialog.open(PaymentMethodModalComponent, {
    //         width: '571px',
    //         contentStyle: { 'max-height': '600px', overflow: 'auto' },
    //         closable: true,
    //         data: {
    //             selectedPaymentMethod: 'niubiz',
    //             error: null
    //             //error: { reason: 'Fondos insuficientes', message: '...' }
    //         }
    //     });
    // }

    // ✅ MANTENGO EL MISMO MÉTODO openPaymentMethodModal()
    openPaymentMethodModal(): void {
        this.ref = this.dialog.open(PaymentMethodModalComponent, {
            width: '571px',
            contentStyle: { 'max-height': '600px', overflow: 'auto' },
            closable: true,
            data: {
                selectedPaymentMethod: 'niubiz',
                error: null,

                // ✅ NUEVO (opcional): para que Payment pinte header+steps como prototipo
                showFinalHeader: true,
                totalSteps: 2,
                currentStep: 2
            }
        });
    }

    // ✅ modal nuevo
    openDeclaracionJuradaModal(shipmentsToDeclare: Array<{ item: number; contenido: string; valor: string }>): void {
        this.ref = this.dialog.open(ShipmentRecordDeclarationAffidavitModalComponent, {
            header: '',
            width: '571px',
            contentStyle: { 'max-height': '600px', overflow: 'auto' },
            closable: true,
            data: {
                shipmentsToDeclare
            }
        });

        this.ref?.onClose.subscribe({
            next: (accepted) => {
                if (accepted) {
                    // Si aceptó DJ, paso a Pago (3 pasos, paso 3)
                    this.ref = this.dialog.open(PaymentMethodModalComponent, {
                        width: '571px',
                        contentStyle: { 'max-height': '600px', overflow: 'auto' },
                        closable: true,
                        data: {
                            selectedPaymentMethod: 'niubiz',
                            error: null,
                            showFinalHeader: true,
                            totalSteps: 3,
                            currentStep: 3
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
