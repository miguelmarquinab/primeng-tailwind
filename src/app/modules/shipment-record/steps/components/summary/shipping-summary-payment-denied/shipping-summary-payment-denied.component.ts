import { Component, computed, inject } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BreakpointService } from '@shared/services/breakpoint/breakpoint.service';
import { Button } from 'primeng/button';
import { CartEntityDataResponse } from '@shipment-record/models/cart.model';

@Component({
    selector: 'app-shipping-summary-payment-denied',
    imports: [Button],
    templateUrl: './shipping-summary-payment-denied.component.html',
    styleUrl: './shipping-summary-payment-denied.component.scss'
})
export class ShippingSummaryPaymentDeniedComponent {
    private readonly dynamicDialogRef = inject(DynamicDialogRef);
    private readonly dynamicDialogConfig = inject(DynamicDialogConfig);
    private readonly breakpointService = inject(BreakpointService);

    isMobile = computed(() => this.breakpointService.isMobile());

    cart!: CartEntityDataResponse | undefined;

    ngOnInit(): void {
        this.cart = this.dynamicDialogConfig.data.cart;
    }

    retry(): void {
        this.dynamicDialogRef.close({
            action: 'retry'
        });
    }
}
