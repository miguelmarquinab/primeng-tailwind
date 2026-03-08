import { CartPricingEntityResponse, OriginPayload, PersonPayload } from '@shipment-record/models/cart.model';
import { CartItemEntityResponse } from '@shipment-record/models/cart-item.model';

export interface WhoPayDetail {
    ubigeo_code?: string;
}

export interface CartSessionStorageHeader {
    person: PersonPayload | null;
    origin: OriginPayload | null;
    whoPay?: string | null;
    whoPayDetail?: WhoPayDetail | null;
}

export interface CartSessionStorage {
    header: CartSessionStorageHeader;
    items: CartItemEntityResponse[];
    pricing?: CartPricingEntityResponse;
    appliedCouponCode?: string | null;
    currentStep?: number;
    cardId?: string;
}
