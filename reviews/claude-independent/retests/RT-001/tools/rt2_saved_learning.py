"""RT-001 / CI-R-02 re-test on the builder's repair candidate (PR #40): does the Japji reader still lose a saved note or bookmark?
Independent reproduction by the second reviewer. Headless Chromium, phone emulation. Every note here is synthetic test text.
Usage: python3 rt2_saved_learning.py <base-url> <out.json> <label>
"""
import json, sys, time, os, tempfile
from playwright.sync_api import sync_playwright
B, OUT, LABEL = sys.argv[1], sys.argv[2], sys.argv[3]
KEY = 'glp001.continuous.v2'; LEGACY = 'glp001.fullJapji.v1'
SHOTS = '/home/claude/work/shots/'
XSS = '<img src=x onerror="window.__xss=1"><svg onload="window.__xss=2"></svg><b id="inj">B</b>'
LONG = 'HEAD-MARK ' + ('synthetic reflection text ' * 520) + 'TAIL-MARK'          # 13,539 characters
R = {'label': LABEL, 'base': B, 'cases': {}}

def raw_of(pg, key=KEY): return pg.evaluate('([k]) => localStorage.getItem(k)', [key])
def parsed(raw):
    try: return json.loads(raw)
    except Exception: return None
def everything(pg): return pg.evaluate('JSON.stringify(Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)])))')
def notice(pg): return pg.evaluate('''() => { const n = document.getElementById('retained-learning'); if (!n || n.hidden) return null; const b = n.getBoundingClientRect();
    const seen = b.width >= 40 && b.height >= 20 && b.bottom > 0 && b.top < innerHeight; return (seen ? '[ON SCREEN] ' : '[IN THE PAGE BUT NOT VISIBLE: ' + Math.round(b.width) + 'x' + Math.round(b.height) + 'px] ') + n.innerText.replace(/\\s+/g, ' ').trim(); }''')
def status(pg): return pg.evaluate('''() => (document.getElementById('status') || {}).textContent || null''')
def lines(pg): return pg.evaluate('document.querySelectorAll("#continuous-reader article.scripture-line").length')
def close_dialog(pg):
    for _ in range(3):
        if pg.evaluate('!!(document.getElementById("reader-dialog") && document.getElementById("reader-dialog").open)'): pg.keyboard.press('Escape'); time.sleep(0.35)
def open_learning(pg):
    """the route a sighted reader has: the tools button in the bottom bar, then Explore, then Saved places & reflections"""
    close_dialog(pg)
    pg.click('#tools-open'); time.sleep(0.3); pg.locator('#reader-dialog [data-action="reader-explore"]').click(); time.sleep(0.3)
    pg.locator('#reader-dialog [data-action="learning"]').click()
    pg.wait_for_selector('#import-file', state='attached', timeout=6000); time.sleep(0.3)
def kept_on_screen(pg):
    return pg.evaluate('''() => { const s = document.getElementById('retained-learning-items'); if (!s) return null;
        return {heading: s.querySelector('h3') ? s.querySelector('h3').textContent : null, notes: [...s.querySelectorAll('details')].map(d => ({summary: d.querySelector('summary').textContent, reason: d.querySelector('p').textContent,
                 text: d.querySelector('textarea').value, readOnly: d.querySelector('textarea').readOnly})), bookmarks: [...s.querySelectorAll('li')].map(li => li.textContent)}; }''')
def all_text_in(rec):
    """every note text held anywhere in the record: in place or kept aside"""
    out = list((rec or {}).get('notes', {}).values()) if isinstance((rec or {}).get('notes'), dict) else []
    ka = (rec or {}).get('keptAside') or {}
    if isinstance(ka, dict): out += [n.get('text') for n in ka.get('notes', []) if isinstance(n, dict)]
    return out

with sync_playwright() as p:
    b = p.chromium.launch(); d = dict(p.devices['iPhone 14'])
    def ctx(): return b.new_context(**d, service_workers='block', accept_downloads=True)
    def seeded(seed, key=KEY):
        c = ctx(); pg = c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:160]))
        pg.goto(B + 'index.html', wait_until='load')
        for k, v in (seed.items() if isinstance(seed, dict) and key is None else [(key, seed)]): pg.evaluate('([k, v]) => localStorage.setItem(k, v)', [k, v])
        pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.2)
        return c, pg, errs
    def settle_and_scroll(pg):
        for _ in range(5): pg.mouse.wheel(0, 900); time.sleep(0.05)
        time.sleep(1.4)

    # ---- A. items the reader cannot place or edit
    A = {
        'note_and_bookmark_on_unknown_lines': json.dumps({'version': 2, 'notes': {'nope.line99': 'KEEP-ME'}, 'bookmarks': ['nope.line98'], 'read': {'id': 'nope', 'offset': 0}}),
        'note_longer_than_12000_on_a_real_line': json.dumps({'version': 2, 'notes': {'pauri01.line06': LONG}}),
        'note_of_exactly_12000': json.dumps({'version': 2, 'notes': {'pauri01.line06': 'E' * 12000}}),
        'note_of_12001': json.dumps({'version': 2, 'notes': {'pauri01.line06': 'F' * 12001}}),
        'older_section_note_meets_line_note_A_first': json.dumps({'version': 2, 'notes': {'pauri04': 'UNIT-NOTE-A', 'pauri04.line01': 'LINE-NOTE-B'}}),
        'older_section_note_meets_line_note_B_first': json.dumps({'version': 2, 'notes': {'pauri04.line01': 'LINE-NOTE-B', 'pauri04': 'UNIT-NOTE-A'}}),
        'older_section_note_identical_text': json.dumps({'version': 2, 'notes': {'pauri04': 'SAME-TEXT', 'pauri04.line01': 'SAME-TEXT'}}),
        'markup_inside_a_note_and_a_bookmark_name': json.dumps({'version': 2, 'notes': {'nope.line77': XSS}, 'bookmarks': [XSS]}),
    }
    for name, seed in A.items():
        c, pg, errs = seeded(seed); src = parsed(seed)
        settle_and_scroll(pg); after = raw_of(pg); rec = parsed(after)
        want = list(src['notes'].values()); have = all_text_in(rec)
        o = dict(linesShown=lines(pg), everyNoteTextStillStoredComplete=all(w in have for w in want), longestStored=max((len(x) for x in have), default=0),
                 inPlace=sorted((rec or {}).get('notes', {}).keys()), keptAside=[(n['id'], n['reason'], len(n['text'])) for n in ((rec or {}).get('keptAside') or {}).get('notes', [])],
                 keptAsideBookmarks=((rec or {}).get('keptAside') or {}).get('bookmarks', []), bookmarkNamesStillStored=all(x in json.dumps(rec, ensure_ascii=False) for x in [json.dumps(bm, ensure_ascii=False)[1:-1] for bm in src.get('bookmarks', [])]),
                 notice=notice(pg), page_errors=errs[:2])
        if o['keptAside'] or o['keptAsideBookmarks']:
            open_learning(pg); ks = kept_on_screen(pg)
            o['shownOnScreen'] = dict(heading=ks and ks['heading'], notes=[(n['summary'][:60], n['reason'], len(n['text']), n['readOnly']) for n in (ks or {}).get('notes', [])], bookmarks=[x[:60] for x in (ks or {}).get('bookmarks', [])])
            o['textOnScreenEqualsStoredText'] = bool(ks) and [n['text'] for n in ks['notes']] == [n['text'] for n in rec['keptAside']['notes']]
            o['scriptRan'] = pg.evaluate('window.__xss || null'); o['injectedElement'] = pg.evaluate('!!document.querySelector("#inj")')
            if name in ('note_and_bookmark_on_unknown_lines', 'note_longer_than_12000_on_a_real_line', 'markup_inside_a_note_and_a_bookmark_name'):
                pg.evaluate("document.querySelectorAll('#retained-learning-items details').forEach(d => d.open = true)"); time.sleep(0.2)
                pg.screenshot(path=f"{SHOTS}rt2_{LABEL}_{name}.png")
        R['cases']['A:' + name] = o; c.close()
        print('A', name, '| complete:', o['everyNoteTextStillStoredComplete'], '| in place', o['inPlace'], '| aside', o['keptAside'], o['keptAsideBookmarks'], '| notice:', (o['notice'] or '')[:70], '| on screen:', o.get('shownOnScreen', {}).get('notes'), o.get('textOnScreenEqualsStoredText'))

    # ---- B. records the reader cannot read at all: must be left exactly as they are
    Bc = {
        'cut_off_json': '{"version":2,"notes":{"mool.line01":"KEEP-ME',
        'newer_version': json.dumps({'version': 9, 'notes': {'mool.line01': 'KEEP-ME'}}),
        'kept_aside_is_text': json.dumps({'version': 2, 'notes': {'mool.line01': 'KEEP-ME'}, 'keptAside': 'x'}),
        'kept_aside_wrong_shape': json.dumps({'version': 2, 'notes': {'mool.line01': 'KEEP-ME'}, 'keptAside': {'notes': 'x', 'bookmarks': []}}),
        'kept_aside_unknown_reason': json.dumps({'version': 2, 'notes': {'mool.line01': 'KEEP-ME'}, 'keptAside': {'notes': [{'id': 'a', 'text': 'KEPT', 'reason': 'something_else'}], 'bookmarks': []}}),
        'kept_aside_extra_field': json.dumps({'version': 2, 'notes': {'mool.line01': 'KEEP-ME'}, 'keptAside': {'notes': [], 'bookmarks': [], 'more': 1}}),
        'notes_is_text': json.dumps({'version': 2, 'notes': 'KEEP-ME'}),
        'a_note_is_a_number': json.dumps({'version': 2, 'notes': {'mool.line01': 'KEEP-ME', 'mool.line02': 5}}),
        'bookmarks_is_text': json.dumps({'version': 2, 'notes': {'mool.line01': 'KEEP-ME'}, 'bookmarks': 'x'}),
        'a_bookmark_is_a_number': json.dumps({'version': 2, 'notes': {'mool.line01': 'KEEP-ME'}, 'bookmarks': [5]}),
    }
    for name, seed in Bc.items():
        c, pg, errs = seeded(seed); settle_and_scroll(pg); after = raw_of(pg)
        o = dict(linesShown=lines(pg), recordLeftExactlyAsItWas=(after == seed), notice=notice(pg), status=status(pg), page_errors=errs[:2])
        # can the reader still get a backup out, and what is in it?
        try:
            open_learning(pg)
            with pg.expect_download(timeout=8000) as dl: pg.locator('#reader-dialog [data-action="export"]').click()
            path = dl.value.path(); exp = json.load(open(path, encoding='utf-8')); o['backupContainsTheUnreadRecordExactly'] = (exp.get('records', {}).get(KEY) == seed)
        except Exception as e: o['backupContainsTheUnreadRecordExactly'] = 'could not export: ' + str(e)[:90]
        close_dialog(pg)
        # can the reader write a new note while in this state?
        try:
            pg.click('#tools-open'); time.sleep(0.3); pg.locator('#reader-dialog [data-action="note"]').first.click(); time.sleep(0.5)
            ta = pg.query_selector('#reader-dialog textarea'); o['noteBoxPresent'] = bool(ta); o['noteBoxEditable'] = bool(ta and not ta.is_disabled() and not pg.evaluate('(t) => t.readOnly', ta))
            if o['noteBoxEditable']: ta.fill('TYPED-WHILE-UNREADABLE'); time.sleep(1.3)
            o['dialogSays'] = pg.inner_text('#reader-dialog').replace('\n', ' | ')[-230:]
        except Exception as e: o['noteBoxPresent'] = 'error ' + str(e)[:80]
        close_dialog(pg); o['recordStillExactlyAsItWas_afterTryingToWrite'] = (raw_of(pg) == seed)
        if name == 'kept_aside_wrong_shape': pg.screenshot(path=f"{SHOTS}rt2_{LABEL}_unreadable_record.png")
        R['cases']['B:' + name] = o; c.close()
        print('B', name, '| untouched:', o['recordLeftExactlyAsItWas'], o['recordStillExactlyAsItWas_afterTryingToWrite'], '| backup exact:', o['backupContainsTheUnreadRecordExactly'], '| can type:', o.get('noteBoxEditable'), '| notice:', (o['notice'] or '')[:80])

    # ---- C. the record of the reader before this one (kept under another name), with items that cannot be placed
    leg = json.dumps({'schemaVersion': 2, 'unit': 5, 'line': 0, 'notes': {'pauri04': 'LEGACY-UNIT-NOTE', 'notaunit': 'LEGACY-UNKNOWN'}, 'bookmarks': ['pauri04', 'zzz']})
    c, pg, errs = seeded(leg, key=LEGACY); settle_and_scroll(pg); rec = parsed(raw_of(pg)); have = all_text_in(rec)
    R['cases']['C:older_reader_record'] = dict(olderRecordLeftExactlyAsItWas=(raw_of(pg, LEGACY) == leg), bothNotesStored=('LEGACY-UNIT-NOTE' in have and 'LEGACY-UNKNOWN' in have),
        inPlace=(rec or {}).get('notes'), keptAside=(rec or {}).get('keptAside'), bookmarks=(rec or {}).get('bookmarks'), notice=notice(pg), page_errors=errs[:2])
    print('C', json.dumps(R['cases']['C:older_reader_record'], ensure_ascii=False)[:500]); c.close()

    # ---- D. ordinary use alongside kept-aside items, then backup, wipe, restore, restore again
    c, pg, errs = seeded(A['note_and_bookmark_on_unknown_lines']); D = {}
    pg.click('#tools-open'); time.sleep(0.3); pg.locator('#reader-dialog [data-action="note"]').first.click(); time.sleep(0.5)
    pg.fill('#reader-dialog textarea', 'RT2-ORDINARY-NOTE'); time.sleep(1.3); close_dialog(pg)
    pg.click('#tools-open'); time.sleep(0.3); pg.locator('#reader-dialog [data-action="reader-save"]').click(); time.sleep(0.6); close_dialog(pg)
    pg.click('#tools-open'); time.sleep(0.3); pg.locator('#reader-dialog [data-action="reader-settings"]').click(); time.sleep(0.4)
    pg.select_option('#set-emphasis', 'line'); time.sleep(0.3); pg.select_option('#set-theme', 'amrit'); time.sleep(1.2); close_dialog(pg)
    pg.reload(wait_until='networkidle'); time.sleep(1.2); rec = parsed(raw_of(pg))
    D['after_ordinary_use_and_reload'] = dict(ordinaryNote=[k for k, v in rec['notes'].items() if v == 'RT2-ORDINARY-NOTE'], bookmarks=rec['bookmarks'], emphasis=rec['emphasis'], theme=rec['theme'], keptAside=rec['keptAside'], notice=notice(pg))
    open_learning(pg)
    with pg.expect_download(timeout=8000) as dl: pg.locator('#reader-dialog [data-action="export"]').click()
    backup = os.path.join(tempfile.mkdtemp(), 'Gurbani-learning.json'); dl.value.save_as(backup); exp = json.load(open(backup, encoding='utf-8')); inner = parsed(exp['records'][KEY])
    D['backup_file'] = dict(format=exp.get('format'), holdsOrdinaryNote=('RT2-ORDINARY-NOTE' in all_text_in(inner)), holdsKeptAsideNote=('KEEP-ME' in all_text_in(inner)), holdsKeptAsideBookmark=('nope.line98' in inner['keptAside']['bookmarks']), bytes=os.path.getsize(backup))
    close_dialog(pg); before_wipe = raw_of(pg)
    pg.evaluate('localStorage.clear()'); pg.reload(wait_until='networkidle'); time.sleep(1.0); D['after_wipe'] = dict(record=parsed(raw_of(pg)) and {k: parsed(raw_of(pg)).get(k) for k in ('notes', 'bookmarks', 'keptAside')})
    def restore(path):
        open_learning(pg); pg.set_input_files('#import-file', path); pg.wait_for_selector('#import-preview [data-action="apply-import"], #import-preview:not(:empty)', timeout=6000); time.sleep(0.3)
        said = pg.inner_text('#import-preview')[:160].replace('\n', ' | ')
        btn = pg.query_selector('#import-preview [data-action="apply-import"]')
        if btn: btn.click(); time.sleep(1.5)
        close_dialog(pg); return said
    D['restore_1_said'] = restore(backup); r1 = parsed(raw_of(pg))
    D['after_restore_1'] = dict(notes=r1['notes'], bookmarks=r1['bookmarks'], keptAside=r1['keptAside'], emphasis=r1.get('emphasis'), theme=r1.get('theme'))
    D['restore_2_said'] = restore(backup); r2 = parsed(raw_of(pg))
    D['after_restore_2_same_backup_again'] = dict(notes=r2['notes'], bookmarks=r2['bookmarks'], keptAside=r2['keptAside'])
    D['second_restore_changed_nothing'] = ({k: r1[k] for k in ('notes', 'bookmarks', 'keptAside')} == {k: r2[k] for k in ('notes', 'bookmarks', 'keptAside')})
    D['restored_equals_what_was_backed_up'] = ({k: r1[k] for k in ('notes', 'bookmarks', 'keptAside')} == {k: parsed(before_wipe)[k] for k in ('notes', 'bookmarks', 'keptAside')})
    # a backup from elsewhere holding a different note on the same line, short and then too long to combine
    other = dict(exp); o2 = json.loads(json.dumps(inner)); line = D['after_ordinary_use_and_reload']['ordinaryNote'][0]
    o2['notes'] = {line: 'RT2-OTHER-DEVICE-NOTE'}; o2['keptAside'] = {'notes': [{'id': 'nope.line55', 'text': 'KEPT-ON-OTHER-DEVICE', 'reason': 'unknown_line'}], 'bookmarks': ['nope.line98', 'nope.line54']}
    other['records'] = {KEY: json.dumps(o2)}; p2 = os.path.join(tempfile.mkdtemp(), 'other.json'); json.dump(other, open(p2, 'w', encoding='utf-8'))
    D['restore_3_said'] = restore(p2); r3 = parsed(raw_of(pg))
    D['after_merging_a_different_backup'] = dict(noteOnSharedLine=r3['notes'].get(line), keptAsideNotes=[n['text'] for n in r3['keptAside']['notes']], keptAsideBookmarks=r3['keptAside']['bookmarks'],
                                                 bothNotesKept=('RT2-ORDINARY-NOTE' in (r3['notes'].get(line) or '') and 'RT2-OTHER-DEVICE-NOTE' in (r3['notes'].get(line) or '')))
    o3 = json.loads(json.dumps(inner)); o3['notes'] = {line: 'Z' * 11990}; o3['keptAside'] = {'notes': [], 'bookmarks': []}
    other['records'] = {KEY: json.dumps(o3)}; p3 = os.path.join(tempfile.mkdtemp(), 'toolong.json'); json.dump(other, open(p3, 'w', encoding='utf-8'))
    before = raw_of(pg); D['restore_4_too_long_to_combine_said'] = restore(p3); D['too_long_to_combine_changed_nothing'] = (raw_of(pg) == before)
    # a backup holding a note on a line this reader does not know (for example from a later edition)
    o4 = json.loads(json.dumps(inner)); o4['notes'] = {'pauri99.line01': 'NOTE-FROM-ANOTHER-EDITION'}; o4['keptAside'] = {'notes': [], 'bookmarks': []}; o4['bookmarks'] = []
    other['records'] = {KEY: json.dumps(o4)}; p4 = os.path.join(tempfile.mkdtemp(), 'otheredition.json'); json.dump(other, open(p4, 'w', encoding='utf-8'))
    before = raw_of(pg); D['restore_5_other_edition_said'] = restore(p4); r5 = parsed(raw_of(pg))
    D['other_edition_backup'] = dict(changedNothing=(raw_of(pg) == before), noteBroughtIn=('NOTE-FROM-ANOTHER-EDITION' in all_text_in(r5)))
    D['page_errors'] = errs[:3]; R['cases']['D:ordinary_use_backup_restore'] = D; c.close()
    for k, v in D.items(): print('D', k, '|', json.dumps(v, ensure_ascii=False)[:330])

    # ---- E. an unreadable record, then a good backup is restored: does the reader recover?
    c, pg, errs = seeded(Bc['cut_off_json']); E = {}
    try:
        open_learning(pg); pg.set_input_files('#import-file', backup); time.sleep(0.8); E['said'] = pg.inner_text('#import-preview')[:200].replace('\n', ' | ')
        btn = pg.query_selector('#import-preview [data-action="apply-import"]')
        if btn: btn.click(); time.sleep(1.5); E['afterApply'] = (pg.inner_text('#import-preview')[:200].replace('\n', ' | ') if pg.query_selector('#import-preview') else None)
    except Exception as e: E['error'] = str(e)[:140]
    close_dialog(pg); E['recordNow'] = (raw_of(pg) or '')[:80]; E['unreadableRecordStillExactlyThere'] = (raw_of(pg) == Bc['cut_off_json']); E['notice'] = notice(pg)
    E['anyControlToSetTheDamagedRecordAsideAndStartFresh'] = pg.evaluate("!![...document.querySelectorAll('button,a')].find(x => /start fresh|set aside|reset|clear saved|repair/i.test(x.textContent))")
    R['cases']['E:unreadable_then_restore'] = E; c.close(); print('E', json.dumps(E, ensure_ascii=False)[:600])
    b.close()
json.dump(R, open(OUT, 'w'), ensure_ascii=False, indent=1)
