import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PROTOTYPE_FILE = 'C:\\Users\\Asmaa\\Downloads\\reignward-living-atlas.html';
const NEXTJS_BASE_URL = 'http://localhost:3000';

async function testMatch() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--allow-file-access-from-files']
  });

  const vp = { width: 1920, height: 1080 };
  const protoUrl = `file://${PROTOTYPE_FILE.replace(/\\/g, '/')}`;

  // 1. Prototype Page
  const pPage = await browser.newPage();
  await pPage.setViewport(vp);
  await pPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await pPage.goto(protoUrl, { waitUntil: 'load' });
  await pPage.evaluate(() => {
    const prof = { name: 'Kael the Wanderer', homeland: 'Qurtuba', alliance: 'qurtuba', guest: false };
    try { localStorage.setItem('reignward_player_profile', JSON.stringify(prof)); } catch {}
    document.querySelector('button[data-preview="menu"]')?.click();
    const sw = document.getElementById('preview-switcher');
    if (sw) sw.style.display = 'none';
    if (document.activeElement) document.activeElement.blur();
  });
  await new Promise(r => setTimeout(r, 1000));
  const protoBuf = await pPage.screenshot();
  await pPage.close();

  // 2. Next.js Page
  const nPage = await browser.newPage();
  await nPage.setViewport(vp);
  await nPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await nPage.goto(`${NEXTJS_BASE_URL}/menu`, { waitUntil: 'load' });
  await nPage.evaluate(() => {
    const prof = { name: 'Kael the Wanderer', homeland: 'Qurtuba', alliance: 'qurtuba', guest: false };
    try { localStorage.setItem('reignward_player_profile', JSON.stringify(prof)); } catch {}
    if (document.activeElement) document.activeElement.blur();
  });
  await new Promise(r => setTimeout(r, 1000));
  const nextBuf = await nPage.screenshot();
  await nPage.close();

  // 3. Compute Diff
  const diffPage = await browser.newPage();
  await diffPage.setViewport(vp);
  await diffPage.setContent(`
    <canvas id="c"></canvas>
    <script>
      async function run() {
        const i1 = new Image(); const i2 = new Image();
        await Promise.all([
          new Promise(r => { i1.onload = r; i1.src = 'data:image/png;base64,${protoBuf.toString('base64')}'; }),
          new Promise(r => { i2.onload = r; i2.src = 'data:image/png;base64,${nextBuf.toString('base64')}'; })
        ]);
        const c1 = document.createElement('canvas');
        c1.width = 1920; c1.height = 1080;
        const ctx1 = c1.getContext('2d');
        ctx1.drawImage(i1, 0, 0);
        const d1 = ctx1.getImageData(0, 0, 1920, 1080).data;

        const c2 = document.createElement('canvas');
        c2.width = 1920; c2.height = 1080;
        const ctx2 = c2.getContext('2d');
        ctx2.drawImage(i2, 0, 0);
        const d2 = ctx2.getImageData(0, 0, 1920, 1080).data;

        let diff = 0;
        let menuDiff = 0;
        let bannerDiff = 0;
        for (let y = 0; y < 1080; y++) {
          for (let x = 0; x < 1920; x++) {
            const idx = (y * 1920 + x) * 4;
            const delta = Math.abs(d1[idx]-d2[idx]) + Math.abs(d1[idx+1]-d2[idx+1]) + Math.abs(d1[idx+2]-d2[idx+2]);
            if (delta > 30) {
              diff++;
              if (x < 700 && y > 150) menuDiff++;
              if (x > 1100 && y > 150) bannerDiff++;
            }
          }
        }
        window.__res = { diff, total: 1920*1080, match: ((1920*1080 - diff)/(1920*1080)*100).toFixed(3), menuDiff, bannerDiff };
      }
      run();
    </script>
  `);
  await new Promise(r => setTimeout(r, 1200));
  const res = await diffPage.evaluate(() => window.__res);
  console.log('Resting state comparison result:', res);

  await browser.close();
}
testMatch();

