import { DecimalPipe } from '@angular/common';
import { Component, Input, output } from '@angular/core';
import { CartItemDeleteButtonComponent } from '@shipment-record/steps/components/summary/shipping-summary-buttons/delete/cart-item-delete-button.component';
import { CartItemEntityResponse } from '@shipment-record/models/cart-item.model';
import { DELIVERY_TYPE } from '@shipment-record/contansts/shipment-record-step.constant';
import {
    CartItemCloneButtonComponent
} from '@shipment-record/steps/components/summary/shipping-summary-buttons/cart-item-clone-button/cart-item-clone-button.component';

@Component({
    selector: 'app-shipment-card',
    imports: [DecimalPipe, CartItemDeleteButtonComponent, CartItemCloneButtonComponent],
    templateUrl: './shipment-card.component.html'
})
export class ShipmentCardComponent {
    @Input() cartUuid!: string;
    @Input() cartItemUuid!: string;
    @Input() cartItem!: CartItemEntityResponse;
    @Input() index!: number;

    shipmentChanged = output<boolean>();
    protected readonly DELIVERY_TYPE = DELIVERY_TYPE;

    deleteItem(event: any) {
        console.log('deleteItem', event);
        this.shipmentChanged.emit(true);
    }
}
