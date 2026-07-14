import type { FilterByExternalDatabase, KodikResponse, SharedFields } from './shared-types';

export interface YearsParams extends FilterByExternalDatabase, Omit<SharedFields, 'year'> {}

export interface YearsResponseObject {
  title: string;
  count: number;
}

export type YearsResponse = KodikResponse<YearsResponseObject[]>;
