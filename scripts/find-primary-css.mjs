import fs from 'fs';
const html = fs.readFileSync('C:/Users/Asmaa/Downloads/reignward-living-atlas.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('.menu-option.primary') || (l.includes('.menu-option') && l.includes('117, 38, 39'))) {
    console.log(`Line ${idx + 1}: ${l}`);
  }
});

