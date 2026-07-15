# changelog

all notable changes to `kodikwrapper` land here. format loosely follows
[keep a changelog](https://keepachangelog.com), versioning is [semver](https://semver.org).

## [unreleased]

## [3.1.0] - 2026-07-15

### added
- `getPublicToken()` — pulls the public kodik token straight from the player
  script, so you can bootstrap a `Client` without hardcoding one.
- custom `fetcher` support across the board — `Client`, `VideoLinks.*` and
  `getPublicToken` accept a `fetch`-compatible function (proxies, headers, mocks).
- `VideoLinks.config({ playerDomain, videoInfoEndpoint, fetcher })` — set the
  defaults once instead of threading them through every call.

### changed
- **tooling**: dropped eslint + `@stylistic` + `@typescript-eslint` in favour of
  [biome](https://biomejs.dev) (code style preserved).
- **deps**: bumped tsup 8, typedoc 0.28, vitest 4 (+ vite 8 peer), `@types/node` 20.
- **node**: minimum is now node.js 20 (`engines.node >= 20`), ci runs on 20.
- **ci**: `publish.yml` now uses npm [trusted publishing](https://docs.npmjs.com/trusted-publishers)
  (oidc + provenance) — no `NPM_TOKEN` secret anymore.
- **docs**: readme rewritten (lowercase, full method list, more examples).
- refs/github links moved from `bd.kodik.biz` → `bd.kodikres.com` and
  `thedvxchsquad` → `thedvxch`.

### fixed
- `VideoLinks.getLinks` no longer treats a `null` `links` field as a valid object
  — it now throws a typed `get-links-invalid-response` error.

## [3.0.6]
- refs domain + kodik docs link fixes.

## [3.0.5] – [3.0.4]
- player / api domain updates.

## [3.0.0]
- typedoc reference + auto-published docs and package.
- renamed `videoInfoUrl` → `videoInfoEndpoint`, added `getActualVideoInfoEndpoint`.
- node.js 18+ baseline (now superseded by 20 above).

[unreleased]: https://github.com/thedvxch/kodikwrapper/compare/v3.1.0...HEAD
[3.1.0]: https://github.com/thedvxch/kodikwrapper/compare/v3.0.2...v3.1.0
[3.0.0]: https://github.com/thedvxch/kodikwrapper/releases/tag/v3.0.0
