import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartEntityResponse, CartPayload, CartPresaleLabelEntityResponse, PersonPayload, CreateCartPayload, WhoPaysPayload, OriginPayload, CartNiubizSessionEntityResponse } from '@shipment-record/models/cart.model';
import { HeadquartersEntityResponse } from '@shipment-record/models/headquarters.model';
import { CartItemPayload } from '@shipment-record/models/cart-item.model';
import { CouponService } from '@shipment-record/services/coupon.service';
import { CouponEntityResponse } from '../models/coupon.model';
import { PriceEntityResponse } from '../models/price.model';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private readonly baseUrl = environment.shippingRecords.api;
    private readonly http: HttpClient = inject(HttpClient);
    private readonly couponService = inject(CouponService);

    private readonly cartStore = new BehaviorSubject<any>(null);
    public cartStore$ = this.cartStore.asObservable();

    /* Old vertion */
    // create(): Observable<any> {
    //     const endpoint = `${this.baseUrl}/v1/cart`;
    //     return this.http.post<any>(endpoint, {});
    // }

    /* Start Refactory*/
    create(body: CreateCartPayload): Observable<any> {
        const endpoint = `${this.baseUrl}/v1/cart`;
        return this.http.post<any>(endpoint, body);
    }

    setOrigin(sessionUuid: string, body: OriginPayload): Observable<any> {
        const endpoint = `${this.baseUrl}/v1/cart/${sessionUuid}/origin`;
        return this.http.put<any>(endpoint, body);
    }

    /**
     * Persist who pays selection in cart
     */
    setWhoPays(sessionUuid: string, body: WhoPaysPayload): Observable<any> {
        const endpoint = `${this.baseUrl}/v1/cart/${sessionUuid}/who-pays`;
        return this.http.put<any>(endpoint, body);
    }

    /* Close Refactory */

    update(sessionUuid: string, payload: CartPayload): Observable<any> {
        const endpoint = `${this.baseUrl}/v1/cart/${sessionUuid}`;
        return this.http.patch<any>(endpoint, payload);
    }

    delete(sessionUuid: string): Observable<any> {
        const endpoint = `${this.baseUrl}/v1/cart/${sessionUuid}`;
        return this.http.delete<any>(endpoint);
    }

    updateOrigin(person: PersonPayload, origin: HeadquartersEntityResponse) {
        this.cartStore.next({
            person: person,
            origin: origin
        });
    }

    setStepNumber(stepNumber: number) {
        const currentCart = this.cartStore.getValue() || {};
        this.cartStore.next({
            ...currentCart,
            stepNumber: stepNumber
        });
    }

    setItems(items: any[]) {
        const currentCart = this.cartStore.getValue() || {};
        this.cartStore.next({
            ...currentCart,
            items: items
        });
    }

    getByUuid(sessionUuid: string): Observable<CartEntityResponse> {
        const endpoint = `${this.baseUrl}/v1/cart/${sessionUuid}`;
        return this.http.get<CartEntityResponse>(endpoint);
    }

    /**
     * Forces backend price recalculation for the current session/cart.
     * Used after coupon changes to ensure totals are recomputed.
     */
    refreshPrice(sessionUuid: string): Observable<PriceEntityResponse> {
        const endpoint = `${this.baseUrl}/v1/price/${sessionUuid}`;
        return this.http.get<PriceEntityResponse>(endpoint);
    }

    validateCoupon(code: string) {
        return this.couponService.validateCoupon(code);
    }

    validateAndApplyCoupon(cartUuid: string, code?: string): Observable<CouponEntityResponse> {
        return this.couponService.validateAndApplyCoupon(cartUuid, code);
    }

    // applyCoupon(sessionUuid: string): Observable<CartEntityResponse> {
    //     return this.couponService.applyCoupon(sessionUuid);
    // }
    applyCoupon(sessionUuid: string, code: string): Observable<CartEntityResponse> {
        return this.couponService.applyCoupon(sessionUuid, code);
    }

    updateCart() {
        this.cartStore.next(this.cartStore.getValue());
    }

    clearCart() {
        this.cartStore.next({
            person: null,
            origin: null
        });
    }

    reset(event: any) {
        console.log('reset', event);
        this.cartStore.next({
            reset: true,
            event
        });
    }

    createItem(sessionUuid: string, payload: CartItemPayload): Observable<any> {
        const endpoint = `${this.baseUrl}/v1/cart/${sessionUuid}/item`;
        return this.http.post<any>(endpoint, payload);
    }

    updateItem(sessionUuid: string, itemUuid: string, payload: any): Observable<any> {
        const endpoint = `${this.baseUrl}/v1/cart/${sessionUuid}/item/${itemUuid}`;
        return this.http.patch<any>(endpoint, payload);
    }

    cloneItem(sessionUuid: string, itemUuid: string): Observable<any> {
        const endpoint = `${this.baseUrl}/v1/cart/${sessionUuid}/item/${itemUuid}/clone`;
        return this.http.post<any>(endpoint, {});
    }
    deleteItem(sessionUuid: string, itemUuid: string): Observable<any> {
        const endpoint = `${this.baseUrl}/v1/cart/${sessionUuid}/item/${itemUuid}`;
        return this.http.delete<any>(endpoint);
    }

    createPin(sessionUuid: string, pin: string): Observable<any> {
        const endpoint = `${this.baseUrl}/v1/shipping-records/cart/${sessionUuid}/pin`;
        return this.http.put<any>(endpoint, {
            pin
        });
    }

    createPaymentNiubizSession(sessionUuid: string): Observable<CartNiubizSessionEntityResponse> {
        const endpoint = `${this.baseUrl}/v1/cart/${sessionUuid}/payment/niubiz/session`;
        return this.http.post<CartNiubizSessionEntityResponse>(endpoint, {});
    }

    createPESession(sessionUuid: string): Observable<any> {
        const endpoint = `${this.baseUrl}/v1/cart/${sessionUuid}/payment/pagoefectivo`;
        return this.http.post<any>(endpoint, {
            email: 'correo@gmail.com'
        });
    }
    createOfflinePayment(sessionUuid: string): Observable<any> {
        // {{url}}/v1/cart/{{session_id}}/payment/tienda
        const endpoint = `${this.baseUrl}/v1/cart/${sessionUuid}/payment/tienda`;
        return this.http.post<any>(endpoint, {});
    }
    downloadLabelPdf(sessionUuid: string): Observable<CartPresaleLabelEntityResponse> {
        const endpoint = `${this.baseUrl}/v1/shipping-records/cart/${sessionUuid}/label`;
        return this.http.get<CartPresaleLabelEntityResponse>(endpoint);
    }
}
