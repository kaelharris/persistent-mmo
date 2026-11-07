import fs from 'fs';

const html = fs.readFileSync('C:/Users/Asmaa/Downloads/reignward-living-atlas.html', 'utf8');

console.log('--- Font URLs ---');
const fontMatches = html.match(/fonts\.googleapis\.com[^'"]+/g);
console.log(fontMatches);

console.log('--- All @import ---');
const imports = html.match(/@import[^;]+;/g);
console.log(imports);

console.log('--- Embedded images in sceneArt ---');
const sceneArtMatch = html.match(/const sceneArt\s*=\s*\{([\s\S]*?)\};/);
if (sceneArtMatch) {
  const keys = sceneArtMatch[1].match(/([a-zA-Z0-9_]+):/g);
  console.log('sceneArt keys:', keys);
}

console.log('--- Embedded banners / crests ---');
const bannersMatch = html.match(/const embeddedBanners\s*=\s*\{([\s\S]*?)\};/);
if (bannersMatch) {
  const keys = bannersMatch[1].match(/([a-zA-Z0-9_]+):/g);
  console.log('embeddedBanners keys:', keys);
}

