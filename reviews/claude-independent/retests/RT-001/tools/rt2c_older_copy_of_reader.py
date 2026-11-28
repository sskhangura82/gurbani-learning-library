"""RT-001 / CI-R-02: do kept-aside items survive when an OLDER copy of the Japji reader touches the same saved record?
Two ordinary ways that happens: (1) the owner rolls the site back to the previous version; (2) a tab opened before the update is still open.
Uses the switchable local server on port 8090 (v1 = published baseline a3476ac, v5 = PR #40 head). Synthetic notes only.
Usage: python3 rt2c_older_copy_of_reader.py <out.json>"""
import json, sys, time, urllib.request
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]; B = 'http://127.0.0.1:8090/gurbani-learning-library/'; KEY = 'glp001.continuous.v2'
def switch(v): return urllib.request.urlopen('http://127.0.0.1:8090/__switch?root=' + v).read().decode()
def rec(pg):
    raw = pg.evaluate('([k]) => localStorage.getItem(k)', [KEY])
    try: return raw, json.loads(raw)
    except Exception: return raw, None
def which(pg): return pg.evaluate("document.querySelector('#continuous-reader').dataset.sourceIntegrity ? 'repair candidate' : 'published baseline'")
def scroll(pg):
    for _ in range(5): pg.mouse.wheel(0, 900); time.sleep(0.05)
    time.sleep(1.5)
R = {}
with sync_playwright() as p:
    b = p.chromium.launch(); d = dict(p.devices['iPhone 14']); d['service_workers'] = 'block'
    # ---- 1. roll back, then roll forward again
    c = b.new_context(**d); pg = c.new_page(); o = {}
    # the local test server answers "not changed" by file date, which would leave a mixture of versions in the browser's short-term cache; switch that cache off
    cdp = c.new_cdp_session(pg); cdp.send('Network.enable'); cdp.send('Network.setCacheDisabled', {'cacheDisabled': True})
    switch('v5'); pg.goto(B + 'index.html'); pg.evaluate('([k, v]) => localStorage.setItem(k, v)', [KEY, json.dumps({'version': 2, 'notes': {'nope.line99': 'KEEP-ME', 'pauri01.line06': 'L' * 12500}, 'bookmarks': ['nope.line98']})])
    pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.2); scroll(pg); raw, r = rec(pg)
    o['on_repair_candidate'] = dict(reader=which(pg), recordVersionNumber=r.get('version'), keptAsideNotes=[(n['id'], n['reason'], len(n['text'])) for n in r['keptAside']['notes']], keptAsideBookmarks=r['keptAside']['bookmarks'])
    switch('v1'); pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.2); raw1, r1 = rec(pg)
    o['after_roll_back_on_open'] = dict(reader=which(pg), keptAsideStillInRecord=bool(r1 and r1.get('keptAside')), unknownNoteTextAnywhere=('KEEP-ME' in (raw1 or '')), longNoteCompleteAnywhere=(('L' * 12500) in (raw1 or '')))
    scroll(pg); raw2, r2 = rec(pg)
    o['after_roll_back_and_a_little_reading'] = dict(keptAsideStillInRecord=bool(r2 and r2.get('keptAside')), unknownNoteTextAnywhere=('KEEP-ME' in (raw2 or '')), longNoteCompleteAnywhere=(('L' * 12500) in (raw2 or '')), unknownBookmarkAnywhere=('nope.line98' in (raw2 or '')),
                                                     anyMessage=pg.evaluate("[...document.querySelectorAll('[role=status],[role=alert],.coverage-note')].filter(e => !e.hidden).map(e => e.innerText.trim()).filter(t => /recover|kept|saved learning|newer/i.test(t)).slice(0, 2)"))
    switch('v5'); pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.2); raw3, r3 = rec(pg)
    o['after_rolling_forward_again'] = dict(reader=which(pg), unknownNoteTextAnywhere=('KEEP-ME' in (raw3 or '')), longNoteCompleteAnywhere=(('L' * 12500) in (raw3 or '')), keptAside=r3.get('keptAside') and {'notes': len(r3['keptAside']['notes']), 'bookmarks': len(r3['keptAside']['bookmarks'])})
    R['rollback'] = o; c.close()
    # ---- 2. a tab from before the update is still open
    c = b.new_context(**d); o = {}
    switch('v1'); A = c.new_page(); cdpA = c.new_cdp_session(A); cdpA.send('Network.enable'); cdpA.send('Network.setCacheDisabled', {'cacheDisabled': True}); A.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.2)
    A.click('#tools-open'); time.sleep(0.3); A.locator('#reader-dialog [data-action="note"]').first.click(); time.sleep(0.5); A.fill('#reader-dialog textarea', 'NOTE-WRITTEN-IN-THE-OLD-TAB'); time.sleep(1.3); A.keyboard.press('Escape'); time.sleep(0.4)
    o['old_tab'] = which(A)
    switch('v5'); Bt = c.new_page(); cdpB = c.new_cdp_session(Bt); cdpB.send('Network.enable'); cdpB.send('Network.setCacheDisabled', {'cacheDisabled': True}); Bt.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.2); o['new_tab'] = which(Bt)
    # in the new tab the reader restores a backup that holds items it must keep aside
    cur = json.loads(Bt.evaluate('([k]) => localStorage.getItem(k)', [KEY])); cur['keptAside'] = {'notes': [{'id': 'nope.line99', 'text': 'KEEP-ME', 'reason': 'unknown_line'}], 'bookmarks': ['nope.line98']}
    import tempfile, os
    path = os.path.join(tempfile.mkdtemp(), 'backup.json'); json.dump({'format': 'glp-family-learning', 'version': 1, 'projectId': 'GLP-001', 'records': {KEY: json.dumps(cur)}}, open(path, 'w'))
    Bt.click('#tools-open'); time.sleep(0.3); Bt.locator('#reader-dialog [data-action="reader-explore"]').click(); time.sleep(0.3); Bt.locator('#reader-dialog [data-action="learning"]').click(); time.sleep(0.4)
    Bt.set_input_files('#import-file', path); Bt.wait_for_selector('#import-preview [data-action="apply-import"]', timeout=6000); Bt.click('#import-preview [data-action="apply-import"]'); time.sleep(1.6)
    raw, r = rec(Bt); o['after_restore_in_new_tab'] = dict(keptAsideNotes=len((r.get('keptAside') or {}).get('notes', [])), unknownNoteTextAnywhere=('KEEP-ME' in raw))
    # the person goes back to the old tab and simply keeps reading
    A.bring_to_front(); time.sleep(0.4); scroll(A); raw, r = rec(A)
    o['after_reading_on_in_the_old_tab'] = dict(keptAsideStillInRecord=bool(r and r.get('keptAside')), unknownNoteTextAnywhere=('KEEP-ME' in (raw or '')), unknownBookmarkAnywhere=('nope.line98' in (raw or '')), ordinaryNoteStillThere=('NOTE-WRITTEN-IN-THE-OLD-TAB' in (raw or '')),
                                                anyMessageInOldTab=A.evaluate("(document.getElementById('status') || {}).textContent || ''")[:120])
    Bt.bring_to_front(); time.sleep(0.6); o['new_tab_afterwards'] = dict(noticeText=Bt.evaluate("(() => { const n = document.getElementById('retained-learning'); return n && !n.hidden ? n.innerText.replace(/\\s+/g,' ').trim().slice(0, 80) : null; })()"), unknownNoteTextAnywhere=('KEEP-ME' in (Bt.evaluate('([k]) => localStorage.getItem(k)', [KEY]) or '')))
    R['old_tab_left_open'] = o; c.close(); b.close()
switch('v1')
json.dump(R, open(OUT, 'w'), ensure_ascii=False, indent=1)
print(json.dumps(R, ensure_ascii=False, indent=1))
