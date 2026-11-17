# PHASE 7 — REIGNWARD Visual Integration & Modular Atlas

**Status:** UI milestone complete and verified in the running game. Gameplay, Supabase schema, simulation and repository contracts are unchanged.

## Scope delivered

### 1. Gilded Ruin design system
- Tokens in `frontend/app/globals.css`: `--deep #0A1019`, `--panel #111D28`, `--panel-high #1B2D39`, `--paper #F2E8D5`, `--muted #B6AE9B`, `--gold #D8AE68`, `--red #A54D4C`, `--green #6D9480`.
- Marcellus SC display type, Barlow interface type, VT323 numerals.
- `.rw-panel` aged-stone frames with inset brass hairlines; `.rw-btn` gold/bronze/green/red/icon variants.
- Persistent bottom-center dock (`.rw-dock`), right-to-left drawer transitions (260 ms), reduced-motion overrides.
- 16:9 banners use the supplied artwork with `object-fit: contain` and a full-artwork lightbox.

### 2. Modular interactive atlas
- **One planar partition.** `frontend/lib/worldLore.ts` keeps the 10 gameplay province IDs, names, settlements and seats, and defines topologically correct shared borders. `TERRITORIES` are built from a single ordered boundary so neighbours reuse identical edges — no overlap, no gaps, no arbitrary Voronoi shapes.
- **One projection.** `lonLatToWorld` maps real lon/lat into a `1100 × 950` viewBox (1° latitude = 100 units, longitude scaled by `cos 40°`). Terrain, province polygons, settlements, labels and flags all use that projection.
- **Vector-only terrain.** Coastline (`IBERIA_COAST`), Sierra Morena, Sierra Nevada, Pyrenees, Cantabrian range, forests, rivers, roads, sea labels and settlements are SVG. The previous raster texture (and its central seam) was removed from the render path; parchment is now a seam-free vector mottle + grain. `map-texture-3200.webp` remains on disk as an unused LOD artifact.
- **Exact-shape interaction.** Transparent hit paths trace each province polygon. Hover clips a duplicate of the terrain detail to the province, adds the owner tint and an engraved gold/dark double stroke, translates it up `3.6 / screenScale` px with a dynamic `feDropShadow`, and renders it above neighbours. Transition is 190 ms cubic-bezier, disabled for reduced motion.
- **Ownership.** Tints, owner names and flags resolve from `military_regions.owner_country_id` first, then the region's `country_id`. `heraldry.tsx` draws hand-built SVG achievements for the ten realms (crescent, tower, pomegranate, lozenge) with a neutral fallback. A banner rises above the hovered/selected seat.
- **Layers.** Political, Geographic, Economic and Warfare switch ownership tint strength, terrain opacity and the economy/war overlays without remounting the map.
- **Navigation.** Drag-to-pan, wheel zoom at cursor, pinch zoom, `+/-/reset` controls, keyboard-focusable province hit paths and an accessible province button list. Pan/zoom clamps keep Iberia reachable.
- **Hover card.** Compact parchment card placed beside the cursor: name, subtitle, owner, settlement, state/resistance and a click hint. It stays clear of the province, its label and its banner; it is dismissed on selection.
- **Ledger.** Selecting a province opens the existing right-side ledger with the commands players already had — Travel, Recruit host, Marketplace, Economy, Gather (Wood/Grain/Water) and warfare status. No command was added or removed.
- **Mobile.** First tap selects and raises the province, shows the flag and info card, and leaves actions available. The sheet is capped at `44vh`; the map recentres the selected province into the visible band above it. Drag gestures suppress accidental selection and the sheet survives panning. Tablet layer controls move to the top-right; phone controls stack above the dock.

### 3. Cartographic content
- Northern Iberia beyond the ten playable taifas is drawn as "beyond the chronicle" land — cartography, not fake interactive provinces.
- Sea labels (`MARE INTERNUM`, `OCEANUS ATLANTICUS`), compass rose, scale bar, realm legend, layer bar and atlas cartouche establish a deliberate atlas frame.
- Label offsets for Qadiz, Jayyan and Sierra Nevada keep the crowded south legible; labels and markers are counter-scaled by `1 / (fitScale × zoom)` so they stay a constant, crisp screen size.

## Implemented vs verified

| Item | Implemented | Verified in browser |
|---|---|---|
| 10 independent province polygons | Yes | Yes — 10 hit paths, 10 labels, 10 markers |
| Shared-border topology | Yes | Yes — geometry test 4/4 |
| Exact-shape hover lift + shadow | Yes | Yes — Qurtuba hover transform `translateY(-4.05px)`, tooltip, crescent flag |
| Hover transfer Qurtuba → Jayyan | Yes | Yes — tooltip/flag switch to Jayyan |
| Click select + existing actions | Yes | Yes — ledger at right (`left 1052 / right 1424 / top 256 / bottom 812`), Travel/Recruit/Gather visible |
| Ownership-derived tints and flags | Yes | Yes — Jayyan keeps the Qurtuba crescent while selected |
| Zoom without pixelation | Yes | Yes — 160%, labels remain 9.5 CSS px, vector edges crisp |
| Mobile tap, lift, card and pan | Yes | Yes — 390×844 @ DPR 2, selected lift `-4.53px`, ledger 371 px tall, flag clear above card, still open after drag |
| Full Iberia framing | Yes | Yes — desktop and mobile default screenshots |

## LOD and device-pixel-ratio notes
- Runtime terrain is vector only. No raster is scaled by CSS, so there is no upscaling or resampling step to become pixelated; the SVG is rasterised by the browser at the current device pixel ratio.
- Marker, label, flag and border widths are divided by `fitScale × zoom` (or scaled by its inverse), keeping strokes and text at a stable CSS-pixel size through the 0.85×–3× zoom range.
- Verified at DPR 1 (1440×900 desktop) and DPR 2 (390×844 phone emulation). At 160% zoom, label font remains `9.5px` and province/border edges remain vector-crisp.
- The former `map-texture-3200.webp` LOD asset is no longer referenced at runtime. Re-introducing a raster would need a seam-free, projection-aligned source and an explicit DPR-aware `<image>` size; it is not required for this milestone.

## Evidence (real Edge, seeded mock session, dev server)

All files are in `frontend/public/screenshots/phase7/`.

### Demo recording
- [`atlas-phase7-demo.mp4`](../frontend/public/screenshots/phase7/atlas-phase7-demo.mp4) — 26.4 s, 1440×900, H.264. Desktop: full Iberia → hover Qurtuba → hover Jayyan → select Jayyan → ledger commands → zoom 160% → reset. Mobile: tap Qurtuba → raised province, crescent banner and info card → drag pan with sheet retained.
- Source harness: `frontend/scripts/atlas-record.cjs` (CDP `Page.startScreencast` while driving the real UI, assembled with ffmpeg).

### Screenshots
- Desktop default: [`atlas-desktop-default.png`](../frontend/public/screenshots/phase7/atlas-desktop-default.png)
- Hover Qurtuba: [`atlas-desktop-hover-qurtuba.png`](../frontend/public/screenshots/phase7/atlas-desktop-hover-qurtuba.png)
- Hover Jayyan: [`atlas-desktop-hover-jayyan.png`](../frontend/public/screenshots/phase7/atlas-desktop-hover-jayyan.png)
- Selected Jayyan + ledger: [`atlas-desktop-selected-jayyan.png`](../frontend/public/screenshots/phase7/atlas-desktop-selected-jayyan.png)
- Layers: [`geography`](../frontend/public/screenshots/phase7/atlas-desktop-layer-geography.png), [`economy`](../frontend/public/screenshots/phase7/atlas-desktop-layer-economy.png), [`warfare`](../frontend/public/screenshots/phase7/atlas-desktop-layer-warfare.png), [`political`](../frontend/public/screenshots/phase7/atlas-desktop-layer-political.png)
- Zoom 160%: [`atlas-desktop-zoom-160.png`](../frontend/public/screenshots/phase7/atlas-desktop-zoom-160.png)
- Mobile default: [`atlas-mobile-default.png`](../frontend/public/screenshots/phase7/atlas-mobile-default.png)
- Mobile selected Qurtuba: [`atlas-mobile-selected-qurtuba.png`](../frontend/public/screenshots/phase7/atlas-mobile-selected-qurtuba.png)

## Verification commands and results
- `npx tsc --noEmit` — clean.
- `npm test` — **104/104** passing across 7 files, including `tests/world-atlas-geometry.test.ts` (4/4 topology, seats, no overlap, no gaps).
- `npm run build` — **39/39** routes generated.
- Scoped ESLint (`WorldMap.tsx`, `heraldry.tsx`, `world/page.tsx`, `worldLore.ts`, geometry test) — clean.
- `node scripts/atlas-check.cjs` — no console/page/request errors; 10 hit paths/labels/markers; Qurtuba hover tooltip + flag 1 + lift; Jayyan hover tooltip + flag 2; selection clears tooltip; ledger position/actions verified; zoom 160% and label size; mobile tap/ledger/flag/lift/pan verified.
- `node scripts/atlas-record.cjs` — same assertions while recording; desktop 45 captured frames, mobile 14, zero page errors; output MP4 1.29 MB.

### Lint caveat
Repo-wide `npm run lint` still reports roughly 1,000 pre-existing problems (mostly `any` and unused symbols in untouched modules). The atlas and world files pass scoped lint; this milestone did not add repo-wide lint debt.

## Remaining limitations
- Only provinces 1–10 are playable and interactive. Northern Iberia is intentionally non-interactive cartography. Regions 11–30 remain mock fixtures used by other screens.
- The atlas is a 1031 CE political snapshot for the mock provider; live Supabase ownership changes will update tints/flags through the same repository fields but were not exercised against a live project (no credentials or migrations in scope).
- Item listings still sell per inventory row (pre-existing marketplace behaviour).
- The `/dashboard` expedition test route remains on disk and is not reachable from the active navigation.
- The repo-wide lint baseline is unchanged and remains noisy.
