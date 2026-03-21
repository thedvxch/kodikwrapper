import type { APIMethods } from './schema';

export interface ClientOptions {
  token: string;
  kodikApiUrl?: string;
}

export const KODIK_API_URL = 'https://kodik-api.com';

const endpointsArr: (keyof APIMethods)[] =
  ['countries', 'genres', 'list', 'qualities', 'search', 'translations', 'years', 'qualitiesV2', 'translationsV2'];

const remapEndpoints: Record<string, string> = {
  qualitiesV2: 'qualities/v2',
  translationsV2: 'translations/v2',
};

export class ClientError extends Error {
  name: string = 'ClientError';
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class Client {
  public KODIK_API_URL: string;

  constructor({ token, kodikApiUrl }: ClientOptions) {
    this.KODIK_API_URL = kodikApiUrl ?? KODIK_API_URL;

    for (const endpointKey of endpointsArr) {
      const endpoint = remapEndpoints[endpointKey] ?? endpointKey;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this[endpointKey] = (params: Record<string, string>) =>
        fetch(new URL(`${endpoint}?${new URLSearchParams({ token, ...params }).toString()}`,this.KODIK_API_URL), {
          method: 'POST',
        })
          .then(async (res) => {
            if (res.headers.get('content-type') !== 'application/json') throw new ClientError(`invalid response (expected content-type application/json, but got ${res.headers.get('content-type')})`);
            const json = await res.json();
            if (typeof json !== 'object') throw new ClientError(`expected json as an object, but got a ${typeof json}`);
            return json as object;
          })
          .then(
            (json) => {
              if ('error' in json) throw new ClientError(json.error as string);
              return json;
            }
          );
    }
  }

  static fromToken(token: string, options?: Omit<ClientOptions, 'token'>) {
    return new Client({ ...options, token });
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface Client extends APIMethods {}
