"""RT-001 / CI-R-01, third part (corrected method for the offline-copy test).
A first attempt reloaded the same tab; the browser answered from its short-term memory, so the damaged offline copy was never
read and the result said nothing. Here the tab is closed and the reader is re-opened the way a returning person would open it
(new tab, browser short-term cache off), online and then with the network off.
Usage: python3 rt1c_offline_copy_damage.py <base-url> <site-root> <out.json> <label>
"""
import json, sys, time, re
from playwright.sync_api import sync_playwright
B, SITE, OUT, LABEL = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
SHOTS = '/home/claude/work/shots/'
READERS = {
    'japji': dict(page='full-japji.html', data='js/japji-full-data.js', root='#continuous-reader', lines='#continuous-reader article.scripture-line',
                  target_sel='[data-occurrence="pauri01.line06"] .tuk', old='ਹੁਕਮਿ ਰਜਾਈ ਚਲਣਾ', new='ਹੁਕਮ ਰਜਾਈ ਚਲਣਾ', settle=2.2),
    'sukhmani': dict(page='sukhmani.html', data='js/sukhmani-data.js', root='#sukhmani-text', lines='#sukhmani-text [data-line-id]',
                     target_sel='[data-line-id="sukhmani.a01.p01.l02"] .tuk', old='ਸਿਮਰਉ ਸਿਮਰਿ ਸਿਮਰਿ ਸੁਖੁ ਪਾਵਉ', new='ਸਿਮਰਉ ਸਿਮਰਿ ਸਿਮਰਿ ਦੁਖੁ ਪਾਵਉ', settle=3.2),
}
EXPECTED_FILES = len(re.findall(r'"\./[^"]*":"[0-9a-f]{64}"', open(SITE + 'sw.js', encoding='utf-8').read()))
PROBE = '''([root, lines, tsel]) => { const el = document.querySelector(root); const t = document.querySelector(tsel);
  return {integrity: el ? el.dataset.sourceIntegrity || null : null, scriptureLinesShown: document.querySelectorAll(lines).length, targetLineShown: t ? t.textContent : null,
          message: el ? el.innerText.replace(/\\s+/g, ' ').trim().slice(0, 150) : null, servedByOfflineCopy: !!(navigator.serviceWorker && navigator.serviceWorker.controller)}; }'''
POISON = '''async ([suffix, oldv, newv]) => { for (const k of await caches.keys()) { const c = await caches.open(k); for (const req of await c.keys()) {
   if (new URL(req.url).pathname.endsWith(suffix)) { const resp = await c.match(req); const text = await resp.text(); if (!text.includes(oldv)) return 'old-text-not-found';
     const h = new Headers(resp.headers); h.delete('content-length'); await c.put(req, new Response(text.replace(oldv, newv), {status: 200, statusText: 'OK', headers: h}));
     const back = await (await c.match(req)).text(); return back.includes(newv) ? 'altered-in-offline-copy' : 'write-did-not-stick'; } } } return 'not-in-offline-copy'; }'''
CACHED = "(async () => { let t = 0; for (const k of await caches.keys()) t += (await (await caches.open(k)).keys()).length; return t; })()"
R = {'label': LABEL, 'base': B, 'filesInOfflineList': EXPECTED_FILES, 'readers': {}}
with sync_playwright() as p:
    b = p.chromium.launch(); d = dict(p.devices['iPhone 14'])
    def fresh_tab(c):
        pg = c.new_page(); cdp = c.new_cdp_session(pg); cdp.send('Network.enable'); cdp.send('Network.setCacheDisabled', {'cacheDisabled': True}); return pg
    def look(pg, r):
        o = pg.evaluate(PROBE, [r['root'], r['lines'], r['target_sel']]); o['alteredTextDisplayed'] = bool(o['targetLineShown'] and r['new'] in o['targetLineShown']); return o
    for name, r in READERS.items():
        c = b.new_context(**d); pg = c.new_page(); out = {}
        pg.goto(B + 'nitnem/index.html', wait_until='load')
        for _ in range(120):
            if pg.evaluate(CACHED) >= EXPECTED_FILES: break
            time.sleep(0.5)
        pg.evaluate("navigator.serviceWorker.ready.then(() => true)"); pg.reload(wait_until='load'); time.sleep(0.5)
        pg.goto(B + r['page'], wait_until='load'); time.sleep(r['settle']); out['before_damage'] = look(pg, r)
        out['action'] = pg.evaluate(POISON, ['/' + r['data'], r['old'], r['new']]); pg.close()
        pg = fresh_tab(c); pg.goto(B + r['page'], wait_until='load'); time.sleep(r['settle']); out['reopened_online'] = look(pg, r)
        pg.screenshot(path=f"{SHOTS}rt1c_{LABEL}_{name}_damaged_offline_copy.png")
        pg.reload(wait_until='load'); time.sleep(r['settle']); out['reloaded_online_as_the_message_advises'] = look(pg, r); pg.close()
        c.set_offline(True); pg = fresh_tab(c)
        try: pg.goto(B + r['page'], wait_until='load'); time.sleep(r['settle']); out['reopened_offline'] = look(pg, r)
        except Exception as e: out['reopened_offline'] = {'error': str(e)[:120]}
        pg.close(); c.set_offline(False)
        pg = fresh_tab(c); pg.goto(B + 'nitnem/index.html', wait_until='load'); time.sleep(0.6)
        pg.evaluate("document.getElementById('check-update') && document.getElementById('check-update').click()"); time.sleep(2.5)
        out['update_check_message'] = pg.evaluate("(document.getElementById('offline-status')||document.getElementById('offline-message')||{}).textContent || null")
        pg.goto(B + r['page'], wait_until='load'); time.sleep(r['settle']); out['after_update_check_same_version'] = look(pg, r)
        out['savedLearningKeysPresent'] = pg.evaluate('Object.keys(localStorage).length')
        R['readers'][name] = out; c.close()
        print(LABEL, name, out['action'], '|', {k: (v.get('integrity'), v.get('scriptureLinesShown'), 'ALTERED TEXT SHOWN' if v.get('alteredTextDisplayed') else 'altered text not shown', 'offline copy in control' if v.get('servedByOfflineCopy') else 'not controlled')
                                               for k, v in out.items() if isinstance(v, dict)}, '|', out['update_check_message'])
    # Gurbani from a file outside the checked scripture sets
    craw = open(SITE + 'js/content.js', encoding='utf-8').read()
    cbad = craw.replace('ਹਉਮੈ ਦੀਰਘ ਰੋਗੁ ਹੈ', 'ਹਉਮੈ ਦੀਰਘ ਭੋਗੁ ਹੈ').replace('ਹੁਕਮੀ ਹੋਵਨਿ ਆਕਾਰ', 'ਹੁਕਮੀ ਹੋਵਨਿ ਅਕਾਰ')
    oth = {}
    c = b.new_context(**d, service_workers='block'); pg = c.new_page()
    pg.route('**/js/content.js*', lambda rt, *a: rt.fulfill(status=200, content_type='text/javascript', body=cbad))
    pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(2.5)
    main = pg.evaluate(PROBE, ['#continuous-reader', '#continuous-reader article.scripture-line', '[data-occurrence="pauri01.line06"] .tuk'])
    pg.click('#explore'); pg.locator('button[data-action="related"]:visible').first.click(timeout=8000)
    pg.wait_for_selector('.connection-card', state='visible', timeout=8000); time.sleep(0.4)
    cards = pg.evaluate("[...document.querySelectorAll('.connection-card')].map(x => x.innerText.replace(/\\s+/g,' ').slice(0, 120))")
    pg.screenshot(path=f"{SHOTS}rt1c_{LABEL}_japji_related_altered.png")
    pg.click('button[data-action="context"][data-index="0"]'); pg.wait_for_selector('.context-gurmukhi', state='visible', timeout=8000); time.sleep(0.3)
    ctxl = pg.evaluate("[...document.querySelectorAll('.context-gurmukhi')].map(x => x.textContent)")
    pg.screenshot(path=f"{SHOTS}rt1c_{LABEL}_japji_context_altered.png")
    oth['japji_reader_related_teachings'] = dict(mainTextIntegrity=main['integrity'], mainLines=main['scriptureLinesShown'], relatedCards=cards, contextLines=ctxl,
                                                 alteredGurbaniDisplayed=any('ਭੋਗੁ' in x for x in cards + ctxl), warningShown=(main['integrity'] == 'failed'))
    c.close()
    c = b.new_context(**d, service_workers='block'); pg = c.new_page()
    pg.route('**/js/content.js*', lambda rt, *a: rt.fulfill(status=200, content_type='text/javascript', body=cbad))
    pg.goto(B + 'pauri-2-lesson.html', wait_until='networkidle'); time.sleep(1.5); body = pg.inner_text('body')
    oth['older_pauri2_lesson_page'] = dict(alteredGurbaniDisplayed=('ਹੁਕਮੀ ਹੋਵਨਿ ਅਕਾਰ' in body), genuineLineDisplayed=('ਹੁਕਮੀ ਹੋਵਨਿ ਆਕਾਰ' in body))
    pg.screenshot(path=f"{SHOTS}rt1c_{LABEL}_pauri2_lesson_altered.png"); c.close()
    R['gurbani_from_unchecked_file'] = oth; print(LABEL, 'UNCHECKED', json.dumps(oth, ensure_ascii=False)[:1500])
    b.close()
json.dump(R, open(OUT, 'w'), ensure_ascii=False, indent=1)
