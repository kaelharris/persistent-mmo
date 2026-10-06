'use client';

import React from 'react';
import { Award, Sparkles, Check, ArrowRight, ShieldCheck, Coins, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface TutorialCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TutorialCelebrationModal({ isOpen, onClose }: TutorialCelebrationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in pointer-events-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md rpg-panel-wood p-6 shadow-2xl border-2 border-game-gold flex flex-col items-center text-center gap-4 text-zinc-100"
      >
        {/* Ornate corner rivets */}
        <div className="rpg-rivet top-1.5 left-1.5" />
        <div className="rpg-rivet top-1.5 right-1.5" />
        <div className="rpg-rivet bottom-1.5 left-1.5" />
        <div className="rpg-rivet bottom-1.5 right-1.5" />

        <div className="h-16 w-16 rounded-full bg-amber-500/10 border-2 border-game-gold flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)]">
          <Award className="h-9 w-9 text-game-gold animate-bounce" />
        </div>

        <div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-400">
            Commission Granted
          </span>
          <h2 className="text-xl font-bold font-display text-game-gold uppercase tracking-wider mt-0.5">
            Arch-Commander Commission
          </h2>
          <p className="text-xs text-zinc-400 font-serif mt-2 leading-relaxed max-w-sm">
            You have mastered the foundational laws of Aegis Kingdoms: energy replenishment, territorial movement, resource harvesting, economic refinement, and military conquest.
          </p>
        </div>

        {/* Rewards Summary Grid */}
        <div className="w-full bg-zinc-950/80 border border-zinc-900 rounded p-3 grid grid-cols-3 gap-2 text-center text-xs font-serif">
          <div className="flex flex-col items-center p-1.5 border border-zinc-900 bg-zinc-900/40 rounded">
            <Coins className="h-4 w-4 text-amber-400 mb-1" />
            <span className="text-[9px] text-zinc-500">Gold Bounty</span>
            <span className="font-bold text-amber-300">+250.00</span>
          </div>

          <div className="flex flex-col items-center p-1.5 border border-zinc-900 bg-zinc-900/40 rounded">
            <Flame className="h-4 w-4 text-emerald-400 mb-1" />
            <span className="text-[9px] text-zinc-500">Exp Earned</span>
            <span className="font-bold text-emerald-300">+350 XP</span>
          </div>

          <div className="flex flex-col items-center p-1.5 border border-zinc-900 bg-zinc-900/40 rounded">
            <ShieldCheck className="h-4 w-4 text-blue-400 mb-1" />
            <span className="text-[9px] text-zinc-500">Rank Granted</span>
            <span className="font-bold text-blue-300">Level 2</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rpg-button py-2.5 px-6 text-xs uppercase tracking-widest font-bold text-game-gold w-full mt-2 flex items-center justify-center gap-2 shadow-lg"
        >
          Enter the Sovereign Realm <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    </div>
  );
}
