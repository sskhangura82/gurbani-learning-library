import json, sys, os, tempfile
sys.path.insert(0, '/home/claude/work/tools')
from pw_common import *
BASE = 'http://127.0.0.1:8082/gurbani-learning-library/'
R = {}
XSS = '<img src=x onerror="window.__xss=1"><svg onload="window.__xss=2"></svg><b id="inj">B</b>'
def vis(pg): return pg.evaluate('''() => [...document.querySelectorAll('[role=status],[role=alert],.coverage-note,#storage-warning,.toast')].filter(e=>!e.hidden&&e.offsetParent!==null).map(e=>e.innerText.trim()).filter(Boolean)''')
with sync_playwright() as p:
    # ---------- JAPJI: what does a real saved record look like?
    s = Session(p); pg = s.page
    pg.goto(BASE + 'full-japji.html', wait_until='networkidle'); time.sleep(0.6)
    pg.click('#tools-open'); time.sleep(0.4)
    acts = pg.evaluate('[...document.querySelectorAll("#reader-dialog [data-action], #reader-dialog button")].map(b=>[b.dataset.action||"", b.innerText.trim().slice(0,40)])'); print('japji tools actions:', acts)
    pg.click('#reader-dialog [data-action="note"], #reader-dialog button:has-text("Keep a reflection here")'); time.sleep(0.5)
    print('japji note dialog:', pg.inner_text('#reader-dialog')[:700].replace('\n', ' | '))
    ta = pg.query_selector('#reader-dialog textarea')
    print(' textarea present:', bool(ta), '| disabled:', ta.is_disabled() if ta else None)
    if ta and not ta.is_disabled():
        ta.fill('JAPJI-SYNTH ' + XSS); time.sleep(1.2)
    rec = json.loads(pg.evaluate('localStorage.getItem("glp001.continuous.v2")')); print(' saved notes:', rec.get('notes'), '| status:', vis(pg))
    pg.keyboard.press('Escape'); pg.reload(wait_until='networkidle'); time.sleep(0.8)
    pg.click('#tools-open'); time.sleep(0.4)
    # find a saved-learning view
    for label in ['Saved', 'learning', 'bookmark', 'Bookmarks', 'reflections']:
        b = pg.query_selector(f'#reader-dialog button:has-text("{label}")')
        if b: print(' found button containing', label, ':', b.inner_text()[:50])
    pg.click('#reader-dialog button:has-text("Keep a reflection here")'); time.sleep(0.5)
    R['japji_note'] = dict(persisted=rec.get('notes'), textarea_value_after_reload=(pg.input_value('#reader-dialog textarea') if pg.query_selector('#reader-dialog textarea') else None), injected_element=pg.evaluate('!!document.querySelector("#inj")'), xss=pg.evaluate('window.__xss||null'), dialog=pg.inner_text('#reader-dialog')[:900].replace('\n', ' | '))
    print('JAPJI note', json.dumps(R['japji_note'], ensure_ascii=False)[:1500])
    s.shot('rt2_53_japji_note_dialog_pr40')
    exp_btn = pg.evaluate('[...document.querySelectorAll("#reader-dialog button, #reader-dialog a, #reader-dialog label")].map(b=>b.innerText.trim().slice(0,50))'); print(' controls in note dialog:', exp_btn)
    s.close()
    # ---------- JAPJI corrupt record
    for name, raw in [('truncated_json', '{"version":2,"notes":{"mool.line01":"KEEP-ME'), ('wrong_version', json.dumps({'version': 9, 'notes': {'mool.line01': 'KEEP-ME'}})), ('unknown_line', json.dumps({'version': 2, 'notes': {'nope.line99': 'KEEP-ME'}, 'bookmarks': ['nope.line98'], 'read': {'id': 'nope', 'offset': 0}}))]:
        s = Session(p); pg = s.page
        pg.goto(BASE + 'index.html'); pg.evaluate('([v]) => localStorage.setItem("glp001.continuous.v2", v)', [raw])
        pg.goto(BASE + 'full-japji.html', wait_until='networkidle'); time.sleep(0.8)
        after = pg.evaluate('localStorage.getItem("glp001.continuous.v2")')
        R['japji_corrupt_' + name] = dict(lines_rendered=pg.evaluate('document.querySelectorAll("#continuous-reader .scripture-line").length'), raw_unchanged=after == raw, raw_still_contains_note='KEEP-ME' in (after or ''), other_keys=pg.evaluate('Object.keys(localStorage)'), messages=vis(pg)[:4], page_errors=s.errors[:3], console=[c for c in s.console if c[0] == 'error'][:3])
        # scroll to trigger a position save and re-check
        for _ in range(5): pg.mouse.wheel(0, 900); time.sleep(0.05)
        time.sleep(1.5); after2 = pg.evaluate('localStorage.getItem("glp001.continuous.v2")')
        R['japji_corrupt_' + name]['raw_unchanged_after_scrolling'] = after2 == raw; R['japji_corrupt_' + name]['note_survives_after_scrolling'] = 'KEEP-ME' in (after2 or '') or any('KEEP-ME' in (pg.evaluate('([k])=>localStorage.getItem(k)', [k]) or '') for k in pg.evaluate('Object.keys(localStorage)'))
        print('JAPJI corrupt', name, json.dumps(R['japji_corrupt_' + name], ensure_ascii=False)[:700]); s.close()
    # ---------- SUKHMANI corrupt record
    for name, raw in [('truncated_json', '{"version":2,"notes":{"sukhmani.a01.p01.l02":"KEEP-ME'), ('unknown_line', json.dumps({'version': 2, 'read': 'sukhmani.a99.p01.l01', 'guide': 'x', 'notes': {'sukhmani.a99.p09.l01': 'KEEP-ME'}, 'bookmarks': ['zz']}))]:
        s = Session(p); pg = s.page
        pg.goto(BASE + 'index.html'); pg.evaluate('([v]) => localStorage.setItem("glp001.sukhmani.v1", v)', [raw])
        pg.goto(BASE + 'sukhmani.html', wait_until='networkidle'); time.sleep(1.0)
        for _ in range(5): pg.mouse.wheel(0, 900); time.sleep(0.05)
        time.sleep(1.5); after = pg.evaluate('localStorage.getItem("glp001.sukhmani.v1")')
        R['sukhmani_corrupt_' + name] = dict(lines_rendered=pg.evaluate('document.querySelectorAll("#sukhmani-text [data-line-id]").length'), raw_unchanged=after == raw, note_survives=any('KEEP-ME' in (pg.evaluate('([k])=>localStorage.getItem(k)', [k]) or '') for k in pg.evaluate('Object.keys(localStorage)')), keys=pg.evaluate('Object.keys(localStorage)'), messages=vis(pg)[:4], page_errors=s.errors[:3])
        print('SUKHMANI corrupt', name, json.dumps(R['sukhmani_corrupt_' + name], ensure_ascii=False)[:700]); s.close()
json.dump(R, open('/home/claude/work/rt2_original_saved_learning_test_on_pr40.json', 'w'), ensure_ascii=False, indent=1)
