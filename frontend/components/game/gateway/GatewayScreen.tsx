'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { gameRepository } from '../../../services/repository/provider';
import CountryCrest from '../CountryCrest';
import HeraldicBanner, { getRealmMeta, resolveRealmKey } from '../HeraldicBanner';
import { REALMS } from '../map/reignwardHeraldryData';
import { PROVINCES } from '../../../lib/worldLore';
import { RotateCcw, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';

export type GatewayStep = 'welcome' | 'profile' | 'alliance' | 'loading' | 'signin' | 'signup';

interface GatewayScreenProps {
  initialStep?: GatewayStep;
  onComplete?: () => void;
  entryReturnToMenu?: boolean;
}

const CITIES = PROVINCES.map((p) => p.name);

export default function GatewayScreen({
  initialStep = 'welcome',
  onComplete,
  entryReturnToMenu = false,
}: GatewayScreenProps) {
  const { userId, startLocalPlayer } = useAuth();

  const normalizedInitialStep: GatewayStep =
    initialStep === 'signin' ? 'welcome' : initialStep === 'signup' ? 'profile' : initialStep;

  const [step, setStep] = useState<GatewayStep>(normalizedInitialStep);
  const [characterName, setCharacterName] = useState('');
  const [homeland, setHomeland] = useState('Qurtuba');
  const [selectedRealmKey, setSelectedRealmKey] = useState<string>('qurtuba');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [existingChar, setExistingChar] = useState<any | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  // Load existing character from local storage
  useEffect(() => {
    let active = true;
    const uid = userId || 'local_player';
    (gameRepository as any).getPlayerCharacter?.(uid).then((char: any) => {
      if (!active) return;
      if (char) {
        setExistingChar(char);
        if (char.name) setCharacterName(char.name);
        if (char.origin) setHomeland(char.origin);
        if (char.kingdom_id) setSelectedRealmKey(resolveRealmKey(char.kingdom_id));
      }
    }).catch(() => {});

    return () => {
      active = false;
    };
  }, [userId]);

  // Loading animation state
  const [loadingCaption, setLoadingCaption] = useState('Gathering the royal chronicles');
  const [loadingProgress, setLoadingProgress] = useState(18);

  const sceneArtMap: Record<string, string> = {
    welcome: '/assets/reignward-wide/atlas.webp',
    profile: '/assets/reignward-wide/character.webp',
    alliance: '/assets/reignward-wide/council.webp',
    loading: '/assets/reignward-wide/military.webp',
  };

  const currentArt = sceneArtMap[step] || sceneArtMap.welcome;

  // Run loading bar animation when entering loading step
  useEffect(() => {
    if (step !== 'loading') return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const steps = [
      { label: 'Gathering the royal chronicles', progress: 18, delay: reducedMotion ? 80 : 300 },
      { label: 'Raising your country banner', progress: 46, delay: reducedMotion ? 180 : 700 },
      { label: 'Preparing the Atlas', progress: 78, delay: reducedMotion ? 280 : 1200 },
      { label: 'The realm is ready', progress: 100, delay: reducedMotion ? 380 : 1700 },
    ];

    const timers = steps.map((s) =>
      setTimeout(() => {
        setLoadingCaption(s.label);
        setLoadingProgress(s.progress);
      }, s.delay)
    );

    const finishTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, reducedMotion ? 500 : 2100);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finishTimer);
    };
  }, [step, onComplete]);

  // Demo / guest play
  const handleDemoPlay = async () => {
    setIsBusy(true);
    setErrorMsg(null);
    setIsGuest(true);

    const guestName = 'Kael the Wanderer';
    const guestHomeland = 'Qurtuba';
    const guestRealm = 'qurtuba';

    setCharacterName(guestName);
    setHomeland(guestHomeland);
    setSelectedRealmKey(guestRealm);

    await startLocalPlayer?.(guestName);
    const uid = userId || 'local_player';

    await (gameRepository as any).savePlayerCharacter(uid, {
      name: guestName,
      epithet: 'the Wanderer',
      kingdom_id: 1,
      profession: 'farmer',
      origin: guestHomeland,
      motto: getRealmMeta(guestRealm).motto,
      banner_seed: 100,
    });

    await (gameRepository as any).completeOnboarding(uid);
    setIsBusy(false);
    setStep('loading');
  };

  // Resume existing character
  const handleResumeChronicle = async () => {
    setIsBusy(true);
    const uid = userId || 'local_player';
    await startLocalPlayer?.(existingChar?.name || characterName || 'Soldier');
    setIsBusy(false);
    setStep('loading');
  };

  // Reset local character
  const handleResetCharacter = async () => {
    if (typeof window !== 'undefined' && !window.confirm('Wipe this local character and begin afresh?')) {
      return;
    }
    setIsBusy(true);
    const uid = userId || 'local_player';
    await (gameRepository as any).resetPlayerCharacter?.(uid);
    setExistingChar(null);
    setCharacterName('');
    setHomeland('Qurtuba');
    setSelectedRealmKey('qurtuba');
    setIsBusy(false);
  };

  // Handle Profile Submit
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = characterName.trim();
    if (cleanName.length < 2) {
      setErrorMsg('Character name must be at least 2 characters.');
      return;
    }
    setErrorMsg(null);
    setStep('alliance');
  };

  // Handle Alliance Confirm
  const handleAllianceConfirm = async () => {
    if (!selectedRealmKey) return;
    setIsBusy(true);
    setErrorMsg(null);

    const cleanName = characterName.trim() || 'Kael the Bold';

    // Map realm key to kingdomId 1..10
    const realmIndex = REALMS.findIndex((r) => r[0] === selectedRealmKey);
    const kingdomId = realmIndex >= 0 ? realmIndex + 1 : 1;

    try {
      await startLocalPlayer?.(cleanName);
      const uid = userId || 'local_player';

      const saveRes = await (gameRepository as any).savePlayerCharacter(uid, {
        name: cleanName,
        epithet: 'the Bold',
        kingdom_id: kingdomId,
        profession: 'farmer',
        origin: homeland,
        motto: getRealmMeta(selectedRealmKey).motto,
        banner_seed: kingdomId * 100,
      });

      if (!saveRes.success) {
        setIsBusy(false);
        setErrorMsg(saveRes.error || 'Failed to save character.');
        return;
      }

      const doneRes = await (gameRepository as any).completeOnboarding(uid);
      if (!doneRes.success) {
        setIsBusy(false);
        setErrorMsg(doneRes.error || 'Failed to finalize allegiance.');
        return;
      }

      setIsBusy(false);
      setStep('loading');
    } catch (err: any) {
      setIsBusy(false);
      setErrorMsg(err.message || 'Error completing onboarding.');
    }
  };

  return (
    <div id="gateway" className="gateway" data-step={step}>
      <div className="gateway-backdrop">
        <img id="gateway-bg" src={currentArt} alt="Atmospheric scene" />
      </div>

      <header className="gate-top">
        <div className="gate-wordmark">
          REIGN<span>W</span>ARD
        </div>
        <div className="flex items-center gap-3">
          <div className="gate-top-note">A realm is forged by those who stand for it</div>
          <span className="px-2 py-0.5 text-[9px] font-mono tracking-wider bg-[#d8ae68]/15 border border-[#d8ae68]/30 text-[#d8ae68] rounded">
            LOCAL SANDBOX
          </span>
        </div>
      </header>

      <div className="gate-shell" id="gateway-screen">
        {step === 'welcome' && (
          <div className="gate-layout">
            <div
              className="gate-art"
              id="gateway-art"
              style={{
                backgroundImage: `linear-gradient(0deg, rgba(6,13,22,.96), rgba(6,13,22,.28) 65%), url("${currentArt}")`,
              }}
            >
              <span className="overline">CHRONICLE OF THE TEN REALMS</span>
              <h1>A world worth defending.</h1>
              <p>Ten banners. One fractured world. Your name will become part of its history.</p>
            </div>
            <div className="gate-panel">
              <div className="gate-step">THE FIRST OATH</div>
              <span className="gate-kicker">ENTER THE WORLD OF REIGNWARD</span>
              <h2>Your legend begins here.</h2>
              <p>Choose a country, swear your allegiance and rise from soldier to commander.</p>

              {existingChar && existingChar.onboarding_completed ? (
                <div className="space-y-3">
                  <div className="p-3.5 border border-[#d8ae68]/40 bg-[#121c27]/80 rounded flex items-center gap-3 mb-2">
                    <CountryCrest realmId={resolveRealmKey(existingChar.kingdom_id)} style={{ width: '40px', height: '40px' }} />
                    <div className="text-left leading-tight">
                      <div className="text-xs text-[#b6ae9b] uppercase tracking-wider">Returning Warrior</div>
                      <div className="text-sm font-serif font-bold text-[#f2e8d5]">{existingChar.name}</div>
                      <div className="text-[11px] text-[#d8ae68]">{getRealmMeta(existingChar.kingdom_id).name} · {existingChar.origin}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="gate-button"
                    onClick={handleResumeChronicle}
                    disabled={isBusy}
                  >
                    Resume Chronicle <span aria-hidden="true">✦</span>
                  </button>

                  <button
                    type="button"
                    className="gate-button secondary"
                    onClick={() => setStep('profile')}
                  >
                    Forge a New Character
                  </button>

                  <button
                    type="button"
                    className="gate-button textual text-[#e07d67] hover:text-[#ff9880]"
                    onClick={handleResetCharacter}
                    disabled={isBusy}
                  >
                    <RotateCcw className="h-3 w-3 inline mr-1" />
                    Reset Stored Character
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    className="gate-button"
                    onClick={() => setStep('profile')}
                  >
                    Begin Thy Journey <span aria-hidden="true">✦</span>
                  </button>

                  <button
                    type="button"
                    className="gate-button secondary"
                    onClick={handleDemoPlay}
                    disabled={isBusy}
                  >
                    Explore as Guest (Offline Preview)
                  </button>
                </div>
              )}

              <div className="gate-annotation mt-6">
                <strong>Living Atlas Edition</strong> · Playable medieval MMO vertical slice with persistent local simulation. No email or password required.
              </div>
            </div>
          </div>
        )}

        {step === 'profile' && (
          <div className="gate-layout">
            <div
              className="gate-art"
              style={{
                backgroundImage: `linear-gradient(0deg, rgba(6,13,22,.96), rgba(6,13,22,.28) 65%), url("${currentArt}")`,
              }}
            >
              <span className="overline">CHRONICLE OF THE TEN REALMS</span>
              <h1>Become part of the story.</h1>
              <p>You enter as a soldier. The title you earn afterward is yours to defend.</p>
            </div>
            <div className="gate-panel">
              <div className="gate-step">I · YOUR CHARACTER</div>
              <span className="gate-kicker">CHARACTER CREATION · 01 / 02</span>
              <h2>Forge your identity.</h2>
              <p>Your name and homeland will appear in your REIGNWARD profile and royal scrolls.</p>

              <form id="profile-form" onSubmit={handleProfileSubmit}>
                <label className="gate-field">
                  <span>Character name</span>
                  <input
                    name="name"
                    placeholder="e.g. Kael al-Rashid"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    minLength={2}
                    maxLength={28}
                    required
                    autoComplete="off"
                    autoFocus
                  />
                </label>

                <label className="gate-field">
                  <span>Homeland / Birthplace</span>
                  <select
                    name="homeland"
                    value={homeland}
                    onChange={(e) => setHomeland(e.target.value)}
                  >
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="gate-annotation">
                  <strong>Starting rank:</strong> Soldier &nbsp;·&nbsp;{' '}
                  <strong>Allegiance:</strong>{' '}
                  {selectedRealmKey ? getRealmMeta(selectedRealmKey).name : 'To be sworn next'}
                </div>

                {errorMsg && (
                  <div role="alert" className="gate-annotation" style={{ color: '#e07d67' }}>
                    {errorMsg}
                  </div>
                )}

                <button className="gate-button" type="submit">
                  {entryReturnToMenu ? 'Save profile' : 'Choose your allegiance'} →
                </button>
              </form>

              <button
                type="button"
                className="gate-button textual"
                onClick={() => setStep('welcome')}
              >
                ← Back to welcome
              </button>
            </div>
          </div>
        )}

        {step === 'alliance' && (
          <div className="realm-stage">
            <div className="realm-heading">
              <div className="gate-step">II · CHOOSE YOUR ALLEGIANCE</div>
              <span className="gate-kicker">TEN REALMS · ONE DESTINY · 02 / 02</span>
              <h2>To whom will you swear your oath?</h2>
              <p>
                The banner you choose becomes your country's identity. Each alliance has its own crest, colors, and heritage. Begin as a soldier; earn your place in its ranks.
              </p>
            </div>

            <div className="realm-grid">
              {REALMS.map(([id, name, motto], index) => {
                const isSelected = selectedRealmKey === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedRealmKey(id)}
                    className={`realm-card ${isSelected ? 'selected' : ''}`}
                    data-realm={id}
                    aria-pressed={isSelected}
                  >
                    <span className="realm-index">{String(index + 1).padStart(2, '0')}</span>
                    <span className="realm-fallback">{name[0]}</span>
                    <CountryCrest realmId={id} style={{ height: '78px', margin: '14px auto 8px' }} />
                    <span>
                      <strong style={{ display: 'block', color: '#f2e8d5', fontSize: '13px' }}>{name}</strong>
                      <small style={{ color: '#b6ae9b', fontSize: '10px' }}>{motto}</small>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="realm-actions">
              <p id="realm-choice" aria-live="polite">
                <strong>Selected: {getRealmMeta(selectedRealmKey).name}</strong>
                <br />
                <span className="text-xs text-[#b6ae9b]">
                  {getRealmMeta(selectedRealmKey).motto} — You will raise standard in the capital.
                </span>
              </p>

              <button
                type="button"
                className="gate-button"
                id="confirm-alliance"
                onClick={handleAllianceConfirm}
                disabled={!selectedRealmKey || isBusy}
              >
                {isBusy ? 'Recording oath…' : 'Swear allegiance →'}
              </button>
            </div>

            <div className="mt-4">
              <button
                type="button"
                className="gate-button textual"
                style={{ width: 'auto' }}
                onClick={() => setStep('profile')}
              >
                ← Back to character
              </button>
            </div>
          </div>
        )}

        {step === 'loading' && (
          <div className="loading-content" role="status" aria-live="polite">
            <CountryCrest realmId={selectedRealmKey} className="loading-crest" />
            <span className="gate-kicker">YOUR BANNER HAS BEEN RAISED</span>
            <h2>Preparing your realm.</h2>
            <p>The atlas awaits your first command.</p>

            <div className="loading-track">
              <div
                className="loading-fill"
                id="loading-fill"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>

            <div className="loading-caption" id="loading-caption">
              {loadingCaption}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
