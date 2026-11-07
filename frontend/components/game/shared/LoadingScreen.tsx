'use client';

import React from 'react';
import CountryCrest from '../CountryCrest';

interface LoadingScreenProps {
  realmId?: string | number | null;
  caption?: string;
  progress?: number;
  title?: string;
  subtitle?: string;
}

export default function LoadingScreen({
  realmId = 'qurtuba',
  caption = 'Gathering the royal chronicles',
  progress = 46,
  title = 'YOUR BANNER HAS BEEN RAISED',
  subtitle = 'Preparing your realm.',
}: LoadingScreenProps) {
  return (
    <div className="loading-content" role="status" aria-live="polite">
      <CountryCrest realmId={realmId} className="loading-crest" />
      <span className="gate-kicker">{title}</span>
      <h2>{subtitle}</h2>
      <p>The atlas awaits your first command.</p>

      <div className="loading-track">
        <div
          className="loading-fill"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>

      <div className="loading-caption">{caption}</div>
    </div>
  );
}

