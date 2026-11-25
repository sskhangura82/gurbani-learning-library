import json, sys, time
sys.path.insert(0, '/home/claude/work/tools')
from pw_common import *
NAMES = ('Open Granth', 'Shabad OS', 'BaniDB', 'SriGranth', 'SGPC', 'Sahib Singh', 'Rehat Maryada', 'website', 'edition', 'Dasam')
with sync_playwright() as p:
    s = Session(p); pg = s.page
    pg.goto(BASE + 'full-japji.html', wait_until='networkidle'); time.sleep(1.0)
    pg.click('#coverage-open'); time.sleep(0.6)
    print('JAPJI coverage dialog:\n', pg.inner_text('dialog[open]')[:1700])
    pg.keyboard.press('Escape')
    for bani in ('jaap', 'chaupai', 'savaiye', 'rehras', 'anand', 'sohila'):
        pg.goto(BASE + f'nitnem/index.html?bani={bani}', wait_until='networkidle'); time.sleep(1.0)
        whole = pg.evaluate('document.body.innerText')
        hidden = pg.evaluate('document.body.textContent')
        pg.click('#reading-tools'); time.sleep(0.4); tools = pg.inner_text('#tools-dialog'); pg.keyboard.press('Escape')
        print(f'\nNITNEM {bani}: visible page text {len(whole)} chars; names in visible text:', [n for n in NAMES if n in whole], '| in tools dialog:', [n for n in NAMES if n in tools], '| in DOM incl. hidden:', [n for n in NAMES if n in hidden])
        for sel in ('#bani-variant', '#learning-status', '#review-mode', '#learning-overview', '#source-lineage'):
            if pg.query_selector(sel): print('  ', sel, '→', pg.inner_text(sel).replace('\n', ' ')[:330])
    s.close()
