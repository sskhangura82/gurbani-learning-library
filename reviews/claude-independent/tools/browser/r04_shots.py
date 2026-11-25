"""Evidence screenshots for R-04: altered scripture shown with no warning in the Japji and Sukhmani readers."""
import json, sys, time
sys.path.insert(0, '/home/claude/work/tools')
from pw_common import *
SITE = '/home/claude/site/gurbani-learning-library/'
with sync_playwright() as p:
    b = p.chromium.launch(); d = dict(p.devices['iPhone 14']); d['service_workers'] = 'block'
    c = b.new_context(**d); pg = c.new_page()
    jraw = open(SITE + 'js/japji-full-data.js', encoding='utf-8').read()
    body = jraw.replace('ਹੁਕਮਿ ਰਜਾਈ ਚਲਣਾ', 'ਹੁਕਮ ਰਜਾਈ ਚਲਣਾ', 1)
    assert body != jraw
    pg.route('**/js/japji-full-data.js*', lambda route, *a: route.fulfill(status=200, content_type='text/javascript', body=body))
    pg.goto(BASE + 'full-japji.html', wait_until='networkidle'); time.sleep(1.0)
    pg.evaluate('''() => document.querySelector('[data-occurrence="pauri01.line06"]').scrollIntoView({block: 'center'})'''); time.sleep(0.6)
    print('japji shows:', pg.evaluate('''() => document.querySelector('[data-occurrence="pauri01.line06"] .tuk').textContent'''))
    pg.screenshot(path='/home/claude/work/shots/65_r04_japji_altered_word_no_warning.png')
    pg2 = c.new_page()
    sraw = open(SITE + 'js/sukhmani-data.js', encoding='utf-8').read()
    sbody = sraw.replace('ਸਿਮਰਉ ਸਿਮਰਿ ਸਿਮਰਿ ਸੁਖੁ ਪਾਵਉ', 'ਸਿਮਰਉ ਸਿਮਰਿ ਸਿਮਰਿ ਦੁਖੁ ਪਾਵਉ', 1)
    assert sbody != sraw
    pg2.route('**/js/sukhmani-data.js*', lambda route, *a: route.fulfill(status=200, content_type='text/javascript', body=sbody))
    pg2.goto(BASE + 'sukhmani.html', wait_until='networkidle'); time.sleep(1.5)
    pg2.evaluate('''() => document.querySelector('[data-line-id="sukhmani.a01.p01.l02"]').scrollIntoView({block: 'center'})'''); time.sleep(0.6)
    print('sukhmani shows:', pg2.evaluate('''() => document.querySelector('[data-line-id="sukhmani.a01.p01.l02"]').textContent''')[:80])
    pg2.screenshot(path='/home/claude/work/shots/66_r04_sukhmani_altered_word_no_warning.png')
    b.close()
