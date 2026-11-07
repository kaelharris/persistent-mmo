'use client';

/**
 * Realm heraldry for the Gilded Ruin world atlas.
 *
 * These are deliberately small, hand-built SVG achievements rather than images so
 * ownership changes can swap a flag without loading or recolouring any raster art.
 * The same art is used inside the map SVG, the hover card and the province ledger.
 */

export type RealmFlagSpec = {
  field: string;
  metal: string;
  charge: 'crescent' | 'tower' | 'pomegranate' | 'lozenge';
  name: string;
};

export const REALM_FLAGS: Record<number, RealmFlagSpec> = {
  1: { field: '#17344e', metal: '#d8ae68', charge: 'crescent', name: 'Taifa of Qurtuba' },
  2: { field: '#71322f', metal: '#e0bd7b', charge: 'tower', name: 'Taifa of Ishbiliya' },
  3: { field: '#37533b', metal: '#d8ae68', charge: 'pomegranate', name: 'Taifa of Gharnata' },
  4: { field: '#3b2f28', metal: '#d8ae68', charge: 'tower', name: 'Taifa of Tulaytula' },
  5: { field: '#23384e', metal: '#d8ae68', charge: 'lozenge', name: 'Taifa of Saragusta' },
  6: { field: '#4e3b23', metal: '#d8ae68', charge: 'pomegranate', name: 'Taifa of Balansiya' },
  7: { field: '#4e2338', metal: '#e0bd7b', charge: 'tower', name: 'Taifa of Almiriya' },
  8: { field: '#3d1f42', metal: '#d8ae68', charge: 'tower', name: 'Kingdom of León' },
  9: { field: '#1f3d38', metal: '#d8ae68', charge: 'lozenge', name: 'Kingdom of Navarre' },
  10: { field: '#4a1f1f', metal: '#e0bd7b', charge: 'lozenge', name: 'County of Barcelona' },
};

export function realmFlagFor(countryId?: number | null): RealmFlagSpec {
  return (countryId && REALM_FLAGS[countryId]) || {
    field: '#263744',
    metal: '#b6ae9b',
    charge: 'lozenge',
    name: 'Unsworn march',
  };
}

function Charge({ spec }: { spec: RealmFlagSpec }) {
  const { metal, charge } = spec;
  if (charge === 'crescent') {
    return (
      <g fill={metal}>
        <path d="M21.2 4.9a6.6 6.6 0 1 0 0 12.2 5.2 5.2 0 1 1 0-12.2Z" />
        <path d="m25.6 5.2.7 1.55 1.7.18-1.28 1.16.34 1.67-1.46-.86-1.46.86.34-1.67-1.28-1.16 1.7-.18Z" />
      </g>
    );
  }
  if (charge === 'tower') {
    return (
      <g fill={metal}>
        <path d="M10.6 7.2h2.2v1.5h2v-1.5h2.4v1.5h2v-1.5h2.2V18H10.6Z" />
        <path d="M15.2 11.2h3.2v6.8h-3.2Z" fill={spec.field} opacity="0.85" />
        <path d="M9.4 17.4h14.8v1.4H9.4Z" />
      </g>
    );
  }
  if (charge === 'pomegranate') {
    return (
      <g fill={metal}>
        <circle cx="17" cy="12.8" r="5.2" />
        <path d="m17 4.4 1.1 2.1 2.2-.5-1.2 2 1.7 1.4-2.4.2-.3 2.3-1.9-1.4-1.9 1.4-.3-2.3-2.4-.2 1.7-1.4-1.2-2 2.2.5Z" />
        <path d="M22.3 8.1c1.3-1.2 2.6-1.5 3.7-1.2-.5 1.2-1.5 2-3 2.3Z" />
      </g>
    );
  }
  return (
    <g fill={metal}>
      <path d="m17 4.6 7 6.4-7 6.4-7-6.4Z" />
      <path d="m17 8.2 3.8 2.8-3.8 2.8-3.8-2.8Z" fill={spec.field} opacity="0.7" />
    </g>
  );
}

/** Flag artwork as a <g> element; safe to nest inside the atlas SVG. */
export function RealmFlagArt({ realmId, x = 0, y = 0, scale = 1, opacity = 1 }: {
  realmId?: number | null;
  x?: number;
  y?: number;
  scale?: number;
  opacity?: number;
}) {
  const spec = realmFlagFor(realmId);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity} aria-hidden="true">
      <rect x="0" y="0" width="34" height="22" rx="1.2" fill={spec.field} />
      <rect x="0.7" y="0.7" width="32.6" height="20.6" rx="0.7" fill="none" stroke={spec.metal} strokeWidth="1.05" />
      <path d="M3.2 0v22" stroke={spec.metal} strokeWidth="1.4" opacity="0.9" />
      <Charge spec={spec} />
      <path d="M0 22h34" stroke="#0a1019" strokeOpacity="0.5" strokeWidth="1" />
    </g>
  );
}

/** Standalone flag for cards, tooltips and legends. */
export function RealmFlag({ realmId, className, title }: {
  realmId?: number | null;
  className?: string;
  title?: string;
}) {
  const spec = realmFlagFor(realmId);
  return (
    <svg viewBox="0 0 34 22" className={className} role={title ? 'img' : undefined} aria-label={title || undefined} aria-hidden={title ? undefined : true}>
      <RealmFlagArt realmId={realmId} />
      {title ? <title>{title || spec.name}</title> : null}
    </svg>
  );
}
