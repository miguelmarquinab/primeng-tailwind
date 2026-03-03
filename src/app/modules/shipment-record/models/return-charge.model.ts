import { DestinationAddressFormState, DestinationStoreFormState } from '@shipment-record/models/destination-form.model';
import { DELIVERY_TYPE } from '@shipment-record/contansts/shipment-record-step.constant';
import { CartItemReturnChargePayload } from '@shipment-record/models/cart-item.model';

export type ReturnChargeMode = 'home' | 'store';

export interface ReturnChargeDetail {
    folios: number;
    delivery_type: DELIVERY_TYPE;
    address?: DestinationAddressFormState;
    store?: DestinationStoreFormState;
}

export interface ReturnChargePayload {
    return_charge: boolean;
    return_charge_detail?: CartItemReturnChargePayload;
}
