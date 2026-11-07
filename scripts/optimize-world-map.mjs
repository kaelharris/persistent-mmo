import sharp from 'sharp';
import path from 'node:path';

const source = path.resolve('frontend/public/assets/backgrounds/fantasy_world_map.png');
const target = path.resolve('frontend/public/assets/backgrounds/aegis-world-map.webp');

const info = await sharp(source)
  .resize({ width: 2400, withoutEnlargement: true })
  .webp({ quality: 82, effort: 5 })
  .toFile(target);

console.log(`Optimized map: ${info.width}x${info.height}, ${(info.size / 1024 / 1024).toFixed(2)} MB`);
