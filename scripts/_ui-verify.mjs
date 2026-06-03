// One-off UI verification driver (Playwright). Exercises the flows the user
// asked to check: Add Folder, Save accounting library path, EON Agents render,
// Guide Mode toggle. Reports JSON + captures any console/page errors on load.
import { chromium } from 'playwright';

const URL = 'http://localhost:8123/TMAR-Accrual-Ledger.html';
const results = {};
const consoleErrors = [];
const pageErrors = [];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => pageErrors.push(e.message));

await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(2500); // let init scripts settle

// ── 1. Add Folder ────────────────────────────────────────────────────────────
results.addFolder = await page.evaluate(() => {
  const inp = document.getElementById('sf-path');
  const btn = document.querySelector('button[onclick="addSourceFolder()"]');
  if (!inp || !btn) return { ok:false, why:'input or button missing' };
  inp.value = 'C:\\Users\\rhyme\\Documents\\_UITEST_FOLDER';
  btn.click();
  const stored = JSON.parse(localStorage.getItem('sourceFolders') || '[]');
  const list = (document.getElementById('sf-list') || {}).innerHTML || '';
  return {
    ok: stored.includes('C:\\Users\\rhyme\\Documents\\_UITEST_FOLDER')
        && list.includes('_UITEST_FOLDER'),
    storedCount: stored.length,
    listShowsPath: list.includes('_UITEST_FOLDER')
  };
});

// ── 2. Save accounting reference library path ────────────────────────────────
results.saveAcctLib = await page.evaluate(() => {
  const inp = document.getElementById('sf-acct-path');
  const btn = document.querySelector('button[onclick="saveAcctLib()"]');
  if (!inp || !btn) return { ok:false, why:'input or button missing' };
  inp.value = 'D:\\AmJur2d\\Treatises';
  btn.click();
  return { ok: localStorage.getItem('acctLibPath') === 'D:\\AmJur2d\\Treatises',
           stored: localStorage.getItem('acctLibPath') };
});

// ── 3. EON Agents render ─────────────────────────────────────────────────────
results.agentsRender = await page.evaluate(() => {
  if (typeof renderAgents !== 'function') return { ok:false, why:'renderAgents missing' };
  let threw = null;
  try { renderAgents(); } catch (e) { threw = e.name + ': ' + e.message; }
  const grid = document.getElementById('agentsGrid');
  const cards = grid ? grid.querySelectorAll('.agent-card').length : 0;
  return { ok: !threw && cards > 0, threw, cardCount: cards };
});

// ── 4. Guide Mode toggle ─────────────────────────────────────────────────────
results.guideMode = await page.evaluate(() => {
  const btn = document.getElementById('ual-guide-toggle');
  if (!btn || typeof ev2ToggleInfoGuide !== 'function') return { ok:false, why:'button or fn missing' };
  const dataGuideCount = document.querySelectorAll('[data-guide]').length;
  btn.click(); // turn ON
  const onState = (localStorage.getItem('tmar_info_guide') === '1');
  const btnOn = btn.classList.contains('ev2-guide-on');
  // count overlay elements the guide created (infoGuideShow builds tooltips/badges)
  const overlays = document.querySelectorAll('.ev2-guide-tip, .info-guide-badge, [class*="guide-tip"], [class*="guide-badge"]').length;
  btn.click(); // turn OFF again
  const offState = (localStorage.getItem('tmar_info_guide') === '0');
  return { ok: onState && btnOn && offState, dataGuideElements: dataGuideCount,
           toggledOn: onState, btnGotActiveClass: btnOn, toggledOff: offState, overlaysCreated: overlays };
});

await page.screenshot({ path: 'scripts/_ui-verify.png', fullPage: false });
results._console_errors = consoleErrors.slice(0, 15);
results._page_errors = pageErrors.slice(0, 15);

console.log(JSON.stringify(results, null, 2));
await browser.close();
