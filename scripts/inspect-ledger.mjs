import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import fs from 'fs';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PROTOTYPE_FILE = 'C:\\Users\\Asmaa\\Downloads\\reignward-living-atlas.html';
const NEXTJS_URL = 'http://localhost:3000/menu';

async function inspectLedger() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--allow-file-access-from-files'],
  });

  try {
    const pageProto = await browser.newPage();
    await pageProto.setViewport({ width: 1920, height: 1080 });
    await pageProto.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await pageProto.goto(`file://${PROTOTYPE_FILE.replace(/\\/g, '/')}`, { waitUntil: 'load' });
    await pageProto.evaluate(() => {
      const prof = { name: 'Warden Kael', homeland: 'Qurtuba', alliance: 'qurtuba', guest: false };
      try { localStorage.setItem('reignward_player_profile', JSON.stringify(prof)); } catch {}
      const btn = document.querySelector('button[data-preview="menu"]');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const protoLedger = await pageProto.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.menu-ledger-card'));
      return cards.map(c => {
        const r = c.getBoundingClientRect();
        const img = c.querySelector('img')?.getBoundingClientRect();
        const strong = c.querySelector('strong')?.getBoundingClientRect();
        const small = c.querySelector('small')?.getBoundingClientRect();
        return {
          card: { x: r.x, y: r.y, w: r.width, h: r.height },
          img: { x: img?.x, y: img?.y, w: img?.width, h: img?.height },
          strong: { x: strong?.x, y: strong?.y, text: c.querySelector('strong')?.textContent },
          small: { x: small?.x, y: small?.y, text: c.querySelector('small')?.textContent },
        };
      });
    });

    const pageNext = await browser.newPage();
    await pageNext.setViewport({ width: 1920, height: 1080 });
    await pageNext.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await pageNext.goto(NEXTJS_URL, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));

    const nextLedger = await pageNext.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.menu-ledger-card'));
      return cards.map(c => {
        const r = c.getBoundingClientRect();
        const img = c.querySelector('img')?.getBoundingClientRect();
        const strong = c.querySelector('strong')?.getBoundingClientRect();
        const small = c.querySelector('small')?.getBoundingClientRect();
        return {
          card: { x: r.x, y: r.y, w: r.width, h: r.height },
          img: { x: img?.x, y: img?.y, w: img?.width, h: img?.height },
          strong: { x: strong?.x, y: strong?.y, text: c.querySelector('strong')?.textContent },
          small: { x: small?.x, y: small?.y, text: c.querySelector('small')?.textContent },
        };
      });
    });

    console.log('Prototype Ledger:', JSON.stringify(protoLedger, null, 2));
    console.log('Next.js Ledger:', JSON.stringify(nextLedger, null, 2));

  } finally {
    await browser.close();
  }
}

inspectLedger().catch(console.error);

