'use client';

import React from 'react';
import { getCrestUrl, getRealmMeta } from './HeraldicBanner';

interface CountryCrestProps {
  realmId?: string | number | null;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}

export default function CountryCrest({ realmId, className, style, alt }: CountryCrestProps) {
  const meta = getRealmMeta(realmId);
  const src = getCrestUrl(realmId);

  return (
    <img
      src={src}
      alt={alt || `${meta.name} Crest`}
      className={className}
      style={{ display: 'block', maxWidth: '100%', height: 'auto', ...style }}
      loading="lazy"
    />
  );
}

