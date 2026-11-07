import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--allow-file-access-from-files'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('file:///C:/Users/Asmaa/Downloads/reignward-living-atlas.html', { waitUntil: 'load' });
  await page.evaluate(() => {
    if (window.ensureDemoProfile) window.ensureDemoProfile();
    if (window.showMainMenu) window.showMainMenu();
  });

  const styles = await page.evaluate(() => {
    const get = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const c = window.getComputedStyle(el);
      return {
        fontFamily: c.fontFamily,
        fontSize: c.fontSize,
        fontWeight: c.fontWeight,
        lineHeight: c.lineHeight,
        letterSpacing: c.letterSpacing,
        color: c.color,
        backgroundColor: c.backgroundColor,
        padding: c.padding,
        margin: c.margin,
        border: c.border,
        boxShadow: c.boxShadow,
        width: c.width,
        height: c.height,
        gap: c.gap,
      };
    };
    return {
      mainMenu: get('#main-menu'),
      mainMenuInner: get('.main-menu-inner'),
      menuLeft: get('.menu-left'),
      masthead: get('.menu-masthead'),
      title: get('.main-menu-title'),
      lead: get('.main-menu-lead'),
      buttons: get('.menu-buttons'),
      optionPrimary: get('.menu-option.primary'),
      optionRegular: get('.menu-option:not(.primary)'),
      optionLabel: get('.menu-option.primary .menu-label strong'),
      optionSub: get('.menu-option.primary .menu-label small'),
      optionNumber: get('.menu-option.primary .menu-number'),
      optionChip: get('.menu-option.primary .menu-chip'),
      shortcuts: get('.menu-shortcuts'),
      footnote: get('.menu-footnote'),
      menuRight: get('.menu-right'),
      standard: get('.menu-standard'),
      standardImg: get('.menu-standard img'),
      campaign: get('.menu-campaign'),
      campaignSub: get('.menu-campaign-sub'),
      ledger: get('.menu-ledger'),
      ledgerCard: get('.menu-ledger-card'),
      gateTop: get('.gate-top'),
      gateWordmark: get('.gate-wordmark'),
      gateTopNote: get('.gate-top-note'),
    };
  });

  console.log(JSON.stringify(styles, null, 2));
  await browser.close();
}

run().catch(console.error);

