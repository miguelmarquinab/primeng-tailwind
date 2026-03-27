import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';
import { CartEntityResponse, CouponValidateEntityResponse } from '@shipment-record/models/cart.model';
import { CartItemEntityResponse } from '@shipment-record/models/cart-item.model';

/** Mock discount % when applying coupon (simulated until backend returns discounted prices). */
const MOCK_DISCOUNT_PERCENT = 10;

/** Mock valid coupon code for validation simulation. */
const MOCK_VALID_COUPON_CODE = 'ABC123';

/**
 * Mock service that simulates the coupon REST endpoints (HU 7.1).
 * Replace with real API calls when endpoints are available.
 */
@Injectable({
    providedIn: 'root'
})
export class CouponApiMockService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.shippingRecords.api;

    /**
     * Simulates first API - validate coupon (validity and restrictions).
     * Only code "ABC123" is considered valid; any other code returns ERROR.
     */
    validateCoupon(code: string): Observable<CouponValidateEntityResponse> {
        return new Observable<CouponValidateEntityResponse>((subscriber) => {
            const normalized = code?.trim().toUpperCase();
            if (normalized === MOCK_VALID_COUPON_CODE) {
                subscriber.next({ status: 'OK' });
            } else {
                subscriber.next({
                    status: 'ERROR',
                    message: 'El codigo de cupon ingresado es invalido.'
                });
            }
            subscriber.complete();
        });
    }

    /**
     * Simulates second API - apply coupon.
     * HU: reuse get cart endpoint; mock applies discount to items and total so UI reflects "descuento aplicado".
     */
    // applyCoupon(sessionUuid: string): Observable<CartEntityResponse> {
    //     const endpoint = `${this.baseUrl}/v1/cart/${sessionUuid}`;
    //     return this.http.get<CartEntityResponse>(endpoint).pipe(map((response) => this.applyMockDiscount(response)));
    // }
    applyCoupon(sessionUuid: string, code?: string): Observable<CartEntityResponse> {
        const endpoint = `${this.baseUrl}/v1/cart/${sessionUuid}`;
        return this.http.get<CartEntityResponse>(endpoint).pipe(map((response) => this.applyMockDiscount(response, code)));
    }

    /** Apply simulated discount to cart response so total and item amounts update in UI. */
    private applyMockDiscount(response: CartEntityResponse, code?: string): CartEntityResponse {
        if (!response?.data?.items?.length) {
            return response;
        }
        const factor = 1 - MOCK_DISCOUNT_PERCENT / 100;
        const items: CartItemEntityResponse[] = response.data.items.map((item) => {
            const amount = item.pricing?.amount;
            if (amount == null) return item;
            const discounted = Math.round(amount * factor * 100) / 100;
            return {
                ...item,
                pricing: { ...item.pricing, amount: discounted }
            };
        });
        const total = items.reduce((sum, item) => sum + (item.pricing?.amount ?? 0), 0);
        return {
            ...response,
            data: {
                ...response.data,
                items,
                pricing: {
                    ...response.data.pricing,
                    total: Math.round(total * 100) / 100
                }
            }
        };
    }
}
