import fs from 'fs';
import path from 'path';

const gameDir = 'frontend/app/(game)';
const files = [];

function getFiles(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) getFiles(full);
    else if (full.endsWith('.tsx') || full.endsWith('.ts') || full.endsWith('.css')) files.push(full);
  }
}
getFiles(gameDir);

const css = fs.readFileSync('frontend/app/reignward-prototype.css', 'utf8');
const classMatches = [...css.matchAll(/\.([a-zA-Z0-9_-]+)/g)].map(m => m[1]);
const uniqueClasses = [...new Set(classMatches)];

const collisions = {};

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  for (const c of uniqueClasses) {
    if (c === 'main-menu' || c.startsWith('menu-')) continue;
    // Check if class is used in JSX or CSS
    const regex = new RegExp(`["'\\s]${c}["'\\s]`, 'g');
    if (regex.test(content)) {
      if (!collisions[c]) collisions[c] = [];
      collisions[c].push(f);
    }
  }
}

console.log('Class Collisions between reignward-prototype.css and (game) files:');
console.log(collisions);

