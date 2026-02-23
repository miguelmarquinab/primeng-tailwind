import { CartItemDraft, OriginPayload, PersonPayload } from '@shipment-record/models/cart.model';

export interface CartSessionStorageHeader {
    person: PersonPayload | null;
    origin: OriginPayload | null;
    whoPay?: string | null;
    whoPayDetail?: any | null;
}

export interface CartSessionStorage {
    header: CartSessionStorageHeader;
    items: CartItemDraft[];
    currentStep?: number;
    cardId?: string;
}
