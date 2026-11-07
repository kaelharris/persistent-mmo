import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';

async function compareDom() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--allow-file-access-from-files']
  });

  const p1 = await browser.newPage();
  await p1.setViewport({ width: 1920, height: 1080 });
  await p1.goto('file:///C:/Users/Asmaa/Downloads/reignward-living-atlas.html');
  await p1.evaluate(() => {
    document.querySelector('button[data-preview="menu"]')?.click();
    const sw = document.getElementById('preview-switcher');
    if (sw) sw.style.display = 'none';
    if (document.activeElement) document.activeElement.blur();
  });

  const p2 = await browser.newPage();
  await p2.setViewport({ width: 1920, height: 1080 });
  await p2.goto('http://localhost:3000/menu');
  await p2.evaluate(() => {
    if (document.activeElement) document.activeElement.blur();
  });

  await new Promise(r => setTimeout(r, 1000));

  const compareSelectors = [
    '.main-menu-shell',
    '.menu-left',
    '.main-menu-title',
    '.main-menu-lead',
    '.menu-buttons',
    '[data-menu="atlas"]',
    '[data-menu="military"]',
    '.menu-shortcuts',
    '.menu-footnote',
    '.menu-right',
    '.menu-standard',
    '.menu-standard img',
    '.menu-campaign',
    '.menu-campaign-sub',
    '.menu-ledger'
  ];

  const report = {};

  for (const sel of compareSelectors) {
    const s1 = await p1.evaluate((s) => {
      const el = document.querySelector(s);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = window.getComputedStyle(el);
      return {
        x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
        margin: cs.margin,
        padding: cs.padding
      };
    }, sel);

    const s2 = await p2.evaluate((s) => {
      const el = document.querySelector(s);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = window.getComputedStyle(el);
      return {
        x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
        margin: cs.margin,
        padding: cs.padding
      };
    }, sel);

    report[sel] = { proto: s1, next: s2, diff: JSON.stringify(s1) !== JSON.stringify(s2) };
  }

  console.log(JSON.stringify(report, null, 2));

  await browser.close();
}
compareDom();

