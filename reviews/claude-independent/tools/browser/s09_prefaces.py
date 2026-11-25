import json, sys, time
sys.path.insert(0, '/home/claude/work/tools')
from pw_common import *
with sync_playwright() as p:
    s = Session(p); pg = s.page
    for bani in ('jaap', 'savaiye', 'chaupai', 'rehras'):
        pg.goto(BASE + f'nitnem/index.html?bani={bani}', wait_until='networkidle'); time.sleep(1.2)
        rows = pg.evaluate('''() => [...document.querySelectorAll('#source-unit article.scripture-line, #source-unit p.meter-heading, #source-unit p.original-preface')].slice(0, 7).map(e => [e.matches('article') ? 'line' : e.className, (e.querySelector && e.querySelector('p.tuk') ? e.querySelector('p.tuk').textContent : e.textContent)])''')
        print(bani)
        for r in rows: print('   ', r[0], '|', r[1][:90])
    s.close()
