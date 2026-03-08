import { inject, Injectable } from '@angular/core';
import { SessionStorageService } from '@shared/services/storage/session-storage.service';
import { CartSessionStorage, WhoPayDetail } from '@shipment-record/models/cart-session-storage.model';
import {
    CartItemAddressPayload,
    CartItemDestinationPayload,
    CartItemDraft,
    CartItemPayload,
    CartItemPersonPayload,
    CartItemReturnChargeDetailPayload,
    CartPayload,
    CartPricingEntityResponse,
    OriginPayload,
    PersonPayload,
    ShipmentType
} from '@shipment-record/models/cart.model';
import { DestinationAddressFormState, DestinationStoreFormState } from '@shipment-record/models/destination-form.model';
import { ReturnChargeDetail, ReturnChargePayload } from '@shipment-record/models/return-charge.model';
import { DELIVERY_TYPE } from '@shipment-record/contansts/shipment-record-step.constant';
import { CartItemEntityResponse } from '@shipment-record/models/cart-item.model';

@Injectable({
    providedIn: 'root'
})
export class CartSessionStorageService {
    sessionStorage = inject(SessionStorageService);
    private readonly CART_KEY = 'cart';

    setCurrentStep(currentStep: number) {
        const cartData = this.getCartData();
        cartData.currentStep = currentStep;
        this.setCartData(cartData);
    }

    setCardId(id: string) {
        const cartData = this.getCartData();
        cartData.cardId = id;
        this.setCartData(cartData);
    }

    setHeaderWhoSender(header: PersonPayload) {
        const cartData = this.getCartData();
        cartData.header.person = header;
        this.setCartData(cartData);
    }

    setHeaderOrigin(header: OriginPayload) {
        const cartData = this.getCartData();
        cartData.header.origin = header;
        this.setCartData(cartData);
    }

    setWhoPay(whoPay: string, detail: WhoPayDetail | null) {
        const cartData = this.getCartData();
        cartData.header.whoPay = whoPay;
        cartData.header.whoPayDetail = detail;
        this.setCartData(cartData);
    }

    getWhoPay() {
        const cartData = this.getCartData();

        return {
            whoPay: cartData.header.whoPay,
            whoPayDetail: cartData.header.whoPayDetail
        };
    }

    setCartData(data: CartSessionStorage) {
        this.sessionStorage.set(this.CART_KEY, data);
    }

    getCartData(): CartSessionStorage {
        let cartData = this.sessionStorage.get(this.CART_KEY) as CartSessionStorage | null;
        // console.log(cartData);
        if (!cartData) {
            this.init();
            cartData = this.sessionStorage.get(this.CART_KEY) as CartSessionStorage | null;
        }
        return (
            cartData ?? {
                header: {
                    person: null,
                    origin: null
                },
                items: []
            }
        );
    }

    init() {
        this.sessionStorage.set(this.CART_KEY, {
            header: {
                person: null,
                origin: null
            },
            items: []
        });
    }
    getCurrentStep() {
        return this.getCartData()?.currentStep ?? 1;
    }
    getCartId() {
        return this.getCartData().cardId;
    }

    // setItemReturnCharge(itemIndex: number, payload: ReturnChargePayload) {
    //     this.updateItem(itemIndex, payload);
    // }

    // setItemPerson(itemIndex: number, payload: PersonPayload) {
    //     this.updateItem(itemIndex, {
    //         person: payload
    //     });
    // }
    //
    // setItemDestination(itemIndex: number, payload: CartItemDestinationPayload) {
    //     this.updateItem(itemIndex, {
    //         destination: payload
    //     });
    // }

    // setItemWhatSend(itemIndex: number, payload: CartItemWhatSendPayload) {
    //     this.updateItem(itemIndex, payload);
    // }

    // clearItemReturnCharge(itemIndex: number) {
    //     const cartData = this.getCartData();
    //     if (!cartData.items.length) {
    //         return;
    //     }
    //     cartData.items = this.ensureItems(cartData.items);
    //     cartData.items[itemIndex] = {
    //         ...(cartData.items[itemIndex] ?? {}),
    //         return_charge: false
    //     };
    //     delete cartData.items[itemIndex].return_charge_detail;
    //     this.setCartData(cartData);
    // }

    buildCartPayload(): CartPayload {
        const cartData = this.getCartData();
        return {
            person: cartData.header.person ?? undefined,
            origin: cartData.header.origin ?? undefined,
            items: [], //this.buildItemsPayload(cartData.items),
            // @TODO Remove after check
            pricing: {
                service_id: 1,
                exclusive_rate: 0
            }
        };
    }

    setItems(cartItems: CartItemEntityResponse[] = []) {
        const cartData = this.getCartData();
        cartData.items = cartItems;
        this.setCartData(cartData);
    }

    setPricing(pricing: CartPricingEntityResponse) {
        const cartData = this.getCartData();
        cartData.pricing = pricing;
        this.setCartData(cartData);
    }

    setAppliedCouponCode(code: string | null): void {
        const cartData = this.getCartData();
        cartData.appliedCouponCode = code ?? null;
        this.setCartData(cartData);
    }

    getAppliedCouponCode(): string | null {
        return this.getCartData()?.appliedCouponCode ?? null;
    }

    private ensureItems(items: CartItemDraft[] | null | undefined): CartItemDraft[] {
        if (!items) {
            return [];
        }
        return items;
    }

    // private updateItem(itemIndex: number, patch: Partial<CartItemDraft>) {
    //     const cartData = this.getCartData();
    //     cartData.items = this.ensureItems(cartData.items);
    //     cartData.items[itemIndex] = {
    //         ...(cartData.items[itemIndex] ?? {}),
    //         ...patch
    //     };
    //     this.setCartData(cartData);
    // }

    private buildItemsPayload(items: CartItemDraft[]): CartItemPayload[] | undefined {
        if (!items.length) {
            return undefined;
        }
        const payload = items.map((item) => (item ? this.mapItemPayload(item) : null)).filter((item): item is CartItemPayload => !!item);
        return payload.length ? payload : undefined;
    }

    private mapItemPayload(item: CartItemDraft): CartItemPayload {
        const returnCharge = item.return_charge ?? false;
        return {
            weight: item.weight,
            shipment_type: this.resolveShipmentType(item),
            declared_value: item.declared_value,
            height: item.height,
            width: item.width,
            length: item.length,
            return_charge: returnCharge,
            return_charge_detail: returnCharge ? this.buildReturnChargeDetailPayload(item.return_charge_detail) : undefined,
            article_id: item.article_id,
            fragile: item.fragile,
            person: this.buildItemPersonPayload(item.person),
            address: this.buildAddressPayload(item.destination)
        };
    }

    private resolveShipmentType(item: CartItemDraft): ShipmentType | undefined {
        if (item.destination?.type === 'home') {
            return 'D';
        }
        if (item.destination?.type === 'store') {
            return 'O';
        }
        return undefined;
    }

    private buildItemPersonPayload(person?: PersonPayload): CartItemPersonPayload | undefined {
        if (!person) {
            return undefined;
        }
        const payload: CartItemPersonPayload = {
            document_number: person.document_number,
            document_type: person.document_type,
            first_names: person.first_names,
            last_name: person.last_name
        };
        return this.hasPersonData(payload) ? payload : undefined;
    }

    private buildReturnChargeDetailPayload(detail?: ReturnChargeDetail | null): CartItemReturnChargeDetailPayload | undefined {
        if (!detail) {
            return undefined;
        }
        const address = detail.delivery_type === DELIVERY_TYPE.OFFICE ? this.buildStoreAddressPayload(detail.store) : this.buildHomeAddressPayload(detail.address);
        if (!address) {
            return undefined;
        }
        return {
            folios: this.normalizeFolios(detail.folios),
            address
        };
    }

    private buildAddressPayload(destination?: CartItemDestinationPayload): CartItemAddressPayload | undefined {
        if (!destination) {
            return undefined;
        }
        if (destination.type === 'store') {
            return this.buildStoreAddressPayload(destination.store);
        }
        return this.buildHomeAddressPayload(destination.address);
    }

    private buildHomeAddressPayload(state?: DestinationAddressFormState): CartItemAddressPayload | undefined {
        if (!state) {
            return undefined;
        }
        const address = this.normalizeText(state.searchAddress?.address) ?? this.normalizeText(state.formValues?.street);
        const reference = this.normalizeText(state.formValues?.references);
        const ubigeo = state.ubigeoDestination?.ubigeo_concatenated;
        const ubigeoId = state.ubigeoDestination?.ubigeo_id;
        if (!address && !reference && !ubigeoId && !state.placeId) {
            return undefined;
        }
        return {
            ubigeo,
            ubigeo_id: ubigeoId,
            address,
            reference,
            address_id: state.placeId ?? undefined,
            is_office: state.searchAddress?.office ?? false,
            office_code: state.searchAddress?.officeData?.code ?? undefined
        };
    }

    private buildStoreAddressPayload(state?: DestinationStoreFormState): CartItemAddressPayload | undefined {
        if (!state?.destination) {
            return undefined;
        }
        const destination = state.destination;
        const reference = this.normalizeText(state.formValues?.additionalInfo);
        const address = this.normalizeText(destination.headquarter_address) ?? this.normalizeText(destination.ubigeo_concatenated);
        const ubigeo = destination.ubigeo_concatenated;
        const ubigeoId = destination.ubigeo_id;
        const officeCode = destination.headquarter_code ?? destination.destination_code ?? undefined;
        return {
            ubigeo,
            ubigeo_id: ubigeoId,
            address,
            reference,
            is_office: true,
            office_code: officeCode,
            headquarter_id: destination.headquarter_id ?? undefined,
            headquarter_name: destination.headquarter_name ?? destination.name ?? undefined
        };
    }

    private normalizeText(value?: string | null): string | undefined {
        if (!value) {
            return undefined;
        }
        const trimmed = value.trim();
        return trimmed ? trimmed : undefined;
    }

    private normalizeFolios(value?: number | null): number {
        if (typeof value !== 'number' || Number.isNaN(value)) {
            return 1;
        }
        if (value < 1) {
            return 1;
        }
        if (value > 3) {
            return 3;
        }
        return Math.trunc(value);
    }

    private hasPersonData(person: CartItemPersonPayload): boolean {
        return !!(person.document_number || person.document_type || person.first_names || person.last_name);
    }

    clear() {
        this.sessionStorage.remove(this.CART_KEY);
    }
}
