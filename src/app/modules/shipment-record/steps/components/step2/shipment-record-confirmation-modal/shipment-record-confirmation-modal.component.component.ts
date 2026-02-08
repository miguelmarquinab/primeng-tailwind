import { Component, inject } from "@angular/core";

import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Button } from 'primeng/button';

@Component({
    selector: 'app-shipment-record-confirmation-modal',
    templateUrl: './shipment-record-confirmation-modal.component.html',
    standalone: true,
    imports: [
        Button,
    ],
    styleUrl: './shipment-record-confirmation-modal.component.scss'
})
export class ShipmentRecordConfirmationModalComponent {
    private readonly dynamicDialogRef = inject(DynamicDialogRef);

    onConfirm() {}

    onCancel() {
      this.dynamicDialogRef?.close(null);
    }
}