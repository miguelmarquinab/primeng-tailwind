import { ResponseCollection } from '@shared/models/response-collection.model';

export interface AutocompleteCollectionResponse extends ResponseCollection<AutocompleteEntityResponse> {}

export interface AutocompleteEntityResponse {
    predictions?: AutocompletePredictionEntityResponse[];
    status?: string;
}

export interface AutocompletePredictionEntityResponse {
    description?: string;
    main_text?: string;
    place_id?: string;
    secondary_text?: string;
    types?: string[];
}
