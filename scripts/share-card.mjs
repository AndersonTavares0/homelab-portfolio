// Renders the social share card from the site's own design tokens.
// Run: node scripts/share-card.mjs — writes public/og.png (1200×630).
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const font = readFileSync(resolve(root, 'node_modules/@fontsource-variable/public-sans/files/public-sans-latin-wght-normal.woff2')).toString('base64');

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @font-face { font-family: 'Public Sans'; font-weight: 100 900; src: url(data:font/woff2;base64,${font}) format('woff2'); }
  * { box-sizing: border-box; }
  body { margin: 0; width: 1200px; height: 630px; background: #f4f6f5; color: #152129;
    font-family: 'Public Sans', sans-serif; padding: 72px 80px; display: flex; flex-direction: column; justify-content: space-between; }
  .top { display: flex; justify-content: space-between; align-items: baseline; font-size: 22px; color: #4a6069; }
  .top strong { color: #152129; font-size: 26px; letter-spacing: -.02em; }
  h1 { margin: 0; font-size: 92px; line-height: .98; letter-spacing: -.045em; max-width: 900px; }
  p { margin: 28px 0 0; font-size: 26px; line-height: 1.4; color: #344850; max-width: 820px; }
  .bottom { display: flex; gap: 40px; font-size: 20px; color: #4a6069; border-top: 1px solid #cbd5d9; padding-top: 22px; }
  .dot { color: #2459b7; }
</style></head>
<body>
  <div class="top"><strong>Anderson Tavares<span class="dot">.</span></strong><span>Evidence-led infrastructure portfolio</span></div>
  <div>
    <h1>Infrastructure, understood by building.</h1>
    <p>Five documented case studies in Linux, virtualization, automation, observability and shared GPU computing.</p>
  </div>
  <div class="bottom"><span>Case studies</span><span>Homelab Explorer</span><span>Professional summary</span></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: resolve(root, 'public/og.png') });
await browser.close();
console.log('Wrote public/og.png (1200×630).');
