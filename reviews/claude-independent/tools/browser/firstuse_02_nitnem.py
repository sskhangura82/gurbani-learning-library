import json, sys
sys.path.insert(0, '/home/claude/work/tools')
from pw_common import *
def vis_controls(pg):
    return pg.evaluate('''() => [...document.querySelectorAll('a,button,input,select,textarea,summary')].filter(e=>{const r=e.getBoundingClientRect(); const cs=getComputedStyle(e); return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none' && r.bottom>0 && r.top<innerHeight}).map(e => ({tag:e.tagName.toLowerCase(), id:e.id||'', text:(e.innerText||e.getAttribute('aria-label')||e.value||'').replace(/\\s+/g,' ').trim().slice(0,60), aria:e.getAttribute('aria-label')||'', x:Math.round(e.getBoundingClientRect().left), y:Math.round(e.getBoundingClientRect().top), w:Math.round(e.getBoundingClientRect().width), h:Math.round(e.getBoundingClientRect().height)}))''')
with sync_playwright() as p:
    s = Session(p); pg = s.page
    pg.goto(BASE, wait_until='networkidle')
    pg.click('a.nitnem-card'); pg.wait_for_load_state('networkidle'); time.sleep(0.5)
    s.shot('02_nitnem_collection_top'); s.shot('02_nitnem_collection_full', full=True)
    print('URL', pg.url); print('collection-status:', pg.inner_text('#collection-status'))
    print('offline-message:', pg.inner_text('#offline-message'))
    n0=len(s.requests)
    t0=time.time()
    pg.click('button[data-open="jaap"]'); pg.wait_for_load_state('networkidle'); time.sleep(0.8)
    print('open jaap s', round(time.time()-t0,2), 'URL', pg.url)
    for r in s.requests[n0:]: print('  req', r[1].replace(BASE,''), r[2])
    s.shot('03_jaap_read_top')
    print('visible controls in first viewport:')
    for c in vis_controls(pg): print('  ', c)
    print('first 1200 chars of reader text:\n', pg.inner_text('#reader')[:1200])
    print('doc height', pg.evaluate('document.documentElement.scrollHeight'))
    print('console', s.console); print('errors', s.errors)
    print('localStorage keys:', pg.evaluate('Object.keys(localStorage)'))
    s.close()
