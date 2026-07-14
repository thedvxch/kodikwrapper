import { describe, expect, it } from 'vitest';
import { Client } from '../src';

const token = process.env.KODIK_TOKEN;
const describeWithToken = token ? describe : describe.skip;

describeWithToken('Kodik API live', () => {
  const client = Client.fromToken(token!);

  it('loads countries', async () => {
    const response = await client.countries();

    expect(response).toEqual(
      expect.objectContaining({
        total: expect.any(Number),
        results: expect.any(Array),
      }),
    );
  });

  it('loads qualities', async () => {
    const response = await client.qualities();

    expect(response).toEqual(expect.any(Array));
  });

  it('searches with a small limit', async () => {
    const response = await client.search({ title: 'Naruto', limit: 1 });

    expect(response).toEqual(
      expect.objectContaining({
        total: expect.any(Number),
        results: expect.any(Array),
      }),
    );
    expect(response.results.length).toBeLessThanOrEqual(1);
  });
});
