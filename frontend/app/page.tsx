'use client';

import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';

export default function LandingPage() {
  const { userId, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (userId) {
        router.replace('/world');
      } else {
        router.replace('/login');
      }
    }
  }, [userId, loading, router]);

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-zinc-950 text-zinc-100 gap-6 overflow-hidden">
      {/* Background Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.85)_100%)] pointer-events-none z-0" />
      
      {/* Loading Terminal Indicator */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-2 border-game-gold border-r-2 border-r-game-gold/30 animate-spin" />
          <Shield className="h-6 w-6 text-game-gold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse filter drop-shadow-[0_0_8px_rgba(229,193,88,0.4)]" />
        </div>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h3 className="text-xs font-bold font-display text-game-gold tracking-widest uppercase">Connecting to Aegis...</h3>
          <p className="text-[9px] text-zinc-600 font-serif animate-pulse">Establishing secure realm gateway</p>
        </div>
      </div>
    </div>
  );
}
