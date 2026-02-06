import { DestinationAddressFormState, DestinationStoreFormState } from '@shipment-record/models/destination-form.model';

export type ReturnChargeMode = 'home' | 'store';

export interface ReturnChargeDetail {
    folios: number;
    destinationType: ReturnChargeMode;
    address?: DestinationAddressFormState;
    store?: DestinationStoreFormState;
}

export interface ReturnChargePayload {
    return_charge: boolean;
    return_charge_detail?: ReturnChargeDetail;
}
