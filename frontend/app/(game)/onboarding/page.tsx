'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameContext } from '../layout';
import { REALMS, PROFESSIONS, bannerColors } from '../../../lib/worldLore';
import { ChevronRight, Shield, User, Crown, Hammer } from 'lucide-react';

const STEPS = ['Welcome', 'Character', 'Kingdom', 'Profession', 'Enter World'] as const;

export default function OnboardingWizard() {
  const { savePlayerCharacter, completeOnboarding, profile, countries, refreshData } = useGameContext();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile?.username || '');
  const [epithet, setEpithet] = useState('the Bold');
  const [kingdomId, setKingdomId] = useState(1);
  const [profession, setProfession] = useState<string>('farmer');
  const [origin, setOrigin] = useState('Born beneath the Capital walls');
  const [motto, setMotto] = useState('By hearth and sword');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async (): Promise<boolean> => {
    setBusy(true); setError(null);
    const res = await savePlayerCharacter({ name: name.trim(), epithet, kingdom_id: kingdomId, profession: profession as any, origin, motto, banner_seed: Math.floor(Math.random() * 1000) });
    setBusy(false);
    if (!res.success) { setError(res.error || 'Could not save character.'); return false; }
    return true;
  };

  const finish = async () => {
    if (!(await save())) return;
    const done = await completeOnboarding();
    if (!done.success) { setError(done.error || 'Onboarding failed.'); return; }
    await refreshData();
    router.push('/world');
  };

  const next = async () => {
    if (step === 1 && name.trim().length < 2) { setError('Give thyself a name of at least two letters.'); return; }
    if (step < 3) { setStep(step + 1); return; }
    await finish();
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-10 flex items-center justify-center">
      <div className="w-full max-w-3xl rpg-panel-parchment p-6 md:p-10 relative">
        <p className="text-center text-[10px] tracking-[0.35em] uppercase opacity-60">Aegis Kingdoms — Al-Andalus, 1031 CE</p>
        <div className="flex justify-center gap-2 my-6 flex-wrap">
          {STEPS.map((s, i) => (
            <span key={s} className={`px-3 py-1 text-[10px] uppercase tracking-widest border ${i === step ? 'bg-zinc-900 text-game-gold border-zinc-900' : i < step ? 'border-zinc-500' : 'border-zinc-300 opacity-50'}`}>{i + 1}. {s}</span>
          ))}
        </div>
        {error && <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 text-xs">{error}</div>}

        {step === 0 && (
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-display">Welcome to Aegis</h1>
            <p className="font-serif leading-relaxed">Three realms. Ten provinces. One chronicled world. Gather grain, raise steel, and make thy name remembered by the bards.</p>
            <RevealHint />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-display flex items-center gap-2"><User className="h-5 w-5" /> Thy Character</h2>
            <label className="block text-xs uppercase tracking-widest">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ser Aldric" className="rpg-input w-full px-3 py-3" />
            <label className="block text-xs uppercase tracking-widest">Epithet</label>
            <input value={epithet} onChange={(e) => setEpithet(e.target.value)} placeholder="the Bold" className="rpg-input w-full px-3 py-3" />
            <label className="block text-xs uppercase tracking-widest">Origin</label>
            <input value={origin} onChange={(e) => setOrigin(e.target.value)} className="rpg-input w-full px-3 py-3" />
            <label className="block text-xs uppercase tracking-widest">Motto</label>
            <input value={motto} onChange={(e) => setMotto(e.target.value)} className="rpg-input w-full px-3 py-3" />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-display flex items-center gap-2"><Crown className="h-5 w-5" /> Swear to a Realm</h2>
            {(countries?.length ? countries : REALMS).map((c: any) => {
              const realm = REALMS.find((r) => r.id === c.id);
              const active = kingdomId === c.id;
              return (
                <button key={c.id} onClick={() => setKingdomId(c.id)} className={`w-full text-left p-4 border-2 ${active ? 'border-zinc-900 bg-white/60' : 'border-zinc-400'}`}>
                  <div className="flex items-center gap-3"><span className="h-4 w-4 rounded-full border border-zinc-800" style={{ background: realm?.color || '#b89030' }} />
                    <span className="font-display text-lg">{c.name}</span><span className="text-xs italic font-serif">{realm?.motto}</span></div>
                  <p className="font-serif text-sm mt-1">{realm?.description}</p>
                </button>
              );
            })}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-display flex items-center gap-2"><Hammer className="h-5 w-5" /> Choose Thy Craft</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {PROFESSIONS.map((p) => (
                <button key={p.id} onClick={() => setProfession(p.id)} className={`p-4 border-2 text-left ${profession === p.id ? 'border-zinc-900 bg-white/60' : 'border-zinc-400'}`}>
                  <div className="font-display">{p.name}</div>
                  <div className="font-serif text-sm italic">{p.tagline}</div>
                  <div className="text-[10px] uppercase tracking-widest mt-1">{p.bonus} · {p.start}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-display">Thy Chronicle Begins</h2>
            <p className="font-serif">{name} {epithet}, sworn to {(REALMS.find((r) => r.id === kingdomId)?.name)} as a {PROFESSIONS.find((p) => p.id === profession)?.name}. Motto: “{motto}”.</p>
            <div className="mx-auto w-24 h-32 border-4 border-zinc-800 flex items-center justify-center" style={{ background: bannerColors(kingdomId).field }}>
              <Shield className="text-game-gold" />
            </div>
            <p className="text-xs font-serif">You begin with 5 iron, 5 fish, 10 wood, 10 stone, 10 grain, 10 water and 10 coal in Genesis Capital.</p>
          </div>
        )}

        <div className="mt-8 flex gap-3">
          {step > 0 && <button onClick={() => setStep(step - 1)} className="rpg-button px-5 py-3 text-xs">Back</button>}
          <button disabled={busy} onClick={next} className="rpg-button rpg-button-emerald flex-1 py-3 text-xs flex items-center justify-center gap-2">
            {busy ? 'Writing thy name…' : step === 4 ? 'Enter the World' : 'Continue'} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <p className="text-center text-[10px] mt-3 opacity-60">Save now, then return — thy character persists between visits.</p>
      </div>
    </div>
  );
}

function RevealHint() {
  return <p className="text-xs font-serif italic opacity-70">Tip: start on the parchment. Everything you do here writes the first page.</p>;
}
