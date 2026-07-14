import type { AllowArray } from '../types';
import type { FilterByExternalDatabase, KodikResponse, MaterialObject, SharedFields, SharedSearchListFields, TranslationType } from './shared-types';

export interface SearchParams extends FilterByExternalDatabase, Omit<SharedFields, 'sort'>, SharedSearchListFields {
  title?: string;
  title_orig?: string;
  strict?: boolean;
  full_match?: boolean;
  id?: string;
  player_link?: string;
  kinopoisk_id?: number;
  imdb_id?: string;
  mdl_id?: string;
  worldart_animation_id?: number;
  worldart_cinema_id?: number;
  worldart_link?: string;
  shikimori_id?: number;
  prioritize_translations?: AllowArray<TranslationType | string | number>;
  unprioritize_translations?: AllowArray<TranslationType | string | number>;
  prioritize_translation_type?: TranslationType;
  season?: number;
  episode?: number;
}

export type SearchResponse = KodikResponse<MaterialObject[]>;
