'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import {
  Anchor, Castle, Coins, Compass, Flag, Home, Landmark, Layers,
  Minus, Mountain, Navigation, Pickaxe, Plus, Swords, Trees, Wheat, X,
} from 'lucide-react';
import {
  IBERIA_COAST, MAP_VIEW, PROVINCE_MAP, REALMS, TERRITORIES,
  getNeighbors, lonLatToWorld, type MapLayer,
} from '../../../lib/worldLore';
import { RealmFlag, RealmFlagArt, REALM_FLAGS, realmFlagFor } from './heraldry';

const VIEW = MAP_VIEW;
const VIEW_CENTER: [number, number] = [VIEW.width / 2, VIEW.height / 2];
const LAYERS: { id: MapLayer; label: string; short: string; Icon: typeof Layers }[] = [
  { id: 'political', label: 'Political', short: 'Realms', Icon: Flag },
  { id: 'geography', label: 'Geographic', short: 'Land', Icon: Mountain },
  { id: 'economy', label: 'Economic', short: 'Trade', Icon: Coins },
  { id: 'warfare', label: 'Warfare', short: 'War', Icon: Swords },
];

const OWNER_FALLBACK: Record<number, string> = { 1: '#b89030', 2: '#8a3b2e', 3: '#5f7a3a' };

const RIVERS: { name: string; points: [number, number][] }[] = [
  { name: 'Guadalquivir', points: [[-3.15, 38.05], [-3.8, 38.0], [-4.4, 37.95], [-4.78, 37.88], [-5.2, 37.7], [-5.6, 37.55], [-5.99, 37.39], [-6.25, 37.0], [-6.35, 36.8]] },
  { name: 'Guadiana', points: [[-3.0, 38.9], [-3.8, 38.7], [-4.5, 38.5], [-5.2, 38.3], [-5.9, 38.0], [-6.4, 37.6], [-6.9, 37.2], [-7.4, 37.0]] },
  { name: 'Tagus', points: [[-1.5, 40.5], [-2.5, 40.3], [-3.5, 40.0], [-4.02, 39.86], [-4.8, 39.6], [-5.6, 39.4], [-6.5, 39.2], [-7.5, 39.0], [-8.5, 38.8], [-9.0, 38.7]] },
  { name: 'Douro', points: [[-2.5, 41.7], [-3.5, 41.5], [-4.5, 41.3], [-5.5, 41.1], [-6.5, 41.0], [-7.5, 41.1], [-8.5, 41.15], [-9.1, 41.1]] },
  { name: 'Ebro', points: [[-2.3, 42.0], [-1.7, 41.9], [-1.2, 41.7], [-0.89, 41.65], [-0.4, 41.4], [0.1, 41.0], [0.4, 40.7], [0.8, 40.5], [1.0, 40.4]] },
  { name: 'Júcar', points: [[-1.8, 40.2], [-1.2, 39.9], [-0.6, 39.5], [-0.1, 39.2], [0.1, 39.0]] },
  { name: 'Segura', points: [[-2.2, 38.4], [-1.6, 38.2], [-1.2, 38.0], [-0.9, 37.8]] },
  { name: 'Genil', points: [[-3.45, 37.15], [-3.8, 37.25], [-4.2, 37.35], [-4.78, 37.5]] },
];

const RANGES: { name: string; points: [number, number][]; count: number; size: number }[] = [
  { name: 'Pirineos', points: [[-1.8, 43.35], [-1.2, 43.0], [-0.6, 42.8], [0.1, 42.7], [0.8, 42.6], [1.6, 42.5], [2.6, 42.4]], count: 13, size: 1.05 },
  { name: 'Cantábrica', points: [[-8.5, 43.2], [-7.2, 43.2], [-6.0, 43.15], [-4.8, 43.1], [-3.8, 43.1], [-2.8, 43.15]], count: 13, size: 0.82 },
  { name: 'Sistema Central', points: [[-7.0, 40.5], [-6.0, 40.6], [-5.0, 40.7], [-4.0, 40.75], [-3.0, 40.7], [-2.2, 40.6]], count: 12, size: 0.74 },
  { name: 'Sistema Ibérico', points: [[-2.5, 41.8], [-1.8, 41.3], [-1.2, 40.8], [-0.8, 40.2], [-0.3, 39.6]], count: 10, size: 0.7 },
  { name: 'Sierra Morena', points: [[-6.8, 38.0], [-5.8, 38.15], [-4.8, 38.25], [-3.8, 38.3], [-3.0, 38.1]], count: 12, size: 0.68 },
  { name: 'Sierra Nevada', points: [[-3.5, 37.2], [-3.15, 37.1], [-2.9, 36.95], [-2.7, 36.8]], count: 7, size: 0.9 },
  { name: 'Bética', points: [[-5.7, 36.8], [-5.2, 36.7], [-4.6, 36.75], [-4.0, 36.85]], count: 8, size: 0.64 },
];

const FORESTS: { center: [number, number]; spread: [number, number]; count: number; scale: number }[] = [
  { center: [-4.3, 38.18], spread: [1.5, 0.22], count: 16, scale: 0.9 },
  { center: [-3.6, 38.05], spread: [1.0, 0.2], count: 10, scale: 0.82 },
  { center: [-8.0, 42.35], spread: [1.2, 0.34], count: 15, scale: 1.0 },
  { center: [-1.1, 42.35], spread: [1.1, 0.24], count: 12, scale: 0.9 },
  { center: [-0.35, 39.55], spread: [0.7, 0.3], count: 9, scale: 0.78 },
  { center: [-6.5, 40.15], spread: [0.9, 0.35], count: 10, scale: 0.75 },
];

const NEUTRAL_LABELS: { text: string; lon: number; lat: number; size: number }[] = [
  { text: 'GALICIA', lon: -8.0, lat: 42.65, size: 10 },
  { text: 'ASTURIAS', lon: -5.9, lat: 42.95, size: 8.5 },
  { text: 'LEÓN', lon: -5.5, lat: 42.1, size: 10 },
  { text: 'CASTILLA', lon: -3.7, lat: 41.7, size: 11 },
  { text: 'NAVARRA', lon: -1.7, lat: 42.75, size: 8.5 },
  { text: 'ARAGÓN', lon: -0.8, lat: 41.75, size: 8.5 },
  { text: 'CATALUÑA', lon: 1.65, lat: 41.65, size: 9 },
  { text: 'PORTUGAL', lon: -8.15, lat: 40.25, size: 8.5 },
];

const SEA_LABELS: { text: string; lon: number; lat: number; size: number; rotate?: number }[] = [
  { text: 'MARE INTERNUM', lon: 2.15, lat: 37.2, size: 17, rotate: -8 },
  { text: 'OCEANUS ATLANTICUS', lon: -9.05, lat: 39.9, size: 11, rotate: -78 },
];

function worldPath(points: [number, number][], close = true) {
  const d = points
    .map(([lon, lat], i) => {
      const [x, y] = lonLatToWorld(lon, lat);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return close ? `${d} Z` : d;
}

const LAND_D = worldPath(IBERIA_COAST);
const TERRITORY_D: Record<number, string> = Object.fromEntries(
  Object.entries(TERRITORIES).map(([id, pts]) => [id, worldPath(pts)]),
);

function hash(n: number) {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function projectPoints(points: [number, number][]) {
  return points.map(([lon, lat]) => lonLatToWorld(lon, lat));
}

function pointAlong(points: [number, number][], t: number) {
  if (points.length < 2) return { x: points[0]?.[0] || 0, y: points[0]?.[1] || 0, angle: 0 };
  const lengths: number[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const len = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    lengths.push(len);
    total += len;
  }
  let target = clamp(t, 0, 0.9999) * total;
  for (let i = 1; i < points.length; i++) {
    const len = lengths[i - 1];
    if (target <= len) {
      const r = len === 0 ? 0 : target / len;
      return {
        x: points[i - 1][0] + (points[i][0] - points[i - 1][0]) * r,
        y: points[i - 1][1] + (points[i][1] - points[i - 1][1]) * r,
        angle: (Math.atan2(points[i][1] - points[i - 1][1], points[i][0] - points[i - 1][0]) * 180) / Math.PI,
      };
    }
    target -= len;
  }
  const last = points[points.length - 1];
  return { x: last[0], y: last[1], angle: 0 };
}

function MountainChain({ points, count, size, seed }: { points: [number, number][]; count: number; size: number; seed: number }) {
  const projected = useMemo(() => projectPoints(points), [points]);
  return (
    <g pointerEvents="none">
      {Array.from({ length: count }).map((_, i) => {
        const t = (i + 0.5) / count;
        const p = pointAlong(projected, t);
        const jitter = (hash(seed + i * 1.73) - 0.5) * 7;
        const s = size * (0.78 + hash(seed + i * 4.17) * 0.42);
        return (
          <g key={i} transform={`translate(${(p.x + jitter).toFixed(1)} ${(p.y + (hash(seed + i) - 0.5) * 4).toFixed(1)}) scale(${s.toFixed(2)})`}>
            <path d="M-8 4 L-2.4 -5.2 L3.8 4Z" fill="#77705a" stroke="#4b432f" strokeWidth="0.55" />
            <path d="M-2.4 -5.2 L0 -1.6 L-0.9 -0.4 L-2.9 -2.1 L-4.4 -1.3Z" fill="#e6d8b8" opacity="0.78" />
            <path d="M0.7 4 L6.4 -3.6 L12 4Z" fill="#6d6754" stroke="#48412f" strokeWidth="0.5" />
            <path d="M6.4 -3.6 L8.3 -0.9 L7.2 0 L6.1 -1.2 L5 -0.7Z" fill="#eadfc4" opacity="0.7" />
          </g>
        );
      })}
    </g>
  );
}

function Tree({ x, y, s, tone = 0 }: { x: number; y: number; s: number; tone?: number }) {
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(2)})`}>
      <path d="M0 6V2" stroke="#5b4a30" strokeWidth="0.7" />
      <path d="M0 -5.5 3.4 2.2H-3.4Z" fill={tone ? '#6f7d52' : '#596b46'} />
      <path d="M0 -1.8 4.3 4.4H-4.3Z" fill={tone ? '#829060' : '#6e8055'} opacity="0.9" />
    </g>
  );
}

function ForestCluster({ center, spread, count, scale, seed }: { center: [number, number]; spread: [number, number]; count: number; scale: number; seed: number }) {
  const [cx, cy] = lonLatToWorld(center[0], center[1]);
  const sx = (spread[0] / 13) * (VIEW.width - VIEW.pad * 2);
  const sy = (spread[1] / 8.5) * (VIEW.height - VIEW.pad * 2);
  return (
    <g pointerEvents="none" opacity="0.9">
      {Array.from({ length: count }).map((_, i) => {
        const a = hash(seed + i * 5.3);
        const b = hash(seed + i * 9.1);
        return <Tree key={i} x={cx + (a - 0.5) * sx * 2} y={cy + (b - 0.5) * sy * 2} s={scale * (0.76 + hash(seed + i) * 0.5)} tone={i % 3} />;
      })}
    </g>
  );
}

function SettlementGlyph({ kind }: { kind: string }) {
  const common = { fill: 'none', stroke: '#e5c78e', strokeWidth: 1.15, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (kind) {
    case 'castle': return <g {...common}><path d="M-5 5V-4h2v-1.4h1.8V-4h1.4v-1.4H4V-4h1v9" /><path d="M-2 5V1.4h2.6V5" /></g>;
    case 'forest': return <g {...common}><path d="m0 -5 3 4h-2l3 3h-8l3-3h-2Z" /><path d="M0 2v3.2" /></g>;
    case 'mine': return <g {...common}><path d="m-4.4 4.8 7-7" /><path d="M-2.6 -4.4c2.7-1.3 5.2-.5 7 .9l-2 2c-1.2-1-2.8-1.5-4-.8Z" /></g>;
    case 'harbor': return <g {...common}><circle cx="0" cy="-4.6" r="1.2" /><path d="M0 -3.3V4.5M-3.4 1.2c.4 2.5 1.8 3.4 3.4 3.4s3-.9 3.4-3.4M-2.2 -1.5h4.4" /></g>;
    case 'village': return <g {...common}><path d="m-5 0 5-4.5L5 0" /><path d="M-3.7 0v5h7.4V0" /><path d="M-0.8 5V2.2h1.6V5" /></g>;
    case 'ruins': return <g {...common}><path d="M-5 5V-1h2.2v-3.4h2.2V5M1.2 5V-2.2h2v1.3H5V5" /><path d="M-5 1.6h3M1.2 0h3.8" /></g>;
    case 'fields': return <g {...common}><path d="M0 5V-5M0 -4.5c-2.5 0-3.2 2-2.6 3.2C-1.5-1.4 0-2.2 0-4.5ZM0 -2.7c2.5 0 3.2 2 2.6 3.2C1.5 .4 0-.4 0-2.7ZM0 0c-2.5 0-3.2 2-2.6 3.2C-1.5 3.1 0 2.3 0 0Z" /></g>;
    case 'keep': return <g {...common}><path d="M-5-2 0-5 5-2v7H-5Z" /><path d="M-2.8 5V1.2h5.6V5M-2.8 -0.8h5.6" /></g>;
    case 'tavern': return <g {...common}><path d="M-4-3h6v3.2a3 3 0 0 1-6 0Z" /><path d="M2-2h1.8v2.2A2.2 2.2 0 0 1 2 2.2M-2.5 4.8h5" /></g>;
    case 'city': return <g {...common}><path d="M-5 5V-1h2v-3h2v3h2v-2h2v8" /><path d="M-1 5V3h2v2M0 -4v-1.5" /></g>;
    default: return <g {...common}><circle cx="0" cy="0" r="3.5" /><path d="M0 -5v1M0 4v1M-5 0h1M4 0h1" /></g>;
  }
}

function Coast({ d, stroke, width, opacity = 1, extra = '' }: { d: string; stroke: string; width: number; opacity?: number; extra?: string }) {
  return <path d={d} fill="none" stroke={stroke} strokeWidth={width} opacity={opacity} strokeLinecap="round" strokeLinejoin="round" {...(extra ? { style: { filter: extra } } : {})} />;
}

export interface WorldMapProps {
  regions: any[];
  militaryRegions: any[];
  countries: any[];
  resources?: any[];
  regionEdges?: any[];
  armyUnits?: any[];
  activeWars?: any[];
  profile?: any;
  playerCharacter?: any;
  layer: MapLayer;
  onLayerChange: (layer: MapLayer) => void;
  selectedId: number;
  onSelect: (id: number) => void;
}

export default function WorldMap({
  regions, militaryRegions, countries, regionEdges = [], armyUnits = [], activeWars = [],
  profile, layer, onLayerChange, selectedId, onSelect,
}: WorldMapProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoverId, setHoverId] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ id: number; x: number; y: number } | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const dragRef = useRef<{
    mode: 'pan' | 'pinch' | null;
    startX: number; startY: number; panX: number; panY: number;
    startDist: number; startZoom: number; startMidX: number; startMidY: number; moved: boolean;
  }>({ mode: null, startX: 0, startY: 0, panX: 0, panY: 0, startDist: 0, startZoom: 1, startMidX: 0, startMidY: 0, moved: false });
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const suppressClickRef = useRef(false);
  const clearSuppressTimer = useRef<number | null>(null);
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  const sizeRef = useRef(size);

  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { panRef.current = pan; }, [pan]);
  useEffect(() => { sizeRef.current = size; }, [size]);

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) return;
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    if (typeof ResizeObserver === 'undefined') {
      setSize({ w: el.clientWidth || 1100, h: el.clientHeight || 950 });
      return;
    }
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) setSize({ w: rect.width, h: rect.height });
    });
    observer.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => observer.disconnect();
  }, []);

  const fitScale = size.w && size.h ? Math.min(size.w / VIEW.width, size.h / VIEW.height) : 0.65;
  const screenScale = Math.max(0.0001, fitScale * zoom);
  const markerScale = 1 / screenScale;
  const compact = size.w > 0 && size.w < 640;

  const visibleRegions = useMemo(() => (regions || []).filter((r: any) => r.id >= 1 && r.id <= 10), [regions]);
  const selected = visibleRegions.find((r: any) => r.id === selectedId) || visibleRegions[0];
  const hovered = hoverId ? visibleRegions.find((r: any) => r.id === hoverId) : null;
  const tooltipRegion = tooltip ? visibleRegions.find((r: any) => r.id === tooltip.id) : null;
  const ownerIdFor = useCallback((id: number) => {
    const region = visibleRegions.find((r: any) => r.id === id);
    const mil = (militaryRegions || []).find((m: any) => m.region_id === id);
    return mil?.owner_country_id ?? region?.country_id ?? 0;
  }, [visibleRegions, militaryRegions]);
  const ownerColor = useCallback((countryId: number) => {
    return REALMS.find((r) => r.id === countryId)?.color || OWNER_FALLBACK[countryId] || '#8a7a52';
  }, []);
  const ownerName = useCallback((countryId: number) => {
    return countries?.find((c: any) => c.id === countryId)?.name || REALM_FLAGS[countryId]?.name || 'Unsworn march';
  }, [countries]);

  const myCountryId = profile?.citizenship_country_id;
  const currentRegionId = profile?.current_region_id;
  const selectedOwner = selected ? ownerIdFor(selected.id) : 0;
  const hoveredOwner = hovered ? ownerIdFor(hovered.id) : 0;
  const flagId = hoverId ?? selectedId;
  const flagRegion = flagId ? PROVINCE_MAP[flagId] : null;
  const flagOwner = flagId ? ownerIdFor(flagId) : 0;

  const neighbors = useMemo(() => {
    if (!selected) return [] as number[];
    return getNeighbors(regionEdges || [], selected.id);
  }, [regionEdges, selected]);

  const borderWidth = 1.05 / screenScale;
  const labelScale = markerScale;
  const hoverLift = 3.2 / screenScale;
  const selectedLift = compact ? 2.6 / screenScale : 1.8 / screenScale;
  const shadowDy = 2.8 / screenScale;
  const shadowBlur = 3.4 / screenScale;

  const clampPan = useCallback((next: { x: number; y: number }, nextZoom: number) => {
    const rect = shellRef.current?.getBoundingClientRect();
    const w = rect?.width || sizeRef.current.w;
    const h = rect?.height || sizeRef.current.h;
    const maxX = (w * (nextZoom - 1)) / 2 + 30;
    const maxY = (h * (nextZoom - 1)) / 2 + 30;
    return { x: clamp(next.x, -maxX, maxX), y: clamp(next.y, -maxY, maxY) };
  }, []);

  const setZoomAt = useCallback((nextZoom: number, sx?: number, sy?: number) => {
    const z = clamp(nextZoom, 0.85, 3);
    const rect = shellRef.current?.getBoundingClientRect();
    const w = rect?.width || sizeRef.current.w;
    const h = rect?.height || sizeRef.current.h;
    const cx = (sx ?? w / 2) - w / 2;
    const cy = (sy ?? h / 2) - h / 2;
    const currentPan = panRef.current;
    const currentZoom = zoomRef.current;
    const mx = (cx - currentPan.x) / currentZoom;
    const my = (cy - currentPan.y) / currentZoom;
    const nextPan = { x: cx - mx * z, y: cy - my * z };
    setZoom(z);
    setPan(clampPan(nextPan, z));
  }, [clampPan]);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = el.getBoundingClientRect();
      const sx = event.clientX - rect.left;
      const sy = event.clientY - rect.top;
      const factor = event.deltaY > 0 ? 0.88 : 1.14;
      setZoomAt(zoomRef.current * factor, sx, sy);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [setZoomAt]);

  const focusRegion = useCallback((id: number) => {
    const region = visibleRegions.find((r: any) => r.id === id);
    const lore = PROVINCE_MAP[id];
    if (!region || !lore || !sizeRef.current.w) return;
    const [px, py] = lonLatToWorld(lore.lon, lore.lat);
    const targetZoom = Math.max(1.55, zoomRef.current);
    const nextPan = {
      x: -(px - VIEW_CENTER[0]) * fitScale * targetZoom,
      y: -(py - VIEW_CENTER[1]) * fitScale * targetZoom,
    };
    setZoom(targetZoom);
    setPan(clampPan(nextPan, targetZoom));
  }, [visibleRegions, fitScale, clampPan]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const rect = shellRef.current?.getBoundingClientRect();
    if (!rect) return;
    const p = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    pointersRef.current.set(event.pointerId, p);
    if (pointersRef.current.size === 1) {
      dragRef.current = {
        mode: 'pan', startX: p.x, startY: p.y, panX: panRef.current.x, panY: panRef.current.y,
        startDist: 0, startZoom: zoomRef.current, startMidX: p.x, startMidY: p.y, moved: false,
      };
    } else if (pointersRef.current.size === 2) {
      const [a, b] = Array.from(pointersRef.current.values());
      dragRef.current = {
        mode: 'pinch', startX: a.x, startY: a.y, panX: panRef.current.x, panY: panRef.current.y,
        startDist: Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)),
        startZoom: zoomRef.current, startMidX: (a.x + b.x) / 2, startMidY: (a.y + b.y) / 2, moved: true,
      };
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    const rect = shellRef.current?.getBoundingClientRect();
    if (!rect) return;
    const p = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    pointersRef.current.set(event.pointerId, p);
    const drag = dragRef.current;
    if (drag.mode === 'pinch' && pointersRef.current.size >= 2) {
      const [a, b] = Array.from(pointersRef.current.values());
      const dist = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      const nextZoom = clamp(drag.startZoom * (dist / drag.startDist), 0.85, 3);
      const mx = (drag.startMidX - rect.width / 2 - drag.panX) / drag.startZoom;
      const my = (drag.startMidY - rect.height / 2 - drag.panY) / drag.startZoom;
      const nextPan = { x: midX - rect.width / 2 - mx * nextZoom, y: midY - rect.height / 2 - my * nextZoom };
      setZoom(nextZoom);
      setPan(clampPan(nextPan, nextZoom));
      drag.moved = true;
      return;
    }
    if (drag.mode === 'pan') {
      const dx = p.x - drag.startX;
      const dy = p.y - drag.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) drag.moved = true;
      setPan(clampPan({ x: drag.panX + dx, y: drag.panY + dy }, zoomRef.current));
    }
  };

  const endPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size === 0) {
      if (dragRef.current.moved) {
        suppressClickRef.current = true;
        if (clearSuppressTimer.current) window.clearTimeout(clearSuppressTimer.current);
        clearSuppressTimer.current = window.setTimeout(() => { suppressClickRef.current = false; }, 240);
      }
      dragRef.current.mode = null;
    } else if (pointersRef.current.size === 1) {
      const [[, p]] = Array.from(pointersRef.current.entries());
      dragRef.current = {
        mode: 'pan', startX: p.x, startY: p.y, panX: panRef.current.x, panY: panRef.current.y,
        startDist: 0, startZoom: zoomRef.current, startMidX: p.x, startMidY: p.y, moved: true,
      };
    }
  };

  const selectProvince = (id: number) => {
    if (suppressClickRef.current) return;
    onSelect(id);
  };

  const showTooltip = (event: ReactPointerEvent<SVGPathElement>, id: number) => {
    if (event.pointerType !== 'mouse') return;
    const rect = shellRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHoverId(id);
    setTooltip({ id, x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  const moveTooltip = (event: ReactPointerEvent<SVGPathElement>) => {
    if (event.pointerType !== 'mouse' || !tooltip) return;
    const rect = shellRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip((t) => (t ? { ...t, x: event.clientX - rect.left, y: event.clientY - rect.top } : t));
  };

  const clearTooltip = () => { setHoverId(null); setTooltip(null); };

  const tooltipStyle = useMemo<CSSProperties>(() => {
    if (!tooltip || !size.w) return {};
    const tw = compact ? 220 : 260;
    const th = 132;
    return {
      left: clamp(tooltip.x + 16, 8, Math.max(8, size.w - tw - 8)),
      top: clamp(tooltip.y + 16, 8, Math.max(8, size.h - th - 8)),
    };
  }, [tooltip, size, compact]);

  const layerTint = layer === 'political' ? 0.24 : layer === 'geography' ? 0.08 : layer === 'economy' ? 0.14 : 0.18;
  const terrainOpacity = layer === 'geography' ? 1 : layer === 'political' ? 0.9 : 0.68;

  const provinceLabel = (region: any) => {
    const lore = PROVINCE_MAP[region.id];
    if (!lore) return null;
    const isActive = region.id === selectedId || region.id === hoverId || region.id === currentRegionId;
    if (compact && !isActive) return null;
    const [x, y] = lonLatToWorld(lore.lon, lore.lat);
    const owner = ownerIdFor(region.id);
    return (
      <g key={`label-${region.id}`} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${labelScale})`} pointerEvents="none">
        <text
          y={compact ? 22 : 25}
          textAnchor="middle"
          fontSize={compact ? 8.5 : 9.5}
          fontFamily="Marcellus SC, Georgia, serif"
          letterSpacing="0.08em"
          fill={isActive ? '#f0d49a' : '#2f2618'}
          stroke={isActive ? '#0a1019' : '#e9dcbc'}
          strokeWidth={isActive ? 2.6 : 2.2}
          paintOrder="stroke"
          opacity={isActive ? 1 : 0.9}
        >
          {lore.name.toUpperCase()}
        </text>
        {isActive && (
          <text y={compact ? 33 : 37} textAnchor="middle" fontSize="7.5" fontFamily="Barlow, sans-serif" letterSpacing="0.06em" fill={ownerColor(owner)} stroke="#0a1019" strokeWidth="2.4" paintOrder="stroke">
            {ownerName(owner)}
          </text>
        )}
      </g>
    );
  };

  const settlementMarker = (region: any) => {
    const lore = PROVINCE_MAP[region.id];
    if (!lore) return null;
    const [x, y] = lonLatToWorld(lore.lon, lore.lat);
    const owner = ownerIdFor(region.id);
    const mil = (militaryRegions || []).find((m: any) => m.region_id === region.id);
    const isSelected = region.id === selectedId;
    const isHover = region.id === hoverId;
    const isCurrent = region.id === currentRegionId;
    const armies = (armyUnits || []).filter((a: any) => a.current_region_id === region.id);
    const color = ownerColor(owner);
    const active = isSelected || isHover;
    return (
      <g key={`marker-${region.id}`} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`} pointerEvents="none" className={`atlas-marker${active ? ' is-active' : ''}`}>
        <g transform={`scale(${markerScale})`}>
          {active && <circle r="15" fill="none" stroke="#d8ae68" strokeWidth="0.8" opacity="0.6" />}
          <circle r={active ? 11 : 9.6} fill="#071018" fillOpacity="0.92" stroke={active ? '#f0d49a' : color} strokeWidth={active ? 1.8 : 1.4} />
          <circle r={active ? 7.8 : 6.9} fill="#172a35" />
          <SettlementGlyph kind={lore.icon} />
          {isCurrent && (
            <g transform="translate(0 -18)">
              <path d="M0 -3 1.4 -0.7 4 -0.4 2.1 1.4 2.6 4 0 2.6 -2.6 4 -2.1 1.4 -4 -0.4 -1.4 -0.7Z" fill="#f0d49a" stroke="#0a1019" strokeWidth="0.6" />
            </g>
          )}
          {layer === 'warfare' && armies.length > 0 && (
            <g transform="translate(10 9)">
              <rect x="-7" y="-6" width="14" height="11" rx="2" fill="#5b1f1f" stroke="#e7b4a7" strokeWidth="0.8" />
              <path d="M-3 -2 3 2M3 -2 -3 2" stroke="#f7dfc4" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          )}
          {layer === 'warfare' && mil && Number(mil.resistance_level) > 0 && (
            <g transform="translate(-11 9)">
              <rect x="-6" y="-5.5" width="12" height="10" rx="2" fill="#152430" stroke="#c7a46a" strokeWidth="0.7" />
              <text y="2.1" textAnchor="middle" fontSize="7" fontFamily="Barlow, sans-serif" fontWeight="700" fill="#f2e8d5">{mil.resistance_level}</text>
            </g>
          )}
        </g>
      </g>
    );
  };

  const provinceVisuals = visibleRegions.map((region: any) => {
    const d = TERRITORY_D[region.id];
    if (!d) return null;
    const owner = ownerIdFor(region.id);
    return (
      <path
        key={`fill-${region.id}`}
        d={d}
        fill={ownerColor(owner)}
        fillOpacity={layerTint}
        stroke="#4c3a22"
        strokeOpacity="0.82"
        strokeWidth={borderWidth}
        strokeLinejoin="round"
        pointerEvents="none"
        data-province-fill={region.id}
      />
    );
  });

  const overlayPath = (id: number, lift: number, variant: 'hover' | 'selected') => {
    const d = TERRITORY_D[id];
    if (!d) return null;
    const owner = ownerIdFor(id);
    const clipId = variant === 'hover' ? 'hoverProvinceClip' : 'selectedProvinceClip';
    return (
      <g
        key={`${variant}-${id}`}
        clipPath="url(#landClip)"
        pointerEvents="none"
        filter="url(#provinceLift)"
        className={`atlas-raised atlas-raised-${variant}`}
        style={{ transform: `translateY(${-lift}px)`, transition: reducedMotion ? 'none' : 'transform 190ms cubic-bezier(.2,.7,.2,1)' }}
      >
        <g clipPath={`url(#${clipId})`}>
          <use href="#terrainDetail" />
          <rect width={VIEW.width} height={VIEW.height} fill={ownerColor(owner)} opacity={variant === 'hover' ? 0.22 : 0.16} />
          <path d={d} fill="none" stroke="#f4dfad" strokeWidth={1.75 / screenScale} strokeLinejoin="round" />
          <path d={d} fill="none" stroke="#573d1d" strokeWidth={3.2 / screenScale} strokeOpacity="0.28" strokeLinejoin="round" />
        </g>
      </g>
    );
  };

  const selectedD = selected ? TERRITORY_D[selected.id] : '';
  const hoveredD = hovered ? TERRITORY_D[hovered.id] : '';

  return (
    <div
      ref={shellRef}
      className="atlas-shell"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse' && dragRef.current.mode === 'pan') endPointer(event);
      }}
    >
      <div className="atlas-aura" aria-hidden="true" />
      <div
        className="atlas-stage"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transition: dragRef.current.mode ? 'none' : reducedMotion ? 'none' : 'transform 140ms ease-out',
        }}
      >
        <div className="sr-only" aria-label="Accessible province list">
          {visibleRegions.map((region: any) => {
            const l = PROVINCE_MAP[region.id];
            if (!l) return null;
            return (
              <button
                key={`sr-btn-${region.id}`}
                type="button"
                onClick={() => selectProvince(region.id)}
                aria-label={l.name}
              >
                {l.name}
              </button>
            );
          })}
        </div>
        <svg
          className="atlas-svg"
          viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label="Interactive map of Al-Andalus, 1031 CE"
        >
          <defs>
            <linearGradient id="seaGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#12333f" />
              <stop offset="48%" stopColor="#0b2532" />
              <stop offset="100%" stopColor="#071018" />
            </linearGradient>
            <radialGradient id="seaGlow" cx="46%" cy="40%" r="62%">
              <stop offset="0%" stopColor="#2c6670" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#164552" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#071018" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="landGrad" x1="0" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#83906d" />
              <stop offset="38%" stopColor="#a9a477" />
              <stop offset="68%" stopColor="#c1a772" />
              <stop offset="100%" stopColor="#b58f5d" />
            </linearGradient>
            <radialGradient id="landWarm" cx="57%" cy="64%" r="58%">
              <stop offset="0%" stopColor="#e0bd7c" stopOpacity="0.55" />
              <stop offset="55%" stopColor="#c7a064" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#8c7a4e" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="textureFade" cx="50%" cy="48%" r="63%">
              <stop offset="0%" stopColor="#fff" stopOpacity="1" />
              <stop offset="72%" stopColor="#fff" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask id="textureMask">
              <rect width={VIEW.width} height={VIEW.height} fill="url(#textureFade)" />
            </mask>
            <pattern id="seaWaves" width="34" height="24" patternUnits="userSpaceOnUse">
              <path d="M0 12q8.5-5 17 0t17 0" fill="none" stroke="#a7c7c4" strokeOpacity="0.13" strokeWidth="0.8" />
            </pattern>
            <pattern id="paperGrain" width="9" height="9" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="2" r="0.28" fill="#4a3a22" opacity="0.13" />
              <circle cx="6" cy="7" r="0.22" fill="#f2e8d5" opacity="0.14" />
              <path d="M0 8.7h9" stroke="#4a3a22" strokeWidth="0.18" opacity="0.05" />
            </pattern>
            <filter id="coastGlow" x="-12%" y="-12%" width="124%" height="124%">
              <feGaussianBlur stdDeviation="4.5" />
            </filter>
            <filter id="provinceLift" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy={shadowDy} stdDeviation={shadowBlur} floodColor="#020609" floodOpacity="0.78" />
            </filter>
            <clipPath id="landClip"><path d={LAND_D} /></clipPath>
            <clipPath id="hoverProvinceClip"><path d={hoveredD || LAND_D} /></clipPath>
            <clipPath id="selectedProvinceClip"><path d={selectedD || LAND_D} /></clipPath>
          </defs>

          <rect width={VIEW.width} height={VIEW.height} fill="url(#seaGrad)" />
          <rect width={VIEW.width} height={VIEW.height} fill="url(#seaGlow)" />
          <rect width={VIEW.width} height={VIEW.height} fill="url(#seaWaves)" opacity="0.72" />

          {/* Cartographic sea labels and compass */}
          <g pointerEvents="none">
            {SEA_LABELS.map((label) => {
              const [x, y] = lonLatToWorld(label.lon, label.lat);
              return (
                <text
                  key={label.text}
                  x={x} y={y}
                  transform={`rotate(${label.rotate || 0} ${x} ${y})`}
                  textAnchor="middle"
                  fontFamily="Cinzel, Georgia, serif"
                  fontSize={label.size}
                  letterSpacing="0.22em"
                  fill="#8fb4b9"
                  opacity="0.62"
                >
                  {label.text}
                </text>
              );
            })}
            <g transform={`translate(${VIEW.width - 105} ${VIEW.height - 150})`} opacity="0.55">
              <circle r="34" fill="none" stroke="#c7a46a" strokeWidth="0.8" />
              <circle r="26" fill="none" stroke="#c7a46a" strokeWidth="0.45" opacity="0.7" />
              <path d="M0 -39V39M-39 0H39M-27.6 -27.6 27.6 27.6M27.6 -27.6-27.6 27.6" stroke="#c7a46a" strokeWidth="0.5" opacity="0.55" />
              <path d="m0 -30 5.5 24L0 22l-5.5-28Z" fill="#d8ae68" opacity="0.8" />
              <path d="m0 30 4 8h-8Z" fill="#d8ae68" opacity="0.45" />
              <text y="-44" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="11" fill="#e5c78e">N</text>
            </g>
            <g transform={`translate(${VIEW.pad + 8} ${VIEW.height - 44})`} opacity="0.6">
              <path d="M0 0h88" stroke="#c7a46a" strokeWidth="0.8" />
              <path d="M0 -4v8M44 -3v6M88 -4v8" stroke="#c7a46a" strokeWidth="0.7" />
              <text x="94" y="3" fontFamily="Barlow, sans-serif" fontSize="9" letterSpacing="0.16em" fill="#c7a46a">100 LEAGUES</text>
            </g>
          </g>

          <g clipPath="url(#landClip)">
            <path d={LAND_D} fill="url(#landGrad)" />
            <rect width={VIEW.width} height={VIEW.height} fill="url(#landWarm)" />
            <g mask="url(#textureMask)" style={{ mixBlendMode: 'soft-light' }} opacity={Math.max(0.06, 0.26 - Math.max(0, zoom - 1) * 0.1)}>
              <image
                href="/assets/reignward-wide/map-texture-3200.webp"
                x="0" y="0" width={VIEW.width} height={VIEW.height}
                preserveAspectRatio="xMidYMid slice"
                style={{ pointerEvents: 'none' }}
              />
            </g>
            <rect width={VIEW.width} height={VIEW.height} fill="url(#paperGrain)" opacity={0.35 + Math.min(0.3, Math.max(0, zoom - 1) * 0.12)} />

            <g id="terrainDetail" opacity={terrainOpacity}>
              {RANGES.map((range, i) => (
                <MountainChain key={range.name} points={range.points} count={range.count} size={range.size} seed={i * 13 + 3} />
              ))}
              {FORESTS.map((forest, i) => (
                <ForestCluster key={i} center={forest.center} spread={forest.spread} count={forest.count} scale={forest.scale} seed={i * 29 + 11} />
              ))}
              <g fill="none" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none">
                {RIVERS.map((river) => {
                  const d = worldPath(river.points, false);
                  return (
                    <g key={river.name}>
                      <path d={d} stroke="#315b63" strokeOpacity="0.6" strokeWidth={2.6 / screenScale} />
                      <path d={d} stroke="#79a8a7" strokeOpacity="0.78" strokeWidth={0.9 / screenScale} />
                    </g>
                  );
                })}
              </g>
              {NEUTRAL_LABELS.map((label) => {
                const [x, y] = lonLatToWorld(label.lon, label.lat);
                return (
                  <g key={label.text} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${labelScale})`}>
                    <text
                      textAnchor="middle"
                      y="0"
                      fontFamily="Cinzel, Georgia, serif"
                      fontSize={compact ? label.size * 0.78 : label.size}
                      letterSpacing="0.24em"
                      fill="#5b4a30"
                      opacity="0.42"
                    >
                      {label.text}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Province ownership layer */}
            <g id="provinceFills">{provinceVisuals}</g>

            {/* Roads and war fronts sit above ownership tint but below the lifted piece */}
            <g pointerEvents="none" fill="none" strokeLinecap="round">
              {(regionEdges || []).map((edge: any, i: number) => {
                const a = PROVINCE_MAP[edge.from_region_id];
                const b = PROVINCE_MAP[edge.to_region_id];
                if (!a || !b) return null;
                const [x1, y1] = lonLatToWorld(a.lon, a.lat);
                const [x2, y2] = lonLatToWorld(b.lon, b.lat);
                return (
                  <path
                    key={`road-${i}`}
                    d={`M${x1.toFixed(1)} ${y1.toFixed(1)} Q${((x1 + x2) / 2 + 8).toFixed(1)} ${((y1 + y2) / 2 - 10).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`}
                    stroke="#6b5836"
                    strokeOpacity={layer === 'economy' ? 0.6 : 0.28}
                    strokeWidth={0.8 / screenScale}
                    strokeDasharray={`${2.2 / screenScale} ${2.4 / screenScale}`}
                  />
                );
              })}
              {layer === 'economy' && (regionEdges || []).map((edge: any, i: number) => {
                const a = PROVINCE_MAP[edge.from_region_id];
                const b = PROVINCE_MAP[edge.to_region_id];
                if (!a || !b) return null;
                const [x1, y1] = lonLatToWorld(a.lon, a.lat);
                const [x2, y2] = lonLatToWorld(b.lon, b.lat);
                return (
                  <path
                    key={`trade-${i}`}
                    d={`M${x1.toFixed(1)} ${y1.toFixed(1)} Q${((x1 + x2) / 2 - 10).toFixed(1)} ${((y1 + y2) / 2 + 12).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`}
                    stroke="#d8ae68"
                    strokeOpacity="0.68"
                    strokeWidth={1.1 / screenScale}
                    strokeDasharray={`${4 / screenScale} ${2.5 / screenScale}`}
                  />
                );
              })}
              {layer === 'warfare' && selected && neighbors.map((neighborId) => {
                const otherOwner = ownerIdFor(neighborId);
                if (otherOwner === selectedOwner) return null;
                const a = PROVINCE_MAP[selected.id];
                const b = PROVINCE_MAP[neighborId];
                if (!a || !b) return null;
                const [x1, y1] = lonLatToWorld(a.lon, a.lat);
                const [x2, y2] = lonLatToWorld(b.lon, b.lat);
                const mx = (x1 + x2) / 2;
                const my = (y1 + y2) / 2;
                return (
                  <g key={`front-${neighborId}`}>
                    <path d={`M${x1} ${y1}L${x2} ${y2}`} stroke="#e7b4a7" strokeOpacity="0.28" strokeWidth={6 / screenScale} />
                    <path d={`M${x1} ${y1}L${x2} ${y2}`} stroke="#a54d4c" strokeOpacity="0.95" strokeWidth={1.8 / screenScale} strokeDasharray={`${3 / screenScale} ${2 / screenScale}`} />
                    <g transform={`translate(${mx} ${my}) scale(${markerScale})`}>
                      <circle r="9" fill="#2b1616" stroke="#e7b4a7" strokeWidth="1" />
                      <Swords x={-5.5} y={-5.5} width={11} height={11} color="#f2e8d5" />
                    </g>
                  </g>
                );
              })}
            </g>
          </g>

          {/* Coast inking: glow, dark foundation, pale inner line */}
          <path d={LAND_D} fill="none" stroke="#2b727c" strokeOpacity="0.5" strokeWidth={7 / screenScale} filter="url(#coastGlow)" pointerEvents="none" />
          <path d={LAND_D} fill="none" stroke="#07161d" strokeWidth={2.6 / screenScale} pointerEvents="none" />
          <path d={LAND_D} fill="none" stroke="#d9c89e" strokeOpacity="0.55" strokeWidth={0.9 / screenScale} pointerEvents="none" />

          {/* Raised selected piece, then raised hovered piece (hover wins) */}
          {selected && selected.id !== hoverId ? overlayPath(selected.id, selectedLift, 'selected') : null}
          {hovered ? overlayPath(hovered.id, hoverLift, 'hover') : null}

          {/* Markers, labels and owner flags */}
          <g>{visibleRegions.map((region: any) => provinceLabel(region))}</g>
          <g>{visibleRegions.map((region: any) => settlementMarker(region))}</g>

          {flagRegion && (
            <g transform={`translate(${lonLatToWorld(flagRegion.lon, flagRegion.lat)[0].toFixed(1)} ${lonLatToWorld(flagRegion.lon, flagRegion.lat)[1].toFixed(1)})`} pointerEvents="none" className="atlas-flag">
              <g transform={`scale(${markerScale})`}>
                <line x1="0" y1="-13" x2="0" y2="-45" stroke="#d8ae68" strokeWidth="1.3" strokeLinecap="round" />
                <circle cx="0" cy="-13" r="2.1" fill="#d8ae68" stroke="#0a1019" strokeWidth="0.7" />
                <g transform="translate(1.5 -45)" className="atlas-flag-cloth">
                  <RealmFlagArt realmId={flagOwner} scale={0.78} />
                </g>
                <text x="0" y="-49" textAnchor="middle" fontFamily="Marcellus SC, serif" fontSize="7.2" letterSpacing="0.12em" fill="#f0d49a" stroke="#0a1019" strokeWidth="2.2" paintOrder="stroke">
                  {ownerName(flagOwner).toUpperCase()}
                </text>
              </g>
            </g>
          )}

          {/* Invisible, fully-shaped interaction layer */}
          <g clipPath="url(#landClip)">
            {visibleRegions.map((region: any) => {
              const d = TERRITORY_D[region.id];
              if (!d) return null;
              const lore = PROVINCE_MAP[region.id];
              const owner = ownerIdFor(region.id);
              return (
                <path
                  key={`hit-${region.id}`}
                  d={d}
                  fill="transparent"
                  stroke="transparent"
                  strokeWidth={borderWidth}
                  pointerEvents="all"
                  tabIndex={0}
                  role="button"
                  aria-label={`${lore?.name || `Province ${region.id}`}, held by ${ownerName(owner)}`}
                  aria-pressed={selectedId === region.id}
                  data-province-id={region.id}
                  style={{ cursor: 'pointer', outline: 'none' }}
                  onPointerEnter={(event) => showTooltip(event, region.id)}
                  onPointerMove={moveTooltip}
                  onPointerLeave={clearTooltip}
                  onClick={() => selectProvince(region.id)}
                  onFocus={() => setHoverId(region.id)}
                  onBlur={() => setHoverId(null)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      selectProvince(region.id);
                    }
                  }}
                />
              );
            })}
          </g>
        </svg>
      </div>

      <div className="atlas-layerbar" role="tablist" aria-label="Map layers">
        <span className="atlas-layerbar-title"><Layers className="h-3.5 w-3.5" /> Atlas</span>
        {LAYERS.map(({ id, label, Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={layer === id}
            className={`atlas-layerbtn${layer === id ? ' is-active' : ''}`}
            onClick={() => onLayerChange(id)}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="atlas-zoom" aria-label="Map zoom controls">
        <span className="atlas-zoom-value">{Math.round(zoom * 100)}%</span>
        <button className="rw-btn" data-variant="icon" aria-label="Zoom out" onClick={() => setZoomAt(zoomRef.current - 0.2)}><Minus className="h-4 w-4" /></button>
        <button className="rw-btn" data-variant="icon" aria-label="Zoom in" onClick={() => setZoomAt(zoomRef.current + 0.2)}><Plus className="h-4 w-4" /></button>
        <button className="rw-btn" data-variant="icon" aria-label="Centre on my province" onClick={() => focusRegion(selectedId || currentRegionId || 1)}><Navigation className="h-4 w-4" /></button>
        <button className="rw-btn" data-variant="icon" aria-label="Reset map" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}><Compass className="h-4 w-4" /></button>
      </div>

      <div className="atlas-legend" aria-label="Realm legend">
        <p className="atlas-legend-title">The taifa leagues</p>
        {[1, 2, 3].map((id) => (
          <div key={id} className="atlas-legend-row">
            <RealmFlag realmId={id} className="h-4 w-6 shrink-0" title={REALM_FLAGS[id].name} />
            <span>{REALM_FLAGS[id].name.replace('Taifa of ', '')}</span>
          </div>
        ))}
        <div className="atlas-legend-row atlas-legend-neutral">
          <span className="atlas-legend-swatch" />
          <span>Beyond the chronicle</span>
        </div>
        <p className="atlas-legend-hint"><Flag className="h-3 w-3" /> {activeWars?.filter((w: any) => w.status === 'active').length || 0} active wars · edges are roads</p>
      </div>

      {tooltipRegion && !compact && (
        <div className="atlas-tooltip" style={tooltipStyle} role="status">
          <div className="atlas-tooltip-head">
            <RealmFlag realmId={ownerIdFor(tooltipRegion.id)} className="h-6 w-9 shrink-0" />
            <div>
              <p className="atlas-tooltip-name">{PROVINCE_MAP[tooltipRegion.id]?.name || `Province ${tooltipRegion.id}`}</p>
              <p className="atlas-tooltip-sub">{PROVINCE_MAP[tooltipRegion.id]?.subtitle}</p>
            </div>
          </div>
          <div className="atlas-tooltip-grid">
            <span>Owner</span><strong>{ownerName(ownerIdFor(tooltipRegion.id))}</strong>
            <span>Settlement</span><strong>{PROVINCE_MAP[tooltipRegion.id]?.name}</strong>
            <span>State</span><strong>{ownerIdFor(tooltipRegion.id) === myCountryId ? 'Thy sworn ground' : 'Foreign soil'} · resistance {(militaryRegions || []).find((m: any) => m.region_id === tooltipRegion.id)?.resistance_level ?? 0}</strong>
            {layer === 'geography' && <><span>Terrain</span><strong>{PROVINCE_MAP[tooltipRegion.id]?.terrain}</strong></>}
            {layer === 'economy' && <><span>Yields</span><strong>{PROVINCE_MAP[tooltipRegion.id]?.resources.join(' · ')}</strong></>}
            {layer === 'warfare' && <><span>Hosts</span><strong>{(armyUnits || []).filter((a: any) => a.current_region_id === tooltipRegion.id).length} mustered here</strong></>}
          </div>
          <p className="atlas-tooltip-tip">Click to open the province ledger</p>
        </div>
      )}
    </div>
  );
}
