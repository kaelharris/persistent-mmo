import fs from 'fs';
const css = fs.readFileSync('frontend/app/reignward-prototype.css', 'utf8');
const lines = css.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('focus')) {
    console.log(`Line ${idx + 1}: ${l}`);
  }
});

