"""RT-002 / RT1-01, checks a–e and h: do kept-aside items survive when an OLDER copy of the Japji reader touches the saved record?
Same three made-up items as RT-001 (a note on an unknown line, a 12,500-character note, an unknown saved line). This time the
older copy is tried twice — the published reader (a3476ac) and the first candidate (09e829e) — and the items are looked for in
EVERYTHING the site stores and in what the reader SHOWS, not only in one record. Then: export, empty the browser, import;
the same backup three times; three more rounds of old copy / new copy.
Switchable local server on port 8090 (v1 published · vA first candidate · v5 the candidate under test). Chromium, phone emulation.
Usage: python3 rt2_01_older_copy_all_storage.py <out.json>"""
import json, os, sys, tempfile, time, urllib.request
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]; B = 'http://127.0.0.1:8090/gurbani-learning-library/'; KEY = 'glp001.continuous.v2'; LONG = 'L' * 12500
def switch(v): return urllib.request.urlopen('http://127.0.0.1:8090/__switch?root=' + v).read().decode()
ALL = "Object.fromEntries(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)]))"
def where(pg):
    s = pg.evaluate(ALL); f = lambda t: sorted(k for k, v in s.items() if t in (v or ''))
    return dict(keysStored=sorted(s), unknownNoteIn=f('KEEP-ME'), longNoteCompleteIn=f(LONG), unknownSavedLineIn=f('nope.line98'))
def all_three(w): return bool(w['unknownNoteIn'] and w['longNoteCompleteIn'] and w['unknownSavedLineIn'])
def scroll(pg):
    for _ in range(5): pg.mouse.wheel(0, 900); time.sleep(0.05)
    time.sleep(1.5)
def version(pg): return pg.evaluate("fetch('sw.js', {cache: 'no-store'}).then(r => r.text()).then(t => (t.match(/const VERSION=\"([^\"]+)\"/) || [])[1])")
def open_saved(pg):
    if pg.evaluate("!!document.querySelector('dialog[open]')"): pg.keyboard.press('Escape'); time.sleep(0.3)
    pg.click('#tools-open'); time.sleep(0.3); pg.locator('#reader-dialog [data-action="reader-explore"]').click(); time.sleep(0.3); pg.locator('#reader-dialog [data-action="learning"]').click(); time.sleep(0.5)
def shown(pg):
    notice = pg.evaluate("(() => { const n = document.getElementById('retained-learning'); if (!n || n.hidden) return null; const r = n.getBoundingClientRect(); return {text: n.innerText.replace(/\\s+/g, ' ').trim(), width: Math.round(r.width), height: Math.round(r.height), top: Math.round(r.top)}; })()")
    open_saved(pg)
    s = pg.evaluate("(() => { const box = document.querySelector('dialog[open] #retained-learning-items'); if (!box) return null; return {text: box.innerText.replace(/\\s+/g, ' ').trim().slice(0, 400), noteTexts: [...box.querySelectorAll('textarea')].map(t => t.value)}; })()")
    pg.keyboard.press('Escape'); time.sleep(0.3)
    return dict(noticeOnScreen=notice, savedLearningScreenListsKeptAside=bool(s), unknownNoteShown=bool(s and 'KEEP-ME' in s['noteTexts']), longNoteShownComplete=bool(s and LONG in s['noteTexts']), unknownSavedLineShown=bool(s and 'nope.line98' in s['text']), listText=s and s['text'][:260])
def export(pg):
    open_saved(pg)
    with pg.expect_download(timeout=8000) as dl: pg.locator('#reader-dialog [data-action="export"]').click()
    raw = open(dl.value.path(), encoding='utf-8').read(); pg.keyboard.press('Escape'); time.sleep(0.3); return raw
def do_import(pg, path):
    open_saved(pg); pg.set_input_files('#import-file', path); pg.wait_for_selector('#import-preview [data-action="apply-import"]', timeout=6000)
    preview = pg.evaluate("document.getElementById('import-preview').innerText.replace(/\\s+/g, ' ').trim()"); pg.click('#import-preview [data-action="apply-import"]'); time.sleep(1.6)
    if pg.evaluate("!!document.querySelector('dialog[open]')"): pg.keyboard.press('Escape'); time.sleep(0.3)
    return preview
def counts(pg):
    s = pg.evaluate(ALL); out = {}
    for k, v in s.items():
        try: j = json.loads(v)
        except Exception: continue
        ka = j.get('keptAside') if isinstance(j, dict) else None
        if ka: out[k] = dict(notes=len(ka.get('notes', [])), savedLines=len(ka.get('bookmarks', [])))
    return out
R = {'note': 'emulation only (Chromium, iPhone 14 profile); made-up notes only', 'candidate': None, 'runs': {}}
with sync_playwright() as p:
    b = p.chromium.launch(); d = dict(p.devices['iPhone 14']); d['service_workers'] = 'block'; d['accept_downloads'] = True
    def fresh(c):
        pg = c.new_page(); cdp = c.new_cdp_session(pg); cdp.send('Network.enable'); cdp.send('Network.setCacheDisabled', {'cacheDisabled': True}); return pg
    for label, old in (('older copy = the published reader (a3476ac)', 'v1'), ('older copy = the first candidate (09e829e)', 'vA')):
        o = {}
        # ---- route 1: roll back, read a little, roll forward
        c = b.new_context(**d); pg = fresh(c)
        switch('v5'); pg.goto(B + 'index.html'); R['candidate'] = version(pg)
        pg.evaluate('([k, v]) => localStorage.setItem(k, v)', [KEY, json.dumps({'version': 2, 'notes': {'nope.line99': 'KEEP-ME', 'pauri01.line06': LONG}, 'bookmarks': ['nope.line98']})])
        pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.2); scroll(pg); o['1_on_the_candidate'] = where(pg)
        switch(old); pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.2); scroll(pg); w = where(pg); w['olderCopyServed'] = version(pg); o['2_after_rolling_back_and_reading_a_little'] = w
        switch('v5'); pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.5); w = where(pg); w.update(shown(pg)); w['allThreeInStorage'] = all_three(w); w['allThreeShown'] = w['unknownNoteShown'] and w['longNoteShownComplete'] and w['unknownSavedLineShown']; o['3_after_rolling_forward'] = w
        # ---- c + h: export, empty the browser, import
        raw = export(pg); o['4_export'] = dict(characters=len(raw), holdsUnknownNote='KEEP-ME' in raw, holdsLongNoteComplete=LONG in raw, holdsUnknownSavedLine='nope.line98' in raw, recordsInFile=sorted(json.loads(raw)['records']))
        path = os.path.join(tempfile.mkdtemp(), 'Gurbani-learning.json'); open(path, 'w', encoding='utf-8').write(raw)
        pg.evaluate('localStorage.clear()'); pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.2); o['5_browser_emptied'] = where(pg)
        preview = do_import(pg, path); w = where(pg); w.update(shown(pg)); w['whatTheImportSaidBeforeMerging'] = preview[:300]; w['saysHowManyKeptAside'] = any(ch.isdigit() for ch in preview) and 'kept' in preview.lower(); w['allThreeInStorage'] = all_three(w); w['allThreeShown'] = w['unknownNoteShown'] and w['longNoteShownComplete'] and w['unknownSavedLineShown']; o['6_after_import_into_the_empty_browser'] = w
        # ---- d: the same backup three times, then three rounds of old copy / new copy
        seq = [counts(pg)]
        for _ in range(3): do_import(pg, path); seq.append(counts(pg))
        for _ in range(3):
            switch(old); pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.0); scroll(pg)
            switch('v5'); pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.2); scroll(pg); seq.append(counts(pg))
        w = where(pg); o['7_same_backup_three_times_then_three_rounds'] = dict(keptAsideCountsAfterEachStep=seq, countNeverGrew=all(s == seq[0] for s in seq), allThreeStillInStorage=all_three(w))
        c.close()
        # ---- route 2: a tab from before the update is still open
        c = b.new_context(**d); t = {}
        switch(old); A = fresh(c); A.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.2)
        A.click('#tools-open'); time.sleep(0.3); A.locator('#reader-dialog [data-action="note"]').first.click(); time.sleep(0.5); A.fill('#reader-dialog textarea', 'NOTE-WRITTEN-IN-THE-OLD-TAB'); time.sleep(1.3); A.keyboard.press('Escape'); time.sleep(0.4)
        switch('v5'); N = fresh(c); N.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.2)
        cur = json.loads(N.evaluate('([k]) => localStorage.getItem(k)', [KEY])); cur['keptAside'] = {'notes': [{'id': 'nope.line99', 'text': 'KEEP-ME', 'reason': 'unknown_line'}, {'id': 'pauri01.line06', 'text': LONG, 'reason': 'long_reflection'}], 'bookmarks': ['nope.line98']}
        path2 = os.path.join(tempfile.mkdtemp(), 'backup.json'); json.dump({'format': 'glp-family-learning', 'version': 1, 'projectId': 'GLP-001', 'records': {KEY: json.dumps(cur)}}, open(path2, 'w'))
        do_import(N, path2); t['1_after_restoring_a_backup_in_the_new_tab'] = where(N)
        A.bring_to_front(); time.sleep(0.4); scroll(A); w = where(A); w['ordinaryNoteWrittenInTheOldTabStillThere'] = 'NOTE-WRITTEN-IN-THE-OLD-TAB' in json.dumps(A.evaluate(ALL)); w['anyMessageInTheOldTab'] = A.evaluate("(document.getElementById('status') || {}).textContent || ''")[:140]; t['2_after_reading_on_in_the_old_tab'] = w
        N.bring_to_front(); time.sleep(0.8); w = where(N); w.update(shown(N)); w['allThreeInStorage'] = all_three(w); w['allThreeShown'] = w['unknownNoteShown'] and w['longNoteShownComplete'] and w['unknownSavedLineShown']; t['3_back_in_the_new_tab_without_reloading'] = w
        A.close(); N.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.5); w = where(N); w.update(shown(N)); w['allThreeInStorage'] = all_three(w); w['allThreeShown'] = w['unknownNoteShown'] and w['longNoteShownComplete'] and w['unknownSavedLineShown']; w['ordinaryNoteWrittenInTheOldTabStillThere'] = 'NOTE-WRITTEN-IN-THE-OLD-TAB' in json.dumps(N.evaluate(ALL)); t['4_new_reader_reopened_after_the_old_tab_is_closed'] = w
        c.close(); R['runs'][label] = dict(rollback=o, old_tab_left_open=t)
        print(label); print('  rollback: in storage', o['3_after_rolling_forward']['allThreeInStorage'], '| shown', o['3_after_rolling_forward']['allThreeShown'], '| export holds all', all(o['4_export'][k] for k in ('holdsUnknownNote', 'holdsLongNoteComplete', 'holdsUnknownSavedLine')), '| after empty+import: in storage', o['6_after_import_into_the_empty_browser']['allThreeInStorage'], 'shown', o['6_after_import_into_the_empty_browser']['allThreeShown'], '| count never grew', o['7_same_backup_three_times_then_three_rounds']['countNeverGrew'])
        print('  old tab : in storage', t['4_new_reader_reopened_after_the_old_tab_is_closed']['allThreeInStorage'], '| shown', t['4_new_reader_reopened_after_the_old_tab_is_closed']['allThreeShown'], '| ordinary note kept', t['4_new_reader_reopened_after_the_old_tab_is_closed']['ordinaryNoteWrittenInTheOldTabStillThere'], '| while old tab open, items anywhere:', all_three(t['2_after_reading_on_in_the_old_tab']), flush=True)
    b.close()
switch('v1'); json.dump(R, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
