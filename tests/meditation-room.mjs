// Isolated browser contracts for the manually advanced meditation-room guide.
// Run: CHROMIUM_PATH=/path/to/chromium node tests/meditation-room.mjs
// Desktop viewport emulation is not physical-device or screen-reader acceptance.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const out = path.join(root, 'evidence/meditation-room');
const inputs = ['meditation.html', 'css/meditation.css', 'js/meditation.js', 'tests/meditation-room.mjs'];
const report = {
  startedAt: new Date().toISOString(), browser: null, checks: [], runtimeErrors: [], externalRequests: [], screenshots: [],
  limitations: [
    'Desktop Chromium with responsive viewport checks. No physical iPhone, Safari or VoiceOver acceptance.',
    'Visibility and page-history events are synthetic. Actual device backgrounding remains unverified.',
    'These checks establish interface behavior, not therapeutic outcomes or religious approval.'
  ]
};
const contexts = [];
let server, browser, origin;
async function check(name, fn) {
  try { await fn(); report.checks.push({name, status: 'passed'}); }
  catch (error) { report.checks.push({name, status: 'failed', error: error.stack || String(error)}); }
}
async function makePage(options = {}) {
  const context = await browser.newContext({viewport: {width: 390, height: 844}, serviceWorkers: 'block', ...options});
  contexts.push(context);
  await context.addInitScript(() => {
    window.__attentionObservations = {storageReads: 0, storageWrites: 0, fetches: 0, indexedDB: 0};
    const read = Storage.prototype.getItem;
    const write = Storage.prototype.setItem;
    Storage.prototype.getItem = function (...args) { window.__attentionObservations.storageReads++; return read.apply(this, args); };
    Storage.prototype.setItem = function (...args) { window.__attentionObservations.storageWrites++; return write.apply(this, args); };
    const fetch = window.fetch;
    window.fetch = function (...args) { window.__attentionObservations.fetches++; return fetch.apply(this, args); };
    const open = IDBFactory.prototype.open;
    IDBFactory.prototype.open = function (...args) { window.__attentionObservations.indexedDB++; return open.apply(this, args); };
  });
  context.on('request', request => {
    if (new URL(request.url()).origin !== origin) report.externalRequests.push(request.url());
  });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  page.on('pageerror', error => report.runtimeErrors.push(error.message));
  await page.goto(origin + '/meditation.html');
  await page.waitForFunction(() => !document.getElementById('attention-start').disabled);
  return page;
}
async function screenshot(page, filename) {
  await page.screenshot({path: path.join(out, filename), fullPage: true});
  report.screenshots.push('evidence/meditation-room/' + filename);
}
async function assertIdle(page) {
  assert.equal(await page.locator('#natural-attention').getAttribute('data-state'), 'idle');
  assert.equal(await page.locator('#attention-panel').isVisible(), false);
  assert.equal(await page.locator('#attention-setup').isVisible(), true);
}

try {
  await fs.mkdir(out, {recursive: true});
  report.inputSha256 = {};
  for (const file of inputs) report.inputSha256[file] = createHash('sha256').update(await fs.readFile(path.join(root, file))).digest('hex');
  const html = await fs.readFile(path.join(root, 'meditation.html'), 'utf8');
  const script = await fs.readFile(path.join(root, 'js/meditation.js'));
  await check('The room loads one integrity-pinned controller with a restrictive no-media, no-connect CSP', () => {
    const integrity = 'sha384-' + createHash('sha384').update(script).digest('base64');
    assert.ok(html.includes('integrity="' + integrity + '"'));
    assert.equal((html.match(/<script\b/g) || []).length, 1);
    assert.match(html, /connect-src 'none'; media-src 'none'; frame-src 'none'/);
    assert.match(html, /data-content-layer="meditation-room"/);
    assert.doesNotMatch(script.toString(), /\b(?:setTimeout|setInterval|requestAnimationFrame|localStorage|sessionStorage|fetch|XMLHttpRequest|speechSynthesis|AudioContext)\b/);
  });
  server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      if (url.pathname === '/favicon.ico') { response.writeHead(204); response.end(); return; }
      const relative = decodeURIComponent(url.pathname).slice(1) || 'meditation.html';
      const file = path.resolve(root, relative);
      if (!file.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; }
      let body = await fs.readFile(file);
      if (relative === 'meditation.html' && url.searchParams.has('wrong-layer')) {
        body = Buffer.from(body.toString().replace('data-content-layer="meditation-room"', 'data-content-layer="scripture"'));
      }
      const mime = {'.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png'};
      response.writeHead(200, {'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store'});
      response.end(body);
    } catch { response.writeHead(404); response.end('Not found'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = 'http://127.0.0.1:' + server.address().port;
  browser = await chromium.launch({headless: true, ...(process.env.CHROMIUM_PATH ? {executablePath: process.env.CHROMIUM_PATH} : {})});
  report.browser = browser.version();
  const page = await makePage();

  await check('The hub keeps Simran, physiological breathing and modern attention as distinct entrances', async () => {
    const links = await page.locator('.entrances .entrance-link').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
    assert.deepEqual(links, ['simran.html', 'breathing.html', '#natural-attention']);
    assert.match(await page.locator('.entrance-simran').textContent(), /awaiting specialist review/);
    assert.match(await page.locator('#attention-comfort').textContent(), /eyes can stay open.*choose surroundings.*end at any time/s);
    assert.equal(await page.locator('audio, video, iframe').count(), 0);
    await assertIdle(page);
  });
  await check('Keyboard Start reveals the first prompt and puts focus on its heading', async () => {
    await page.locator('#attention-start').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#natural-attention').getAttribute('data-state'), 'active');
    assert.equal(await page.locator('#attention-setup').isVisible(), false);
    assert.equal(await page.locator('#attention-heading').textContent(), 'Arrive as you are.');
    assert.equal(await page.locator('#attention-heading').evaluate(node => document.activeElement === node), true);
    assert.equal(await page.locator('#attention-back').isDisabled(), true);
  });
  await check('Time never advances a prompt; Next and Back preserve the selected guide', async () => {
    await page.clock.install();
    await page.clock.pauseAt(new Date());
    await page.clock.runFor(120000);
    assert.equal(await page.locator('#attention-heading').textContent(), 'Arrive as you are.');
    await page.locator('#attention-next').click();
    assert.equal(await page.locator('#attention-heading').textContent(), 'Let the breath be.');
    assert.match(await page.locator('#attention-instruction').textContent(), /breathing find its own pace/);
    assert.equal(await page.locator('#attention-back').isDisabled(), false);
    await page.locator('#attention-back').click();
    assert.equal(await page.locator('#attention-heading').textContent(), 'Arrive as you are.');
    await page.locator('#attention-next').click();
    await page.clock.runFor(60000);
    assert.equal(await page.locator('#attention-heading').textContent(), 'Let the breath be.');
  });
  await check('Every prompt can be reached and Finish returns focus to Start without a completion score', async () => {
    const headings = [];
    for (let index = 0; index < 3; index++) {
      await page.locator('#attention-next').click();
      headings.push(await page.locator('#attention-heading').textContent());
    }
    assert.deepEqual(headings, ['Notice, then return.', 'Make a little room.', 'Return to your day.']);
    assert.equal(await page.locator('#attention-next').textContent(), 'Finish');
    await page.locator('#attention-next').click();
    await assertIdle(page);
    assert.equal(await page.locator('#attention-start').evaluate(node => document.activeElement === node), true);
    assert.match(await page.locator('#attention-state').textContent(), /guide has ended/);
  });
  await check('The surroundings path offers contact, sight or sound without paced-breath instructions', async () => {
    await page.locator('input[value="surroundings"]').check();
    await page.locator('#attention-start').click();
    assert.equal(await page.locator('#attention-anchor-label').textContent(), 'Attention to surroundings');
    await page.locator('#attention-next').click();
    assert.match(await page.locator('#attention-instruction').textContent(), /contact of your feet, your seat, or your hands/);
    await page.locator('#attention-next').click();
    assert.match(await page.locator('#attention-instruction').textContent(), /shape nearby, or on a sound/);
    await page.locator('#attention-end').click();
    await assertIdle(page);
    assert.equal(await page.locator('input[value="surroundings"]').isChecked(), true);
  });
  await check('Escape and the persistent End control both finish immediately and restore Start focus', async () => {
    await page.locator('#attention-start').click();
    await page.keyboard.press('Escape');
    await assertIdle(page);
    assert.equal(await page.locator('#attention-start').evaluate(node => document.activeElement === node), true);
    await page.locator('#attention-start').click();
    await page.locator('#attention-next').click();
    const target = await page.locator('#attention-end').boundingBox();
    assert.ok(target.width >= 44 && target.height >= 44);
    await page.locator('#attention-end').click();
    await assertIdle(page);
  });
  await check('Page hiding ends the guide, and becoming visible never silently resumes it', async () => {
    await page.locator('#attention-start').click();
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', {configurable: true, value: true});
      document.dispatchEvent(new Event('visibilitychange'));
      Object.defineProperty(document, 'hidden', {configurable: true, value: false});
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await assertIdle(page);
    assert.match(await page.locator('#attention-state').textContent(), /ended while the page was hidden/);
    await page.clock.runFor(30000);
    await assertIdle(page);
  });
  await check('Page exit and a persisted history return keep the guide ended', async () => {
    await page.locator('#attention-start').click();
    await page.evaluate(() => {
      window.dispatchEvent(new PageTransitionEvent('pagehide', {persisted: true}));
      window.dispatchEvent(new PageTransitionEvent('pageshow', {persisted: true}));
    });
    await assertIdle(page);
    assert.match(await page.locator('#attention-state').textContent(), /ended when you left/);
  });
  await check('Sources keep the guide an introduction and the Stoic reflection a philosophical prompt', async () => {
    assert.equal(await page.locator('.context-grid details').count(), 4);
    for (const detail of await page.locator('.context-grid details').all()) await detail.locator('summary').click();
    const text = await page.locator('.context-grid').textContent();
    assert.match(text, /modern introduction inspired by that starting point/);
    assert.match(text, /exact on-screen timings are modern practice settings/);
    assert.match(text, /philosophical invitation to reflect/);
    assert.match(text, /Elizabeth Carter/);
    assert.match(text, /Rama Prasada/);
    assert.match(text, /Ṭhānissaro Bhikkhu/);
    for (const detail of await page.locator('.context-grid details').all()) await detail.locator('summary').click();
  });
  await check('The layout fits 320, 390, 820 and 1440 pixels with readable type and useful touch targets', async () => {
    for (const width of [320, 390, 820, 1440]) {
      await page.setViewportSize({width, height: 900});
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
      assert.equal(await page.locator('body').evaluate(node => parseFloat(getComputedStyle(node).fontSize) >= 16), true);
      for (const button of await page.locator('#attention-start, .entrance-link, .anchor-choices label').all()) {
        const target = await button.boundingBox();
        assert.ok(target.width >= 44 && target.height >= 44);
      }
    }
    await screenshot(page, 'room-1440.png');
    await page.setViewportSize({width: 320, height: 800});
    await screenshot(page, 'room-320.png');
  });
  const reduced = await makePage({reducedMotion: 'reduce'});
  await check('Reduced motion preserves the manual guide and visible End control at a narrow width', async () => {
    await reduced.locator('#attention-start').click();
    await reduced.locator('#attention-next').click();
    assert.equal(await reduced.locator('html').evaluate(node => getComputedStyle(node).scrollBehavior), 'auto');
    assert.equal(await reduced.locator('#attention-end').isVisible(), true);
    await screenshot(reduced, 'attention-active-390.png');
    await reduced.locator('#attention-end').click();
  });
  await check('A mismatched document layer cannot enable the attention controller', async () => {
    const refused = await page.context().newPage();
    await refused.goto(origin + '/meditation.html?wrong-layer=1');
    await refused.waitForLoadState('load');
    assert.equal(await refused.locator('#attention-start').isDisabled(), true);
    await assertIdle(refused);
    await refused.close();
  });
  await check('The guide performs no persistence or data fetch, creates no cookies and requests no external resources', async () => {
    for (const item of [page, reduced]) {
      assert.deepEqual(await item.evaluate(() => window.__attentionObservations), {storageReads: 0, storageWrites: 0, fetches: 0, indexedDB: 0});
      assert.equal((await item.context().cookies()).length, 0);
    }
    assert.deepEqual(report.externalRequests, []);
    assert.deepEqual(report.runtimeErrors, []);
  });
} catch (error) {
  report.checks.push({name: 'Harness setup/completion', status: 'failed', error: error.stack || String(error)});
} finally {
  for (const context of contexts) await context.close().catch(() => {});
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
  report.finishedAt = new Date().toISOString();
  report.passed = report.checks.filter(item => item.status === 'passed').length;
  report.failed = report.checks.filter(item => item.status === 'failed').length;
  await fs.mkdir(out, {recursive: true});
  await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({passed: report.passed, failed: report.failed, failures: report.checks.filter(item => item.status === 'failed'), report: 'evidence/meditation-room/report.json'}));
  if (report.failed) process.exitCode = 1;
}
