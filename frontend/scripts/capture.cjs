// Capture real screenshots from the running dev server (localhost:3000)
// Uses Edge via puppeteer-core so localStorage session can be seeded before navigation.
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
];
const EDGE = EDGE_CANDIDATES.find((p) => fs.existsSync(p));
if (!EDGE) { console.error('No Edge/Chrome found'); process.exit(1); }

const BASE = process.env.BASE || 'http://localhost:3000';
const OUT = process.env.OUT || path.join(__dirname, '../public/screenshots');
fs.mkdirSync(OUT, { recursive: true });

async function launch(width, height) {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', `--window-size=${width},${height}`],
  });
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  // Seed mock session + completed onboarding so /world renders without redirect
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('mmo_auth_users', JSON.stringify([{ id: 'admin', email: 'admin@test.persistentmmo.dev', username: 'Aldric', passwordHash: 'AdminTest123!' }]));
    localStorage.setItem('mmo_auth_session', 'admin');
    localStorage.setItem('mmo_tutorial_step', '6');
    localStorage.setItem('mmo_tutorial_completed', 'true');
    localStorage.setItem('aegis_world_tutorial_seen', '1');
    const char = { id: 'char-screen', profile_id: 'admin', name: 'Aldric', epithet: 'the Bold', kingdom_id: 1, profession: 'farmer', profession_rank: 2, origin: 'Born beneath the Capital walls', motto: 'By hearth and sword', banner_seed: 451, onboarding_completed: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    localStorage.setItem('mmo_player_characters', JSON.stringify([char]));
  });
  return { browser, page };
}

async function shot(name, url, width, height, waitText) {
  const { browser, page } = await launch(width, height);
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    if (waitText) await page.waitForFunction((t) => document.body.innerText.includes(t), { timeout: 15000 }, waitText);
    await new Promise((r) => setTimeout(r, 1200));
    const file = path.join(OUT, name);
    await page.screenshot({ path: file, fullPage: false });
    console.log('saved', file);
    return file;
  } finally {
    await browser.close();
  }
}

(async () => {
  await shot('world-desktop-1440.png', `${BASE}/world`, 1440, 900, 'AL-ANDALUS');
  await shot('marketplace-desktop-1440.png', `${BASE}/marketplace`, 1440, 900, 'Marketplace');
  await shot('military-desktop-1440.png', `${BASE}/military`, 1440, 900, 'The Military');
  await shot('kingdom-desktop-1440.png', `${BASE}/kingdom`, 1440, 900, 'Kingdom');
  await shot('dynasty-desktop-1440.png', `${BASE}/dynasty`, 1440, 900, 'Dynasty');
  await shot('character-desktop-1440.png', `${BASE}/character`, 1440, 900, 'Aldric');
  await shot('economy-desktop-1440.png', `${BASE}/economy`, 1440, 900, 'The Economy');
  await shot('world-mobile-390.png', `${BASE}/world`, 390, 844, 'AL-ANDALUS');
  await shot('marketplace-mobile-390.png', `${BASE}/marketplace`, 390, 844, 'Marketplace');
  await shot('world-warfare-layer-desktop-1440.png', `${BASE}/world`, 1440, 900, 'AL-ANDALUS');
})();

