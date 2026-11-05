# 08 — Evidence Index & Unknowns

## Capture context

| Field | Value |
| --- | --- |
| Date | 2026-11-04 |
| Target client | `https://app.warera.io` — build `1793733976149`, UI `v0.28-beta` |
| API | `https://api2-6.warera.io`, OpenAPI `WarEra API 0.17.4-beta` |
| Session | Authenticated as player `Kaelharris` (`6a4164be5155ab5fecbc74ff`, secretId `uyb7icXVT873YRUHYo8yQvcZPLneV4_9pRFXcU2rWeU`) |
| Capture tool | OpenCode browser (Chromium 152) + curl + bundle inspection |

## Artifacts

| File | SHA-256 | Content |
| --- | --- | --- |
| `openapi.json` | `83f8aa03d5aa38311330e64073ed36bd49be6a97f729e0d05f310dc244fc19cb` | Public OpenAPI 3.0 spec, 37 paths |
| `gameconfig.json` | `d974194478dcb79a186e30f6aeac96f1d2c3cf3938f4b8ffdc06bac5daa807294` | Full balance/config tree |
| `samples/getMe.json` | `4176ee1ce7e58a6c381ff0061d52147f5f6d28fcdd156262d03982bf72641b66` | Authenticated player object |
| `samples/battle.json` | `e0dcd535de11d1ba223c072b81863d629ac70f2108e516033e67ba12d55a7d44` | Battle, live round, hit, ranking sample |
| `samples/politics.json` | `b3cc1f1a8e281590bcf6e0f84f3b762529de3f590d9b6b7c29eb12e6bce740b5` | War, law, election, mercenary, enums |
| `samples/regions.json` | `7c49de1829c8e71cbe30b4ccac1afc5807f05767cc375eeb9d25a373a8bab579` | 742 public regions |

Additional samples: `account.json`, `articles.json`, `battles.json`, `companies.json`, `company.json`, `country.json`, `events.json`, `government.json`, `mu.json`, `mus.json`, `prices.json`, `ranking.json`, `search.json`, `user_full.json`, `user_lite.json`, `users.json`.

## Endpoint evidence

- `GET https://api2.warera.io/openapi.json` → 200, OpenAPI 3.0.0.
- `GET https://api2.warera.io/health` → 200 on api2–api6.
- `POST /trpc/country.getAllCountries` `{}` → 200 with full country array (public, no cookie).
- `POST /trpc/user.getMe` `{}` without cookie → 401 `UNAUTHORIZED`.
- `POST /trpc/user.getMe` with session → 200 full profile.
- `POST /trpc/auth.connect` without valid captcha → 401 "Invalid CAPTCHA. Please try again."
- `POST /trpc/auth.connect` with a consumed but valid token + `fldubai.com` → 403 "This email domain is not allowed…".
- `POST /trpc/roundDamages.hit` `{}` authenticated → Zod array naming `roundId` and `side`.
- `POST /trpc/gameStat.getPpMoneyValue` `{}` → Zod "Expected void, received object".
- `GET /trpc/user.getMe,inventory.equippedItems?batch=1&input=…` → 200 batch.
- `POST /trpc/user.getMe,company.getManageableCompanies?batch=1` → 400 "Cannot mix procedure types in call".

## Bundle evidence

- `_app-90d4b44c9f47c314.js` (3.7 MB) contains host list, tRPC client, Centrifugo client, procedure call sites, Turnstile sitekey.
- Host list literal at ~offset 372 KB region in the bundle (match `api2.warera.io,https://api3`).
- `wss://ws.warera.io/connection/websocket` found once.
- Build manifest at `/_next/static/1793733976149/_buildManifest.js` lists 201 routes.
- `version.json` returns `{"buildId":"1793733976149"}`.

## Confidence

| Claim | Confidence | Basis |
| --- | --- | --- |
| tRPC transport, batching, error envelope | High | Direct requests |
| 100 req/min limit | High | `ratelimit-*` headers on every response |
| Auth flow (connect → tryCode; OAuth callbacks) | High | Client code + live callbacks |
| Public/protected split | High | 401 probing |
| Entity shapes | High for captured entities | Live responses |
| Damage/round formulas | Medium | Config keys + client previews; server code not seen |
| Session cookie attributes/TTL | Low | HttpOnly, not observable |
| Per-user Centrifugo channel name | Low | `user:<id>` rejected |
| Email domain policy details | Medium | Two domains confirmed rejected; whitelist not enumerated |

## Unknowns / next captures

1. Session cookie name, `SameSite`, `Secure`, rolling behaviour, TTL.
2. Exact damage formula (roll order, armor mitigation, precision/dodge thresholds, caps).
3. Tick scheduler and round-end resolution.
4. Per-user realtime channel naming.
5. Full item drop tables for `case1`/`case2`/`woodenCase`/`toolbox`.
6. Party/alliance/tournament/poll/upgrade-instance/mission/announcement models.
7. Server validation of client-supplied fields (e.g. `damages` never sent by client).
8. Official API stability policy / whether an API key exists.
9. Cloudflare WAF thresholds beyond the advertised rate limit.
10. Whether `employee.getById` API tokens can be minted from the UI (developer settings).

## Reproduce

```bash
curl -s https://api2.warera.io/openapi.json
curl -s -X POST https://api2.warera.io/trpc/country.getAllCountries \
  -H 'content-type: application/json' -d '{}'
```

Authenticated reproduction needs a browser session (OAuth/OTP + Turnstile) because the cookie is HttpOnly.
