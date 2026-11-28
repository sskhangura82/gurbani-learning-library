"""RT-002 / CI-U-11 b–f: the Saved learning screen in the Japji reader, beyond the first check.
 b. one note and no saved line      c. a line with both a saved mark and a note      (order of the list; what tapping a line does)
 d. 200 made-up notes               e. a note emptied                               f. does anything of a note leave the site
Chromium, phone-sized window, made-up notes only.   Usage: python3 rt2_06_saved_list_extras.py <base-url> <out.json>"""
import json, sys, time, urllib.parse
from playwright.sync_api import sync_playwright
B, OUT = sys.argv[1:3]; KEY = 'glp001.continuous.v2'; R = {'note': 'emulation only (Chromium, 390 x 844); made-up notes only'}
LIST = """(() => { const dlg = document.querySelector('dialog[open]'); if (!dlg) return null; const items = [...dlg.querySelectorAll('.menu-list button[data-action=jump]')];
  const body = dlg.querySelector('#dialog-body') || dlg;
  return {items: items.map(b => b.innerText.replace(/\\s+/g, ' ').trim().slice(0, 90)), count: items.length, emptyMessage: (dlg.querySelector('.menu-list p') || {}).textContent || null,
          sidewaysOverflow: dlg.scrollWidth > dlg.clientWidth + 1 || body.scrollWidth > body.clientWidth + 1, canScroll: body.scrollHeight > body.clientHeight || dlg.scrollHeight > dlg.clientHeight, dialogHeight: Math.round(dlg.getBoundingClientRect().height), windowHeight: innerHeight}; })()"""
with sync_playwright() as p:
    b = p.chromium.launch(); hosts = set(); urls = []
    def ctx(record=None):
        c = b.new_context(viewport={'width': 390, 'height': 844}, service_workers='block'); c.set_default_timeout(8000); pg = c.new_page()
        pg.on('request', lambda r: (hosts.add(urllib.parse.urlparse(r.url).netloc), urls.append(r.url)))
        pg.goto(B + 'index.html')
        if record is not None: pg.evaluate('([k, v]) => localStorage.setItem(k, v)', [KEY, json.dumps(record)])
        pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.5); return c, pg
    def saved(pg):
        if pg.evaluate("!!document.querySelector('dialog[open]')"): pg.evaluate("document.querySelector('dialog[open] #dialog-close')?.click()"); time.sleep(0.3)
        pg.click('#tools-open'); time.sleep(0.3); pg.locator('#reader-dialog [data-action="reader-explore"]').click(); time.sleep(0.3); pg.locator('#reader-dialog [data-action="learning"]').click(); time.sleep(0.5); return pg.evaluate(LIST)
    def bar(pg): return pg.evaluate("(document.getElementById('dock-position').getAttribute('aria-label') || '').replace('. Jump to a passage', '')")
    # b
    c, pg = ctx({'version': 2, 'notes': {'pauri07.line01': 'TEST NOTE ONLY'}, 'bookmarks': []}); s = saved(pg); R['b_one_note_no_saved_line'] = dict(listed=s['items'], emptyMessageShown=s['emptyMessage']); c.close()
    c, pg = ctx({'version': 2, 'notes': {}, 'bookmarks': []}); s = saved(pg); R['b0_nothing_saved'] = dict(listed=s['items'], emptyMessageShown=s['emptyMessage']); c.close()
    # c + order + tapping
    c, pg = ctx({'version': 2, 'notes': {'pauri20.line01': 'NOTE AT TWENTY', 'pauri05.line01': 'NOTE AT FIVE', 'mool.line01': 'NOTE AT START'}, 'bookmarks': ['pauri38.line01', 'pauri05.line01']}); s = saved(pg)
    R['c_both_marks_and_order'] = dict(listed=s['items'], lineWithBothListedOnce=sum('Pauri 5 · line 1' in i for i in s['items']) == 1, labelOnThatLine=next((i[-40:] for i in s['items'] if 'Pauri 5 · line 1' in i), None), inTheOrderOfTheBani=[i.split(' · ')[0] for i in s['items']] == ['Mool Mantar', 'Pauri 5', 'Pauri 20', 'Pauri 38'], firstWordsOfANoteShownInTheList=any('NOTE AT' in i for i in s['items']))
    pg.evaluate("[...document.querySelectorAll('dialog[open] .menu-list button[data-action=jump]')].find(b => /Pauri 20 · line 1/.test(b.textContent)).click()"); time.sleep(1.0)
    R['c_tapping_a_listed_note'] = dict(readerWentTo=bar(pg), aPanelIsOpenAfterTheTap=pg.evaluate("!!document.querySelector('dialog[open]')"), theNoteItselfIsOnScreen=pg.evaluate("document.body.innerText.includes('NOTE AT TWENTY') || [...document.querySelectorAll('textarea')].some(t => t.value.includes('NOTE AT TWENTY') && t.getBoundingClientRect().height > 0)"))
    R['c_names_given_to_a_screen_reader'] = None
    try: saved(pg); R['c_names_given_to_a_screen_reader'] = pg.locator('dialog[open] .menu-list').aria_snapshot()[:600]
    except Exception as e: R['c_names_given_to_a_screen_reader'] = 'not available: ' + str(e)[:80]
    c.close()
    # d
    c, pg = ctx(); ids = pg.evaluate("[...document.querySelectorAll('.scripture-line')].map(r => r.dataset.occurrence)"); c.close()
    c, pg = ctx({'version': 2, 'notes': {i: f'MADE-UP NOTE {n} ' + 'x' * 60 for n, i in enumerate(ids[:200])}, 'bookmarks': []}); t0 = time.time(); s = saved(pg)
    R['d_200_notes'] = dict(listed=s['count'], secondsToOpen=round(time.time() - t0, 1), sidewaysOverflow=s['sidewaysOverflow'], canScroll=s['canScroll'], exportAndImportStillReachable=pg.evaluate("(() => { const d = document.querySelector('dialog[open]'); return !!d.querySelector('[data-action=export]') && !!d.querySelector('#import-file'); })()"), recordStillHolds200=len(json.loads(pg.evaluate('([k]) => localStorage.getItem(k)', [KEY]))['notes']) == 200); c.close()
    # e
    c, pg = ctx({'version': 2, 'notes': {'pauri07.line01': 'TEST NOTE ONLY'}, 'bookmarks': []}); s0 = saved(pg)
    pg.evaluate("[...document.querySelectorAll('dialog[open] .menu-list button[data-action=jump]')][0].click()"); time.sleep(1.0); pg.click('#tools-open'); time.sleep(0.3); pg.locator('#reader-dialog [data-action="note"]').first.click(); time.sleep(0.5)
    held = pg.evaluate("document.querySelector('dialog[open] textarea').value"); pg.fill('dialog[open] textarea', ''); time.sleep(1.5); pg.evaluate("document.querySelector('dialog[open] #dialog-close')?.click()"); time.sleep(0.4); s1 = saved(pg)
    R['e_note_emptied'] = dict(listedBefore=s0['items'], noteBoxHeld=held, listedAfter=s1['items'], emptyMessageAfter=s1['emptyMessage'], goneFromStorage='pauri07.line01' not in json.loads(pg.evaluate('([k]) => localStorage.getItem(k)', [KEY]))['notes']); c.close()
    # f
    R['f_where_notes_go'] = dict(hostsContacted=sorted(hosts), anyRequestCarriedNoteText=any(('NOTE' in urllib.parse.unquote(u)) for u in urls), requests=len(urls))
    b.close()
for k, v in R.items(): print(k, '::', json.dumps(v, ensure_ascii=False)[:520])
json.dump(R, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
