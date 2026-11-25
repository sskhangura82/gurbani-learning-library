import json, sys
sys.path.insert(0, '/home/claude/work/tools')
from pw_common import *
with sync_playwright() as p:
    s = Session(p); pg = s.page
    pg.goto(BASE+'nitnem/index.html', wait_until='networkidle')
    pg.click('button[data-open="jaap"]'); pg.wait_for_load_state('networkidle'); time.sleep(0.5)
    pg.click('button[data-mode="study"]'); time.sleep(1.5)
    # find the study block for passage 0
    info = pg.evaluate('''() => { const sec=document.querySelector('#nitnem-passage-0'); const kids=[...sec.children].map(k=>({tag:k.tagName, cls:k.className, h:Math.round(k.getBoundingClientRect().height), text:k.innerText.slice(0,80)})); return kids }''')
    for k in info: print(k)
    study_html = pg.evaluate('''() => { const sec=document.querySelector('#nitnem-passage-0'); const st=[...sec.children].filter(k=>!k.matches('.scripture-line,.original-preface,.unit-heading,.meter-heading')); return st.map(x=>x.outerHTML).join('\\n') }''')
    print('STUDY BLOCK HTML (first 6000):\n', study_html[:6000])
    el = pg.query_selector('#nitnem-passage-0 .study, #nitnem-passage-0 [class*=study], #nitnem-passage-0 [class*=lesson]')
    if el:
        el.scroll_into_view_if_needed(); pg.mouse.wheel(0, 300); time.sleep(0.4); s.shot('07_jaap_study_block')
        print('study block text:\n', el.inner_text()[:3500])
    # tap-to-explore dialog
    pg.evaluate('window.scrollTo(0,0)'); time.sleep(0.2)
    pg.click('button[data-meaning-line="jaap001.line01"]'); time.sleep(0.6)
    print('DIALOG open:', pg.evaluate('document.querySelector("#meaning-dialog").open'))
    print('dialog text:\n', pg.inner_text('#meaning-dialog')[:3000])
    s.shot('08_jaap_explore_dialog')
    pg.keyboard.press('Escape'); time.sleep(0.3)
    print('dialog closed by Escape:', not pg.evaluate('document.querySelector("#meaning-dialog").open'))
    # jump dialog
    pg.click('#jump'); time.sleep(0.5); s.shot('09_jump_dialog')
    print('jump items:', pg.evaluate('document.querySelectorAll("#jump-list button, #jump-list a").length'), '| first few:', pg.evaluate('[...document.querySelectorAll("#jump-list button, #jump-list a")].slice(0,5).map(e=>e.innerText.replace(/\\s+/g," "))'))
    print('jump has search/filter input:', pg.evaluate('!!document.querySelector("#jump-dialog input")'))
    pg.keyboard.press('Escape'); time.sleep(0.2)
    pg.click('#reading-tools'); time.sleep(0.5); s.shot('10_tools_dialog'); 
    print('TOOLS text:\n', pg.inner_text('#tools-dialog')[:2500])
    print('console', s.console); print('errors', s.errors)
    s.close()
