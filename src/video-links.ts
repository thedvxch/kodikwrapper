import { VideoLinksError } from './errors';
import type { ObjectOrUnknown } from './types';

export const KODIK_PLAYER_DOMAIN = 'kodikplayer.com';
export const KODIK_VIDEO_INFO_ENDPOINT = '/ftor';

export interface KodikParsedLinkExUrlParams {
  d: string;
  d_sign: string;
  pd: string;
  pd_sign: string;
  ref: string;
  ref_sign: string;
  translations: boolean;
  advert_debug: boolean;
  min_age: number;
  first_url: boolean;
}

export interface KodikParsedLinkExTranslation {
  id: number;
  title: string;
}

export interface KodikParsedLinkExSkipButtons {
  type: string;
  data: string;
}

export type KodikVideoSourceQuality = '1080' | '720' | '480' | '360' | '240' | string;
export interface KodikVideoSource {
  src: string;
  type: string;
}
export type KodikVideoLinks = Record<KodikVideoSourceQuality, KodikVideoSource[]>;

export interface KodikParsedLinkEx {
  urlParams: KodikParsedLinkExUrlParams;
  playerSingleUrl?: string;
  translation: KodikParsedLinkExTranslation;
  skipButtons?: KodikParsedLinkExSkipButtons;
}

export interface VideoLinksParseParams<Extended extends boolean = false> {
  link: string;
  extended?: Extended;
}

export type KodikParsedLink<Extended extends boolean = false> = {
  host: string;
  type: string;
  id: string;
  hash: string;
  quality: string;
} & ObjectOrUnknown<Extended, Record<'ex', KodikParsedLinkEx>>;

export interface VideoLinksGetLinksParams {
  link: string;
  videoInfoEndpoint?: string
}

export const kodikPlayerLinkRegexp = /^(?<protocol>http[s]?:|)\/\/(?<host>[a-z0-9]+\.[a-z]+)\/(?<type>[a-z]+)\/(?<id>\d+)\/(?<hash>[0-9a-z]+)\/(?<quality>\d+p)(?:.*)$/;

export class VideoLinks {
  static async parseLink<Extended extends boolean>({ extended, link }: VideoLinksParseParams<Extended>): Promise<KodikParsedLink<Extended>> {
    if (!link)
      throw new VideoLinksError({
        code: 'parse-link-invalid',
        description: 'link is not provided',
        data: { link }
      });

    const kodikLink = this.normalizeKodikLink(link);
    if (!kodikPlayerLinkRegexp.test(link))
      throw new VideoLinksError({
        code: 'parse-link-invalid',
        description: 'link is not valid',
        data: { link }
      });

    const linkParams = kodikPlayerLinkRegexp.exec(kodikLink)!.groups!;

    const { host, hash, id, quality, type } = linkParams;
    const parsedLink: KodikParsedLink = {
      host, hash, id, quality, type,
    };

    if (!extended) return parsedLink as KodikParsedLink<Extended>;

    const page = await fetch(kodikLink).then(res => res.text());

    const urlParams = page.match(/var\s+urlParams\s*=\s*'(?<urlParams>[^']+)';/)?.groups?.urlParams;
    const translation = page.match(/var\s+translationId\s*=\s*(?<id>\d+);\s*var\s+translationTitle\s*=\s*"(?<title>[^"]+)";/is)?.groups;
    const skipButtons = page.match(/parseSkipButtons?\("(?<data>[^"]+)"\s*,\s*"(?<type>[^"]+)"\)/is)?.groups;
    const playerSingleUrl = page.match(/src="(?<link>\/assets\/js\/app\.player_single\.[a-z0-9]+\.js)"/is)?.groups?.link;

    if (!urlParams) throw new VideoLinksError({
      code: 'parse-link-ex-invalid',
      description: 'cannot get url params',
      data: { link, page }
    });
    if (!translation) throw new VideoLinksError({
      code: 'parse-link-ex-invalid',
      description: 'cannot get translation',
      data: { link, page }
    });

    const extendedParsedLink: KodikParsedLink<true> = {
      ...parsedLink,
      ex: {
        urlParams: JSON.parse(urlParams) as KodikParsedLinkExUrlParams,
        translation: {
          id: +translation.id,
          title: translation.title
        },
        skipButtons: { ...skipButtons } as unknown as KodikParsedLinkExSkipButtons,
        playerSingleUrl,
      }
    };

    return extendedParsedLink;
  }

  static normalizeKodikLink(input: string): string {
    if (input.startsWith('//')) return `https:${input}`;
    if (!input.startsWith('http')) return new URL(input, `https://${KODIK_PLAYER_DOMAIN}`).toString();
    return input;
  }

  static async getActualVideoInfoEndpoint(playerSingleUrl: string) {
    const response = await fetch(this.normalizeKodikLink(playerSingleUrl)).then(res => res.text());
    const endpoint = atob(response.match(/type:"POST",url:atob\("(?<b64str>[^"]+)"\)/i)?.groups?.b64str ?? '') || '/kor';

    return endpoint;
  }

  static async getLinks({ link, videoInfoEndpoint = KODIK_VIDEO_INFO_ENDPOINT }: VideoLinksGetLinksParams): Promise<KodikVideoLinks> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { host, quality, ...parsed } = await VideoLinks.parseLink({ link });

    const url = new URL(
      `${videoInfoEndpoint}?${new URLSearchParams(parsed).toString()}`,
      `https://${host}`
    );
    const videoInfoResponse = await fetch(url);
    if (videoInfoResponse.headers.get('content-type') !== 'application/json')
      throw new VideoLinksError({
        code: 'get-links-invalid-response',
        description: 'videoInfoResponse is not json',
        data: { videoInfoResponse }
      });

    const videoInfoJson = await videoInfoResponse.json();

    if (typeof videoInfoJson !== 'object' || videoInfoJson === null)
      throw new VideoLinksError({
        code: 'get-links-invalid-response',
        description: 'videoInfoJson is not object',
        data: { videoInfoResponse, videoInfoJson }
      });
    if (typeof videoInfoJson.links !== 'object')
      throw new VideoLinksError({
        code: 'get-links-invalid-response',
        description: 'videoInfoJson.links is not object',
        data: { videoInfoResponse, videoInfoJson }
      });

    const links = videoInfoJson.links as KodikVideoLinks;
    const zCharCode = 'Z'.charCodeAt(0);

    // decrypt source links
    for (const [, sources] of Object.entries(links)) {
      for (const source of sources) {
        const decryptedBase64 = source.src.replace(/[a-zA-Z]/g, e => {
          let eCharCode = e.charCodeAt(0);
          return String.fromCharCode((eCharCode <= zCharCode ? 90 : 122) >= (eCharCode = eCharCode + 18) ? eCharCode : eCharCode - 26);
        });
        source.src = atob(decryptedBase64);
      }
    }

    return links;
  }

  static parseSkipButtons = (skipButtons: KodikParsedLinkExSkipButtons) =>
    skipButtons.data.split(',').map((timeline) => {
      const [from, to] = timeline.split('-');
      return { from, to };
    });
}
