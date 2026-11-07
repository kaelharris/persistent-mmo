'use client';

import { useGameContext } from '../layout';
import Link from 'next/link';

export default function DynastyPage() {
  const { dynasty, dynastyMembers, successionOrder, rulerLegitimacy, kingdomStability, currencies } = useGameContext() as any;
  const order = successionOrder?.length ? successionOrder : dynastyMembers || [];
  const founder = order.find((m: any) => m.relationship === 'founder') || order[0];
  const heirs = order.filter((m: any) => m !== founder);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-display text-game-gold">Dynasty</h1>
        <p className="font-serif text-sm text-zinc-400">Blood, oath and succession — the slow war for the throne.</p>
      </header>

      {!dynasty ? (
        <div className="rpg-panel-parchment p-6 max-w-lg">
          <h2 className="font-display text-lg">No dynasty yet</h2>
          <p className="font-serif text-sm">Thy dynasty will be seeded when thou enterest the world. Return to onboarding to ensure thy name is written.</p>
          <Link href="/onboarding" className="rpg-button inline-block mt-4 px-4 py-2 text-xs">Attend the Rite</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <section className="rpg-panel-stone p-5 space-y-3">
            <h2 className="font-display text-game-gold">{dynasty.name}</h2>
            <p className="font-serif text-sm">Founded 1031 · Law: <span className="capitalize">{dynasty.succession_law}</span> · Prestige {dynasty.total_prestige}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="border border-zinc-800 p-3"><div className="text-zinc-500 uppercase tracking-widest text-[9px]">Legitimacy</div><div className="font-display text-lg">{rulerLegitimacy?.legitimacy ?? '—'}</div><div className="font-serif text-zinc-400">{rulerLegitimacy?.legitimacy_reasons || ''}</div></div>
              <div className="border border-zinc-800 p-3"><div className="text-zinc-500 uppercase tracking-widest text-[9px]">Stability</div><div className="font-display text-lg">{kingdomStability?.stability ?? '—'}</div><div className="font-serif text-zinc-400">{kingdomStability?.notes || ''}</div></div>
              <div className="border border-zinc-800 p-3"><div className="text-zinc-500 uppercase tracking-widest text-[9px]">Treasury</div><div className="font-display">{currencies?.local_currency_balance?.toFixed(0) ?? 0} LC</div></div>
              <div className="border border-zinc-800 p-3"><div className="text-zinc-500 uppercase tracking-widest text-[9px]">Members</div><div className="font-display">{dynasty.member_count ?? order.length}</div></div>
            </div>
            <p className="text-xs font-serif italic text-zinc-400">Succession law: hereditary — the eldest in the order inherits if the throne falls vacant.</p>
            <Link href="/kingdom" className="rpg-button w-full py-2 text-center text-xs">Kingdom</Link>
          </section>

          <section className="rpg-panel-stone p-5 space-y-3">
            <h2 className="font-display text-game-gold">Family tree</h2>
            {founder && (
              <div className="flex flex-col items-center">
                <div className="border-2 border-game-gold px-4 py-3 text-center bg-zinc-950/60 max-w-[220px]">
                  <p className="font-display text-sm">{founder.name}</p>
                  <p className="text-[10px] uppercase tracking-widest text-game-gold">{founder.title} · Founder</p>
                </div>
                <div className="h-5 w-0.5 bg-game-gold/60" />
                <div className="flex gap-2 justify-center flex-wrap">
                  {heirs.map((m: any, i: number) => (
                    <div key={m.id} className="flex flex-col items-center">
                      <div className="h-3 w-0.5 bg-game-gold/40" />
                      <div className="border border-zinc-700 px-3 py-2 text-center bg-zinc-950/40 max-w-[140px]">
                        <p className="font-serif text-xs">{m.name}</p>
                        <p className="text-[9px] uppercase tracking-widest text-zinc-400">#{m.succession_order} {m.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <h3 className="font-display text-sm pt-2">Order of succession</h3>
            {order.map((m: any, i: number) => (
              <div key={m.id} className="flex justify-between border-b border-zinc-800 pb-2 text-sm">
                <span className="font-serif">{i + 1}. {m.name} <span className="text-zinc-500">({m.relationship})</span></span>
                <span className="text-xs uppercase tracking-widest text-game-gold">{m.title}</span>
              </div>
            ))}
            <p className="text-xs font-serif text-zinc-500">Heir clear, legitimacy holds. If the ruler falls, the first name ascends.</p>
          </section>

          <section className="rpg-panel-stone p-5 space-y-3">
            <h2 className="font-display text-game-gold">Historical rulers</h2>
            {(dynasty.historical_rulers || []).map((r: any) => (
              <div key={r.rule_id} className="border-l-2 border-game-gold/40 pl-3">
                <p className="font-display text-sm">{r.title} · legitimacy {r.legitimacy}</p>
                <p className="font-serif text-xs text-zinc-400">1031 · {r.notes}</p>
              </div>
            ))}
            <p className="text-xs font-serif italic text-zinc-500">The bards will add thy line.</p>
            <Link href="/character" className="rpg-button w-full py-2 text-center text-xs">Thy Character</Link>
          </section>
        </div>
      )}
    </div>
  );
}
