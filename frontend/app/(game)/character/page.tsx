'use client';

import { useMemo, useState } from 'react';
import { useGameContext } from '../layout';

export default function CharacterPage() {
  const { profile, stats, playerCharacter, playerResources, resources, countries, upgradeProfession, actionLoading, refreshData, inventory, itemTemplates } = useGameContext() as any;
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const rows = useMemo(() => (playerResources || []).map((pr: any) => ({
    ...pr,
    name: (resources || []).find((r: any) => r.id === pr.resource_id)?.name || pr.resource_id,
  })).sort((a: any, b: any) => b.quantity - a.quantity), [playerResources, resources]);

  const craftedRows = useMemo(() => {
    const by: Record<number, number> = {};
    for (const i of inventory || []) { if (i.owner_id !== 'escrow' && i.quantity > 0) by[i.item_template_id] = (by[i.item_template_id] || 0) + i.quantity; }
    return Object.entries(by).map(([id, qty]) => ({ id: Number(id), name: (itemTemplates || []).find((t: any) => t.id === Number(id))?.name || `Item ${id}`, qty }));
  }, [inventory, itemTemplates]);

  const train = async () => {
    const res = await upgradeProfession(120);
    if (res.success) { setMsg(`Rank raised to ${res.newRank}.`); setErr(null); } else { setErr(res.error); setMsg(null); }
  };

  if (!playerCharacter) {
    return (
      <div className="rpg-panel-parchment p-6 max-w-lg">
        <h1 className="font-display text-xl">Thou art yet unwritten</h1>
        <p className="font-serif mt-2">Forge thy character, swear to a realm, and choose a craft.</p>
        <a href="/onboarding" className="rpg-button inline-block mt-4 px-5 py-3 text-xs">Begin the Rite</a>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <section className="rpg-panel-stone p-6 space-y-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-game-gold font-display">Character parchment</p>
        <h1 className="text-3xl font-display text-game-gold">{playerCharacter.name} <span className="font-serif italic text-lg text-zinc-300">{playerCharacter.epithet}</span></h1>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="border border-zinc-800 p-3"><div className="text-[9px] uppercase tracking-widest text-zinc-500">Realm</div><div className="font-display">{countries?.find((c:any)=>c.id===playerCharacter.kingdom_id)?.name}</div></div>
          <div className="border border-zinc-800 p-3"><div className="text-[9px] uppercase tracking-widest text-zinc-500">Profession</div><div className="font-display capitalize">{playerCharacter.profession} · Rank {playerCharacter.profession_rank}</div></div>
          <div className="border border-zinc-800 p-3"><div className="text-[9px] uppercase tracking-widest text-zinc-500">Level</div><div className="font-display">{stats?.level} · {stats?.experience} XP</div></div>
          <div className="border border-zinc-800 p-3"><div className="text-[9px] uppercase tracking-widest text-zinc-500">Energy</div><div className="font-display">{stats?.energy}/100</div></div>
        </div>
        <p className="font-serif text-sm text-zinc-300">{playerCharacter.origin}.</p>
        <p className="font-serif italic text-zinc-300">“{playerCharacter.motto}”</p>
        <div className="flex items-center gap-4">
          <div className="w-16 h-20 border-4 border-zinc-800 flex items-center justify-center" style={{ background: '#7a1f1f' }}>
            <span className="text-game-gold font-display">{playerCharacter.name?.[0]}</span>
          </div>
          <p className="text-xs font-serif text-zinc-400">Banner seed {playerCharacter.banner_seed}. The heraldry will evolve with rank.</p>
        </div>
        {msg && <div className="p-3 border-l-4 border-emerald-600 bg-emerald-950/30 text-emerald-300 text-xs">{msg}</div>}
        {err && <div className="p-3 border-l-4 border-red-600 bg-red-950/30 text-red-300 text-xs">{err}</div>}
        <button disabled={actionLoading} onClick={train} className="rpg-button rpg-button-emerald px-5 py-3 text-xs w-full">Train profession — 120 LC</button>
        <div className="flex gap-2 text-[10px] uppercase tracking-widest">
          <a className="rpg-button px-3 py-2" href="/economy">Economy</a>
          <a className="rpg-button px-3 py-2" href="/kingdom">Kingdom</a>
          <a className="rpg-button px-3 py-2" href="/dynasty">Dynasty</a>
        </div>
      </section>

      <section className="rpg-panel-stone p-6">
        <h2 className="font-display text-lg text-game-gold">Thy stores</h2>
        <div className="mt-4 space-y-2">
          {rows.map((r: any) => (
            <div key={r.resource_id} className="flex justify-between border-b border-zinc-800 pb-2 text-sm">
              <span className="font-serif">{r.name}</span><span className="font-pixel text-game-gold">{r.quantity}</span>
            </div>
          ))}
        </div>
        <h3 className="font-display text-sm text-zinc-300 mt-4">Crafted goods</h3>
        <div className="space-y-1">
          {craftedRows.map((r: any) => (
            <div key={r.id} className="flex justify-between border-b border-zinc-900 pb-1 text-sm">
              <span className="font-serif">{r.name}</span><span>{r.qty}</span>
            </div>
          ))}
        </div>
        <p className="text-xs font-serif text-zinc-500 mt-4">Produce bread and steel in the Economy, then sell them in the Marketplace.</p>
      </section>
    </div>
  );
}
