import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';

async function compare() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--allow-file-access-from-files']
  });

  const p1 = await browser.newPage();
  await p1.setViewport({ width: 1920, height: 1080 });
  await p1.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await p1.goto('file:///C:/Users/Asmaa/Downloads/reignward-living-atlas.html');
  await p1.evaluate(() => {
    document.querySelector('button[data-preview="menu"]')?.click();
    const sw = document.getElementById('preview-switcher');
    if (sw) sw.style.display = 'none';
  });

  const p2 = await browser.newPage();
  await p2.setViewport({ width: 1920, height: 1080 });
  await p2.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await p2.goto('http://localhost:3000/menu');

  await new Promise(r => setTimeout(r, 1200));

  const p1Data = await p1.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button[data-menu]')).map(b => {
      const r = b.getBoundingClientRect();
      const cs = window.getComputedStyle(b);
      return {
        key: b.getAttribute('data-menu'),
        text: b.innerText.trim(),
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        bg: cs.backgroundImage.substring(0, 50),
        border: cs.border,
        boxShadow: cs.boxShadow,
        transform: cs.transform,
        focused: document.activeElement === b
      };
    });
    return btns;
  });

  const p2Data = await p2.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button[data-menu]')).map(b => {
      const r = b.getBoundingClientRect();
      const cs = window.getComputedStyle(b);
      return {
        key: b.getAttribute('data-menu'),
        text: b.innerText.trim(),
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        bg: cs.backgroundImage.substring(0, 50),
        border: cs.border,
        boxShadow: cs.boxShadow,
        transform: cs.transform,
        focused: document.activeElement === b
      };
    });
    return btns;
  });

  console.log('Prototype Buttons:', p1Data);
  console.log('Next.js Buttons:', p2Data);

  await browser.close();
}
compare();
