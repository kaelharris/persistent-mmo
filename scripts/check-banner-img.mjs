import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';

async function checkBannerImg() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--allow-file-access-from-files']
  });

  const p1 = await browser.newPage();
  await p1.setViewport({ width: 1920, height: 1080 });
  await p1.goto('file:///C:/Users/Asmaa/Downloads/reignward-living-atlas.html');
  await p1.evaluate(() => {
    document.querySelector('button[data-preview="menu"]')?.click();
  });

  const p2 = await browser.newPage();
  await p2.setViewport({ width: 1920, height: 1080 });
  await p2.goto('http://localhost:3000/menu');

  await new Promise(r => setTimeout(r, 1000));

  const img1 = await p1.evaluate(() => {
    const el = document.querySelector('.menu-standard img');
    const r = el.getBoundingClientRect();
    const cs = window.getComputedStyle(el);
    return {
      src: el.src.substring(0, 80),
      rect: { x: r.x, y: r.y, w: r.width, h: r.height },
      naturalW: el.naturalWidth,
      naturalH: el.naturalHeight,
      display: cs.display,
      verticalAlign: cs.verticalAlign,
      transform: cs.transform
    };
  });

  const img2 = await p2.evaluate(() => {
    const el = document.querySelector('.menu-standard img');
    const r = el.getBoundingClientRect();
    const cs = window.getComputedStyle(el);
    return {
      src: el.src.substring(0, 80),
      rect: { x: r.x, y: r.y, w: r.width, h: r.height },
      naturalW: el.naturalWidth,
      naturalH: el.naturalHeight,
      display: cs.display,
      verticalAlign: cs.verticalAlign,
      transform: cs.transform
    };
  });

  console.log('Proto img:', img1);
  console.log('Next img:', img2);

  await browser.close();
}
checkBannerImg();

