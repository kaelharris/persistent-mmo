import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import fs from 'fs';
import path from 'path';

async function inspectDiff() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  const protoB64 = fs.readFileSync('frontend/public/screenshots/main-menu-review/final-approved-main-menu-desktop.png').toString('base64');
  const nextB64 = fs.readFileSync('frontend/public/screenshots/main-menu-review/final-nextjs-main-menu-desktop.png').toString('base64');

  await page.setContent(`
    <script>
      async function run() {
        const img1 = new Image();
        const img2 = new Image();
        await Promise.all([
          new Promise(r => { img1.onload = r; img1.src = 'data:image/png;base64,${protoB64}'; }),
          new Promise(r => { img2.onload = r; img2.src = 'data:image/png;base64,${nextB64}'; })
        ]);
        const c1 = document.createElement('canvas');
        c1.width = 1920; c1.height = 1080;
        const ctx1 = c1.getContext('2d');
        ctx1.drawImage(img1, 0, 0);
        const d1 = ctx1.getImageData(0, 0, 1920, 1080).data;

        const c2 = document.createElement('canvas');
        c2.width = 1920; c2.height = 1080;
        const ctx2 = c2.getContext('2d');
        ctx2.drawImage(img2, 0, 0);
        const d2 = ctx2.getImageData(0, 0, 1920, 1080).data;

        let headerDiffs = 0;
        let menuButtonsDiffs = 0;
        let bannerDiffs = 0;
        let ledgerDiffs = 0;
        let otherDiffs = 0;

        let minX = 1920, maxX = 0, minY = 1080, maxY = 0;

        for (let y = 0; y < 1080; y++) {
          for (let x = 0; x < 1920; x++) {
            const i = (y * 1920 + x) * 4;
            const diff = Math.abs(d1[i] - d2[i]) + Math.abs(d1[i+1] - d2[i+1]) + Math.abs(d1[i+2] - d2[i+2]);
            if (diff > 30) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;

              if (y < 160) {
                headerDiffs++;
              } else if (x > 1100 && y > 160) {
                bannerDiffs++;
              } else if (x < 650 && y >= 160 && y < 750) {
                menuButtonsDiffs++;
              } else if (y >= 750) {
                ledgerDiffs++;
              } else {
                otherDiffs++;
              }
            }
          }
        }
        window.__res = { headerDiffs, menuButtonsDiffs, bannerDiffs, ledgerDiffs, otherDiffs, boundingBox: { minX, maxX, minY, maxY } };
      }
      run();
    </script>
  `);
  await new Promise(r => setTimeout(r, 1500));
  const res = await page.evaluate(() => window.__res);
  console.log('Diff breakdown for Desktop:', res);
  await browser.close();
}
inspectDiff();

