"""S-11: does the Gurmukhi the reader actually puts on the page equal the data, in every depth?"""
import json, sys, hashlib
sys.path.insert(0, '/home/claude/work/tools')
from pw_common import *
occ = json.load(open('/home/claude/work/app_corpus.json', encoding='utf-8'))
by_comp = {}
for o in occ: by_comp.setdefault(o['comp'], []).append(o)
out = {}
def norm(t): return ' '.join(t.split())
with sync_playwright() as p:
    s = Session(p); pg = s.page
    # ---- Nitnem six
    for comp in ['jaap', 'savaiye', 'chaupai', 'anand', 'rehras', 'sohila']:
        pg.goto(BASE + 'nitnem/index.html', wait_until='networkidle')
        pg.click(f'button[data-open="{comp}"]'); pg.wait_for_load_state('networkidle'); time.sleep(0.5)
        want_lines = [(o['id'], o['text']) for o in by_comp[comp] if o['kind'] == 'line']
        want_other = [o['text'] for o in by_comp[comp] if o['kind'] != 'line']
        for mode in ['read', 'meaning', 'study']:
            pg.click(f'button[data-mode="{mode}"]'); time.sleep(1.5 if mode != 'read' else 0.4)
            got = pg.evaluate('''() => [...document.querySelectorAll('#source-unit article.scripture-line')].map(a => [a.dataset.lineId, a.querySelector('p.tuk').textContent, a.dataset.sourceSha256])''')
            other = pg.evaluate('''() => [...document.querySelectorAll('#source-unit p.original-preface, #source-unit p.meter-heading')].map(e => e.textContent)''')
            ids_ok = [g[0] for g in got] == [w[0] for w in want_lines]
            text_bad = [(g[0], g[1], w[1]) for g, w in zip(got, want_lines) if norm(g[1]) != norm(w[1])]
            exact_bad = [(g[0]) for g, w in zip(got, want_lines) if g[1] != w[1]]
            sha_bad = [g[0] for g in got if hashlib.sha256(g[1].encode()).hexdigest() != g[2]]
            out[f'{comp}:{mode}'] = dict(rendered=len(got), expected=len(want_lines), order_and_ids_equal=ids_ok, text_mismatch=len(text_bad),
                                         whitespace_exact_mismatch=len(exact_bad), dom_text_hash_mismatch=len(sha_bad), headings_rendered=len(other), headings_expected=len(want_other),
                                         headings_equal=[norm(x) for x in other] == [norm(x) for x in want_other], sample_bad=text_bad[:3])
            print(comp, mode, out[f'{comp}:{mode}'])
    # ---- Japji
    pg.goto(BASE + 'full-japji.html', wait_until='networkidle'); time.sleep(0.6)
    want = [(o['id'], o['text']) for o in by_comp['japji']]
    print('japji DOM sample:', pg.evaluate('''() => document.querySelector('#continuous-reader').innerHTML.slice(0, 900)'''))
    out['_japji_dom'] = 'see below'
    s.close()
json.dump(out, open('/home/claude/work/s11_partial.json', 'w'), ensure_ascii=False, indent=1)
