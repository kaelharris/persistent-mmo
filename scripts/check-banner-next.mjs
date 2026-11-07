import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const NEXTJS_URL = 'http://localhost:3000/menu';

async function checkBannerNext() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  try {
    const pageNext = await browser.newPage();
    await pageNext.setViewport({ width: 1920, height: 1080 });
    await pageNext.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await pageNext.goto(NEXTJS_URL, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));

    const bannerInfo = await pageNext.evaluate(() => {
      const img = document.querySelector('.menu-standard img');
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      return {
        prefersReduced,
        srcLen: img?.src?.length,
        hasWindFilter: img?.src ? atob(img.src.split(',')[1]).includes('reignward-wind') : false,
      };
    });

    console.log('Banner Info in Next.js with reduced motion:', bannerInfo);

  } finally {
    await browser.close();
  }
}

checkBannerNext().catch(console.error);

