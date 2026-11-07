'use client';

import { useEffect, useMemo, useState } from 'react';
import { useGameContext } from '../layout';
import Link from 'next/link';

export default function MarketplacePage() {
  const {
    marketListings, marketOrders, marketHistory, playerResources, resources, currencies,
    listAssetForSale, placeBuyOrder, cancelListing, cancelOrder, actionLoading, profile, inventory, itemTemplates,
  } = useGameContext() as any;
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [sellRes, setSellRes] = useState<number>(5);
  const [sellQty, setSellQty] = useState<number>(5);
  const [sellPrice, setSellPrice] = useState<number>(4);
  const [buyRes, setBuyRes] = useState<number>(3);
  const [buyQty, setBuyQty] = useState<number>(5);
  const [buyPrice, setBuyPrice] = useState<number>(4);
  const [sellItemId, setSellItemId] = useState<string>('');
  const [sellItemQty, setSellItemQty] = useState<number>(1);
  const [sellItemPrice, setSellItemPrice] = useState<number>(6);

  const nameOf = (id: number) => (resources || []).find((r: any) => r.id === id)?.name || `#${id}`;
  const qtyOf = (id: number) => (playerResources || []).find((r: any) => r.resource_id === id)?.quantity ?? 0;
  const myId = profile?.id;
  const rawResources = (resources || []).filter((r: any) => r.category === 'raw');
  const itemNameOf = (l: any) => {
    if (l.asset_type !== 'item') return nameOf(l.resource_id);
    const inv = (inventory || []).find((i: any) => i.id === l.item_id);
    const tpl = inv?.item_template_id ?? l.item_template_id;
    return (itemTemplates || []).find((t: any) => t.id === tpl)?.name || l.resource_name || 'Crafted good';
  };

  const run = async (fn: () => Promise<any>, ok: string) => {
    setMsg(null); setErr(null);
    const res = await fn();
    if (res.success) setMsg(ok); else setErr(res.error || 'The broker refused.');
  };

  useEffect(() => {
    if (!sellItemId) {
      const first = (inventory || []).find((i: any) => i.owner_id !== 'escrow');
      if (first) setSellItemId(first.id);
    }
  }, [inventory, sellItemId]);

  const mineListings = useMemo(() => (marketListings || []).filter((l: any) => l.seller_id === myId), [marketListings, myId]);
  const mineOrders = useMemo(() => (marketOrders || []).filter((o: any) => o.buyer_id === myId), [marketOrders, myId]);
  const avgFor = (resId: number) => {
    const ls = (marketListings || []).filter((l: any) => l.resource_id === resId && l.status === 'active');
    return ls.length ? (ls.reduce((s: any, l: any) => s + l.price_per_unit, 0) / ls.length).toFixed(2) : (resources || []).find((r: any) => r.id === resId)?.base_value?.toFixed(2) || '—';
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-display text-game-gold">The Marketplace</h1>
        <p className="font-serif text-sm text-zinc-400">Buyer and seller may meet here — thy sale may match an NPC order at once, and thy purchase may match an NPC listing. Coin after VAT and fee settles in thy purse. Balance: <span className="font-pixel text-game-emerald">{currencies?.local_currency_balance?.toFixed(2) ?? 0} LC</span></p>
      </header>
      {msg && <div className="p-3 border-l-4 border-emerald-600 bg-emerald-950/30 text-emerald-300 text-xs font-display">{msg}</div>}
      {err && <div className="p-3 border-l-4 border-red-600 bg-red-950/30 text-red-300 text-xs font-display">{err}</div>}

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="rpg-panel-stone p-5 space-y-3">
          <h2 className="font-display text-game-gold">Sell thy goods</h2>
          <label className="text-[10px] uppercase tracking-widest">Resource (have {qtyOf(sellRes)})</label>
          <select value={sellRes} onChange={(e) => setSellRes(Number(e.target.value))} className="rpg-input w-full px-3 py-3">
            {rawResources.map((r: any) => <option key={r.id} value={r.id}>{r.name} · {qtyOf(r.id)} held · avg {avgFor(r.id)} LC</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10px] uppercase tracking-widest">Quantity</label><input type="number" min={1} value={sellQty} onChange={(e) => setSellQty(Number(e.target.value))} className="rpg-input w-full px-3 py-3" /></div>
            <div><label className="text-[10px] uppercase tracking-widest">Price each</label><input type="number" min={1} value={sellPrice} onChange={(e) => setSellPrice(Number(e.target.value))} className="rpg-input w-full px-3 py-3" /></div>
          </div>
          <button disabled={actionLoading} onClick={() => run(() => listAssetForSale(null, 'resource', sellRes, null, sellQty, sellPrice, 'local'), `Offered ${sellQty} × ${nameOf(sellRes)} at ${sellPrice} LC.`)} className="rpg-button w-full py-3 text-xs">Offer for sale</button>
          {/* Crafted goods: sell inventory items (bread etc.) created in the workshop */}
          <div className="pt-3 border-t border-zinc-800 space-y-2">
            <p className="text-xs uppercase tracking-widest text-zinc-400">Crafted goods</p>
            <select value={sellItemId} onChange={(e) => setSellItemId(e.target.value)} className="rpg-input w-full px-3 py-3">
              {(inventory || []).filter((i: any) => i.owner_id !== 'escrow').map((i: any) => (
                <option key={i.id} value={i.id}>{(itemTemplates || []).find((t: any) => t.id === i.item_template_id)?.name || `Item ${i.item_template_id}`} · quality {i.quality} · ×{i.quantity}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-[10px] uppercase tracking-widest">Quantity</label><input type="number" min={1} value={sellItemQty} onChange={(e) => setSellItemQty(Number(e.target.value))} className="rpg-input w-full px-3 py-3" /></div>
              <div><label className="text-[10px] uppercase tracking-widest">Price each</label><input type="number" min={1} value={sellItemPrice} onChange={(e) => setSellItemPrice(Number(e.target.value))} className="rpg-input w-full px-3 py-3" /></div>
            </div>
            <button disabled={actionLoading || !sellItemId} onClick={() => run(() => listAssetForSale(null, 'item', null, sellItemId, sellItemQty, sellItemPrice, 'local'), `Offered crafted good at ${sellItemPrice} LC.`)} className="rpg-button w-full py-2 text-xs">Offer crafted good</button>
          </div>
          {mineListings.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <p className="text-xs uppercase tracking-widest text-zinc-400">Thy offers</p>
              {mineListings.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between text-xs border border-zinc-800 p-2">
                  <span>{l.quantity} × {itemNameOf(l)} @ {l.price_per_unit} LC</span>
                  <button disabled={actionLoading} onClick={() => run(() => cancelListing(l.id), 'Offer withdrawn; goods returned.')} className="rpg-button rpg-button-crimson px-2 py-1 text-[10px]">Cancel</button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rpg-panel-stone p-5 space-y-3">
          <h2 className="font-display text-game-gold">Buy or bid</h2>
          <label className="text-[10px] uppercase tracking-widest">Wanted resource</label>
          <select value={buyRes} onChange={(e) => setBuyRes(Number(e.target.value))} className="rpg-input w-full px-3 py-3">
            {(resources || []).map((r: any) => <option key={r.id} value={r.id}>{r.name} · market avg {avgFor(r.id)} LC</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10px] uppercase tracking-widest">Quantity</label><input type="number" min={1} value={buyQty} onChange={(e) => setBuyQty(Number(e.target.value))} className="rpg-input w-full px-3 py-3" /></div>
            <div><label className="text-[10px] uppercase tracking-widest">Price each</label><input type="number" min={1} value={buyPrice} onChange={(e) => setBuyPrice(Number(e.target.value))} className="rpg-input w-full px-3 py-3" /></div>
          </div>
          <button disabled={actionLoading} onClick={() => run(() => placeBuyOrder(null, 'resource', buyRes, null, buyQty, buyPrice, 'local'), `Bid placed for ${buyQty} × ${nameOf(buyRes)}.`)} className="rpg-button w-full py-3 text-xs">Place buy order</button>
          {mineOrders.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <p className="text-xs uppercase tracking-widest text-zinc-400">Thy bids</p>
              {mineOrders.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between text-xs border border-zinc-800 p-2">
                  <span>{o.quantity} × {itemNameOf(o)} @ {o.price_per_unit} LC</span>
                  <button disabled={actionLoading} onClick={() => run(() => cancelOrder(o.id), 'Bid withdrawn; coin refunded.')} className="rpg-button rpg-button-crimson px-2 py-1 text-[10px]">Cancel</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="rpg-panel-stone p-5">
          <h2 className="font-display text-game-gold mb-3">Offers on the board</h2>
          <div className="space-y-2 max-h-80 overflow-auto">
            {(marketListings || []).map((l: any) => (
              <div key={l.id} className="flex justify-between text-xs border-b border-zinc-800 pb-2">
                <span><span className="font-serif">{l.seller_name}</span> · {l.quantity} × {itemNameOf(l)}</span>
                <span className="font-pixel text-game-gold">{l.price_per_unit} LC</span>
              </div>
            ))}
          </div>
        </section>
        <section className="rpg-panel-stone p-5">
          <h2 className="font-display text-game-gold mb-3">Bids of the realm</h2>
          <div className="space-y-2 max-h-80 overflow-auto">
            {(marketOrders || []).map((o: any) => (
              <div key={o.id} className="flex justify-between text-xs border-b border-zinc-800 pb-2">
                <span><span className="font-serif">{o.buyer_name}</span> wants {o.quantity} × {itemNameOf(o)}</span>
                <span className="font-pixel text-game-gold">{o.price_per_unit} LC</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rpg-panel-stone p-5">
        <h2 className="font-display text-game-gold mb-3">Ledger of deeds</h2>
        <div className="space-y-2 max-h-64 overflow-auto text-xs">
          {(marketHistory || []).slice(0, 20).map((t: any) => (
            <div key={t.id} className="flex justify-between border-b border-zinc-900 pb-2">
              <span>{t.quantity} × {nameOf(t.resource_id)} · {t.seller_name || t.seller_id} → {t.buyer_name || t.buyer_id}</span>
              <span>{t.price_per_unit} LC · fee {t.marketplace_fee?.toFixed?.(2) ?? t.marketplace_fee} · tax {t.tax_collected?.toFixed?.(2) ?? t.tax_collected}</span>
            </div>
          ))}
        </div>
        <p className="font-serif italic text-xs text-zinc-500 mt-3">If thy prices cross an NPC bid or offer, the match settles at once and coin arrives in thy purse.</p>
        <Link href="/economy" className="rpg-button inline-block mt-3 px-4 py-2 text-xs">Back to Economy</Link>
      </section>
    </div>
  );
}

