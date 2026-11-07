'use client';

import React, { useMemo } from 'react';
import { EMBEDDED_BANNERS, EMBEDDED_CRESTS, REALMS } from './map/reignwardHeraldryData';

const wavingBannersCache = new Map<string, string>();

export const REALM_KEY_MAP: Record<number, string> = {
  1: 'qurtuba',
  2: 'ishbiliya',
  3: 'gharnata',
  4: 'tulaytula',
  5: 'saragusta',
  6: 'balansiya',
  7: 'almiriya',
  8: 'leon',
  9: 'navarre',
  10: 'barcelona',
};

export function resolveRealmKey(idOrKey?: string | number | null): string {
  if (!idOrKey) return 'qurtuba';
  if (typeof idOrKey === 'number') return REALM_KEY_MAP[idOrKey] || 'qurtuba';
  const lower = String(idOrKey).toLowerCase().trim();
  if (EMBEDDED_BANNERS[lower as keyof typeof EMBEDDED_BANNERS]) return lower;
  const num = parseInt(lower, 10);
  if (!isNaN(num) && REALM_KEY_MAP[num]) return REALM_KEY_MAP[num];
  return 'qurtuba';
}

export function getAnimatedBannerUrl(realmId?: string | number | null, allowMotion: boolean = true): string {
  const key = resolveRealmKey(realmId);
  const original = EMBEDDED_BANNERS[key as keyof typeof EMBEDDED_BANNERS];
  if (!original) return EMBEDDED_CRESTS[key as keyof typeof EMBEDDED_CRESTS] || '';

  if (!allowMotion || (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)) {
    return original;
  }

  if (wavingBannersCache.has(key)) {
    return wavingBannersCache.get(key)!;
  }

  try {
    const pole: string[] = [];
    const base64Part = original.split(',')[1];
    const decoded = typeof window !== 'undefined' ? atob(base64Part) : Buffer.from(base64Part, 'base64').toString('utf8');
    const source = decoded.replace(/<path d="M(?:26 34|27 34|20 23)[^>]*\/>/g, (part) => {
      pole.push(part);
      return '';
    });
    if (pole.length !== 3) return original;

    const wind = `<filter id="reignward-wind" x="-10%" y="-8%" width="120%" height="116%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".009 .006" numOctaves="2" seed="4" result="gust">
        <animate attributeName="baseFrequency" values=".009 .006;.013 .009;.01 .007;.009 .006" dur="8.4s" repeatCount="indefinite"/>
      </feTurbulence>
      <feDisplacementMap in="SourceGraphic" in2="gust" scale="4" xChannelSelector="R" yChannelSelector="G">
        <animate attributeName="scale" values="4;10;6;12;4" dur="7.6s" repeatCount="indefinite"/>
      </feDisplacementMap>
    </filter>`;
    const motion = `<style>
      #reignward-cloth{transform-origin:180px 43px;animation:reignward-billow 7.6s ease-in-out infinite}
      @keyframes reignward-billow{0%,100%{transform:skewX(-.5deg) rotate(-.3deg)}26%{transform:skewX(1.3deg) rotate(.3deg)}59%{transform:skewX(-1.1deg) rotate(-.25deg)}82%{transform:skewX(.8deg) rotate(.16deg)}}
      @media(prefers-reduced-motion:reduce){#reignward-cloth{animation:none;filter:none}}
    </style>`;

    const waving = source
      .replace('</defs>', `${wind}</defs>${motion}<g id="reignward-cloth" filter="url(#reignward-wind)">`)
      .replace('</svg>', `</g>${pole.join('')}</svg>`);

    const encoded = typeof window !== 'undefined' ? btoa(waving) : Buffer.from(waving).toString('base64');
    const url = 'data:image/svg+xml;base64,' + encoded;
    wavingBannersCache.set(key, url);
    return url;
  } catch {
    return original;
  }
}

export function getCrestUrl(realmId?: string | number | null): string {
  const key = resolveRealmKey(realmId);
  return EMBEDDED_CRESTS[key as keyof typeof EMBEDDED_CRESTS] || '';
}

export function getRealmMeta(realmId?: string | number | null) {
  const key = resolveRealmKey(realmId);
  const found = REALMS.find((r) => r[0] === key);
  if (found) {
    return { id: found[0], name: found[1], motto: found[2] };
  }
  return { id: 'qurtuba', name: 'Qurtuba', motto: 'The Citadel of Knowledge' };
}

interface HeraldicBannerProps {
  realmId?: string | number | null;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
  animate?: boolean;
}

export default function HeraldicBanner({ realmId, className, style, alt, animate = true }: HeraldicBannerProps) {
  const meta = getRealmMeta(realmId);
  const src = useMemo(() => getAnimatedBannerUrl(realmId, animate), [realmId, animate]);

  return (
    <img
      src={src}
      alt={alt || `${meta.name} War Banner`}
      className={className}
      style={{ display: 'block', maxWidth: '100%', height: 'auto', ...style }}
    />
  );
}

