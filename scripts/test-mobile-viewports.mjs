import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import fs from 'fs';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PROTOTYPE_FILE = 'C:\\Users\\Asmaa\\Downloads\\reignward-living-atlas.html';
const NEXTJS_URL = 'http://localhost:3000/menu';

const MOBILE_VIEWPORTS = [
  { name: '390x844', width: 390, height: 844 },
  { name: '360x800', width: 360, height: 800 },
  { name: '430x932', width: 430, height: 932 },
];

async function verifyMobile() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--allow-file-access-from-files'],
  });

  const report = {};

  try {
    for (const vp of MOBILE_VIEWPORTS) {
      console.log(`Checking Mobile ${vp.name}...`);
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2, isMobile: true });
      await page.goto(NEXTJS_URL, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 1000));

      const audit = await page.evaluate(() => {
        const menu = document.getElementById('main-menu');
        const buttons = Array.from(document.querySelectorAll('[data-menu]'));
        const banner = document.querySelector('.menu-standard img');
        const cards = Array.from(document.querySelectorAll('.menu-ledger-card'));

        const docWidth = document.documentElement.scrollWidth;
        const bodyWidth = document.body.scrollWidth;
        const menuScrollWidth = menu?.scrollWidth;
        const menuClientWidth = menu?.clientWidth;

        return {
          buttonCount: buttons.length,
          allButtonsVisible: buttons.every(b => b.offsetWidth > 0 && b.offsetHeight > 0),
          buttonLabels: buttons.map(b => b.querySelector('strong')?.textContent),
          bannerFound: !!banner,
          bannerHeight: banner?.getBoundingClientRect().height,
          cardCount: cards.length,
          menuScrollHeight: menu?.scrollHeight,
          menuClientHeight: menu?.clientHeight,
          canScroll: (menu?.scrollHeight || 0) > (menu?.clientHeight || 0),
          horizontalOverflow: (menuScrollWidth || 0) > (menuClientWidth || 0),
          docScrollWidth: docWidth,
          clientWidth: window.innerWidth,
        };
      });

      // Capture initial view and scrolled view
      const initialPath = `frontend/public/screenshots/main-menu-review/mobile-${vp.name}-initial.png`;
      await page.screenshot({ path: initialPath });

      // Scroll to bottom to view banner and ledger
      await page.evaluate(() => {
        const menu = document.getElementById('main-menu');
        if (menu) menu.scrollTop = menu.scrollHeight;
      });
      await new Promise(r => setTimeout(r, 600));

      const scrolledPath = `frontend/public/screenshots/main-menu-review/mobile-${vp.name}-scrolled.png`;
      await page.screenshot({ path: scrolledPath });

      report[vp.name] = { audit, initialPath, scrolledPath };
      await page.close();
    }

    console.log('Mobile Verification Results:');
    console.log(JSON.stringify(report, null, 2));

  } finally {
    await browser.close();
  }
}

verifyMobile().catch(console.error);

