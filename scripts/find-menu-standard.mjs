import fs from 'fs';
const html = fs.readFileSync('C:/Users/Asmaa/Downloads/reignward-living-atlas.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('.menu-standard')) {
    console.log(`Proto line ${idx+1}: ${l}`);
  }
});
const css = fs.readFileSync('frontend/app/reignward-prototype.css', 'utf8');
const lines2 = css.split('\n');
lines2.forEach((l, idx) => {
  if (l.includes('.menu-standard')) {
    console.log(`CSS line ${idx+1}: ${l}`);
  }
});

