import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DestinationCollectionResponse } from '@shipment-record/models/destination.model';

@Injectable({
    providedIn: 'root'
})
export class DestinationsService {
    baseUrl = environment.shippingRecords.api;
    private readonly http: HttpClient = inject(HttpClient);

    getAll(mode: 'home' | 'store' | 'all'): Observable<DestinationCollectionResponse> {
        let params = new HttpParams();
        params = params.append('mode', mode);
        const endpoint = `${this.baseUrl}/v1/shipping-records/destinations`;
        return this.http.get<DestinationCollectionResponse>(endpoint, { params });
    }
}
