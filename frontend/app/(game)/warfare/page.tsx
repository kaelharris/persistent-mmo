'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function WarfareRedirect() {
  const r = useRouter();
  useEffect(() => { r.replace('/military'); }, [r]);
  return <div className="p-10 text-center font-serif text-sm">Mustering to the Military…</div>;
}
