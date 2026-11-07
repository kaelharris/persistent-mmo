'use client';

import { useMemo } from 'react';
import { useGameContext } from '../layout';
import { COUNCIL, REALMS, ROYAL_HISTORY } from '../../../lib/worldLore';
import Link from 'next/link';

export default function KingdomPage() {
  const { profile, countries, currencies, playerCharacter, dynasty, dynastyMembers, rulerLegitimacy, kingdomStability, militaryRegions, activeWars, peaceTreaties } = useGameContext() as any;

  const country = useMemo(() => countries?.find((c: any) => c.id === (profile?.citizenship_country_id || playerCharacter?.kingdom_id || 1)) || countries?.[0], [countries, profile, playerCharacter]);
  const realm = REALMS.find((r) => r.id === country?.id);
  const myProvinces = (militaryRegions || []).filter((m: any) => m.owner_country_id === country?.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-display text-game-gold">Kingdom — {country?.name || 'Taifa of Qurtuba'}</h1>
        <p className="font-serif text-sm text-zinc-400 italic">“{realm?.motto}” — capital {realm?.capital}</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="rpg-panel-stone p-5 space-y-3">
          <h2 className="font-display text-game-gold">The throne</h2>
          <p className="font-serif text-sm">Ruler: {playerCharacter?.name || profile?.username || '—'} {playerCharacter?.epithet || ''}</p>
          <p className="text-xs">Dynasty: {dynasty?.name || 'Unfounded'} · Law: {dynasty?.succession_law || '—'} · Prestige {dynasty?.total_prestige ?? 0}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="border border-zinc-800 p-3"><div className="text-zinc-500 uppercase tracking-widest text-[9px]">Legitimacy</div><div className="font-display text-lg">{rulerLegitimacy?.legitimacy ?? '—'}</div></div>
            <div className="border border-zinc-800 p-3"><div className="text-zinc-500 uppercase tracking-widest text-[9px]">Stability</div><div className="font-display text-lg">{kingdomStability?.stability ?? '—'}</div></div>
            <div className="border border-zinc-800 p-3"><div className="text-zinc-500 uppercase tracking-widest text-[9px]">Treasury</div><div className="font-display">{currencies?.local_currency_balance?.toFixed(0) ?? 0} LC</div></div>
            <div className="border border-zinc-800 p-3"><div className="text-zinc-500 uppercase tracking-widest text-[9px]">Provinces</div><div className="font-display">{myProvinces.length}</div></div>
          </div>
          <p className="text-xs font-serif text-zinc-400">Legitimacy reason: {rulerLegitimacy?.legitimacy_reasons || '—'} · Stability note: {kingdomStability?.notes || '—'}</p>
          <Link href="/dynasty" className="rpg-button w-full py-2 text-center text-xs">Attend the Dynasty</Link>
        </section>

        <section className="rpg-panel-stone p-5 space-y-3">
          <h2 className="font-display text-game-gold">The council</h2>
          {COUNCIL.map((c) => (
            <div key={c.role} className="flex justify-between border-b border-zinc-800 pb-2 text-sm">
              <span className="font-serif">{c.name}</span><span className="text-xs uppercase tracking-widest text-game-gold">{c.role}</span>
            </div>
          ))}
          <h3 className="font-display text-sm pt-2">Heirs in waiting</h3>
          {(dynastyMembers || []).slice(0, 5).map((m: any) => (
            <div key={m.id} className="flex justify-between text-xs"><span className="font-serif">{m.name} ({m.relationship})</span><span>#{m.succession_order} · {m.title}</span></div>
          ))}
        </section>

        <section className="rpg-panel-stone p-5 space-y-3">
          <h2 className="font-display text-game-gold">Memory of the realm</h2>
          {ROYAL_HISTORY.map((h) => (
            <div key={h.ruler} className="border-l-2 border-game-gold/40 pl-3">
              <p className="font-display text-sm">{h.ruler} <span className="font-serif text-xs text-zinc-400">{h.years}</span></p>
              <p className="font-serif text-xs text-zinc-400">{h.note}</p>
            </div>
          ))}
          <h3 className="font-display text-sm pt-2">Wars and treaties</h3>
          {(activeWars || []).map((w: any) => <p key={w.id} className="text-xs font-serif">{w.attacker_name} vs {w.defender_name} — {w.status}</p>)}
          {(peaceTreaties || []).map((t: any) => <p key={t.id} className="text-xs font-serif">Treaty #{t.id} — {t.status} · {t.reparations_amount} LC</p>)}
          <Link href="/military" className="rpg-button w-full py-2 text-center text-xs">To the Military</Link>
        </section>
      </div>
    </div>
  );
}
