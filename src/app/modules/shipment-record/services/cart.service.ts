import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '@env/environment';
import { CartEntityResponse, CartPayload, CreateCartPayload, OriginPayload, PersonPayload, WhoPaysPayload } from '@shipment-record/models/cart.model';
import { HeadquartersEntityResponse } from '@shipment-record/models/headquarters.model';
import { CartItemPayload } from '@shipment-record/models/cart-item.model';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private readonly baseUrl = environment.shippingRecords.api;
    private readonly http: HttpClient = inject(HttpClient);

    private readonly cartStore = new BehaviorSubject<any>(null);
    public cartStore$ = this.cartStore.asObservable();

    create(body: CreateCartPayload): Observable<any> {
        const endpoint = `${this.baseUrl}/v1/cart`;
        return this.http.post<any>(endpoint, body);
    }

    /**
     * Persist origin data for the cart
     */
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

    getByUuid(sessionUuid: string): Observable<CartEntityResponse> {
        const endpoint = `${this.baseUrl}/v1/cart/${sessionUuid}`;
        return this.http.get<CartEntityResponse>(endpoint);
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

    deleteItem(sessionUuid: string, itemUuid: string): Observable<any> {
        const endpoint = `${this.baseUrl}/v1/cart/${sessionUuid}/item/${itemUuid}`;
        return this.http.delete<any>(endpoint);
    }
}
