'use client';

import { useMemo, useState } from 'react';
import { useGameContext } from '../layout';
import Link from 'next/link';

export default function EconomyPage() {
  const { playerResources, resources, currencies, recipes, inventory, itemTemplates, gather, craftItem, actionLoading } = useGameContext() as any;
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [recipeSel, setRecipeSel] = useState<number>(1);

  const nameOf = (id: number) => (resources || []).find((r: any) => r.id === id)?.name || `#${id}`;
  const qtyOf = (id: number) => (playerResources || []).find((r: any) => r.resource_id === id)?.quantity ?? 0;
  const templateName = (id: number) => (itemTemplates || []).find((t: any) => t.id === id)?.name || `Item ${id}`;

  const gatherWhole = async (resId: number) => {
    const res = await gather(resId);
    if (res.success) { setMsg(`Gathered: +${res.gatheredQuantity} ${nameOf(resId)}, +${res.experienceGained} XP, −${res.energySpent} EP (${res.newEnergy} EP left).`); setErr(null); } else { setErr(res.error); setMsg(null); }
  };

  const craft = async () => {
    const recipe = (recipes || []).find((r: any) => r.id === recipeSel);
    const before = (inventory || []).filter((i: any) => i.item_template_id === recipe?.result_template_id).reduce((s: any, i: any) => s + i.quantity, 0);
    const res = await craftItem(recipeSel);
    if (res.success) {
      const after = before + (recipe?.result_quantity || 1);
      setMsg(`Forged ${templateName(recipe?.result_template_id || 1)}: ${before} → ${after} in thy stores.`); setErr(null);
    } else { setErr(res.error); setMsg(null); }
  };

  // Use THE recipe craftItem actually consumes (ItemRecipe inputs), not ProductionInputs.
  const inputsFor = (recipeId: number) => (recipes || []).find((r: any) => r.id === recipeId)?.inputs || [];

  const itemRows = useMemo(() => {
    const byTemplate: Record<number, number> = {};
    for (const i of inventory || []) { if (i.quantity > 0 && i.owner_id !== 'escrow') byTemplate[i.item_template_id] = (byTemplate[i.item_template_id] || 0) + i.quantity; }
    return Object.entries(byTemplate).map(([id, qty]) => ({ id: Number(id), name: templateName(Number(id)), qty }));
  }, [inventory, itemTemplates]);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <section className="rpg-panel-stone p-6 space-y-4">
        <h1 className="text-2xl font-display text-game-gold">The Economy</h1>
        <p className="font-serif text-sm text-zinc-400">Gather → Produce → Sell → Earn → Upgrade. Every loop ends in the market.</p>
        {msg && <div className="p-3 border-l-4 border-emerald-600 bg-emerald-950/30 text-emerald-300 text-xs font-display">{msg}</div>}
        {err && <div className="p-3 border-l-4 border-red-600 bg-red-950/30 text-red-300 text-xs font-display">{err}</div>}

        <h2 className="font-display text-game-gold">Gather</h2>
        <div className="grid grid-cols-2 gap-2">
          {(resources || []).filter((r: any) => r.category === 'raw').slice(0, 8).map((r: any) => (
            <button key={r.id} disabled={actionLoading} onClick={() => gatherWhole(r.id)} className="rpg-button px-3 py-2 text-[10px] text-left">
              Gather {r.name} · {qtyOf(r.id)}
            </button>
          ))}
        </div>

        <h2 className="font-display text-game-gold">Workshop</h2>
        <label className="text-[10px] uppercase tracking-widest">Recipe</label>
        <select value={recipeSel} onChange={(e) => setRecipeSel(Number(e.target.value))} className="rpg-input w-full px-3 py-3">
          {(recipes || []).filter((r: any) => r.id <= 4).map((r: any) => <option key={r.id} value={r.id}>{templateName(r.result_template_id)} (×{r.result_quantity})</option>)}
        </select>
        <div className="text-xs font-serif text-zinc-400">
          Needs: {inputsFor(recipeSel).map((i: any) => `${i.quantity} × ${nameOf(i.resource_id)} (have ${qtyOf(i.resource_id)})`).join(' · ') || '—'}
          {inputsFor(recipeSel).length > 0 && (inputsFor(recipeSel).some((i: any) => qtyOf(i.resource_id) < i.quantity) ? ' — Unavailable with current stores.' : ' — Available.')}
        </div>
        <button disabled={actionLoading || inputsFor(recipeSel).some((i: any) => qtyOf(i.resource_id) < i.quantity)} onClick={craft} className="rpg-button rpg-button-emerald w-full py-3 text-xs">Craft 1 batch</button>

        <div className="flex gap-2">
          <Link href="/marketplace" className="rpg-button flex-1 py-3 text-center text-xs">Go to Marketplace</Link>
          <Link href="/world" className="rpg-button flex-1 py-3 text-center text-xs">Return to World</Link>
        </div>
      </section>

      <section className="rpg-panel-stone p-6 space-y-4">
        <h2 className="font-display text-game-gold">Thy ledger</h2>
        <div className="text-sm space-y-2">
          <div className="flex justify-between border-b border-zinc-800 pb-2"><span>Local currency</span><span className="font-pixel text-game-emerald">{currencies?.local_currency_balance?.toFixed(2) ?? 0} LC</span></div>
          <div className="flex justify-between border-b border-zinc-800 pb-2"><span>Gold</span><span className="font-pixel text-game-gold">{currencies?.gold?.toFixed(2) ?? 0}</span></div>
        </div>
        <h3 className="font-display text-sm text-zinc-300">Raw stores</h3>
        <div className="space-y-1 max-h-56 overflow-auto">
          {(playerResources || []).map((pr: any) => (
            <div key={pr.resource_id} className="flex justify-between text-sm border-b border-zinc-900 pb-1">
              <span className="font-serif">{nameOf(pr.resource_id)}</span><span>{pr.quantity}</span>
            </div>
          ))}
        </div>
        <h3 className="font-display text-sm text-zinc-300">Crafted goods</h3>
        <div className="space-y-1 max-h-40 overflow-auto">
          {itemRows.length === 0 && <p className="text-xs font-serif text-zinc-500">Nothing forged yet — bake bread in the workshop.</p>}
          {itemRows.map((r: any) => (
            <div key={r.id} className="flex justify-between text-sm border-b border-zinc-900 pb-1">
              <span className="font-serif">{r.name}</span><span className="font-pixel text-game-gold">{r.qty}</span>
            </div>
          ))}
        </div>
        <p className="text-xs font-serif italic text-zinc-500">Bread (2 grain + 1 water) is forged above and sold as a crafted good in the Marketplace.</p>
      </section>
    </div>
  );
}
