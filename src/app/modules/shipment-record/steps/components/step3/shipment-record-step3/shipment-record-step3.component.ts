import { Component, inject } from '@angular/core';
import { Button } from 'primeng/button';

import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MarkupModal } from '@shared/components/modal/markup-modal';
import { ShipmentSummaryItemComponent } from './components/shipment-summary-item/shipment-summary-item.component';

@Component({
    selector: 'app-shipment-record-step3',
    imports: [Button, ShipmentSummaryItemComponent],
    templateUrl: './shipment-record-step3.component.html',
    styleUrl: './shipment-record-step3.component.scss',
    providers: [DialogService]
})
export class ShipmentRecordStep3Component {
    dialog = inject(DialogService);

    shipments = [
        {
            id: 1,
            city: 'Chiclayo',
            customer: 'Angel Esquen',
            description: 'Ropa y accesorios',
            address: 'Av. Comandante Espinar',
            total: 17.5
        },
        {
            id: 2,
            city: 'Chiclayo',
            customer: 'Angel Esquen',
            description: 'Ropa y accesorios',
            address: 'Av. Comandante Espinar',
            total: 17.5
        },
        {
            id: 3,
            city: 'Chiclayo',
            customer: 'Angel Esquen',
            description: 'Ropa y accesorios',
            address: 'Av. Comandante Espinar',
            total: 17.5
        },
        {
            id: 4,
            city: 'Chiclayo',
            customer: 'Angel Esquen',
            description: 'Ropa y accesorios',
            address: 'Av. Comandante Espinar',
            total: 17.5
        },
        {
            id: 5,
            city: 'Chiclayo',
            customer: 'Angel Esquen',
            description: 'Ropa y accesorios',
            address: 'Av. Comandante Espinar',
            total: 17.5
        },
        {
            id: 6,
            city: 'Chiclayo',
            customer: 'Angel Esquen',
            description: 'Ropa y accesorios',
            address: 'Av. Comandante Espinar',
            total: 17.5
        },
        {
            id: 7,
            city: 'Chiclayo',
            customer: 'Angel Esquen',
            description: 'Ropa y accesorios',
            address: 'Av. Comandante Espinar',
            total: 17.5
        },
        {
            id: 8,
            city: 'Chiclayo',
            customer: 'Angel Esquen',
            description: 'Ropa y accesorios',
            address: 'Av. Comandante Espinar',
            total: 17.5
        }
    ];

    ref: DynamicDialogRef | null = null;
    openModal() {
        this.ref = this.dialog.open(MarkupModal, {
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
