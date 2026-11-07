import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import fs from 'fs';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ROUTES = ['/world', '/military', '/economy', '/character', '/kingdom'];

async function checkRoutes() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Seed session
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem('mmo_auth_session', 'local_player');
      localStorage.setItem('mmo_player_characters', JSON.stringify([{
        id: 'char-1',
        profile_id: 'local_player',
        name: 'Warden Kael',
        kingdom_id: 1,
        origin: 'Qurtuba',
        onboarding_completed: true,
        level: 1,
      }]));
      localStorage.setItem('reignward_player_profile', JSON.stringify({
        name: 'Warden Kael',
        homeland: 'Qurtuba',
        alliance: 'qurtuba',
        guest: false,
      }));
    });

    const routeAudits = {};

    for (const route of ROUTES) {
      console.log(`Checking ${route}...`);
      await page.goto(`http://localhost:3000${route}`, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 1200));

      const styles = await page.evaluate((r) => {
        const bodyStyle = window.getComputedStyle(document.body);
        const h1 = document.querySelector('h1');
        const h1Style = h1 ? window.getComputedStyle(h1) : null;
        const btn = document.querySelector('button');
        const btnStyle = btn ? window.getComputedStyle(btn) : null;
        const main = document.querySelector('main');
        const mainStyle = main ? window.getComputedStyle(main) : null;

        return {
          route: r,
          bodyBg: bodyStyle.backgroundColor,
          bodyFont: bodyStyle.fontFamily,
          h1Font: h1Style?.fontFamily,
          h1Color: h1Style?.color,
          btnFont: btnStyle?.fontFamily,
          btnBg: btnStyle?.backgroundColor,
          hasMain: !!main,
          mainDisplay: mainStyle?.display,
        };
      }, route);

      routeAudits[route] = styles;
    }

    console.log('Route Styles Audit Result:');
    console.log(JSON.stringify(routeAudits, null, 2));

  } finally {
    await browser.close();
  }
}

checkRoutes().catch(console.error);

