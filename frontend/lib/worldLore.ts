export type MapLayer = 'political' | 'geography' | 'economy' | 'warfare';

/*
  AEGIS KINGDOM — WORLD SPECIFICATION
  Starting date: 1031 CE.
  Rationale: Abu al-Qasim Muhammad ibn Abbad proclaimed the Taifa of Ishbiliya after the
  collapse of the Caliphate of Qurtuba (abolished 1031 after the Fitna of al-Andalus,
  1009–1031). 1031 gives three rival Taifa leagues — Qurtuba (central), Ishbiliya
  (west/Saragusta claim), Gharnata (east) — without anachronistic Almoravid (1086+)
  or Reconquista (13th c.) borders. Alternate history may diverge from here.
  Geography: Iberian Peninsula + western Mediterranean, lon −9.5..3.5, lat 36..44.5.
*/

export interface RealmLore {
  id: number;
  name: string;
  motto: string;
  color: string;
  description: string;
  capital: string;
}

export interface ProvinceLore {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  terrain: string;
  resources: string[];
  x: number; // 0-100 over lon -9.5..3.5
  y: number; // 0-100 over lat 44.5..36 (0 = north)
  lon: number;
  lat: number;
  icon: 'castle' | 'forest' | 'mine' | 'harbor' | 'village' | 'ruins' | 'fields' | 'keep' | 'tavern' | 'city';
}

export const REALMS: RealmLore[] = [
  { id: 1, name: 'Taifa of Qurtuba', motto: 'Law endures', color: '#b89030', description: 'The old caliphal capital and the Guadiana marches. Stone roads, charter towns, and the council that binds the centre.', capital: 'Qurtuba' },
  { id: 2, name: 'Taifa of Ishbiliya', motto: 'By forge and oath', color: '#8a3b2e', description: 'The Abbadid west — river port, Strait watch, and the northern claim to Saragusta. Their steel is honest, their winters are not.', capital: 'Ishbiliya' },
  { id: 3, name: 'Taifa of Gharnata', motto: 'The harvest guides us', color: '#5f7a3a', description: 'The Zirid east — vega gardens, Sierra Nevada silver, and the Mediterranean road to Balansiya.', capital: 'Gharnata' },
];

export const PROVINCES: ProvinceLore[] = [
  { id: 1, name: 'Qurtuba', subtitle: 'Caliphal capital', description: 'Seat of the High Council. Granite halls and the Great Mosque dominate a Roman bridge over the Guadalquivir.', terrain: 'Guadalquivir valley', resources: ['Grain', 'Water', 'Stone'], lon: -4.78, lat: 37.88, x: 36.4, y: 77.9, icon: 'castle' },
  { id: 2, name: 'Jayyan', subtitle: 'Sierra Morena march', description: 'Olive hills and oak forest on the northern frontier. Charcoal burners and carvers work beneath a green canopy.', terrain: 'Sierra Morena foothills / forest', resources: ['Wood', 'Grain', 'Water'], lon: -3.78, lat: 37.77, x: 44.0, y: 79.2, icon: 'forest' },
  { id: 3, name: 'Tulaytula', subtitle: 'Tagus frontier', description: 'A walled hill city on the Tagus. Masons sell utraque stone to every lord in the frontier.', terrain: 'Meseta / Tagus gorge', resources: ['Stone', 'Copper', 'Coal'], lon: -4.02, lat: 39.86, x: 42.1, y: 54.6, icon: 'mine' },
  { id: 4, name: 'Qadiz', subtitle: 'Strait watch', description: 'Fortress port on the Straits. Fishing fleets mend nets while merchants watch the tide.', terrain: 'Straits coast / islands', resources: ['Fish', 'Water'], lon: -6.28, lat: 36.52, x: 24.5, y: 93.6, icon: 'harbor' },
  { id: 5, name: 'Saragusta', subtitle: 'Ebro fortress-city', description: 'Fortress on the Ebro claiming the northern march. Iron is priced by war.', terrain: 'Ebro valley / meseta edge', resources: ['Iron Ore', 'Coal'], lon: -0.89, lat: 41.65, x: 66.2, y: 33.5, icon: 'keep' },
  { id: 6, name: 'Ishbiliya', subtitle: 'Abbadid capital', description: 'The Guadalquivir port. Red sands where ore boats ground. Smell of forge-smoke on every wind.', terrain: 'Guadalquivir plain / coast', resources: ['Fish', 'Stone'], lon: -5.99, lat: 37.39, x: 27.0, y: 83.6, icon: 'harbor' },
  { id: 7, name: 'Sierra Nevada', subtitle: 'Snow-capped sierra', description: 'High crags that bleed copper and snowmelt water. Only the stubborn settle here.', terrain: 'Sierra Nevada (mountain)', resources: ['Copper', 'Iron Ore', 'Stone'], lon: -3.5, lat: 37.1, x: 46.2, y: 86.8, icon: 'ruins' },
  { id: 8, name: 'Gharnata', subtitle: 'Vega capital', description: 'Golden vega gardens that feed three taifas. Bread is law here.', terrain: 'Vega / Genil valley', resources: ['Grain', 'Cotton', 'Water'], lon: -3.61, lat: 37.17, x: 45.3, y: 85.9, icon: 'fields' },
  { id: 9, name: 'Almiriya', subtitle: 'Mediterranean road', description: 'Dry port and alum road. Carters cross at dawn and dusk.', terrain: 'Arid coast', resources: ['Oil', 'Coal'], lon: -2.46, lat: 36.84, x: 54.1, y: 89.8, icon: 'ruins' },
  { id: 10, name: 'Balansiya', subtitle: 'Turia orchards', description: 'Orchard huerta on the Turia. Herbalists and silk weavers trade salves and cloth.', terrain: 'Turia huerta / forest edge', resources: ['Wood', 'Fish', 'Cotton'], lon: -0.38, lat: 39.47, x: 70.2, y: 59.2, icon: 'forest' },
];

export const PROVINCE_MAP: Record<number, ProvinceLore> = Object.fromEntries(PROVINCES.map((p) => [p.id, p]));

// Hand-tiled province territories over lon/lat — organic polygons following coast/rivers (approx Voronoi)
export const TERRITORIES: Record<number, [number, number][]> = {
  1: [[-5.6, 37.35], [-4.9, 37.05], [-4.15, 37.25], [-4.05, 37.9], [-4.6, 38.3], [-5.6, 38.1]],
  2: [[-4.15, 37.25], [-2.75, 37.3], [-2.6, 37.95], [-3.3, 38.35], [-4.05, 37.9]],
  3: [[-5.6, 38.1], [-4.6, 38.3], [-3.55, 38.35], [-3.1, 39.2], [-4.0, 40.6], [-5.4, 40.4], [-5.9, 39.2]],
  4: [[-7.2, 36.25], [-6.0, 36.15], [-5.7, 36.7], [-6.3, 37.0], [-7.15, 36.7]],
  5: [[-2.3, 40.75], [-0.6, 42.9], [1.2, 43.0], [1.35, 41.9], [0.4, 40.8], [-1.2, 40.6], [-2.3, 40.75]],
  6: [[-7.15, 36.7], [-6.3, 37.0], [-5.7, 36.7], [-5.55, 37.4], [-5.9, 38.2], [-6.8, 38.1], [-7.2, 37.6]],
  7: [[-3.85, 36.75], [-3.25, 36.85], [-2.95, 37.15], [-3.3, 37.45], [-3.85, 37.35]],
  8: [[-4.45, 36.75], [-3.85, 36.75], [-3.85, 37.35], [-4.05, 37.45], [-4.45, 37.1]],
  9: [[-2.95, 36.65], [-1.75, 36.6], [-1.65, 37.05], [-2.35, 37.3], [-2.95, 37.15]],
  10: [[-1.4, 38.7], [-0.25, 39.35], [0.55, 40.55], [-0.6, 40.65], [-1.35, 39.6]],
};

export const PROFESSIONS = [
  { id: 'farmer', name: 'Farmer', tagline: 'Turns soil into supper', bonus: '+20% grain yield', start: 'Gharnata' },
  { id: 'miner', name: 'Miner', tagline: 'Reads stone by lamplight', bonus: '+20% ore yield', start: 'Tulaytula' },
  { id: 'woodsman', name: 'Woodsman', tagline: 'Knows every tree by name', bonus: '+20% wood yield', start: 'Jayyan' },
  { id: 'smith', name: 'Smith', tagline: 'His steel keeps promises', bonus: 'Cheaper steel, steadier blades', start: 'Saragusta' },
  { id: 'merchant', name: 'Merchant', tagline: 'Counts twice, sells once', bonus: 'Market fees halved', start: 'Qurtuba' },
  { id: 'scholar', name: 'Scholar', tagline: 'Collects maps and debts', bonus: '+10% experience', start: 'Balansiya' },
] as const;

export const COUNCIL = [
  { role: 'Spymaster', name: 'Ibrahim al-Hajjib' },
  { role: 'Master of Coin', name: 'Amina al-Farise' },
  { role: 'High Marshal', name: 'Ibn al-Zafir' },
  { role: 'Voice of the Fields', name: 'Tova Miren' },
];

export const ROYAL_HISTORY = [
  { ruler: 'Abd al-Rahman III', years: '912–961', note: 'Proclaimed the Caliphate of Qurtuba.' },
  { ruler: 'Abd al-Malik al-Mansur', years: '938–1002', note: 'Hajjib who ruled in the caliph’s name.' },
  { ruler: 'The Fitna', years: '1009–1031', note: 'Civil war shatters the Caliphate into taifas.' },
  { ruler: 'You', years: '1031 —', note: 'A sworn lord of the new Taifa league.' },
];

export function bannerColors(seed: number) {
  const hues = ['#7a1f1f', '#1f3a6e', '#2f5d3a', '#5d3a1f', '#3a1f5d'];
  const metals = ['#e5c158', '#c9c9c9', '#d48a2f', '#9fb8a8'];
  return { field: hues[seed % hues.length], device: metals[seed % metals.length] };
}

export function getNeighbors(edges: { from_region_id: number; to_region_id: number }[], id: number): number[] {
  const out = new Set<number>();
  for (const e of edges) {
    if (e.from_region_id === id) out.add(e.to_region_id);
    if (e.to_region_id === id) out.add(e.from_region_id);
  }
  return Array.from(out);
}

// Lon/lat projection to 0-100 map space (shared with SVG schematic)
export function lonLatToXY(lon: number, lat: number): [number, number] {
  const x = ((lon + 9.5) / 13) * 100;
  const y = ((44.5 - lat) / 8.5) * 100;
  return [x, y];
}
