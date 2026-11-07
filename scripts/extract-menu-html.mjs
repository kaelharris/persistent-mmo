import fs from 'fs';

const html = fs.readFileSync('C:/Users/Asmaa/Downloads/reignward-living-atlas.html', 'utf8');
const start = 5271600;
console.log(html.substring(start, start + 2500));
