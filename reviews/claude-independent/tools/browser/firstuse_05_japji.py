import json, sys
sys.path.insert(0, '/home/claude/work/tools')
from pw_common import *
def vis_controls(pg):
    return pg.evaluate('''() => [...document.querySelectorAll('a,button,input,select,textarea,summary')].filter(e=>{const r=e.getBoundingClientRect(); const cs=getComputedStyle(e); return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none' && r.bottom>0 && r.top<innerHeight}).map(e => ({tag:e.tagName.toLowerCase(), id:e.id||'', text:(e.innerText||e.getAttribute('aria-label')||e.value||'').replace(/\\s+/g,' ').trim().slice(0,50), aria:(e.getAttribute('aria-label')||'').slice(0,60), x:Math.round(e.getBoundingClientRect().left), y:Math.round(e.getBoundingClientRect().top), w:Math.round(e.getBoundingClientRect().width), h:Math.round(e.getBoundingClientRect().height)}))''')
with sync_playwright() as p:
    s = Session(p); pg = s.page
    t0=time.time(); pg.goto(BASE+'full-japji.html', wait_until='networkidle'); time.sleep(0.6)
    print('load s', round(time.time()-t0,2), pg.title())
    for r in s.requests: print('  req', r[1].replace(BASE,''), r[2])
    s.shot('11_japji_top')
    print('controls in first viewport:')
    for c in vis_controls(pg): print('  ', c)
    print('BODY attrs:', pg.evaluate('JSON.stringify([...document.body.attributes].map(a=>[a.name,a.value]))'))
    print('first text:\n', pg.inner_text('body')[:1500])
    print('doc height', pg.evaluate('document.documentElement.scrollHeight'), 'nodes', pg.evaluate('document.querySelectorAll("*").length'))
    print('console', s.console); print('errors', s.errors)
    print('localStorage keys:', pg.evaluate('Object.keys(localStorage)'))
    s.close()
