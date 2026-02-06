import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ArticleCategoriesCollectionResponse } from '@shipment-record/models/article-categories.model';

@Injectable({
    providedIn: 'root'
})
export class ArticleCategoriesService {
    private readonly baseUrl = environment.shippingRecords.api;
    private readonly http: HttpClient = inject(HttpClient);

    getAll(): Observable<ArticleCategoriesCollectionResponse> {
        const endpoint = `${this.baseUrl}/v1/shipping-records/article-categories`;
        return this.http.get<ArticleCategoriesCollectionResponse>(endpoint);
    }
}
