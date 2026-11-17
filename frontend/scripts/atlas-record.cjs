// Phase 7 acceptance recording: drives the real atlas in Edge, captures the actual
// rendered frames through the Chrome DevTools screencast, and assembles an MP4.
//   node scripts/atlas-record.cjs
// Output: public/screenshots/phase7/atlas-phase7-demo.mp4
/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const EDGE_CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
];
const EDGE = EDGE_CANDIDATES.find((p) => fs.existsSync(p));
if (!EDGE) { console.error('No Edge/Chrome found'); process.exit(1); }

const BASE = process.env.BASE || 'http://localhost:3000';
const OUT = process.env.OUT || path.join(__dirname, '../public/screenshots/phase7');
const WORK = process.env.WORK || path.join(require('os').tmpdir(), 'atlas-demo');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(WORK, { recursive: true });

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

const centreOf = (page, selector) => page.$eval(selector, (el) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
});

async function startRecording(client, dir, maxWidth, maxHeight) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const frames = [];
  let lastAt = 0;
  let index = 0;
  let pendingAck = 0;

  client.on('Page.screencastFrame', ({ data, sessionId, metadata }) => {
    pendingAck += 1;
    client.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
    const at = Date.now();
    // 25 fps ceiling keeps the frame count and encode time sane.
    if (lastAt && at - lastAt < 40) return;
    const file = path.join(dir, `frame-${String(index).padStart(5, '0')}.jpg`);
    fs.writeFileSync(file, Buffer.from(data, 'base64'));
    frames.push({ file, at, timestamp: metadata.timestamp });
    lastAt = at;
    index += 1;
  });

  await client.send('Page.startScreencast', {
    format: 'jpeg', quality: 90, maxWidth, maxHeight, everyNthFrame: 1,
  });
  return {
    frames,
    async stop() {
      await client.send('Page.stopScreencast').catch(() => {});
      await sleep(300);
      return frames;
    },
    pending: () => pendingAck,
  };
}

function writeConcat(frames, file) {
  // Give each frame the wall-clock time until the next one so still moments hold.
  const lines = ['ffconcat version 1.0'];
  frames.forEach((frame, i) => {
    const next = frames[i + 1];
    const duration = next ? Math.max(0.04, (next.at - frame.at) / 1000) : 0.9;
    lines.push(`file '${frame.file.replace(/\\/g, '/')}'`);
    lines.push(`duration ${duration.toFixed(3)}`);
  });
  const last = frames[frames.length - 1];
  lines.push(`file '${last.file.replace(/\\/g, '/')}'`);
  fs.writeFileSync(file, lines.join('\n'));
}

function encode(concatFile, output) {
  const res = spawnSync('ffmpeg', [
    '-y', '-f', 'concat', '-safe', '0', '-i', concatFile,
    '-vf', 'fps=30,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
    '-movflags', '+faststart', output,
  ], { stdio: 'inherit' });
  if (res.status !== 0) throw new Error(`ffmpeg failed: ${res.status}`);
}

async function openWorld(browser, viewport) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.evaluateOnNewDocument(seedSession);
  const errors = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  await page.goto(`${BASE}/world`, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForSelector('.atlas-shell', { timeout: 20000 });
  await page.evaluate(() => document.fonts.ready);
  await sleep(1200);
  return { page, errors };
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-device-scale-factor=1', '--hide-scrollbars'],
    defaultViewport: null,
  });

  const report = { errors: [] };
  try {
    // ---- Desktop: full Iberia, hover Qurtuba, hover Jayyan, select, actions, zoom ----
    const desktopRun = await openWorld(browser, { width: 1440, height: 900, deviceScaleFactor: 1 });
    const page = desktopRun.page;
    const client = await page.createCDPSession();
    await client.send('Page.enable');

    const desktop = await startRecording(client, path.join(WORK, 'desktop'), 1440, 900);
    // Park over open sea so the opening beat is the untouched atlas.
    await page.mouse.move(1405, 120);
    await sleep(1800);

    let point = await centreOf(page, '[data-province-marker="1"]');
    await page.mouse.move(point.x, point.y, { steps: 28 });
    await sleep(1700);
    report.qurtubaTooltip = await page.$eval('[data-atlas-tooltip]', (el) => el.textContent?.replace(/\s+/g, ' ').trim()).catch(() => null);
    report.qurtubaFlag = await page.$eval('[data-owner-flag]', (el) => el.getAttribute('data-owner-flag')).catch(() => null);
    report.qurtubaRaised = await page.$$eval('.atlas-raised-hover', (els) => els.map((el) => getComputedStyle(el).transform));
    await sleep(700);

    point = await centreOf(page, '[data-province-marker="2"]');
    await page.mouse.move(point.x, point.y, { steps: 26 });
    await sleep(1500);
    report.jayyanTooltip = await page.$eval('[data-atlas-tooltip]', (el) => el.textContent?.replace(/\s+/g, ' ').trim()).catch(() => null);
    report.jayyanFlag = await page.$eval('[data-owner-flag]', (el) => el.getAttribute('data-owner-flag')).catch(() => null);
    await sleep(500);

    await page.mouse.click(point.x, point.y);
    await sleep(1100);
    report.ledgerOpen = await page.$eval('.province-ledger', (el) => !el.hidden).catch(() => false);
    report.ledgerButtons = await page.$$eval('.province-ledger button', (els) => els.map((el) => el.textContent?.replace(/\s+/g, ' ').trim()).filter(Boolean));
    report.ledgerRect = await page.$eval('.province-ledger', (el) => {
      const r = el.getBoundingClientRect();
      return { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom) };
    });
    await sleep(1200);

    // Reveal the lower command area so the existing actions are visibly usable.
    await page.evaluate(() => {
      const scroll = document.querySelector('.province-ledger-scroll');
      if (scroll) scroll.scrollTo({ top: scroll.scrollHeight, behavior: 'smooth' });
    });
    await sleep(1600);

    const close = await page.$('.province-ledger button[aria-label="Close province panel"]');
    if (close) await close.click();
    await sleep(700);

    const zoomIn = await page.$('button[aria-label="Zoom in"]');
    for (let i = 0; i < 3; i++) { await zoomIn.click(); await sleep(340); }
    await sleep(1500);
    report.zoomValue = await page.$eval('.atlas-zoom-value', (el) => el.textContent?.trim()).catch(() => null);
    report.zoomLabelSize = await page.$eval('[data-province-label="1"] text', (el) => getComputedStyle(el).fontSize).catch(() => null);
    await sleep(900);

    // Return home so the last desktop beat is the full peninsula again.
    const reset = await page.$('button[aria-label="Reset map"]');
    if (reset) await reset.click();
    await sleep(1600);

    const desktopFrames = await desktop.stop();
    report.desktopFrames = desktopFrames.length;
    report.desktopErrors = desktopRun.errors;
    await page.close();

    // ---- Mobile: full map, tap Qurtuba, elevated shape + flag + ledger card ----
    const mobileRun = await openWorld(browser, { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const mobile = mobileRun.page;
    const mobileClient = await mobile.createCDPSession();
    await mobileClient.send('Page.enable');
    const mobileRec = await startRecording(mobileClient, path.join(WORK, 'mobile'), 780, 1688);
    await sleep(1600);

    const mobilePoint = await centreOf(mobile, '[data-province-marker="1"]');
    await mobile.touchscreen.tap(mobilePoint.x, mobilePoint.y);
    await sleep(1800);
    report.mobileLedgerOpen = await mobile.$eval('.province-ledger', (el) => !el.hidden).catch(() => false);
    report.mobileFlag = await mobile.$eval('[data-owner-flag]', (el) => el.getAttribute('data-owner-flag')).catch(() => null);
    report.mobileRaised = await mobile.$$eval('.atlas-raised-selected', (els) => els.map((el) => getComputedStyle(el).transform));
    report.mobileLayout = await mobile.evaluate(() => {
      const ledger = document.querySelector('.province-ledger')?.getBoundingClientRect();
      const flag = document.querySelector('[data-owner-flag]')?.getBoundingClientRect();
      return {
        ledger: ledger ? { top: Math.round(ledger.top), bottom: Math.round(ledger.bottom), height: Math.round(ledger.height) } : null,
        flagTop: flag ? Math.round(flag.top) : null,
      };
    });
    await sleep(1500);

    // Pan with a touch drag: the sheet must survive the gesture.
    const startX = 195;
    const startY = 250;
    await mobile.touchscreen.touchStart(startX, startY);
    for (let i = 1; i <= 12; i++) {
      await mobile.touchscreen.touchMove(startX - i * 4, startY + i * 2);
      await sleep(24);
    }
    await mobile.touchscreen.touchEnd();
    await sleep(1200);
    report.mobileAfterPan = await mobile.$eval('.province-ledger', (el) => !el.hidden).catch(() => false);

    const mobileFrames = await mobileRec.stop();
    report.mobileFrames = mobileFrames.length;
    report.mobileErrors = mobileRun.errors;
    await mobile.close();

    // ---- Assemble a single 1440x900 demo ----
    const desktopConcat = path.join(WORK, 'desktop.ffconcat');
    const mobileConcat = path.join(WORK, 'mobile.ffconcat');
    writeConcat(desktopFrames, desktopConcat);
    writeConcat(mobileFrames, mobileConcat);

    const desktopMp4 = path.join(WORK, 'desktop.mp4');
    encode(desktopConcat, desktopMp4);

    // Pad the portrait phone capture onto the same 1440x900 canvas.
    const mobileMp4 = path.join(WORK, 'mobile.mp4');
    const mobileRaw = path.join(WORK, 'mobile-raw.mp4');
    encode(mobileConcat, mobileRaw);
    const pad = spawnSync('ffmpeg', [
      '-y', '-i', mobileRaw,
      '-vf', 'scale=-2:900,pad=1440:900:(ow-iw)/2:0:color=0x0A1019,fps=30,format=yuv420p',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-movflags', '+faststart', mobileMp4,
    ], { stdio: 'inherit' });
    if (pad.status !== 0) throw new Error('mobile pad failed');

    const listFile = path.join(WORK, 'all.txt');
    fs.writeFileSync(listFile, [
      `file '${desktopMp4.replace(/\\/g, '/')}'`,
      `file '${mobileMp4.replace(/\\/g, '/')}'`,
    ].join('\n'));
    const finalFile = path.join(OUT, 'atlas-phase7-demo.mp4');
    const concat = spawnSync('ffmpeg', [
      '-y', '-f', 'concat', '-safe', '0', '-i', listFile,
      '-c', 'copy', '-movflags', '+faststart', finalFile,
    ], { stdio: 'inherit' });
    if (concat.status !== 0) throw new Error('final concat failed');

    report.video = finalFile;
    report.videoBytes = fs.statSync(finalFile).size;
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(report, null, 2));
})();
