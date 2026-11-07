import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PROTOTYPE_FILE = 'C:\\Users\\Asmaa\\Downloads\\reignward-living-atlas.html';
const NEXTJS_BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.resolve('frontend/public/screenshots/main-menu-review');
const ARTIFACT_DIR = 'C:\\Users\\Asmaa\\.gemini\\antigravity\\brain\\e94a8153-a716-4f3e-a696-6459c2488ab4';

const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080, dpr: 1, isMobile: false, label: 'Desktop (1920×1080)' },
  { name: 'laptop', width: 1366, height: 768, dpr: 1, isMobile: false, label: 'Laptop (1366×768)' },
  { name: 'mobile', width: 390, height: 844, dpr: 2, isMobile: true, label: 'Mobile Portrait (390×844)' },
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('=== FINAL ACCEPTANCE EVIDENCE GENERATION ===');
  console.log('Prototype File:', PROTOTYPE_FILE);
  console.log('Next.js URL:', `${NEXTJS_BASE_URL}/menu`);

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--allow-file-access-from-files'],
  });

  const auditReport = {
    viewports: {},
    primaryButtonAudit: null,
  };

  try {
    const protoUrl = `file://${PROTOTYPE_FILE.replace(/\\/g, '/')}`;

    // ----------------------------------------------------
    // 1. CAPTURE PROTOTYPE & NEXT.JS FOR ALL VIEWPORTS
    // ----------------------------------------------------
    for (const vp of VIEWPORTS) {
      console.log(`Auditing ${vp.label}...`);

      // A. Prototype Page
      const pPage = await browser.newPage();
      await pPage.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: vp.dpr, isMobile: vp.isMobile });
      await pPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      await pPage.goto(protoUrl, { waitUntil: 'load' });
      await pPage.evaluate(() => {
        const prof = { name: 'Kael the Wanderer', homeland: 'Qurtuba', alliance: 'qurtuba', guest: false };
        try { localStorage.setItem('reignward_player_profile', JSON.stringify(prof)); } catch {}
        const btn = document.querySelector('button[data-preview="menu"]');
        if (btn) btn.click();
        const sw = document.getElementById('preview-switcher');
        if (sw) sw.style.display = 'none';
        const m = document.getElementById('main-menu');
        if (m) m.scrollTop = 0;
        document.querySelector('[data-menu="atlas"]')?.focus({ preventScroll: true });
      });
      await wait(1200);

      const protoPath = path.join(OUTPUT_DIR, `final-approved-main-menu-${vp.name}.png`);
      await pPage.screenshot({ path: protoPath });
      await pPage.close();

      // B. Next.js Page
      const nPage = await browser.newPage();
      await nPage.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: vp.dpr, isMobile: vp.isMobile });
      await nPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      await nPage.goto(`${NEXTJS_BASE_URL}/menu`, { waitUntil: 'domcontentloaded' });
      await nPage.evaluate(() => {
        const prof = { name: 'Kael the Wanderer', homeland: 'Qurtuba', alliance: 'qurtuba', guest: false };
        try { localStorage.setItem('reignward_player_profile', JSON.stringify(prof)); } catch {}
        const m = document.getElementById('main-menu');
        if (m) m.scrollTop = 0;
        document.querySelector('[data-menu="atlas"]')?.focus({ preventScroll: true });
      });
      await wait(1200);

      const nextPath = path.join(OUTPUT_DIR, `final-nextjs-main-menu-${vp.name}.png`);
      await nPage.screenshot({ path: nextPath });
      await nPage.close();

      // C. Generate Side-by-Side Comparison
      const protoB64 = fs.readFileSync(protoPath).toString('base64');
      const nextB64 = fs.readFileSync(nextPath).toString('base64');

      const compPage = await browser.newPage();
      await compPage.setViewport({ width: vp.width * 2 + 60, height: vp.height + 160, deviceScaleFactor: 1 });

      const sideBySideHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; background: #060b11; font-family: 'DM Sans', -apple-system, sans-serif; color: #f0e6cd; }
            .header { padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #332517; background: #0a111a; }
            .header h1 { margin: 0; font-size: 20px; font-family: 'Cinzel', Georgia, serif; letter-spacing: 2px; color: #dfbe80; }
            .header .meta { font-size: 13px; color: #a19782; }
            .comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 20px; }
            .column { display: flex; flex-direction: column; gap: 10px; }
            .badge { display: inline-block; padding: 6px 14px; font-size: 12px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; border-radius: 4px; }
            .badge-approved { background: #1c3d2e; color: #7de4a7; border: 1px solid #2f694a; }
            .badge-nextjs { background: #3d2c1c; color: #e4b87d; border: 1px solid #694b2f; }
            .frame { border: 2px solid #283745; border-radius: 6px; overflow: hidden; background: #000; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            img { width: 100%; height: auto; display: block; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>REIGNWARD · MAIN MENU PIXEL AUDIT (CONTROLLED STATE)</h1>
            <div class="meta">${vp.label} · Left: Approved Reference | Right: Next.js Implementation</div>
          </div>
          <div class="comparison-grid">
            <div class="column">
              <div><span class="badge badge-approved">APPROVED REFERENCE PROTOTYPE</span></div>
              <div class="frame"><img src="data:image/png;base64,${protoB64}" /></div>
            </div>
            <div class="column">
              <div><span class="badge badge-nextjs">NEXT.JS PRODUCTION IMPLEMENTATION</span></div>
              <div class="frame"><img src="data:image/png;base64,${nextB64}" /></div>
            </div>
          </div>
        </body>
        </html>
      `;
      await compPage.setContent(sideBySideHtml, { waitUntil: 'load' });
      await wait(1000);

      const sideBySidePath = path.join(OUTPUT_DIR, `final-side-by-side-${vp.name}.png`);
      await compPage.screenshot({ path: sideBySidePath, fullPage: true });
      await compPage.close();

      // D. Generate Visual Difference Overlay
      const diffPage = await browser.newPage();
      await diffPage.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });

      const diffHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; background: #000; overflow: hidden; }
            canvas { display: block; }
          </style>
        </head>
        <body>
          <canvas id="diff-canvas"></canvas>
          <script>
            async function computeDiff() {
              const img1 = new Image();
              const img2 = new Image();
              await Promise.all([
                new Promise(r => { img1.onload = r; img1.src = 'data:image/png;base64,${protoB64}'; }),
                new Promise(r => { img2.onload = r; img2.src = 'data:image/png;base64,${nextB64}'; })
              ]);
              const canvas = document.getElementById('diff-canvas');
              const w = img1.naturalWidth;
              const h = img1.naturalHeight;
              canvas.width = w; canvas.height = h;
              const ctx = canvas.getContext('2d');

              ctx.drawImage(img1, 0, 0);
              const data1 = ctx.getImageData(0, 0, w, h);

              const c2 = document.createElement('canvas');
              c2.width = w; c2.height = h;
              const ctx2 = c2.getContext('2d');
              ctx2.drawImage(img2, 0, 0);
              const data2 = ctx2.getImageData(0, 0, w, h);

              const diffData = ctx.createImageData(w, h);
              let diffCount = 0;
              let totalPixels = w * h;

              for (let i = 0; i < data1.data.length; i += 4) {
                const rDiff = Math.abs(data1.data[i] - data2.data[i]);
                const gDiff = Math.abs(data1.data[i+1] - data2.data[i+1]);
                const bDiff = Math.abs(data1.data[i+2] - data2.data[i+2]);
                const totalDiff = rDiff + gDiff + bDiff;

                if (totalDiff > 30) {
                  diffCount++;
                  diffData.data[i] = 255;
                  diffData.data[i+1] = 40;
                  diffData.data[i+2] = 120;
                  diffData.data[i+3] = 255;
                } else {
                  const gray = (data2.data[i] * 0.299 + data2.data[i+1] * 0.587 + data2.data[i+2] * 0.114) * 0.45;
                  diffData.data[i] = gray;
                  diffData.data[i+1] = gray;
                  diffData.data[i+2] = gray;
                  diffData.data[i+3] = 255;
                }
              }

              ctx.putImageData(diffData, 0, 0);

              ctx.fillStyle = 'rgba(0,0,0,0.85)';
              ctx.fillRect(0, 0, w, 60);
              ctx.fillStyle = '#f0e6cd';
              ctx.font = 'bold 20px sans-serif';
              ctx.fillText('FINAL VISUAL DIFFERENCE OVERLAY · Highlighted Magenta = Discrepancy (>10% per channel)', 24, 38);
              const matchPct = ((totalPixels - diffCount) / totalPixels * 100).toFixed(3);
              ctx.fillStyle = matchPct > 95 ? '#7de4a7' : '#e4b87d';
              ctx.fillText('Visual Match: ' + matchPct + '%', w - 240, 38);

              window.__diffStats = { totalPixels, diffCount, matchPct: parseFloat(matchPct) };
            }
            computeDiff();
          </script>
        </body>
        </html>
      `;

      await diffPage.setContent(diffHtml, { waitUntil: 'load' });
      await wait(1200);

      const diffStats = await diffPage.evaluate(() => window.__diffStats);
      const diffPath = path.join(OUTPUT_DIR, `final-diff-overlay-${vp.name}.png`);
      await diffPage.screenshot({ path: diffPath, fullPage: true });
      await diffPage.close();

      console.log(`Diff result for ${vp.label}: ${diffStats.matchPct}% match (${diffStats.diffCount} / ${diffStats.totalPixels} px delta)`);

      auditReport.viewports[vp.name] = {
        protoPath,
        nextPath,
        sideBySidePath,
        diffPath,
        diffStats,
      };

      // Copy to artifact directory
      fs.copyFileSync(protoPath, path.join(ARTIFACT_DIR, `final-approved-main-menu-${vp.name}.png`));
      fs.copyFileSync(nextPath, path.join(ARTIFACT_DIR, `final-nextjs-main-menu-${vp.name}.png`));
      fs.copyFileSync(sideBySidePath, path.join(ARTIFACT_DIR, `final-side-by-side-${vp.name}.png`));
      fs.copyFileSync(diffPath, path.join(ARTIFACT_DIR, `final-diff-overlay-${vp.name}.png`));
    }

    console.log('Final Acceptance Evidence Generation Complete!');
    console.log(JSON.stringify(auditReport, null, 2));

  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

