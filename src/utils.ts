export const KODIK_PLAYERS_SCRIPT_URL = 'https://kodik-add.com/add-players.min.js?v=2';

export type Fetcher = typeof fetch;

export interface GetPublicTokenParams {
  scriptUrl?: string;
  fetcher?: Fetcher;
}

export class UtilsError extends Error {
  name: string = 'UtilsError';
}

const tokenRegexp = /token\s*[=:]\s*["'](?<token>[0-9a-f]+)["']/i;

/** Fetches the public Kodik API token from the players script. */
export async function getPublicToken({ scriptUrl = KODIK_PLAYERS_SCRIPT_URL, fetcher = fetch }: GetPublicTokenParams = {}): Promise<string> {
  const script = await fetcher(scriptUrl).then((res) => res.text());
  const token = script.match(tokenRegexp)?.groups?.token;

  if (!token) throw new UtilsError(`cannot extract token from ${scriptUrl}`);

  return token;
}
