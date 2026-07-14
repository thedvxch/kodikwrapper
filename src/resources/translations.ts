import type { FilterByExternalDatabase, KodikResponse, SharedFields, TranslationV1Object } from './shared-types';

export type TranslationsParams = {};

export interface TranslationsV2Params extends FilterByExternalDatabase, Omit<SharedFields, 'translation_id'> {}

export interface TranslationV2Object {
  id: number;
  title: string;
  count: number;
}

export type TranslationsResponse = TranslationV1Object[];
export type TranslationsV2Response = KodikResponse<TranslationV2Object[]>;
