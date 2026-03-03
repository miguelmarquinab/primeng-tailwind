import { PersonEntityResponse } from '@/modules/people/models/person.model';

export interface WhoSenderForm {}

export interface WhoSenderFormData {
    first_names?: string;
    last_name?: string;
    document_number?: string;
    document_type?: string;
    email?: string;
    phone?: string;
    person_legal_area?: number;
    package_headquarter_code?: string;
    discount_shipments_count?: number;
    rounding_factor?: number;
    tax_affectation_type_id?: string;
    employee_id?: number;
    personResponse?: PersonEntityResponse;
}
