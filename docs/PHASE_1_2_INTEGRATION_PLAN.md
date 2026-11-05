# Aegis Kingdom — Phase 1 & 2 Integration Plan

**Status:** Proposed — awaiting approval before any implementation  
**Scope:** Phase 1 (50–60 province medieval map pipeline) + Phase 2 (deterministic simulation kernel)  
**Repository:** `/Users/hamzaelmakhfi/Documents/AI/persistent-mmo`  
**Verified against:** source tree, Supabase migrations 00–14, `IGameRepository`, entity types, mock & Supabase providers, tests, folder-structure doc

---

## 1. Current-State Dependency Inventory (verified against source)

### Files that exist and are relevant

| Path | What it provides | Relevance to Phase 1/2 |
| --- | --- | --- |
| `frontend/services/repository/IGameRepository.ts` | Full interface (411 lines), phases 1–12 | Phase 2 simulation kernel will add methods here |
| `frontend/services/repository/IAuthRepository.ts` | `SessionUser`, `IAuthRepository` | Auth stays unchanged |
| `frontend/services/repository/provider.ts` | Switches mock ↔ supabase by env; `activeProvider` export | Keep untouched; WarEra adapter deliberately NOT wired here |
| `frontend/services/repository/MockGameRepository.ts` | localStorage-backed `IGameRepository` impl (1096 lines) | Must keep working; Phase 1/2 additions should be additive or no-op in mock |
| `frontend/services/repository/SupabaseGameRepository.ts` | Supabase-backed `IGameRepository` impl via RPC (1737+ lines) | Must keep working; new tables/RPCs get Supabase reads + mock fallbacks |
| `frontend/types/entities.ts` | All shared entity TS interfaces (1181 lines) | Phase 1/2 need new interfaces appended (province, edge, control, tick, command, outbox) |
| `frontend/hooks/useGame.ts` | React hook wrapping `gameRepository` | May need new hooks for province/control/tick reads |
| `frontend/app/(game)/map/page.tsx` | Existing map route | Phase 1 map UI will live here or a sibling route |
| `frontend/app/(game)/world/page.tsx` | Existing world route | Reference for how existing map-like pages are built |
| `supabase/migrations/20260629000000_init_core.sql` | `countries`, `regions`, `profiles`, `player_stats`, `currencies`, `inventories`, `equipment`, `audit_logs`, RLS, `handle_new_user` trigger | Base tables Phase 1/2 build on |
| `supabase/migrations/20260629000001_world_economy.sql` | `resources`, `experience_tables`, `resource_spawn_tables`, `player_resources`, `energy_history`, `gather_logs`, `rpc_gather_resource` | Economy reads used by simulation |
| `supabase/migrations/20260629000006_military_combat.sql` | `battles`, `enemy_templates`, `battle_rounds`, `player_combat_skills`, PvE/PvP RPCs | Combat patterns Phase 2 can mirror |
| `supabase/migrations/20260629000008_warfare_conquest.sql` | `wars`, `military_regions`, `army_units`, `supply_routes`, `peace_treaties`, declare/mobilize/move/engage/peace RPCs | Territory/war patterns Phase 2 mirrors |
| `supabase/migrations/20261029160418_atomic_expedition_combat.sql` | `private.combat_results`, idempotent `resolve_pve_battle`, `action_costs`, `travel_to_region` RPC | **Model for Phase 2 kernel** (single-transaction resolve + idempotency key) |
| `supabase/migrations/20260629000005_living_world.sql` | `regional_economies`, `world_events`, `simulation_logs`, `scheduler_jobs`, `acquire_scheduler_lock` | Scheduler lock pattern Phase 2 reuses |
| `supabase/migrations/20260629000007_politics_government.sql` | Parties, elections, bills, government terms | Reference for governance tables |
| `tests/combat-rpc.test.ts` | PGlite-based atomic combat test (idempotency, rollback, isolation) | **Test template for Phase 2 kernel** |
| `tests/concurrency.test.ts` | Parallel travel energy-lock test (Supabase integration, skip-gated) | **Test template for Phase 2 concurrency** |
| `tests/rls.test.ts` | RLS policy tests | New Phase 1/2 tables need RLS tests here |
| `tests/fixtures/combat-schema.sql` | Minimal PGlite schema fixture | Phase 2 kernel test needs a similar fixture |
| `tests/setup.ts` | Supabase test-client helper | Reused by new integration tests |
| `docs/07_folder_structure.md` | Intended feature-based layout (`components/game/`, `stores/`) that does **not** yet exist | Phase 1 map components would go here |

### What does NOT exist (gap list for Phase 1/2)

| Missing item | Why it matters |
| --- | --- |
| `province_edges` / weighted adjacency graph table | No land/pass/sea/strait edges with cost, season, traversal rules |
| `map_versions`, `worlds` tables | No versioned TopoJSON geometry storage |
| `province_control` / `control_events` separate audit | `military_regions` exists but ties 1:1 to regions with no adjacency or control history |
| `simulation_ticks` table with stable tick IDs | `scheduler_jobs` exists but serves a different purpose |
| `commands` table with idempotency keys | No durable command ledger |
| `outbox_events` table | No reliable realtime projection feed |
| Deterministic simulation kernel module (UI-independent rules) | All game logic currently lives in PL/pgSQL RPCs or mock methods |
| Province geometry (TopoJSON) source files | No medieval map data in repo |
| `components/game/` map renderer components | Folder documented but not created |

### Compatibility boundaries (must not break)

- `MockGameRepository` and `SupabaseGameRepository` must continue to satisfy the full `IGameRepository` interface.
- `frontend/app/api/warera/*` and `frontend/services/warera/*` remain separate and are NOT imported by the provider or any game page.
- Existing Supabase RPCs (`travel_to_region`, `rpc_gather_resource`, `rpc_execute_pve_battle`, etc.) remain unchanged.
- All Supabase tests remain `skipIf(RUN_SUPABASE_INTEGRATION !== '1')`; new PGlite unit tests run in CI without a Supabase instance.

---

## 2. Gap Analysis: what Phase 1 & 2 require that is absent

### Phase 1 — Map pipeline (50–60 province western Mediterranean slice)

| Need | Existing? | Additive change |
| --- | --- | --- |
| Versioned world + map_version tables | No | New migration |
| Province table with geometry ref, terrain, climate, culture, resources, development, port flag | Partial: `regions` exists (10 seeded) but no geometry/localization/terrain/culture/port columns | New `provinces` table OR extend `regions`; plan: new `provinces` to avoid touching existing region semantics |
| Province edges (weighted adjacency) with mode/cost/season/traversal | No | New `province_edges` table |
| TopoJSON geometry source files | No | New `database/schemas/` or `assets/maps/` files |
| Map renderer components (pan/zoom/select, province highlighting, political/terrain/economy/war modes) | `map/page.tsx` exists; no `components/game/` map blocks | New components under `frontend/components/game/map/` (per folder_structure.md intent) |
| Province read API + repository methods | `getRegions()` exists | New `getProvinces(worldId, mapVersionId)` / `getProvinceEdges(worldId)` on `IGameRepository` |
| RLS on new geography tables | N/A | New migration adds RLS (select public, admin write) |

### Phase 2 — Deterministic simulation kernel

| Need | Existing? | Additive change |
| --- | --- | --- |
| `simulation_ticks` table (tick ID, world ID, ruleset version, seed, status, started/ended at) | No | New migration |
| `commands` table (idempotency key, actor, type, payload, status, applied_at) | No | New migration |
| `outbox_events` table (tick ID, seq, type, payload, published flag) | No | New migration |
| Deterministic rules module (PRNG-seeded economy/combat/politics) | No | New server-side module (`frontend/services/simulation/` or `backend/functions/shared/`) |
| Tick runner (exactly-once, catch-up, no double-apply) | Partial: `scheduler_tick()` + `scheduler_jobs` lock exist | New migration + RPC or edge function; reuse `acquire_scheduler_lock` pattern |
| Catch-up without double rewards | No | Kernel logic in migration/function |
| Replay from snapshot + events | No | Kernel reads `commands` + `outbox_events` |
| Caps/sinks (no infinite production, negative balances, ghost units) | Partial: `player_resources.quantity >= 0` check exists | Kernel enforces; new migration check constraints |
| PGlite unit test for kernel (idempotency, rollback, isolation) | `tests/combat-rpc.test.ts` is the template | New `tests/simulation-kernel.test.ts` |
| Concurrency test (parallel commands on one province) | `tests/concurrency.test.ts` is the template | Extend or new test |

---

## 3. Exact File-by-File Change Plan

### Phase 1 — Map pipeline

**New files**

| Path | Purpose |
| --- | --- |
| `supabase/migrations/202611XX000000_medieval_geography.sql` | Create `worlds`, `map_versions`, `provinces`, `province_edges`; seed 50–60 western-Mediterranean provinces; RLS; indexes |
| `database/schemas/medieval_world_v1.topojson` | Versioned TopoJSON geometry for the 50–60 province slice |
| `frontend/types/entities.ts` (append) | `World`, `MapVersion`, `Province`, `ProvinceEdge`, `ProvinceControl`, `ControlEvent` interfaces |
| `frontend/services/repository/province-reads.ts` (new module) | Read-only helpers: `getProvinces`, `getProvinceEdges`, `getProvinceControl` (used by both providers) |
| `frontend/components/game/map/ProvinceMap.tsx` | Canvas/SVG map renderer: pan/zoom, select, political/terrain/economy/war mode toggles |
| `frontend/components/game/map/ProvinceSelector.tsx` | Province selection + highlight |
| `frontend/components/game/map/MapModeToggle.tsx` | Mode switcher |
| `frontend/hooks/useProvinces.ts` | Hook wrapping `gameRepository.getProvinces` / `getProvinceEdges` |
| `tests/map-geometry.test.ts` | PGlite/vitest: valid polygons, reciprocal edges, no gaps, port/straight behavior |

**Modified files**

| Path | Change |
| --- | --- |
| `frontend/services/repository/IGameRepository.ts` | Append `getProvinces`, `getProvinceEdges`, `getProvinceControl` signatures |
| `frontend/services/repository/MockGameRepository.ts` | Implement the three reads from static seeded data (no DB change) |
| `frontend/services/repository/SupabaseGameRepository.ts` | Implement the three reads via Supabase `select` |
| `frontend/app/(game)/map/page.tsx` | Compose the new map components (or leave existing page and add a `/world/map` route — decide at approval) |
| `frontend/services/repository/provider.ts` | **No change** (intentionally) |

### Phase 2 — Deterministic simulation kernel

**New files**

| Path | Purpose |
| --- | --- |
| `supabase/migrations/202611XX000001_simulation_kernel.sql` | `simulation_ticks`, `commands`, `outbox_events`; unique tick/command keys; RLS; indexes; `scheduler_tick()` enhancement or new `resolve_tick()` RPC |
| `frontend/services/simulation/rules.ts` | Deterministic ruleset: economy tick, combat round, political deadline, PRNG-seeded outcomes, caps/sinks |
| `frontend/services/simulation/kernel.ts` | Transactional command application, idempotency, snapshot + replay, tick advancement |
| `frontend/services/simulation/index.ts` | Exports |
| `tests/simulation-kernel.test.ts` | PGlite test: idempotent command, rollback on failure, replay determinism, concurrency lock |
| `tests/simulation-concurrency.test.ts` | Parallel commands on one province; exactly-one winner |

**Modified files**

| Path | Change |
| --- | --- |
| `frontend/services/repository/IGameRepository.ts` | Append `executeSimulationTick` already exists — align its contract to the kernel (tickId, rulesetVersion); add `submitCommand(idempotencyKey, type, payload)` |
| `frontend/services/repository/MockGameRepository.ts` | Implement `submitCommand` / tick reads against localStorage (deterministic, no network) |
| `frontend/services/repository/SupabaseGameRepository.ts` | Implement `submitCommand` via `commands` insert + RPC; `executeSimulationTick` calls kernel RPC |
| `supabase/migrations/20260629000013_politics_automation.sql` | **No change** — existing `execute_simulation_tick()` stays; new kernel RPC is additive |

---

## 4. Compatibility Checklist (verified)

| Component | Phase 1/2 impact | Verdict |
| --- | --- | --- |
| `MockGameRepository` | Needs 3 new read methods + command/tick stubs | Additive; existing tests unaffected |
| `SupabaseGameRepository` | Needs 3 new read methods + command/tick RPC wiring | Additive; existing RPCs untouched |
| `provider.ts` | No change | Unaffected |
| `frontend/app/api/warera/*` | Not imported anywhere in game flow | Unaffected (stays separate per plan §2) |
| `frontend/types/entities.ts` | Append-only new interfaces | Unaffected |
| `tests/combat-rpc.test.ts`, `concurrency.test.ts`, `rls.test.ts` | No modification | Unaffected |
| Existing Supabase RPCs (`travel_to_region`, `rpc_gather_resource`, `rpc_execute_pve_battle`, `scheduler_tick`) | Not modified | Unaffected |
| `frontend/app/(game)/map/page.tsx` | Compose new components | Low risk; existing page preserved |

---

## 5. Smallest Playable Vertical Slice (first milestone)

On the 50–60 province western Mediterranean map:

1. New player registers → profile in `profiles`, citizenship in a starting country, located in a starting province.
2. Player opens the province map, selects a province, gathers grain/iron (Phase 2 economy tick).
3. Player buys/sells on the market (existing `createMarketListing`/`createMarketOrder`).
4. Player travels by land edge or a permitted strait to a neighboring province (existing `travel_to_region` RPC, validated against new `province_edges` graph).
5. Player joins a war, fights a battle (existing `rpc_engage_military_battle` or PvE), and a province changes owner (new `province_control` write via kernel).
6. Opposing player reconnects and sees updated ownership.
7. Server restart retains inventory, orders, treasury, armies, war state, territorial ownership.

**Exit criterion:** two authenticated players complete the economy → travel → war → border-change loop end to end; a restart preserves all state.

---

## 6. Acceptance Tests

### Phase 1 (map geometry)
- Every province has valid TopoJSON geometry and a stable ID.
- Each intended connection is reciprocal (edge A→B implies B→A) and legal (mode/cost set).
- Ports and straits behave correctly (sea traversal only where edge permits).
- Owner highlighting matches `province_control` DB state.
- Touch interactions work at 320, 375, 390 px and desktop widths.
- Test file: `tests/map-geometry.test.ts` (PGlite + vitest).

### Phase 2 (determinism + economy + military + concurrency)
- **Determinism:** same seed + commands + ruleset version → identical results; replay works after restart; failed/out-of-order tick retries do not duplicate effects. Test: `tests/simulation-kernel.test.ts`.
- **Economy:** no double spending, negative balances, duplicate fills, orphaned assets, or unaccounted currency across ≥10,000 scripted commands and multi-day simulated ticks.
- **Military:** travel respects graph/cost; invalid positions and unauthorized armies rejected; battle results repeatable; only authorized victory/conquest changes control.
- **Concurrency:** multiple players trade/fight/update one province concurrently without lost updates (parallel commands → exactly one applies).
- **Security:** server-side validation only; scoped privileges; RLS on new tables; no broad mutation proxy; no third-party credentials in production.

---

## 7. First task — STOP for approval

Per the plan's §10, implementation does **not** begin until you approve this integration plan. Once approved, the first implementation task will be:

> Create migration `202611XX000000_medieval_geography.sql` (`worlds`, `map_versions`, `provinces`, `province_edges`, seed 50–60 provinces, RLS) + TopoJSON source + entity interfaces + repository read methods, wired behind `IGameRepository` with mock and Supabase implementations, plus `tests/map-geometry.test.ts`.

Please confirm:
1. Whether to extend `regions` or create a new `provinces` table for Phase 1 geometry.
2. Whether Phase 1 map UI goes in `frontend/app/(game)/map/page.tsx` or a new route.
3. Whether the simulation kernel lives in `frontend/services/simulation/` (Next.js server) or `backend/functions/` (Deno edge functions), per existing backend conventions.
4. Approval to proceed with Phase 1 implementation.
