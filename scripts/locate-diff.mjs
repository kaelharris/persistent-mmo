import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import fs from 'fs';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PROTOTYPE_FILE = 'C:\\Users\\Asmaa\\Downloads\\reignward-living-atlas.html';
const NEXTJS_URL = 'http://localhost:3000/menu';

async function locateRemainingDiff() {
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
      const sw = document.getElementById('preview-switcher');
      if (sw) sw.style.display = 'none';
      document.querySelector('[data-menu="atlas"]')?.focus({ preventScroll: true });
    });
    await new Promise(r => setTimeout(r, 1000));
    const protoShot = await pageProto.screenshot({ encoding: 'base64' });

    const pageNext = await browser.newPage();
    await pageNext.setViewport({ width: 1920, height: 1080 });
    await pageNext.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await pageNext.goto(NEXTJS_URL, { waitUntil: 'domcontentloaded' });
    await pageNext.evaluate(() => {
      const prof = { name: 'Warden Kael', homeland: 'Qurtuba', alliance: 'qurtuba', guest: false };
      try { localStorage.setItem('reignward_player_profile', JSON.stringify(prof)); } catch {}
      document.querySelector('[data-menu="atlas"]')?.focus({ preventScroll: true });
    });
    await new Promise(r => setTimeout(r, 1000));
    const nextShot = await pageNext.screenshot({ encoding: 'base64' });

    const compPage = await browser.newPage();
    await compPage.setViewport({ width: 1920, height: 1080 });
    const diffBoxes = await compPage.evaluate(async (b1, b2) => {
      const img1 = new Image();
      const img2 = new Image();
      await Promise.all([
        new Promise(r => { img1.onload = r; img1.src = 'data:image/png;base64,' + b1; }),
        new Promise(r => { img2.onload = r; img2.src = 'data:image/png;base64,' + b2; })
      ]);
      const w = img1.naturalWidth;
      const h = img1.naturalHeight;
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img1, 0, 0);
      const d1 = ctx.getImageData(0, 0, w, h);
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img2, 0, 0);
      const d2 = ctx.getImageData(0, 0, w, h);

      // Group diff pixels by region
      let regions = {
        header: 0,
        menuButtons: 0,
        menuTitleLead: 0,
        menuStandardBanner: 0,
        menuLedger: 0,
        background: 0,
        other: 0,
      };

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          const diff = Math.abs(d1.data[i] - d2.data[i]) +
                       Math.abs(d1.data[i+1] - d2.data[i+1]) +
                       Math.abs(d1.data[i+2] - d2.data[i+2]);
          if (diff > 30) {
            if (y < 90) regions.header++;
            else if (x < 900 && y >= 380 && y <= 850) regions.menuButtons++;
            else if (x < 900 && y < 380) regions.menuTitleLead++;
            else if (x >= 900 && y >= 100 && y <= 550) regions.menuStandardBanner++;
            else if (x >= 900 && y > 550) regions.menuLedger++;
            else regions.background++;
          }
        }
      }
      return regions;
    }, protoShot, nextShot);

    console.log('Diff pixel distribution by screen region:');
    console.log(diffBoxes);

  } finally {
    await browser.close();
  }
}

locateRemainingDiff().catch(console.error);

