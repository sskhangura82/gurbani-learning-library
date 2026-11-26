"""RT-002 / RT1-01 f, g, i and CI-R-08 c: what happens when a saved record cannot be read, or cannot be written?
 A. the main Japji record damaged in the 10 ways used in RT-001, with a good kept-aside archive beside it
 B. the kept-aside archive damaged in 10 matching ways, with a good main record beside it
 C. the browser refuses to write the archive (storage full), and refuses every write
 D. is there any control that removes kept-aside notes; what the screen says about shared devices
For A and B: is Gurbani shown; are both records left exactly as they were; is anything visible said; does "Export learning"
produce a file within 8 seconds (a hang is a failure); does that file hold the damaged record as it was, and the good one.
Chromium, phone emulation, made-up notes only.   Usage: python3 rt2_02_damaged_records_and_export.py <base-url> <out.json>"""
import json, sys, time
from playwright.sync_api import sync_playwright
B, OUT = sys.argv[1:3]; KEY = 'glp001.continuous.v2'; ARCH = 'glp001.continuous.retained.v1'
GOOD_MAIN = json.dumps({'version': 2, 'notes': {'mool.line01': 'ORDINARY-NOTE'}, 'bookmarks': ['pauri05.line01']})
GOOD_ARCH = json.dumps({'version': 1, 'keptAside': {'notes': [{'id': 'nope.line99', 'text': 'KEPT-ASIDE-NOTE', 'reason': 'unknown_line'}], 'bookmarks': ['nope.line98']}})
MAIN_BAD = {
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
ARCH_BAD = {
 'cut_off_json': '{"version":1,"keptAside":{"notes":[{"id":"nope.line99","text":"KEPT-ASIDE-NOTE',
 'newer_version': json.dumps({'version': 9, 'keptAside': {'notes': [{'id': 'nope.line99', 'text': 'KEPT-ASIDE-NOTE', 'reason': 'unknown_line'}], 'bookmarks': []}}),
 'kept_aside_is_text': json.dumps({'version': 1, 'keptAside': 'KEPT-ASIDE-NOTE'}),
 'notes_is_text': json.dumps({'version': 1, 'keptAside': {'notes': 'KEPT-ASIDE-NOTE', 'bookmarks': []}}),
 'unknown_reason': json.dumps({'version': 1, 'keptAside': {'notes': [{'id': 'a', 'text': 'KEPT-ASIDE-NOTE', 'reason': 'something_else'}], 'bookmarks': []}}),
 'extra_field': json.dumps({'version': 1, 'keptAside': {'notes': [{'id': 'nope.line99', 'text': 'KEPT-ASIDE-NOTE', 'reason': 'unknown_line'}], 'bookmarks': []}, 'more': 1}),
 'not_an_object': json.dumps('KEPT-ASIDE-NOTE'),
 'a_note_is_a_number': json.dumps({'version': 1, 'keptAside': {'notes': [{'id': 'nope.line99', 'text': 'KEPT-ASIDE-NOTE', 'reason': 'unknown_line'}, 5], 'bookmarks': []}}),
 'bookmarks_is_text': json.dumps({'version': 1, 'keptAside': {'notes': [{'id': 'nope.line99', 'text': 'KEPT-ASIDE-NOTE', 'reason': 'unknown_line'}], 'bookmarks': 'x'}}),
 'a_bookmark_is_a_number': json.dumps({'version': 1, 'keptAside': {'notes': [{'id': 'nope.line99', 'text': 'KEPT-ASIDE-NOTE', 'reason': 'unknown_line'}], 'bookmarks': [5]}}),
}
SEEN = """(() => { const vis = e => { if (!e || e.hidden) return false; const r = e.getBoundingClientRect(); return r.width > 40 && r.height > 12 && r.bottom > 0 && r.top < innerHeight; };
  const n = document.getElementById('retained-learning'); const st = document.getElementById('status');
  return {gurbaniLinesShown: document.querySelectorAll('.scripture-line').length, noticeVisible: vis(n), noticeText: n && !n.hidden ? n.innerText.replace(/\\s+/g, ' ').trim() : null,
          statusText: st ? st.textContent.trim() : null, statusVisible: vis(st)}; })()"""
R = {'note': 'emulation only (Chromium, iPhone 14 profile); made-up notes only', 'A_main_record_damaged': {}, 'B_archive_damaged': {}}
with sync_playwright() as p:
    b = p.chromium.launch(); d = dict(p.devices['iPhone 14']); d['service_workers'] = 'block'; d['accept_downloads'] = True
    def run(main, arch, init=None):
        c = b.new_context(**d); c.set_default_timeout(8000)
        if init: c.add_init_script(init)
        pg = c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:140]))
        pg.goto(B + 'index.html'); pg.evaluate('([a, b, k1, k2]) => { const set = window.__realSetItem || Storage.prototype.setItem; localStorage.clear(); if (a !== null) set.call(localStorage, k1, a); if (b !== null) set.call(localStorage, k2, b); }', [main, arch, KEY, ARCH])
        pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.5)
        for _ in range(3): pg.mouse.wheel(0, 700); time.sleep(0.05)
        time.sleep(1.2)
        o = pg.evaluate(SEEN); o['mainRecordLeftExactlyAsItWas'] = pg.evaluate('([k]) => localStorage.getItem(k)', [KEY]) == main; o['archiveLeftExactlyAsItWas'] = pg.evaluate('([k]) => localStorage.getItem(k)', [ARCH]) == arch; o['pageErrors'] = errs[:2]
        # export: must produce a file within 8 seconds, or say plainly that it could not
        try:
            pg.click('#tools-open'); time.sleep(0.3); pg.locator('#reader-dialog [data-action="reader-explore"]').click(); time.sleep(0.3); pg.locator('#reader-dialog [data-action="learning"]').click(); time.sleep(0.5)
            o['savedLearningScreenText'] = pg.evaluate("document.querySelector('dialog[open]').innerText.replace(/\\s+/g, ' ').trim().slice(0, 240)")
            t0 = time.time()
            try:
                with pg.expect_download(timeout=8000) as dl: pg.locator('#reader-dialog [data-action="export"]').click()
                raw = open(dl.value.path(), encoding='utf-8').read(); recs = json.loads(raw).get('records', {})
                o['export'] = dict(fileProducedWithinSeconds=round(time.time() - t0, 1), fileName=dl.value.suggested_filename, holdsMainRecordExactly=recs.get(KEY) == main, holdsArchiveExactly=recs.get(ARCH) == arch, holdsOrdinaryNoteText=('ORDINARY-NOTE' in raw) or ('KEEP-ME' in raw), holdsKeptAsideNoteText='KEPT-ASIDE-NOTE' in raw, recordsInFile=sorted(k for k, v in recs.items() if v is not None))
            except Exception as e:
                o['export'] = dict(fileProducedWithinSeconds=None, hungOrFailed=str(e)[:90], whatTheScreenSaid=pg.evaluate("(document.getElementById('status') || {}).textContent || ''")[:160])
        except Exception as e: o['export'] = dict(couldNotReachTheExportButton=str(e)[:120])
        c.close(); return o
    for name, bad in MAIN_BAD.items():
        o = run(bad, GOOD_ARCH); R['A_main_record_damaged'][name] = o; print('A', name.ljust(26), '| lines', o['gurbaniLinesShown'], '| untouched', o['mainRecordLeftExactlyAsItWas'], o['archiveLeftExactlyAsItWas'], '| notice', o['noticeVisible'], '| export', json.dumps(o['export'])[:200], flush=True)
    for name, bad in ARCH_BAD.items():
        o = run(GOOD_MAIN, bad); R['B_archive_damaged'][name] = o; print('B', name.ljust(26), '| lines', o['gurbaniLinesShown'], '| untouched', o['mainRecordLeftExactlyAsItWas'], o['archiveLeftExactlyAsItWas'], '| notice', o['noticeVisible'], (o['noticeText'] or '')[:50], '| export', json.dumps(o['export'])[:190], flush=True)
    # ---- C. the browser refuses writes
    UNPLACED = json.dumps({'version': 2, 'notes': {'nope.line99': 'KEPT-ASIDE-NOTE', 'mool.line01': 'ORDINARY-NOTE'}, 'bookmarks': ['nope.line98']})
    refuse_arch = "const _s = Storage.prototype.setItem; window.__realSetItem = _s; Storage.prototype.setItem = function (k, v) { if (k === '" + ARCH + "') { throw new DOMException('quota', 'QuotaExceededError'); } return _s.call(this, k, v); };"
    refuse_all = "const _s = Storage.prototype.setItem; window.__realSetItem = _s; Storage.prototype.setItem = function (k, v) { if (String(k).startsWith('glp001.')) { throw new DOMException('quota', 'QuotaExceededError'); } return _s.call(this, k, v); };"
    R['C_writes_refused'] = {'archive_write_refused__record_holds_items_to_keep_aside': run(UNPLACED, None, refuse_arch), 'every_write_refused__record_holds_items_to_keep_aside': run(UNPLACED, None, refuse_all), 'every_write_refused__good_records': run(GOOD_MAIN, GOOD_ARCH, refuse_all)}
    for k, o in R['C_writes_refused'].items(): print('C', k, '| lines', o['gurbaniLinesShown'], '| main untouched', o['mainRecordLeftExactlyAsItWas'], '| notice', o['noticeVisible'], (o['noticeText'] or '')[:60], '| status', (o['statusText'] or '')[:70], '| export', json.dumps(o['export'])[:170], flush=True)
    # ---- D. removal and privacy
    c = b.new_context(**d); pg = c.new_page(); pg.goto(B + 'index.html'); pg.evaluate('([a, b, k1, k2]) => { localStorage.setItem(k1, a); localStorage.setItem(k2, b); }', [GOOD_MAIN, GOOD_ARCH, KEY, ARCH]); pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.5)
    pg.click('#tools-open'); time.sleep(0.3); pg.locator('#reader-dialog [data-action="reader-explore"]').click(); time.sleep(0.3); pg.locator('#reader-dialog [data-action="learning"]').click(); time.sleep(0.5)
    R['D_removal_and_privacy'] = pg.evaluate("""(() => { const dlg = document.querySelector('dialog[open]'); const t = dlg.innerText.replace(/\\s+/g, ' ');
      return {controlsOnTheSavedLearningScreen: [...dlg.querySelectorAll('button, input, summary')].map(e => (e.textContent || e.getAttribute('aria-label') || e.type).trim().replace(/\\s+/g, ' ').slice(0, 50)),
              anyControlThatRemovesOrClears: [...dlg.querySelectorAll('button')].filter(e => /remove|delete|clear|discard|forget|erase/i.test(e.textContent)).map(e => e.textContent.trim()),
              keptAsideNotesAreReadOnly: [...dlg.querySelectorAll('#retained-learning-items textarea')].every(x => x.readOnly), saysOthersOnThisBrowserCanSeeNotes: /Other people using this browser profile can see its notes/.test(t), keptAsideSectionSaysItIsInTheExport: /also included in your learning export/.test(t)}; })()""")
    print('D', json.dumps(R['D_removal_and_privacy'], ensure_ascii=False)[:700]); c.close(); b.close()
S = lambda grp: dict(cases=len(grp), gurbaniShown=sum(o['gurbaniLinesShown'] == 385 for o in grp.values()), bothRecordsUntouched=sum(o['mainRecordLeftExactlyAsItWas'] and o['archiveLeftExactlyAsItWas'] for o in grp.values()), somethingVisibleSaid=sum(bool(o['noticeVisible'] or o['statusVisible']) for o in grp.values()),
                     exportFileProduced=sum(bool(o['export'].get('fileProducedWithinSeconds') is not None) for o in grp.values()), exportHoldsDamagedRecordExactly=sum(bool(o['export'].get('holdsMainRecordExactly') and o['export'].get('holdsArchiveExactly')) for o in grp.values()), exportHung=sum('hungOrFailed' in o['export'] for o in grp.values()))
R['summary'] = dict(A=S(R['A_main_record_damaged']), B=S(R['B_archive_damaged'])); print(json.dumps(R['summary']))
json.dump(R, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
