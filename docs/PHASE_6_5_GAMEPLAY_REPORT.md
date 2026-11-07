# Phase 6.5 Gameplay Report — Local Medieval Vertical Slice (MockGameRepository)

**Scope:** A playable medieval MMO vertical slice centred on the world map. Output is labelled a *local gameplay vertical slice* backed by `MockGameRepository`. Supabase work was paused (no migrations/Docker/live-multiplayer claims). The existing simulation engine, `IGameRepository`, provider selection and marketplace matching were preserved; all changes are additive.

**Date:** 2026-11-06 (server-local run, Windows, Next.js 16.2.9, React 19)

---

## 1. Implemented improvements (fully implemented, mock-backed)

### 1.1 World map as the primary screen (`/world`)
- Map-centred layout: painted Aegis backdrop `frontend/public/assets/backgrounds/aegis-world-map.webp` (2400×1515, 0.62 MB derived from the 51.8 MB `fantasy_world_map.png`; original left in place).
- Four layers with distinct treatments:
  - **Political** — gold/realm-coloured rings + dot per province (Genesis `#b89030`, Iron `#8a3b2e`, Grain `#5f7a3a`).
  - **Geography** — green tint + terrain/subtitle in the province panel.
  - **Economy** — sky tint + resource chips (`Iron Ore · Coal`, etc.) on markers.
  - **Warfare** — red tint + `Resistance N` / `· N host(s)` badges on markers (screenshot `world-warfare-layer-desktop-1440.png`).
- Pan (drag), zoom (wheel + `−`/`+`), compass label, road overlay (`RegionEdge` graph rendered as `svg` lines), province markers with heraldic icons + labels (`frontend/lib/worldLore.ts` `PROVINCES` x/y for the 10 core provinces).
- Province panel: lore, terrain/population/owner/resistance, marching roads (`getNeighbors(regionEdges)`), Gather buttons, Travel, Recruit, links, foreign-province war controls, last-battle report card.
- Responsive: desktop map+panel side-by-side; mobile stacks map above panel (panel scrolls), sidebar becomes a fixed overlay (`!fixed` fix so `.rpg-panel-wood { position:relative }` no longer keeps a 256 px column at 390 px). Reduced-motion CSS added (`@media (prefers-reduced-motion: reduce)` kills animations/transitions).
- Verified at **1440×900** and **390×844** (headless Edge via `puppeteer-core`, `frontend/scripts/capture.cjs` + `capture-war.cjs`). Screenshots are real captures from `http://localhost:3000` with a seeded mock session.

### 1.2 Navigation
Sidebar now maps to the required destinations:
`World /world`, `Character /character`, `Economy /economy`, `Marketplace /marketplace`, `Military /military`, `Kingdom /kingdom`, `Dynasty /dynasty` (+ legacy `Quests`/`Profile` → dashboard tabs).
Legacy `/dashboard` is unchanged (its tests still compile/run). `/` and `/login` now redirect to `/world` after auth.

### 1.3 Onboarding (5 steps, real persistence)
`frontend/app/(game)/onboarding/page.tsx` wizard: **Welcome → Character Creation → Kingdom Selection → Profession Selection → Enter World**.
- Sits inside the game layout (valid JSX; the corrupted `character-creation.tsx` / `world-map.tsx` placeholders were replaced with redirect stubs).
- Saves via new repository methods `savePlayerCharacter` / `completeOnboarding` / `upgradeProfession` (additive `IGameRepository` methods; `MockGameRepository` stores `mmo_player_characters`; Supabase stubs return safe errors). Kingdom aligns `citizenship_country_id` + starting region (1→1, 2→5, 3→8) and `username`; profession bonus strings shown from `PROFESSIONS`.
- First-visit contextual tutorial on `/world` (dismissible, `localStorage aegis_world_tutorial_seen`): Travel → Gather → Marketplace → Recruit.

### 1.4 Economy loop (Gather → Produce → Sell → Earn → Upgrade)
- **Gather:** province + Economy buttons call `gather`; energy/XP/feedback (`Thou hast travelled…`, `Gathered 1 × Wood (+10 XP)`) verified live.
- **Produce:** Economy `craftItem` (Bake Bread = 2 Grain + 1 Water + 1 Coal → inventory bread; verified `Grain 10→8`, `Water 10→9`).
- **Sell:** Marketplace `listAssetForSale` (resource) / `placeBuyOrder` / `cancelListing` / `cancelOrder` with escrow refund, matching, history and fee/tax ledger. **Unchanged** `matchOrders` VAT (country 1 = 10 %) + 2 % marketplace fee.
- **Earn:** live sale matched an NPC bid: `3 × Iron Ore · TestAdmin → npc_smith, 4.5 LC · fee 0.27 · tax 1.35`, LC `1000 → 1011.88`.
- **Upgrade:** `upgradeProfession` (120 LC) → `Rank raised to 2` (LC `1011.88 → 891.88`).

NPC depth is seeded **only for real sessions** (`mmo_auth_session` matches the caller, to avoid breaking isolated unit tests): 6 NPC listings (Miller Tom, Smith Bruna, Fisher Elian, Miner Katal, Carver Simone, Herbalist Ana) + 4 NPC orders. `getMarketListings`/`getMarketOrders` resolve NPC names via `npcName()`.

Starting stocks are organic: existing 10× wood/stone/grain/water/coal unchanged (test-critical), plus back-filled 5× iron + 5× fish for older saves. New accounts start with the same 5+5.

### 1.5 Warfare (Recruit → Mobilize → March → Engage → Besiege → Conquer)
Deterministic `MockGameRepository` engine, stage-gated:
- **Recruit:** `recruitArmy` (5 Grain, 2 Iron, 3 Fish) → `Host #3 recruited (120 spears)`.
- **Mobilize:** `mobilizeArmy` (3,1,2) preserved as a separate control.
- **March:** `commandArmyMovement` validated against the 16-edge region graph (was 5). Live: `Host #3 … marching · Steel Bastion`, rations `80→70`, ammo `80→75`.
- **Engage:** `engageMilitaryBattle` fixed (war check against the *province owner*, not hardcoded country 2; defender size = `resistance × 2`). Field win never captures — resistance is clamped to **≥15** and ownership is untouched. Live vs Steel Bastion (resistance 70):
  - 120-strong host: **repelled** (86/120 left, resistance `70→58`).
  - 1000-strong host: **pyrrhic_victory** (850/1000 left, morale 85, resistance `58→46`), still Iron Union owned.
  - `MilitaryBattleReport` stored (`mmo_last_battle_report`) and rendered verbatim (rounds, casualties, `siegeRequired: true`).
- **Siege:** `initiateSiege` (same-province + war + rations, no inflation) → `progressSiege` with capped tick (`min(18, max(10, size/20))`) so a 120-host needs ~3 ticks and an 850-host ~3 ticks. `liftSiege` preserved.
- **Conquer:** on resistance 0, `owner_country_id` + `owner_name` flip immediately to Genesis Land and the army becomes `garrisoning`. The world map now derives effective owner from `militaryRegions.owner_country_id` (marker ring + panel `Owner` + `isMine`), so conquest is visible on the map without touching the static `Region.country_id`. `getMilitaryRegions()` back-fills `owner_name` from `owner_country_id` so older saves display correctly.
- **Balance change (reported):** `declareWar`/`mobilizeArmy` previously demanded 500/200/300 etc. and hardcoded `user_1`. Rebalanced to 5/2/3 (recruit/declare) and 3/1/2 (mobilize) to fit starting stocks; hardcoded `user_1`/`player_1` replaced with `getSessionUserId()` (`mmo_auth_session`). A pre-seeded `Country 1 vs 2` war remains active, so the first demonstration needs no declare click (declare still works when stocks allow).

### 1.6 Kingdom / court / dynasty
`frontend/app/(game)/kingdom/page.tsx` and `…/dynasty/page.tsx` (replacing redirect stubs):
- Kingdom: ruler (player character), dynasty name/law/prestige, legitimacy (86, `heir_clear`), stability (78, note), treasury (LC), council (Spymaster, Master of Coin, High Marshal, Voice of the Fields from `worldLore.COUNCIL`), heirs in waiting, `ROYAL_HISTORY` (4 rulers), wars/treaties.
- Dynasty: `House of Aegis` (id 101, hereditary, prestige 120), members (founder Aldric, Princess Isabel #2, Prince Corvin #3), succession order (`getSuccessionOrder` now filters by dynasty), historical rulers, treasury/members.
- Dynasty storage bugs fixed: `Record<string,RulerLegitimacy>` typing, `Dynasty[]` (was `Dynasty`), founder `DynastyMember` (added `id`/`dynasty_id`, title cast King/Queen), `null`→`undefined` for optional fields, `getKingdomStability`/`getRulerLegitimacy` nullables.

### 1.7 Unified medieval UI + game feel
- Reuses `rpg-panel-stone`/`rpg-panel-parchment`, `rpg-button` variants, Cinzel/MedievalSharp, muted gold `#e5c158`, burgundy/royal accents; no SaaS cards/glass/gradients/emoji/placeholder art. Heraldry/ornaments are original SVG/CSS (`bannerColors`, map frame).
- Feedback: floating text (`triggerFloatingText`), status banners, button `actionLoading`, lock on overlapping actions (see §3), restrained transitions + reduced-motion override.
- `frontend/lib/worldLore.ts`: realms/provinces (10 core, keyed to existing IDs), professions, council, royal history, banner colours, `getNeighbors`.

---

## 2. Playable scenario — end-to-end (real controls, no injection)

Run on the dev server (`cmd /c npm run dev`, Edge headless + interactive browser tab) with `admin@test.persistentmmo.dev / AdminTest123!` (mock auth). All steps used visible controls, **no state injection / dev shortcuts**:

| Step | Action (UI) | Result (observed text/state) |
|---|---|---|
| 0 | `/login` → seeded mock session → `/world` | `The Realm of Aegis`, layer tabs, map + panel |
| 1 | Click **Emerald Woodlands** marker, then **Travel** | `THOU HAST TRAVELLED TO EMERALD WOODLANDS.` Energy 100→90; tutorial → step 2 |
| 2 | **Gather Wood** | `GATHERED 1 × WOOD (+10 XP).` Wood 10→11, Energy 90→80 |
| 3 | `/economy` → **Craft 1 batch** (Bake Bread) | `Produced 1.` Grain 10→8, Water 10→9 |
| 4 | `/marketplace` → sell **3 × Iron Ore @ 4.5** | `Offered 3 × Iron Ore at 4.5 LC.` Ledger: `3 × Iron Ore · TestAdmin → npc_smith, fee 0.27, tax 1.35`; LC 1000→1011.88; NPC bid 30→27 |
| 5 | `/onboarding` wizard → name `Aldric`, Kingdom Genesis Land, Profession Farmer → **Enter the World** | Redirect to `/world`; `Aldric the Bold · farmer rank 1` |
| 6 | `/character` → **Train profession — 120 LC** | `Rank raised to 2.` LC 1011.88→891.88, `Farmer · Rank 2` |
| 7 | `/military` → **Recruit host** | `Host #3 recruited (5 grain, 2 iron, 3 fish).` Grain 8→3, Iron 2→0, Fish 5→2 |
| 8 | **March** Host #3 → Steel Bastion | `March to Steel Bastion complete.` Host marching, rations 80→70 |
| 9 | **Engage in battle** (120 vs 140) | `Battle: repelled. Now besiege.` 86/120, resistance 70→58, ownership unchanged |
| 10 | Switch to Host #1 (1000), **March** → Steel Bastion, **Engage** | `pyrrhic_victory` 850/1000, resistance 58→46, still Iron Union |
| 11 | **Begin siege** → **Press siege** | `The province has fallen!` Resistance → 0, host `garrisoning`, Steel Bastion now `Genesis Land` owned (marker + panel) |

Additional checks: `/kingdom` shows Legitimacy 86 / Stability 78 / Council / History; `/dynasty` shows House of Aegis + Princess Isabel #2 / Prince Corvin #3; four map layers switch (Political default, Warfare shows resistance badges).

---

## 3. Verification

- **TypeScript:** `cmd /c npx tsc --noEmit` → **no errors** (baseline had 60+ errors: missing dynasty methods in Supabase, `Combat*` exports, dynasty typing, onboarding JSX).
  - Fixed: `CombatEvent/CombatResult/CombatResponse` were already in `types/entities.ts`; dynasty `Record` vs `[]` typing; `null` vs `undefined`; onboarding invalid JSX (`character-creation.tsx`/`world-map.tsx` replaced); `SupabaseGameRepository` stubs for dynasty + 6.5 methods; `GameContextType` in layout now = `ReturnType<typeof useGame> & { triggerFloatingText }` (removed stale 28-property type).
- **Tests:** `cmd /c npm test` → **86 passed, 1 failed** (baseline was 85 passed, 2 failed).
  - Passing includes `backend.test.ts`, `formulas.test.ts` (32/32 — NPC seeding guarded by real-session check so market counts stay `1` in isolated tests), `map-geometry.test.ts`, `useMusic.test.ts`, and the expedition **action-lock** test (now passes).
  - Action lock: `useGame` adds `actionLockRef`; `travel`/`gather`/`craftItem`/`executePvE` return `{ success:false, error:'Busy…' }` while a prior action is pending and release in `finally` (even on thrown errors).
  - `useGame` also exposes `isInitialLoading = loading && !hasLoadedOnce`, `isRefreshing = loading && hasLoadedOnce`, and `executePvEBattle(id, key?)` (second arg optional).
- **Repository compatibility:** `IGameRepository` extension is additive (10 new methods). Both implementations compile (`MockGameRepository` full logic; `SupabaseGameRepository` safe stubs). `provider.ts` provider selection untouched.
- **Responsive:** 1440×900 desktop and 390×844 mobile captured (see §5). Mobile sidebar fixed-overlay fix verified (`computed position: fixed`, `left: -256` when closed; content full-width).
- **Screenshots:** real captures from the running app (Edge headless, seeded mock session, `frontend/scripts/capture.cjs` / `capture-war.cjs`). No mocked/staged images.

---

## 4. Screenshots (real, from `http://localhost:3000`)

Files in `frontend/public/screenshots/`:

| File | View | Size |
|---|---|---|
| `world-desktop-1440.png` | World, Political layer, Genesis Capital selected | 1.37 MB |
| `world-warfare-layer-desktop-1440.png` | World, Warfare layer (resistance badges) | 1.26 MB |
| `world-steel-bastion-desktop-1440.png` | World, Steel Bastion selected | 1.31 MB |
| `world-mobile-390.png` | World stacked (map + panel), sidebar overlay-ready | 0.35 MB |
| `marketplace-desktop-1440.png` | Sell/buy, NPC board/bids | 0.45 MB |
| `marketplace-mobile-390.png` | Marketplace stacked | 0.09 MB |
| `military-desktop-1440.png` | Raise hosts / Command / Field report | 0.41 MB |
| `kingdom-desktop-1440.png` | Throne / Council / Memory | 0.43 MB |
| `dynasty-desktop-1440.png` | House of Aegis / Succession / Rulers | 0.40 MB |
| `character-desktop-1440.png` | Character parchment (Aldric, Farmer Rank 2) | 0.41 MB |
| `economy-desktop-1440.png` | Gather / Produce / Ledger | 0.44 MB |

*Preview in the app Review pane or open the PNGs directly; they are not placeholders.*

---

## 5. What is fully implemented vs mock-backed vs live-multiplayer-required

### Fully implemented (real, playable end-to-end)
- 7 routes + 5-step onboarding + first-visit tutorial
- 4 map layers, pan/zoom, province select/panel, travel (roads), gather, recruit/march/battle/siege/conquest
- Economy/marketplace buy/sell/cancel/history with VAT+fee and NPC matching
- Kingdom + dynasty screens with seeded hereditary dynasty
- Navigation, medieval theming, reduced-motion, responsive 1440/390
- TypeScript clean, tests 86/87 (see defects)

### Mock-backed (deterministic, localStorage, NPC opponent)
- `MockGameRepository` is the provider when Supabase config is a placeholder (existing `provider.ts` logic). All warfare/market/dynasty state lives in `localStorage`.
- Opponents: NPC market (6 listings / 4 orders) and garrisons (`resistance_level`) instead of human players. The `War 1 vs 2` seed provides a deterministic adversary.
- `SupabaseGameRepository`: dynasty + 6.5 methods are safe stubs (“Supabase … not wired in this build”). No Supabase migrations, Docker, or live multiplayer were touched per pause instruction.

### Live-multiplayer-required (not claimed)
- Real-time provinces/armies (Supabase Realtime channels exist for some data but the 6.5 warfare chain is not wired to Supabase).
- Cross-player trading, succession by other humans, coalition/guild wars, and the 20 generated provinces (11–30) as contestable provinces (currently lore is for the 10 core; generated regions remain travel/gather-only).
- Image-generation/heraldry art: no image tool was available; heraldry is original SVG/CSS. The map is the optimized derivative of `fantasy_world_map.png`.

### Remaining defects / follow-ups
1. **1 pre-existing test failure:** `hooks/expedition.test.tsx` expects legacy dashboard labels `Find the woodlands` / `Relocate link (10 EP)` / `Close region details` etc. The current (pre-6.5) dashboard uses different labels, so the button finder fails. This failed at baseline too (baseline: 2 failures; now 1 because the lock test was fixed). Fixing requires either aligning the live dashboard copy to the test or updating the stale test — deliberately not changed here to avoid breaking the baseline contract.
2. **First-engagement balance:** a freshly recruited 120-strong host is repelled by Steel Bastion’s 140 garrison (resistance 70). The seeded 1000-strong host wins. This is intentional (larger hosts matter) but new players may need to mobilise twice or use the 1000 host; recruit cost (5/2/3) plus a pre-seeded active war means `declareWar` can fail on `Insufficient resources` right after recruiting (observed in the run). Follow-up: raise recruit size to 160 or give the 120 host a morale edge.
3. **Siege pacing for huge hosts:** capped at 18/tick, so 850 vs 46 falls in ~3 ticks (observed: 1 tick before the cap was added, now 3). For 120 vs ~50 it is ~3 ticks. Fine for a vertical slice, but a 1000-host feels too fast relative to tactics.
4. **Marketplace item sales:** the Marketplace UI sells resources only; crafted **items** (bread) must be sold via the legacy dashboard/inventory flow. NPC `Miller Tom wants Bread` exists, so an item-listing UI would close the loop.
5. **World panel war buttons** show for any foreign province even without a road (declare/mobilize placement), while marching correctly enforces roads. The Military page is the strict path.
6. **Prospective:** generated provinces 11–30 have no lore/markers; the world map shows only the 10 core. `getRegions()` returns 30, but `PROVINCES` covers 10 by design.
7. **Dev tooling:** `puppeteer-core` was added as a `devDependency` solely for headless screenshot capture (`frontend/scripts/capture*.cjs`). It is not a game framework; remove it if unwanted.

---

## 6. Files changed (summary)

- **Types/repo:** `frontend/types/entities.ts` (Combat/Character/Siege report — already present), `frontend/services/repository/IGameRepository.ts` (+10 additive), `MockGameRepository.ts` (session helper, connected 16-edge graph, 5 iron/5 fish backfill, dynasty/military/NPC seeds, warfare determinism + siege cap + owner fix, character methods, dynasty typing fixes, `npm` lock refresh), `SupabaseGameRepository.ts` (stubs).
- **Hooks/layout:** `frontend/hooks/useGame.ts` (6.5 state/mutations, `isInitialLoading`/`isRefreshing`, `executePvEBattle(id, key?)`, action lock), `frontend/app/(game)/layout.tsx` (context type, 7-item nav, `!fixed` sidebar fix).
- **Content/pages:** `frontend/lib/worldLore.ts` (new), `frontend/app/(game)/world/page.tsx` (new map), `onboarding/page.tsx` + `welcome/page.tsx` (new), `character/page.tsx`, `economy/page.tsx`, `marketplace/page.tsx`, `military/page.tsx`, `kingdom/page.tsx`, `dynasty/page.tsx`, `frontend/app/page.tsx` + `(auth)/login/page.tsx` (→ `/world`), `frontend/app/globals.css` (reduced motion).
- **Assets/tools:** `frontend/public/assets/backgrounds/aegis-world-map.webp` (optimized), `frontend/public/screenshots/*.png` (11 real captures), `frontend/scripts/capture.cjs`, `capture-war.cjs`, `debug-mobile.cjs`, `optimize-world-map.mjs` (already untracked).
- **Dependencies:** `frontend/package.json` (+ `jsdom` pre-existing, + `puppeteer-core` dev for screenshots).

*No `BREAK POINT` file touched, Phase 7 not started, no simulation-engine rewrite, no Supabase migrations/Docker.*

---

# Addendum — World Reconstruction, Gameplay Recovery & Visual Overhaul

Stage order A-G executed. Baseline re-established before changes: **86/87** (1 pre-existing expedition stale-label failure).

## Stage A — Cleanup manifest

| Component | Verdict | Action |
|---|---|---|
| `/combat, /explore, /map, /inventory, /quests` (17-line redirect stubs) | REMOVE | Deleted folders. Superseded by `/world, /military, /character, /economy`. No functionality lost, no imports. |
| `/warfare` (589-line legacy) | MERGE to `/military` | Replaced with redirect; war logic already in `MockGameRepository`. |
| `/dashboard` (2935 lines) | KEEP legacy, not canonical nav | Preserved for expedition test; no longer main nav. `/world` is canonical (`/` + `/login` go to `/world`). |
| `onboarding/character-creation.tsx, world-map.tsx` (invalid JSX) | REMOVE | Now tiny redirects (already). Wizard is `onboarding/page.tsx`. |
| `admin, calendar, commander, community, companion, contracts, developer, gathering, history, industrial, mail, messenger, newspaper, politics, seasons` | KEEP | Working systems reachable by URL. |

No DB wipe. Phase 7 not started.

## Stage B — Gameplay recovery

1. Character identity: `/world` redirects to `/onboarding` when `!playerCharacter || !onboarding_completed` (guarded by `!isInitialLoading`). Layout header prefers `playerCharacter.name/profession`. Verified Aldric/FARMER everywhere.
2. Tutorial is state-derived from `profile.current_region_id` + `gatherLogs`, survives reload. Travel Qurtuba→Jayyan (EP 90) advanced to gather step; gathering advanced to marketplace step.
3. Crafting root cause: `Economy` showed `ProductionInputs` (with Coal) while `craftItem` consumes `ItemRecipe` (2 Grain + 1 Water). Fixed UI to authoritative inputs. Bread 3→4, Grain 10→8, Water 10→9, Coal 10 unchanged. Crafted goods now surfaced in Economy/Character, and Marketplace gained Crafted goods section with an NPC item bid (Miller Tom, Wheat Bread 5.5).
4. Military: host banner by status, fortification bar, disabled/contextual controls with reasons.
5. Feedback: gather banner `+1 Wood, +10 XP, −10 EP (90→80)` from authoritative result; travel arrival; `useSFX` sounds.

## Stage C — Medieval world

**Starting date: 1031 CE** (Caliphate of Qurtuba abolished after Fitna 1009–1031; pre-Almoravid 1086). Three Taifa leagues:

- 1 Taifa of Qurtuba: Qurtuba, Jayyan, Tulaytula
- 2 Taifa of Ishbiliya: Qadiz, Saragusta, Ishbiliya
- 3 Taifa of Gharnata: Sierra Nevada, Gharnata, Almiriya, Balansiya

Controlled migration: IDs preserved, `DEFAULT` names renamed in place, stored `mmo_countries` migrated, `mmo_military_regions` reconciled (captures preserved). VAT unchanged. 16 Iberian proximity edges.

## Stage D — Full-screen map (judged)

`/world` full-bleed (`main p-0`, inner `w-full h-full`). SVG schematic Iberia: coastline, Pirini/Sierra Morena/Sierra Nevada, Guadalquivir/Ebro/Tagus rivers, trade routes, territory ellipses, capitals (✦), armies (Warfare). Four layers visually change map. Pan/zoom, hover, selection outline, focus-my-province, contextual panel, HUD (1031, 1 wars). Verified 1440 and 390. Mobile currencies hidden `<sm` to avoid overrun.

## Stage E-G — Screens, onboarding, acceptance

Dynasty family tree added. Intro 14-step journey fully state-driven in medieval voice. `tsc` clean. Tests mock provider 86/87 (same 1 stale failure). Playtest: Qurtuba→Jayyan→Tulaytula→Saragusta battle 1000 vs 140 pyrrhic 58 → siege 58→40→4→capture — Saragusta Taifa of Qurtuba 0.

## Visual system

Stone/parchment/gold/burgundy/forest/steel-blue; MedievalSharp display, Inter UI, VT323 numbers. Restrained motion, reduced-motion disables. Code-drawn schematic (no image generation); `aegis-world-map.webp` retained legacy.

## Screenshots (new, real, Edge headless)

`world-desktop-1440.png` (Iberia Political), `world-warfare-layer-desktop-1440.png`, `world-steel-bastion-desktop-1440.png`, `world-mobile-390.png`, `marketplace-desktop-1440.png`, `military-desktop-1440.png`, `kingdom-desktop-1440.png`, `dynasty-desktop-1440.png`, `character-desktop-1440.png`, `economy-desktop-1440.png`.

## Limitations

Schematic is code-drawn lon/lat. Item listings sell per inventory row. Provinces 11-30 remain non-mythic fixtures. Live multiplayer requires Supabase; Phase 6 acceptance not claimed.

---

# Milestone Addendum — Gameplay Recovery, Al-Andalus Integration & Visual Overhaul

## Files modified / removed

- `frontend/app/(game)/layout.tsx` — nav now World/Character/Economy/Marketplace/Military/Kingdom/Dynasty/Quests/Profile (no dashboard links), full-bleed `/world` (`main p-0`, `w-full h-full`), header prefers character, currencies hidden `<sm`.
- `frontend/app/(game)/world/page.tsx` — rebuilt as full-screen schematic Iberia: tiled province polygons (`TERRITORIES`), rivers/mountains/trade routes, territory wash, capitals, selected-only warfare front, contextual province panel, state-derived tutorial.
- `frontend/lib/worldLore.ts` — added `TERRITORIES` tiling, Andalusi council, 1031 realms/provinces.
- `frontend/app/(game)/character/page.tsx` — aggregated crafted goods (duplicate Wheat Bread stacks merged), consistent medieval panel.
- `frontend/app/(game)/economy/page.tsx` — Workshop now shows authoritative `ItemRecipe` inputs; crafted goods section.
- `frontend/app/(game)/marketplace/page.tsx` — raw-only resource sell (no Bread 0), crafted-goods auto-selected, quality-labelled, `itemNameOf` display.
- `frontend/app/(game)/military/page.tsx` — status banners, fortification bar, disabled/contextual controls.
- `frontend/app/(game)/dynasty/page.tsx` — Founded 1031 (not real date), family tree.
- `frontend/app/(game)/quests/page.tsx`, `frontend/app/(game)/profile/page.tsx` — NEW canonical medieval routes (no dashboard).
- `frontend/services/repository/MockGameRepository.ts` — dynasty 1031 dates/notes, NPC item bid backfill, military/country migration (captures preserved).
- `frontend/app/(game)/onboarding/page.tsx` — header now “Al-Andalus, 1031 CE” (was vertical slice).
- Removed: `frontend/app/(game)/combat,explore,map,inventory,quests` (previous phase) — `combat/explore/map/inventory` deleted, `quests/profile` created fresh; `warfare` redirect retained from previous phase.

## Bugs fixed (playtest)

1. Quests/Profile → dashboard: nav now points to `/quests` and `/profile`; dashboard no longer reachable via navigation.
2. Obsolete dashboard fantasy concepts no longer in nav (Coordinate Energy/Solis Sovereigns/Pegasus/Phoenix remain only in legacy dashboard file, unreachable from sidebar).
3. Dynasty `06/11/2026` → `Founded 1031 · 1031 Founder`.
4. “vertical slice” removed from player-facing onboarding header.
5. Duplicate Wheat Bread stacks: Character/Economy aggregate by template (Economy already did; Character now does), quality retained per row in Marketplace but labelled.
6. Marketplace Bread 0: raw-only sell list excludes refined Bread; crafted goods button auto-selected (was disabled on empty `sellItemId`).
7. Consistent presentation: Kingdom/Character/Economy/Dynasty share parchment headers, HUD, terminology (Taifa, EP, LC).

## Gameplay improvements

Loop Qurtuba→Jayyan (EP 90) →Gather wood (+1/+10 XP/−10 EP 90→80) →Craft bread 3→4 (Grain 10→8, Water 10→9) →Sell iron 3 @4.5 (LC 1000→1011.88) →Recruit →March Tulaytula→Saragusta battle/siege→capture. Field victory never captures; siege required. All authoritative in `MockGameRepository`.

## Visual assets added

Code-drawn Iberia schematic (coastline, territories, rivers, ranges, trade routes), heraldic banners, settlement markers (castle/keep/harbor/forest), workshop/market/military textual banners (`Marching…/Sieging…`). Parchment/stone/gold/terracotta/olive/blue palette, MedievalSharp display. No AI-generated inaccurate geography; no new dependencies.

## Screenshots (real, recaptured)

`world-desktop-1440.png` (Iberia Political territories), `world-warfare-layer-desktop-1440.png` (selected-only front), `world-mobile-390.png`, `marketplace-desktop-1440.png`, `military-desktop-1440.png`, `kingdom-desktop-1440.png`, `dynasty-desktop-1440.png` (Family tree, Founded 1031), `character-desktop-1440.png`, `economy-desktop-1440.png` — Edge headless from `http://localhost:3000`, seeded mock session.

## Test & build (mock provider)

- `tsc --noEmit` clean.
- `npm test` mock: **86/87** (1 pre-existing expedition stale-label failure, same as baseline; core tests pass).
- `npm run build` production: **✓ Compiled, 38/38 static pages, TypeScript finished**.

## Blockers

- Schematic map is lon/lat approximation (no licensed GIS tile map).
- Item listings sell per inventory row (quality stacks) — bulk aggregation would need engine change.
- Provinces 11–30 remain fixtures without lore.
- Live multiplayer requires Supabase; not claimed.

