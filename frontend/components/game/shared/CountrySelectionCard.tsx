'use client';

import React from 'react';
import CountryCrest from '../CountryCrest';

interface CountrySelectionCardProps {
  id: string;
  index: number;
  name: string;
  motto: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function CountrySelectionCard({
  id,
  index,
  name,
  motto,
  isSelected,
  onSelect,
}: CountrySelectionCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
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
}

