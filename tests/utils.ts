import { describe, expect, it, vi } from 'vitest';
import { getPublicToken, KODIK_PLAYERS_SCRIPT_URL, UtilsError } from '../src';

const scriptResponse = (body: string) => ({ text: () => Promise.resolve(body) });

describe('getPublicToken', () => {
  it('extracts token from the players script', async () => {
    const fetcher = vi.fn(() => Promise.resolve(scriptResponse('a=1;e.type="SCRIPT",e.token="447d179e875efe44217f20d1ee2146be";b=2')));

    const token = await getPublicToken({ fetcher });

    expect(token).toBe('447d179e875efe44217f20d1ee2146be');
    expect(fetcher).toHaveBeenCalledWith(KODIK_PLAYERS_SCRIPT_URL);
  });

  it('respects a custom script url', async () => {
    const fetcher = vi.fn(() => Promise.resolve(scriptResponse('token:"deadbeef"')));

    await getPublicToken({ fetcher, scriptUrl: 'https://custom.test/script.js' });

    expect(fetcher).toHaveBeenCalledWith('https://custom.test/script.js');
  });

  it('throws when no token is present', async () => {
    const fetcher = vi.fn(() => Promise.resolve(scriptResponse('no token here')));

    await expect(getPublicToken({ fetcher })).rejects.toBeInstanceOf(UtilsError);
  });
});
