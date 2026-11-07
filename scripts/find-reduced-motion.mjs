import fs from 'fs';
const css = fs.readFileSync('frontend/app/reignward-prototype.css', 'utf8');
const lines = css.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('prefers-reduced-motion')) {
    console.log(`Line ${idx+1}: ${l}`);
  }
});

