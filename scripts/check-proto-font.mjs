import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';

async function checkProtoFont() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--allow-file-access-from-files']
  });

  const p1 = await browser.newPage();
  await p1.goto('file:///C:/Users/Asmaa/Downloads/reignward-living-atlas.html');
  await p1.evaluate(() => {
    document.querySelector('button[data-preview="menu"]')?.click();
  });

  const res = await p1.evaluate(() => {
    const btn = document.querySelector('[data-menu="atlas"]');
    const cs = window.getComputedStyle(btn);
    const bodyCs = window.getComputedStyle(document.body);
    const rootCs = window.getComputedStyle(document.documentElement);
    return {
      btnFontFamily: cs.fontFamily,
      bodyFontFamily: bodyCs.fontFamily,
      rootSans: rootCs.getPropertyValue('--sans'),
      matchedRules: Array.from(document.styleSheets).flatMap(sheet => {
        try {
          return Array.from(sheet.cssRules)
            .filter(r => r.selectorText && (r.selectorText.includes('button') || r.selectorText.includes('body') || r.selectorText.includes('menu-option')))
            .map(r => r.cssText);
        } catch { return []; }
      })
    };
  });

  console.log('Proto font analysis:', res);
  await browser.close();
}
checkProtoFont();

