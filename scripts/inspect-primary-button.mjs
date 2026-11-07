import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import fs from 'fs';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PROTOTYPE_FILE = 'C:\\Users\\Asmaa\\Downloads\\reignward-living-atlas.html';
const NEXTJS_URL = 'http://localhost:3000/menu';

async function compareButtonStyles() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--allow-file-access-from-files'],
  });

  try {
    const pageProto = await browser.newPage();
    await pageProto.setViewport({ width: 1920, height: 1080 });
    await pageProto.goto(`file://${PROTOTYPE_FILE.replace(/\\/g, '/')}`, { waitUntil: 'load' });
    await pageProto.evaluate(() => {
      const prof = { name: 'Warden Kael', homeland: 'Qurtuba', alliance: 'qurtuba', guest: false };
      try { localStorage.setItem('reignward_player_profile', JSON.stringify(prof)); } catch {}
      const btn = document.querySelector('button[data-preview="menu"]');
      if (btn) btn.click();
      const sw = document.getElementById('preview-switcher');
      if (sw) sw.style.display = 'none';
    });
    await new Promise(r => setTimeout(r, 1500));

    const protoButtonData = await pageProto.evaluate(() => {
      const btn = document.querySelector('.menu-option.primary');
      if (!btn) return { error: 'No primary button in prototype' };
      const comp = window.getComputedStyle(btn);
      const num = btn.querySelector('.menu-number');
      const strong = btn.querySelector('strong');
      const small = btn.querySelector('small');
      const chip = btn.querySelector('.menu-chip');
      const arrow = btn.querySelector('.menu-arrow');
      const rect = btn.getBoundingClientRect();

      return {
        rect: { width: rect.width, height: rect.height, x: rect.x, y: rect.y },
        display: comp.display,
        gridTemplateColumns: comp.gridTemplateColumns,
        gap: comp.gap,
        padding: comp.padding,
        background: comp.background,
        backgroundImage: comp.backgroundImage,
        backgroundColor: comp.backgroundColor,
        border: comp.border,
        borderColor: comp.borderColor,
        borderWidth: comp.borderWidth,
        borderRadius: comp.borderRadius,
        boxShadow: comp.boxShadow,
        color: comp.color,
        fontFamily: comp.fontFamily,
        num: {
          font: window.getComputedStyle(num).font,
          color: window.getComputedStyle(num).color,
          bg: window.getComputedStyle(num).backgroundColor,
          border: window.getComputedStyle(num).border,
        },
        strong: {
          font: window.getComputedStyle(strong).font,
          color: window.getComputedStyle(strong).color,
        },
        small: {
          font: window.getComputedStyle(small).font,
          color: window.getComputedStyle(small).color,
        },
        chip: {
          font: window.getComputedStyle(chip).font,
          color: window.getComputedStyle(chip).color,
          bg: window.getComputedStyle(chip).backgroundColor,
          border: window.getComputedStyle(chip).border,
        },
        arrow: {
          font: window.getComputedStyle(arrow).font,
          color: window.getComputedStyle(arrow).color,
        }
      };
    });

    const pageNext = await browser.newPage();
    await pageNext.setViewport({ width: 1920, height: 1080 });
    await pageNext.goto(NEXTJS_URL, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));

    const nextButtonData = await pageNext.evaluate(() => {
      const btn = document.querySelector('.menu-option.primary');
      if (!btn) return { error: 'No primary button in Next.js' };
      const comp = window.getComputedStyle(btn);
      const num = btn.querySelector('.menu-number');
      const strong = btn.querySelector('strong');
      const small = btn.querySelector('small');
      const chip = btn.querySelector('.menu-chip');
      const arrow = btn.querySelector('.menu-arrow');
      const rect = btn.getBoundingClientRect();

      return {
        rect: { width: rect.width, height: rect.height, x: rect.x, y: rect.y },
        display: comp.display,
        gridTemplateColumns: comp.gridTemplateColumns,
        gap: comp.gap,
        padding: comp.padding,
        background: comp.background,
        backgroundImage: comp.backgroundImage,
        backgroundColor: comp.backgroundColor,
        border: comp.border,
        borderColor: comp.borderColor,
        borderWidth: comp.borderWidth,
        borderRadius: comp.borderRadius,
        boxShadow: comp.boxShadow,
        color: comp.color,
        fontFamily: comp.fontFamily,
        num: {
          font: window.getComputedStyle(num).font,
          color: window.getComputedStyle(num).color,
          bg: window.getComputedStyle(num).backgroundColor,
          border: window.getComputedStyle(num).border,
        },
        strong: {
          font: window.getComputedStyle(strong).font,
          color: window.getComputedStyle(strong).color,
        },
        small: {
          font: window.getComputedStyle(small).font,
          color: window.getComputedStyle(small).color,
        },
        chip: {
          font: window.getComputedStyle(chip).font,
          color: window.getComputedStyle(chip).color,
          bg: window.getComputedStyle(chip).backgroundColor,
          border: window.getComputedStyle(chip).border,
        },
        arrow: {
          font: window.getComputedStyle(arrow).font,
          color: window.getComputedStyle(arrow).color,
        }
      };
    });

    console.log('=== PROTOTYPE PRIMARY BUTTON DATA ===');
    console.log(JSON.stringify(protoButtonData, null, 2));
    console.log('\n=== NEXTJS PRIMARY BUTTON DATA ===');
    console.log(JSON.stringify(nextButtonData, null, 2));

  } finally {
    await browser.close();
  }
}

compareButtonStyles().catch(console.error);

