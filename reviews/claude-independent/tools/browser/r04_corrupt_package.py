"""R-04: does a reader notice when the scripture data it received is not the published text?"""
import json, sys, hashlib, re
sys.path.insert(0, '/home/claude/work/tools')
from pw_common import *
SITE = '/home/claude/site/gurbani-learning-library/'
R = {}
def ctx(p):
    b = p.chromium.launch(); d = dict(p.devices['iPhone 14']); d['service_workers'] = 'block'
    c = b.new_context(**d); pg = c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:160])); return b, c, pg, errs
def state(pg, sel_lines, extra_sel=''):
    return dict(lines=pg.evaluate(f'document.querySelectorAll("{sel_lines}").length'),
                warnings=pg.evaluate('''() => [...document.querySelectorAll('[role=status],[role=alert],.candidate-banner,.review-mode,#collection-status,.loading-note,.coverage-note,#storage-warning,noscript')].filter(e=>!e.hidden&&e.offsetParent!==null).map(e=>e.innerText.trim()).filter(Boolean).slice(0,5)'''))
with sync_playwright() as p:
    raw = open(SITE + 'nitnem/data/sohila.json', encoding='utf-8').read(); pack = json.loads(raw)
    target = pack['units'][2]['lines'][2]   # sohila03.line03
    print('target line:', target['id'], target['text'])
    def variant(kind):
        d = json.loads(raw); ln = d['units'][2]['lines'][2]
        if kind == 'one_letter_changed_hash_stale': ln['text'] = ln['text'].replace('ਗ', 'ਕ', 1)
        elif kind == 'one_letter_changed_hash_recomputed': ln['text'] = ln['text'].replace('ਗ', 'ਕ', 1); ln['sha256'] = hashlib.sha256(ln['text'].encode()).hexdigest()
        elif kind == 'line_removed': del d['units'][2]['lines'][2]
        elif kind == 'line_duplicated': d['units'][2]['lines'].insert(3, dict(d['units'][2]['lines'][2], id='sohila03.line03b'))
        elif kind == 'two_lines_swapped': L = d['units'][2]['lines']; L[2], L[3] = L[3], L[2]
        elif kind == 'unit_removed': del d['units'][4]
        elif kind == 'truncated_file': return raw[: len(raw) // 2]
        elif kind == 'empty_units': d['units'] = []
        return json.dumps(d, ensure_ascii=False)
    for kind in ['unchanged_control', 'one_letter_changed_hash_stale', 'one_letter_changed_hash_recomputed', 'line_removed', 'line_duplicated', 'two_lines_swapped', 'unit_removed', 'truncated_file', 'empty_units']:
        b, c, pg, errs = ctx(p)
        body = raw if kind == 'unchanged_control' else variant(kind)
        pg.route('**/nitnem/data/sohila.json*', (lambda _b: (lambda route, *a: route.fulfill(status=200, content_type='application/json', body=_b)))(body))
        pg.goto(BASE + 'nitnem/index.html', wait_until='networkidle'); pg.click('button[data-open="sohila"]'); time.sleep(1.2)
        st = state(pg, '#source-unit .scripture-line')
        shown = pg.evaluate('''() => { const a=document.querySelector('[data-line-id="sohila03.line03"] .tuk'); return a?a.textContent:null }''')
        reader_open = pg.evaluate('!document.querySelector("#reader").hidden')
        R['nitnem:' + kind] = dict(reader_opened=reader_open, lines_rendered=st['lines'], target_line_shown=shown, altered_text_displayed=(shown is not None and shown != target['text']), messages=st['warnings'], page_errors=errs[:2])
        print('NITNEM', kind, json.dumps(R['nitnem:' + kind], ensure_ascii=False)[:520])
        if kind in ('one_letter_changed_hash_recomputed',): pg.screenshot(path='/home/claude/work/shots/60_r04_tampered_sohila.png')
        b.close()
    # Japji: data arrives as a script file
    jraw = open(SITE + 'js/japji-full-data.js', encoding='utf-8').read()
    for kind in ['unchanged_control', 'one_word_changed_hash_stale', 'one_word_changed_hash_recomputed', 'line_removed']:
        body = jraw
        if kind != 'unchanged_control':
            i = jraw.index('=', jraw.index('window.')) + 1; d = json.loads(jraw[i:].strip().rstrip(';')); ln = d['units'][3]['lines'][5]   # pauri01.line06 ਹੁਕਮਿ ਰਜਾਈ ਚਲਣਾ
            if kind == 'one_word_changed_hash_stale': ln['text'] = ln['text'].replace('ਹੁਕਮਿ', 'ਹੁਕਮ')
            if kind == 'one_word_changed_hash_recomputed': ln['text'] = ln['text'].replace('ਹੁਕਮਿ', 'ਹੁਕਮ'); ln['sha256'] = hashlib.sha256(ln['text'].encode()).hexdigest()
            if kind == 'line_removed': del d['units'][3]['lines'][5]
            body = jraw[:i] + ' ' + json.dumps(d, ensure_ascii=False) + ';'
        b, c, pg, errs = ctx(p)
        pg.route('**/js/japji-full-data.js*', (lambda _b: (lambda route, *a: route.fulfill(status=200, content_type='text/javascript', body=_b)))(body))
        pg.goto(BASE + 'full-japji.html', wait_until='networkidle'); time.sleep(1.0)
        st = state(pg, '#continuous-reader .scripture-line')
        shown = pg.evaluate('''() => { const a=document.querySelector('[data-occurrence="pauri01.line06"] .tuk'); return a?a.textContent:null }''')
        R['japji:' + kind] = dict(lines_rendered=st['lines'], target_line_shown=shown, messages=st['warnings'], page_errors=errs[:2], body_text_head=pg.inner_text('main')[:160].replace('\n', ' | ') if st['lines'] == 0 else '')
        print('JAPJI', kind, json.dumps(R['japji:' + kind], ensure_ascii=False)[:520]); b.close()
    # Sukhmani
    sraw = open(SITE + 'js/sukhmani-data.js', encoding='utf-8').read()
    for kind in ['unchanged_control', 'one_word_changed', 'line_removed']:
        body = sraw
        if kind == 'one_word_changed': body = sraw.replace('ਸਿਮਰਉ ਸਿਮਰਿ ਸਿਮਰਿ ਸੁਖੁ ਪਾਵਉ', 'ਸਿਮਰਉ ਸਿਮਰਿ ਸਿਮਰਿ ਦੁਖੁ ਪਾਵਉ', 1)
        if kind == 'line_removed':
            i = sraw.index('=', sraw.index('window.')) + 1; d = json.loads(sraw[i:].strip().rstrip(';')); del d['ashtpadis'][0]['lines'][10]; body = sraw[:i] + ' ' + json.dumps(d, ensure_ascii=False) + ';'
        b, c, pg, errs = ctx(p)
        pg.route('**/js/sukhmani-data.js*', (lambda _b: (lambda route, *a: route.fulfill(status=200, content_type='text/javascript', body=_b)))(body))
        pg.goto(BASE + 'sukhmani.html', wait_until='networkidle'); time.sleep(1.5)
        st = state(pg, '#sukhmani-text [data-line-id]')
        shown = pg.evaluate('''() => { const a=document.querySelector('[data-line-id="sukhmani.a01.p01.l02"] .tuk'); return a?a.textContent:null }''')
        R['sukhmani:' + kind] = dict(lines_rendered=st['lines'], target_line_shown=shown, messages=st['warnings'], page_errors=errs[:2], main_text=pg.inner_text('#sukhmani-text')[:200].replace('\n', ' | ') if st['lines'] == 0 else '')
        print('SUKHMANI', kind, json.dumps(R['sukhmani:' + kind], ensure_ascii=False)[:520]); b.close()
json.dump(R, open('/home/claude/work/r04_corrupt_package.json', 'w'), ensure_ascii=False, indent=1)
