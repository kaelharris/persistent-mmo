'use client';

import { useGameContext } from '../layout';
import { useState } from 'react';
import { 
  User, Shield, MapPin, Crown, Leaf, Hammer, 
  Palette, Map, Globe, Users, Settings, 
  LogOut, X, CheckCircle, XCircle 
} from 'lucide-react';

export default function CharacterCreation() {
  const {
    profile, stats, countries, activeElections, candidates,
    setError, setSuccessMsg, triggerFloatingText
  } = useGameContext();

  const [step, setStep] = useState<'name' | 'kingdom' | 'profession' | 'complete'>('name');
  const [name, setName] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [profession, setProfession] = useState<string | null>(null);
  
  const professionOptions = [
    { id: 'gatherer', label: 'Gatherer', description: 'Harvests resources from the land' },
    { id: 'farmer', label: 'Farmer', description: 'Cultivates grain and crops' },
    { id: 'miner', label: 'Miner', description: 'Extracts stone and ore' },
    { id: 'lumberjack', label: 'Lumberjack', description: 'Harvests timber from forests' },
    { id: 'smith', label: 'Smith', description: 'Forge weapons and armor' },
    { id: 'merchant', label: 'Merchant', description: 'Trades resources in the marketplace' }
  ];

  const handleContinue = () => {
    if (!name.trim()) {
      triggerFloatingText('Please enter a name', 'text-red-500');
      return;
    }
    if (!selectedCountryId) {
      triggerFloatingText('Please select a kingdom', 'text-red-500');
      return;
    }
    if (!profession) {
      triggerFloatingText('Please select a profession', 'text-red-500');
      return;
    }
    
    // Initialize profile with the new ruler
    // In production, this would call the repository to create the profile
    setStep('complete');
    triggerFloatingText(`Welcome, ${name}! Your journey begins.`, 'text-game-gold');
  };

  const handleCountrySelect = (countryId: number) => {
    setSelectedCountryId(countryId);
  };

  const handleProfessionSelect = (prof: string) => {
    setProfession(prof);
  };

  if (step === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="rpg-panel-stone p-8 rounded-none text-center max-w-md">
          <CheckCircle className="h-12 w-12 text-game-emerald mb-6" />
          <h2 className="text-2xl font-bold font-display text-game-gold mb-4">Welcome to Aegis Kingdoms!</h2>
          <p className="text-zinc-400 text-lg mb-6">
            Your kingdom awaits. The decisions you make will shape your realm's destiny.
          </p>
          <button
            onClick={() => {/* Navigate to dashboard */}}
            className="rpg-button rpg-button-emerald w-full py-3 text-[10px] tracking-widest"
          >
            Enter Kingdom
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="rpg-panel-stone p-6 rounded-none border-b border-zinc-800/50 relative">
        <div className="flex items-center gap-4">
          <div className="p-3 border border-zinc-800 bg-zinc-950 rounded-none">
            <User className="h-5 w-5 text-game-gold" />
            <span className="text-[10px] font-bold font-display uppercase tracking-widest text-game-gold">New Ruler</span>
          </div>
          <button
            onClick={() => setStep(prev => prev === 'name' ? 'complete' : 'name')}
            className="p-2 border border-zinc-800 bg-zinc-900 rounded-none text-zinc-400 hover:text-game-gold hover:border-game-gold transition-colors"
          >
            {step !== 'name' ? 'Back' : 'Start'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        {step === 'name' && (
          <div className="mb-8">
            <h3 className="text-font text-xs font-bold font-display uppercase tracking-widest text-zinc-500 mb-4">
              Enter Your Name
            </h3>
            <p className="text-zinc-500 text-sm mb-4">
              Choose a name that will be remembered in the annals of your kingdom.
            </p>
            <div className="flex flex-col gap-4">
              <input
                value name
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="rpg-input px-4 py-3 text-[16px] w-full border border-zinc-800 bg-zinc-950 rounded-none focus:border-game-gold focus:bg-zinc-900 text-game-gold placeholder-zinc-500"
              />
            </div>
          </div>
        )}

        {step === 'kingdom' && (
          <div>
            <h3 className="text-font text-xs font-bold font-display uppercase tracking-widest text-zinc-500 mb-4">
              Select Your Kingdom
            </h3>
            <p className="text-zinc-500 text-sm mb-6">
              Choose the realm whose destiny you will shape. Each kingdom has its own strengths and territories.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {countries.map((country) => (
                <div
                  key={country.id}
                  onClick={() => handleCountrySelect(country.id)}
                  className={`rpg-panel-stone p-5 rounded-none cursor-pointer transition-colors ${selectedCountryId === country.id ? 'border border-game-gold/30 bg-game-gold/10' : 'border-zinc-800 bg-zinc-950'}`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-game-gold" />
                    <span className="font-bold font-display text-zinc-200">{country.name}</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">{country.local_currency_reserve?.toLocaleString() || '0'} LC reserve</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'profession' && (
          <div>
            <h3 className="text-font text-xs font-bold font-display uppercase tracking-widest text-zinc-500 mb-4">
              Choose Your Profession
            </h3>
            <p className="text-zinc-500 text-sm mb-6">
              Your profession determines your initial resources and abilities. You can change this later as your career evolves.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {professionOptions.map((prof) => (
                <div
                  key={prof.id}
                  onClick={() => handleProfessionSelect(prof.id)}
                  className={`rpg-panel-stone p-4 rounded-none cursor-pointer transition-colors ${profession === prof.id ? 'border border-game-gold/30 bg-game-gold/10' : 'border-zinc-800 bg-zinc-950'}`}
                >
                  <div className="flex items-center gap-3">
                    prof.id === 'gatherer' ? <Leaf /> : prof.id === 'farmer' ? <Palette /> : prof.id === 'miner' ? <Globe /> : prof.id === 'lumberjack' ? <User /> : 'Smith'
                    <span className="font-bold font-display text-zinc-200">{prof.label}</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">{prof.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completion state is handled above */}
      </div>
    </div>
  );
}