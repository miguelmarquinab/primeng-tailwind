import { CartPricingEntityResponse, OriginPayload, PersonPayload } from '@shipment-record/models/cart.model';
import { CartItemEntityResponse } from '@shipment-record/models/cart-item.model';
import { HeadquartersEntityResponse } from '@shipment-record/models/headquarters.model';

export interface CartSessionStorageHeader {
    person: PersonPayload | null;
    origin: OriginPayload | null;
    whoPay?: string | null;
    whoPayDetail?: HeadquartersEntityResponse | null;
    currentItemUuid?: string | null;
    addingNewItemFromStep3?: boolean;
}

export interface CartSessionStorage {
    header: CartSessionStorageHeader;
    items: CartItemEntityResponse[];
    pricing?: CartPricingEntityResponse;
    appliedCouponCode?: string | null;
    currentStep?: number;
    cardId?: string;
}
