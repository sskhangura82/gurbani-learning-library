"""S-11c: is the ORDER of prefaces, headings and lines on screen the same as the order used in the collation (S-05)?
Added during the comparison step after the reviewer found his own chhand-62 order finding was an artefact of extraction order."""
import json, sys, time
sys.path.insert(0, '/home/claude/work/tools')
from pw_common import *
C = json.load(open('/home/claude/work/app_corpus.json', encoding='utf-8'))
out = {}
with sync_playwright() as p:
    s = Session(p); pg = s.page
    for bani in ('jaap', 'savaiye', 'chaupai', 'anand', 'rehras', 'sohila'):
        pg.goto(BASE + f'nitnem/index.html?bani={bani}', wait_until='networkidle'); time.sleep(1.5)
        dom = pg.evaluate('''() => [...document.querySelectorAll('#source-unit article.scripture-line, #source-unit p.meter-heading, #source-unit p.original-preface')].map(e => (e.querySelector && e.querySelector('p.tuk') ? e.querySelector('p.tuk').textContent : e.textContent))''')
        corpus = [o['text'] for o in C if o['comp'] == bani]
        same = dom == corpus
        first = None
        if not same:
            for i, (a, b) in enumerate(zip(dom, corpus)):
                if a != b: first = {'index': i, 'screen': a, 'collation_order': b}; break
        # how many positions differ, and is it only a local swap?
        diffs = [i for i, (a, b) in enumerate(zip(dom, corpus)) if a != b]
        out[bani] = {'on_screen': len(dom), 'in_collation': len(corpus), 'same_sequence': same, 'positions_that_differ': diffs[:10], 'first_difference': first,
                     'same_multiset': sorted(dom) == sorted(corpus)}
    s.close()
json.dump(out, open('/home/claude/work/s11c_rendered_order.json', 'w'), ensure_ascii=False, indent=1)
print(json.dumps(out, ensure_ascii=False, indent=1))
