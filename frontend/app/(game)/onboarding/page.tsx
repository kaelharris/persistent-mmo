'use client';

import { useRouter } from 'next/navigation';
import { useGameContext } from '../layout';
import GatewayScreen from '../../../components/game/gateway/GatewayScreen';

export default function OnboardingPage() {
  const { playerCharacter } = useGameContext();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0A1019]">
      <GatewayScreen
        initialStep={playerCharacter?.name ? 'alliance' : 'profile'}
        onComplete={() => router.push('/world')}
      />
    </div>
  );
}
