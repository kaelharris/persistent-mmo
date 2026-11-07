'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAnimatedBannerUrl, getCrestUrl, getRealmMeta } from '../HeraldicBanner';

export interface MainMenuPlayerProfile {
  name: string;
  homeland: string;
  alliance: string | number;
  rank?: string;
}

interface MainMenuProps {
  playerProfile: MainMenuPlayerProfile;
  onClose?: () => void;
  onNavigateToAlliance?: () => void;
  onNavigateToProfile?: () => void;
  onSignOut?: () => void;
  onResetCharacter?: () => void;
}

export default function MainMenu({
  playerProfile,
  onClose,
  onNavigateToAlliance,
  onNavigateToProfile,
  onSignOut,
  onResetCharacter,
}: MainMenuProps) {
  const router = useRouter();
  const mainMenuRef = useRef<HTMLElement>(null);

  const realm = getRealmMeta(playerProfile.alliance);
  const [bannerUrl, setBannerUrl] = useState(() => getAnimatedBannerUrl(playerProfile.alliance));
  const crestUrl = getCrestUrl(playerProfile.alliance);

  // Sync bannerUrl on mount and preference changes
  useEffect(() => {
    setBannerUrl(getAnimatedBannerUrl(playerProfile.alliance));
  }, [playerProfile.alliance]);

  // Focus primary button on mount matching prototype showMainMenu()
  useEffect(() => {
    mainMenuRef.current?.querySelector<HTMLButtonElement>('[data-menu="atlas"]')?.focus({ preventScroll: true });
  }, []);

  // Keyboard navigation matching prototype: ArrowUp / ArrowDown moves focus across buttons; Enter clicks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!mainMenuRef.current || !['ArrowUp', 'ArrowDown', 'Escape'].includes(e.key)) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        if (onClose) onClose();
        return;
      }

      const options = Array.from(mainMenuRef.current.querySelectorAll<HTMLButtonElement>('[data-menu]'));
      if (!options.length) return;

      e.preventDefault();
      const cur = options.indexOf(document.activeElement as HTMLButtonElement);
      const next = e.key === 'ArrowDown'
        ? (cur + 1) % options.length
        : (cur - 1 + options.length) % options.length;
      options[next < 0 ? 0 : next]?.focus();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleAction = (action: string) => {
    if (action === 'atlas') {
      if (onClose) onClose();
      router.push('/world');
    } else if (action === 'military') {
      if (onClose) onClose();
      router.push('/military');
    } else if (action === 'economy') {
      if (onClose) onClose();
      router.push('/economy');
    } else if (action === 'profile') {
      if (onNavigateToProfile) onNavigateToProfile();
      else {
        if (onClose) onClose();
        router.push('/character');
      }
    } else if (action === 'alliance') {
      if (onNavigateToAlliance) onNavigateToAlliance();
      else {
        if (onClose) onClose();
        router.push('/kingdom');
      }
    }
  };

  return (
    <section
      id="main-menu"
      ref={mainMenuRef}
      className="main-menu"
      role="dialog"
      aria-modal="true"
      aria-label="REIGNWARD main game menu"
    >
      <div className="menu-backdrop">
        <img id="menu-bg" src="/assets/reignward-wide/military.webp" alt="" />
      </div>
      <header className="gate-top">
        <div className="gate-wordmark">✦ &nbsp; THE TEN REALMS</div>
        <div className="gate-top-note">AL-ANDALUS &nbsp; | &nbsp; ANNO 1031</div>
      </header>
      <div id="main-menu-content" className="main-menu-inner">
        <section className="menu-left">
          <div className="menu-masthead">
            <span className="mini-seal">✦</span> CHAPTER I &nbsp; | &nbsp; THE FRACTURED KINGDOMS
          </div>
          <h1 className="main-menu-title">REIGNWARD</h1>
          <p className="main-menu-lead">
            Ten kingdoms at the edge of a new age. Your oath shapes the story.
          </p>
          <nav className="menu-buttons" aria-label="Game menu">
            <button
              type="button"
              className="menu-option primary"
              data-menu="atlas"
              onClick={() => handleAction('atlas')}
            >
              <span className="menu-number">I</span>
              <span className="menu-label">
                <strong>Enter the Atlas</strong>
                <small>Explore provinces and govern your lands</small>
              </span>
              <span className="menu-chip">WORLD</span>
              <span className="menu-arrow">›</span>
            </button>

            <button
              type="button"
              className="menu-option"
              data-menu="military"
              onClick={() => handleAction('military')}
            >
              <span className="menu-number">II</span>
              <span className="menu-label">
                <strong>War Chamber</strong>
                <small>Raise your banners and command the army</small>
              </span>
              <span className="menu-chip">ARMY</span>
              <span className="menu-arrow">›</span>
            </button>

            <button
              type="button"
              className="menu-option"
              data-menu="economy"
              onClick={() => handleAction('economy')}
            >
              <span className="menu-number">III</span>
              <span className="menu-label">
                <strong>Royal Estate</strong>
                <small>Harvest, craft and sustain the realm</small>
              </span>
              <span className="menu-chip">ESTATE</span>
              <span className="menu-arrow">›</span>
            </button>

            <button
              type="button"
              className="menu-option"
              data-menu="profile"
              onClick={() => handleAction('profile')}
            >
              <span className="menu-number">IV</span>
              <span className="menu-label">
                <strong>Your Chronicle</strong>
                <small>Review your soldier and edit your profile</small>
              </span>
              <span className="menu-chip">WARDEN</span>
              <span className="menu-arrow">›</span>
            </button>

            <button
              type="button"
              className="menu-option"
              data-menu="alliance"
              onClick={() => handleAction('alliance')}
            >
              <span className="menu-number">V</span>
              <span className="menu-label">
                <strong>Allegiance</strong>
                <small>View the ten countries and their banners</small>
              </span>
              <span className="menu-chip">REALMS</span>
              <span className="menu-arrow">›</span>
            </button>
          </nav>
          <div className="menu-shortcuts">
            <span><kbd>↑</kbd><kbd>↓</kbd>Navigate</span>
            <span><kbd>Enter</kbd>Confirm</span>
          </div>
          <p className="menu-footnote">
            Playable preview · Your banner and profile are saved locally. The world map still uses the Qurtuba demonstration state.
          </p>
        </section>

        <aside className="menu-right">
          <div className="menu-standard">
            <img src={bannerUrl} alt={`${realm.name} war banner`} />
          </div>
          <h2 className="menu-campaign">THE FRACTURED KINGDOMS</h2>
          <p className="menu-campaign-sub">
            {realm.motto} · Your standard in an age of rival courts
          </p>
          <div className="menu-ledger">
            <div className="menu-ledger-card">
              <img src="/assets/reignward-wide/character.webp" alt="" />
              <div>
                <strong>{playerProfile.name}</strong>
                <small>Soldier · {playerProfile.homeland}</small>
              </div>
            </div>
            <div className="menu-ledger-card">
              <img src={crestUrl} alt="" />
              <div>
                <strong>{realm.name}</strong>
                <small>Sworn allegiance</small>
              </div>
            </div>
          </div>
          <p className="menu-detail">✧ &nbsp; Every realm remembers those who served its banner.</p>
        </aside>
      </div>
    </section>
  );
}
