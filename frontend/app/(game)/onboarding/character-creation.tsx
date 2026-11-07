'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
export default function OnboardingCharacterRedirect() {
  const r = useRouter();
  useEffect(() => { r.replace('/onboarding'); }, [r]);
  return <div className="p-10 text-center font-serif text-sm">Seeking the scribe…</div>;
}
