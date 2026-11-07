'use client';

import { useMemo, useState } from 'react';
import { useGameContext } from '../layout';
import { PROVINCE_MAP, getNeighbors } from '../../../lib/worldLore';

export default function MilitaryPage() {
  const {
    profile, armyUnits, militaryRegions, activeWars, peaceTreaties, regionEdges, countries,
    recruitArmy, declareWar, mobilizeArmy, moveArmy, engageBattle, initiateSiege, progressSiege, liftSiege,
    lastBattleReport, actionLoading, refreshData,
  } = useGameContext() as any;
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [targetCountry, setTargetCountry] = useState<number>(2);
  const [selectedArmyId, setSelectedArmyId] = useState<number | null>(null);
  const [moveTarget, setMoveTarget] = useState<number>(2);

  const myArmies = useMemo(() => (armyUnits || []).filter((a: any) => a.country_id === profile?.citizenship_country_id), [armyUnits, profile]);
  const selectedArmy = myArmies.find((a: any) => a.id === selectedArmyId) || myArmies[0];
  const neighborsOf = selectedArmy ? getNeighbors(regionEdges || [], selectedArmy.current_region_id) : [];
  const myMil = selectedArmy ? (militaryRegions || []).find((m: any) => m.region_id === selectedArmy.current_region_id) : undefined;
  const isForeign = myMil && myMil.owner_country_id !== profile?.citizenship_country_id;
  const siegePct = myMil ? Math.min(100, Math.max(0, 100 - myMil.resistance_level)) : 0;

  const flash = (ok: boolean, text: string) => { if (ok) { setMsg(text); setErr(null); } else { setErr(text); setMsg(null); } };

  const doRecruit = async () => { const r = await recruitArmy(); flash(r.success, r.success ? `Host #${r.armyId} recruited (5 grain, 2 iron, 3 fish).` : r.error); if (r.success) setSelectedArmyId(r.armyId); };
  const doDeclare = async () => { const r = await declareWar(targetCountry); flash(r.success, r.success ? `War declared on ${countries?.find((c:any)=>c.id===targetCountry)?.name}.` : r.error); };
  const doMobilize = async () => { const r = await mobilizeArmy(); flash(r.success, r.success ? `Host #${r.armyId} mobilised.` : r.error); };
  const doMove = async () => { if (!selectedArmy) return; const r = await moveArmy(selectedArmy.id, moveTarget); flash(r.success, r.success ? `March to ${PROVINCE_MAP[moveTarget]?.name || moveTarget} complete.` : r.error); };
  const doEngage = async () => { if (!selectedArmy) return; const r = await engageBattle(selectedArmy.id, selectedArmy.current_region_id); flash(r.success, r.success ? `Battle: ${r.outcome}. Now besiege.` : r.error); await refreshData(); };
  const doSiegeStart = async () => { if (!selectedArmy) return; const r = await initiateSiege(selectedArmy.id, selectedArmy.current_region_id); flash(r.success, r.success ? 'Siege begun.' : r.error); };
  const doSiegeProgress = async () => { if (!selectedArmy) return; const r = await progressSiege(selectedArmy.id, selectedArmy.current_region_id); flash(r.success, r.success ? (r.provinceCaptured ? 'The province has fallen!' : 'The siege presses on.') : r.error); await refreshData(); };
  const doLift = async () => { if (!selectedArmy) return; const r = await liftSiege(selectedArmy.id, selectedArmy.current_region_id); flash(r.success, r.success ? 'Siege lifted.' : r.error); };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-display text-game-gold">The Military</h1>
        <p className="font-serif text-sm text-zinc-400">Recruit → Mobilize → March → Engage → Besiege → Conquer. Field victory never captures — only a siege does.</p>
      </header>
      {msg && <div className="p-3 border-l-4 border-emerald-600 bg-emerald-950/30 text-emerald-300 text-xs font-display">{msg}</div>}
      {err && <div className="p-3 border-l-4 border-red-600 bg-red-950/30 text-red-300 text-xs font-display">{err}</div>}

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="rpg-panel-stone p-5 space-y-3">
          <h2 className="font-display text-game-gold">Raise hosts</h2>
          <button disabled={actionLoading} onClick={doRecruit} className="rpg-button w-full py-3 text-xs">Recruit host — 5 grain, 2 iron, 3 fish</button>
          <button disabled={actionLoading} onClick={doMobilize} className="rpg-button w-full py-3 text-xs">Mobilise host — 3 grain, 1 iron, 2 fish</button>
          <div>
            <label className="text-[10px] uppercase tracking-widest">Adversary realm</label>
            <select value={targetCountry} onChange={(e) => setTargetCountry(Number(e.target.value))} className="rpg-input w-full px-3 py-3 mt-1">
              {(countries || []).filter((c:any)=>c.id!==profile?.citizenship_country_id).map((c:any)=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button disabled={actionLoading} onClick={doDeclare} className="rpg-button rpg-button-crimson w-full py-3 text-xs">Declare war</button>
          <p className="text-xs font-serif text-zinc-500">Active wars: {(activeWars||[]).filter((w:any)=>w.status==='active').length}.</p>
        </section>

        <section className="rpg-panel-stone p-5 space-y-3">
          <h2 className="font-display text-game-gold">Command thy host</h2>
          <label className="text-[10px] uppercase tracking-widest">Host</label>
          <select value={selectedArmy?.id ?? ''} onChange={(e) => setSelectedArmyId(Number(e.target.value))} className="rpg-input w-full px-3 py-3">
            {myArmies.map((a:any)=><option key={a.id} value={a.id}>Host #{a.id} · {a.size} spears · {a.status} · {PROVINCE_MAP[a.current_region_id]?.name || a.current_region_id}</option>)}
          </select>
          {selectedArmy ? (
            <div className="text-sm space-y-2">
              <div className="border border-zinc-800 p-3 flex gap-3 items-center">
                <div className="h-12 w-10 shrink-0 flex items-center justify-center border-2 border-game-gold/50" style={{ background: selectedArmy.status === 'sieging' ? '#7a1f1f' : selectedArmy.status === 'marching' ? '#1f3a6e' : '#2f5d3a' }}>
                  <span className="text-game-gold font-display">{selectedArmy.status[0].toUpperCase()}</span>
                </div>
                <div className="text-xs space-y-0.5">
                  <p className="font-display text-sm">{selectedArmy.status === 'marching' ? 'Marching…' : selectedArmy.status === 'sieging' ? 'Sieging…' : selectedArmy.status}</p>
                  <p className="font-serif">Morale {selectedArmy.morale} · Rations {selectedArmy.rations_qty} · Ammo {selectedArmy.ammo_qty}</p>
                  <p className="text-zinc-400">{isForeign ? `Foreign ground: ${PROVINCE_MAP[selectedArmy.current_region_id]?.name} (${myMil?.owner_name}) · Resistance ${myMil?.resistance_level}` : `Thine ground: ${PROVINCE_MAP[selectedArmy.current_region_id]?.name}`}</p>
                </div>
              </div>
              {selectedArmy.status === 'sieging' && myMil && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">Fortification</p>
                  <div className="h-3 bg-zinc-800 border border-zinc-700"><div className="h-full bg-red-700" style={{ width: `${siegePct}%` }} /></div>
                </div>
              )}
              <div>
                <label className="text-[10px] uppercase tracking-widest">March to (roads only)</label>
                <select value={moveTarget} onChange={(e) => setMoveTarget(Number(e.target.value))} className="rpg-input w-full px-3 py-3 mt-1">
                  {neighborsOf.map((n:number)=><option key={n} value={n}>{PROVINCE_MAP[n]?.name || `Province ${n}`}</option>)}
                </select>
              </div>
              <button disabled={actionLoading || !neighborsOf.length || selectedArmy.status === 'sieging'} onClick={doMove} title={selectedArmy.status === 'sieging' ? 'Lift the siege before marching' : 'March along a road'} className="rpg-button w-full py-2 text-xs">March</button>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button disabled={actionLoading || !isForeign || selectedArmy.status === 'sieging'} onClick={doEngage} title={!isForeign ? 'Thine own province — nothing to engage' : selectedArmy.status === 'sieging' ? 'Already besieging' : 'Engage the garrison'} className="rpg-button rpg-button-crimson py-2 text-[10px]">Engage in battle</button>
                <button disabled={actionLoading || !isForeign || selectedArmy.status === 'sieging' || (myMil?.resistance_level ?? 0) === 0} onClick={doSiegeStart} title={!isForeign ? 'Thine own province' : selectedArmy.status === 'sieging' ? 'Already besieging' : 'Begin siege after engagement'} className="rpg-button py-2 text-[10px]">Begin siege</button>
                <button disabled={actionLoading || selectedArmy.status !== 'sieging'} onClick={doSiegeProgress} title={selectedArmy.status !== 'sieging' ? 'Begin a siege first' : 'Press the siege'} className="rpg-button rpg-button-emerald py-2 text-[10px]">Press siege</button>
                <button disabled={actionLoading || selectedArmy.status !== 'sieging'} onClick={doLift} title={selectedArmy.status !== 'sieging' ? 'No siege to lift' : 'Lift siege'} className="rpg-button py-2 text-[10px]">Lift siege</button>
              </div>
            </div>
          ) : <p className="font-serif text-sm text-zinc-400">Recruit a host first.</p>}
        </section>

        <section className="rpg-panel-stone p-5 space-y-3">
          <h2 className="font-display text-game-gold">The field report</h2>
          {lastBattleReport ? (
            <div className="rpg-panel-parchment p-4 text-zinc-900 space-y-2">
              <p className="font-display">{lastBattleReport.regionName} — {lastBattleReport.outcome}</p>
              <p className="font-serif text-xs">Thine {lastBattleReport.attackerSizeAfter}/{lastBattleReport.attackerSizeBefore} · Theirs {lastBattleReport.defenderSizeAfter}/{lastBattleReport.defenderSizeBefore} · {lastBattleReport.casualties} fallen · Morale {lastBattleReport.moraleAfter} · Resistance {lastBattleReport.resistanceAfter}</p>
              <ul className="list-disc pl-5 font-serif text-xs space-y-1">{(lastBattleReport.rounds||[]).map((r:string,i:number)=><li key={i}>{r}</li>)}</ul>
              <p className="text-[10px] uppercase tracking-widest">{lastBattleReport.siegeRequired ? 'Siege required to capture' : 'Conquered'} {lastBattleReport.provinceCaptured ? '· Province taken' : ''}</p>
            </div>
          ) : <p className="font-serif text-sm text-zinc-400">No battle yet this visit. Engage a foreign host to write the first report.</p>}
          <h3 className="font-display text-sm text-zinc-300 mt-4">Provinces of war</h3>
          <div className="space-y-1 max-h-52 overflow-auto text-xs">
            {(militaryRegions||[]).map((m:any)=>(
              <div key={m.region_id} className="flex justify-between border-b border-zinc-800 pb-1">
                <span>{PROVINCE_MAP[m.region_id]?.name || m.region_name}</span><span>{m.owner_name} · {m.resistance_level}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
