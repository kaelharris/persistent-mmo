import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';

async function testAtlasState() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--allow-file-access-from-files']
  });

  const p1 = await browser.newPage();
  await p1.goto('file:///C:/Users/Asmaa/Downloads/reignward-living-atlas.html');
  const res1 = await p1.evaluate(() => {
    // Call showMainMenu() directly as the prototype does
    window.showMainMenu();
    const btn = document.querySelector('[data-menu="atlas"]');
    const cs = window.getComputedStyle(btn);
    return {
      active: document.activeElement === btn,
      focusVisible: btn.matches(':focus-visible'),
      transform: cs.transform,
      borderColor: cs.borderColor,
      bg: cs.backgroundImage
    };
  });

  console.log('Prototype showMainMenu direct result:', res1);
  await browser.close();
}
testAtlasState();

