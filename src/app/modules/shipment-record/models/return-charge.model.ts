import { DELIVERY_TYPE } from '@shipment-record/contansts/shipment-record-step.constant';
import { CartItemDestinationFormState, CartItemReturnChargePayload } from '@shipment-record/models/cart-item.model';

export type ReturnChargeMode = 'home' | 'store';

export interface ReturnChargeDetail {
    // folio?: number;
    delivery_type: DELIVERY_TYPE;
    // address?: DestinationAddressFormState;
    // store?: DestinationStoreFormState;
    destination?: CartItemDestinationFormState;
}

export interface ReturnChargePayload {
    return_charge: boolean;
    return_charge_detail?: CartItemReturnChargePayload;
}
