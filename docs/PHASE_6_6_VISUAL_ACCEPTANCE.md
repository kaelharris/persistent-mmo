# PHASE 6.6 — Al-Andalus World & Visual Experience — Acceptance

## 1. Implemented improvements

- **Map:** Iberian Peninsula schematic rebuilt — recognisable Atlantic/Mediterranean coastline, lon/lat-projected settlements (Qurtuba, Jayyan, Tulaytula, Ishbiliya, Gharnata, Saragusta, Balansiya, Qadiz, Almiriya, Sierra Nevada), Guadalquivir/Ebro/Tagus rivers, Pirini/Sierra Morena/Sierra Nevada ranges, trade routes following geography, capital markers (✦). REPLACED rectangular boxes with organic Voronoi-style territory polygons (`TERRITORIES` in `worldLore.ts`) with coherent shared borders. Layers visually distinct; Warfare shows only selected province’s front (not a red web).
- **Zoom-dependent labels:** province labels hidden below 110% except selected/hover/current to avoid southern cluster overlap; marker scaling with stage.
- **Tutorial/tooltip overlap:** contextual panel is a right overlay; bottom-left hint no longer covers HUD; tutorial banner (dismissible, state-derived) at top-left under HUD.
- **Dynasty chronology:** seeded history now 1031 (`Founder and first sovereign in 1031`), no real-world dates, no “vertical slice” in player-facing text/comments (onboarding header now “Al-Andalus, 1031 CE”).
- **Quests starter commissions:** 5 real deeds (travel, gather wood, craft bread, trade sale, recruit+march) with progress derived from `profile`, `gatherLogs`, `inventory`, `marketHistory`, `armyUnits` — no fake buttons.
- **Inventory/market:** Character/Economy aggregate Wheat Bread by template (no duplicate stack rows); Marketplace raw-only sell (no Bread 0), crafted-goods auto-selected + quality labels, `itemNameOf` for listings/bids.
- **Kingdom/Character/Economy/Dynasty consistency:** shared parchment/stone panels, Taifa terminology, 1031 chronology, Andalusi council names (Ibrahim al-Hajjib, Amina al-Farise, Ibn al-Zafir).
- **Nav:** Quests/Profile now canonical medieval routes; legacy dashboard not reachable from sidebar.

## 2. Exact files changed

- `frontend/app/(game)/layout.tsx` — nav (Quests/Profile to `/quests`/`/profile`), full-bleed `/world`, character header, currencies hidden `<sm`.
- `frontend/app/(game)/world/page.tsx` — rebuilt schematic, territories, hover/selection, zoom-dependent labels, selected-only warfare, tutorial.
- `frontend/lib/worldLore.ts` — organic `TERRITORIES`, Andalusi council.
- `frontend/app/(game)/quests/page.tsx` — starter commissions (rewritten).
- `frontend/app/(game)/profile/page.tsx` — new.
- `frontend/app/(game)/character/page.tsx` — aggregated crafted goods.
- `frontend/app/(game)/economy/page.tsx` — authoritative `ItemRecipe` inputs; crafted goods.
- `frontend/app/(game)/marketplace/page.tsx` — raw filter, crafted-goods auto-select, item names.
- `frontend/app/(game)/military/page.tsx` — banners, fortification, disabled logic.
- `frontend/app/(game)/dynasty/page.tsx` — Founded 1031, family tree.
- `frontend/app/(game)/kingdom/page.tsx` — fallback Taifa name.
- `frontend/services/repository/MockGameRepository.ts` — quest seeds (5), dynasty 1031, NPC item bid backfill, comment wording.
- `frontend/hooks/expedition.test.tsx` — updated to verify current `/world` behavior (Jayyan travel −10 EP, gather −10 EP, persistence).
- `docs/PHASE_6_5_GAMEPLAY_REPORT.md` — updated (Phase 6.5→6.6 context, 87/87).

Removed: none this phase (prior cleanup removed `/combat,/explore,/map,/inventory`; `/warfare` redirect retained).

## 3. Assets integrated and verified licences

Researched `https://www.freegameassets.com/` (directory of external packs). No batch import: textures there are curated pointers with per-pack licences and casual-mobile styling that conflicts with Al-Andalus parchment. Decision: **no external assets imported; zero licence risk**. All visuals are procedural SVG/CSS (parchment, sea dots, mountain/river paths, territory polygons, heraldic markers) — reproducible by a small team, no 3D engine, no text-as-image. Source/licence manifest: `N/A — procedural`.

## 4. Before / after screenshots (real Edge headless, seeded mock session)

Before (rectangular overlays, beige block, `world-desktop-1440.png` pre-6.6): landmass huge empty beige, province rectangles, straight red web, overlapping labels.
After (current):

- World Political: `frontend/public/screenshots/world-desktop-1440.png` (Iberia territories, Pirini label, Mare Internum, Qurtuba here)
- Warfare: `world-warfare-layer-desktop-1440.png`
- Mobile: `world-mobile-390.png`
- Economy: `economy-desktop-1440.png`
- Marketplace: `marketplace-desktop-1440.png`
- Military: `military-desktop-1440.png`
- Dynasty: `dynasty-desktop-1440.png` (Founded 1031, Family tree)
- Kingdom: `kingdom-desktop-1440.png`
- Character: `character-desktop-1440.png`

All captured from running `http://localhost:3000` via `scripts/capture.cjs` / `capture-war.cjs`.

## 5. Automated test results (mock provider)

- `cmd /c npx tsc --noEmit` (frontend) — **clean**
- `cmd /c npm test` — **87/87 passed (5 files)**. Previous 86/87 fixed by updating `expedition.test.tsx` to current `/world` behavior (obsolete dashboard labels `Find the woodlands` etc. replaced with `Jayyan`/`Travel`/`Gather Wood · have 10`).
- `cmd /c npm run build` — **✓ Compiled, 38/38 static pages**

Playtest (browser, real controls): Qurtuba→Jayyan (EP 90) → Gather Wood (+1/+10 XP/−10 EP) → Craft bread 3→4 → Sell iron 3@4.5 → Saragusta battle/siege → captured.

## 6. Remaining issues

- Schematic is lon/lat approximation, not a licensed GIS map; precise historical boundaries are documented as alternate-history.
- Southern cluster (Gharnata/Jayyan/Sierra) remains dense at low zoom — mitigated by zoom-dependent labels, but ultra-wide or tiny windows may still show small overlaps.
- Item listings sell per inventory row (quality stacks); bulk aggregation would need engine change.
- Provinces 11–30 remain fixtures without lore.
- Live multiplayer requires Supabase; Phase 6 acceptance not claimed. Phase 7 not started.
