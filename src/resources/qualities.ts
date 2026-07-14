import type { FilterByExternalDatabase, KodikResponse, SharedFields } from './shared-types';

export type QualitiesParams = {};

export interface QualitiesV2Params extends FilterByExternalDatabase, SharedFields {}

export interface QualityObject {
  title: string;
  count: number;
}

export type QualitiesResponse = Pick<QualityObject, 'title'>[];
export type QualitiesV2Response = KodikResponse<QualityObject[]>;
