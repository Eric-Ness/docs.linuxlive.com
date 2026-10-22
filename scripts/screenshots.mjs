// Takes the docs' screenshots of linuxlive.com with a local Chrome or Edge, into
// src/assets/shots/. Rerun after the Workshop changes:
//   npm run screenshots                       (from https://linuxlive.com)
//   BASE=http://localhost:4321 npm run screenshots
// It only reads pages and fills the Workshop in the browser: nothing is built,
// signed in or sent.
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const BASE = (process.env.BASE || 'https://linuxlive.com').replace(/\/$/, '');
const OUT = join(import.meta.dirname, '..', 'src', 'assets', 'shots');
const ART = process.env.ART || join(import.meta.dirname, '..', '..', 'linuxlive', 'examples', 'assets', 'lawndarts');
const CHROME = process.env.CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/chromium', '/usr/bin/google-chrome'].find(existsSync);
if (!CHROME) { console.error('No Chrome or Edge found; set CHROME to one.'); process.exit(1); }
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 1320, height: 1000 }, deviceScaleFactor: 1 });
const shot = async (name, locator) => {
  await page.waitForTimeout(300);
  await locator.screenshot({ path: join(OUT, `${name}.png`), animations: 'disabled' });
  console.log(`wrote ${name}.png`);
};

await page.goto(`${BASE}/workshop/`, { waitUntil: 'networkidle' });
const wizard = page.locator('[data-wizard]');
const step = async (label) => { await wizard.locator('.step', { hasText: label }).click(); };

await shot('workshop-base', wizard);

await step('Desktop');
await wizard.locator('[data-choice="desktop"][data-value="kde"]').click();
await shot('workshop-desktop', wizard);

await step('Apps');
await page.fill('#wz-flathub', 'chess');
await page.waitForSelector('[data-out="flathub-results"] li');
await shot('workshop-apps', wizard);
await wizard.locator('[data-flathub-add]').first().click();
await page.fill('#wz-flathub', '');

await step('Look');
await page.fill('#wz-name', 'Lawn Darts Linux');
await wizard.locator('[data-accent]').nth(2).click();
// The Lawn Darts example's art (CC0) from a linuxlive checkout beside this one.
if (existsSync(ART)) {
  await page.setInputFiles('#wz-wallpaper', join(ART, 'wallpaper.png'));
  await page.setInputFiles('#wz-logo', join(ART, 'logo.png'));
  await page.waitForFunction(() => document.querySelector('.desk-logo-img')?.complete && !document.querySelector('.desk-logo-img').hidden);
}
await shot('workshop-look', wizard);

await step('Settings');
await page.selectOption('#wz-language', { index: 5 });
await page.selectOption('#wz-timezone', 'Europe/Lisbon');
await page.fill('#wz-hostname', 'lawn-pc');
const dock = wizard.locator('[data-out="dock"] input');
for (let i = 0; i < Math.min(2, await dock.count()); i++) await dock.nth(i).check();
await shot('workshop-settings', wizard);

await step('Extras');
await page.fill('#wz-packages', 'htop vim');
await wizard.locator('[data-extra="first-login"] summary').click();
await shot('workshop-extras', wizard);
await wizard.locator('[data-extra="first-login"] summary').click();

await step('Get it');
await shot('workshop-get-it', wizard);

// Open a kit: the kit this run made, opened again (it never leaves the browser).
const [download] = await Promise.all([page.waitForEvent('download'), wizard.locator('[data-download]').click()]);
const kit = join(OUT, '..', 'lawn-darts-linux-kit.zip');
await download.saveAs(kit);
await page.goto(`${BASE}/workshop/`, { waitUntil: 'networkidle' });
await page.setInputFiles('#wz-kit', kit);
await page.waitForSelector('[data-out="edit"]:not([hidden])');
await page.waitForTimeout(500);
await shot('workshop-open-kit', page.locator('.hero'));
rmSync(kit);

await page.goto(`${BASE}/library/`, { waitUntil: 'networkidle' });
await page.setViewportSize({ width: 1320, height: 900 });
// The top of the page only: the whole Library is too tall to read as one picture.
await page.screenshot({ path: join(OUT, 'library.png') });
console.log('wrote library.png');

await browser.close();
