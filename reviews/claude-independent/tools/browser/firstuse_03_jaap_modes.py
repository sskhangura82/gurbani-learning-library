import json, sys
sys.path.insert(0, '/home/claude/work/tools')
from pw_common import *
with sync_playwright() as p:
    s = Session(p); pg = s.page
    pg.goto(BASE+'nitnem/index.html', wait_until='networkidle')
    pg.click('button[data-open="jaap"]'); pg.wait_for_load_state('networkidle'); time.sleep(0.6)
    pg.mouse.wheel(0, 760); time.sleep(0.4); s.shot('04_jaap_read_scrolled')
    # structure of source-unit in read mode
    print(pg.evaluate('''() => { const su=document.querySelector('#source-unit'); const kids=[...su.children].slice(0,6).map(k=>k.outerHTML.slice(0,700)); return kids.join('\\n----\\n') }'''))
    print('line elements:', pg.evaluate('''() => document.querySelectorAll('#source-unit [data-line-id], #source-unit .line').length'''))
    # topmost visible line before switching
    def top_line():
        return pg.evaluate('''() => { const els=[...document.querySelectorAll('#source-unit [data-line-id]')]; for(const e of els){const r=e.getBoundingClientRect(); if(r.top>=70 && r.height>0) return {id:e.dataset.lineId, top:Math.round(r.top), text:e.innerText.slice(0,50)} } return null }''')
    before = top_line(); print('top line before:', before, 'scrollY', pg.evaluate('scrollY'))
    t0=time.time(); pg.click('button[data-mode="meaning"]'); time.sleep(1.2)
    print('meaning switch s', round(time.time()-t0,2), 'new requests:', [r[1].replace(BASE,'') for r in s.requests if 'learning' in r[1] or 'course' in r[1]])
    after = top_line(); print('top line after Meaning:', after, 'scrollY', pg.evaluate('scrollY'), 'docH', pg.evaluate('document.documentElement.scrollHeight'))
    s.shot('05_jaap_meaning')
    print(pg.evaluate('''() => { const su=document.querySelector('#source-unit'); const kids=[...su.children].slice(0,3).map(k=>k.outerHTML.slice(0,1800)); return kids.join('\\n----\\n') }'''))
    pg.click('button[data-mode="study"]'); time.sleep(1.2)
    after2 = top_line(); print('top line after Study:', after2, 'scrollY', pg.evaluate('scrollY'), 'docH', pg.evaluate('document.documentElement.scrollHeight'))
    s.shot('06_jaap_study')
    print('STUDY visible text:\n', pg.evaluate('''() => { const out=[]; const w=document.createTreeWalker(document.querySelector('#reader'), NodeFilter.SHOW_ELEMENT); let n; while(n=w.nextNode()){ const r=n.getBoundingClientRect(); if(r.top>=0&&r.top<innerHeight&&n.children.length===0&&n.innerText&&n.innerText.trim()) out.push(n.innerText.trim().slice(0,300)); } return out.join('\\n') }'''))
    pg.click('button[data-mode="read"]'); time.sleep(0.8)
    back = top_line(); print('top line back in Read:', back, 'scrollY', pg.evaluate('scrollY'))
    print('console', s.console); print('errors', s.errors)
    s.close()
