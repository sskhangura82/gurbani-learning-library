"""RT-002 / CI-R-08 a, b, d: when the reader refuses to show Gurbani because its offline copy is damaged, can the person
still get their notes out, and what are they told?  The offline copy of the Gurbani data file is altered by one word
(the RT-001 method). The reader is then reopened online, reloaded, and reopened with the network off. On each refusal
screen: no Gurbani shown; the words on screen; is "Export original learning" visible and tappable; does a file arrive
within 8 seconds; does it hold the saved records exactly; is storage untouched. Japji and Sukhmani.
Chromium, phone emulation, offline shell in use, made-up notes only.
Usage: python3 rt2_04_refusal_screen_export.py <base-url> <site-root/> <out.json>"""
import json, re, sys, time
from playwright.sync_api import sync_playwright
B, SITE, OUT = sys.argv[1:4]; KEY = 'glp001.continuous.v2'; ARCH = 'glp001.continuous.retained.v1'; SUK = 'glp001.sukhmani.v1'
MAIN = json.dumps({'version': 2, 'notes': {'mool.line01': 'ORDINARY-NOTE'}, 'bookmarks': ['pauri05.line01']})
ARCHIVE = json.dumps({'version': 1, 'keptAside': {'notes': [{'id': 'nope.line99', 'text': 'KEPT-ASIDE-NOTE', 'reason': 'unknown_line'}], 'bookmarks': ['nope.line98']}})
READERS = {'japji': dict(page='full-japji.html', data='js/japji-full-data.js', root='#continuous-reader', lines='#continuous-reader .scripture-line', old='ਆਦਿ ਸਚੁ ਜੁਗਾਦਿ ਸਚੁ', new='ਆਦਿ ਸਚੁ ਜੁਗਾਦਿ ਕੂੜੁ', settle=2.0),
           'sukhmani': dict(page='sukhmani.html', data='js/sukhmani-data.js', root='#sukhmani-text', lines='#sukhmani-text [data-line-id]', old='ਸਿਮਰਉ ਸਿਮਰਿ ਸਿਮਰਿ ਸੁਖੁ ਪਾਵਉ', new='ਸਿਮਰਉ ਸਿਮਰਿ ਸਿਮਰਿ ਦੁਖੁ ਪਾਵਉ', settle=3.2)}
N_FILES = len(re.findall(r'"\./[^"]*":"[0-9a-f]{64}"', open(SITE + 'sw.js', encoding='utf-8').read()))
POISON = '''async ([suffix, oldv, newv]) => { for (const k of await caches.keys()) { const c = await caches.open(k); for (const req of await c.keys()) {
   if (new URL(req.url).pathname.endsWith(suffix)) { const resp = await c.match(req); const text = await resp.text(); if (!text.includes(oldv)) return 'old-text-not-found';
     const h = new Headers(resp.headers); h.delete('content-length'); await c.put(req, new Response(text.replace(oldv, newv), {status: 200, statusText: 'OK', headers: h}));
     return (await (await c.match(req)).text()).includes(newv) ? 'altered-in-offline-copy' : 'write-did-not-stick'; } } } return 'not-in-offline-copy'; }'''
CACHED = "(async () => { let t = 0; for (const k of await caches.keys()) t += (await (await caches.open(k)).keys()).length; return t; })()"
ALL = "Object.fromEntries(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)]))"
LOOK = '''([root, lines]) => { const el = document.querySelector(root); const btn = document.getElementById('source-failure-export'); const r = btn ? btn.getBoundingClientRect() : null;
  const top = r ? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) : null;
  return {check: el ? el.dataset.sourceIntegrity || null : null, gurbaniLinesShown: document.querySelectorAll(lines).length, wordsOnScreen: el ? el.innerText.replace(/\\s+/g, ' ').trim().slice(0, 420) : null,
          exportButton: btn ? {text: btn.textContent.trim(), width: Math.round(r.width), height: Math.round(r.height), insideTheScreen: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, tapReachesIt: top === btn} : null,
          servedByOfflineCopy: !!(navigator.serviceWorker && navigator.serviceWorker.controller)}; }'''
R = {'note': 'emulation only (Chromium, iPhone 14 profile); made-up notes only', 'filesInOfflineList': N_FILES, 'readers': {}}
with sync_playwright() as p:
    b = p.chromium.launch(); d = dict(p.devices['iPhone 14']); d['accept_downloads'] = True
    def fresh(c):
        pg = c.new_page(); cdp = c.new_cdp_session(pg); cdp.send('Network.enable'); cdp.send('Network.setCacheDisabled', {'cacheDisabled': True}); return pg
    def refusal(pg, r, before):
        o = pg.evaluate(LOOK, [r['root'], r['lines']])
        if o['exportButton']:
            pg.evaluate("document.getElementById('source-failure-export').scrollIntoView({block: 'center'})"); time.sleep(0.3); o['exportButtonAfterScrollingToIt'] = pg.evaluate(LOOK, [r['root'], r['lines']])['exportButton']
            t0 = time.time()
            try:
                with pg.expect_download(timeout=8000) as dl: pg.click('#source-failure-export')
                raw = open(dl.value.path(), encoding='utf-8').read(); j = json.loads(raw)
                o['export'] = dict(fileArrivedWithinSeconds=round(time.time() - t0, 1), fileName=dl.value.suggested_filename, format=j.get('format'),
                                   japjiRecordExact=(j.get('records') or {}).get(KEY) == before.get(KEY) if 'records' in j else None, keptAsideArchiveExact=(j.get('records') or {}).get(ARCH) == before.get(ARCH) if 'records' in j else None,
                                   sukhmaniRecordExact=(j.get('raw') == before.get(SUK)) if 'raw' in j else None, holdsOrdinaryNote='ORDINARY-NOTE' in raw, holdsKeptAsideNote='KEPT-ASIDE-NOTE' in raw, holdsSukhmaniNote='SUKHMANI-NOTE' in raw)
            except Exception as e: o['export'] = dict(fileArrivedWithinSeconds=None, hungOrFailed=str(e)[:90])
            o['whatItSaidAfterwards'] = pg.evaluate("[...document.querySelectorAll('[role=status]')].map(e => e.textContent.trim()).filter(Boolean).join(' / ')")[:200]
        o['storageUntouched'] = pg.evaluate(ALL) == before; return o
    for name, r in READERS.items():
        c = b.new_context(**d); c.set_default_timeout(15000); pg = c.new_page(); out = {}
        pg.goto(B + 'nitnem/index.html', wait_until='load')
        for _ in range(120):
            if pg.evaluate(CACHED) >= N_FILES: break
            time.sleep(0.5)
        pg.evaluate("navigator.serviceWorker.ready.then(() => true)"); pg.reload(wait_until='load'); time.sleep(0.5)
        pg.evaluate('([a, b, k1, k2]) => { localStorage.setItem(k1, a); localStorage.setItem(k2, b); }', [MAIN, ARCHIVE, KEY, ARCH])
        pg.goto(B + 'sukhmani.html', wait_until='load'); time.sleep(3.2); pg.click('#sukhmani-text [data-line-id] >> nth=3'); time.sleep(0.5)
        ta = pg.query_selector('dialog[open] textarea')
        if ta and not ta.is_disabled(): ta.fill('SUKHMANI-NOTE'); time.sleep(1.3)
        pg.keyboard.press('Escape'); time.sleep(0.8)
        pg.goto(B + r['page'], wait_until='load'); time.sleep(r['settle']); out['before_damage'] = dict(check=pg.evaluate("([s]) => document.querySelector(s).dataset.sourceIntegrity", [r['root']]), gurbaniLinesShown=pg.evaluate("([s]) => document.querySelectorAll(s).length", [r['lines']]))
        before = pg.evaluate(ALL); out['savedRecordsBefore'] = {k: len(v) for k, v in before.items()}
        out['damage'] = pg.evaluate(POISON, ['/' + r['data'], r['old'], r['new']]); pg.close()
        pg = fresh(c); pg.goto(B + r['page'], wait_until='load'); time.sleep(r['settle']); out['reopened_online'] = refusal(pg, r, before)
        pg.reload(wait_until='load'); time.sleep(r['settle']); out['reloaded_online'] = refusal(pg, r, before); pg.close()
        c.set_offline(True); pg = fresh(c)
        try: pg.goto(B + r['page'], wait_until='load'); time.sleep(r['settle']); out['reopened_with_the_network_off'] = refusal(pg, r, before)
        except Exception as e: out['reopened_with_the_network_off'] = {'error': str(e)[:120]}
        pg.close(); c.set_offline(False); R['readers'][name] = out; c.close()
        for k in ('reopened_online', 'reloaded_online', 'reopened_with_the_network_off'):
            o = out[k]; print(name, k, '| lines', o.get('gurbaniLinesShown'), '| button', json.dumps(o.get('exportButtonAfterScrollingToIt') or o.get('exportButton'))[:150], '| export', json.dumps(o.get('export'))[:330], '| storage untouched', o.get('storageUntouched'), flush=True)
        print('   words:', out['reopened_online'].get('wordsOnScreen'), flush=True)
    b.close()
json.dump(R, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
