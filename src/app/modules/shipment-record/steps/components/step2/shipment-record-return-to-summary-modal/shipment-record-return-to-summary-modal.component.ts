import { Component, inject } from '@angular/core';
import { Button } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

export type ReturnToSummaryModalCloseValue = 'discard' | undefined;

@Component({
    selector: 'app-shipment-record-return-to-summary-modal',
    standalone: true,
    imports: [Button],
    templateUrl: './shipment-record-return-to-summary-modal.component.html',
    styleUrl: './shipment-record-return-to-summary-modal.component.scss'
})
export class ShipmentRecordReturnToSummaryModalComponent {
    private readonly dynamicDialogRef = inject(DynamicDialogRef);

    continueEditing(): void {
        this.dynamicDialogRef.close(undefined);
    }

    discardAndReturn(): void {
        this.dynamicDialogRef.close('discard');
    }
}
