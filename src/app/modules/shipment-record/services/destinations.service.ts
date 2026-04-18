import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DestinationCollectionQuery, DestinationCollectionResponse } from '@shipment-record/models/destination.model';

@Injectable({
    providedIn: 'root'
})
export class DestinationsService {
    baseUrl = environment.shippingRecords.api;
    private readonly http: HttpClient = inject(HttpClient);

    getAll(query: DestinationCollectionQuery): Observable<DestinationCollectionResponse> {
        let params = new HttpParams();
        params = params.append('mode', query.mode);
        if (query.modality) {
            params = params.append('modality', query.modality);
        }
        if (query.ubigeo_code) {
            params = params.append('ubigeo_code', query.ubigeo_code);
        }
        const endpoint = `${this.baseUrl}/v1/shipping-records/destinations`;
        return this.http.get<DestinationCollectionResponse>(endpoint, { params });
    }

    getReturnChargeDestinations(query: DestinationCollectionQuery): Observable<DestinationCollectionResponse> {
        let params = new HttpParams();
        params = params.append('mode', query.mode);
        if (query.modality) {
            params = params.append('modality', query.modality);
        }
        if (query.id_headquarter) {
            params = params.append('id_headquarter', query.id_headquarter);
        }
        const endpoint = `${this.baseUrl}/v1/shipping-records/return-charge-destinations`;
        return this.http.get<DestinationCollectionResponse>(endpoint, { params });
    }
}
