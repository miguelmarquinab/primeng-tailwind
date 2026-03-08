import { ResponseCollection } from '@shared/models/response-collection.model';
import { AppTypeStringMutated, NullableString } from '@shared/types/app.type';

export enum DestinationCollectionMode {
    HOME = 'home',
    STORE = 'store',
    ALL = 'all'
}
export enum DestinationCollectionModality {
    DESTINATION = 'destination'
}
export interface DestinationCollectionQuery {
    mode: DestinationCollectionMode;
    modality?: DestinationCollectionModality;
    ubigeo_code?: string;
}
export interface DestinationCollectionResponse extends ResponseCollection<DestinationEntityResponse[]> {}

export interface DestinationEntityResponse {
    cargo_flag?: null;
    delivery_type?: string;
    department?: string;
    department_code?: string;
    destination_code?: AppTypeStringMutated;
    district?: string;
    district_code?: string;
    headquarter_address?: string;
    headquarter_code?: AppTypeStringMutated;
    headquarter_id?: AppTypeStringMutated;
    headquarter_name?: string;
    latitude?: string;
    longitude?: string;
    is_agent?: boolean;
    is_open?: boolean;
    name?: string;
    province?: string;
    province_code?: string;
    representative_id?: string;
    office_id?: number;
    office_name?: string;
    office_address?: string;
    schedule?: DestinationScheduleEntityResponse;
    ubigeo_code?: string;
    ubigeo_concatenated: string;
    ubigeo_concatenated_without_spaces?: string;
    ubigeo_id?: string;
}

export interface DestinationScheduleEntityResponse {
    friday?: DestinationScheduleDayEntityResponse;
    monday?: DestinationScheduleDayEntityResponse;
    saturday?: DestinationScheduleDayEntityResponse;
    sunday?: DestinationScheduleDayEntityResponse;
    thursday?: DestinationScheduleDayEntityResponse;
    tuesday?: DestinationScheduleDayEntityResponse;
    wednesday?: DestinationScheduleDayEntityResponse;
}

export interface DestinationScheduleDayEntityResponse {
    close?: NullableString;
    open?: NullableString;
}
