import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartEntityResponse, CartNiubizSessionEntityResponse, CartPayload, CartPresaleLabelEntityResponse, PersonPayload } from '@shipment-record/models/cart.model';
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

    create(): Observable<any> {
        const endpoint = `${this.baseUrl}/v1/cart`;
        return this.http.post<any>(endpoint, {});
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
        return this.http.post<any>(endpoint,{});
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
    downloadLabelPdf(sessionUuid: string): Observable<CartPresaleLabelEntityResponse> {
        const endpoint = `${this.baseUrl}/v1/shipping-records/cart/${sessionUuid}/label`;
        return this.http.get<CartPresaleLabelEntityResponse>(endpoint);
    }
}
