import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PROTOTYPE_FILE = 'C:\\Users\\Asmaa\\Downloads\\reignward-living-atlas.html';
const NEXTJS_BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.resolve('frontend/public/screenshots/main-menu-review');
const ARTIFACT_DIR = 'C:\\Users\\Asmaa\\.gemini\\antigravity\\brain\\e94a8153-a716-4f3e-a696-6459c2488ab4';

async function auditPrimaryButton() {
  console.log('=== PRIMARY BUTTON AUDIT (Resting, Hover, Focus) ===');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--allow-file-access-from-files']
  });

  const states = ['resting', 'hover', 'focus'];
  const auditResults = {};

  try {
    for (const state of states) {
      console.log(`Auditing state: ${state.toUpperCase()}...`);

      // 1. Prototype
      const pPage = await browser.newPage();
      await pPage.setViewport({ width: 1920, height: 1080 });
      await pPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      await pPage.goto(`file://${PROTOTYPE_FILE.replace(/\\/g, '/')}`, { waitUntil: 'load' });
      await pPage.evaluate(() => {
        const prof = { name: 'Kael the Wanderer', homeland: 'Qurtuba', alliance: 'qurtuba', guest: false };
        try { localStorage.setItem('reignward_player_profile', JSON.stringify(prof)); } catch {}
        document.querySelector('button[data-preview="menu"]')?.click();
        const sw = document.getElementById('preview-switcher');
        if (sw) sw.style.display = 'none';
      });

      if (state === 'resting') {
        await pPage.evaluate(() => {
          if (document.activeElement) document.activeElement.blur();
        });
      } else if (state === 'hover') {
        await pPage.hover('[data-menu="atlas"]');
      } else if (state === 'focus') {
        // Tab / arrow key into focus
        await pPage.keyboard.press('Tab');
        await pPage.evaluate(() => {
          document.querySelector('[data-menu="atlas"]')?.focus({ focusVisible: true });
        });
      }
      await new Promise(r => setTimeout(r, 600));

      const pData = await pPage.evaluate(() => {
        const btn = document.querySelector('[data-menu="atlas"]');
        const cs = window.getComputedStyle(btn);
        const r = btn.getBoundingClientRect();
        return {
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
          bg: cs.backgroundImage,
          border: cs.border,
          boxShadow: cs.boxShadow,
          transform: cs.transform,
          fontFamily: cs.fontFamily,
          color: cs.color
        };
      });

      const pBtnEl = await pPage.$('[data-menu="atlas"]');
      const pShot = await pBtnEl.screenshot();
      await pPage.close();

      // 2. Next.js
      const nPage = await browser.newPage();
      await nPage.setViewport({ width: 1920, height: 1080 });
      await nPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      await nPage.goto(`${NEXTJS_BASE_URL}/menu`, { waitUntil: 'load' });
      await nPage.evaluate(() => {
        const prof = { name: 'Kael the Wanderer', homeland: 'Qurtuba', alliance: 'qurtuba', guest: false };
        try { localStorage.setItem('reignward_player_profile', JSON.stringify(prof)); } catch {}
      });

      if (state === 'resting') {
        await nPage.evaluate(() => {
          if (document.activeElement) document.activeElement.blur();
        });
      } else if (state === 'hover') {
        await nPage.hover('[data-menu="atlas"]');
      } else if (state === 'focus') {
        await nPage.keyboard.press('Tab');
        await nPage.evaluate(() => {
          document.querySelector('[data-menu="atlas"]')?.focus({ focusVisible: true });
        });
      }
      await new Promise(r => setTimeout(r, 600));

      const nData = await nPage.evaluate(() => {
        const btn = document.querySelector('[data-menu="atlas"]');
        const cs = window.getComputedStyle(btn);
        const r = btn.getBoundingClientRect();
        return {
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
          bg: cs.backgroundImage,
          border: cs.border,
          boxShadow: cs.boxShadow,
          transform: cs.transform,
          fontFamily: cs.fontFamily,
          color: cs.color
        };
      });

      const nBtnEl = await nPage.$('[data-menu="atlas"]');
      const nShot = await nBtnEl.screenshot();
      await nPage.close();

      // Side-by-side button comparison
      const compPage = await browser.newPage();
      await compPage.setViewport({ width: 1300, height: 200 });
      await compPage.setContent(`
        <html>
        <head>
          <style>
            body { margin: 0; background: #060b11; font-family: 'DM Sans', sans-serif; color: #f0e6cd; padding: 15px; }
            .row { display: flex; gap: 20px; align-items: center; }
            .col { flex: 1; }
            .label { font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 6px; color: #d6b475; }
            img { display: block; border: 1px solid #332517; width: 100%; }
          </style>
        </head>
        <body>
          <div style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #e8c388;">
            STATE: ${state.toUpperCase()} (Primary Action: "Enter the Atlas")
          </div>
          <div class="row">
            <div class="col">
              <div class="label">Approved Prototype Reference</div>
              <img src="data:image/png;base64,${pShot.toString('base64')}" />
            </div>
            <div class="col">
              <div class="label">Next.js Implementation</div>
              <img src="data:image/png;base64,${nShot.toString('base64')}" />
            </div>
          </div>
        </body>
        </html>
      `);
      await new Promise(r => setTimeout(r, 600));
      const compShotPath = path.join(OUTPUT_DIR, `btn-state-${state}-comparison.png`);
      await compPage.screenshot({ path: compShotPath, fullPage: true });
      fs.copyFileSync(compShotPath, path.join(ARTIFACT_DIR, `btn-state-${state}-comparison.png`));
      await compPage.close();

      auditResults[state] = {
        prototype: pData,
        nextjs: nData,
        match: JSON.stringify(pData.border) === JSON.stringify(nData.border) &&
               JSON.stringify(pData.bg) === JSON.stringify(nData.bg) &&
               JSON.stringify(pData.boxShadow) === JSON.stringify(nData.boxShadow) &&
               JSON.stringify(pData.transform) === JSON.stringify(nData.transform)
      };
    }

    console.log('Button Audit Results:');
    console.log(JSON.stringify(auditResults, null, 2));

  } finally {
    await browser.close();
  }
}
auditPrimaryButton();

