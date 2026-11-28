import json, sys
sys.path.insert(0, '/home/claude/work/tools')
from pw_common import *
with sync_playwright() as p:
    s = Session(p)
    pg = s.page
    t0 = time.time()
    pg.goto(BASE, wait_until='networkidle')
    print('load s', round(time.time()-t0, 2), '| title:', pg.title())
    print('viewport', pg.viewport_size, '| UA mobile:', 'iPhone' in pg.evaluate('navigator.userAgent'))
    s.shot('01_home_top'); s.shot('01_home_full', full=True)
    # What does a new reader see first? Text of the first viewport
    links = pg.evaluate('''() => [...document.querySelectorAll('a,button')].map(e => ({tag:e.tagName, text:(e.innerText||e.getAttribute('aria-label')||'').replace(/\\s+/g,' ').trim().slice(0,90), href:e.getAttribute('href'), top:Math.round(e.getBoundingClientRect().top), h:Math.round(e.getBoundingClientRect().height), w:Math.round(e.getBoundingClientRect().width)}))''')
    for l in links: print(l)
    print('doc height', pg.evaluate('document.documentElement.scrollHeight'))
    print('console', s.console); print('errors', s.errors)
    ext = [r for r in s.requests if not r[1].startswith(BASE)]
    print('requests', len(s.requests), 'external', ext)
    for r in s.requests: print('  ', r[0], r[1].replace(BASE,''), r[2])
    print('SW:', pg.evaluate('navigator.serviceWorker.getRegistrations().then(r=>r.map(x=>x.scope))'))
    print('localStorage keys:', pg.evaluate('Object.keys(localStorage)'))
    s.close()
