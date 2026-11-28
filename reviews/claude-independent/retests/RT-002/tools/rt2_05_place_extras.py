"""RT-002 / CI-R-11 b, c, d: the Japji reading place beyond the first measurement.
 b. From Pauri 5, 20 and 38; in Read, Meaning and Study; at 320 and 390 pixels wide; at normal and largest text: reload twice
    and press Back once — does the bar name the same line and is the stored place the same?
 b2. The same with the "kept aside" notice showing: and is the line being read clear of the notice?
 c. When is the place written after opening? Every write to storage in the first 3 seconds is logged.
 d. Sukhmani and Nitnem readers: stored record before and after two reloads with no touch, on this candidate and on the published version.
Chromium, made-up notes only.   Usage: python3 rt2_05_place_extras.py <candidate base-url> <published base-url> <out.json>"""
import itertools, json, sys, time
from playwright.sync_api import sync_playwright
B, PUB, OUT = sys.argv[1:4]; KEY = 'glp001.continuous.v2'; ARCH = 'glp001.continuous.retained.v1'
ARCHIVE = json.dumps({'version': 1, 'keptAside': {'notes': [{'id': 'nope.line99', 'text': 'KEPT-ASIDE-NOTE', 'reason': 'unknown_line'}], 'bookmarks': []}})
STATE = """(() => { const s = JSON.parse(localStorage.getItem('glp001.continuous.v2') || '{}'); const d = document.getElementById('dock-position'); const n = document.getElementById('retained-learning');
  const row = [...document.querySelectorAll('.scripture-line')].find(r => r.dataset.occurrence === (s.read && s.read.id)); const rr = row ? row.getBoundingClientRect() : null; const nb = n && !n.hidden ? n.getBoundingClientRect().bottom : 0;
  return {bar: (d.getAttribute('aria-label') || d.textContent).trim().replace('. Jump to a passage', ''), stored: s.read ? s.read.id : null, namedLineTop: rr ? Math.round(rr.top) : null, noticeBottom: Math.round(nb), pixelsOfNamedLineUnderTheNotice: rr ? Math.max(0, Math.round(Math.min(rr.bottom, nb) - rr.top)) : null}; })()"""
R = {'note': 'emulation only (Chromium); made-up notes only', 'b_place': [], 'b2_with_notice': []}
def jump(pg, name):
    if pg.evaluate("getComputedStyle(document.getElementById('dock-position')).display") != 'none': pg.click('#dock-position')
    else: pg.click('#tools-open'); time.sleep(0.4); pg.evaluate("[...document.querySelectorAll('dialog[open] button')].find(b => b.textContent.trim().startsWith('Jump to a passage')).click()")
    time.sleep(0.5); pg.evaluate("([t]) => [...document.querySelectorAll('dialog[open] button')].find(b => b.textContent.trim().startsWith(t + 'Ang')).click()", [name]); time.sleep(0.6)
    pg.evaluate("document.querySelector('dialog[open] #dialog-close')?.click()"); time.sleep(1.6)
with sync_playwright() as p:
    b = p.chromium.launch()
    def trial(width, height, mode, size, start, archive=None):
        c = b.new_context(viewport={'width': width, 'height': height}, service_workers='block'); c.set_default_timeout(8000); pg = c.new_page()
        pg.goto(B + 'index.html'); pg.evaluate('([a, b, k1, k2]) => { localStorage.setItem(k1, a); if (b) localStorage.setItem(k2, b); }', [json.dumps({'version': 2, 'mode': mode, 'size': size, 'notes': {}, 'bookmarks': []}), archive, KEY, ARCH])
        pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.4); jump(pg, start); seq = [pg.evaluate(STATE)]
        for _ in range(2): pg.reload(wait_until='networkidle'); time.sleep(2.0); seq.append(pg.evaluate(STATE))
        pg.goto(B + 'index.html', wait_until='networkidle'); time.sleep(0.5); pg.go_back(wait_until='networkidle'); time.sleep(2.0); seq.append(pg.evaluate(STATE))
        c.close(); return dict(window=f'{width}x{height}', mode=mode, textSize=size, start=start, afterJump=seq[0], afterReload1=seq[1], afterReload2=seq[2], afterBack=seq[3], sameLineEveryTime=all(s['bar'] == seq[0]['bar'] and s['stored'] == seq[0]['stored'] for s in seq), mostOfNamedLineUnderNotice=max(s['pixelsOfNamedLineUnderTheNotice'] or 0 for s in seq))
    for (w, h), mode, size, start in itertools.product(((320, 568), (390, 844)), ('read', 'meaning', 'study'), (30, 48), ('Pauri 5', 'Pauri 20', 'Pauri 38')):
        R['b_place'].append(trial(w, h, mode, size, start))
    print('b: same line every time in', sum(t['sameLineEveryTime'] for t in R['b_place']), 'of', len(R['b_place']), '| failing:', [(t['window'], t['mode'], t['textSize'], t['start'], t['afterJump']['bar'], t['afterReload1']['bar'], t['afterReload2']['bar'], t['afterBack']['bar']) for t in R['b_place'] if not t['sameLineEveryTime']][:6], flush=True)
    for (w, h), mode, start in itertools.product(((320, 568), (390, 844)), ('read', 'meaning'), ('Pauri 5', 'Pauri 20', 'Pauri 38')):
        R['b2_with_notice'].append(trial(w, h, mode, 30, start, ARCHIVE))
    print('b2 (notice showing): same line every time in', sum(t['sameLineEveryTime'] for t in R['b2_with_notice']), 'of', len(R['b2_with_notice']), '| named line partly under the notice in', sum(t['mostOfNamedLineUnderNotice'] > 2 for t in R['b2_with_notice']), 'of', len(R['b2_with_notice']), '| worst overlap px', max(t['mostOfNamedLineUnderNotice'] for t in R['b2_with_notice']), '| example', json.dumps(R['b2_with_notice'][1])[:420], flush=True)
    # ---- c. when is the place written
    c = b.new_context(viewport={'width': 390, 'height': 844}, service_workers='block'); pg = c.new_page()
    pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.4); jump(pg, 'Pauri 20'); time.sleep(1.0); before = pg.evaluate(STATE)
    c.add_init_script("window.__writes = []; const _s = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { try { if (k === 'glp001.continuous.v2') window.__writes.push({ms: Math.round(performance.now()), place: JSON.parse(v).read && JSON.parse(v).read.id, scrollY: Math.round(scrollY)}); } catch (e) {} return _s.call(this, k, v); };")
    pg.reload(wait_until='networkidle'); time.sleep(3.0); R['c_writes_in_first_3_seconds'] = dict(placeBeforeReopening=before['stored'], writes=pg.evaluate('window.__writes'), placeAfter=pg.evaluate(STATE)['stored'])
    R['c_writes_in_first_3_seconds']['everyWriteKeptTheSamePlace'] = all(w['place'] == before['stored'] for w in R['c_writes_in_first_3_seconds']['writes']); print('c:', json.dumps(R['c_writes_in_first_3_seconds'])[:400], flush=True); c.close()
    # ---- d. the other two readers
    R['d_other_readers'] = {}
    for label, base in (('candidate', B), ('published', PUB)):
        c = b.new_context(viewport={'width': 390, 'height': 844}, service_workers='block'); c.set_default_timeout(8000); pg = c.new_page(); o = {}
        pg.goto(base + 'sukhmani.html', wait_until='networkidle'); time.sleep(3.0)
        for _ in range(8): pg.mouse.wheel(0, 900); time.sleep(0.1)
        time.sleep(2.0); snap = lambda: pg.evaluate("Object.fromEntries(Object.keys(localStorage).filter(k => /sukhmani|nitnem/.test(k)).sort().map(k => [k, localStorage.getItem(k)]))"); s0 = snap(); y0 = pg.evaluate('Math.round(scrollY)')
        pg.reload(wait_until='networkidle'); time.sleep(3.0); s1 = snap(); pg.reload(wait_until='networkidle'); time.sleep(3.0); s2 = snap()
        o['sukhmani'] = dict(scrolledTo=y0, storedRecordSameAfterTwoReloads=s0 == s1 == s2, scrollAfterTwoReloads=pg.evaluate('Math.round(scrollY)'), askedToResume=pg.evaluate("!!document.querySelector('dialog[open]') || /resume|continue/i.test((document.querySelector('[role=status]') || {}).textContent || '')"), recordKeys=sorted(s0))
        pg.goto(base + 'nitnem/index.html', wait_until='networkidle'); time.sleep(1.0); pg.click('button[data-open="sohila"]'); time.sleep(1.2)
        for _ in range(5): pg.mouse.wheel(0, 700); time.sleep(0.1)
        time.sleep(2.0); s0 = snap(); y0 = pg.evaluate('Math.round(scrollY)'); pg.reload(wait_until='networkidle'); time.sleep(2.5); s1 = snap(); pg.reload(wait_until='networkidle'); time.sleep(2.5); s2 = snap()
        o['nitnem_sohila'] = dict(scrolledTo=y0, storedRecordSameAfterTwoReloads=s0 == s1 == s2, scrollAfterTwoReloads=pg.evaluate('Math.round(scrollY)'), recordKeys=sorted(s0))
        R['d_other_readers'][label] = o; c.close(); print('d', label, json.dumps(o)[:420], flush=True)
    b.close()
json.dump(R, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
