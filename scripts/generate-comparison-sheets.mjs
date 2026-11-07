import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOT_DIR = path.resolve('frontend/public/screenshots');
const PROTO_DIR = path.resolve('frontend/public/screenshots/prototype');
const COMP_DIR = path.resolve('frontend/public/screenshots/comparisons');
const ARTIFACT_DIR = 'C:\\Users\\Asmaa\\.gemini\\antigravity\\brain\\e94a8153-a716-4f3e-a696-6459c2488ab4';

if (!fs.existsSync(COMP_DIR)) fs.mkdirSync(COMP_DIR, { recursive: true });
if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

const COMPARISONS = [
  {
    id: 'main-menu-desktop',
    title: 'Main Menu — Desktop Resolution (1920×1080)',
    status: 'MATCHED',
    statusNote: 'Layout, typography, Standard of Iron composition, ledger cards, and animated banner match prototype closely.',
    proto: path.join(PROTO_DIR, 'prototype-main-menu-desktop-1920.png'),
    next: path.join(SCREENSHOT_DIR, 'main-menu-desktop-1920.png'),
    isMobile: false,
  },
  {
    id: 'main-menu-mobile',
    title: 'Main Menu — Mobile Resolution (390×844)',
    status: 'MATCHED',
    statusNote: 'Vertical single-column layout, touch target spacing, ledger card collapse, and banner scaling align with mobile prototype.',
    proto: path.join(PROTO_DIR, 'prototype-main-menu-mobile-390.png'),
    next: path.join(SCREENSHOT_DIR, 'main-menu-mobile-390.png'),
    isMobile: true,
  },
  {
    id: 'country-selection-desktop',
    title: 'Country Selection (10 Realms) — Desktop Resolution (1920×1080)',
    status: 'MATCHED',
    statusNote: 'All 10 realms render original vector crests, selection states, mottos, and summary callout.',
    proto: path.join(PROTO_DIR, 'prototype-choose-country-desktop-1920.png'),
    next: path.join(SCREENSHOT_DIR, 'choose-country-desktop-1920.png'),
    isMobile: false,
  },
  {
    id: 'country-selection-mobile',
    title: 'Country Selection (10 Realms) — Mobile Resolution (390×844)',
    status: 'MATCHED',
    statusNote: 'Responsive 2-column grid, compact crest heights (78px), and bottom confirm actions match prototype.',
    proto: path.join(PROTO_DIR, 'prototype-choose-country-mobile-390.png'),
    next: path.join(SCREENSHOT_DIR, 'choose-country-mobile-390.png'),
    isMobile: true,
  },
  {
    id: 'world-atlas-desktop',
    title: 'World Atlas (Living Atlas) — Desktop Resolution (1920×1080)',
    status: 'NEEDS REFINEMENT',
    statusNote: 'Core vector geometry, layer tabs, coastline clip, and province inspect card match; parchment noise texture intensity and mountain range icon density have slight styling refinements.',
    proto: path.join(PROTO_DIR, 'prototype-world-atlas-desktop-1920.png'),
    next: path.join(SCREENSHOT_DIR, 'world-atlas-desktop-1920.png'),
    isMobile: false,
  },
  {
    id: 'world-atlas-mobile',
    title: 'World Atlas (Living Atlas) — Mobile Resolution (390×844)',
    status: 'NEEDS REFINEMENT',
    statusNote: 'Mobile dock navigation, drawer panel, and responsive map scale are functional; layer switcher buttons on mobile can be more compactly docked.',
    proto: path.join(PROTO_DIR, 'prototype-world-atlas-mobile-390.png'),
    next: path.join(SCREENSHOT_DIR, 'world-atlas-mobile-390.png'),
    isMobile: true,
  },
];

function toBase64(filePath) {
  if (!fs.existsSync(filePath)) return '';
  const data = fs.readFileSync(filePath);
  return `data:image/png;base64,${data.toString('base64')}`;
}

async function run() {
  console.log('Generating comparison sheets with Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  // 1. Generate individual side-by-side comparison images
  for (const item of COMPARISONS) {
    console.log(`Composing ${item.title}...`);
    const protoBase64 = toBase64(item.proto);
    const nextBase64 = toBase64(item.next);

    const statusBg = item.status === 'MATCHED' ? '#2e4c38' : item.status === 'NEEDS REFINEMENT' ? '#5a431c' : '#5a221c';
    const statusColor = item.status === 'MATCHED' ? '#7ed89f' : item.status === 'NEEDS REFINEMENT' ? '#ffd175' : '#ff8575';

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0;
    padding: 24px;
    background: #060b11;
    color: #f2e8d5;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, serif;
    box-sizing: border-box;
  }
  .header {
    margin-bottom: 20px;
    border-bottom: 1px solid rgba(216, 174, 104, 0.25);
    padding-bottom: 14px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .title {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #e8b86c;
    margin: 0 0 6px 0;
  }
  .subtitle {
    font-size: 13px;
    color: #b6ae9b;
    margin: 0;
  }
  .badge {
    padding: 6px 14px;
    border-radius: 3px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    background: ${statusBg};
    color: ${statusColor};
    border: 1px solid ${statusColor}44;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .card {
    background: #0d1520;
    border: 1px solid rgba(216, 174, 104, 0.2);
    border-radius: 4px;
    overflow: hidden;
  }
  .card-label {
    padding: 10px 16px;
    background: #111c29;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    border-bottom: 1px solid rgba(216, 174, 104, 0.15);
    display: flex;
    justify-content: space-between;
    color: #d8ae68;
  }
  .card img {
    width: 100%;
    height: auto;
    display: block;
    background: #000;
  }
  .note {
    margin-top: 14px;
    padding: 12px 16px;
    background: rgba(216, 174, 104, 0.06);
    border-left: 3px solid #d8ae68;
    font-size: 12px;
    color: #d2c8b4;
    line-height: 1.5;
  }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">${item.title}</h1>
      <p class="subtitle">REIGNWARD Visual Acceptance Review · Approved Prototype vs Next.js Implementation</p>
    </div>
    <div class="badge">${item.status}</div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-label">
        <span>APPROVED PROTOTYPE (HTML)</span>
        <span style="color:#8f8876">reignward-living-atlas.html</span>
      </div>
      <img src="${protoBase64}" alt="Approved Prototype">
    </div>

    <div class="card">
      <div class="card-label">
        <span>NEXT.JS IMPLEMENTATION</span>
        <span style="color:#8f8876">Next.js 16 Production Build</span>
      </div>
      <img src="${nextBase64}" alt="Next.js Implementation">
    </div>
  </div>

  <div class="note">
    <strong>Evaluation Notes:</strong> ${item.statusNote}
  </div>
</body>
</html>`;

    await page.setViewport({ width: item.isMobile ? 1200 : 1920, height: item.isMobile ? 1200 : 1200, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'load' });
    const contentHandle = await page.$('body');
    const box = await contentHandle.boundingBox();

    const outPath = path.join(COMP_DIR, `comparison-${item.id}.png`);
    const artifactPath = path.join(ARTIFACT_DIR, `comparison-${item.id}.png`);

    await page.screenshot({
      path: outPath,
      clip: { x: 0, y: 0, width: box.width, height: box.height },
    });
    fs.copyFileSync(outPath, artifactPath);
  }

  // 2. Generate Master Unified Comparison Sheet
  console.log('Composing Master Comparison Sheet...');
  const masterCardsHtml = COMPARISONS.map((item, idx) => {
    const protoBase64 = toBase64(item.proto);
    const nextBase64 = toBase64(item.next);
    const statusBg = item.status === 'MATCHED' ? '#2e4c38' : item.status === 'NEEDS REFINEMENT' ? '#5a431c' : '#5a221c';
    const statusColor = item.status === 'MATCHED' ? '#7ed89f' : item.status === 'NEEDS REFINEMENT' ? '#ffd175' : '#ff8575';

    return `
    <section class="section-row">
      <div class="section-header">
        <span class="section-idx">0${idx + 1}</span>
        <div class="section-meta">
          <h2>${item.title}</h2>
          <p>${item.statusNote}</p>
        </div>
        <div class="badge" style="background:${statusBg};color:${statusColor};border:1px solid ${statusColor}44;">
          ${item.status}
        </div>
      </div>
      <div class="pair-grid ${item.isMobile ? 'mobile-grid' : 'desktop-grid'}">
        <div class="screen-card">
          <div class="tag">APPROVED PROTOTYPE (HTML)</div>
          <img src="${protoBase64}" loading="lazy">
        </div>
        <div class="screen-card">
          <div class="tag" style="color:#d8ae68">NEXT.JS IMPLEMENTATION</div>
          <img src="${nextBase64}" loading="lazy">
        </div>
      </div>
    </section>
    `;
  }).join('');

  const masterHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0;
    padding: 40px;
    background: #050a0f;
    color: #f2e8d5;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, serif;
    box-sizing: border-box;
  }
  .master-masthead {
    text-align: center;
    border-bottom: 2px solid rgba(216, 174, 104, 0.3);
    padding-bottom: 28px;
    margin-bottom: 40px;
  }
  .brand {
    font-size: 14px;
    letter-spacing: 0.3em;
    color: #d8ae68;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  h1 {
    font-size: 34px;
    margin: 0 0 10px 0;
    font-weight: 700;
    color: #f2e8d5;
    letter-spacing: 0.05em;
  }
  .lead {
    font-size: 15px;
    color: #b6ae9b;
    max-width: 800px;
    margin: 0 auto;
    line-height: 1.6;
  }
  .section-row {
    background: #0b121a;
    border: 1px solid rgba(216, 174, 104, 0.22);
    border-radius: 6px;
    padding: 24px;
    margin-bottom: 36px;
  }
  .section-header {
    display: flex;
    align-items: center;
    gap: 18px;
    margin-bottom: 20px;
    border-bottom: 1px solid rgba(216, 174, 104, 0.15);
    padding-bottom: 14px;
  }
  .section-idx {
    font-size: 26px;
    font-weight: 800;
    color: #d8ae68;
    opacity: 0.8;
  }
  .section-meta {
    flex: 1;
  }
  .section-meta h2 {
    font-size: 20px;
    margin: 0 0 4px 0;
    color: #f2e8d5;
  }
  .section-meta p {
    font-size: 13px;
    color: #b6ae9b;
    margin: 0;
  }
  .badge {
    padding: 6px 14px;
    border-radius: 3px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.1em;
  }
  .pair-grid {
    display: grid;
    gap: 20px;
  }
  .desktop-grid {
    grid-template-columns: 1fr 1fr;
  }
  .mobile-grid {
    grid-template-columns: minmax(0, 480px) minmax(0, 480px);
    justify-content: center;
  }
  .screen-card {
    background: #080d14;
    border: 1px solid rgba(216, 174, 104, 0.15);
    border-radius: 4px;
    overflow: hidden;
  }
  .tag {
    background: #0f1822;
    padding: 8px 14px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #a49e8d;
    border-bottom: 1px solid rgba(216, 174, 104, 0.1);
  }
  .screen-card img {
    width: 100%;
    height: auto;
    display: block;
    background: #000;
  }
  .footer {
    text-align: center;
    padding: 30px 0 10px;
    font-size: 12px;
    color: #7d7768;
    border-top: 1px solid rgba(216, 174, 104, 0.2);
  }
</style>
</head>
<body>
  <header class="master-masthead">
    <div class="brand">✦ REIGNWARD VISUAL ACCEPTANCE SHEET ✦</div>
    <h1>Approved HTML Prototype vs Next.js Implementation</h1>
    <p class="lead">
      Direct side-by-side comparative inspection across Main Menu, Country Selection (10 Realms), and World Atlas (Living Atlas) at Desktop (1920×1080) and Mobile (390×844) viewport resolutions.
    </p>
  </header>

  ${masterCardsHtml}

  <footer class="footer">
    REIGNWARD Living Atlas · Phase 6.5 Visual Acceptance Audit · Awaiting Director Review
  </footer>
</body>
</html>`;

  await page.setViewport({ width: 2200, height: 1200, deviceScaleFactor: 1 });
  await page.setContent(masterHtml, { waitUntil: 'load' });
  const masterHandle = await page.$('body');
  const masterBox = await masterHandle.boundingBox();

  const masterOut = path.join(SCREENSHOT_DIR, 'reignward-comparison-sheet.png');
  const masterArtifact = path.join(ARTIFACT_DIR, 'reignward-comparison-sheet.png');

  await page.screenshot({
    path: masterOut,
    clip: { x: 0, y: 0, width: masterBox.width, height: masterBox.height },
  });
  fs.copyFileSync(masterOut, masterArtifact);

  await browser.close();
  console.log('Master comparison sheet created successfully at: ' + masterOut);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

