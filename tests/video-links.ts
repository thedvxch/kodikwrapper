import { afterEach, describe, expect, it, vi } from 'vitest';
import { VideoLinks, VideoLinksError } from '../src';

const createResponse = (body: string, contentType = 'text/plain') =>
  new Response(body, {
    headers: { 'content-type': contentType },
  });

const encodeVideoSource = (src: string) => {
  const base64 = btoa(src);
  return base64.replace(/[a-zA-Z]/g, (char) => {
    const code = char.charCodeAt(0);
    const start = code <= 90 ? 65 : 97;
    return String.fromCharCode(((code - start + 8) % 26) + start);
  });
};

describe('VideoLinks', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('normalizeKodikLink', () => {
    it('normalizes protocol-relative links', () => {
      expect(VideoLinks.normalizeKodikLink('//kodik.cc/video/1/hash/720p'))
        .toBe('https://kodik.cc/video/1/hash/720p');
    });

    it('normalizes relative links against kodikplayer.com', () => {
      expect(VideoLinks.normalizeKodikLink('/video/1/hash/720p'))
        .toBe('https://kodikplayer.com/video/1/hash/720p');
    });

    it('keeps absolute links unchanged', () => {
      const link = 'https://kodik.cc/video/1/hash/720p';

      expect(VideoLinks.normalizeKodikLink(link)).toBe(link);
    });
  });

  describe('parseLink', () => {
    it('parses a valid player link without network requests', async () => {
      const fetchMock = vi.spyOn(globalThis, 'fetch');

      const parsedLink = await VideoLinks.parseLink({
        link: '//kodik.cc/video/87051/57c572172a2ccfb23234cdaf7174b20d/720p',
      });

      expect(parsedLink).toEqual({
        host: 'kodik.cc',
        type: 'video',
        id: '87051',
        hash: '57c572172a2ccfb23234cdaf7174b20d',
        quality: '720p',
      });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('throws a typed error when link is empty', async () => {
      await expect(VideoLinks.parseLink({ link: '' })).rejects.toMatchObject({
        name: 'VideoLinksError',
        code: 'parse-link-invalid',
        message: 'link is not provided',
      });
    });

    it('throws a typed error when link has invalid format', async () => {
      await expect(VideoLinks.parseLink({ link: 'https://kodik.cc/video/not-a-number/hash/720p' }))
        .rejects.toMatchObject({
          name: 'VideoLinksError',
          code: 'parse-link-invalid',
          message: 'link is not valid',
        });
    });

    it('parses extended data from the player page', async () => {
      const urlParams = {
        d: 'kodik.cc',
        d_sign: 'd-sign',
        pd: 'kodikplayer.com',
        pd_sign: 'pd-sign',
        ref: 'ref',
        ref_sign: 'ref-sign',
        translations: false,
        advert_debug: false,
        min_age: 16,
        first_url: false,
      };
      const page = `
        <script>
          var urlParams = '${JSON.stringify(urlParams)}';
          var translationId = 609;
          var translationTitle = "AniLibria.TV";
          parseSkipButtons("10-20,30-40", "intro");
        </script>
        <script src="/assets/js/app.player_single.abc123.js"></script>
      `;
      const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(createResponse(page));

      const parsedLink = await VideoLinks.parseLink({
        link: '//kodik.cc/video/87051/57c572172a2ccfb23234cdaf7174b20d/720p',
        extended: true,
      });

      expect(fetchMock).toHaveBeenCalledWith('https://kodik.cc/video/87051/57c572172a2ccfb23234cdaf7174b20d/720p');
      expect(parsedLink.ex).toEqual({
        urlParams,
        translation: {
          id: 609,
          title: 'AniLibria.TV',
        },
        skipButtons: {
          data: '10-20,30-40',
          type: 'intro',
        },
        playerSingleUrl: '/assets/js/app.player_single.abc123.js',
      });
    });

    it('throws a typed error when extended page does not contain url params', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(createResponse('<html></html>'));

      await expect(VideoLinks.parseLink({
        link: '//kodik.cc/video/87051/57c572172a2ccfb23234cdaf7174b20d/720p',
        extended: true,
      })).rejects.toMatchObject({
        name: 'VideoLinksError',
        code: 'parse-link-ex-invalid',
        message: 'cannot get url params',
      });
    });
  });

  describe('getActualVideoInfoEndpoint', () => {
    it('extracts base64 encoded endpoint from player script', async () => {
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValue(createResponse(`$.ajax({type:"POST",url:atob("${btoa('/custom-ftor')}")})`));

      await expect(VideoLinks.getActualVideoInfoEndpoint('/assets/js/app.player_single.abc123.js'))
        .resolves.toBe('/custom-ftor');
    });

    it('falls back to /kor when endpoint is missing', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(createResponse('no endpoint here'));

      await expect(VideoLinks.getActualVideoInfoEndpoint('/assets/js/app.player_single.abc123.js'))
        .resolves.toBe('/kor');
    });
  });

  describe('getLinks', () => {
    it('fetches video info and decodes encrypted sources', async () => {
      const decodedSource = 'https://cdn.example.test/video.mp4';
      const videoInfo = {
        links: {
          '720': [
            {
              src: encodeVideoSource(decodedSource),
              type: 'mp4',
            },
          ],
        },
      };
      const fetchMock = vi.spyOn(globalThis, 'fetch')
        .mockResolvedValue(createResponse(JSON.stringify(videoInfo), 'application/json'));

      const links = await VideoLinks.getLinks({
        link: '//kodik.cc/video/87051/57c572172a2ccfb23234cdaf7174b20d/720p',
      });

      const [url] = fetchMock.mock.calls[0] as [URL];
      expect(url.origin).toBe('https://kodik.cc');
      expect(url.pathname).toBe('/ftor');
      expect(url.searchParams.get('type')).toBe('video');
      expect(url.searchParams.get('id')).toBe('87051');
      expect(url.searchParams.get('hash')).toBe('57c572172a2ccfb23234cdaf7174b20d');
      expect(links).toEqual({
        '720': [
          {
            src: decodedSource,
            type: 'mp4',
          },
        ],
      });
    });

    it('throws when video info response is not json', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(createResponse('not json'));

      await expect(VideoLinks.getLinks({
        link: '//kodik.cc/video/87051/57c572172a2ccfb23234cdaf7174b20d/720p',
      })).rejects.toBeInstanceOf(VideoLinksError);
    });

    it('throws when video info response has no links object', async () => {
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValue(createResponse(JSON.stringify({ links: null }), 'application/json'));

      await expect(VideoLinks.getLinks({
        link: '//kodik.cc/video/87051/57c572172a2ccfb23234cdaf7174b20d/720p',
      })).rejects.toMatchObject({
        code: 'get-links-invalid-response',
        message: 'videoInfoJson.links is not object',
      });
    });
  });

  describe('parseSkipButtons', () => {
    it('parses skip button timelines', () => {
      expect(VideoLinks.parseSkipButtons({ data: '10-20,30-40', type: 'intro' }))
        .toEqual([
          { from: '10', to: '20' },
          { from: '30', to: '40' },
        ]);
    });
  });
});
