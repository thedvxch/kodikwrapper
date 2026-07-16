<p align="center"><img src="https://raw.githubusercontent.com/thedvxch/kodikwrapper/master/.github/logo.svg"></p>
<p align="center">
    <a href="https://npmx.dev/package/kodikwrapper"><img src="https://img.shields.io/npm/v/kodikwrapper.svg?style=flat-square" alt="npm version"></a>
    <a href="https://npmx.dev/package/kodikwrapper"><img src="https://img.shields.io/npm/dt/kodikwrapper.svg?style=flat-square" alt="npm downloads"></a>
</p>

> kodikwrapper — это реализация api kodikapi.com для node.js

> [!NOTE]
> начиная с v3.0.0 поддерживается только node.js 20.0.0+

| 📖 [refs](https://gh.dvxch.link/kodikwrapper) | 📖 [kodik api документация (требуется авторизация)](https://bd.kodikres.com/api/info) |
|-------------------------------------------------------------------------|-----------------------------------------------------------------------------------:|

## установка
```bash
npm i kodikwrapper
yarn add kodikwrapper
pnpm add kodikwrapper
```

## использование

### класс client
класс `client` реализует только публичное api из [документации kodik api](https://bd.kodikres.com/api/info). это означает, что методы будут называться одинаково.

доступные методы: `search`, `list`, `translations`, `translationsV2`, `genres`, `countries`, `years`, `qualities`, `qualitiesV2`. каждый принимает объект параметров и возвращает `promise`. смотрите все параметры в [📖 refs](https://gh.dvxch.link/kodikwrapper), [документации kodik api](https://bd.kodikres.com/api/info) или с помощью подсказок в ide.

```javascript
import { Client } from 'kodikwrapper'; // esm / typescript
// или
const { Client } = require('kodikwrapper'); // commonjs

// создание клиента
const client = new Client({
  token: '<public token>',
});
// или
const client = Client.fromToken('<public token>');

client.search({
  limit: 1,
  title: 'судьба ночь схватки прикосновение небес',
})
  .then((response) => response.results.shift())
  .then((material) => console.log(material));

/**
    {
      id: 'movie-27068',
      type: 'anime',
      link: '//aniqit.com/video/27068/35bd2611080a6add3e209be3b76cd16d/720p',
      title: 'Судьба: Ночь схватки. Прикосновение небес',
      title_orig: "Gekijouban Fate/Stay Night: Heaven's Feel - I. Presage Flower",
      translation: { id: 767, title: 'SHIZA Project', type: 'voice' },
      year: 2017,
      quality: 'BDRip 720p',
      // ...
    }
*/
```

#### другие примеры методов

```javascript
// список материалов постранично
const { results, total, next_page } = await client.list({ limit: 100 });

// справочники
const genres = await client.genres();
const translations = await client.translations();
const years = await client.years();
const countries = await client.countries();

// поиск по внешнему id
const byShikimori = await client.search({ shikimori_id: '25537' });
```

### класс videolinks

класс `videolinks` используется для получения прямых ссылок на файлы с kodik и получения дополнительной информации о материале (тайминги для пропуска опенингов/эндингов, озвучку и др.), как это делает их плеер.

статические методы:
- `getLinks({ link, videoInfoEndpoint?, fetcher? })` — прямые ссылки на видео.
- `parseLink({ link, extended?, fetcher? })` — разбор ссылки; при `extended: true` парсит доп. данные со страницы плеера.
- `getActualVideoInfoEndpoint(playerSingleUrl, fetcher?)` — актуальный endpoint для ссылок.
- `parseSkipButtons(skipButtons)` — тайминги пропуска в удобном виде.
- `normalizeKodikLink(input, playerDomain?)` — приведение ссылки к абсолютной.
- `config({ playerDomain?, videoInfoEndpoint?, fetcher? })` — задать дефолты один раз для всех методов.

```javascript
import { Client, VideoLinks } from 'kodikwrapper';

const client = Client.fromToken('<public token>');

client.search({
  limit: 1,
  title: 'судьба ночь схватки прикосновение небес',
})
  .then((response) => response.results.shift())
  .then(async (material) => {
    if (!material) throw new Error('не найдено');

    const links = await VideoLinks.getLinks({
      link: material.link,
    });

    console.log(links);
  });

/**
 {
   "360": [{ "src": "//cloud.kodik-storage.com/.../360.mp4:hls:manifest.m3u8", "type": "application/x-mpegURL" }],
   "480": [{ "src": "//cloud.kodik-storage.com/.../480.mp4:hls:manifest.m3u8", "type": "application/x-mpegURL" }],
   "720": [{ "src": "//cloud.kodik-storage.com/.../720.mp4:hls:manifest.m3u8", "type": "application/x-mpegURL" }]
 }
 */
```

#### актуальный endpoint для получения ссылок

недавно kodik начал часто менять endpoint для получения прямых ссылок, поэтому в прошлых обновлениях (до v3.0.0) я добавил поле `videoInfoUrl` (начиная с v3.0.0 — `videoInfoEndpoint`) для его замены.

так как они могут снова изменить endpoint, начиная с v3.0.0, в класс `videolinks` добавлен метод `getActualVideoInfoEndpoint` для получения актуального endpoint, в который необходимо передать ссылку на чанк с плеером. получить ссылку на чанк можно с помощью метода `parseLink` с переданным параметром `extended: true`.

```javascript
const getLinksWithActualEndpoint = async (link) => {
  const parsedLink = await VideoLinks.parseLink({
    link, extended: true,
  });

  if (!parsedLink.ex.playerSingleUrl) throw new Error('не могу получить ссылку на чанк с плеером');

  const endpoint = await VideoLinks.getActualVideoInfoEndpoint(parsedLink.ex.playerSingleUrl);

  const links = await VideoLinks.getLinks({
    link, videoInfoEndpoint: endpoint,
  });

  return links;
};

getLinksWithActualEndpoint('//aniqit.com/video/27068/35bd2611080a6add3e209be3b76cd16d/720p')
  .then(console.log);
```

#### дефолты через config

чтобы не передавать `videoInfoEndpoint`, домен плеера или `fetcher` в каждый вызов, задайте их один раз:

```javascript
VideoLinks.config({
  playerDomain: 'kodikplayer.com',
  videoInfoEndpoint: '/ftor',
});

// теперь методы используют эти значения по умолчанию
const links = await VideoLinks.getLinks({ link: material.link });
```

#### кастомный fetcher

`client`, `videolinks` и `getPublicToken` принимают свой `fetcher` (совместимый с `fetch`) — удобно для прокси, кастомных заголовков или тестов.

```javascript
import { Client, VideoLinks, getPublicToken } from 'kodikwrapper';

const fetcher = (url, init) => fetch(url, { ...init, headers: { 'user-agent': 'my-app' } });

const client = new Client({ token: '<public token>', fetcher });
const links = await VideoLinks.getLinks({ link: '<link>', fetcher });
```

### получение публичного токена

`getPublicToken` вытягивает публичный токен из скрипта плеера kodik.

```javascript
import { Client, getPublicToken } from 'kodikwrapper';

const token = await getPublicToken();
const client = Client.fromToken(token);
```
