// @vitest-environment jsdom
import React, { StrictMode, act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import GameLayout from '../app/(game)/layout';
import World from '../app/(game)/world/page';
import { gameRepository } from '../services/repository/provider';

vi.mock('../services/repository/provider', async () => {
  const { MockGameRepository } = await import('../services/repository/MockGameRepository');
  return { activeProvider: 'mock', gameRepository: new MockGameRepository() };
});
vi.mock('./useAuth', () => ({ useAuth: () => ({ userId: 'expedition-player', loading: false, signOut: vi.fn() }) }));
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
vi.mock('./useSFX', () => ({ useSFX: () => ({ playClick: vi.fn(), playOpen: vi.fn(), playClose: vi.fn(), playSuccess: vi.fn(), playError: vi.fn() }) }));
vi.mock('./useMusic', () => ({ TRACKS: [{ name: 'Test' }], useMusic: () => ({ playing: false, track: 0, muted: true, volume: 0, toggle: vi.fn(), next: vi.fn(), toggleMute: vi.fn(), changeVolume: vi.fn() }) }));
const nav = vi.hoisted(() => ({ router: { replace: vi.fn(), push: vi.fn() }, params: new URLSearchParams() }));
vi.mock('next/navigation', () => ({ useRouter: () => nav.router, usePathname: () => '/world', useSearchParams: () => nav.params }));
const user = 'expedition-player';
let container: HTMLDivElement, root: Root;
const button = (name: string) => {
  const el = Array.from(container.querySelectorAll('button')).find(el => el.textContent?.trim().replace(/\s+/g, ' ') === name || el.getAttribute('aria-label') === name);
  if (!el) throw new Error(`Button not found: ${name}; available: ${Array.from(container.querySelectorAll('button')).map(b=>b.textContent).join(' | ')}`);
  return el;
};
const click = async (name: string) => { await act(async () => button(name).click()); };
const tick = async (ms: number) => { await act(async () => { await vi.advanceTimersByTimeAsync(ms); }); };
const stats = () => gameRepository.getPlayerStats(user);
beforeEach(() => {
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value), removeItem: (key: string) => storage.delete(key), clear: () => storage.clear() });
  vi.useFakeTimers(); localStorage.clear();
  localStorage.setItem('mmo_auth_session', user);
  localStorage.setItem('mmo_player_characters', JSON.stringify([{ id: 'char-exp', profile_id: user, name: 'Aldric', epithet: 'the Bold', kingdom_id: 1, profession: 'farmer', profession_rank: 1, origin: 'Qurtuba', motto: 'By hearth and sword', banner_seed: 1, onboarding_completed: true, created_at: '1031-01-01T00:00:00.000Z', updated_at: '1031-01-01T00:00:00.000Z' }]));
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  container = document.createElement('div'); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.useRealTimers(); vi.restoreAllMocks(); });
async function mountGame() { await act(async () => root.render(<StrictMode><GameLayout><World /></GameLayout></StrictMode>)); }

it('completes one expedition under Strict Mode with exact costs, persistent panels, and no replay rewards', async () => {
  await mountGame();
  // Current world: province markers select, TRAVEL costs 10 EP
  await click('Jayyan');
  await click('Travel');
  await tick(1200);
  expect((await stats())?.energy).toBe(90);
  await click('JayyanSierra Morena march — open the province ledger');
  const panel = container.querySelector('aside');
  expect(panel).toBeTruthy();
  await click('Gather Wood · have 10');
  expect((await stats())?.energy).toBe(80);
  expect(container.textContent).toContain('Jayyan');
  expect(container.textContent).not.toContain('Syncing core');
  expect(await gameRepository.getGatherLogs(user)).toHaveLength(1);
  expect((await gameRepository.getPlayerResources(user)).find(r => r.resource_id === 1)!.quantity).toBeGreaterThan(10);
  await act(async () => root.unmount()); root = createRoot(container); await mountGame();
  expect(await gameRepository.getGatherLogs(user)).toHaveLength(1);
  const finalResources = await gameRepository.getPlayerResources(user);
  expect(finalResources.find(r => r.resource_id === 1)!.quantity).toBeGreaterThan(10);
});

it('blocks duplicate and overlapping actions and releases its lock after exceptions', async () => {
  const { useGame } = await import('./useGame');
  let game: ReturnType<typeof useGame>;
  function Harness() { game = useGame(user); return <span>{game.isInitialLoading ? 'initial' : game.isRefreshing ? 'refresh' : 'ready'}</span>; }
  await act(async () => root.render(<StrictMode><Harness /></StrictMode>));
  let release!: () => void;
  const spy = vi.spyOn(gameRepository, 'travelToRegion').mockImplementationOnce(() => new Promise(resolve => { release = () => resolve({ success: true, error: null }); }));
  let first!: Promise<unknown>;
  await act(async () => {
    first = game!.travel(2);
    expect((await game!.travel(2)).success).toBe(false);
    expect((await game!.gather(1)).success).toBe(false);
    expect((await game!.craftItem(1)).success).toBe(false);
    expect((await game!.executePvEBattle(1, crypto.randomUUID())).success).toBe(false);
  });
  expect(spy).toHaveBeenCalledTimes(1);
  await act(async () => { release(); await first; });
  spy.mockRejectedValueOnce(new Error('offline'));
  await act(async () => { await expect(game!.travel(2)).rejects.toThrow('offline'); });
  expect(game!.actionLoading).toBe(false);
});
