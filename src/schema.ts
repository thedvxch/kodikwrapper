import type {
  CountriesParams,
  CountriesResponse,
  GenresParams,
  GenresResponse,
  ListParams,
  ListResponse,
  QualitiesParams,
  QualitiesResponse,
  QualitiesV2Params,
  QualitiesV2Response,
  SearchParams,
  SearchResponse,
  TranslationsParams,
  TranslationsResponse,
  TranslationsV2Params,
  TranslationsV2Response,
  YearsParams,
  YearsResponse,
} from './resources';

export interface APIMethods {
  countries(params?: CountriesParams): Promise<CountriesResponse>;

  genres(params?: GenresParams): Promise<GenresResponse>;

  list(params?: ListParams): Promise<ListResponse>;

  qualities(params?: QualitiesParams): Promise<QualitiesResponse>;

  qualitiesV2(params?: QualitiesV2Params): Promise<QualitiesV2Response>;

  search(params?: SearchParams): Promise<SearchResponse>;

  translations(params?: TranslationsParams): Promise<TranslationsResponse>;

  translationsV2(params?: TranslationsV2Params): Promise<TranslationsV2Response>;

  years(params?: YearsParams): Promise<YearsResponse>;
}
