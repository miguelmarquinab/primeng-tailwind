import { PersonEntityResponse } from '@/modules/people/models/person.model';

export interface WhoSenderForm {}

export interface WhoSenderFormData {
    documentType?: string;
    documentNumber?: string;
    firstName?: string;
    lastName?: string;
    cellPhone?: string;
    emailAddress?: string;

    personResponse?: PersonEntityResponse;
}
