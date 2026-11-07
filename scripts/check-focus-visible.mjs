import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';

async function checkFocusVisible() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--allow-file-access-from-files']
  });

  const p1 = await browser.newPage();
  await p1.goto('file:///C:/Users/Asmaa/Downloads/reignward-living-atlas.html');
  await p1.evaluate(() => {
    document.querySelector('button[data-preview="menu"]')?.click();
  });

  const p2 = await browser.newPage();
  await p2.goto('http://localhost:3000/menu');

  await new Promise(r => setTimeout(r, 1000));

  const fv1 = await p1.evaluate(() => {
    const btn = document.querySelector('[data-menu="atlas"]');
    return {
      active: document.activeElement === btn,
      matchesFocusVisible: btn.matches(':focus-visible'),
      matchesFocus: btn.matches(':focus')
    };
  });

  const fv2 = await p2.evaluate(() => {
    const btn = document.querySelector('[data-menu="atlas"]');
    return {
      active: document.activeElement === btn,
      matchesFocusVisible: btn.matches(':focus-visible'),
      matchesFocus: btn.matches(':focus')
    };
  });

  console.log('Prototype atlas focus:', fv1);
  console.log('Next.js atlas focus:', fv2);

  await browser.close();
}
checkFocusVisible();

