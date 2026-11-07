import fs from 'fs';
const html = fs.readFileSync('C:/Users/Asmaa/Downloads/reignward-living-atlas.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('--sans') && l.includes('Barlow')) {
    console.log(`Line ${idx+1}: ${l}`);
  }
});

