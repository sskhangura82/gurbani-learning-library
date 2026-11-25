"""S-09 / CI-S-01 re-check: in what order does the Nitnem reader actually draw Jaap Sahib chhand 62?"""
import json, sys, time
sys.path.insert(0, '/home/claude/work/tools')
from pw_common import *
with sync_playwright() as p:
    s = Session(p); pg = s.page
    out = {}
    for layout in ('continuous', 'passage'):
        pg.goto(BASE + 'nitnem/index.html?bani=jaap&unit=62', wait_until='networkidle'); time.sleep(1.2)
        if layout == 'passage':
            b = pg.query_selector('#view-passage'); b and b.click(); time.sleep(0.8)
        seq = pg.evaluate('''() => {
          const first = document.querySelector('[data-line-id="jaap062.line01"]'); if (!first) return null;
          const unit = first.closest('[data-unit-id], section, .unit, .source-unit-block') || first.parentElement;
          const all = [...document.querySelectorAll('#source-unit article.scripture-line, #source-unit p.meter-heading, #source-unit p.original-preface')];
          const i = all.findIndex(e => e.dataset && e.dataset.lineId === 'jaap062.line01');
          return all.slice(Math.max(0, i - 3), i + 6).map(e => ({kind: e.matches('article') ? 'line' : e.className, id: e.dataset.lineId || null, text: (e.querySelector && e.querySelector('p.tuk') ? e.querySelector('p.tuk').textContent : e.textContent).trim(), top: Math.round(e.getBoundingClientRect().top + scrollY)}));
        }''')
        out[layout] = seq
        pg.evaluate('''() => document.querySelector('[data-line-id="jaap062.line01"]').scrollIntoView({block: 'center'})'''); time.sleep(0.5)
        s.shot(f'67_jaap062_{layout}')
    pos = pg.inner_text('#position-label') + ' / ' + pg.inner_text('#position-detail')
    out['dock'] = pos
    json.dump(out, open('/home/claude/work/s09_jaap62_order.json', 'w'), ensure_ascii=False, indent=1)
    for k, v in out.items():
        print(k)
        if isinstance(v, list):
            for e in v: print('   ', e)
        else: print('   ', v)
    s.close()
