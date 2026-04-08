import { ResponseCollection } from '@shared/models/response-collection.model';

export interface StandardSizeEntityResponse {
    label?: string;
    value?: string;
    dimensions?: string;
    maxWeight?: number;
    maxWeightUnit?: string;
    imgSrc?: string;
    large?: number;
    width?: number;
    height?: number;
    dimensionUnit?: string;
    weight?: number;
}

export interface StandardSizeCollectionResponse extends ResponseCollection<StandardSizeEntityResponse[]> {}
