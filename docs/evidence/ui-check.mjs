// usage: node cases.mjs <baseUrl> <outDir> <prefix>
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'node:fs';
const [,, base, outDir, prefix] = process.argv;
fs.mkdirSync(outDir, { recursive: true });
const cases = [
  { id: 'T1-touching',   room: 'Room A101', now: '540', start: '660', end: '720', expect: 'Available' },
  { id: 'T2-overlap',    room: 'Room A101', now: '540', start: '630', end: '690', expect: 'Unavailable' },
  { id: 'T3-blocked',    room: 'Room C305', now: '540', start: '660', end: '720', expect: 'Unavailable' },
  { id: 'T4-exactly2h',  room: 'Room A101', now: '540', start: '720', end: '840', expect: 'Available' },
  { id: 'T5-over2h',     room: 'Lab B202',  now: '540', start: '600', end: '721', expect: 'Unavailable' },
  { id: 'T6-startsnow',  room: 'Room A101', now: '540', start: '540', end: '570', expect: 'Unavailable' },
  { id: 'X1-end-before-start', room: 'Lab B202', now: '540', start: '700', end: '650', expect: 'Unavailable' },
  { id: 'X2-end-over-1440',    room: 'Lab B202', now: '540', start: '1380', end: '1500', expect: 'Unavailable', reason: /1440/ },
  { id: 'X3-empty-start',      room: 'Lab B202', now: '540', start: '',    end: '720', expect: 'Unavailable', reason: /required/i },
  { id: 'X4-decimal-start',    room: 'Lab B202', now: '540', start: '600.5', end: '700', expect: 'Unavailable', reason: /whole number/i },
];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const log = [];
let pass = 0;
for (const c of cases) {
  await page.goto(base);
  await page.getByRole('button', { name: new RegExp(c.room) }).click();
  const inputs = page.locator('input[type=number]');
  await inputs.nth(0).fill(c.now);
  await inputs.nth(1).fill(c.start);
  await inputs.nth(2).fill(c.end);
  await page.waitForTimeout(150);
  const shown = await inputs.evaluateAll(els => els.map(e => e.value));
  const decision = (await page.locator('p.text-lg').first().innerText()).trim();
  const reasonTexts = (await page.locator('ul.border-t li').allInnerTexts()).map(s => s.trim());
  const ok = decision === c.expect && (!c.reason || reasonTexts.some(r => c.reason.test(r)));
  if (ok) pass++;
  log.push(`${ok ? 'PASS' : 'FAIL'}  ${c.id.padEnd(22)} room=${c.room.padEnd(10)} typed(now,start,end)=(${c.now},${c.start},${c.end}) shown=(${shown.join(',')}) -> ${decision} (expected ${c.expect}${c.reason ? ' + reason ' + c.reason : ''})` + (reasonTexts.length ? `\n        reasons: ${reasonTexts.join(' | ')}` : ''));
  await page.locator('main, body').first().screenshot({ path: `${outDir}/${prefix}-${c.id}.png`, fullPage: true });
}
// mobile layout check
const m = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await m.goto(base);
await m.screenshot({ path: `${outDir}/${prefix}-mobile-390px.png`, fullPage: true });
const overflow = await m.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
log.push(`${overflow ? 'FAIL' : 'PASS'}  M1-mobile-390px        horizontal overflow=${overflow}`);
if (!overflow) pass++;
await browser.close();
const total = cases.length + 1;
log.push(`\nTOTAL: ${pass}/${total} matched expected result`);
console.log(log.join('\n'));
