'use client';

import React from 'react';
import { RealmFlag } from '../map/heraldry';

interface RegionTooltipProps {
  name: string;
  countryName?: string;
  countryId?: number | null;
  terrain?: string;
  resources?: string[];
  x: number;
  y: number;
  visible: boolean;
}

export default function RegionTooltip({
  name,
  countryName,
  countryId,
  terrain,
  resources,
  x,
  y,
  visible,
}: RegionTooltipProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 px-3 py-2 bg-[#111D28]/95 border border-[#d8ae68]/60 shadow-xl backdrop-blur-md rounded-none"
      style={{ left: x, top: y }}
    >
      <div className="flex items-center gap-2 mb-1">
        <RealmFlag realmId={countryId} className="w-5 h-3.5" />
        <span className="font-display text-xs text-[#f2e8d5] uppercase tracking-wider">{name}</span>
      </div>
      {countryName && (
        <div className="text-[10px] text-[#b6ae9b] font-serif">{countryName}</div>
      )}
      {terrain && (
        <div className="text-[9px] text-[#8daa8a] font-sans capitalize">{terrain}</div>
      )}
      {resources && resources.length > 0 && (
        <div className="text-[9px] text-[#d8ae68] mt-1 font-mono">
          Yield: {resources.join(', ')}
        </div>
      )}
    </div>
  );
}

