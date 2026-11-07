import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PROTOTYPE_FILE = 'C:\\Users\\Asmaa\\Downloads\\reignward-living-atlas (9).html';
const OUTPUT_DIR = path.resolve('frontend/public/screenshots/prototype');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('Launching browser to capture Approved HTML Prototype screenshots...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--allow-file-access-from-files'],
  });

  const fileUrl = `file://${PROTOTYPE_FILE.replace(/\\/g, '/')}`;

  try {
    const page = await browser.newPage();

    // 1. Prototype - Main Menu Desktop (1920x1080)
    console.log('Capturing Prototype Main Menu Desktop (1920x1080)...');
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
    await page.goto(fileUrl, { waitUntil: 'load' });
    await wait(1000);
    await page.evaluate(() => {
      if (typeof window.ensureDemoProfile === 'function') window.ensureDemoProfile();
      if (typeof window.showMainMenu === 'function') window.showMainMenu();
    });
    await wait(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'prototype-main-menu-desktop-1920.png') });

    // 2. Prototype - Main Menu Mobile (390x844)
    console.log('Capturing Prototype Main Menu Mobile (390x844)...');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
    await wait(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'prototype-main-menu-mobile-390.png') });

    // 3. Prototype - Country Selection (Alliance) Desktop (1920x1080)
    console.log('Capturing Prototype Country Selection Desktop (1920x1080)...');
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false });
    await page.evaluate(() => {
      if (typeof window.renderGateway === 'function') window.renderGateway('alliance');
    });
    await wait(1200);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'prototype-choose-country-desktop-1920.png') });

    // 4. Prototype - Country Selection (Alliance) Mobile (390x844)
    console.log('Capturing Prototype Country Selection Mobile (390x844)...');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
    await wait(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'prototype-choose-country-mobile-390.png') });

    // 5. Prototype - World Atlas Desktop (1920x1080)
    console.log('Capturing Prototype World Atlas Desktop (1920x1080)...');
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false });
    await page.evaluate(() => {
      const gateway = document.getElementById('gateway');
      const mainMenu = document.getElementById('main-menu');
      if (gateway) gateway.classList.add('hidden');
      if (mainMenu) mainMenu.classList.add('hidden');
      if (typeof window.stopLoading === 'function') window.stopLoading();
      if (typeof window.closeScene === 'function') window.closeScene();
    });
    await wait(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'prototype-world-atlas-desktop-1920.png') });

    // 6. Prototype - World Atlas Mobile (390x844)
    console.log('Capturing Prototype World Atlas Mobile (390x844)...');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
    await wait(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'prototype-world-atlas-mobile-390.png') });

    console.log('All prototype screenshots captured successfully!');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

