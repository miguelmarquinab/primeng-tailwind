import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AutocompleteCollectionResponse } from '@/modules/geo/models/autocomplete.model';
import { Observable } from 'rxjs';
import { SearchAddressCollectionResponse, SearchAddressQueryParams } from '@/modules/geo/models/search-address.model';

@Injectable({
    providedIn: 'root'
})
export class GeoService {
    private readonly baseUrl = environment.shippingRecords.api;
    private readonly http: HttpClient = inject(HttpClient);

    autocompleteAddress(search_text: string): Observable<AutocompleteCollectionResponse> {
        const endpoint = `${this.baseUrl}/v1/geo/autocomplete`;
        return this.http.get<AutocompleteCollectionResponse>(endpoint, {
            params: {
                search_text
            }
        });
    }

    searchAddress(queryParams: SearchAddressQueryParams): Observable<SearchAddressCollectionResponse> {
        let params = new HttpParams();
        if (queryParams.address) {
            params = params.set('address', queryParams.address);
        }
        if (queryParams.ubigeo) {
            params = params.set('ubigeo', queryParams.ubigeo);
        }
        if (queryParams.place_id) {
            params = params.set('place_id', queryParams.place_id);
        }
        const endpoint = `${this.baseUrl}/v1/geo/address`;
        return this.http.get<SearchAddressCollectionResponse>(endpoint, {
            params
        });
    }
}
