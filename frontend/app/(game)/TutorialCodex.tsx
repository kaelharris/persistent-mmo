'use client';

import React, { useState } from 'react';
import { 
  Compass, CheckCircle2, ChevronRight, Award, Sparkles, 
  X, ChevronDown, ChevronUp, Flame, MapPin, Pickaxe, Hammer, Swords, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TutorialStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  actionHint: string;
  rewardLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  buttonLabel: string;
  targetTab: 'none' | 'kingdom' | 'army' | 'economy' | 'quests' | 'profile' | 'gather' | 'inventory';
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: 'The Citadel Rations',
    subtitle: 'Claim Coordinate Energy',
    description: 'Every commander requires energy to command troops and harvest resources. Open the Kingdom Hub and claim your hourly coordinate energy from the Citadel Foundry.',
    actionHint: 'Click "KINGDOM" in the sidebar, then click "RESTORE" (+100 EP).',
    rewardLabel: '+50 Gold & +25 XP',
    icon: Flame,
    buttonLabel: '👑 Open Kingdom Hub',
    targetTab: 'kingdom'
  },
  {
    id: 2,
    title: 'March to the Frontier',
    subtitle: 'Relocate to Emerald Woodlands',
    description: 'Genesis Capital is a fortified citadel with no wild nodes. Select the Emerald Woodlands outpost on the map and relocate your vanguard.',
    actionHint: 'Click the Emerald Woodlands node (top-left forest), then click "RELOCATE" (costs 10 EP).',
    rewardLabel: '+100 Local Currency & +30 XP',
    icon: MapPin,
    buttonLabel: '🗺️ View World Map',
    targetTab: 'none'
  },
  {
    id: 3,
    title: 'The Forest Harvest',
    subtitle: 'Extract Raw Resources',
    description: 'You have entered the wilderness. Use your tools to extract timber and botanical herbs to fuel our industry.',
    actionHint: 'Click "GATHER" on the bottom dock or strike the resource node timing bar.',
    rewardLabel: '+3 Raw Timber & +20 XP',
    icon: Pickaxe,
    buttonLabel: '⛏️ Harvest Node',
    targetTab: 'gather'
  },
  {
    id: 4,
    title: 'The Crafter\'s Forge',
    subtitle: 'Refine Survival Rations',
    description: 'Raw grain and water must be refined into field rations. Visit the marketplace smelting forge to bake hearty Wheat Bread.',
    actionHint: 'Click "ECONOMY" in the sidebar, then click "REFINE WHEAT BREAD".',
    rewardLabel: '1x Rations Loaf (+10 EP) & +40 XP',
    icon: Hammer,
    buttonLabel: '🪙 Open Economy',
    targetTab: 'economy'
  },
  {
    id: 5,
    title: 'Trial by Combat',
    subtitle: 'Defeat the Forest Wolf',
    description: 'Predators stalk our borders. Deploy your vanguard into combat and secure your first military victory for the realm.',
    actionHint: 'Click "ARMY" in the sidebar, select Forest Wolf, and click "BEGIN BATTLE".',
    rewardLabel: '+10 Gold, +100 XP & Vanguard Crest',
    icon: Swords,
    buttonLabel: '⚔️ Enter Combat',
    targetTab: 'army'
  }
];

interface TutorialCodexProps {
  currentStep: number;
  isCompleted: boolean;
  onNavigateTab: (tab: 'none' | 'kingdom' | 'army' | 'economy' | 'quests' | 'profile' | 'gather' | 'inventory') => void;
  onSelectRegion?: (regionId: number) => void;
  onSkipTutorial: () => void;
  onRestartTutorial: () => void;
}

export default function TutorialCodex({
  currentStep,
  isCompleted,
  onNavigateTab,
  onSelectRegion,
  onSkipTutorial,
  onRestartTutorial
}: TutorialCodexProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  const activeStep = TUTORIAL_STEPS.find(s => s.id === currentStep) || TUTORIAL_STEPS[0];
  const progressPercent = isCompleted ? 100 : Math.round(((currentStep - 1) / TUTORIAL_STEPS.length) * 100);

  if (isCompleted) {
    return (
      <div className="absolute top-4 left-4 z-30 pointer-events-auto">
        <div className="rpg-panel-stone px-3 py-1.5 border border-[#e5c158]/40 shadow-lg flex items-center gap-2">
          <Award className="h-4 w-4 text-game-gold" />
          <span className="text-[10px] font-serif font-bold text-game-gold uppercase tracking-wider">
            Tutorial Completed (Arch-Commander)
          </span>
          <button 
            onClick={onRestartTutorial}
            title="Restart Tutorial"
            className="p-1 hover:text-white text-zinc-500 transition-colors ml-1"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-4 z-30 w-80 pointer-events-auto transition-all duration-300">
      <div className="rpg-panel-stone border border-[#e5c158]/50 shadow-2xl overflow-hidden backdrop-blur-md">
        {/* Header Bar */}
        <div className="px-3.5 py-2.5 bg-zinc-950/80 border-b border-[#e5c158]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-game-gold animate-spin-slow" />
            <h4 className="text-[11px] font-bold text-game-gold uppercase tracking-wider font-display">
              Aegis Commander Codex
            </h4>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-sans font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
              STEP {currentStep} / {TUTORIAL_STEPS.length}
            </span>
            <button
              onClick={() => setIsMinimized(prev => !prev)}
              className="p-1 text-zinc-400 hover:text-zinc-100 transition-colors"
              title={isMinimized ? "Expand Codex" : "Minimize Codex"}
            >
              {isMinimized ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Progress Fill */}
        <div className="w-full bg-zinc-900 h-1 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Expandable Body */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-3.5 flex flex-col gap-2.5 text-left"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  {React.createElement(activeStep.icon, { className: "h-3.5 w-3.5 text-game-gold flex-shrink-0" })}
                  <h5 className="text-[11.5px] font-bold text-zinc-100 font-display uppercase tracking-wide">
                    {activeStep.title}
                  </h5>
                </div>
                <p className="text-[9px] text-amber-300/80 font-serif uppercase tracking-widest mt-0.5">
                  {activeStep.subtitle}
                </p>
              </div>

              <p className="text-[10px] text-zinc-400 font-serif leading-relaxed">
                {activeStep.description}
              </p>

              {/* Action Directive Box */}
              <div className="bg-zinc-950/80 p-2.5 border border-zinc-850 rounded flex flex-col gap-1 text-[9.5px] font-serif">
                <span className="text-zinc-500 text-[8.5px] uppercase tracking-wider font-bold">Direct Order:</span>
                <span className="text-zinc-200 leading-snug">
                  {activeStep.actionHint}
                </span>
              </div>

              {/* Milestone Reward Tag */}
              <div className="flex items-center justify-between text-[9px] px-2 py-1 bg-amber-500/5 border border-amber-500/20 rounded">
                <span className="text-zinc-400">Milestone Reward:</span>
                <span className="text-game-gold font-bold flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5" /> {activeStep.rewardLabel}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    if (activeStep.id === 2 && onSelectRegion) {
                      onSelectRegion(2); // Emerald Woodlands
                    }
                    onNavigateTab(activeStep.targetTab);
                  }}
                  className="rpg-button py-1.5 text-[9.5px] uppercase tracking-wider font-bold text-game-gold flex-1 flex items-center justify-center gap-1.5 shadow-md"
                >
                  {activeStep.buttonLabel} <ChevronRight className="h-3 w-3" />
                </button>

                <button
                  onClick={onSkipTutorial}
                  className="px-2 py-1.5 text-[8.5px] text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider"
                  title="Skip tutorial and explore freely"
                >
                  Skip
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
