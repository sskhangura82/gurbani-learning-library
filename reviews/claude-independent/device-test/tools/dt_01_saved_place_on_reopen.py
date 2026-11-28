"""Does the Japji reader come back to the same line when it is reopened, and does it stay there when reopened again?
Jump to Pauri 20, then reopen the reader three times in each of four ways without touching the page:
  reload  |  close the tab and open a new one  |  go to the home page and tap back in  |  go to the home page and press the browser's Back
After each reopening, read the line the bottom bar names, the place the reader has stored, and how far down the page it is.
Then repeat with the browser told not to restore the scroll position itself (history.scrollRestoration = 'manual'),
to test one suspected cause. Phone-sized window, Chromium only (no WebKit engine is installed in this workspace).
Emulation only: NOT an iPhone result.
Usage: python3 dt_01_saved_place_on_reopen.py <out.json> <label=base url ending in /> [<label=base url> ...]"""
import json, sys, time
from playwright.sync_api import sync_playwright
OUT, TARGETS = sys.argv[1], [a.split('=', 1) for a in sys.argv[2:]]
STATE = """(() => { const s = JSON.parse(localStorage.getItem('glp001.continuous.v2') || '{}'); const d = document.getElementById('dock-position');
  return {barSays: (d.getAttribute('aria-label') || d.textContent).trim().replace('. Jump to a passage', ''), storedPlace: s.read ? s.read.id : null, pixelsDownThePage: Math.round(scrollY)}; })()"""
MANUAL = "try { history.scrollRestoration = 'manual'; } catch (e) {}"
R = {'note': 'emulation only (Chromium, 390 x 844 window); not an iPhone result; WebKit not installed here, so Safari behaviour is unknown', 'runs': [], 'summary': []}
def jump(pg):
    pg.click('#dock-position'); time.sleep(0.5)
    pg.evaluate("[...document.querySelectorAll('dialog[open] button')].find(b => b.textContent.trim().startsWith('Pauri 20Ang')).click()"); time.sleep(0.6)
    pg.evaluate("document.querySelector('dialog[open] #dialog-close')?.click()"); time.sleep(1.8)
with sync_playwright() as p:
    b = p.chromium.launch()
    for label, base in TARGETS:
        for condition, init in (('as shipped', None), ('browser told not to restore the scroll position itself', MANUAL)):
            c = b.new_context(viewport={'width': 390, 'height': 844}, service_workers='block'); c.set_default_timeout(8000)
            if init: c.add_init_script(init)
            pg = c.new_page(); pg.goto(base + 'full-japji.html', wait_until='networkidle'); time.sleep(1.5)
            if condition == 'as shipped':   # how much height the page loses when the reader hides its heading on the first scroll
                pg.mouse.wheel(0, 900); time.sleep(1.5); y = pg.evaluate('Math.round(scrollY)')
                R.setdefault('pageHeightLostWhenTheHeadingHides', []).append(dict(version=label, scrolledByHand=900, endedAtPixelsDownThePage=y, difference=900 - y, headingHiddenNow=pg.evaluate("document.body.classList.contains('quiet-reading')")))
                print(label, '| first scroll of 900 ends at', y, flush=True)
            def reopen(way):
                global pg
                if way == 'reload': pg.reload(wait_until='networkidle')
                elif way == 'close the tab and open a new one': pg.close(); pg = c.new_page(); pg.goto(base + 'full-japji.html', wait_until='networkidle')
                else:
                    pg.goto(base + 'index.html', wait_until='networkidle'); time.sleep(0.6)
                    if way == 'go to the home page and tap back in': pg.evaluate("[...document.querySelectorAll('a')].find(a => /Open Japji Sahib directly/.test(a.textContent)).click()"); pg.wait_for_load_state('networkidle')
                    else: pg.go_back(wait_until='networkidle')
                time.sleep(2.2)
            for way in ('reload', 'close the tab and open a new one', 'go to the home page and tap back in', "go to the home page and press the browser's Back"):
                jump(pg); seq = [pg.evaluate(STATE)]
                for _ in range(3): reopen(way); seq.append(pg.evaluate(STATE))
                moved = [seq[i]['pixelsDownThePage'] - seq[i + 1]['pixelsDownThePage'] for i in range(3)]
                run = dict(version=label, condition=condition, wayOfReopening=way, start=seq[0], afterEachReopening=seq[1:], movedBackEachTimePixels=moved, sameLineEveryTime=all(s['barSays'] == seq[0]['barSays'] and s['storedPlace'] == seq[0]['storedPlace'] for s in seq))
                R['runs'].append(run); R['summary'].append(f"{label} | {condition} | {way}: {'same line every time' if run['sameLineEveryTime'] else 'moves back ' + '/'.join(map(str, moved)) + ' pixels; ends at ' + seq[-1]['barSays']}"); print(R['summary'][-1], flush=True)
            c.close()
    b.close()
json.dump(R, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
