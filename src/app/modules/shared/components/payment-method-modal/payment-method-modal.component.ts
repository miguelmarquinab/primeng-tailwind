import { Component, computed, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Button } from 'primeng/button';
import { ToggleSwitch } from 'primeng/toggleswitch';

import { BreakpointService } from '@shared/services/breakpoint/breakpoint.service';
import { RouterLink } from '@angular/router';

type PaymentMethod = 'niubiz' | 'pagoefectivo';

export interface PaymentMethodError {
    reason: string;
    message: string;
}

export interface PaymentMethodModalData {
    selectedPaymentMethod?: PaymentMethod;
    paymentAmount?: string;
    error?: PaymentMethodError | null;
}

@Component({
    selector: 'app-payment-method-modal',
    imports: [Button, ToggleSwitch, FormsModule, RouterLink],
    templateUrl: './payment-method-modal.component.html',
    styleUrl: './payment-method-modal.component.scss',
    standalone: true
})
export class PaymentMethodModalComponent implements OnInit {
    private readonly dynamicDialogRef = inject(DynamicDialogRef);
    private readonly dynamicDialogConfig = inject(DynamicDialogConfig);
    private readonly breakpointService = inject(BreakpointService);

    @Input() selectedPaymentMethod: PaymentMethod = 'niubiz';
    @Input() paymentAmount = 'S/78.33';
    @Input() error: PaymentMethodError | null = null;

    termsAccepted = false;
    isMobile = computed(() => this.breakpointService.isMobile());

    ngOnInit(): void {
        const data = this.dynamicDialogConfig.data as PaymentMethodModalData | undefined;
        if (data) {
            if (data.selectedPaymentMethod) {
                this.selectedPaymentMethod = data.selectedPaymentMethod;
            }
            if (data.paymentAmount) {
                this.paymentAmount = data.paymentAmount;
            }
            if (data.error !== undefined) {
                this.error = data.error;
            }
        }
    }

    selectPaymentMethod(method: PaymentMethod): void {
        this.selectedPaymentMethod = method;
    }

    onPay(): void {
        if (this.termsAccepted && !this.error) {
            this.dynamicDialogRef.close({
                paymentMethod: this.selectedPaymentMethod,
                termsAccepted: this.termsAccepted
            });
        }
    }

    onRetry(): void {
        this.error = null;
    }

    close(): void {
        this.dynamicDialogRef.close();
    }
}
