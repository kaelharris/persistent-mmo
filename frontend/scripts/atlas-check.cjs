// Visual + interaction validation for the Phase 7 modular atlas.
// Runs against the dev server, seeds the mock session, and writes evidence shots.
/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
];
const EDGE = EDGE_CANDIDATES.find((p) => fs.existsSync(p));
if (!EDGE) { console.error('No Edge/Chrome found'); process.exit(1); }

const BASE = process.env.BASE || 'http://localhost:3000';
const OUT = process.env.OUT || path.join(__dirname, '../public/screenshots/phase7');
fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function seedSession() {
  localStorage.clear();
  localStorage.setItem('mmo_auth_users', JSON.stringify([{ id: 'admin', email: 'admin@test.persistentmmo.dev', username: 'Aldric', passwordHash: 'AdminTest123!' }]));
  localStorage.setItem('mmo_auth_session', 'admin');
  localStorage.setItem('mmo_tutorial_step', '6');
  localStorage.setItem('mmo_tutorial_completed', 'true');
  localStorage.setItem('aegis_world_tutorial_seen', '1');
  localStorage.setItem('mmo_player_characters', JSON.stringify([{
    id: 'char-atlas', profile_id: 'admin', name: 'Aldric', epithet: 'the Bold', kingdom_id: 1,
    profession: 'farmer', profession_rank: 2, origin: 'Born beneath the Caliphal walls',
    motto: 'By hearth and sword', banner_seed: 451, onboarding_completed: true,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }]));
}

async function openWorld(browser, viewport) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.evaluateOnNewDocument(seedSession);
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`console: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('requestfailed', (req) => errors.push(`requestfailed: ${req.url()} ${req.failure()?.errorText || ''}`));
  await page.goto(`${BASE}/world`, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForSelector('.atlas-shell', { timeout: 20000 });
  await page.evaluate(() => document.fonts.ready);
  await sleep(900);
  return { page, errors };
}

async function centreOf(page, selector) {
  return page.$eval(selector, (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
}

async function textOf(page, selector) {
  return page.$eval(selector, (el) => el.textContent?.replace(/\s+/g, ' ').trim()).catch(() => null);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-device-scale-factor=1'],
    defaultViewport: null,
  });
  const report = {};

  try {
    const { page, errors } = await openWorld(browser, { width: 1440, height: 900, deviceScaleFactor: 1 });
    report.errors = errors;

    report.hitPaths = await page.$$eval('[data-province-id]', (els) => els.map((el) => Number(el.getAttribute('data-province-id'))));
    report.labels = await page.$$eval('[data-province-label]', (els) => els.length);
    report.markers = await page.$$eval('[data-province-marker]', (els) => els.length);
    await page.screenshot({ path: path.join(OUT, 'atlas-desktop-default.png') });

    let point = await centreOf(page, '[data-province-marker="1"]');
    await page.mouse.move(point.x, point.y);
    await sleep(400);
    report.qurtubaTooltip = await textOf(page, '[data-atlas-tooltip]');
    report.qurtubaFlag = await page.$eval('[data-owner-flag]', (el) => el.getAttribute('data-owner-flag')).catch(() => null);
    report.qurtubaRaised = await page.$$eval('.atlas-raised-selected, .atlas-raised-hover', (els) => els.map((el) => getComputedStyle(el).transform));
    await page.screenshot({ path: path.join(OUT, 'atlas-desktop-hover-qurtuba.png') });

    point = await centreOf(page, '[data-province-marker="2"]');
    await page.mouse.move(point.x, point.y, { steps: 12 });
    await sleep(400);
    report.jayyanTooltip = await textOf(page, '[data-atlas-tooltip]');
    report.jayyanFlag = await page.$eval('[data-owner-flag]', (el) => el.getAttribute('data-owner-flag')).catch(() => null);
    await page.screenshot({ path: path.join(OUT, 'atlas-desktop-hover-jayyan.png') });

    await page.mouse.click(point.x, point.y);
    await sleep(500);
    report.ledgerOpen = await page.$eval('.province-ledger', (el) => !el.hidden).catch(() => false);
    report.ledgerText = (await textOf(page, '.province-ledger'))?.slice(0, 420);
    report.ledgerButtons = await page.$$eval('.province-ledger button', (els) => els.map((el) => el.textContent?.replace(/\s+/g, ' ').trim()).filter(Boolean));
    report.tooltipClearedOnSelect = (await page.$('[data-atlas-tooltip]')) === null;
    report.ledgerRect = await page.$eval('.province-ledger', (el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom), position: cs.position, cssRight: cs.right };
    });
    await page.screenshot({ path: path.join(OUT, 'atlas-desktop-selected-jayyan.png') });

    const layers = ['geography', 'economy', 'warfare', 'political'];
    for (const layer of layers) {
      await page.click(`.atlas-layerbtn[role="tab"]:nth-of-type(${layers.indexOf(layer) + 2})`).catch(async () => {
        const tabs = await page.$$('.atlas-layerbtn');
        const labels = await Promise.all(tabs.map((t) => t.evaluate((n) => n.textContent?.trim())));
        const index = labels.findIndex((l) => l?.toLowerCase().includes(layer === 'geography' ? 'geographic' : layer === 'economy' ? 'economic' : layer));
        if (index >= 0) await tabs[index].click();
      });
      await sleep(350);
      await page.screenshot({ path: path.join(OUT, `atlas-desktop-layer-${layer}.png`) });
    }

    // Close the ledger, then zoom with the visible controls.
    await page.keyboard.press('Escape').catch(() => {});
    const close = await page.$('.province-ledger button[aria-label="Close province panel"]');
    if (close) await close.click();
    await sleep(250);
    const zoomIn = await page.$('button[aria-label="Zoom in"]');
    for (let i = 0; i < 3; i++) { await zoomIn.click(); await sleep(160); }
    await sleep(400);
    report.zoomValue = await textOf(page, '.atlas-zoom-value');
    report.zoomLabelSize = await page.$eval('[data-province-label="1"] text', (el) => getComputedStyle(el).fontSize).catch(() => null);
    await page.screenshot({ path: path.join(OUT, 'atlas-desktop-zoom-160.png') });
    report.desktopErrors = errors;
    await page.close();

    const mobileRun = await openWorld(browser, { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const mobile = mobileRun.page;
    await mobile.screenshot({ path: path.join(OUT, 'atlas-mobile-default.png') });
    const mobilePoint = await centreOf(mobile, '[data-province-marker="1"]');
    await mobile.touchscreen.tap(mobilePoint.x, mobilePoint.y);
    await sleep(700);
    report.mobileLedgerOpen = await mobile.$eval('.province-ledger', (el) => !el.hidden).catch(() => false);
    report.mobileLedgerText = (await textOf(mobile, '.province-ledger'))?.slice(0, 320);
    report.mobileFlag = await mobile.$eval('[data-owner-flag]', (el) => el.getAttribute('data-owner-flag')).catch(() => null);
    report.mobileRaised = await mobile.$$eval('.atlas-raised-selected', (els) => els.map((el) => getComputedStyle(el).transform));
    report.mobileLayout = await mobile.evaluate(() => {
      const ledger = document.querySelector('.province-ledger')?.getBoundingClientRect();
      const flag = document.querySelector('[data-owner-flag]')?.getBoundingClientRect();
      const marker = document.querySelector('[data-province-marker="1"]')?.getBoundingClientRect();
      const cs = document.querySelector('.province-ledger') ? getComputedStyle(document.querySelector('.province-ledger')) : null;
      return {
        ledger: ledger ? { top: Math.round(ledger.top), bottom: Math.round(ledger.bottom), height: Math.round(ledger.height) } : null,
        flagTop: flag ? Math.round(flag.top) : null,
        markerTop: marker ? Math.round(marker.top) : null,
        maxHeight: cs?.maxHeight || null,
      };
    });
    await mobile.screenshot({ path: path.join(OUT, 'atlas-mobile-selected-qurtuba.png') });
    report.mobileErrors = mobileRun.errors;
    await mobile.close();
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(report, null, 2));
})();
