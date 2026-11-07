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
  { id: 1, name: 'Taifa of Qurtuba', motto: 'The Citadel of Knowledge', color: '#b89030', description: 'The old caliphal capital and the Guadiana marches. Stone roads, charter towns, and the council that binds the centre.', capital: 'Qurtuba' },
  { id: 2, name: 'Taifa of Ishbiliya', motto: 'Through Rivers, We Prosper', color: '#8a3b2e', description: 'The Abbadid west — river port, Strait watch, and the northern claim to Saragusta. Their steel is honest, their winters are not.', capital: 'Ishbiliya' },
  { id: 3, name: 'Taifa of Gharnata', motto: 'Unbroken Above the Valleys', color: '#5f7a3a', description: 'The Zirid east — vega gardens, Sierra Nevada silver, and the Mediterranean road to Balansiya.', capital: 'Gharnata' },
  { id: 4, name: 'Taifa of Tulaytula', motto: 'The Gates Shall Hold', color: '#7b6a4a', description: 'A walled hill city on the Tagus. Masons sell utraque stone to every lord in the frontier.', capital: 'Tulaytula' },
  { id: 5, name: 'Taifa of Saragusta', motto: 'Riders of the Eastern March', color: '#4a617b', description: 'Fortress on the Ebro claiming the northern march. Iron is priced by war.', capital: 'Saragusta' },
  { id: 6, name: 'Taifa of Balansiya', motto: 'The Granary and the Sea', color: '#785b3b', description: 'Orchard huerta on the Turia. Herbalists and silk weavers trade salves and cloth.', capital: 'Balansiya' },
  { id: 7, name: 'Taifa of Almiriya', motto: 'The Watchfire Never Dies', color: '#8b4a5f', description: 'Dry port and alum road. Carters cross at dawn and dusk.', capital: 'Almiriya' },
  { id: 8, name: 'Kingdom of León', motto: 'By Claw and Crown', color: '#6b3b78', description: 'Ancient northern crown of the Leonese kings, holding the Cantabrian passes.', capital: 'León' },
  { id: 9, name: 'Kingdom of Navarre', motto: 'Bound in Oath', color: '#3b6b66', description: 'Pyrenean mountain crown, stern lords of the high valleys and passes.', capital: 'Iruña' },
  { id: 10, name: 'County of Barcelona', motto: 'Four Fires, One Realm', color: '#7b3b3b', description: 'Catalan marches of the Mediterranean shore, seafaring merchants and counts.', capital: 'Barcelona' },
];

export const PROVINCES: ProvinceLore[] = [
  { id: 1, name: 'Qurtuba', subtitle: 'Caliphal capital', description: 'Seat of the High Council. Granite halls and the Great Mosque dominate a Roman bridge over the Guadalquivir.', terrain: 'Guadalquivir valley', resources: ['Grain', 'Water', 'Stone'], lon: -4.78, lat: 37.88, x: 36.4, y: 77.9, icon: 'castle' },
  { id: 2, name: 'Jayyan', subtitle: 'Sierra Morena march', description: 'Olive hills and oak forest on the northern frontier. Charcoal burners and carvers work beneath a green canopy.', terrain: 'Sierra Morena foothills / forest', resources: ['Wood', 'Grain', 'Water'], lon: -3.78, lat: 37.77, x: 44.0, y: 79.2, icon: 'forest' },
  { id: 3, name: 'Tulaytula', subtitle: 'Tagus frontier', description: 'A walled hill city on the Tagus. Masons sell utraque stone to every lord in the frontier.', terrain: 'Meseta / Tagus gorge', resources: ['Stone', 'Copper', 'Coal'], lon: -4.02, lat: 39.86, x: 42.1, y: 54.6, icon: 'mine' },
  { id: 4, name: 'Qadiz', subtitle: 'Strait watch', description: 'Fortress port on the Straits. Fishing fleets mend nets while merchants watch the tide.', terrain: 'Straits coast / islands', resources: ['Fish', 'Water'], lon: -6.28, lat: 36.52, x: 24.5, y: 93.6, icon: 'harbor' },
  { id: 5, name: 'Saragusta', subtitle: 'Ebro fortress-city', description: 'Fortress on the Ebro claiming the northern march. Iron is priced by war.', terrain: 'Ebro valley / meseta edge', resources: ['Iron Ore', 'Coal'], lon: -0.89, lat: 41.65, x: 66.2, y: 33.5, icon: 'keep' },
  { id: 6, name: 'Ishbiliya', subtitle: 'Abbadid capital', description: 'The Guadalquivir port. Red sands where ore boats ground. Smell of forge-smoke on every wind.', terrain: 'Guadalquivir plain / coast', resources: ['Fish', 'Stone'], lon: -5.99, lat: 37.39, x: 27.0, y: 83.6, icon: 'harbor' },
  { id: 7, name: 'Sierra Nevada', subtitle: 'Snow-capped sierra', description: 'High crags that bleed copper and snowmelt water. Only the stubborn settle here.', terrain: 'Sierra Nevada (mountain)', resources: ['Copper', 'Iron Ore', 'Stone'], lon: -3.05, lat: 37.05, x: 49.6, y: 87.6, icon: 'ruins' },
  { id: 8, name: 'Gharnata', subtitle: 'Vega capital', description: 'Golden vega gardens that feed three taifas. Bread is law here.', terrain: 'Vega / Genil valley', resources: ['Grain', 'Cotton', 'Water'], lon: -3.61, lat: 37.17, x: 45.3, y: 85.9, icon: 'fields' },
  { id: 9, name: 'Almiriya', subtitle: 'Mediterranean road', description: 'Dry port and alum road. Carters cross at dawn and dusk.', terrain: 'Arid coast', resources: ['Oil', 'Coal'], lon: -2.46, lat: 36.84, x: 54.1, y: 89.8, icon: 'ruins' },
  { id: 10, name: 'Balansiya', subtitle: 'Turia orchards', description: 'Orchard huerta on the Turia. Herbalists and silk weavers trade salves and cloth.', terrain: 'Turia huerta / forest edge', resources: ['Wood', 'Fish', 'Cotton'], lon: -0.38, lat: 39.47, x: 70.2, y: 59.2, icon: 'forest' },
];

export const PROVINCE_MAP: Record<number, ProvinceLore> = Object.fromEntries(PROVINCES.map((p) => [p.id, p]));

/*
  Province territories — corrected Phase 7 geometry.

  The Phase 6.6 polygons were hand-tiled but not topologically sound: 2/8 overlapped
  around Guadix, 1/2/3 left a triangular gap north of Qurtuba, 6 stopped inland of the
  Algarve coast, and several coastal provinces floated away from the landmass. These
  polygons now form a single planar partition of the playable south. Every interior
  edge appears with the same two lon/lat vertices in both neighbouring polygons, and
  every polygon may safely overrun the coast because the renderer intersects the whole
  political layer with one shared Iberia clip path. Province IDs, approximate seats and
  gameplay neighbours are unchanged.
*/
export const TERRITORIES: Record<number, [number, number][]> = {
  1: [[-5.6, 38.1], [-4.6, 38.3], [-4.05, 37.9], [-4.15, 37.25], [-4.9, 37.05], [-5.6, 37.35]],
  2: [[-4.05, 37.9], [-3.55, 38.35], [-2.6, 38.35], [-1.2, 38.6], [-2.95, 37.45], [-3.3, 37.45], [-3.85, 37.45], [-4.15, 37.25]],
  3: [[-5.6, 38.1], [-4.6, 38.3], [-4.05, 37.9], [-3.55, 38.35], [-2.6, 38.35], [-1.2, 38.6], [-1.35, 39.6], [-2.9, 40.6], [-5.4, 40.6], [-7.0, 40.6], [-7.0, 39.6], [-7.0, 38.55], [-6.4, 38.2]],
  4: [[-8.9, 37.0], [-8.9, 36.6], [-7.4, 36.3], [-6.0, 36.15], [-5.7, 36.7], [-6.3, 37.0], [-7.15, 36.7], [-7.6, 36.9], [-8.2, 37.0]],
  5: [[-2.9, 40.6], [-0.6, 40.65], [0.55, 40.55], [1.1, 41.4], [0.5, 42.2], [-0.8, 42.6], [-1.6, 42.0], [-2.3, 40.75]],
  6: [[-5.6, 38.1], [-5.6, 37.35], [-4.9, 37.05], [-4.9, 36.75], [-5.7, 36.7], [-6.3, 37.0], [-7.15, 36.7], [-7.6, 36.9], [-8.2, 37.0], [-8.9, 37.0], [-8.9, 39.6], [-7.0, 39.6], [-7.0, 38.55], [-6.4, 38.2]],
  7: [[-3.3, 37.45], [-2.95, 37.45], [-2.6, 37.0], [-3.0, 36.7], [-3.3, 36.75]],
  8: [[-4.9, 37.05], [-4.15, 37.25], [-3.85, 37.45], [-3.3, 37.45], [-3.3, 36.75], [-4.9, 36.75]],
  9: [[-3.0, 36.7], [-2.6, 37.0], [-2.95, 37.45], [-1.2, 38.6], [-0.6, 38.2], [-0.9, 37.8], [-1.3, 37.1], [-1.7, 36.6]],
  10: [[-1.2, 38.6], [-0.6, 38.2], [0.3, 39.0], [0.55, 40.55], [-0.6, 40.65], [-2.9, 40.6], [-1.35, 39.6]],
};

// Iberia coastline, lon/lat clockwise from Cabo Finisterre. Deliberately detailed:
// the same vertices drive the land clip, coast inking and terrain imagery.
export const IBERIA_COAST: [number, number][] = [
  [-9.3, 43.2], [-9.0, 43.55], [-8.6, 43.75], [-8.0, 43.72], [-7.4, 43.68], [-6.8, 43.55],
  [-6.2, 43.58], [-5.5, 43.55], [-4.8, 43.48], [-4.1, 43.45], [-3.4, 43.42], [-2.8, 43.4],
  [-2.2, 43.38], [-1.8, 43.4], [-1.4, 43.32], [-0.9, 43.3], [-0.4, 43.38], [0.1, 43.32],
  [0.6, 43.25], [1.0, 43.18], [1.5, 43.05], [2.0, 42.75], [2.5, 42.55], [3.15, 42.35],
  [3.1, 41.95], [2.95, 41.65], [2.55, 41.5], [2.1, 41.4], [1.6, 41.25], [1.15, 41.1],
  [0.75, 40.95], [0.45, 40.75], [0.2, 40.55], [0.05, 40.3], [-0.1, 40.05], [-0.22, 39.8],
  [-0.18, 39.55], [-0.05, 39.3], [0.05, 39.05], [-0.15, 38.85], [-0.45, 38.65], [-0.6, 38.4],
  [-0.75, 38.15], [-0.95, 37.9], [-1.2, 37.7], [-1.5, 37.45], [-1.8, 37.15], [-2.0, 36.9],
  [-2.2, 36.72], [-2.6, 36.62], [-3.0, 36.6], [-3.4, 36.65], [-3.8, 36.68], [-4.2, 36.68],
  [-4.6, 36.62], [-5.0, 36.48], [-5.35, 36.28], [-5.55, 36.05], [-5.8, 36.02], [-6.05, 36.2],
  [-6.3, 36.45], [-6.55, 36.6], [-6.85, 36.88], [-7.1, 37.05], [-7.35, 37.18], [-7.55, 37.25],
  [-7.5, 37.5], [-7.45, 37.75], [-7.8, 38.0], [-8.2, 38.18], [-8.6, 38.3], [-8.9, 38.45],
  [-8.92, 38.75], [-8.85, 39.05], [-8.95, 39.35], [-8.98, 39.65], [-8.92, 39.95], [-8.88, 40.3],
  [-8.9, 40.65], [-8.85, 41.0], [-8.88, 41.35], [-8.9, 41.7], [-8.95, 42.0], [-9.15, 42.35],
  [-9.25, 42.7], [-9.3, 43.0],
];

// One shared projection for terrain, province polygons, settlements and overlays.
// 1° latitude = 100 world units; longitude is scaled by cos(40°) so Iberia is not
// vertically squashed. The viewBox leaves a 50-unit sea margin on every side.
export const MAP_VIEW = { width: 1100, height: 950, pad: 50 } as const;
export const MAP_LON = { min: -9.5, max: 3.5 } as const;
export const MAP_LAT = { min: 36.0, max: 44.5 } as const;

export function lonLatToWorld(lon: number, lat: number): [number, number] {
  const x = MAP_VIEW.pad + ((lon - MAP_LON.min) / (MAP_LON.max - MAP_LON.min)) * (MAP_VIEW.width - MAP_VIEW.pad * 2);
  const y = MAP_VIEW.pad + ((MAP_LAT.max - lat) / (MAP_LAT.max - MAP_LAT.min)) * (MAP_VIEW.height - MAP_VIEW.pad * 2);
  return [x, y];
}

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
