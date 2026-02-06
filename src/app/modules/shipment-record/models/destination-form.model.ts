import { SearchAddressEntityResponse } from '@/modules/geo/models/search-address.model';
import { DestinationEntityResponse } from '@shipment-record/models/destination.model';

export interface DestinationAddressFormValues {
    ubigeo: string | null;
    street: string | null;
    references: string | null;
}

export interface DestinationAddressFormState {
    searchAddress: SearchAddressEntityResponse | null;
    ubigeoDestination: DestinationEntityResponse | null;
    formValues: DestinationAddressFormValues;
    placeId?: string | null;
}

export interface DestinationStoreFormValues {
    destination: string | null;
    additionalInfo: string | null;
}

export interface DestinationStoreFormState {
    destination: DestinationEntityResponse;
    formValues: DestinationStoreFormValues;
}
