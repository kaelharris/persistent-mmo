'use client';

import { useState } from 'react';
import { RegionGeography, RegionEdge } from '@/types/entities';

export interface ProvinceMapProps {
  geographies: RegionGeography[];
  edges: RegionEdge[];
  controls: any[];
}

export function ProvinceMap({ geographies, edges, controls }: ProvinceMapProps) {
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [mode, setMode] = useState<'political' | 'terrain' | 'economy' | 'war'>('political');

  // Build a lookup for control by region_id
  const controlByRegion = new Map<number, any>();
  controls.forEach((c) => controlByRegion.set(c.region_id, c));

  // Build a lookup for geography by region_id
  const geoByRegion = new Map<number, RegionGeography>();
  geographies.forEach((g) => geoByRegion.set(g.region_id, g));

  // Build adjacency lookup: region_id -> neighbor ids
  const adjacency = new Map<number, number[]>();
  edges.forEach((e) => {
    if (!adjacency.has(e.from_region_id)) adjacency.set(e.from_region_id, []);
    if (!adjacency.has(e.to_region_id)) adjacency.set(e.to_region_id, []);
    adjacency.get(e.from_region_id)!.push(e.to_region_id);
    adjacency.get(e.to_region_id)!.push(e.from_region_id);
  });

  const ownerColor = (countryId: number): string => {
    const colors: Record<number, string> = {
      100: '#7c3aed', // Qurtuban Emirate - violet
      101: '#d97706', // Maghrebi Kingdom - amber
      102: '#dc2626', // Byzantine Exarchate - red
      103: '#2563eb', // Republic of Genoa - blue
    };
    return colors[countryId] ?? '#6b7280';
  };

  const getRegionName = (regionId: number): string => {
    const g = geoByRegion.get(regionId);
    return g ? (g.display_name_local || g.code || `Region ${regionId}`) : `Region ${regionId}`;
  };

  const handleRegionClick = (regionId: number) => {
    setSelectedRegionId(regionId === selectedRegionId ? null : regionId);
  };

  const handleModeChange = (m: 'political' | 'terrain' | 'economy' | 'war') => {
    setMode(m);
    setSelectedRegionId(null);
  };

  const getNeighborNames = (regionId: number): string => {
    const neighbors = adjacency.get(regionId) ?? [];
    return neighbors.map((n) => getRegionName(n)).join(', ') || 'None';
  };

  return (
    <div className="relative w-full h-full bg-zinc-950">
      {/* Map canvas area */}
      <div className="absolute inset-0 bg-[url('/assets/backgrounds/fantasy_world_map.png')] bg-cover bg-center opacity-30"/>

      <div className="relative w-full h-full">
        {/* Province nodes */}
        <div className="absolute inset-0 p-4">
          <div className="flex flex-wrap gap-2 w-full max-w-4xl mx-auto">
            {geographies.map((g) => {
              const control = controlByRegion.get(g.region_id);
              const ownerCountryId = control?.owner_country_id ?? 100;
              const isSelected = selectedRegionId === g.region_id;

              let borderColor: string;
              let bgColor: string;
              if (mode === 'political') {
                borderColor = ownerColor(ownerCountryId);
                bgColor = ownerColor(ownerCountryId) + '20';
              } else if (mode === 'terrain') {
                const terrainColors: Record<string, string> = {
                  plains: '#22c55e',
                  forest: '#16a34a',
                  mountain: '#94a3b8',
                  desert: '#eab308',
                  coastal: '#3b82f6',
                  marine: '#1e40af',
                  volcanic: '#7f1d1d',
                  island: '#8b5cf6',
                };
                borderColor = terrainColors[g.terrain] ?? '#6b7280';
                bgColor = terrainColors[g.terrain] + '20';
              } else {
                borderColor = isSelected ? '#fbbf24' : '#6b7280';
                bgColor = isSelected ? '#fbbf2420' : '#1f2937';
              }

              return (
                <button
                  key={g.region_id}
                  onClick={() => handleRegionClick(g.region_id)}
                  className={`
                    group relative flex flex-col items-center justify-center w-16 h-16 rounded-full border-2
                    ${borderColor}
                    ${bgColor}
                    ${isSelected ? 'ring-2 ring-yellow-400 scale-110' : ''}
                    hover:border-yellow-400/50 hover:scale-105 transition-all duration-200
                    ${g.capital ? 'ring-1 ring-yellow-500' : ''}
                  `}
                  title={getRegionName(g.region_id)}
                >
                  <span className="absolute -top-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 {g.capital ? 'opacity-100' : ''}"/>
                  <span className="text-xs font-bold text-zinc-100 leading-tight text-center px-1">
                    {String(g.region_id)}
                  </span>
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 bg-zinc-900/90 px-1 py-0.5 rounded border border-zinc-700 pointer-events-none whitespace-nowrap">
                    {getRegionName(g.region_id)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mode selector */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        {(['political', 'terrain', 'economy', 'war'] as const).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m as 'political' | 'terrain' | 'economy' | 'war')}
            className={`px-3 py-1.5 rounded text-xs font-serif transition-colors ${
              mode === m
                ? 'bg-game-gold text-zinc-950'
                : 'bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Selected region detail panel */}
      {selectedRegionId !== null && (
        <div className="absolute top-4 right-4 w-80 bg-zinc-900 border border-zinc-700 rounded-lg p-4 shadow-xl">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-zinc-100">{getRegionName(selectedRegionId)}</h3>
            <button
              onClick={() => setSelectedRegionId(null)}
              className="text-zinc-400 hover:text-zinc-100"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2 text-sm text-zinc-300">
            <div className="flex justify-between">
              <span className="text-zinc-500">Terrain:</span>
              <span className="capitalize">{geoByRegion.get(selectedRegionId)?.terrain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Climate:</span>
              <span className="capitalize">{geoByRegion.get(selectedRegionId)?.climate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Culture:</span>
              <span>{geoByRegion.get(selectedRegionId)?.culture}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Development:</span>
              <span>{geoByRegion.get(selectedRegionId)?.development}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Owner:</span>
              <span className={ownerColor(controlByRegion.get(selectedRegionId)?.owner_country_id ?? 100)}>
                {controlByRegion.get(selectedRegionId)?.owner_country_id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Port:</span>
              <span>{geoByRegion.get(selectedRegionId)?.is_port ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Neighbors:</span>
              <span className="truncate">{getNeighborNames(selectedRegionId)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
