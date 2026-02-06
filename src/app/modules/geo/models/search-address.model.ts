import { ResponseCollection } from '@shared/models/response-collection.model';

export interface SearchAddress {}
export interface SearchAddressQueryParams {
    address?: string;
    ubigeo?: string;
    place_id?: string;
}

export interface SearchAddressCollectionResponse extends ResponseCollection<SearchAddressEntityResponse> {}
export interface SearchAddressEntityResponse {
    id?: number;
    address?: string;
    aliases?: any[];
    coordinates?: SearchAddressCoordinatesEntityResponse;
    postalCode?: string;
    ubigeo?: string;
    georeference?: string;
    polygon?: string;
    office?: boolean;
    geocodingConfidence?: number;
    officeData?: SearchAddressOfficeEntityResponse;
    dangerous?: boolean;
}

export interface SearchAddressCoordinatesEntityResponse {
    altitude?: number;
    longitude?: number;
    latitude?: number;
}

export interface SearchAddressOfficeEntityResponse {
    id?: null;
    code?: string | number | null;
    type?: null;
}
