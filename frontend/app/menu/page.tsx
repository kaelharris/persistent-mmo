'use client';

import React, { useEffect, useState } from 'react';
import MainMenu, { MainMenuPlayerProfile } from '../../components/game/menu/MainMenu';
import { useRouter } from 'next/navigation';

export default function StandaloneMainMenuPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<MainMenuPlayerProfile>({
    name: 'Kael the Wanderer',
    homeland: 'Qurtuba',
    alliance: 'qurtuba',
    rank: 'Soldier',
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('reignward_player_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.name) {
          setProfile({
            name: parsed.name,
            homeland: parsed.homeland || 'Qurtuba',
            alliance: parsed.alliance || 'qurtuba',
            rank: 'Soldier',
          });
        }
      }
    } catch {}
  }, []);

  return (
    <main className="relative min-h-screen bg-[#09111a]">
      <MainMenu
        playerProfile={profile}
        onClose={() => router.push('/world')}
      />
    </main>
  );
}

