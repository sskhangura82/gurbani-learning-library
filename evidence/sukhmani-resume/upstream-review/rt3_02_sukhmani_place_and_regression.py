"""RT-003: two things the link repair must not have broken, and one question it raises.
 A. Does the Sukhmani saved place drift on repeated reopening, as the Japji one did (CI-R-11)?
    Read to a place, then reopen six times without touching the page: candidate PR #47, the commit it sits on, and the published version.
 B. Regression for the Sukhmani reader: lines drawn, notes and saved lines kept across a reload, saved place honoured, export.
Chromium, made-up notes only.   Usage: python3 rt3_02_sukhmani_place_and_regression.py <out.json> <label=base-url> ..."""
import json, sys, time
from playwright.sync_api import sync_playwright
OUT, TARGETS = sys.argv[1], [a.split('=', 1) for a in sys.argv[2:]]
S = """(() => { let rec = null; try { rec = JSON.parse(localStorage.getItem('glp001.sukhmani.v1')); } catch (e) {}
  return {storedPlace: rec ? rec.read : null, notes: rec && rec.notes ? Object.keys(rec.notes).length : 0, savedLines: rec && rec.bookmarks ? rec.bookmarks.length : 0,
          position: ((document.getElementById('sk-position') || {}).innerText || '').replace(/\\s+/g, ' ').trim(), lines: document.querySelectorAll('#sukhmani-text [data-line-id]').length,
          check: (document.getElementById('sukhmani-text') || {}).dataset ? document.getElementById('sukhmani-text').dataset.sourceIntegrity : null, y: Math.round(scrollY)}; })()"""
R = {'note': 'emulation only (Chromium, 390 x 664); made-up notes only', 'A_place_on_repeated_reopening': [], 'B_regression': {}}
with sync_playwright() as p:
    b = p.chromium.launch()
    for label, base in TARGETS:
        c = b.new_context(viewport={'width': 390, 'height': 664}, service_workers='block'); c.set_default_timeout(9000); pg = c.new_page()
        pg.goto(base + 'sukhmani.html', wait_until='networkidle'); time.sleep(2.8)
        pg.evaluate("document.querySelector('#ashtpadi-nav a:nth-child(6)').click()"); time.sleep(1.5)
        for _ in range(3): pg.mouse.wheel(0, 700); time.sleep(0.15)
        time.sleep(2.0); seq = [pg.evaluate(S)]
        for _ in range(6): pg.reload(wait_until='networkidle'); time.sleep(2.8); seq.append(pg.evaluate(S))
        places = [s['storedPlace'] for s in seq]; pos = [s['position'] for s in seq]
        R['A_place_on_repeated_reopening'].append(dict(version=label, storedPlaceAfterEachReopening=places, positionLabelAfterEach=pos, sameEveryTime=len(set(places)) == 1,
            changedOnFirstReopeningOnly=len(set(places[1:])) == 1 and places[0] != places[1], keptChangingEveryTime=len(set(places)) == len(places), scrollAfterEach=[s['y'] for s in seq]))
        print(label, '| places:', places, '| same every time:', len(set(places)) == 1, flush=True)
        # ---- B regression (candidate only, first target)
        if not R['B_regression']:
            pg.goto(base + 'sukhmani.html', wait_until='networkidle'); time.sleep(2.8); o = dict(linesDrawn=pg.evaluate(S)['lines'], check=pg.evaluate(S)['check'])
            pg.click('#sukhmani-text [data-line-id] >> nth=3'); time.sleep(0.6)
            bm = pg.get_by_role('button', name='Bookmark this line')
            if bm.count(): bm.first.click(); time.sleep(0.5)
            ta = pg.query_selector('dialog[open] textarea')
            if ta and not ta.is_disabled(): ta.fill('RT3-SUKHMANI-NOTE'); time.sleep(1.4)
            pg.keyboard.press('Escape'); time.sleep(1.2); before = pg.evaluate(S)
            pg.reload(wait_until='networkidle'); time.sleep(2.8); after = pg.evaluate(S)
            o.update(noteAndSavedLineBeforeReload=dict(notes=before['notes'], savedLines=before['savedLines']), afterReload=dict(notes=after['notes'], savedLines=after['savedLines'], lines=after['lines'], check=after['check']),
                     noteTextStillStored='RT3-SUKHMANI-NOTE' in (pg.evaluate("localStorage.getItem('glp001.sukhmani.v1')") or ''))
            try:
                pg.click('#sk-tools'); time.sleep(0.4)
            except Exception: pass
            o['exportButtonFound'] = pg.evaluate("[...document.querySelectorAll('button')].some(e => /export/i.test(e.textContent))")
            R['B_regression'] = o; print('B regression:', json.dumps(o, ensure_ascii=False)[:420], flush=True)
        c.close()
    b.close()
json.dump(R, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
