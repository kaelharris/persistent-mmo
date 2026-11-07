import fs from 'fs';

const html = fs.readFileSync('C:/Users/Asmaa/Downloads/reignward-living-atlas.html', 'utf8');
const characterFile = fs.readFileSync('frontend/public/assets/reignward-wide/character.webp');

const m = html.match(/character:\s*['"]data:image\/webp;base64,([^'"]+)['"]/);
if (m) {
  const protoBuf = Buffer.from(m[1], 'base64');
  console.log('Prototype character bytes:', protoBuf.length);
  console.log('Local character.webp bytes:', characterFile.length);
  console.log('Exact match:', protoBuf.equals(characterFile));
} else {
  console.log('No base64 match for character');
}

