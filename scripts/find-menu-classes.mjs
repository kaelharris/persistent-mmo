import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import fs from 'fs';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function checkMenuStyles() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  try {
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/menu', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));

    // Get all classes present inside #main-menu
    const classes = await page.evaluate(() => {
      const menu = document.getElementById('main-menu');
      if (!menu) return [];
      const els = [menu, ...menu.querySelectorAll('*')];
      const classSet = new Set();
      for (const el of els) {
        for (const c of el.classList) classSet.add(c);
      }
      return Array.from(classSet);
    });

    console.log('Classes present inside #main-menu:', classes);

  } finally {
    await browser.close();
  }
}

checkMenuStyles().catch(console.error);

