import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { CartEntityResponse, CouponValidateEntityResponse } from '@shipment-record/models/cart.model';
import { CouponApiMockService } from '@shipment-record/services/coupon-api.mock.service';
import { CouponEntityResponse } from '@shipment-record/models/coupon.model';


@Injectable({
    providedIn: 'root'
})
export class CouponService {
    private readonly http = inject(HttpClient);
    private readonly couponApiMock = inject(CouponApiMockService);
    private readonly baseUrl = environment.shippingRecords.api;


    validateCoupon(code: string): Observable<CouponValidateEntityResponse> {
        return this.couponApiMock.validateCoupon(code);
    }

    applyCoupon(sessionUuid: string, code?: string): Observable<CartEntityResponse> {
        return this.couponApiMock.applyCoupon(sessionUuid, code);
    }

    validateAndApplyCoupon(cartUuid: string, code?: string): Observable<CouponEntityResponse> {
        const endpoint = `${this.baseUrl}/v1/shipping-records/cart/${cartUuid}/coupon`;
        return this.http.post<CouponEntityResponse>(endpoint, { coupon_code: code ?? '' });
    }
}
