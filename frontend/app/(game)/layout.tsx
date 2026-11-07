'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useGame } from '../../hooks/useGame';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Map, User as UserIcon, Coins, Landmark, Swords, Shield, BookOpen, FileText, Compass, LogOut, MapPin, Play, Pause, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useMusic, TRACKS } from '../../hooks/useMusic';
import { useSFX } from '../../hooks/useSFX';
import MainMenu from '../../components/game/menu/MainMenu';
import { gameRepository } from '../../services/repository/provider';
import './reignward.css';

export type GameContextType = ReturnType<typeof useGame> & {
  triggerFloatingText: (text: string, colorClass?: string, x?: number, y?: number) => void;
  setError: (error: string) => void;
};

const GameContext = createContext<GameContextType | null>(null);

export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGameContext must be used within a GameProvider');
  return context;
}

const NAV = [
  { name: 'World', href: '/world', icon: Map },
  { name: 'Character', href: '/character', icon: UserIcon },
  { name: 'Economy', href: '/economy', icon: Coins },
  { name: 'Marketplace', href: '/marketplace', icon: Landmark },
  { name: 'Military', href: '/military', icon: Swords },
  { name: 'Kingdom', href: '/kingdom', icon: Shield },
  { name: 'Dynasty', href: '/dynasty', icon: BookOpen },
  { name: 'Quests', href: '/quests', icon: FileText },
  { name: 'Profile', href: '/profile', icon: Compass },
];

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const { userId, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const game = useGame(userId);
  const music = useMusic();
  const sfx = useSFX();
  const [floatingTexts, setFloatingTexts] = useState<{ id: string; text: string; colorClass: string; x: number; y: number }[]>([]);
  const [error, setErrorState] = useState<string>('');
  const [mainMenuOpen, setMainMenuOpen] = useState(false);

  const triggerFloatingText = useCallback((text: string, colorClass: string = 'text-game-gold', x?: number, y?: number) => {
    const id = Math.random().toString(36).substring(2, 9);
    setFloatingTexts((prev) => [...prev, { id, text, colorClass, x: x ?? window.innerWidth / 2, y: y ?? window.innerHeight / 2 - 120 }]);
    setTimeout(() => setFloatingTexts((prev) => prev.filter((i) => i.id !== id)), 1500);
  }, []);

  useEffect(() => { if (!authLoading && !userId) router.push('/'); }, [userId, authLoading, router]);

  if (authLoading || game.loading || !userId) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-6 bg-[#0A1019] text-[#F2E8D5]">
        <div className="h-16 w-16 rounded-full border-t-2 border-[#D8AE68] animate-spin" />
        <p className="font-display text-sm tracking-widest">Syncing Aegis…</p>
      </div>
    );
  }

  const activeRegion = game.regions.find((r) => r.id === game.profile?.current_region_id);
  const activeCountry = game.countries.find((c) => c.id === activeRegion?.country_id);
  const isWorld = pathname === '/world';
  const displayName = (game as any).playerCharacter?.name || game.profile?.username || '';
  const BANNERS: Record<string, { src: string; alt: string }> = {
    '/character': { src: '/assets/reignward-wide/character.webp', alt: 'Character parchment in the court at Qurtuba' },
    '/economy': { src: '/assets/reignward-wide/economy.webp', alt: 'Workshop and granaries of Gharnata' },
    '/marketplace': { src: '/assets/reignward-wide/market.webp', alt: 'Market ledger of Ishbiliya' },
    '/military': { src: '/assets/reignward-wide/military.webp', alt: 'Army muster at Saragusta' },
    '/kingdom': { src: '/assets/reignward-wide/council.webp', alt: 'The council of the Taifa' },
    '/dynasty': { src: '/assets/reignward-wide/dynasty.webp', alt: 'House of Aegis — dynasty hall' },
    '/quests': { src: '/assets/reignward-wide/quests.webp', alt: 'Commissions board at Qurtuba' },
    '/profile': { src: '/assets/reignward-wide/chronicle.webp', alt: 'Chronicle of the chronicler' },
  };
  const banner = pathname ? BANNERS[pathname] : undefined;

  return (
    <GameContext.Provider value={{ ...game, triggerFloatingText, setError: setErrorState }}>
      <div className="min-h-screen bg-[#0A1019] text-[#F2E8D5] font-sans pb-24">
        <header className="sticky top-0 z-40 h-14 border-b border-[#6b5836] bg-[#111D28]/95 backdrop-blur flex items-center justify-between px-3 md:px-5">
          <div className="flex items-center gap-3">
            <Link href="/world" className="flex items-center gap-2">
              <span className="font-display tracking-widest text-[#D8AE68] text-sm">REIGNWARD</span>
              <span className="hidden sm:flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#B6AE9B]"><MapPin className="h-3 w-3" /> {activeRegion?.name || '—'} ({activeCountry?.name || '—'})</span>
            </Link>
            <span className="px-2 py-0.5 text-[9px] font-mono tracking-wider bg-[#d8ae68]/15 border border-[#d8ae68]/30 text-[#d8ae68] rounded">
              OFFLINE PREVIEW
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1.5">
              <button onClick={music.toggle} className="p-2 border border-zinc-700" aria-label={music.playing ? 'Pause music' : 'Play music'}>{music.playing ? <Pause className="h-4 w-4 text-[#D8AE68]" /> : <Play className="h-4 w-4" />}</button>
              <button onClick={music.next} className="p-2 border border-zinc-700" aria-label="Next track"><SkipForward className="h-4 w-4" /></button>
              <button onClick={music.toggleMute} className="p-2 border border-zinc-700" aria-label="Toggle mute">{music.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</button>
            </div>
            <div className="hidden lg:block text-right">
              <div className="text-[11px] font-pixel text-[#6D9480]">{game.stats?.energy ?? 0}/100 EP</div>
              <div className="text-[11px] font-pixel text-[#D8AE68]">{game.currencies?.local_currency_balance?.toFixed(0) ?? 0} LC</div>
            </div>
            <div className="hidden md:block text-right">
              <div className="text-xs font-display leading-none">{displayName}</div>
              <div className="text-[9px] uppercase text-[#B6AE9B]">Lvl {game.stats?.level ?? 1}</div>
            </div>
            <button onClick={() => setMainMenuOpen(true)} className="rw-btn" data-variant="bronze" aria-label="Open main menu"><span className="text-[#D8AE68]">✦</span><span className="hidden sm:inline">Menu</span></button>
            <button onClick={() => signOut()} className="rw-btn" data-variant="dark" aria-label="Sign out"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">Leave</span></button>
          </div>
        </header>

        <main className={isWorld ? 'h-[calc(100vh-56px)] relative overflow-hidden' : 'mx-auto max-w-[1100px] px-3 md:px-6 py-5'}>
          {isWorld ? children : (
            <div className="rw-panel rw-drawer p-4 md:p-6" style={{ animation: 'rwSlide .26s ease-out' }}>
              <style>{`@keyframes rwSlide{from{transform:translateX(24px);opacity:0}to{transform:none;opacity:1}} @media (prefers-reduced-motion: reduce){ .rw-drawer{animation:none!important} }`}</style>
              {banner && <div className="rw-banner mb-4"><img src={banner.src} alt={banner.alt} style={{ width:'100%', height:'100%', objectFit:'contain', background:'#0A1019' }} /></div>}
              {children}
            </div>
          )}
        </main>

        <nav className="rw-dock" aria-label="Primary">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href === '/world' && pathname?.startsWith('/world'));
            return (
              <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} onClick={() => sfx.playClick()}>
                <Icon className="h-5 w-5" /><span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {floatingTexts.map((item) => (
            <span key={item.id} className={`absolute font-pixel text-xs uppercase tracking-widest ${item.colorClass}`} style={{ left: item.x, top: item.y, transform: 'translate(-50%,-50%)' }}>{item.text}</span>
          ))}
        </div>

        {mainMenuOpen && (
          <MainMenu
            playerProfile={{
              name: displayName || 'Soldier',
              homeland: activeRegion?.name || 'Qurtuba',
              alliance: (game as any).playerCharacter?.kingdom_id || activeCountry?.id || 1,
              rank: 'Soldier',
            }}
            onClose={() => setMainMenuOpen(false)}
            onResetCharacter={async () => {
              setMainMenuOpen(false);
              if (userId) {
                await (gameRepository as any).resetPlayerCharacter?.(userId);
              }
              await signOut();
              router.push('/');
            }}
            onSignOut={async () => {
              setMainMenuOpen(false);
              await signOut();
              router.push('/');
            }}
          />
        )}
      </div>
    </GameContext.Provider>
  );
}
