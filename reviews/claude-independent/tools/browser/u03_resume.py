import json, sys
sys.path.insert(0, '/home/claude/work/tools')
from pw_common import *
def top_line(pg, sel, attr):
    return pg.evaluate('''([sel,attr]) => { const els=[...document.querySelectorAll(sel)]; for(const e of els){const r=e.getBoundingClientRect(); if(r.top>=70 && r.height>0) return {id:e.getAttribute(attr), top:Math.round(r.top)} } return null }''', [sel, attr])
with sync_playwright() as p:
    s = Session(p); pg = s.page
    # ---------- Nitnem / Jaap
    pg.goto(BASE + 'nitnem/index.html', wait_until='networkidle')
    pg.click('button[data-open="jaap"]'); pg.wait_for_load_state('networkidle'); time.sleep(0.5)
    for _ in range(30): pg.mouse.wheel(0, 900); time.sleep(0.05)
    time.sleep(2.0)
    print('NITNEM after wheel-scroll: label=', pg.inner_text('#position-label'), '|', pg.inner_text('#position-detail'), '| top line', top_line(pg, '#source-unit [data-line-id]', 'data-line-id'), 'scrollY', pg.evaluate('scrollY'))
    print('  storage:', {k: (v[:300]) for k, v in pg.evaluate('Object.fromEntries(Object.entries(localStorage))').items()})
    # touch-scroll emulation (real phones fire touch + scroll)
    pg.touchscreen.tap(195, 300); time.sleep(0.8)
    print('  after tapping a line: label=', pg.inner_text('#position-label'), '|', pg.inner_text('#position-detail'), '| dialogs open:', pg.evaluate('[...document.querySelectorAll("dialog[open]")].map(d=>d.id)'))
    pg.keyboard.press('Escape'); time.sleep(0.2)
    before = top_line(pg, '#source-unit [data-line-id]', 'data-line-id')
    print('  storage after tap:', {k: (v[:400]) for k, v in pg.evaluate('Object.fromEntries(Object.entries(localStorage))').items()})
    pg.reload(wait_until='networkidle'); time.sleep(1.2)
    print('  after reload: url', pg.url.replace(BASE, ''), '| reader visible', pg.evaluate('!document.querySelector("#reader").hidden'), '| collection-status:', pg.inner_text('#collection-status')[:200])
    s.shot('30_nitnem_after_reload')
    if pg.evaluate('document.querySelector("#reader").hidden'):
        # what does the collection page offer to resume?
        print('  collection page text (first 600):', pg.inner_text('#collection')[:600].replace('\n', ' | '))
        pg.click('button[data-open="jaap"]'); pg.wait_for_load_state('networkidle'); time.sleep(1.2)
    print('  after reopening Jaap: label=', pg.inner_text('#position-label'), '|', pg.inner_text('#position-detail'), '| top line', top_line(pg, '#source-unit [data-line-id]', 'data-line-id'), 'scrollY', pg.evaluate('scrollY'), '| was', before)
    s.shot('31_nitnem_jaap_reopened')
    s.close()
