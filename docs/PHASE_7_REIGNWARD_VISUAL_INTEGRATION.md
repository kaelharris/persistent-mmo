# PHASE 7 — REIGNWARD Visual Integration

## Implemented and verified
- Gilded Ruin tokens in `frontend/app/globals.css`: `--deep #0A1019 --panel #111D28 --panel-high #1B2D39 --paper #F2E8D5 --gold #D8AE68 --red #A54D4C --green #6D9480`; fonts Marcellus SC (display), Barlow (interface), VT323 numbers. Panels `.rw-panel` (inset double brass hairline), buttons `.rw-btn` variants gold/bronze/dark/green/red/icon.
- Persistent bottom-center dock (`.rw-dock`) with 9 icon+text destinations; mobile compact, safe-area, no horizontal scroll. Right-to-left drawer transition 260ms, reduced-motion respected.
- Widescreen artifacts: `frontend/public/assets/reignward-wide/{map,atlas,character,economy,market,military,council,court,dynasty,quests,chronicle,province}.webp` (12 files from `reignward-widescreen-art-pack.zip`). Banners rendered via layout 16:9 frame, `object-fit: contain`, Next-ready `<img>` with full-artwork lightbox; priority to active screen.
- World: existing interactive SVG Iberia retained; `map.webp` used as terrain texture clipped to Iberia land path (interactive overlays native). Layers, zoom/pan, selection, travel, warfare preserved.
- Functional screens (Character/Economy/Marketplace/Military/Kingdom/Dynasty/Quests/Profile) all keep repository calls, loading/error states, mutations.

## Implemented but not visually verified
- Page transitions right-to-left on every route (drawer animation); dock active states.
- Military/kingdom/dynasty banner art specifics.

## Blocked / incomplete
- None for core integration; dashboard legacy file remains but unreachable from navigation (not deleted to preserve expedition test coverage).

## Files modified
- `frontend/app/globals.css`, `frontend/app/(game)/layout.tsx` (dock+drawer+headers), `frontend/app/(game)/world/page.tsx` (terrain texture), `frontend/lib/worldLore.ts`, `frontend/services/repository/MockGameRepository.ts` (quest seeds, dynasty 1031, NPC item bid), `frontend/app/(game)/character,economy,marketplace,military,kingdom,dynasty,quests,profile` (prior phase), `frontend/hooks/expedition.test.tsx` (updated to current `/world` behavior), `frontend/app/components/PageBanner.tsx` (banner+lightbox, used via layout art).
- Assets added: `frontend/public/assets/reignward-wide/*.webp` (12).

## Artwork manifest
| File | Use | Licence |
|---|---|---|
| `map.webp` | World terrain texture | Supplied pack |
| `atlas.webp` | World atlas header (non-interactive) | Supplied pack |
| `character/economy/market/military/council/court/dynasty/quests/chronicle/province.webp` | Page banners | Supplied pack (reignward-widescreen-art-pack.zip) |

No League of Legends assets copied. All were delivered in the supplied ZIP.

## Screenshots (real Edge headless, seeded mock session)
- Desktop 1440: `world-desktop-1440.png`, `world-warfare-layer-desktop-1440.png`, `marketplace-desktop-1440.png`, `military-desktop-1440.png`, `kingdom-desktop-1440.png`, `dynasty-desktop-1440.png`, `character-desktop-1440.png`, `economy-desktop-1440.png`
- Mobile 390: `world-mobile-390.png`, `marketplace-mobile-390.png`

## Functional verification (browser, real controls)
Qurtuba→Jayyan travel (EP 90) → Gather Wood (+1/+10 XP/−10 EP) → Craft bread 3→4 → Sell iron 3@4.5 (LC 1000→1011.88) → Saragusta battle/siege → captured. Dynasty Founded 1031, quests starter steps state-driven.

## Automated tests (mock provider)
- `tsc --noEmit` clean
- `npm test` **87/87** (5 files) — expedition test updated to current `/world` (obsolete dashboard labels replaced)
- `npm run build` ✓ 38/38

## Remaining issues
- Map.webp terrain clipped to bounding box may not align every painting city; markers remain authoritative.
- Bottom dock can overlay province panel bottom actions — panel closes or scrolls (max-height with overflow).
- Dashboard legacy file still exists for test history; not reachable via navigation.
