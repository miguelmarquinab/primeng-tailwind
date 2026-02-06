import { ResponseCollection } from '@shared/models/response-collection.model';

export interface ArticleCategories {}

export interface ArticleCategoriesCollectionResponse extends ResponseCollection<ArticleCategoriesEntityResponse[]> {}

export interface ArticleCategoriesEntityResponse {
    id?: number;
    code?: string;
    name?: string;
    description?: string;
}
