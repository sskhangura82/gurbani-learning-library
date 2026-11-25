"""RT-001 / CI-R-01, second part: the offline copy, recovery after a failed check, attempts to change the text
during and after the check, Gurbani that comes from files outside the three checked scripture sets, and added waiting time.
Independent reproduction by the second reviewer. Headless Chromium, phone emulation, synthetic learning only.
Usage: python3 rt1b_cache_and_recovery.py <base-url> <site-root> <out.json> <label>
"""
import json, sys, time, re
from playwright.sync_api import sync_playwright

B, SITE, OUT, LABEL = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
SHOTS = '/home/claude/work/shots/'
READERS = {
    'japji': dict(page='full-japji.html', data='js/japji-full-data.js', glob='GLP_FULL_JAPJI', units='units', textkey='text', root='#continuous-reader',
                  lines='#continuous-reader article.scripture-line', target='pauri01.line06', target_sel='[data-occurrence="pauri01.line06"] .tuk',
                  old='ਹੁਕਮਿ ਰਜਾਈ ਚਲਣਾ', new='ਹੁਕਮ ਰਜਾਈ ਚਲਣਾ', expect=385),
    'sukhmani': dict(page='sukhmani.html', data='js/sukhmani-data.js', glob='GLP_SUKHMANI', units='ashtpadis', textkey='gurmukhi', root='#sukhmani-text',
                     lines='#sukhmani-text [data-line-id]', target='sukhmani.a01.p01.l02', target_sel='[data-line-id="sukhmani.a01.p01.l02"] .tuk',
                     old='ਸਿਮਰਉ ਸਿਮਰਿ ਸਿਮਰਿ ਸੁਖੁ ਪਾਵਉ', new='ਸਿਮਰਉ ਸਿਮਰਿ ਸਿਮਰਿ ਦੁਖੁ ਪਾਵਉ', expect=2027),
}
EXPECTED_FILES = len(re.findall(r'"\./[^"]*":"[0-9a-f]{64}"', open(SITE + 'sw.js', encoding='utf-8').read()))
PROBE = '''([root, lines, tsel]) => { const el = document.querySelector(root); const t = document.querySelector(tsel);
  const ctr = [...document.querySelectorAll('button,input,select')].filter(c => { const b = c.getBoundingClientRect(); return b.width > 0 && b.height > 0; });
  const links = [...document.querySelectorAll('a[href]')].filter(c => { const b = c.getBoundingClientRect(); return b.width > 0 && b.height > 0; }).map(a => a.textContent.replace(/\\s+/g, ' ').trim().slice(0, 40) + ' -> ' + a.getAttribute('href'));
  return {integrity: el ? el.dataset.sourceIntegrity || null : null, scriptureLinesShown: document.querySelectorAll(lines).length, targetLineShown: t ? t.textContent : null,
          message: el ? el.innerText.replace(/\\s+/g, ' ').trim().slice(0, 170) : null, visibleControls: ctr.length, visibleControlsEnabled: ctr.filter(c => !c.disabled).length,
          visibleLinks: links, controlled: !!(navigator.serviceWorker && navigator.serviceWorker.controller)}; }'''
POISON = '''async ([suffix, oldv, newv]) => { for (const k of await caches.keys()) { const c = await caches.open(k); for (const req of await c.keys()) {
   if (new URL(req.url).pathname.endsWith(suffix)) { const resp = await c.match(req); const text = await resp.text(); if (oldv !== null && !text.includes(oldv)) return 'old-text-not-found';
     const h = new Headers(resp.headers); h.delete('content-length'); await c.put(req, new Response(oldv === null ? newv : text.replace(oldv, newv), {status: 200, statusText: 'OK', headers: h})); return 'altered-in-offline-copy'; } } } return 'not-in-offline-copy'; }'''
CACHED = "(async () => { let t = 0; for (const k of await caches.keys()) t += (await (await caches.open(k)).keys()).length; return t; })()"
PENDING = r'''
(() => { const real = crypto.subtle.digest.bind(crypto.subtle); const waiters = []; let open = false; window.__digestCalls = 0;
  crypto.subtle.digest = function (...a) { window.__digestCalls++; if (open) return real(...a); return new Promise((res, rej) => waiters.push(() => real(...a).then(res, rej))); };
  window.__release = () => { open = true; waiters.splice(0).forEach(f => f()); };
})();
'''
R = {'label': LABEL, 'base': B, 'filesInOfflineList': EXPECTED_FILES}

def probe(pg, r): return pg.evaluate(PROBE, [r['root'], r['lines'], r['target_sel']])

with sync_playwright() as p:
    b = p.chromium.launch(); d = dict(p.devices['iPhone 14'])
    def primed():
        """A fresh browser profile with the offline copy fully installed and in control of the page."""
        c = b.new_context(**d); pg = c.new_page()
        pg.goto(B + 'nitnem/index.html', wait_until='load')
        n = 0
        for _ in range(120):
            n = pg.evaluate(CACHED)
            if n >= EXPECTED_FILES: break
            time.sleep(0.5)
        pg.evaluate("navigator.serviceWorker.ready.then(() => true)")
        pg.reload(wait_until='load'); time.sleep(0.6)
        return c, pg, n
    # ---------- 1. genuine build, read with the network switched off
    c, pg, n = primed(); off = {'filesInOfflineCopy': n}
    c.set_offline(True)
    for name, r in READERS.items():
        pg.goto(B + r['page'], wait_until='load'); time.sleep(3.0 if name == 'sukhmani' else 2.0); off[name] = probe(pg, r)
    pg.goto(B + 'nitnem/index.html', wait_until='load'); time.sleep(0.8)
    nit = {}
    for bani in ('sohila', 'jaap'):
        pg.click(f'button[data-open="{bani}"]'); time.sleep(1.6)
        nit[bani] = pg.evaluate('document.querySelectorAll("#source-unit .scripture-line").length')
        pg.goto(B + 'nitnem/index.html', wait_until='load'); time.sleep(0.6)
    off['nitnem_lines_first_screen'] = nit
    c.set_offline(False); c.close(); R['offline_genuine'] = off
    # ---------- 2. the offline copy of a scripture file is damaged after installation
    dmg = {}
    for name, r in READERS.items():
        c, pg, n = primed(); out = {}
        pg.goto(B + r['page'], wait_until='load'); time.sleep(3.0 if name == 'sukhmani' else 2.0); out['before'] = probe(pg, r)
        out['action'] = pg.evaluate(POISON, ['/' + r['data'], r['old'], r['new']])
        pg.reload(wait_until='load'); time.sleep(3.0 if name == 'sukhmani' else 2.0); out['reload_online_1'] = probe(pg, r)
        pg.screenshot(path=f"{SHOTS}rt1b_{LABEL}_{name}_damaged_offline_copy.png")
        pg.reload(wait_until='load'); time.sleep(3.0 if name == 'sukhmani' else 2.0); out['reload_online_2'] = probe(pg, r)
        # the only in-app repair a reader could try: the update check on the Nitnem page, then come back
        pg.goto(B + 'nitnem/index.html', wait_until='load'); time.sleep(0.6)
        try:
            pg.evaluate("document.getElementById('check-update') && document.getElementById('check-update').click()"); time.sleep(2.5)
            out['after_update_check_message'] = pg.evaluate("(document.getElementById('offline-status')||document.getElementById('offline-message')||{}).textContent || null")
        except Exception as e: out['after_update_check_message'] = 'error: ' + str(e)[:80]
        pg.goto(B + r['page'], wait_until='load'); time.sleep(3.0 if name == 'sukhmani' else 2.0); out['after_update_check'] = probe(pg, r)
        for k in ('reload_online_1', 'reload_online_2', 'after_update_check'):
            out[k]['alteredTextDisplayed'] = bool(out[k]['targetLineShown'] and r['new'] in out[k]['targetLineShown'])
        dmg[name] = out; c.close()
    # Nitnem: one bani file damaged in the offline copy
    c, pg, n = primed(); out = {}
    out['action'] = pg.evaluate(POISON, ['/nitnem/data/sohila.json', 'ਧੂਪੁ ਮਲਆਨਲੋ', 'ਧੂਪੁ ਮਲਆਨਲ'])
    pg.reload(wait_until='load'); time.sleep(0.8)
    pg.click('button[data-open="sohila"]'); time.sleep(1.8)
    out['sohila'] = pg.evaluate('''() => ({readerOpen: !document.querySelector('#reader').hidden, lines: document.querySelectorAll('#source-unit .scripture-line').length,
        target: (document.querySelector('[data-line-id="sohila03.line03"] .tuk') || {}).textContent || null,
        messages: [...document.querySelectorAll('[role=status],[role=alert],#collection-status,.loading-note')].filter(e => !e.hidden && e.offsetParent !== null).map(e => e.textContent.trim().slice(0, 150)).filter(Boolean).slice(0, 3)})''')
    pg.screenshot(path=f"{SHOTS}rt1b_{LABEL}_nitnem_damaged_offline_copy.png")
    pg.goto(B + 'nitnem/index.html', wait_until='load'); time.sleep(0.6); pg.click('button[data-open="jaap"]'); time.sleep(1.8)
    out['other_bani_still_opens_lines'] = pg.evaluate('document.querySelectorAll("#source-unit .scripture-line").length')
    dmg['nitnem_sohila'] = out; c.close(); R['offline_copy_damaged'] = dmg
    # ---------- 3. attempts to change the text during and after the check
    late = {}
    for name, r in READERS.items():
        c = b.new_context(**d, service_workers='block'); pg = c.new_page(); out = {}
        pg.goto(B + r['page'], wait_until='networkidle'); time.sleep(2.5)
        out['replace_global_then_redraw'] = pg.evaluate('''([glob, units, textkey, target, oldv, newv]) => { const copy = JSON.parse(JSON.stringify(window[glob]));
            for (const u of copy[units]) for (const l of u.lines) if (l.id === target) l[textkey] = l[textkey].replace(oldv, newv);
            let replaced = false; try { window[glob] = copy; replaced = (window[glob] === copy); } catch (e) {} return {globalReplaced: replaced}; }''', [r['glob'], r['units'], r['textkey'], r['target'], r['old'], r['new']])
        for sel in ('button[data-depth="understand"]', 'button[data-depth="study"]', 'button[data-depth="read"]', 'button[data-mode="meaning"]', 'button[data-mode="study"]', 'button[data-mode="read"]'):
            q = pg.query_selector(sel)
            if q and not q.is_disabled():
                try: q.click(timeout=2000); time.sleep(0.9)
                except Exception: pass
        t = pg.query_selector(r['target_sel']); out['replace_global_then_redraw']['targetAfterRedraw'] = t.text_content() if t else None
        out['replace_global_then_redraw']['alteredTextDisplayed'] = bool(t and r['new'] in t.text_content())
        c.close()
        c = b.new_context(**d, service_workers='block'); pg = c.new_page(); pg.add_init_script(PENDING)
        pg.goto(B + r['page'], wait_until='load'); time.sleep(2.5)
        m = pg.evaluate('''([glob, units, textkey, target, oldv, newv]) => { const dta = window[glob]; if (!dta) return {note: 'no data object'}; let L; for (const u of dta[units]) { const k = u.lines.find(l => l.id === target); if (k) L = k; }
            const frozen = Object.isFrozen(L); try { L[textkey] = L[textkey].replace(oldv, newv); } catch (e) {} return {digestsWaiting: window.__digestCalls || 0, lineObjectFrozenWhileCheckPending: frozen, textChangedInMemory: L[textkey].includes(newv)}; }''',
                        [r['glob'], r['units'], r['textkey'], r['target'], r['old'], r['new']])
        m['duringCheck'] = probe(pg, r); pg.evaluate('window.__release && window.__release()'); time.sleep(4.0 if name == 'sukhmani' else 2.5)
        m['afterRelease'] = probe(pg, r); m['alteredTextDisplayed'] = bool(m['afterRelease']['targetLineShown'] and r['new'] in m['afterRelease']['targetLineShown'])
        pg.screenshot(path=f"{SHOTS}rt1b_{LABEL}_{name}_after_release.png") if False else None
        out['change_text_while_check_is_waiting'] = m; c.close()
        late[name] = out
    R['late_changes'] = late
    # ---------- 4. the failure screen: what can the reader still do?
    fs = {}
    for name, r in READERS.items():
        raw = open(SITE + r['data'], encoding='utf-8').read()
        c = b.new_context(**d, service_workers='block'); pg = c.new_page()
        pg.route('**/' + r['data'] + '*', (lambda _b: (lambda rt, *a: rt.fulfill(status=200, content_type='text/javascript', body=_b)))(raw.replace(r['old'], r['new'], 1)))
        pg.goto(B + r['page'], wait_until='networkidle'); time.sleep(2.0)
        o = probe(pg, r)
        o.update(pg.evaluate('''() => ({statusText: (document.getElementById('status') || {}).textContent || null,
            buttons: [...document.querySelectorAll('button')].filter(x => x.getBoundingClientRect().width > 0).map(x => (x.textContent.replace(/\\s+/g, ' ').trim().slice(0, 28) || x.id) + (x.disabled ? ' [off]' : ' [ON]')),
            retryControl: !![...document.querySelectorAll('button,a')].find(x => /retry|try again|reload|repair|download again/i.test(x.textContent)),
            exportReachable: !![...document.querySelectorAll('button,a')].find(x => !x.disabled && x.getBoundingClientRect().width > 0 && /export|backup|back up|saved learning/i.test(x.textContent))})'''))
        pg.screenshot(path=f"{SHOTS}rt1b_{LABEL}_{name}_failure_screen.png"); fs[name] = o; c.close()
    R['failure_screen'] = fs
    # ---------- 5. Gurbani that comes from a file outside the checked scripture sets (js/content.js)
    craw = open(SITE + 'js/content.js', encoding='utf-8').read()
    cbad = craw.replace('ਹਉਮੈ ਦੀਰਘ ਰੋਗੁ ਹੈ', 'ਹਉਮੈ ਦੀਰਘ ਭੋਗੁ ਹੈ').replace('ਹੁਕਮੀ ਹੋਵਨਿ ਆਕਾਰ', 'ਹੁਕਮੀ ਹੋਵਨਿ ਅਕਾਰ')
    oth = {'occurrencesAltered': craw.count('ਹਉਮੈ ਦੀਰਘ ਰੋਗੁ ਹੈ') + craw.count('ਹੁਕਮੀ ਹੋਵਨਿ ਆਕਾਰ')}
    c = b.new_context(**d, service_workers='block'); pg = c.new_page()
    pg.route('**/js/content.js*', lambda rt, *a: rt.fulfill(status=200, content_type='text/javascript', body=cbad))
    pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(2.5)
    jr = probe(pg, READERS['japji'])
    try:
        pg.click('#explore'); time.sleep(0.6); pg.click('button[data-action="related"]'); time.sleep(0.6)
        cards = pg.evaluate("[...document.querySelectorAll('.connection-card')].map(x => x.innerText.replace(/\\s+/g,' ').slice(0, 130))")
        pg.screenshot(path=f"{SHOTS}rt1b_{LABEL}_japji_related_altered.png")
        pg.click('button[data-action="context"][data-index="0"]'); time.sleep(0.6)
        ctxl = pg.evaluate("[...document.querySelectorAll('.context-gurmukhi')].map(x => x.textContent)")
    except Exception as e: cards = ['error: ' + str(e)[:120]]; ctxl = []
    oth['japji_reader'] = dict(mainTextIntegrity=jr['integrity'], mainLines=jr['scriptureLinesShown'], relatedCards=cards, contextLines=ctxl,
                               alteredGurbaniDisplayed=any('ਭੋਗੁ' in x for x in cards + ctxl), anyWarning=jr['integrity'] == 'failed')
    c.close()
    c = b.new_context(**d, service_workers='block'); pg = c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:120]))
    pg.route('**/js/content.js*', lambda rt, *a: rt.fulfill(status=200, content_type='text/javascript', body=cbad))
    pg.goto(B + 'pauri-2-lesson.html', wait_until='networkidle'); time.sleep(1.5)
    body = pg.inner_text('body')
    oth['older_pauri2_lesson_page'] = dict(alteredGurbaniDisplayed=('ਹੁਕਮੀ ਹੋਵਨਿ ਅਕਾਰ' in body), genuineLineDisplayed=('ਹੁਕਮੀ ਹੋਵਨਿ ਆਕਾਰ' in body),
                                           bodyHead=body.replace('\n', ' | ')[:260], page_errors=errs[:2])
    pg.screenshot(path=f"{SHOTS}rt1b_{LABEL}_pauri2_lesson_altered.png"); c.close()
    R['gurbani_from_unchecked_file'] = oth
    # ---------- 6. added waiting before the first line appears (processor slowed 4x and 6x)
    wait = {}
    for name, r in READERS.items():
        for rate in (1, 4, 6):
            ts = []
            for rep in range(3):
                c = b.new_context(**d, service_workers='block'); pg = c.new_page(); cdp = c.new_cdp_session(pg)
                cdp.send('Emulation.setCPUThrottlingRate', {'rate': rate})
                pg.add_init_script("window.__t0 = performance.now(); new MutationObserver((m, o) => { if (document.querySelector('%s')) { window.__first = performance.now(); o.disconnect(); } }).observe(document, {childList: true, subtree: true});" % r['lines'].replace("'", "\\'"))
                pg.goto(B + r['page'], wait_until='load')
                for _ in range(200):
                    v = pg.evaluate('window.__first || null')
                    if v: break
                    time.sleep(0.1)
                ts.append(round(pg.evaluate('window.__first - window.__t0')) if v else None); c.close()
            wait[f'{name}:cpu_x{rate}'] = dict(ms_runs=ts, ms_median=sorted(x for x in ts if x is not None)[len([x for x in ts if x is not None]) // 2] if any(ts) else None)
    R['ms_from_page_start_to_first_scripture_line'] = wait
    b.close()
json.dump(R, open(OUT, 'w'), ensure_ascii=False, indent=1)
print(json.dumps({k: R[k] for k in ('filesInOfflineList',)}, ensure_ascii=False))
print('OFFLINE genuine:', {k: (v.get('integrity'), v.get('scriptureLinesShown'), v.get('controlled')) if isinstance(v, dict) and 'integrity' in v else v for k, v in R['offline_genuine'].items()})
for k, v in R['offline_copy_damaged'].items():
    if k.startswith('nitnem'): print('DAMAGED', k, v); continue
    print('DAMAGED', k, v['action'], '|', {s: (v[s]['integrity'], v[s]['scriptureLinesShown'], 'ALTERED-SHOWN' if v[s]['alteredTextDisplayed'] else 'not shown') for s in ('reload_online_1', 'reload_online_2', 'after_update_check')}, '|', v.get('after_update_check_message'))
print('LATE', json.dumps(R['late_changes'], ensure_ascii=False)[:1500])
for k, v in R['failure_screen'].items(): print('FAILSCREEN', k, {x: v[x] for x in ('integrity', 'message', 'statusText', 'visibleLinks', 'buttons', 'retryControl', 'exportReachable')})
print('UNCHECKED', json.dumps(R['gurbani_from_unchecked_file'], ensure_ascii=False)[:1600])
print('WAIT', json.dumps(R['ms_from_page_start_to_first_scripture_line']))
