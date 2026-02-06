import { ResponseCollection } from '@shared/models/response-collection.model';

export interface Headquarters {}
export interface HeadquartersCollectionResponse extends ResponseCollection<HeadquartersEntityResponse[]> {}

export interface HeadquartersEntityResponse {
    ubigeo_id?: string;
    ubigeo_code?: string;
    ubigeo_concatenated?: string;
    name?: string;
    representative_id?: string;
    headquarter_id: number;
    headquarter_name?: string;
    affectation_type?: null;
    address?: string;
    department?: string;
    province?: string;
    district?: string;
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
