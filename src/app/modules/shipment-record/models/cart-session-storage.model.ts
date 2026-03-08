import { CartEntityDataResponse, CartItemDraft, CartPricingEntityResponse, OriginPayload, PersonPayload } from '@shipment-record/models/cart.model';
import { CartItemEntityResponse } from '@shipment-record/models/cart-item.model';

export interface CartSessionStorageHeader {
    person: PersonPayload | null;
    origin: OriginPayload | null;
    whoPay?: string | null;
    whoPayDetail?: any | null;
}

export interface CartSessionStorage {
    header: CartSessionStorageHeader;
    items: CartItemEntityResponse[];
    pricing?: CartPricingEntityResponse;
    currentStep?: number;
    cardId?: string;
}
