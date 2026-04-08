import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StandardSizeCollectionResponse } from '@shipment-record/models/standard-size.model';

@Injectable({
    providedIn: 'root'
})
export class StandardSizeService {
    baseUrl = environment.shippingRecords.api;
    private readonly http: HttpClient = inject(HttpClient);

    getAll(): Observable<StandardSizeCollectionResponse> {
        const endpoint = `${this.baseUrl}/v1/shipping-records/standard-sizes`;
        return this.http.get<StandardSizeCollectionResponse>(endpoint);
    }
}
