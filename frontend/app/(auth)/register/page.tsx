'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import GatewayScreen from '../../../components/game/gateway/GatewayScreen';

export default function RegisterPage() {
  const { userId, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userId) {
      router.replace('/world');
    }
  }, [userId, loading, router]);

  return (
    <div className="relative min-h-screen w-full">
      <GatewayScreen initialStep="profile" onComplete={() => router.push('/world')} />
    </div>
  );
}
