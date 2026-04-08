import { ResponseCollection } from '@shared/models/response-collection.model';

export interface Headquarters {}
export interface HeadquartersCollectionResponse extends ResponseCollection<HeadquartersEntityResponse[]> {}

export interface HeadquartersEntityResponse {
    ubigeo_id?: string;
    ubigeo_code?: string;
    ubigeo_concatenated?: string;
    name?: string;
    representative_id?: string;
    headquarter_id: string;
    headquarter_name?: string;
    affectation_type?: null;
    address?: string;
    department?: string;
    province?: string;
    district?: string;
    payment_modalities?: PaymentModalities[];
}

export interface HeadquartersCoordinatesEntityResponse {
    altitude?: number;
    longitude?: string;
    latitude?: string;
}

export interface HeadquartersOfficeDataEntityResponse {
    id?: number;
    code?: string;
    type?: number;
    name?: string;
}

export interface PaymentModalities {
    code?: string;
    title?: string;
    description?: string;
    icon_name?: string;
    sort_order?: number;
    requires_payment_method?: boolean;
    payment_methods?: PaymentMethod[];
}

export interface PaymentMethod {
    code?: string;
    title?: string;
    id_method?: number;
}
