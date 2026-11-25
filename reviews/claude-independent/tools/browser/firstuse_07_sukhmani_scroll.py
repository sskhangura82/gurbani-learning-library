import json, sys
sys.path.insert(0, '/home/claude/work/tools')
from pw_common import *
with sync_playwright() as p:
    s = Session(p); pg = s.page
    pg.goto(BASE+'sukhmani.html', wait_until='networkidle'); time.sleep(0.8)
    pg.mouse.wheel(0, 900); time.sleep(0.5); s.shot('13_sukhmani_read_scrolled')
    print(pg.evaluate('''() => { const t=document.querySelector('#sukhmani-text'); return [...t.querySelectorAll('*')].slice(0,40).map(e=>e.tagName+'.'+e.className+' | '+getComputedStyle(e).display+' | '+(e.children.length?'':e.innerText.slice(0,40))).join('\\n') }'''))
    pg.click('.modes button[data-depth="understand"]'); time.sleep(1.0); s.shot('14_sukhmani_meaning')
    pg.click('.modes button[data-depth="study"]'); time.sleep(1.0); s.shot('15_sukhmani_study')
    print('docH study', pg.evaluate('document.documentElement.scrollHeight'), 'nodes', pg.evaluate('document.querySelectorAll("*").length'))
    pg.click('#sk-tools'); time.sleep(0.5); s.shot('16_sukhmani_tools'); print('TOOLS:\n', pg.inner_text('#sk-dialog')[:2500])
    s.close()
