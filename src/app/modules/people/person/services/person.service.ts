import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { PersonEntityResponse, PersonValidateEntityResponse, PersonValidatePayload } from '@/modules/people/models/person.model';

@Injectable({
    providedIn: 'root'
})
export class PersonService {
    private readonly baseUrl = environment.shippingRecords.api;
    private readonly http: HttpClient = inject(HttpClient);

    getPerson(documentType: number, documentNumber: string): Observable<PersonEntityResponse> {
        const endpoint = `${this.baseUrl}/v1/person/${documentType}/${documentNumber}`;
        return this.http.get<PersonEntityResponse>(endpoint);
    }

    validatePerson(documentNumber: string, payload: PersonValidatePayload): Observable<PersonValidateEntityResponse> {
        const documentType = 'dni';
        const endpoint = `${this.baseUrl}/v1/person/${documentType}/${documentNumber}/validate`;
        return this.http.post<PersonEntityResponse>(endpoint, payload);
    }
}
