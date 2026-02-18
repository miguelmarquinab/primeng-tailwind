import { Component, computed, inject, Input, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Button } from 'primeng/button';
import { BreakpointService } from '@shared/services/breakpoint/breakpoint.service';

export interface RegistrationData {
    registrationNumber: string;
    dateTime: string;
    transaction?: string;
    card?: string;
    amountPaid?: string;
    amountToPay?: string;
}

@Component({
    selector: 'app-registration-success-shipment-record-pin-modal',
    imports: [Button],
    templateUrl: './registration-success-modal.component.html',
    styleUrl: './registration-success-modal.component.scss',
    standalone: true
})
export class RegistrationSuccessModalComponent implements OnInit {
    private readonly dynamicDialogRef = inject(DynamicDialogRef);
    private readonly dynamicDialogConfig = inject(DynamicDialogConfig);
    private readonly breakpointService = inject(BreakpointService);

    @Input() registrationData!: RegistrationData;

    isMobile = computed(() => this.breakpointService.isMobile());

    ngOnInit(): void {
        const data = this.dynamicDialogConfig.data as RegistrationData | undefined;
        if (data) {
            this.registrationData = data;
        }
    }

    onViewStores(): void {
        this.dynamicDialogRef.close({ action: 'viewStores' });
    }

    onRegisterNewShipment(): void {
        this.dynamicDialogRef.close({ action: 'registerNewShipment' });
    }

    onDownloadLabel(): void {
        this.dynamicDialogRef.close({ action: 'downloadLabel' });
    }

    close(): void {
        this.dynamicDialogRef.close();
    }
}

