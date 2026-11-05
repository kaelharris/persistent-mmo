'use client';

import { useEffect, useRef, useState } from 'react';
import type { CombatResult } from '../../types/entities';

export default function CombatReplay({ result, enemyName, onComplete, onFightAgain }: {
  result: CombatResult;
  enemyName: string;
  onComplete: () => void;
  onFightAgain: () => void;
}) {
  const [index, setIndex] = useState(0);
  const notified = useRef(false);
  const done = index >= result.log.length;
  const event = result.log[Math.min(index, result.log.length) - 1];
  const finalEvent = result.log[result.log.length - 1];
  const playerHp = done ? result.updatedPlayerState.stats.health : event?.playerHpRemaining ?? result.initialPlayerHp;
  const enemyHp = done ? finalEvent?.enemyHpRemaining ?? 0 : event?.enemyHpRemaining ?? result.initialEnemyHp;

  useEffect(() => {
    if (done) return;
    const delay = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 0 : 650;
    const timer = setTimeout(() => setIndex(value => value + 1), delay);
    return () => clearTimeout(timer);
  }, [done, index]);

  useEffect(() => {
    if (done && !notified.current) { notified.current = true; onComplete(); }
  }, [done, onComplete]);

  return <section className="flex flex-col gap-5" aria-label="Battle replay">
    <p className="text-sm text-zinc-400">{done ? 'Battle resolved. Rewards have been saved.' : 'Watch Battle · Result saved; replaying the encounter.'}</p>
    <div className="grid grid-cols-2 gap-4">
      {[
        { name: 'Commander', hp: playerHp, max: result.updatedPlayerState.stats.max_health },
        { name: enemyName, hp: enemyHp, max: result.initialEnemyHp },
      ].map(fighter => <div key={fighter.name} className="border border-zinc-700 p-3">
        <h3 className="text-sm mb-3">{fighter.name}</h3>
        <div role="progressbar" aria-label={`${fighter.name} health`} aria-valuenow={fighter.hp} aria-valuemin={0} aria-valuemax={fighter.max} className="h-2 bg-zinc-800">
          <div className="h-full bg-emerald-400 transition-all duration-300" style={{width: `${fighter.hp / fighter.max * 100}%`}} />
        </div>
        <p className="mt-2 text-sm">{fighter.hp}/{fighter.max} HP</p>
      </div>)}
    </div>
    <p role="status" className="text-sm min-h-12">{event ? `Turn ${event.turn}: ${event.actor === 'player' ? 'Commander' : enemyName} ${event.isCrit ? 'critically hits' : 'hits'} for ${event.damage} damage.` : 'The encounter begins…'}</p>
    {!done ? <button className="rpg-button p-3" onClick={() => setIndex(result.log.length)}>Skip Replay</button> : <>
      <h3 className="text-xl text-game-gold">{result.outcome === 'victory' ? 'Victory' : 'Defeat'}</h3>
      <p>+{result.rewards.xp} XP · +{result.rewards.gold.toFixed(2)} Gold</p>
      <ul>{result.rewards.loot.map(drop => <li key={`${drop.type}:${drop.id}`}>{drop.name} ×{drop.quantity}</li>)}</ul>
      <button className="rpg-button p-3" onClick={onFightAgain}>Fight Again</button>
    </>}
  </section>;
}
