import json, sys, hashlib
sys.path.insert(0, '/home/claude/work/tools')
from pw_common import *
occ = json.load(open('/home/claude/work/app_corpus.json', encoding='utf-8'))
out = json.load(open('/home/claude/work/s11_partial.json')); out.pop('_japji_dom', None)
with sync_playwright() as p:
    s = Session(p); pg = s.page
    pg.goto(BASE + 'full-japji.html', wait_until='networkidle'); time.sleep(0.6)
    want = [(o['id'], o['text']) for o in occ if o['comp'] == 'japji']
    for depth in ['read', 'understand', 'study']:
        pg.click(f'.modes button[data-depth="{depth}"]'); time.sleep(1.0)
        got = pg.evaluate('''() => [...document.querySelectorAll('#continuous-reader article.scripture-line')].map(a => [a.dataset.occurrence, a.querySelector('p.tuk').textContent, a.querySelector('p.tuk').dataset.textSha256])''')
        out[f'japji:{depth}'] = dict(rendered=len(got), expected=len(want), order_and_ids_equal=[g[0] for g in got] == [w[0] for w in want],
            whitespace_exact_mismatch=sum(1 for g, w in zip(got, want) if g[1] != w[1]), dom_text_hash_mismatch=sum(1 for g in got if hashlib.sha256(g[1].encode()).hexdigest() != g[2]))
        print('japji', depth, out[f'japji:{depth}'])
    pg.goto(BASE + 'sukhmani.html', wait_until='networkidle'); time.sleep(1.0)
    print('sukhmani DOM sample:', pg.evaluate('''() => { const a=document.querySelector('#sukhmani-text .sk-ashtpadi'); const l=a.querySelector('[data-line-id], .sk-line, article'); return (l?l.outerHTML:a.innerHTML.slice(0,3000)).slice(0,1200) }'''))
    want = [(o['id'], o['text']) for o in occ if o['comp'] == 'sukhmani']
    for depth in ['read', 'understand', 'study']:
        pg.click(f'.modes button[data-depth="{depth}"]'); time.sleep(1.2)
        got = pg.evaluate('''() => [...document.querySelectorAll('#sukhmani-text [data-line-id]')].map(a => [a.dataset.lineId, (a.querySelector('.tuk, .gurmukhi, [lang=pa]')||a).textContent])''')
        out[f'sukhmani:{depth}'] = dict(rendered=len(got), expected=len(want), order_and_ids_equal=[g[0] for g in got] == [w[0] for w in want],
            whitespace_exact_mismatch=sum(1 for g, w in zip(got, want) if g[1] != w[1]), sample=[(g, w) for g, w in zip(got, want) if g[1] != w[1]][:2])
        print('sukhmani', depth, out[f'sukhmani:{depth}'])
    s.close()
json.dump(out, open('/home/claude/work/s11_rendered.json', 'w'), ensure_ascii=False, indent=1)
