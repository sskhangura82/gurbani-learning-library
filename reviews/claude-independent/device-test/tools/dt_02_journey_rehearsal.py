"""Rehearsal, in emulation, of the Safari part of the iPhone script (IPHONE_TEN_MINUTE_SCRIPT.md), so that every
label and expected result in the script is one that was actually seen. Japji Sahib reader: jump to a passage, save
the line, write a made-up note, look at Meaning, reopen two ways, find the line and the note again, export, wipe
(a stand-in for the Home Screen app's separate storage), import. Chromium, 390 x 844 window, offline shell not in use.
Made-up notes only. Emulation only: NOT an iPhone result, and no substitute for one.
Usage: python3 dt_02_journey_rehearsal.py <label> <base url ending in /> <out.json>"""
import json, sys, time
from playwright.sync_api import sync_playwright
LABEL, B, OUT = sys.argv[1:4]
NOTE, NOTE2 = 'TEST NOTE 1', 'TEST NOTE 2'
R = {'version': LABEL, 'note': 'emulation only (Chromium, 390 x 844); not an iPhone result', 'steps': []}
T = "document.querySelector('dialog[open]')?.innerText.replace(/\\n+/g, ' | ') ?? null"
def step(name, ok, seen): R['steps'].append(dict(step=name, asTheScriptExpects=bool(ok), seen=seen)); print(('ok   ' if ok else 'DIFF ') + name + ' :: ' + str(seen)[:260], flush=True)
with sync_playwright() as p:
    b = p.chromium.launch(); c = b.new_context(viewport={'width': 390, 'height': 844}, service_workers='block', accept_downloads=True); c.set_default_timeout(8000); pg = c.new_page()
    def tap(rx): pg.evaluate("([rx]) => { const b = [...document.querySelectorAll('dialog[open] button')].find(b => new RegExp(rx).test(b.textContent.trim())); if (!b) throw Error('no button ' + rx); b.click(); }", [rx]); time.sleep(0.6)
    def close():
        if pg.evaluate("!!document.querySelector('dialog[open]')"): pg.evaluate("document.querySelector('dialog[open] #dialog-close')?.click()"); time.sleep(0.4)
    def bar(): return pg.evaluate("(document.getElementById('dock-position').getAttribute('aria-label') || document.getElementById('dock-position').textContent).trim().replace('. Jump to a passage', '')")
    def controls(): close(); pg.click('#tools-open'); time.sleep(0.4)
    def jump(name): close(); pg.click('#dock-position'); time.sleep(0.5); tap('^' + name + 'Ang'); close(); time.sleep(1.2)
    def saved(): controls(); tap('^Explore'); time.sleep(0.3); tap('^Saved places'); return pg.evaluate(T)
    def note_box(): controls(); tap('^Keep a reflection here'); v = pg.evaluate("document.querySelector('dialog[open] textarea').value"); close(); return v
    def mode(name): close(); pg.evaluate("([n]) => [...document.querySelectorAll('.modes button')].find(b => b.textContent.includes(n)).click()", [name]); time.sleep(1.2)

    pg.goto(B + 'index.html', wait_until='networkidle'); time.sleep(0.4)
    step('A2a the home page offers "Open Japji Sahib directly"', pg.evaluate("[...document.querySelectorAll('a')].some(a => /Open Japji Sahib directly/.test(a.textContent))"), 'link present')
    pg.evaluate("[...document.querySelectorAll('a')].find(a => /Open Japji Sahib directly/.test(a.textContent)).click()"); pg.wait_for_load_state('networkidle'); time.sleep(1.5)
    n = pg.evaluate("document.querySelectorAll('.scripture-line').length"); step('A2b Japji Sahib opens with Gurbani; the bottom bar names the Mool Mantar', n == 385 and bar().startswith('Mool Mantar'), f'{n} lines; bar: {bar()}; bar buttons: ' + ' / '.join(pg.evaluate("[...document.querySelectorAll('.reading-dock button')].map(b => b.innerText.trim().replace(/\\s+/g, ' '))")))
    jump('Pauri 5'); step('A3 the passage name on the bar opens Contents; choosing Pauri 5 goes there', bar() == 'Pauri 5 · line 1', bar())
    controls(); tap('^Save this reading line'); step('A4 ⌃ → "Save this reading line"', True, 'message: ' + str(pg.evaluate("document.getElementById('status')?.textContent.trim()"))); close()
    controls(); tap('^Keep a reflection here'); pg.fill('dialog[open] textarea', NOTE); time.sleep(1.5); t = pg.evaluate(T); step('A5 ⌃ → "Keep a reflection here"; after typing, the panel says the note is saved', 'Saved in this browser' in (t or ''), t); close()
    mode('Meaning'); m = pg.evaluate("[...document.querySelectorAll('.scripture-line button')].filter(b => b.getBoundingClientRect().height > 0).length"); lab = pg.evaluate("document.getElementById('coverage-note')?.innerText.trim().replace(/\\s+/g, ' ')")
    step('A6 Meaning shows a short meaning under each line and a notice that the teaching is a draft', m >= 385 and 'draft' in (lab or '').lower(), f'{m} meanings on the page; notice: {lab}'); mode('Read'); time.sleep(0.5)
    before = bar(); pg.reload(wait_until='networkidle'); time.sleep(2.2); a1 = bar(); pg.reload(wait_until='networkidle'); time.sleep(2.2); a2 = bar()
    step('A7 after a reload the bar names the same line; after a second reload, still the same', before == a1 == a2, f'before: {before} | after one reload: {a1} | after two: {a2}')
    jump('Pauri 5'); before = bar(); pg.close(); pg = c.new_page(); pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(2.2)
    step('A7b after closing the tab and opening the reader afresh, the bar names the same line', before == bar(), f'before: {before} | after: {bar()}')
    s = saved(); step('A8a ⌃ → Explore → "Saved places & reflections" lists the saved line', 'Pauri 5 · line 1' in (s or ''), s)
    tap('^Pauri 5 · line 1'); time.sleep(0.8); v = note_box(); step('A8b tapping the saved line goes to it, and "Keep a reflection here" shows the note', bar() == 'Pauri 5 · line 1' and v == NOTE, f'bar: {bar()} | note box holds: {v}')
    saved()
    with pg.expect_download(timeout=6000) as dl: tap('^Export learning')
    raw = open(dl.value.path(), encoding='utf-8').read(); open('/tmp/dt_export.json', 'w', encoding='utf-8').write(raw); close()
    step('A9 "Export learning" gives one file, Gurbani-learning.json, holding the note and the saved line', dl.value.suggested_filename == 'Gurbani-learning.json' and NOTE in raw and 'pauri05.line01' in raw, f'{dl.value.suggested_filename}, {len(raw)} characters')
    pg.evaluate("localStorage.clear()"); pg.reload(wait_until='networkidle'); time.sleep(1.5); s = saved()
    step('B3 with empty storage (stand-in for the Home Screen app) the screen says "No saved lines yet."', 'No saved lines yet.' in (s or ''), (s or '')[-250:])
    pg.set_input_files('dialog[open] #import-file', '/tmp/dt_export.json'); time.sleep(1.2); q = pg.evaluate("document.getElementById('import-preview')?.innerText.replace(/\\n+/g, ' | ')")
    step('B4a choosing the file asks before merging', 'Merge learning' in (q or ''), q); tap('^Merge learning'); time.sleep(1.0)
    after_msg = pg.evaluate("document.getElementById('status')?.textContent.trim()"); close(); s = saved(); ok_line = 'Pauri 5 · line 1' in (s or '')
    if ok_line: tap('^Pauri 5 · line 1'); time.sleep(0.8)
    v = note_box() if ok_line else None; step('B4b after "Merge learning" the saved line is listed again and its note is back', ok_line and v == NOTE, f'message: {after_msg} | line listed: {ok_line} | note box holds: {v}')
    jump('Pauri 7'); controls(); tap('^Keep a reflection here'); pg.fill('dialog[open] textarea', NOTE2); time.sleep(1.5); close(); s = saved()
    with pg.expect_download(timeout=6000) as dl2: tap('^Export learning')
    raw2 = open(dl2.value.path(), encoding='utf-8').read(); s = saved(); close(); jump('Pauri 7'); back = note_box(); s = saved()
    R['aNoteOnALineThatWasNotSaved'] = dict(whereWritten='Pauri 7 · line 1', savedLearningScreenListsIt='Pauri 7' in (s or ''), noteIsInTheExportFile=NOTE2 in raw2, noteReappearsWhenTheReaderGoesBackToThatLine=back == NOTE2, screenText=s); print('unsaved-line note: in export', NOTE2 in raw2, '| reappears at the line', back == NOTE2, flush=True); print('note on a line that was not saved -> listed on the Saved learning screen:', 'Pauri 7' in (s or ''), flush=True)
    pg.evaluate("localStorage.clear()"); pg.reload(wait_until='networkidle'); time.sleep(1.5); jump('Pauri 7'); controls(); tap('^Keep a reflection here'); pg.fill('dialog[open] textarea', NOTE2); time.sleep(1.5); close(); s = saved()
    R['aNoteAndNoSavedLines'] = dict(screenSaysNoSavedLinesYet='No saved lines yet.' in (s or ''), noteIsMentionedAnywhereOnTheScreen=('reflection' in (s or '').split('Export before changing address or Home Screen context.')[-1].split('Write a reflection here')[0].lower())); print('one note, no saved lines ->', R['aNoteAndNoSavedLines'], flush=True)
    close(); controls(); tap('^Explore'); time.sleep(0.3); tap('^iPhone & offline help'); R['iPhoneAndOfflineHelpPanel'] = pg.evaluate(T)
    b.close()
R['asTheScriptExpects'] = '%d of %d' % (sum(s['asTheScriptExpects'] for s in R['steps']), len(R['steps'])); json.dump(R, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print(R['asTheScriptExpects'])
