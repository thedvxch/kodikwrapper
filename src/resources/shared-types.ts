import type { AllowArray, Nullable } from '../types';

export type MaterialMovieType = 'foreign-movie' | 'soviet-cartoon' | 'foreign-cartoon' | 'russian-cartoon' | 'anime' | 'russian-movie';

export type MaterialSerialType = 'cartoon-serial' | 'documentary-serial' | 'russian-serial' | 'foreign-serial' | 'anime-serial' | 'multi-part-film';

export type MaterialType = MaterialMovieType | MaterialSerialType;

export type ExternalDatabase = 'kinopoisk_id' | 'imdb_id' | 'mdl_id' | 'worldart_link' | 'shikimori_id';

export type ExternalDatabaseGenresType = 'kinopoisk' | 'shikimori' | 'mydramalist' | 'all';

export type RatingMPAA = 'G' | 'PG' | 'PG-13' | 'R' | 'R+' | 'Rx';

export type AnimeKind = 'tv' | 'movie' | 'ova' | 'ona' | 'special' | 'music' | 'tv_13' | 'tv_24' | 'tv_48';

export type AnimeStatus = 'anons' | 'ongoing' | 'released';

export type TranslationType = 'voice' | 'subtitles';

export interface Translation {
  id: number;
  title: string;
  type: TranslationType;
}

export interface FilterByExternalDatabase {
  countries?: AllowArray<string>;
  genres?: AllowArray<string>;
  anime_genres?: AllowArray<string>;
  drama_genres?: AllowArray<string>;
  all_genres?: AllowArray<string>;
  duration?: string | number;
  kinopoisk_rating?: number | string;
  imdb_rating?: number | string;
  shikimori_rating?: number | string;
  mydramalist_rating?: number | string;
  actors?: AllowArray<number | string>;
  directors?: AllowArray<number | string>;
  producers?: AllowArray<number | string>;
  writers?: AllowArray<number | string>;
  composers?: AllowArray<number | string>;
  editors?: AllowArray<number | string>;
  designers?: AllowArray<number | string>;
  operators?: AllowArray<number | string>;
  rating_mpaa?: AllowArray<RatingMPAA>;
  minimal_age?: number | string;
  anime_kind?: AllowArray<AnimeKind>;
  anime_status?: AllowArray<AnimeStatus>;
  drama_status?: AllowArray<AnimeStatus>;
  all_status?: AllowArray<AnimeStatus>;
  anime_studios?: AllowArray<string>;
  anime_licensed_by?: AllowArray<string>;
}

export interface MaterialData {
  title?: string;
  anime_title?: string;
  title_en?: string;
  other_titles?: string[];
  other_titles_en?: string[];
  other_titles_jp?: string[];
  anime_license_name?: string;
  anime_licensed_by?: string[];
  anime_kind?: AnimeKind;
  all_status?: AnimeStatus;
  anime_status?: AnimeStatus;
  drama_status?: AnimeStatus;
  year?: number;
  tagline?: string;
  description?: string;
  anime_description?: string;
  poster_url?: string;
  screenshots?: string[];
  duration?: number;
  countries?: string[];
  all_genres?: string[];
  genres?: string[];
  anime_genres?: string[];
  drama_genres?: string[];
  anime_studios?: string[];
  kinopoisk_rating?: number;
  kinopoisk_votes?: number;
  imdb_rating?: number;
  imdb_votes?: number;
  shikimori_rating?: number;
  shikimori_votes?: number;
  mydramalist_rating?: number;
  mydramalist_votes?: number;
  premiere_ru?: string;
  premiere_world?: string;
  aired_at?: string;
  released_at?: string;
  next_episode_at?: string;
  rating_mpaa?: RatingMPAA;
  minimal_age?: number;
  episodes_total?: number;
  episodes_aired?: number;
  actors?: string[];
  directors?: string[];
  producers?: string[];
  writers?: string[];
  composers?: string[];
  editors?: string[];
  designers?: string[];
  operators?: string[];
}

export interface SharedFields {
  types?: AllowArray<MaterialType>;
  year?: AllowArray<number>;
  block_translations?: AllowArray<number>;
  translation_id?: AllowArray<number>;
  translation_type?: TranslationType;
  has_field?: AllowArray<ExternalDatabase>;
  has_field_and?: boolean;
  lgbt?: boolean;
  sort?: 'title' | 'count';
}

export interface EpisodeDataObject {
  title?: string;
  link: string;
  screenshots: string[];
}

export interface EpisodesObject {
  [episode: string | number]: string | EpisodeDataObject;
}

export interface SeasonObject {
  link: string;
  title?: string;
  episodes?: EpisodesObject;
}

export interface SeasonsObject {
  [season: string | number]: SeasonObject;
}

export interface BlockedSeasonsObject {
  [season: string | number]: 'all' | string[];
}

export interface TranslationV1Object {
  id: number;
  title: string;
  type: TranslationType;
}

export interface MaterialObject {
  id: string;
  title: string;
  title_orig: string;
  other_title: string;
  link: string;
  year: number;
  kinopoisk_id: string | number;
  imdb_id: string | number;
  mdl_id: string | number;
  worldart_link: string;
  shikimori_id: number;
  type: MaterialType;
  quality: string;
  caprip: boolean;
  lgbt: boolean;
  translation: TranslationV1Object;
  created_at: string;
  updated_at: string;
  blocked_countries: string[];
  seasons?: SeasonsObject;
  last_season?: number;
  last_episode?: number;
  episodes_count?: number;
  blocked_seasons?: BlockedSeasonsObject | 'all';
  screenshots: string[];
  material_data?: MaterialData;
}

export interface SharedSearchListFields {
  limit?: number;
  camrip?: boolean;
  with_seasons?: boolean;
  with_episodes?: boolean;
  with_episodes_data?: boolean;
  with_page_links?: boolean;
  not_blocked_in?: AllowArray<string>;
  not_blocked_for_me?: boolean;
  with_material_data?: boolean;
  next?: string;
}

export interface KodikResponse<T> {
  time: string;
  total: number;
  results: T;
}

export interface KodikResponseWithPagination<T> extends KodikResponse<T> {
  prev_page: Nullable<string>;
  next_page: Nullable<string>;
}
