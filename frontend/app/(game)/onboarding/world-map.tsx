'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
export default function OnboardingMapRedirect() {
  const r = useRouter();
  useEffect(() => { r.replace('/world'); }, [r]);
  return <div className="p-10 text-center font-serif text-sm">Unrolling the map…</div>;
}
