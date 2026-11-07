'use client';

import React from 'react';
import CountryCrest from '../CountryCrest';
import { getRealmMeta } from '../HeraldicBanner';

interface CharacterCardProps {
  name: string;
  rank?: string;
  homeland: string;
  alliance: string | number;
  className?: string;
}

export default function CharacterCard({
  name,
  rank = 'Soldier',
  homeland,
  alliance,
  className = '',
}: CharacterCardProps) {
  const realm = getRealmMeta(alliance);

  return (
    <div className={`menu-ledger-card ${className}`}>
      <img
        src="/assets/reignward-wide/character.webp"
        alt="Player character"
        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '1px' }}
      />
      <div>
        <strong className="block text-[#f2e8d5] text-sm">{name}</strong>
        <small className="block text-[#b6ae9b] text-xs">
          {rank} · {homeland}
        </small>
        <span className="text-[10px] text-[#d8ae68] flex items-center gap-1 mt-0.5">
          <CountryCrest realmId={alliance} style={{ width: '12px', height: '12px', display: 'inline-block' }} />
          {realm.name}
        </span>
      </div>
    </div>
  );
}

