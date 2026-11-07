'use client';
import { useGameContext } from '../layout';

export default function QuestsPage() {
  const { profile, gatherLogs, marketHistory, inventory, armyUnits, playerQuests } = useGameContext() as any;

  const travelled = profile?.current_region_id !== 1 && !!profile?.current_region_id;
  const gatheredWood = (gatherLogs || []).some((g: any) => g.resource_id === 1);
  const gatheredCount = (gatherLogs || []).length;
  const bread = (inventory || []).filter((i: any) => i.item_template_id === 1).reduce((s: any, i: any) => s + i.quantity, 0) + (marketHistory || []).filter((t: any) => t.resource_id === 14).reduce((s: any, t: any) => s + t.quantity, 0);
  const sold = (marketHistory || []).filter((t: any) => t.seller_id === profile?.id).length;
  const hosts = (armyUnits || []).filter((a: any) => a.country_id === profile?.citizenship_country_id).length;

  const steps = [
    { title: 'The Roads of al-Andalus', desc: `Travel from Qurtuba to a neighbouring province (Jayyan, Tulaytula, Ishbiliya or Gharnata).`, done: travelled, hint: travelled ? 'Done — thou hast left Qurtuba.' : 'Open the World, choose Jayyan, then Travel.' },
    { title: 'Timber for the Walls', desc: 'Gather 1 Wood in Jayyan (Sierra Morena march).', done: gatheredWood, hint: gatheredWood ? 'Done — timber taken.' : gatheredWood ? '' : 'Gather Wood in Jayyan.' },
    { title: 'Bread for the Household', desc: 'Craft 1 Wheat Bread in the Economy workshop (2 Grain + 1 Water).', done: bread >= 1, hint: bread >= 1 ? `Done — ${bread} bread in thy stores.` : 'Craft Bread in the Economy.' },
    { title: 'First Coin of the Coffer', desc: 'Complete 1 sale in the Marketplace.', done: sold >= 1, hint: sold >= 1 ? `Done — ${sold} sale(s) in the ledger.` : 'Sell Iron Ore or a crafted good in the Marketplace.' },
    { title: 'Spears for the Taifa', desc: 'Recruit 1 host, then march it along a road (Military → World map).', done: hosts >= 1 && (playerQuests?.length > 0 || hosts >= 2), hint: hosts >= 2 ? 'Done — thy hosts stand ready.' : 'Recruit a host in the Military, then March.' },
  ];

  return (
    <div className="space-y-6">
      <header><h1 className="text-2xl font-display text-game-gold">Commissions</h1><p className="font-serif text-sm text-zinc-400">Starter commissions tied to real deeds — progress is read from thy actual travel, gathering, crafting, trading and mustering.</p></header>
      <div className="grid md:grid-cols-2 gap-4">
        {steps.map((s, i) => (
          <div key={s.title} className={`rpg-panel-stone p-4 ${s.done ? 'border-emerald-700' : ''}`}>
            <p className="font-display">{i + 1}. {s.title} {s.done ? <span className="text-emerald-400">— Done</span> : <span className="text-zinc-500 text-xs">— In hand</span>}</p>
            <p className="text-xs font-serif text-zinc-400">{s.desc}</p>
            <p className="text-[11px] font-serif text-game-gold mt-2">{s.hint}</p>
          </div>
        ))}
        <div className="rpg-panel-stone p-4">
          <p className="font-display">Accepted deeds</p>
          <p className="text-xs font-serif text-zinc-400">{(playerQuests || []).length ? (playerQuests || []).map((q: any) => `${q.title || `Quest ${q.quest_id}`} (${q.status})`).join(', ') : 'No deeds accepted yet — the commissions above are read directly from thy deeds, no acceptance needed to make progress.'}</p>
          <a href="/world" className="rpg-button inline-block mt-3 px-4 py-2 text-xs">Return to the World</a>
        </div>
        <div className="rpg-panel-stone p-4">
          <p className="font-display">Field notes</p>
          <p className="text-xs font-serif text-zinc-400">Gathered this visit: {gatheredCount}. Sales completed: {sold}. Hosts mustered: {hosts}. Bread in stores: {bread}.</p>
        </div>
      </div>
    </div>
  );
}
