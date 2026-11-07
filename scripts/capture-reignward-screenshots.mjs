import { spawn } from 'child_process';
import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 3006;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOT_DIR = path.resolve('frontend/public/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeout = 35000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 200 || res.status === 304) return true;
    } catch {
      // retry
    }
    await wait(800);
  }
  throw new Error(`Server did not respond at ${url} within ${timeout}ms`);
}

async function run() {
  console.log(`Starting Next.js production server on port ${PORT}...`);
  const server = spawn('cmd.exe', ['/c', 'npm', '--prefix', 'frontend', 'run', 'start', '--', '-p', String(PORT)], {
    stdio: 'pipe',
  });

  server.stdout.on('data', (d) => process.stdout.write(d));
  server.stderr.on('data', (d) => process.stderr.write(d));

  let browser;

  try {
    await waitForServer(BASE_URL);
    console.log(`Server is ready at ${BASE_URL}`);

    browser = await puppeteer.launch({
      executablePath: EDGE_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });

    const page = await browser.newPage();

    // 1. Welcome Screen Desktop (1920x1080)
    console.log('Capturing Welcome Screen (Desktop 1920x1080)...');
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await wait(1200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'welcome-desktop-1920.png') });

    // 2. Welcome Screen Mobile (390x844)
    console.log('Capturing Welcome Screen (Mobile 390x844)...');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
    await wait(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'welcome-mobile-390.png') });

    // 3. Character Creation (Profile) Screen Desktop
    console.log('Capturing Character Creation Screen...');
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false });
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b =>
        b.textContent.includes('Begin Thy Journey') || b.textContent.includes('Forge a New Character')
      );
      if (btn) btn.click();
    });
    await wait(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'character-creation-desktop-1920.png') });

    // 4. Choose Country (Alliance) Screen Desktop
    console.log('Capturing Choose Country Screen (Desktop)...');
    await page.evaluate(() => {
      const input = document.querySelector('input[name="name"]');
      if (input) {
        input.value = 'Kael al-Rashid';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const submitBtn = document.querySelector('#profile-form button[type="submit"]');
      if (submitBtn) submitBtn.click();
    });
    await wait(1200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'choose-country-desktop-1920.png') });

    // 5. Choose Country Mobile
    console.log('Capturing Choose Country Screen (Mobile)...');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
    await wait(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'choose-country-mobile-390.png') });

    // 6. Swear Allegiance & Loading Screen
    console.log('Capturing Loading Screen...');
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false });
    await page.evaluate(() => {
      const confirmBtn = document.querySelector('#confirm-alliance');
      if (confirmBtn) confirmBtn.click();
    });
    await wait(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'loading-screen-desktop-1920.png') });

    // Wait for transition to World Map
    console.log('Waiting for game entry...');
    await wait(2500);

    // 7. World Map Living Atlas (Desktop)
    console.log('Capturing World Map Living Atlas (Desktop)...');
    await page.goto(`${BASE_URL}/world`, { waitUntil: 'domcontentloaded' });
    await wait(2500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'world-atlas-desktop-1920.png') });

    // 8. World Map (Mobile)
    console.log('Capturing World Map Living Atlas (Mobile)...');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
    await wait(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'world-atlas-mobile-390.png') });

    // 9. Main Menu Screen (Desktop)
    console.log('Capturing Main Menu Screen (Desktop)...');
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false });
    await page.evaluate(() => {
      const menuBtn = [...document.querySelectorAll('button')].find(b => b.textContent && b.textContent.includes('Menu'));
      if (menuBtn) menuBtn.click();
    });
    await wait(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'main-menu-desktop-1920.png') });

    // 10. Main Menu Mobile
    console.log('Capturing Main Menu Screen (Mobile)...');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
    await wait(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'main-menu-mobile-390.png') });

    // 11. Returning Player Welcome Screen
    console.log('Capturing Returning Player Welcome Screen...');
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await wait(1200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'returning-welcome-desktop-1920.png') });

    console.log('All screenshots captured successfully!');
  } finally {
    if (browser) await browser.close();
    console.log('Terminating server...');
    try {
      spawn('taskkill', ['/F', '/T', '/PID', String(server.pid)]);
    } catch {}
    server.kill();
  }
}

run().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
