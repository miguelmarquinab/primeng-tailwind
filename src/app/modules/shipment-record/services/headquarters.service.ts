import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HeadquartersCollectionResponse } from '@shipment-record/models/headquarters.model';

@Injectable({
    providedIn: 'root'
})
export class HeadquartersService {
    baseUrl = environment.shippingRecords.api;
    private readonly http: HttpClient = inject(HttpClient);

    getAll(): Observable<HeadquartersCollectionResponse> {
        const endpoint = `${this.baseUrl}/v1/shipping-records/headquarters`;
        return this.http.get<HeadquartersCollectionResponse>(endpoint);
    }
}
