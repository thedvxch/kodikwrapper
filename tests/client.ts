import { afterEach, describe, expect, it, vi } from 'vitest';
import { Client, ClientError } from '../src';

const jsonResponse = (body: unknown, contentType = 'application/json') =>
  new Response(JSON.stringify(body), {
    headers: { 'content-type': contentType },
  });

describe('Client', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a client from token', () => {
    const client = Client.fromToken('public-token', { kodikApiUrl: 'https://kodik.test' });

    expect(client).toBeInstanceOf(Client);
    expect(client.KODIK_API_URL).toBe('https://kodik.test');
  });

  it('sends POST requests with token and params', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ total: 1, results: [] }));
    const client = new Client({ token: 'public-token', kodikApiUrl: 'https://kodik.test' });

    await expect(client.search({ title: 'Naruto', limit: 1 })).resolves.toEqual({
      total: 1,
      results: [],
    });

    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(url.toString()).toBe('https://kodik.test/search?token=public-token&title=Naruto&limit=1');
    expect(init).toEqual({ method: 'POST' });
  });

  it('supports methods without params', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse([]));
    const client = new Client({ token: 'public-token', kodikApiUrl: 'https://kodik.test' });

    await expect(client.qualities()).resolves.toEqual([]);

    const [url] = fetchMock.mock.calls[0] as [URL];
    expect(url.toString()).toBe('https://kodik.test/qualities?token=public-token');
  });

  it('maps v2 method names to v2 endpoint paths', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse({ total: 0, results: [] }))
      .mockResolvedValueOnce(jsonResponse({ total: 0, results: [] }));
    const client = new Client({ token: 'public-token', kodikApiUrl: 'https://kodik.test' });

    await client.qualitiesV2({});
    await client.translationsV2({});

    const [qualitiesUrl] = fetchMock.mock.calls[0] as [URL];
    const [translationsUrl] = fetchMock.mock.calls[1] as [URL];
    expect(qualitiesUrl.toString()).toBe('https://kodik.test/qualities/v2?token=public-token');
    expect(translationsUrl.toString()).toBe('https://kodik.test/translations/v2?token=public-token');
  });

  it('throws ClientError when content type is not json', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok', { headers: { 'content-type': 'text/plain' } }));
    const client = new Client({ token: 'public-token', kodikApiUrl: 'https://kodik.test' });

    await expect(client.countries()).rejects.toBeInstanceOf(ClientError);
  });

  it('throws ClientError when json is not an object', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse('ok'));
    const client = new Client({ token: 'public-token', kodikApiUrl: 'https://kodik.test' });

    await expect(client.countries()).rejects.toMatchObject({
      name: 'ClientError',
      message: 'expected json as an object, but got a string',
    });
  });

  it('throws ClientError when API returns error field', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ error: 'bad token' }));
    const client = new Client({ token: 'bad-token', kodikApiUrl: 'https://kodik.test' });

    await expect(client.countries()).rejects.toMatchObject({
      name: 'ClientError',
      message: 'bad token',
    });
  });
});
