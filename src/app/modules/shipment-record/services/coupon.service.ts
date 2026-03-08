import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { CartEntityResponse, CouponValidateEntityResponse } from '@shipment-record/models/cart.model';
import { CouponApiMockService } from '@shipment-record/services/coupon-api.mock.service';

/**
 * Coupon API service for shipment record module; handles coupon validation and application.
 */
@Injectable({
    providedIn: 'root'
})
export class CouponService {
    private readonly http = inject(HttpClient);
    private readonly couponApiMock = inject(CouponApiMockService);
    private readonly baseUrl = environment.shippingRecords.api;

    /**
     * Validate coupon (validity and restrictions).
     * When endpoint is available: uncomment real call and remove mock delegation.
     */
    validateCoupon(code: string): Observable<CouponValidateEntityResponse> {
        // --- Real endpoint (uncomment when available) ---
        // const endpoint = `${this.baseUrl}/v1/coupon/validate`;
        // return this.http.get<CouponValidateEntityResponse>(endpoint, { params: { code } });
        // or: return this.http.post<CouponValidateEntityResponse>(endpoint, { code });

        return this.couponApiMock.validateCoupon(code);
    }

    /**
     * Apply coupon to cart; returns cart with updated prices.
     * When endpoint is available: uncomment real call and remove mock delegation.
     */
    applyCoupon(sessionUuid: string, code?: string): Observable<CartEntityResponse> {
        // --- Real endpoint (uncomment when available) ---
        // const endpoint = `${this.baseUrl}/v1/cart/${sessionUuid}/coupon/apply`;
        // return this.http.post<CartEntityResponse>(endpoint, { code: code ?? '' });

        return this.couponApiMock.applyCoupon(sessionUuid);
    }
}
