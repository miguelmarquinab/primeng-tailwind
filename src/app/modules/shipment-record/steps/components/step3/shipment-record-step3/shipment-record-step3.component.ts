import { Component, inject, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ShipmentListComponent } from '@shipment-record/steps/components/step3/shipment-list/shipment-list.component';
import { CartService } from '@shipment-record/services/cart.service';
import { CartSessionStorageService } from '@shipment-record/services/cart-session-storage.service';
import { CartSessionStorage } from '@shipment-record/models/cart-session-storage.model';

@Component({
    selector: 'app-shipment-record-step3',
    imports: [Button, ShipmentListComponent],
    templateUrl: './shipment-record-step3.component.html',
    styleUrl: './shipment-record-step3.component.scss',
    providers: [DialogService]
})
export class ShipmentRecordStep3Component implements OnInit {
    dialog = inject(DialogService);

    private readonly cartService = inject(CartService);
    private readonly cartSessionService = inject(CartSessionStorageService);
    cartData!: CartSessionStorage;
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
    ngOnInit() {
        setTimeout(() => {
            this.cartData = this.cartSessionService.getCartData();
        }, 1000);
    }
    openModal() {
        this.cartService.setStepNumber(2);

        // this.ref = this.dialog.open(MarkupModal, {
        //     header: '',
        //     width: '371px',
        //     contentStyle: { 'max-height': '500px', overflow: 'auto' },
        //     // baseZIndex: 10000,
        //     closable: true
        // });
        //
        // this.ref?.onClose.subscribe({
        //     next: (data) => {
        //         console.log('Modal closed with data:', data);
        //     }
        // });
    }
}
