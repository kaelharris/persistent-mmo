'use client';

import { useGameContext } from '../layout';
import { useState, useEffect } from 'react';
import { 
  Map, MapPin, Globe, Landmark, Users, 
  Shield, Coins, TrendingUp, X, 
  Flame, Eye, Layout, Cpu, Menu 
} from 'lucide-react';

interface RegionDisplay {
  id: number;
  name: string;
  owner?: string;
  ownerColor?: string;
  resource?: string;
  productionBonus?: number;
  isCapital?: boolean;
  isPort?: boolean;
  population?: number;
}

interface MapLayer {
  name: string;
  active: boolean;
}

export default function WorldMap() {
  const {
    profile, stats, countries, regions, activeWars, militaryRegions,
    armyUnits, activeElections, playerResources, realmResources,
    marketListings, marketOrders, marketHistory,
    toggleWatch, readNotification, getPriceAlerts,
    createPriceAlert, deletePriceAlert,
    playerReputation, playerTitles, playerBadges,
    travelToRegion, workAtCompany, trainStrength,
    claimEnergy, claimFunding, cheatResourcesAndCurrencies,
    getNobleHouses, getDynasty, getDynastyMembers,
    getRulerLegitimacy, getKingdomStability,
    establishDynasty, designateHeir, resolveSuccession,
    updateLegitimacy, getSuccessionOrder
  } = useGameContext();

  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [activeLayer, setActiveLayer] = useState<'political' | 'terrain' | 'economic' | 'warfare'>('political');
  const [showRegionDetails, setShowRegionDetails] = useState(false);
  const [regionDetail, setRegionDetail] = useState<RegionDisplay | null>(null);

  // Layer switching
  const layers: MapLayer[] = [
    { name: 'Political', active: activeLayer === 'political' },
    { name: 'Terrain', active: activeLayer === 'terrain' },
    { name: 'Economic', active: activeLayer === 'economic' },
    { name: 'Warfare', active: activeLayer === 'warfare' }
  ];

  // Region data based on active layer
  const displayedRegions = regions.map((region: any) => {
    const country = countries.find((c: any) => c.id === region.country_id);
    const ownerColor = country?.local_currency_reserve > 0 ? 'text-game-gold' : 'text-zinc-500';
    
    let displayName = region.name;
    let extraInfo = '';
    let resourceIcon = '';
    
    // Economic layer shows resources
    if (activeLayer === 'economic') {
      const resource = realmResources?.find((r: any) => r.region_id === region.id);
      if (resource) {
        resourceIcon = <Eye className="h-3 w-3 text-game-gold mr-1" />;
        extraInfo = `<div className="text-[8px] text-zinc-500">Production: {resource.production_bonus.toFixed(2)}x</div>`;
      }
    }
    
    // Warfare layer shows armies and battles
    if (activeLayer === 'warfare') {
      const army = armyUnits?.find((a: any) => a.current_region_id === region.id);
      const isContested = militaryRegions?.some((m: any) => m.region_id === region.id && m.resistance_level > 0);
      if (army) {
        resourceIcon = <Sword className="h-3 w-3 text-red-500 mr-1" />; // Using Sword from lucide... actually not imported
        // Just use a generic indicator
        resourceIcon = <div className="h-3 w-3 text-red-500" />; // Will use rect
      }
      if (isContested) {
        extraInfo = `<div className="text-[8px] text-red-500">Besieged: resistance ${militaryRegions?.find((m: any) => m.region_id === region.id)?.resistance_level || 0}</div>`;
      }
    }
    
    // Political layer shows kingdom ownership
    if (activeLayer === 'political') {
      extraInfo = country ? `<div className="text-[8px] text-zinc-500">Lord: ${country.name}</div>` : '';
    }
    
    // Capital indicator
    const isCapital = region.capital;
    
    return {
      ...region,
      displayName: displayName,
      ownerColor,
      extraInfo,
      resourceIcon,
      isCapital
    };
  });

  // Handle region click
  const handleRegionClick = (regionId: number) => {
    setSelectedRegionId(regionId);
    setShowRegionDetails(true);
  };

  // Handle layer switch
  const handleLayerSwitch = (layer: string) => {
    setActiveLayer(layer);
  };

  // Handle travel
  const handleTravel = async (targetRegionId: number) => {
    if (!profile || !stats) return;
    if (stats.energy < 10) {
      triggerFloatingText('Insufficient energy. Travel requires 10 energy.', 'text-red-500');
      return;
    }
    const res = await travelToRegion(targetRegionId);
    if (res.success) {
      triggerFloatingText(`Traveled to region ${regionDetail?.displayName || 'unknown'}`, 'text-game-gold');
    } else {
      triggerFloatingText(res.error || 'Travel failed', 'text-red-500');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header with layer switcher */}
      <div className="rpg-panel-stone p-4 md:p-6 border-b border-zinc-800/50 relative">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-display text-game-gold tracking-wider">
              <Map className="h-4 w-4 mr-2" /> World Map
            </h2>
            <p className="text-zinc-500 text-sm">
              {profile?.username || 'Ruler'} — {selectedRegionId ? 'Region View' : 'World Map'}
            </p>
          </div>
          
          {/* Layer Switcher */}
          <div className="flex gap-2">
            {layers.map((layer) => (
              <button
                key={layer.name}
                onClick={() => handleLayerSwitch(layer.name)}
                className={`rpg-button px-3 py-1.5 text-[8px] tracking-widest ${
                  layer.active ? 'border-game-gold text-game-gold' : 'opacity-60'
                }`}
              >
                {layer.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="p-4 md:p-6 overflow-x-auto">
        {/* Simple region grid representation */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {displayedRegions.map((region) => (
            <div
              key={region.id}
              onClick={() => handleRegionClick(region.id)}
              className={`rpg-panel-stone p-4 rounded-none cursor-pointer hover:bg-zinc-900 transition-colors ${
                selectedRegionId === region.id ? 'border border-game-gold/30 bg-game-gold/10' : 'border-zinc-800/50'
              } ${region.isCapital ? 'font-bold' : ''}`}
              style={{
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div className="flex items-start gap-2 mb-2">
                <div className="w-6 h-6 rounded ${
                  region.isCapital ? 'bg-game-gold text-zinc-950' : 'bg-zinc-950 text-zinc-500'
                } flex items-center justify-center text-[7px] font-bold ${
                  region.isCapital ? 'text-zinc-950' : 'text-zinc-400'
                }">
                  {region.displayName.substring(0, 2).toUpperCase()}
                </div>
                <MapPin className="h-3 w-3 text-zinc-500 shrink-0" />
              </div>
              
              <div className="text-xs font-bold font-display text-zinc-200">{region.displayName}</div>
              
              <div className="mt-2 flex justify-between text-[8px]">
                <span className={region.ownerColor}>
                  {region.owner || 'Unclaimed'}
                </span>
                {region.resourceIcon}
              </div>
              
              {region.extraInfo && (
                <div className="mt-1 text-[8px] text-zinc-500">{region.extraInfo}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Region Details Panel */}
      {showRegionDetails && selectedRegionId && regionDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="rpg-panel-stone rpg-panel-wide max-w-2xl w-full rounded-none p-8">
            <h3 className="text-xl font-bold font-display text-game-gold mb-4">
              {regionDetail.displayName}
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Owner</p>
                <p className="text-zinc-400">{regionDetail.owner || 'Unclaimed'}</p>
              </div>
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Production Bonus</p>
              <p className="text-zinc-400">{regionDetail.productionBonus?.toFixed(2) || 1}x</p>
            </div>
            
            {regionDetail.resourceIcon && (
              <div className="mb-4">
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Resource</p>
                <div className="flex items-center gap-2 mt-1">
                  {regionDetail.resourceIcon}
                  <span className="text-zinc-400">{regionDetail.resource || 'None'}</span>
                </div>
              </div>
            )}
            
            {regionDetail.extraInfo && (
              <div className="mb-4">
                {regionDetail.extraInfo}
              </div>
            )}
            
            {/* Action buttons based on layer */}
            <div className="flex gap-3 mt-6">
              {activeLayer === 'political' && (
                <button
                  onClick={() => setShowRegionDetails(false)}
                  className="rpg-button rpg-button-crimson flex-1 py-2 text-[9px] tracking-widest"
                >
                  Close
                </button>
              )}
              {activeLayer === 'economic' && stats?.energy >= 10 && (
                <button
                  onClick={() => handleTravel(regionDetail.id)}
                  className="rpg-button rpg-button-emerald flex-1 py-2 text-[9px] tracking-widest"
                >
                  Travel Here {regionDetail.isCapital ? ' (Capital)' : ''}
                </button>
              )}
              {activeLayer === 'warfare' && (
                <button
                  onClick={() => setShowRegionDetails(false)}
                  className="rpg-button rpg-button-crimson flex-1 py-2 text-[9px] tracking-widest"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar-style info when region selected (fullscreen overlay) */}
      {selectedRegionId && !showRegionDetails && regionDetail && (
        <div className="fixed inset-0 bg-black/40 z-40">
          <div className="rpg-panel-wood rpg-panel-wide max-w-2xl w-full mx-6 md:mx-8 py-8 rounded-none">
            <h3 className="text-xl font-bold font-display text-game-gold mb-6">
              {regionDetail.displayName}
            </h3>
            <p className="text-zinc-500 text-sm mb-4">
              {regionDetail.owner ? `Under ${regionDetail.owner}'s control` : 'Unclaimed territory'}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Production</p>
                <p className="text-zinc-400">{regionDetail.productionBonus?.toFixed(2) || 1}x</p>
              </div>
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Population</p>
              <p className="text-zinc-400">{regionDetail.population || 'Unknown'}</p>
            </div>
            
            {regionDetail.resourceIcon && (
              <div className="mb-4">
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Resource</p>
                <div className="flex items-center gap-2 mt-1">
                  {regionDetail.resourceIcon}
                  <span className="text-zinc-400">{regionDetail.resource || 'None'}</span>
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <button
                onClick={() => setSelectedRegionId(null)}
                className="rpg-button rpg-button-emerald w-full py-3 text-[10px] tracking-widest"
              >
                Return to Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating feedback */}
      {triggerFloatingText && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-center">
          {triggerFloatingText}
        </div>
      )}
    </div>
  );
}