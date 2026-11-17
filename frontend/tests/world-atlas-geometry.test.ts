import { describe, it, expect } from 'vitest';
import { IBERIA_COAST, PROVINCE_MAP, TERRITORIES } from '../lib/worldLore';

type Point = [number, number];

function pointInPolygon(point: Point, polygon: Point[]): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const crosses = yi > y !== yj > y;
    if (crosses && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function pointInAnyProvince(point: Point): number[] {
  return Object.entries(TERRITORIES)
    .filter(([, polygon]) => pointInPolygon(point, polygon))
    .map(([id]) => Number(id));
}

function area(polygon: Point[]): number {
  let sum = 0;
  for (let i = 0; i < polygon.length; i++) {
    const [x1, y1] = polygon[i];
    const [x2, y2] = polygon[(i + 1) % polygon.length];
    sum += x1 * y2 - x2 * y1;
  }
  return sum / 2;
}

describe('Phase 7 interactive atlas geometry', () => {
  it('defines exactly the ten playable province territories', () => {
    expect(Object.keys(TERRITORIES).map(Number).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    for (const id of Object.keys(TERRITORIES).map(Number)) {
      expect(TERRITORIES[id].length).toBeGreaterThanOrEqual(5);
      expect(Math.abs(area(TERRITORIES[id]))).toBeGreaterThan(0.05);
    }
  });

  it('keeps every province seat inside its own polygon and on land', () => {
    for (const province of Object.values(PROVINCE_MAP)) {
      const seat: Point = [province.lon, province.lat];
      expect(pointInPolygon(seat, TERRITORIES[province.id]), `${province.name} seat is outside province ${province.id}`).toBe(true);
      expect(pointInPolygon(seat, IBERIA_COAST), `${province.name} seat is offshore`).toBe(true);
    }
  });

  it('never overlaps two playable provinces', () => {
    const overlaps: string[] = [];
    for (let lon = -9.3; lon <= 3.1; lon += 0.06) {
      for (let lat = 36.02; lat <= 42.4; lat += 0.06) {
        const hits = pointInAnyProvince([lon, lat]);
        if (hits.length > 1) {
          overlaps.push(`${lon.toFixed(2)},${lat.toFixed(2)} → ${hits.join('+')}`);
          if (overlaps.length >= 8) break;
        }
      }
      if (overlaps.length >= 8) break;
    }
    expect(overlaps).toEqual([]);
  });

  it('leaves no gaps inside the playable southern partition', () => {
    const gaps: string[] = [];
    for (let lon = -9.3; lon <= 1.1; lon += 0.05) {
      for (let lat = 36.02; lat <= 40.45; lat += 0.05) {
        // North-west Portugal above the Tagus frontier is intentionally outside
        // the ten playable taifas and rendered as "beyond the chronicle" land.
        if (lat > 39.55 && lon < -7.02) continue;
        if (!pointInPolygon([lon, lat], IBERIA_COAST)) continue;
        if (pointInAnyProvince([lon, lat]).length === 0) {
          gaps.push(`${lon.toFixed(2)},${lat.toFixed(2)}`);
          if (gaps.length >= 8) break;
        }
      }
      if (gaps.length >= 8) break;
    }
    expect(gaps).toEqual([]);
  });
});
