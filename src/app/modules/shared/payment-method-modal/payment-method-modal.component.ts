import { Component, computed, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Button } from 'primeng/button';
import { ToggleSwitch } from 'primeng/toggleswitch';

import { BreakpointService } from '@shared/services/breakpoint/breakpoint.service';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';

type PaymentMethod = 'niubiz' | 'pagoefectivo';

export interface PaymentMethodError {
    reason: string;
    message: string;
}

export interface PaymentMethodModalData {
    selectedPaymentMethod?: PaymentMethod;
    paymentAmount?: string;
    error?: PaymentMethodError | null;
    totalSteps?: 2 | 3;
}

@Component({
    selector: 'app-payment-method-shipment-record-pin-modal',
    imports: [Button, ToggleSwitch, FormsModule, NgClass],
    templateUrl: './payment-method-modal.component.html',
    styleUrl: './payment-method-modal.component.scss',
    standalone: true
})
export class PaymentMethodModalComponent implements OnInit {
    private readonly dynamicDialogRef = inject(DynamicDialogRef, { optional: true });
    private readonly dynamicDialogConfig = inject(DynamicDialogConfig, { optional: true });
    private readonly breakpointService = inject(BreakpointService);
    private readonly router = inject(Router);

    @Input() selectedPaymentMethod: PaymentMethod = 'niubiz';
    @Input() paymentAmount = 'S/78.33';
    @Input() error: PaymentMethodError | null = null;

    @Input() embedded = false;

    @Input() totalSteps: 2 | 3 = 3;

    @Output() paymentConfirmed = new EventEmitter<{ paymentMethod: PaymentMethod; termsAccepted: boolean }>();

    @Output() goToFinishRequested = new EventEmitter<void>();

    termsAccepted = false;
    isMobile = computed(() => this.breakpointService.isMobile());

    ngOnInit(): void {
        const data = this.dynamicDialogConfig?.data as PaymentMethodModalData | undefined;
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
            if (data.totalSteps === 2 || data.totalSteps === 3) {
                this.totalSteps = data.totalSteps;
            }
        }
    }

    selectPaymentMethod(method: PaymentMethod): void {
        this.selectedPaymentMethod = method;
    }

    onPay(): void {
        if (!this.termsAccepted || this.error) return;
        if (this.embedded) {
            this.paymentConfirmed.emit({
                paymentMethod: this.selectedPaymentMethod,
                termsAccepted: this.termsAccepted
            });
        } else {
            this.dynamicDialogRef?.close({
                paymentMethod: this.selectedPaymentMethod,
                termsAccepted: this.termsAccepted
            });
        }
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
        } else {
            this.dynamicDialogRef?.close();
            this.router.navigate(['/shipment-record/finish']);
        }
    }
}
