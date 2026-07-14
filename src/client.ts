import type { APIMethods } from './schema';
import type { Fetcher } from './utils';

export interface ClientOptions {
  token: string;
  kodikApiUrl?: string;
  fetcher?: Fetcher;
}

export const KODIK_API_URL = 'https://kodik-api.com';

const endpointsArr: (keyof APIMethods)[] = ['countries', 'genres', 'list', 'qualities', 'search', 'translations', 'years', 'qualitiesV2', 'translationsV2'];

const remapEndpoints: Record<string, string> = {
  qualitiesV2: 'qualities/v2',
  translationsV2: 'translations/v2',
};

export class ClientError extends Error {
  name: string = 'ClientError';
}

// biome-ignore lint/suspicious/noUnsafeDeclarationMerging: class merged with APIMethods interface to type dynamic endpoints
export class Client {
  public KODIK_API_URL: string;

  constructor({ token, kodikApiUrl, fetcher = fetch }: ClientOptions) {
    this.KODIK_API_URL = kodikApiUrl ?? KODIK_API_URL;

    for (const endpointKey of endpointsArr) {
      const endpoint = remapEndpoints[endpointKey] ?? endpointKey;
      // @ts-expect-error dynamic endpoint method assignment
      this[endpointKey] = (params: Record<string, string>) =>
        fetcher(new URL(`${endpoint}?${new URLSearchParams({ token, ...params }).toString()}`, this.KODIK_API_URL), {
          method: 'POST',
        })
          .then(async (res) => {
            if (res.headers.get('content-type') !== 'application/json') throw new ClientError(`invalid response (expected content-type application/json, but got ${res.headers.get('content-type')})`);
            const json = await res.json();
            if (typeof json !== 'object') throw new ClientError(`expected json as an object, but got a ${typeof json}`);
            return json as object;
          })
          .then((json) => {
            if ('error' in json) throw new ClientError(json.error as string);
            return json;
          });
    }
  }

  static fromToken(token: string, options?: Omit<ClientOptions, 'token'>) {
    return new Client({ ...options, token });
  }
}

export interface Client extends APIMethods {}
