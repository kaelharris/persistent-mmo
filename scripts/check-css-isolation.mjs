import fs from 'fs';

const css = fs.readFileSync('frontend/app/reignward-prototype.css', 'utf8');

// Strip comments
const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');

// Find top level selectors
const rules = noComments.match(/[^{}]+(?=\{)/g) || [];
const unScoped = [];

for (const rule of rules) {
  const trimmed = rule.trim();
  if (trimmed.startsWith('@')) continue; // @media, @keyframes, etc.
  
  // check if any selector in the rule does not mention main-menu, gateway, realm, preview
  const selectors = trimmed.split(',').map(s => s.trim());
  for (const s of selectors) {
    if (
      !s.includes('main-menu') &&
      !s.includes('menu-') &&
      !s.includes('gate') &&
      !s.includes('realm') &&
      !s.includes('preview') &&
      !s.includes('reignward') &&
      !s.includes('atlas') &&
      !s.includes('province') &&
      !s.includes('council') &&
      !s.includes('brand') &&
      !s.includes('dock') &&
      !s.includes('res')
    ) {
      unScoped.push(s);
    }
  }
}

console.log('Unscoped / generic selectors in reignward-prototype.css:');
console.log([...new Set(unScoped)]);

