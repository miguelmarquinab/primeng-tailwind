import { NgClass } from '@angular/common';
import { Component, computed, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Button } from 'primeng/button';
import { ToggleSwitch } from 'primeng/toggleswitch';

import { environment } from '@env/environment';
import { BreakpointService } from '@shared/services/breakpoint/breakpoint.service';
import { CartSessionStorageService } from '@shipment-record/services/cart-session-storage.service';
import { CartService } from '@shipment-record/services/cart.service';
import { CartNiubizSessionEntityResponse } from '@shipment-record/models/cart.model';

type PaymentMethod = 'niubiz' | 'pagoefectivo';

export interface PaymentMethodError {
    reason: string;
    message: string;
}

export interface PaymentMethodModalData {
    selectedPaymentMethod?: PaymentMethod;
    paymentAmount?: number;
    error?: PaymentMethodError | null;
    totalSteps?: 2 | 3;
}

@Component({
    selector: 'app-payment-method-shipment-record-pin-modal',
    standalone: true,
    imports: [Button, ToggleSwitch, FormsModule, NgClass],
    templateUrl: './payment-method-modal.component.html',
    styleUrl: './payment-method-modal.component.scss'
})
export class PaymentMethodModalComponent implements OnInit {
    private readonly dynamicDialogRef = inject(DynamicDialogRef, { optional: true });
    private readonly dynamicDialogConfig = inject(DynamicDialogConfig, { optional: true });
    private readonly breakpointService = inject(BreakpointService);
    private readonly cartSessionService = inject(CartSessionStorageService);
    private readonly cartService = inject(CartService);
    private readonly router = inject(Router);

    @Input() selectedPaymentMethod: PaymentMethod = 'niubiz';
    @Input() paymentAmount = 0;
    @Input() error: PaymentMethodError | null = null;
    @Input() embedded = false;
    @Input() totalSteps: 2 | 3 = 3;

    @Output() paymentConfirmed = new EventEmitter<{ paymentMethod: PaymentMethod; termsAccepted: boolean }>();
    @Output() goToFinishRequested = new EventEmitter<void>();

    termsAccepted = false;
    isMobile = computed(() => this.breakpointService.isMobile());

    cartData = this.cartSessionService.getCartData();
    cartNiubizSession?: CartNiubizSessionEntityResponse;

    ngOnInit(): void {
        this.loadInputData();
        this.resolvePaymentAmount();
    }

    private loadInputData(): void {
        const data = this.dynamicDialogConfig?.data as PaymentMethodModalData | undefined;

        if (!data) {
            return;
        }

        if (data.selectedPaymentMethod) {
            this.selectedPaymentMethod = data.selectedPaymentMethod;
        }

        if (typeof data.paymentAmount === 'number') {
            this.paymentAmount = data.paymentAmount;
        }

        if (data.error !== undefined) {
            this.error = data.error;
        }

        if (data.totalSteps === 2 || data.totalSteps === 3) {
            this.totalSteps = data.totalSteps;
        }
    }

    private resolvePaymentAmount(): void {
        if (!this.paymentAmount || this.paymentAmount <= 0) {
            this.paymentAmount = this.cartData?.pricing?.total ?? 0;
        }
    }

    selectPaymentMethod(method: PaymentMethod): void {
        this.selectedPaymentMethod = method;
    }

    /**
     * Método principal unificado.
     * Si en tu HTML actual llamas a (click)="onPay()", no tendrás que cambiar nada.
     */
    onPay(): void {
        if (!this.canContinuePayment()) {
            return;
        }

        if (this.embedded) {
            this.paymentConfirmed.emit({
                paymentMethod: this.selectedPaymentMethod,
                termsAccepted: this.termsAccepted
            });
            return;
        }

        this.executePaymentFlow();
    }

    /**
     * Alias por compatibilidad si el template viejo usa pay()
     */
    pay(): void {
        this.onPay();
    }

    private canContinuePayment(): boolean {
        return this.termsAccepted && !this.error;
    }

    private executePaymentFlow(): void {
        switch (this.selectedPaymentMethod) {
            case 'niubiz':
                this.addNiubizScript();
                this.createNiubizSession();
                break;

            case 'pagoefectivo':
                this.createPESession();
                break;
        }
    }

    private addNiubizScript(): void {
        const scriptId = 'niubiz-checkout-script';

        if (document.getElementById(scriptId)) {
            return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = environment.paymentGateway.niubiz.assets.scriptCheckout;
        script.async = true;
        document.body.appendChild(script);
    }

    private createNiubizSession(): void {
        const sessionUuid = this.cartSessionService.getCartId();

        if (!sessionUuid) {
            this.error = {
                reason: 'session_not_found',
                message: 'No se encontró la sesión del carrito para iniciar el pago con Niubiz.'
            };
            return;
        }

        this.cartService.createPaymentNiubizSession(sessionUuid).subscribe({
            next: (response) => {
                this.cartNiubizSession = response;
                this.openNiubizModal();
            },
            error: () => {
                this.error = {
                    reason: 'niubiz_session_error',
                    message: 'No se pudo crear la sesión de pago con Niubiz.'
                };
            }
        });
    }

    private createPESession(): void {
        const sessionUuid = this.cartSessionService.getCartId();

        if (!sessionUuid) {
            this.error = {
                reason: 'session_not_found',
                message: 'No se encontró la sesión del carrito para iniciar el pago con PagoEfectivo.'
            };
            return;
        }

        this.cartService.createPESession(sessionUuid).subscribe({
            next: () => {
                this.goToFinish();
            },
            error: () => {
                this.error = {
                    reason: 'pagoefectivo_session_error',
                    message: 'No se pudo crear la sesión de pago con PagoEfectivo.'
                };
            }
        });
    }

    private openNiubizModal(): void {
        const sessionUuid = this.cartSessionService.getCartId();

        if (!sessionUuid || !this.cartNiubizSession) {
            this.error = {
                reason: 'niubiz_data_incomplete',
                message: 'No se pudo abrir el formulario de Niubiz por falta de datos.'
            };
            return;
        }

        const visanetCheckout = (window as any).VisanetCheckout;

        if (typeof visanetCheckout === 'undefined') {
            setTimeout(() => this.openNiubizModal(), 500);
            return;
        }

        const apiUrl = environment.shippingRecords.api;
        const callback = environment.paymentGateway.callback;
        const callbackError = environment.paymentGateway.callbackError;

        visanetCheckout.configure({
            sessiontoken: this.cartNiubizSession.session_key,
            channel: 'web',
            merchantid: this.cartNiubizSession.merchant_id,
            purchasenumber: this.cartNiubizSession.nroPedidoPreventa,
            amount: this.paymentAmount,
            expirationminutes: '20',
            timeouturl: 'about:blank',
            merchantlogo: environment.paymentGateway.assets.olvaLogo,
            formbuttoncolor: '#fac459',
            action: `${apiUrl}/v1/cart/${sessionUuid}/payment/niubiz/transaccion?callbackUrl=${btoa(callback)}&callbackUrlError=${btoa(callbackError)}`,
            complete: (params: any) => this.procesar(params)
        });

        visanetCheckout.open();
    }

    procesar(params: any): void {
        console.log('Respuesta Niubiz:', params);
    }

    onRetry(): void {
        this.error = null;
    }

    close(): void {
        this.dynamicDialogRef?.close();
    }

    goToFinish(): void {
        if (this.embedded) {
            this.goToFinishRequested.emit();
            return;
        }

        this.dynamicDialogRef?.close();
        this.router.navigate(['/shipment-record/finish']);
    }
}
