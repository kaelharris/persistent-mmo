# 07 — Merge Plan (WarEra → Aegis Kingdoms)

## Reality check

WarEra's domain model and Aegis's are not the same:

| | WarEra | Aegis (`persistent-mmo`) |
| --- | --- | --- |
| IDs | 24-char ObjectIds | `uuid` for users, `integer` for countries/regions/items |
| Identity | OAuth/OTP only, cookie session | email+password via Supabase Auth |
| Geography | 742 real-world regions, TopoJSON | painterly fantasy map, numeric regions |
| Combat | 15-round battle walls, damage ticks, orders, bounties | PvE expeditions + battle records |
| Economy | item codes, quality tiers, market orders | item templates, marketplace offers |
| Persistence | WarEra's servers | Supabase or localStorage mock |

A direct "swap the backend" is therefore an **adapter** job, not a schema copy. Three viable scopes:

## Option A — Live proxy repository (fastest proof)

Add `WarEraGameRepository` + `/api/warera` proxy. The Aegis UI renders live WarEra data; mutations call WarEra. Nothing is stored locally.

**Pros:** days, not weeks; validates which Aegis screens actually survive contact with real data.
**Cons:** every request is rate-limited (100/min/IP), latency-bound, and WarEra schema changes break you. Single-tenant unless you build per-user cookie jars.

## Option B — Mirrored world, live player (recommended)

A background sync worker mirrors **public** WarEra data (countries, regions, map, battles, market, config, rankings) into Supabase/JSON on a schedule. Personal state goes through the live proxy. The Aegis UI reads local tables for the world and the proxy for the player.

**Pros:** fast, stable world reads; the rate limit only affects one player; you own a cache you can inspect.
**Cons:** sync drift; two sources of truth; still dependent on WarEra for gameplay writes.

## Option C — Native fork

Reimplement mechanics on Supabase using WarEra's published config as the balance source. WarEra is then a design reference only.

**Pros:** full control, no rate limit, can diverge.
**Cons:** months; every formula is server-side and must be re-derived/balanced.

**Recommendation:** A → B. Do C only for systems you must change (fantasy map, guilds).

## Integration architecture (Option A/B)

```
Browser (Aegis UI)
   │  same-origin fetch
   ▼
Next.js route  /api/warera/[...proc]
   │  session jar (encrypted, httpOnly)
   ▼
WarEraApiClient  ── token bucket 100/min ──►  api2-6.warera.io/trpc/*
   │
   └─ 401 → refresh / re-auth prompt
```

### Why a server proxy

- WarEra cookies are HttpOnly on `.warera.io`; the browser can’t read or forward them to a different origin.
- CORS only allows `https://app.warera.io`, so a locally hosted Aegis build cannot call the API directly.
- The proxy centralizes rate limiting, caching, shard failover, and cookie encryption.

### Session storage

1. `POST /api/warera/session/start` `{ email, captchaToken, countryId }`
   - calls `auth.connect`
   - stores `{ wareraUserId, email, setCookies }` in an encrypted httpOnly cookie (AES-256-GCM, key in env `WARERA_SESSION_KEY`).
2. `POST /api/warera/session/verify` `{ code }`
   - calls `auth.tryCode` with the jar; replaces the pending cookie with the authenticated jar.
3. `POST /api/warera/session/logout`
4. `GET /api/warera/session` → `{ connected, username }` via `user.getMe`.

Cookie jars are `Map<name, value>` plus expiry; serialize as JSON, encrypt, keep server-side in the cookie. Cap at ~3.5 KB.

### Rate limiting & caching

- Central token bucket per WarEra account: 90/min (headroom under 100).
- Cache GET-equivalent queries: world 60–300 s, battles 10 s, personal 5 s, config 1 h.
- Batch up to 50 **same-type** procedures per HTTP request.
- On `429`, exponential backoff with jitter; surface a friendly "game busy" state.

### Shard failover

Reuse WarEra's own pattern: ordered hosts `api2..api6`, drop a host for 60 s after a network error, retry once, then fail.

## Entity mapping (for `WarEraGameRepository`)

IDs are converted with a stable 31-bit FNV-1a hash of the ObjectId, stored in `warera_id_map(kind, warera_id, numeric_id)` to resolve collisions. Item codes map the same way.

| WarEra | Aegis | Notes |
| --- | --- | --- |
| `country` | `Country` | `id=hash(_id)`, `name`, `local_currency_reserve=money`, `vat_rate=taxes.market`, `income_tax_rate=taxes.income`, `gold_reserve≈0` |
| `region` | `Region` | `id=hash(_id)`, `country_id=hash(country)`, `production_bonus=development/100`, `travel_cost=energyCostPerAction` |
| `user.getMe` | `Profile` + `PlayerStats` + `Currencies` | `id=_id`, `citizenship_country_id=hash(country)`, `current_region_id=hash(region)`, `leveling.level`, `energy.currentBarValue`, `attack.total`, `production.total`, money from inventory |
| `items` config | `ItemTemplate` | `id=hash(code)`, `type`, `rarity`, `base_value` from market price, `attributes` from `dynamicStats`/`flatStats` |
| inventory `basics` | `InventoryItem` | one row per code, `quality=1` |
| inventory `weapons/equipments` | `Equipment` + `InventoryItem` | `state` → durability |
| `company` | `Company` | `owner_id=user`, `region_id=hash(region)`, `item_template_id=hash(itemCode)` |
| `battle` | `Battle` | `id=_id`, region/countries hashed, sides as factions |
| `war` | `War` | sides hashed |
| `law` | `Bill` | `data.type` → bill type, votes → yes/no |
| `election` | `Election` + `Candidate` | candidates hashed |
| `article` | `Article` | HTML content as-is |
| `conversation` | `ConversationThread` | type/tag mapping |
| `gameConfig` | `LiveOpsConfig` + constants | import, don’t hardcode |
| `map.getMapData` | map render source | TopoJSON + attack lines |

Unmapped Aegis concepts (quests, seasons, guilds/coalitions, PvE enemies, tickets) have no WarEra equivalent: return `[]`, `null`, or a local fallback.

## Method mapping (representative)

| `IGameRepository` | WarEra call |
| --- | --- |
| `getProfile` | `user.getUserById` |
| `getPlayerStats` | `user.getMe` |
| `getCurrencies` | `inventory.getById` (`money`) |
| `getRegions` / `getCountries` | `region.getRegionsObject` / `country.getAllCountries` |
| `getInventory` | `inventory.getById` |
| `getItemTemplates` | `gameConfig.getGameConfig().items` |
| `getMyCompanies` | `company.getManageableCompanies` |
| `getActiveBattles` | `battle.getSortedActiveBattles` + `battle.getById` |
| `travelToRegion` | `user.moveToRegion` |
| `fightInBattle` | `roundDamages.hit` |
| `createMarketListing` | `tradingOrder.createOrder` (`type: 'sell'`) |
| `equipItem` / `unequipItem` | `user.equipItems` / `inventory.equippedItems` |
| `voteOnBill` | `law.voteLaw` |
| `voteForCandidate` | `election.vote` |
| `sendDirectMessage` | `message.createMessage` |
| `getPoliticalParties` | `party.getById` per ID (no list endpoint; derive from elections) |

Anything without a mapping returns `{ success: false, error: 'Not supported by WarEra provider' }`.

## Files to add

```
frontend/services/warera/
  client.ts            # server-side tRPC client, jar, bucket, shards
  session.ts           # encrypted cookie jar
  ids.ts               # ObjectId → stable numeric id
  map.ts               # WarEra DTO → Aegis entity mappers
  WarEraGameRepository.ts
  WarEraAuthRepository.ts
frontend/app/api/warera/
  [...proc]/route.ts   # authenticated proxy
  session/start/route.ts
  session/verify/route.ts
  session/logout/route.ts
frontend/services/repository/provider.ts   # add 'warera' branch
```

## Phased delivery

1. **Proxy + read adapter** — world/regions/countries/map/battles/inventory/profile render in Aegis.
2. **Player mutations** — travel, hit, equip, market order, votes, chat.
3. **Auth bridge** — Turnstile + OTP UI, per-user jars.
4. **Mirror worker** — public data into Supabase with diffing.
5. **Optional native fork** — replace hot paths (battle, market) with local logic.

## Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| 100 req/min/IP | app unusable under load | cache, batch, mirror, backoff |
| No official API contract | silent breakage | schema snapshots + contract tests against `openapi.json` |
| Cookie session expiry | random logouts | detect 401, re-auth flow, jar refresh |
| Captcha on every auth | onboarding friction | embed Turnstile with WarEra sitekey, or host the login page |
| Schema drift (client beta) | mapper breaks | version pin (`0.17.4-beta`), alert on shape changes |
| ToS / anti-bot | possible blocks | conservative rate, realistic headers, no scraping bursts |
| ID collisions | wrong entity | persistent id map + collision suffix |
| Timezone/day boundaries | off-by-one dailies | use WarEra `gameConfig.getDates`, not local time |

## Non-goals

- Reusing WarEra accounts as Aegis Supabase identities (separate systems).
- Writing to WarEra from a different origin without the proxy.
- Copying WarEra art assets (separate licensing).
