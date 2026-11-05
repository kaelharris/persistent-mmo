# WarEra Backend — Reverse Engineering Dossier

Target: `https://app.warera.io` (client `v0.28-beta`) and its API `https://api2-6.warera.io` (OpenAPI title `WarEra API 0.17.4-beta`).

Purpose: document WarEra's backend protocol, auth, data model, and game configuration so it can be adapted into **Aegis Kingdoms / persistent-mmo** through the existing repository/provider abstraction.

## Status

| Area | State |
| --- | --- |
| Transport / shards / batching | Confirmed |
| Auth flow (Google, Discord, email OTP, Turnstile) | Confirmed, session captured |
| Public endpoint catalogue (OpenAPI) | 37 endpoints archived |
| Full tRPC procedure surface | 318 procedures across 70 routers |
| Input schemas | Recovered by error probing (required fields, enums, literals) |
| Entity models | Captured for player, inventory, company, battle, war, law, election, article, region, country |
| Game config | Full 39 KB balance/config tree archived |
| Realtime | Centrifugo WSS + JWT/subscription-token scheme |
| Merge implementation | Not started — see `07-merge-plan.md` |

## Method

All evidence is from the shipped client bundle and live API responses captured with an authenticated session (player `Kaelharris`, id `6a4164be5155ab5fecbc74ff`) on 2026-11-04.

- `openapi.json` — public spec served at `https://api2.warera.io/openapi.json`.
- `procedures.json` / `procedures.txt` — every tRPC procedure referenced by the client (`*.useQuery`/`*.useMutation` call sites).
- `routes.txt` — every page route from the Next.js build manifest.
- `gameconfig.json` — `gameConfig.getGameConfig` full payload.
- `samples/` — representative responses for every major entity.

## Confidence labels

- **Observed** — directly returned by the API or present in the shipped bundle.
- **Inferred** — derived from field names, enums, config keys, or cross-referencing; not proven by server code.
- **Unknown** — not established (server internals, exact formulas, session TTL, cookie attributes).

## Legal / operational notes

WarEra publishes a public OpenAPI document and a public API, but no SLA. The API is rate limited (100 req/min per IP as returned in `ratelimit-*` headers), sharded across five hosts, and the auth routes are captcha-gated. Reuse for a separate game should assume the API can change without notice (client already at v0.28-beta with frequent changes). Do not redistribute captured user data beyond the samples here.

## Files

1. `01-protocol.md` — transport, shards, batching, envelopes, errors, rate limits.
2. `02-auth.md` — OAuth/OTP flow, captcha, session and realtime tokens.
3. `03-api-catalog.md` — routers and procedure catalogue with recovered schemas.
4. `04-data-models.md` — entity shapes and ID conventions.
5. `05-game-config.md` — balance tree, item catalogue, progression and battle constants.
6. `06-realtime.md` — Centrifugo channels and message types.
7. `07-merge-plan.md` — integration options, entity mapping, risks.
8. `08-evidence.md` — capture index, unknowns and confidence.
