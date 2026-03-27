import { Component, inject, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ShipmentCardComponent } from '@shipment-record/steps/components/step3/shipment-list/shipment-card.component';
import { CartService } from '@shipment-record/services/cart.service';
import { CartSessionStorageService } from '@shipment-record/services/cart-session-storage.service';
import { CartSessionStorage } from '@shipment-record/models/cart-session-storage.model';

@Component({
    selector: 'app-shipment-record-step3',
    imports: [Button, ShipmentCardComponent],
    templateUrl: './shipment-record-step3.component.html',
    styleUrl: './shipment-record-step3.component.scss',
    providers: [DialogService]
})
export class ShipmentRecordStep3Component implements OnInit {
    dialog = inject(DialogService);

    private readonly cartService = inject(CartService);
    private readonly cartSessionService = inject(CartSessionStorageService);
    cartData!: CartSessionStorage;

    ref: DynamicDialogRef | null = null;

    ngOnInit() {
        // setTimeout(() => {
        this.cartData = this.cartSessionService.getCartData();
        // }, 1000);
    }

    loadCartData(): void {
        this.cartData = this.cartSessionService.getCartData();
    }

    refreshItems(event: any): void {
        console.log('refreshItems called', event);
        const cartUuid = this.cartSessionService.getCartId() ?? '';
        this.cartService.getByUuid(cartUuid).subscribe({
            next: (response) => {
                this.cartSessionService.setItems(response.data?.items ?? []);
                this.cartData = this.cartSessionService.getCartData();
                this.loadCartData();
                this.cartService.updateCart();
            }
        });
    }

    // ✅ nuevo
    editShipment(itemUuid: string): void {
        console.log('Editar envío:', itemUuid);
        this.cartSessionService.setCurrentItemUuid(itemUuid);
        this.cartService.setStepNumber(2);
    }

    openModal() {
        this.cartSessionService.setCurrentItemUuid('');
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
