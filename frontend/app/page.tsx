'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { gameRepository } from '../services/repository/provider';
import GatewayScreen from '../components/game/gateway/GatewayScreen';

export default function LandingPage() {
  const { userId, loading } = useAuth();
  const router = useRouter();
  const [checkingChar, setCheckingChar] = useState(true);
  const [hasCompletedChar, setHasCompletedChar] = useState(false);

  useEffect(() => {
    let active = true;
    if (!loading) {
      const uid = userId || 'local_player';
      (gameRepository as any).getPlayerCharacter?.(uid).then((char: any) => {
        if (!active) return;
        setHasCompletedChar(!!(char && char.onboarding_completed));
        setCheckingChar(false);
      }).catch(() => {
        if (active) setCheckingChar(false);
      });
    }
    return () => {
      active = false;
    };
  }, [userId, loading]);

  if (loading || checkingChar) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-6 bg-[#0A1019] text-[#F2E8D5]">
        <div className="h-16 w-16 rounded-full border-t-2 border-[#D8AE68] animate-spin" />
        <p className="font-display text-sm tracking-widest text-[#D8AE68]">Entering REIGNWARD…</p>
      </div>
    );
  }

  return (
    <GatewayScreen
      initialStep="welcome"
      onComplete={() => router.push('/world')}
    />
  );
}
