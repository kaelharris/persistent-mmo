import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const NEXTJS_URL = 'http://localhost:3000/world';

async function checkNext() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to origin first to set localStorage
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

    // Now go to /world
    console.log('Navigating to /world...');
    await page.goto(NEXTJS_URL, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    // Open Main Menu
    console.log('Opening menu in Next.js...');
    const menuOpened = await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label="Open main menu"]');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log('Menu button clicked:', menuOpened);
    await new Promise(r => setTimeout(r, 1000));

    // Check menu state
    const state = await page.evaluate(() => {
      const menu = document.getElementById('main-menu');
      const title = document.querySelector('.main-menu-title');
      const options = Array.from(document.querySelectorAll('[data-menu]'));
      return {
        menuFound: !!menu,
        menuClasses: menu?.className,
        title: title?.textContent,
        optionsCount: options.length,
        labels: options.map(b => b.querySelector('strong')?.textContent),
      };
    });
    console.log('Next.js Menu State:', state);

  } finally {
    await browser.close();
  }
}

checkNext().catch(console.error);
