import { Component, inject } from '@angular/core';
import { Button } from 'primeng/button';
import { NgTemplateOutlet } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MarkupModal } from '@shared/components/modal/markup-modal';

@Component({
    selector: 'app-shipment-record-step3',
    imports: [Button, NgTemplateOutlet],
    templateUrl: './shipment-record-step3.component.html',
    styleUrl: './shipment-record-step3.component.scss',
    providers: [DialogService]
})
export class ShipmentRecordStep3Component {
    dialog = inject(DialogService);

    ref: DynamicDialogRef | null = null;
    openModal() {
        this.ref = this.dialog.open(MarkupModal, {
            header: 'Markup Modal',
            width: '371px',
            contentStyle: { 'max-height': '500px', overflow: 'auto' },
            // baseZIndex: 10000,
            closable: true
        });

        this.ref?.onClose.subscribe({
            next: (data) => {
                console.log('Modal closed with data:', data);
            }
        });
    }
}
