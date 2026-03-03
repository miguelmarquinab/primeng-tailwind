import { CartEntityDataResponse, CartItemDraft, OriginPayload, PersonPayload } from '@shipment-record/models/cart.model';
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
    currentStep?: number;
    cardId?: string;
}
