import { CartItemDraft, OriginPayload, PersonPayload } from '@shipment-record/models/cart.model';

export interface CartSessionStorageHeader {
    person: PersonPayload | null;
    origin: OriginPayload | null;
}

export interface CartSessionStorage {
    header: CartSessionStorageHeader;
    items: CartItemDraft[];
    currentStep?: number;
    cardId?: string;
}
