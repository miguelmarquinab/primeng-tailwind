import { inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SessionStorageService } from '@shared/services/storage/session-storage.service';
import { CartSessionStorage } from '@shipment-record/models/cart-session-storage.model';
import { CartPayload, CartPricingEntityResponse, OriginPayload, PersonPayload } from '@shipment-record/models/cart.model';
import { CartItemEntityResponse } from '@shipment-record/models/cart-item.model';

@Injectable({
    providedIn: 'root'
})
export class CartSessionStorageService {
    sessionStorage = inject(SessionStorageService);
    private readonly CART_KEY = 'cart';

    private readonly cartChangedSubject = new Subject<CartSessionStorage>();
    readonly cartChanged$ = this.cartChangedSubject.asObservable();

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

    getOrigin() {
        const cartData = this.getCartData();
        return cartData.header.origin;
    }

    setWhoPay(whoPay: string, detail: any) {
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


    setCurrentItemUuid(currentItemUuid: string) {
        const cartData = this.getCartData();
        cartData.header.currentItemUuid = currentItemUuid;
        this.setCartData(cartData);
    }

    getCurrentItemUuid() {
        const cartData = this.getCartData();
        return cartData.header.currentItemUuid;
    }

    // setCartData(data: CartSessionStorage) {
    //     this.sessionStorage.set(this.CART_KEY, data);
    // }

    setCartData(data: CartSessionStorage) {
        this.sessionStorage.set(this.CART_KEY, data);

        this.cartChangedSubject.next({
            ...data,
            items: [...(data?.items ?? [])]
        });
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
    getCartId(): string {
        return this.getCartData().cardId ?? '';
    }

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

    clear() {
        this.sessionStorage.remove(this.CART_KEY);
    }

    buildPersonCacheKey(documentNumber: string) {
        return `cache_person_${documentNumber}`;
    }

    setAddingNewItemFromStep3(value: boolean) {
        const cartData = this.getCartData();
        cartData.header.addingNewItemFromStep3 = value;
        this.setCartData(cartData);
    }

    isAddingNewItemFromStep3(): boolean {
        return !!this.getCartData().header.addingNewItemFromStep3;
    }
}
