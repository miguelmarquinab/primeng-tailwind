import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartEntityResponse, CartPayload, PersonPayload } from '@shipment-record/models/cart.model';
import { HeadquartersEntityResponse } from '@shipment-record/models/headquarters.model';

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

    updateCart(){
        this.cartStore.next(this.cartStore.getValue());
    }

    clearCart() {
        this.cartStore.next({
            person: null,
            origin: null
        });
    }
}
