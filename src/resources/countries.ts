import type { FilterByExternalDatabase, KodikResponse, SharedFields } from './shared-types';

export interface CountriesParams extends FilterByExternalDatabase, SharedFields {}

export interface CountriesResponseObject {
  title: string;
  count: number;
}

export type CountriesResponse = KodikResponse<CountriesResponseObject[]>;
