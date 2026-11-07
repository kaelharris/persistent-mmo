'use client';
import { useGameContext } from '../layout';
export default function ProfilePage() {
  const { profile, stats, currencies, playerCharacter, playerTitles, playerBadges, playerReputation } = useGameContext() as any;
  const name = playerCharacter?.name || profile?.username || 'Unnamed';
  return (
    <div className="space-y-6 max-w-2xl">
      <header><h1 className="text-2xl font-display text-game-gold">Profile</h1><p className="font-serif text-sm text-zinc-400">Thy standing among the Taifa leagues.</p></header>
      <section className="rpg-panel-stone p-5 space-y-3">
        <p className="font-display text-xl">{name} {playerCharacter?.epithet || ''}</p>
        <p className="text-xs">Level {stats?.level} · {stats?.experience} XP · {stats?.energy}/100 EP</p>
        <p className="text-xs">Treasury {currencies?.local_currency_balance?.toFixed(0) ?? 0} LC</p>
        <p className="text-xs font-serif">Titles: {(playerTitles || []).map((t:any)=>t.title || t.name || t).join(', ') || 'None yet'}</p>
        <p className="text-xs font-serif">Badges: {(playerBadges || []).length} earned</p>
        <a href="/character" className="rpg-button inline-block px-4 py-2 text-xs">Open Character Parchment</a>
      </section>
    </div>
  );
}
