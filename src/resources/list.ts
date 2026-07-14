import type { FilterByExternalDatabase, KodikResponseWithPagination, MaterialObject, SharedFields, SharedSearchListFields } from './shared-types';

export interface ListParams extends FilterByExternalDatabase, Omit<SharedFields, 'sort'>, SharedSearchListFields {
  sort?: 'year' | 'created_at' | 'updated_at' | 'kinopoisk_rating' | 'imdb_rating' | 'shikimori_rating';
  order?: 'asc' | 'desc';
}

export type ListResponse = KodikResponseWithPagination<MaterialObject[]>;
