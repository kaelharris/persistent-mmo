'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameContext } from '../layout';
import { PROVINCE_MAP, REALMS, MapLayer, getNeighbors, lonLatToXY, TERRITORIES } from '../../../lib/worldLore';
import {
  Castle, Trees, Pickaxe, Anchor, Home, Mountain, Wheat, Landmark, CupSoda,
  Minus, Plus, Navigation, Axe, Swords, Flag, Shield, Coins, X, Calendar, Bell
} from 'lucide-react';
import { useSFX } from '../../../hooks/useSFX';

function IconFor({ icon }: { icon: string }) {
  const cls = 'h-4 w-4';
  switch (icon) {
    case 'castle': return <Castle className={cls} />;
    case 'forest': return <Trees className={cls} />;
    case 'mine': return <Pickaxe className={cls} />;
    case 'harbor': return <Anchor className={cls} />;
    case 'village': return <Home className={cls} />;
    case 'ruins': return <Mountain className={cls} />;
    case 'fields': return <Wheat className={cls} />;
    case 'keep': return <Shield className={cls} />;
    case 'tavern': return <CupSoda className={cls} />;
    case 'city': return <Landmark className={cls} />;
    default: return <Landmark className={cls} />;
  }
}

const LAYER_LABELS: Record<MapLayer, string> = { political: 'Political', geography: 'Geographic', economy: 'Economic', warfare: 'Warfare' };

// Approx Iberia coastline (lon,lat) clockwise from NW Galicia
const IBERIA: [number, number][] = [
  [-9.3, 43.7], [-7.5, 43.7], [-4, 43.7], [-1.8, 43.8], [0.5, 43.5], [2.2, 42.5], [3.2, 42.4],
  [3.0, 40.5], [1.5, 40.5], [0.3, 39.8], [-0.4, 39.4], [-0.6, 38.3], [-2.0, 36.9], [-2.5, 36.7],
  [-4.4, 36.7], [-5.4, 36.0], [-5.9, 36.1], [-6.3, 36.5], [-7.0, 37.0], [-8.9, 37.0],
  [-8.9, 38.8], [-8.9, 40.5], [-8.9, 42.0],
];
const PYRENEES: [number, number][] = [[-1.8, 42.8], [0.5, 42.7], [2.2, 42.6]];
const SIERRA_MORENA: [number, number][] = [[-4.5, 38.4], [-3.0, 38.1], [-2.0, 38.0]];
const SIERRA_NEVADA: [number, number][] = [[-3.6, 37.1], [-2.8, 37.0]];
const GUADALQUIVIR: [number, number][] = [[-4.78, 37.88], [-5.4, 37.6], [-5.99, 37.39], [-6.28, 36.52]];
const EBRO: [number, number][] = [[-1.5, 41.6], [-0.89, 41.65], [-0.2, 40.8], [0.1, 39.4]];
const TAGUS: [number, number][] = [[-4.02, 39.86], [-6.5, 39.3], [-8.9, 38.8]];
const TRADE_ROUTES: [number, number][][] = [
  [[-4.78, 37.88], [-5.99, 37.39], [-6.28, 36.52]],
  [[-4.78, 37.88], [-3.61, 37.17]],
  [[-3.61, 37.17], [-2.46, 36.84]],
  [[-0.89, 41.65], [-0.38, 39.47]],
];

function toPath(pts: [number, number][]) {
  return pts.map((p, i) => {
    const [x, y] = lonLatToXY(p[0], p[1]);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${(y * 0.654).toFixed(1)}`;
  }).join(' ');
}

export default function WorldPage() {
  const {
    profile, stats, currencies, regions, countries, playerCharacter, isInitialLoading,
    militaryRegions, armyUnits, activeWars, regionEdges, playerResources, gatherLogs,
    resources, inventory, itemTemplates, gather, travel, recruitArmy, declareWar, mobilizeArmy, moveArmy, engageBattle, initiateSiege, progressSiege, liftSiege,
    actionLoading, triggerFloatingText, lastBattleReport, refreshData,
  } = useGameContext() as any;
  const router = useRouter();
  const sfx = useSFX();

  const [layer, setLayer] = useState<MapLayer>('political');
  const [hoverId, setHoverId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number>(profile?.current_region_id || 1);
  const [panelOpen, setPanelOpen] = useState(false);
  const [zoom, setZoom] = useState(1.05);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<null | { sx: number; sy: number; px: number; py: number }>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [travellingTo, setTravellingTo] = useState<number | null>(null);
  const [travellingFrom, setTravellingFrom] = useState<number | null>(null);
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // Character identity: world requires a completed character (after load).
  useEffect(() => {
    if (!isInitialLoading && profile && (!playerCharacter || (playerCharacter as any).onboarding_completed === false)) {
      router.replace('/onboarding');
    }
  }, [isInitialLoading, profile, playerCharacter, router]);

  useEffect(() => { if (profile?.current_region_id) setSelectedId(profile.current_region_id); }, [profile?.current_region_id]);

  // State-derived tutorial: advances from real game state, survives reload.
  const tutorial = useMemo(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('aegis_world_tutorial_seen')) return null;
    const travelled = (profile?.current_region_id !== 1 && !!profile?.current_region_id) || (gatherLogs?.length > 0);
    if (!travelled) return { step: 1, text: 'Your settlement needs timber before its defences can be strengthened. The nearby woodland of Jayyan may provide what you need — choose Jayyan, then Travel thither.' };
    if (!(gatherLogs?.length > 0)) return { step: 2, text: 'Thou art in a new province. Gather the local yield — the province panel shows what grows there.' };
    return { step: 3, text: 'Carry thy yield to the marketplace: sell for the right price, then arm thy house. The Economy page shows thy stores and the workshop.' };
  }, [profile, gatherLogs]);

  const visibleRegions = useMemo(() => (regions || []).filter((r: any) => r.id <= 10), [regions]);
  const selected = visibleRegions.find((r: any) => r.id === selectedId) || visibleRegions[0];
  const hovered = hoverId ? visibleRegions.find((r: any) => r.id === hoverId) : null;
  const lore = selected ? PROVINCE_MAP[selected.id] : undefined;
  const mil = selected ? (militaryRegions || []).find((m: any) => m.region_id === selected.id) : undefined;
  const neighbors = selected ? getNeighbors(regionEdges || [], selected.id) : [];
  const myArmiesHere = (armyUnits || []).filter((a: any) => a.current_region_id === selected?.id && a.country_id === profile?.citizenship_country_id);
  const myHost = myArmiesHere[0];
  const effectiveCountryId = mil?.owner_country_id ?? selected?.country_id;
  const isMine = effectiveCountryId === profile?.citizenship_country_id;
  const resourceName = (id: number) => (resources || []).find((r: any) => r.id === id)?.name || `Res ${id}`;
  const qty = (id: number) => (playerResources || []).find((r: any) => r.resource_id === id)?.quantity ?? 0;

  const flash = (ok: boolean, text: string) => {
    if (ok) { setMessage(text); setError(null); triggerFloatingText?.(text.slice(0, 48), 'text-game-gold'); }
    else { setError(text); setMessage(null); }
  };

  const handleTravel = async () => {
    if (!selected || selected.id === profile?.current_region_id) return;
    const from = profile.current_region_id;
    sfx.playClick();
    if (!reducedMotion) { setTravellingFrom(from); setTravellingTo(selected.id); }
    const res = await travel(selected.id);
    flash(res.success, res.success ? `Arrived at ${selected.name} (−10 EP). Choose thy next road.` : res.error || 'Travel failed.');
    sfx.playSuccess?.();
    if (res.success) { setTimeout(() => { setTravellingTo(null); setTravellingFrom(null); }, reducedMotion ? 0 : 900); setPanelOpen(false); }
    else { setTravellingTo(null); setTravellingFrom(null); sfx.playError?.(); }
  };

  const handleGather = async (resourceId: number) => {
    const beforeEnergy = stats?.energy ?? 100;
    const res = await gather(resourceId);
    sfx.playSuccess?.();
    flash(res.success, res.success ? `${resourceName(resourceId)} gathered: +${res.gatheredQuantity} ${resourceName(resourceId)}, +${res.experienceGained} XP, −${res.energySpent} EP (${beforeEnergy}→${res.newEnergy}).` : res.error || 'Gather failed.');
  };

  const spawnOptions: number[] = useMemo(() => {
    const known: Record<number, number[]> = { 1: [5, 7, 2], 2: [1, 5, 7], 3: [2, 9, 4], 4: [6, 7], 5: [3, 5, 4], 6: [6, 5, 2], 7: [9, 3, 2], 8: [5, 10, 7], 9: [8, 6, 4], 10: [5, 1, 10] };
    return known[selected?.id || 1] || [1];
  }, [selected]);

  const handleRecruit = async () => { const res = await recruitArmy(); sfx.playSuccess?.(); flash(res.success, res.success ? `Host #${res.armyId} recruited (120 spears).` : res.error || 'Recruit failed.'); };
  const handleDeclare = async () => { const res = await declareWar(effectiveCountryId); flash(res.success, res.success ? `War declared upon ${countries?.find((c: any) => c.id === effectiveCountryId)?.name}.` : res.error || 'Declare failed.'); };
  const handleMobilize = async () => { const res = await mobilizeArmy(); flash(res.success, res.success ? `Host #${res.armyId} mobilised.` : res.error || 'Mobilise failed.'); };
  const handleMoveToSelected = async () => { if (!myHost || !selected) return; const res = await moveArmy(myHost.id, selected.id); flash(res.success, res.success ? `Host marched to ${selected.name}.` : res.error || 'March failed.'); };
  const handleEngage = async () => { if (!myHost || !selected) return; const res = await engageBattle(myHost.id, selected.id); flash(res.success, res.success ? `Battle concluded: ${res.outcome}. Siege now required.` : res.error || 'Engagement failed.'); await refreshData(); };
  const handleSiegeStart = async () => { if (!myHost || !selected) return; const res = await initiateSiege(myHost.id, selected.id); flash(res.success, res.success ? `Siege begun at ${selected.name}.` : res.error || 'Siege start failed.'); };
  const handleSiegeProgress = async () => { if (!myHost || !selected) return; const res = await progressSiege(myHost.id, selected.id); flash(res.success, res.success ? (res.provinceCaptured ? `${selected.name} has fallen! It is thine.` : 'The siege presses on.') : res.error || 'Siege failed.'); await refreshData(); };
  const handleLift = async () => { if (!myHost || !selected) return; const res = await liftSiege(myHost.id, selected.id); flash(res.success, res.success ? 'Siege lifted.' : res.error || 'Lift failed.'); await refreshData(); };

  const ownerColor = (countryId: number) => REALMS.find((r) => r.id === countryId)?.color || '#b89030';
  const markerColor = (r: any) => ownerColor((militaryRegions || []).find((m: any) => m.region_id === r.id)?.owner_country_id ?? r.country_id);
  const posFor = (id: number) => { const p = PROVINCE_MAP[id]; if (!p) return [0, 0] as const; const [x, y] = lonLatToXY(p.lon, p.lat); return [x, y * 0.654] as const; };

  const myBanner = playerCharacter ? `${playerCharacter.name} ${playerCharacter.epithet}` : profile?.username || 'Unnamed';
  const realmName = countries?.find((c: any) => c.id === (playerCharacter?.kingdom_id || profile?.citizenship_country_id))?.name || '—';
  const siegeProgress = mil && mil.resistance_level <= 60 && !isMine ? Math.min(100, Math.max(0, 100 - mil.resistance_level)) : 0;

  return (
    <div className="relative w-full h-full min-h-0 overflow-hidden bg-[#0e1411]">
      {/* Full-screen parchment/coast backdrop */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 20%, #2a3a32 0%, #16201c 55%, #0a0f0d 100%)' }} />
      <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #e5c158 1px, transparent 1px), radial-gradient(circle at 70% 60%, #e5c158 1px, transparent 1px)', backgroundSize: '120px 120px' }} />

      {/* Draggable / zoomable stage */}
      <div className="absolute inset-0 select-none cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => setDrag({ sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y })}
        onMouseUp={() => setDrag(null)} onMouseLeave={() => setDrag(null)}
        onMouseMove={(e) => { if (drag) setPan({ x: drag.px + (e.clientX - drag.sx), y: drag.py + (e.clientY - drag.sy) }); }}
        onWheel={(e) => setZoom((z) => Math.min(2.8, Math.max(0.8, z - Math.sign(e.deltaY) * 0.12)))}
      >
        <div className="absolute inset-0 origin-center" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
          {/* Iberia schematic — the stage */}
          <svg viewBox="0 0 100 65.4" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="seaDots" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="0.25" fill="#2f4a5a" opacity="0.5" /></pattern>
            </defs>
            <rect width="100" height="65.4" fill="url(#seaDots)" />
            {/* Mediterranean label + Atlantic */}
            <text x="70" y="58" fill="#8fb4c5" fontSize="3.2" fontStyle="italic" opacity="0.85">Mare Internum</text>
            <text x="6" y="52" fill="#8fb4c5" fontSize="3" fontStyle="italic" opacity="0.7">Atlantikus</text>

            {/* Landmass */}
            <path d={toPath(IBERIA) + ' Z'} fill="#cbbf9a" stroke="#5c4a2d" strokeWidth="0.5" />
            <path d={toPath(IBERIA) + ' Z'} fill="#e8ddb8" opacity="0.35" />

            {/* Political layer: tiled province territories (not circles) */}
            {layer === 'political' && visibleRegions.map((r: any) => {
              const poly = TERRITORIES[r.id]; if (!poly) return null;
              const d = poly.map((p: [number, number], i: number) => { const [x, y] = lonLatToXY(p[0], p[1]); return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${(y * 0.654).toFixed(1)}`; }).join(' ') + ' Z';
              const isSel = r.id === selectedId;
              return <path key={r.id} d={d} fill={markerColor(r)} fillOpacity={isSel ? 0.52 : 0.30} stroke={markerColor(r)} strokeOpacity="0.95" strokeWidth={isSel ? 0.6 : 0.35} />;
            })}

            {/* Geographic layer */}
            {/* Scatter forest + mountain symbols for texture (derived from Sierra del Guadarrama / Pyrenees nodes) */}
            {[[-5.5, 40.5], [-3.5, 40.8], [-1.5, 41], [-4.2, 38.3], [-2.5, 38.1], [-3.2, 37.1]].map(([lon, lat], i) => {
              const [x, y] = lonLatToXY(lon, lat);
              return <text key={i} x={x} y={(y * 0.654).toFixed(1)} fontSize="3.2" fill="#3a5a3a" opacity="0.7">♦</text>;
            })}
            {(layer === 'geography' || layer === 'political') && (
              <>
                <path d={toPath(PYRENEES)} stroke="#7a6a4a" strokeWidth="0.9" strokeLinecap="round" fill="none" />
                <path d={toPath(SIERRA_MORENA)} stroke="#8a7a52" strokeWidth="0.7" fill="none" strokeLinecap="round" />
                <path d={toPath(SIERRA_NEVADA)} stroke="#8a7a52" strokeWidth="0.7" fill="none" strokeLinecap="round" />
                <path d={toPath(GUADALQUIVIR)} stroke="#3e6e8a" strokeWidth="0.55" fill="none" strokeLinecap="round" />
                <path d={toPath(EBRO)} stroke="#3e6e8a" strokeWidth="0.55" fill="none" strokeLinecap="round" />
                <path d={toPath(TAGUS)} stroke="#3e6e8a" strokeWidth="0.55" fill="none" strokeLinecap="round" />
                <text x="48" y="28" fill="#5a4a28" fontSize="2.4" fontStyle="italic">Pirini</text>
                <text x="40" y="52" fill="#5a4a28" fontSize="2.2" fontStyle="italic">Sierra Morena</text>
                <text x="44" y="56.5" fill="#5a4a28" fontSize="2.2" fontStyle="italic">Sierra Nevada</text>
              </>
            )}

            {/* Economic layer: trade routes */}
            {(layer === 'economy' || layer === 'geography') && TRADE_ROUTES.map((pts, i) => (
              <path key={i} d={toPath(pts)} stroke="#b89030" strokeWidth={layer === 'economy' ? 0.8 : 0.4} fill="none" strokeDasharray="1.2 0.7" opacity={layer === 'economy' ? 0.95 : 0.6} />
            ))}

            {/* Warfare layer: only selected province's front — keeps it readable */}
            {layer === 'warfare' && (regionEdges || []).filter((e: any) => {
              const inSel = e.from_region_id === selectedId || e.to_region_id === selectedId;
              if (!inSel) return false;
              const a = (militaryRegions || []).find((m: any) => m.region_id === e.from_region_id);
              const b = (militaryRegions || []).find((m: any) => m.region_id === e.to_region_id);
              return a && b && a.owner_country_id !== b.owner_country_id;
            }).map((e: any, i: number) => (
              <line key={i} x1={posFor(e.from_region_id)[0]} y1={posFor(e.from_region_id)[1]} x2={posFor(e.to_region_id)[0]} y2={posFor(e.to_region_id)[1]} stroke="#991b1b" strokeWidth="0.9" strokeDasharray="0.8 0.5" opacity="0.9" />
            ))}

            {/* Roads (all layers, subtle) */}
            {(regionEdges || []).map((e: any, i: number) => (
              <line key={i} x1={posFor(e.from_region_id)[0]} y1={posFor(e.from_region_id)[1]} x2={posFor(e.to_region_id)[0]} y2={posFor(e.to_region_id)[1]} stroke="#8a7a52" strokeWidth="0.22" opacity="0.5" />
            ))}
          </svg>

          {/* Province markers (DOM buttons for accessibility + rich labels) */}
          {visibleRegions.map((r: any) => {
            const p = PROVINCE_MAP[r.id]; if (!p) return null;
            const [mx, my] = posFor(r.id);
            const m = (militaryRegions || []).find((x: any) => x.region_id === r.id);
            const isCurrent = r.id === profile?.current_region_id;
            const isSelected = r.id === selectedId;
            const isHover = r.id === hoverId;
            const armiesHere = (armyUnits || []).filter((a: any) => a.current_region_id === r.id);
            const isCapital = r.id === 1 || r.id === 6 || r.id === 8;
            return (
              <button key={r.id}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setSelectedId(r.id); setPanelOpen(true); sfx.playClick(); }}
                onMouseEnter={() => setHoverId(r.id)} onMouseLeave={() => setHoverId(null)}
                className="absolute z-10 flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${mx}%`, top: `${(my / 65.4) * 100}%` }}
                aria-label={`${r.name} province`}>
                <span className={`h-9 w-9 md:h-11 md:w-11 rounded-full border-2 flex items-center justify-center bg-zinc-950/90 relative ${isSelected ? 'border-game-gold shadow-[0_0_18px_rgba(229,193,88,0.8)]' : isHover ? 'border-zinc-200' : 'border-zinc-600'}`}
                  style={{ boxShadow: layer === 'political' ? `0 0 0 3px ${markerColor(r)}88` : undefined }}>
                  <IconFor icon={p.icon} />
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full border border-zinc-950" style={{ background: markerColor(r) }} />
                  {isCapital && <span className="absolute -bottom-1 -right-1 text-game-gold text-[10px] leading-none">✦</span>}
                  {armiesHere.length > 0 && layer === 'warfare' && <span className="absolute -left-2 -bottom-1"><Swords className="h-3 w-3 text-red-300" /></span>}
                </span>
                <span className={`px-1.5 py-0.5 bg-black/80 text-[9px] font-display uppercase tracking-wider whitespace-nowrap ${isSelected ? 'text-game-gold' : 'text-zinc-100'} ${(zoom < 1.1 && !isSelected && !isCurrent && !isHover) ? 'hidden' : ''}`}>{p.name}</span>
                {isCurrent && <span className="px-1.5 py-0.5 bg-game-gold text-black text-[8px] font-bold uppercase">Thou art here</span>}
                {(layer === 'warfare' && m && m.resistance_level > 0) && <span className="px-1.5 py-0.5 bg-red-950/90 border border-red-700 text-[8px] text-red-200">Resistance {m.resistance_level}{armiesHere.length ? ` · ${armiesHere.length} host(s)` : ''}</span>}
                {layer === 'economy' && <span className="px-1.5 py-0.5 bg-sky-950/90 border border-sky-700 text-[8px] text-sky-200">{p.resources.join(' · ')}</span>}
              </button>
            );
          })}

          {/* Travelling banner animation */}
          {travellingFrom && travellingTo && (() => {
            const [fx, fy] = posFor(travellingFrom), [tx, ty] = posFor(travellingTo);
            return (
              <div className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: `${fx}%`, top: `${(fy / 65.4) * 100}%`, transition: reducedMotion ? 'none' : 'all 900ms cubic-bezier(0.4,0,0.2,1)', left2: undefined } as any}>
                <span className="h-8 w-8 rounded-full border-2 border-game-gold bg-zinc-950 flex items-center justify-center text-game-gold shadow-[0_0_16px_rgba(229,193,88,0.9)]"><Navigation className="h-4 w-4 animate-spin" /></span>
                {/* keyframe move to dest */}
                <style dangerouslySetInnerHTML={{ __html: '' }} />
              </div>
            );
          })()}
          {/* Marker animates via CSS custom prop fallback */}
          {travellingTo && travellingFrom && <style>{`@keyframes aegis-travel { from { left: ${posFor(travellingFrom)[0]}%; top: ${(posFor(travellingFrom)[1] / 65.4) * 100}%; } to { left: ${posFor(travellingTo)[0]}%; top: ${(posFor(travellingTo)[1] / 65.4) * 100}%; } }`}</style>}
        </div>
      </div>

      {/* Top HUD overlay */}
      <div className="absolute top-0 inset-x-0 z-30 p-3 md:p-4 flex flex-wrap items-start justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto rpg-panel-stone px-4 py-3 max-w-sm">
          <p className="text-[9px] uppercase tracking-[0.3em] text-game-gold font-display">Al-Andalus · 1031 CE</p>
          <h1 className="text-lg md:text-xl font-display text-game-gold leading-tight">{myBanner}</h1>
          <p className="font-serif text-xs text-zinc-300">{realmName} · {stats?.level || 1} · {profile?.role?.replace('_',' ') || 'lord'}</p>
          <div className="flex gap-3 mt-1 text-[10px] font-pixel">
            <span className="text-red-300">EP {stats?.energy ?? 100}</span>
            <span className="text-game-emerald">{currencies?.local_currency_balance?.toFixed(0) ?? 0} LC</span>
            <span className="text-game-gold">Wood {qty(1)} · Grain {qty(5)} · Iron {qty(3)} · Fish {qty(6)}</span>
          </div>
          <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1"><Calendar className="h-3 w-3" /> 1031 · Taifa leagues · {regions?.find((r: any) => r.id === profile?.current_region_id)?.name || '—'}</p>
        </div>

        <div className="pointer-events-auto flex flex-wrap gap-1 items-center justify-end">
          <span className="rpg-panel-stone px-3 py-2 text-[10px] uppercase tracking-widest text-game-gold font-display hidden md:flex items-center gap-1"><Bell className="h-3 w-3" /> {activeWars?.filter((w: any) => w.status === 'active').length || 0} wars</span>
          {(Object.keys(LAYER_LABELS) as MapLayer[]).map((l) => (
            <button key={l} role="tab" aria-selected={layer === l} onClick={() => { setLayer(l); sfx.playClick(); }} className={`rpg-button px-3 py-2 text-[10px] tracking-widest ${layer === l ? 'rpg-button-emerald' : ''}`}>{LAYER_LABELS[l]}</button>
          ))}
        </div>
      </div>

      {/* Tutorial / contextual hint */}
      {tutorial && (
        <div className="absolute top-28 md:top-24 left-3 md:left-4 z-30 max-w-xs pointer-events-auto rpg-panel-parchment p-4">
          <p className="font-display text-sm">Squire’s first commands</p>
          <p className="font-serif text-xs leading-relaxed">{tutorial.text}</p>
          <button onClick={() => { try { localStorage.setItem('aegis_world_tutorial_seen', '1'); } catch {} router.refresh(); }} className="text-[10px] underline mt-2">Dismiss</button>
        </div>
      )}

      {/* Action banner */}
      {message && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-[90vw] px-4 py-3 border-l-4 border-emerald-600 bg-zinc-950/90 text-emerald-200 text-xs font-display uppercase tracking-widest shadow-xl">{message}</div>}
      {error && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-[90vw] px-4 py-3 border-l-4 border-red-600 bg-zinc-950/90 text-red-200 text-xs font-display uppercase tracking-widest shadow-xl">{error}</div>}

      {/* Zoom + compass */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2 z-30">
        <span className="px-2 py-1 bg-black/70 text-[9px] uppercase tracking-widest text-game-gold font-display">{LAYER_LABELS[layer]} · {Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom((z) => Math.max(0.8, z - 0.2))} className="rpg-button p-2" aria-label="Zoom out"><Minus className="h-4 w-4" /></button>
        <button onClick={() => setZoom((z) => Math.min(2.8, z + 0.2))} className="rpg-button p-2" aria-label="Zoom in"><Plus className="h-4 w-4" /></button>
        <button onClick={() => { setPan({ x: 0, y: 0 }); setSelectedId(profile?.current_region_id || 1); }} className="rpg-button p-2" aria-label="Focus on my province"><Navigation className="h-4 w-4" /></button>
        <span className="hidden md:block px-2 py-1 bg-black/70 text-[9px] uppercase tracking-widest text-zinc-300 font-display">Inked chart of Al-Andalus · drag to pan · scroll to zoom</span>
      </div>

      {/* Contextual province panel */}
      {panelOpen && selected && lore && (
        <aside className="absolute z-40 right-0 top-0 h-full w-full sm:w-[380px] bg-zinc-950/95 border-l-4 border-game-gold/40 overflow-y-auto shadow-2xl">
          <div className="p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-game-gold font-display">{countries?.find((c: any) => c.id === effectiveCountryId)?.name} province</p>
                <h2 className="text-2xl font-display text-game-gold">{selected.name}</h2>
                <p className="font-serif italic text-zinc-400 text-sm">{lore.subtitle} · {lore.terrain}</p>
              </div>
              <button onClick={() => setPanelOpen(false)} className="rpg-button p-2 shrink-0" aria-label="Close province panel"><X className="h-4 w-4" /></button>
            </div>
            <p className="font-serif text-sm leading-relaxed text-zinc-300">{lore.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="border border-zinc-800 p-2"><span className="text-zinc-500 uppercase tracking-widest text-[9px]">Terrain</span><div className="font-display">{lore.terrain}</div></div>
              <div className="border border-zinc-800 p-2"><span className="text-zinc-500 uppercase tracking-widest text-[9px]">Population</span><div className="font-display">{selected.population?.toLocaleString()}</div></div>
              <div className="border border-zinc-800 p-2"><span className="text-zinc-500 uppercase tracking-widest text-[9px]">Owner</span><div className="font-display">{mil?.owner_name || countries?.find((c: any) => c.id === effectiveCountryId)?.name}</div></div>
              <div className="border border-zinc-800 p-2"><span className="text-zinc-500 uppercase tracking-widest text-[9px]">Resistance</span><div className="font-display">{mil?.resistance_level ?? '—'}</div></div>
            </div>
            {mil && !isMine && mil.resistance_level > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">Siege pressure</p>
                <div className="h-3 bg-zinc-800 border border-zinc-700"><div className="h-full bg-red-700" style={{ width: `${siegeProgress}%` }} /></div>
                <p className="text-[10px] text-zinc-400 mt-1">{100 - siegeProgress}% holds.</p>
              </div>
            )}
            <p className="text-xs text-zinc-400">Marching roads to: {neighbors.map((n) => PROVINCE_MAP[n]?.name || `Province ${n}`).join(', ')}.</p>

            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-game-gold font-display flex items-center gap-2"><Axe className="h-3 w-3" /> Gather here</p>
              <div className="flex flex-wrap gap-2">
                {spawnOptions.map((rid) => (
                  <button key={rid} disabled={actionLoading} onClick={() => handleGather(rid)} className="rpg-button px-3 py-2 text-[10px]">Gather {resourceName(rid)} · have {qty(rid)}</button>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-4 space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-game-gold font-display">Thy commands</p>
              <div className="grid grid-cols-2 gap-2">
                <button disabled={actionLoading || selected.id === profile?.current_region_id} onClick={handleTravel} title={selected.id === profile?.current_region_id ? 'Thou already dwell here' : `Travel to ${selected.name}`} className="rpg-button px-3 py-2 text-[10px] flex items-center gap-1"><Navigation className="h-3 w-3" /> Travel</button>
                <button disabled={actionLoading} onClick={handleRecruit} className="rpg-button px-3 py-2 text-[10px] flex items-center gap-1"><Swords className="h-3 w-3" /> Recruit host</button>
                <a href="/marketplace" className="rpg-button px-3 py-2 text-[10px] text-center flex items-center gap-1 justify-center"><Coins className="h-3 w-3" /> Marketplace</a>
                <a href="/economy" className="rpg-button px-3 py-2 text-[10px] text-center">Economy</a>
              </div>
              {!isMine && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs text-zinc-400 flex items-center gap-2"><Flag className="h-3 w-3" /> Foreign province — war requires cause and rations.</p>
                  <div className="flex flex-wrap gap-2">
                    <button disabled={actionLoading} onClick={handleDeclare} className="rpg-button rpg-button-crimson px-3 py-2 text-[10px]">Declare war</button>
                    <button disabled={actionLoading} onClick={handleMobilize} className="rpg-button px-3 py-2 text-[10px]">Mobilise host</button>
                    <button disabled={actionLoading || !myHost || !neighbors.includes(selected.id)} onClick={handleMoveToSelected} title={!myHost ? 'Recruit a host first' : !neighbors.includes(selected.id) ? 'No road to here — march via a neighbour' : 'March host here'} className="rpg-button px-3 py-2 text-[10px]">March host here</button>
                  </div>
                  {myHost && myHost.current_region_id === selected.id && (
                    <div className="flex flex-wrap gap-2">
                      <button disabled={actionLoading} onClick={handleEngage} className="rpg-button rpg-button-crimson px-3 py-2 text-[10px]">Engage in battle</button>
                      <button disabled={actionLoading || myHost.status !== 'defending' && myHost.status !== 'marching' && myHost.status !== 'idle'} onClick={handleSiegeStart} title="Engage first, then besiege" className="rpg-button px-3 py-2 text-[10px]">Begin siege</button>
                      <button disabled={actionLoading || myHost.status !== 'sieging'} onClick={handleSiegeProgress} title={myHost.status !== 'sieging' ? 'Begin a siege first' : 'Press the siege'} className="rpg-button rpg-button-emerald px-3 py-2 text-[10px]">Press the siege</button>
                      <button disabled={actionLoading || myHost.status !== 'sieging'} onClick={handleLift} className="rpg-button px-3 py-2 text-[10px]">Lift siege</button>
                    </div>
                  )}
                  {myHost && myHost.status === 'marching' && <p className="text-[10px] text-zinc-400 flex items-center gap-1"><Swords className="h-3 w-3 animate-pulse" /> Host marching to {selected.name}…</p>}
                  {myHost && myHost.status === 'sieging' && <p className="text-[10px] text-red-300">Siege in progress at {selected.name}.</p>}
                </div>
              )}
              {lastBattleReport && lastBattleReport.regionName === selected.name && (
                <div className="rpg-panel-parchment p-3 text-zinc-900">
                  <p className="font-display text-sm">Last battle — {lastBattleReport.regionName}</p>
                  <p className="font-serif text-xs">{lastBattleReport.outcome} · Thine {lastBattleReport.attackerSizeAfter}/{lastBattleReport.attackerSizeBefore} · Theirs {lastBattleReport.defenderSizeAfter}/{lastBattleReport.defenderSizeBefore} · {lastBattleReport.casualties} fallen · Resistance {lastBattleReport.resistanceAfter}</p>
                  <p className="font-serif text-xs italic mt-1">{lastBattleReport.rounds?.join(' ')}</p>
                </div>
              )}
              <p className="text-[10px] text-zinc-500 font-serif italic">Wars live: {(activeWars || []).filter((w: any) => w.status === 'active').length} · Hosts: {(armyUnits || []).filter((a: any) => a.country_id === profile?.citizenship_country_id).length}</p>
            </div>
          </div>
        </aside>
      )}

      {/* Bottom-left contextual hint on selected province */}
      {!panelOpen && selected && (
        <button onClick={() => setPanelOpen(true)} className="absolute bottom-3 left-3 z-30 rpg-panel-stone px-4 py-3 text-left max-w-[260px]">
          <p className="text-[9px] uppercase tracking-widest text-game-gold font-display">{selected.name}</p>
          <p className="font-serif text-xs text-zinc-300">{PROVINCE_MAP[selected.id]?.subtitle} — open the province ledger</p>
        </button>
      )}
    </div>
  );
}
