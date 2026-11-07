import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PROTOTYPE_FILE = 'C:\\Users\\Asmaa\\Downloads\\reignward-living-atlas.html';
const NEXTJS_URL = 'http://localhost:3000/menu';

async function checkBannerSrc() {
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

    const protoImages = await pageProto.evaluate(() => {
      const standardImg = document.querySelector('.menu-standard img');
      const ledgerImgs = Array.from(document.querySelectorAll('.menu-ledger-card img'));
      return {
        standardSrcLen: standardImg?.src?.length,
        standardSrcStart: standardImg?.src?.slice(0, 60),
        standardRect: standardImg?.getBoundingClientRect(),
        ledger: ledgerImgs.map(img => ({
          srcLen: img.src.length,
          srcStart: img.src.slice(0, 60),
          rect: img.getBoundingClientRect(),
        }))
      };
    });

    const pageNext = await browser.newPage();
    await pageNext.setViewport({ width: 1920, height: 1080 });
    await pageNext.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await pageNext.goto(NEXTJS_URL, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));

    const nextImages = await pageNext.evaluate(() => {
      const standardImg = document.querySelector('.menu-standard img');
      const ledgerImgs = Array.from(document.querySelectorAll('.menu-ledger-card img'));
      return {
        standardSrcLen: standardImg?.src?.length,
        standardSrcStart: standardImg?.src?.slice(0, 60),
        standardRect: standardImg?.getBoundingClientRect(),
        ledger: ledgerImgs.map(img => ({
          srcLen: img.src.length,
          srcStart: img.src.slice(0, 60),
          rect: img.getBoundingClientRect(),
        }))
      };
    });

    console.log('Prototype Images:', JSON.stringify(protoImages, null, 2));
    console.log('Next.js Images:', JSON.stringify(nextImages, null, 2));

  } finally {
    await browser.close();
  }
}

checkBannerSrc().catch(console.error);

