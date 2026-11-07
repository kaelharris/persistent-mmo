'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameContext } from '../layout';
import { PROVINCE_MAP, REALMS, MapLayer, getNeighbors } from '../../../lib/worldLore';
import {
  Anchor, Castle, Trees, Pickaxe, Home, Mountain, Wheat, Landmark, CupSoda,
  Navigation, Axe, Swords, Flag, Shield, Coins, X, Calendar, Bell, ScrollText,
} from 'lucide-react';
import { useSFX } from '../../../hooks/useSFX';
import WorldMap from '../../../components/game/map/WorldMap';
import { RealmFlag } from '../../../components/game/map/heraldry';

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

export default function WorldPage() {
  const {
    profile, stats, currencies, regions, countries, playerCharacter, isInitialLoading,
    militaryRegions, armyUnits, activeWars, regionEdges, playerResources, gatherLogs,
    resources, gather, travel, recruitArmy, declareWar, mobilizeArmy, moveArmy, engageBattle,
    initiateSiege, progressSiege, liftSiege, actionLoading, triggerFloatingText, lastBattleReport,
    refreshData,
  } = useGameContext() as any;
  const router = useRouter();
  const sfx = useSFX();

  const [layer, setLayer] = useState<MapLayer>('political');
  const [selectedId, setSelectedId] = useState<number>(profile?.current_region_id || 1);
  const [panelOpen, setPanelOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [travellingTo, setTravellingTo] = useState<number | null>(null);
  const [travellingFrom, setTravellingFrom] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) return;
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

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

  const myBanner = playerCharacter ? `${playerCharacter.name} ${playerCharacter.epithet}` : profile?.username || 'Unnamed';
  const realmName = countries?.find((c: any) => c.id === (playerCharacter?.kingdom_id || profile?.citizenship_country_id))?.name || '—';
  const siegeProgress = mil && mil.resistance_level <= 60 && !isMine ? Math.min(100, Math.max(0, 100 - mil.resistance_level)) : 0;
  const ownerName = countries?.find((c: any) => c.id === effectiveCountryId)?.name || mil?.owner_name || 'Unsworn march';

  return (
    <div className="world-screen relative w-full h-full min-h-0 overflow-hidden">
      <style>{`
        @keyframes mapTravelPulse { from { opacity:.25; transform:scale(.8) } to { opacity:0; transform:scale(1.8) } }
        @keyframes mapFlagRise { from { opacity:0; transform:translateY(5px) } to { opacity:1; transform:none } }
      `}</style>

      <WorldMap
        regions={regions}
        militaryRegions={militaryRegions}
        countries={countries}
        regionEdges={regionEdges}
        armyUnits={armyUnits}
        activeWars={activeWars}
        profile={profile}
        playerCharacter={playerCharacter}
        layer={layer}
        onLayerChange={(next) => { setLayer(next); sfx.playClick(); }}
        selectedId={selectedId}
        onSelect={(id) => { setSelectedId(id); setPanelOpen(true); sfx.playClick(); }}
      />

      {/* Identity cartouche */}
      <div className="map-cartouche rw-panel pointer-events-auto">
        <p className="text-[9px] uppercase tracking-[0.3em] text-[#D8AE68] font-display flex items-center gap-2"><ScrollText className="h-3 w-3" /> Al-Andalus · 1031 CE</p>
        <h1 className="text-base sm:text-lg md:text-xl font-display text-[#F2E8D5] leading-tight">{myBanner}</h1>
        <p className="font-serif text-[11px] text-[#B6AE9B]">{realmName} · {stats?.level || 1} · {profile?.role?.replace('_', ' ') || 'lord'}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[10px] font-pixel">
          <span className="text-[#c98a88]">EP {stats?.energy ?? 100}</span>
          <span className="text-[#8fbea6]">{currencies?.local_currency_balance?.toFixed(0) ?? 0} LC</span>
          <span className="hidden sm:inline text-[#D8AE68]">Wood {qty(1)} · Grain {qty(5)} · Iron {qty(3)} · Fish {qty(6)}</span>
        </div>
        <p className="hidden sm:flex text-[10px] text-[#B6AE9B] mt-1 items-center gap-1"><Calendar className="h-3 w-3" /> 1031 · Taifa leagues · {regions?.find((r: any) => r.id === profile?.current_region_id)?.name || '—'}</p>
      </div>

      {/* Tutorial / contextual hint */}
      {tutorial && (
        <div className="map-tutorial rw-panel pointer-events-auto">
          <p className="font-display text-sm text-[#D8AE68]">Squire’s first commands</p>
          <p className="font-serif text-[11px] leading-relaxed text-[#F2E8D5]">{tutorial.text}</p>
          <button onClick={() => { try { localStorage.setItem('aegis_world_tutorial_seen', '1'); } catch {} router.refresh(); }} className="text-[10px] underline mt-2 text-[#B6AE9B]">Dismiss</button>
        </div>
      )}

      {/* Action banner */}
      {message && <div className="map-toast is-ok">{message}</div>}
      {error && <div className="map-toast is-error">{error}</div>}

      {/* Selected province shortcut */}
      {!panelOpen && selected && (
        <button onClick={() => setPanelOpen(true)} className="map-selected-hint rw-panel pointer-events-auto">
          <RealmFlag realmId={effectiveCountryId} className="h-5 w-7 shrink-0" />
          <span className="min-w-0 text-left">
            <span className="block text-[9px] uppercase tracking-widest text-[#D8AE68] font-display">{selected.name}</span>
            <span className="block font-serif text-[11px] text-[#B6AE9B] truncate">{lore?.subtitle} — open the province ledger</span>
          </span>
        </button>
      )}

      {/* Contextual province ledger */}
      {panelOpen && selected && lore && (
        <aside className={`province-ledger rw-panel${panelOpen ? ' is-open' : ''}`} aria-label={`${selected.name} province ledger`}>
          <div className="province-ledger-scroll">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <RealmFlag realmId={effectiveCountryId} className="h-8 w-12 shrink-0 mt-1" />
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.26em] text-[#D8AE68] font-display truncate">{ownerName} province</p>
                  <h2 className="text-2xl font-display text-[#D8AE68] leading-tight">{selected.name}</h2>
                  <p className="font-serif italic text-[#B6AE9B] text-xs">{lore.subtitle} · {lore.terrain}</p>
                </div>
              </div>
              <button onClick={() => setPanelOpen(false)} className="rw-btn shrink-0" data-variant="dark" aria-label="Close province panel"><X className="h-4 w-4" /></button>
            </div>

            <p className="font-serif text-sm leading-relaxed text-[#F2E8D5] mt-3">{lore.description}</p>

            <div className="grid grid-cols-2 gap-2 text-xs mt-4">
              <div className="ledger-stat"><span>Terrain</span><strong>{lore.terrain}</strong></div>
              <div className="ledger-stat"><span>Population</span><strong>{selected.population?.toLocaleString()}</strong></div>
              <div className="ledger-stat"><span>Owner</span><strong>{ownerName}</strong></div>
              <div className="ledger-stat"><span>Resistance</span><strong>{mil?.resistance_level ?? '—'}</strong></div>
            </div>

            {mil && !isMine && mil.resistance_level > 0 && (
              <div className="mt-4">
                <p className="text-[9px] uppercase tracking-widest text-[#B6AE9B] mb-1">Siege pressure</p>
                <div className="h-2.5 bg-[#0A1019] border border-[#6b5836]"><div className="h-full bg-[#A54D4C]" style={{ width: `${siegeProgress}%` }} /></div>
                <p className="text-[10px] text-[#B6AE9B] mt-1">{100 - siegeProgress}% holds.</p>
              </div>
            )}

            <p className="text-[11px] text-[#B6AE9B] mt-3">Marching roads to: {neighbors.map((n) => PROVINCE_MAP[n]?.name || `Province ${n}`).join(', ')}.</p>

            <div className="mt-4">
              <p className="ledger-heading"><Axe className="h-3.5 w-3.5" /> Gather here</p>
              <div className="flex flex-wrap gap-2">
                {spawnOptions.map((rid) => (
                  <button key={rid} disabled={actionLoading} onClick={() => handleGather(rid)} className="rw-btn" data-variant="bronze">Gather {resourceName(rid)} · have {qty(rid)}</button>
                ))}
              </div>
            </div>

            <div className="ledger-divider">
              <p className="ledger-heading">Thy commands</p>
              <div className="grid grid-cols-2 gap-2">
                <button disabled={actionLoading || selected.id === profile?.current_region_id} onClick={handleTravel} title={selected.id === profile?.current_region_id ? 'Thou already dwell here' : `Travel to ${selected.name}`} className="rw-btn"><Navigation className="h-3.5 w-3.5" /> Travel</button>
                <button disabled={actionLoading} onClick={handleRecruit} className="rw-btn" data-variant="bronze"><Swords className="h-3.5 w-3.5" /> Recruit host</button>
                <a href="/marketplace" className="rw-btn" data-variant="dark"><Coins className="h-3.5 w-3.5" /> Marketplace</a>
                <a href="/economy" className="rw-btn" data-variant="dark">Economy</a>
              </div>

              {!isMine && (
                <div className="mt-3 space-y-2">
                  <p className="text-[11px] text-[#B6AE9B] flex items-center gap-2"><Flag className="h-3.5 w-3.5 text-[#D8AE68]" /> Foreign province — war requires cause and rations.</p>
                  <div className="flex flex-wrap gap-2">
                    <button disabled={actionLoading} onClick={handleDeclare} className="rw-btn" data-variant="red">Declare war</button>
                    <button disabled={actionLoading} onClick={handleMobilize} className="rw-btn" data-variant="bronze">Mobilise host</button>
                    <button disabled={actionLoading || !myHost || !neighbors.includes(selected.id)} onClick={handleMoveToSelected} title={!myHost ? 'Recruit a host first' : !neighbors.includes(selected.id) ? 'No road to here — march via a neighbour' : 'March host here'} className="rw-btn" data-variant="dark">March host here</button>
                  </div>
                  {myHost && myHost.current_region_id === selected.id && (
                    <div className="flex flex-wrap gap-2">
                      <button disabled={actionLoading} onClick={handleEngage} className="rw-btn" data-variant="red">Engage in battle</button>
                      <button disabled={actionLoading || (myHost.status !== 'defending' && myHost.status !== 'marching' && myHost.status !== 'idle')} onClick={handleSiegeStart} title="Engage first, then besiege" className="rw-btn" data-variant="bronze">Begin siege</button>
                      <button disabled={actionLoading || myHost.status !== 'sieging'} onClick={handleSiegeProgress} title={myHost.status !== 'sieging' ? 'Begin a siege first' : 'Press the siege'} className="rw-btn" data-variant="green">Press the siege</button>
                      <button disabled={actionLoading || myHost.status !== 'sieging'} onClick={handleLift} className="rw-btn" data-variant="dark">Lift siege</button>
                    </div>
                  )}
                  {myHost && myHost.status === 'marching' && <p className="text-[10px] text-[#B6AE9B] flex items-center gap-1"><Swords className="h-3 w-3 animate-pulse" /> Host marching to {selected.name}…</p>}
                  {myHost && myHost.status === 'sieging' && <p className="text-[10px] text-[#c98a88]">Siege in progress at {selected.name}.</p>}
                </div>
              )}

              {lastBattleReport && lastBattleReport.regionName === selected.name && (
                <div className="ledger-report">
                  <p className="font-display text-sm">Last battle — {lastBattleReport.regionName}</p>
                  <p className="font-serif text-[11px]">{lastBattleReport.outcome} · Thine {lastBattleReport.attackerSizeAfter}/{lastBattleReport.attackerSizeBefore} · Theirs {lastBattleReport.defenderSizeAfter}/{lastBattleReport.defenderSizeBefore} · {lastBattleReport.casualties} fallen · Resistance {lastBattleReport.resistanceAfter}</p>
                  <p className="font-serif text-[11px] italic mt-1">{lastBattleReport.rounds?.join(' ')}</p>
                </div>
              )}

              <p className="text-[10px] text-[#B6AE9B]/70 font-serif italic mt-3 flex items-center gap-2"><Bell className="h-3 w-3" /> Wars live: {(activeWars || []).filter((w: any) => w.status === 'active').length} · Hosts: {(armyUnits || []).filter((a: any) => a.country_id === profile?.citizenship_country_id).length}</p>
            </div>
          </div>
        </aside>
      )}

      {/* Travelling pulse is purely decorative; gameplay travel already committed above. */}
      {travellingTo && travellingFrom && (
        <div className="map-travel-pulse" aria-hidden="true" />
      )}
    </div>
  );
}
