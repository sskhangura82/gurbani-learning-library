"""RT-001 / CI-R-01 re-test on the builder's repair candidate (PR #40).
Independent reproduction by the second reviewer. Headless Chromium, phone emulation, synthetic learning only.
Usage: python3 rt1_integrity.py <base-url> <site-root> <out.json>
Variants:
  transport  – the bytes of a file are altered on the way to the browser
  object     – the source object is altered in memory before the reader starts (so whole-file checks cannot mask a missing run-time check)
  crypto     – WebCrypto is held pending, then released; and WebCrypto missing
  after      – attempts to change the source after it has been verified
"""
import json, sys, time, hashlib
from playwright.sync_api import sync_playwright

B, SITE, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
READERS = {
    'japji': dict(page='full-japji.html', data='js/japji-full-data.js', glob='GLP_FULL_JAPJI', units='units', textkey='text', root='#continuous-reader',
                  lines='#continuous-reader article.scripture-line', target='pauri01.line06', target_sel='[data-occurrence="pauri01.line06"] .tuk',
                  old='ਹੁਕਮਿ ਰਜਾਈ ਚਲਣਾ', new='ਹੁਕਮ ਰਜਾਈ ਚਲਣਾ', expect=385, key='glp001.continuous.v2'),
    'sukhmani': dict(page='sukhmani.html', data='js/sukhmani-data.js', glob='GLP_SUKHMANI', units='ashtpadis', textkey='gurmukhi', root='#sukhmani-text',
                     lines='#sukhmani-text [data-line-id]', target='sukhmani.a01.p01.l02', target_sel='[data-line-id="sukhmani.a01.p01.l02"] .tuk',
                     old='ਸਿਮਰਉ ਸਿਮਰਿ ਸਿਮਰਿ ਸੁਖੁ ਪਾਵਉ', new='ਸਿਮਰਉ ਸਿਮਰਿ ਸਿਮਰਿ ਦੁਖੁ ਪਾਵਉ', expect=2027, key='glp001.sukhmani.v1'),
}
MUTATOR = r'''
(() => { const P = __PARAMS__; let stored; let assigned = 0;
  function mutate(d) {
    const units = d[P.units]; let u, i;
    for (const unit of units) { const k = unit.lines.findIndex(l => l.id === P.target); if (k >= 0) { u = unit; i = k; break; } }
    const L = u.lines[i];
    switch (P.kind) {
      case 'control_no_change': break;
      case 'text_changed_line_hash_stale': L[P.textkey] = L[P.textkey].replace(P.old, P.new); break;
      case 'text_changed_line_hash_recomputed': L[P.textkey] = L[P.textkey].replace(P.old, P.new); L.sha256 = P.newsha; break;
      case 'line_removed': u.lines.splice(i, 1); break;
      case 'line_removed_counts_adjusted': u.lines.splice(i, 1); if (d.coverage && d.coverage.gurmukhiLines) d.coverage.gurmukhiLines--; if (d.lineCount) d.lineCount--; if (u.lineCount) u.lineCount--; break;
      case 'two_lines_swapped': [u.lines[i], u.lines[i + 1]] = [u.lines[i + 1], u.lines[i]]; break;
      case 'line_duplicated': u.lines.splice(i, 0, JSON.parse(JSON.stringify(L))); break;
      case 'line_id_changed': L.id = L.id + 'x'; break;
      case 'unit_removed': units.splice(5, 1); break;
      case 'two_units_swapped': [units[5], units[6]] = [units[6], units[5]]; break;
      case 'ang_changed': L.ang = (L.ang || 1) + 1; break;
      case 'source_line_changed': L.sourceLine = (typeof L.sourceLine === 'number' ? L.sourceLine : 1) + 1; break;
      case 'other_field_changed': { const k = Object.keys(u).find(k => typeof u[k] === 'string' && k !== 'id'); u[k] = u[k] + ' '; window.__mutatedField = k; } break;
      case 'extra_field_added': L.reviewer_added = 'x'; break;
      case 'accessor_that_changes_later': { const real = L[P.textkey]; let n = 0; Object.defineProperty(L, P.textkey, {enumerable: true, configurable: true, get() { return (n++ < 1) ? real : real.replace(P.old, P.new); }}); } break;
      case 'first_line_of_last_unit_changed': { const lu = units[units.length - 1]; const ll = lu.lines[lu.lines.length - 1]; ll[P.textkey] = ll[P.textkey] + ' '; } break;
    }
    return d;
  }
  Object.defineProperty(window, P.glob, {configurable: true, enumerable: true, get() { return stored; }, set(v) { assigned++; window.__assigned = assigned; stored = mutate(v); }});
})();
'''
PENDING = r'''
(() => { const real = crypto.subtle.digest.bind(crypto.subtle); const waiters = []; let open = false; window.__digestCalls = 0;
  crypto.subtle.digest = function (...a) { window.__digestCalls++; if (open) return real(...a); return new Promise((res, rej) => waiters.push(() => real(...a).then(res, rej))); };
  window.__release = () => { open = true; waiters.splice(0).forEach(f => f()); };
})();
'''
NOCRYPTO = "Object.defineProperty(Crypto.prototype, 'subtle', {configurable: true, get() { return undefined; }});"

def probe(pg, r):
    return pg.evaluate('''([root, lines, tsel]) => { const el = document.querySelector(root); const t = document.querySelector(tsel);
        const ctr = [...document.querySelectorAll('button,input,select')]; const vis = ctr.filter(c => { const b = c.getBoundingClientRect(); return b.width > 0 && b.height > 0; });
        return {integrity: el ? el.dataset.sourceIntegrity || null : null, scriptureLinesShown: document.querySelectorAll(lines).length, targetLineShown: t ? t.textContent : null,
                message: el ? el.innerText.replace(/\\s+/g, ' ').trim().slice(0, 170) : null, role: el ? el.getAttribute('role') : null, busy: el ? el.getAttribute('aria-busy') : null,
                visibleControls: vis.length, visibleControlsEnabled: vis.filter(c => !c.disabled).length, receipt: !!window.GLP_SOURCE_INTEGRITY_RECEIPT, assigned: window.__assigned || 0, digestCalls: window.__digestCalls || 0}; }''', [r['root'], r['lines'], r['target_sel']])
def storage(pg): return pg.evaluate('JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)])))')

R = {'base': B, 'results': {}}
with sync_playwright() as p:
    for name, r in READERS.items():
        res = {}
        raw = open(SITE + r['data'], encoding='utf-8').read()
        b = p.chromium.launch(); d = dict(p.devices['iPhone 14']); d['service_workers'] = 'block'
        def fresh(init=None):
            c = b.new_context(**d); pg = c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:140]))
            if init: pg.add_init_script(init)
            return c, pg, errs
        # seed synthetic saved learning on the genuine build, to prove later that a failed check does not touch it
        c, pg, errs = fresh(); pg.goto(B + 'index.html', wait_until='load')
        if name == 'japji':
            pg.evaluate('''() => localStorage.setItem('glp001.continuous.v2', JSON.stringify({version: 2, notes: {'mool.line01': 'RT1-SYNTHETIC-NOTE'}, bookmarks: ['mool.line01']}))''')
        pg.goto(B + r['page'], wait_until='networkidle'); time.sleep(1.5)
        if name == 'sukhmani':
            pg.click('#sukhmani-text [data-line-id] >> nth=3'); time.sleep(0.5)
            bm = pg.get_by_role('button', name='Bookmark this line')
            if bm.count(): bm.first.click(); time.sleep(0.4)
            pg.keyboard.press('Escape'); time.sleep(1.2)
        res['genuine'] = probe(pg, r); res['genuine']['page_errors'] = errs[:2]
        seeded = storage(pg); res['genuine']['seededKeys'] = list(json.loads(seeded).keys())
        state = c.storage_state(); c.close()
        def run(kind, init=None, route=None, wait=2.5, after=None):
            c = b.new_context(**d, storage_state=state); pg = c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:140]))
            if init: pg.add_init_script(init)
            if route:
                for pat, body, status in route:
                    pg.route(pat, (lambda _b, _s: (lambda rt, *a: rt.fulfill(status=_s, content_type='text/javascript', body=_b)))(body, status))
            before = storage(pg) if False else seeded
            pg.goto(B + r['page'], wait_until='networkidle'); time.sleep(wait)
            out = probe(pg, r)
            if after: out.update(after(pg))
            pg.mouse.wheel(0, 1500); time.sleep(1.2)
            out['savedLearningUnchanged'] = (storage(pg) == seeded); out['page_errors'] = errs[:2]
            out['alteredTextDisplayed'] = (out['targetLineShown'] is not None and r['new'] in out['targetLineShown'])
            res[kind] = out; c.close()
        # ---- transport: altered bytes
        run('transport:one_word_changed', route=[('**/' + r['data'] + '*', raw.replace(r['old'], r['new'], 1), 200)])
        run('transport:file_cut_in_half', route=[('**/' + r['data'] + '*', raw[:len(raw) // 2], 200)])
        run('transport:file_empty', route=[('**/' + r['data'] + '*', '', 200)])
        run('transport:file_missing_404', route=[('**/' + r['data'] + '*', 'not found', 404)])
        stub = 'window.GLPSourceIntegrity={verify:async()=>({schema:"fake"})};'
        run('transport:verifier_replaced_by_permissive_stub_and_word_changed', route=[('**/js/source-integrity.js*', stub, 200), ('**/' + r['data'] + '*', raw.replace(r['old'], r['new'], 1), 200)])
        run('transport:verifier_missing_404', route=[('**/js/source-integrity.js*', 'not found', 404)])
        # ---- object: altered in memory before the reader starts (whole-file check cannot see it)
        newtext_sha = None
        i = raw.index('=', raw.index('window.')) + 1; obj = json.loads(raw[i:].strip().rstrip(';'))
        for u in obj[r['units']]:
            for ln in u['lines']:
                if ln['id'] == r['target']: newtext_sha = hashlib.sha256(ln[r['textkey']].replace(r['old'], r['new']).encode('utf-8')).hexdigest()
        for kind in ['control_no_change', 'text_changed_line_hash_stale', 'text_changed_line_hash_recomputed', 'line_removed', 'line_removed_counts_adjusted', 'two_lines_swapped', 'line_duplicated',
                     'line_id_changed', 'unit_removed', 'two_units_swapped', 'ang_changed', 'source_line_changed', 'other_field_changed', 'extra_field_added', 'accessor_that_changes_later', 'first_line_of_last_unit_changed']:
            params = dict(glob=r['glob'], units=r['units'], textkey=r['textkey'], target=r['target'], old=r['old'], new=r['new'], newsha=newtext_sha, kind=kind)
            run('object:' + kind, init=MUTATOR.replace('__PARAMS__', json.dumps(params, ensure_ascii=False)))
        # ---- crypto held pending, then released
        c = b.new_context(**d, storage_state=state); pg = c.new_page(); pg.add_init_script(PENDING)
        pg.goto(B + r['page'], wait_until='load'); time.sleep(3.0)
        pend = probe(pg, r); pg.evaluate('window.__release()'); time.sleep(3.5); rel = probe(pg, r)
        res['crypto:held_pending'] = pend; res['crypto:then_released'] = rel; c.close()
        run('crypto:webcrypto_unavailable', init=NOCRYPTO)
        # ---- after verification: try to change the source and force a re-draw
        def tamper_after(pg):
            out = pg.evaluate('''([glob, units, textkey, target, oldv, newv]) => { const d = window[glob]; let L; for (const u of d[units]) { const k = u.lines.find(l => l.id === target); if (k) L = k; }
                let threw = false; try { L[textkey] = L[textkey].replace(oldv, newv); } catch (e) { threw = true; }
                return {sourceObjectFrozen: Object.isFrozen(d) && Object.isFrozen(L), assignmentIgnoredOrThrew: threw || !L[textkey].includes(newv)}; }''', [r['glob'], r['units'], r['textkey'], r['target'], r['old'], r['new']])
            for sel in ('button[data-depth="understand"]', 'button[data-depth="study"]', 'button[data-depth="read"]', 'button[data-mode="meaning"]', 'button[data-mode="read"]'):
                bq = pg.query_selector(sel)
                if bq and not bq.is_disabled():
                    try: bq.click(timeout=2000); time.sleep(0.8)
                    except Exception: pass
            t = pg.query_selector(r['target_sel']); out['targetAfterRedraw'] = t.text_content() if t else None
            return out
        run('after:mutate_verified_source_then_redraw', after=tamper_after)
        b.close(); R['results'][name] = res
        ok = [k for k, v in res.items() if k.split(':')[0] in ('transport', 'object') and k != 'object:control_no_change']
        print(name, '| genuine lines', res['genuine']['scriptureLinesShown'], '| control', res['object:control_no_change']['scriptureLinesShown'], res['object:control_no_change']['integrity'],
              '| altered variants', len(ok), '| refused (0 lines, failed)', sum(1 for k in ok if res[k]['scriptureLinesShown'] == 0 and res[k]['integrity'] == 'failed'),
              '| any altered text shown', sum(1 for k in ok if res[k]['alteredTextDisplayed']), '| saved learning untouched', sum(1 for k in ok if res[k]['savedLearningUnchanged']))
json.dump(R, open(OUT, 'w'), ensure_ascii=False, indent=1)
