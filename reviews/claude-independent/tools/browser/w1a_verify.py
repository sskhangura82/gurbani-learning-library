"""Verification of improvement PR 1a (Nitnem meanings readable by screen readers).
v1 = reviewed baseline a3476ac; v4 = improvement branch build. Headless Chromium; synthetic note only."""
import json, sys, time, re, urllib.request
sys.path.insert(0, '/home/claude/work/tools')
from playwright.sync_api import sync_playwright
B = 'http://127.0.0.1:8090/gurbani-learning-library/'
AXE = open('/home/claude/refs/axe/package/axe.min.js', encoding='utf-8').read()
C = json.load(open('/home/claude/work/app_corpus.json', encoding='utf-8'))
def switch(v): return urllib.request.urlopen('http://127.0.0.1:8090/__switch?root=' + v).read().decode()
def sw_state(pg): return pg.evaluate('''async () => { const r = await navigator.serviceWorker.getRegistration(); if(!r) return null; const keys = await caches.keys(); const sizes = {}; for (const k of keys) sizes[k.split(':').pop()] = (await (await caches.open(k)).keys()).length; return {active: r.active && r.active.state, waiting: !!r.waiting, caches: sizes} }''')
def axe(pg):
    pg.evaluate(AXE + "; void 0")
    r = pg.evaluate('''async () => { const r = await axe.run(document, {runOnly: {type:'tag', values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}, resultTypes:['violations']}); return r.violations.map(v => ({id: v.id, impact: v.impact, nodes: v.nodes.length, targets: v.nodes.slice(0, 3).map(n => n.target.join(' '))})) }''')
    return r
def meaning_probe(pg):
    return pg.evaluate('''() => { const b = [...document.querySelectorAll('button.simple-meaning')]; const withLabel = b.filter(x => x.hasAttribute('aria-label')).length;
        const first = b[0]; return {buttons: b.length, withAriaLabel: withLabel, firstText: first ? first.innerText.replace(/\\s+/g, ' ').trim().slice(0, 160) : null, firstAriaLabel: first ? first.getAttribute('aria-label') : null,
                                    langs: first ? [...first.querySelectorAll('span')].map(s => s.lang || '-') : null} }''')
R = {}
with sync_playwright() as p:
    b = p.chromium.launch(); d = dict(p.devices['iPhone 14']); c = b.new_context(**d); pg = c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:160]))
    # 1. reader on the public baseline, with a synthetic note and bookmark
    switch('v1'); pg.goto(B + 'nitnem/index.html', wait_until='networkidle')
    for _ in range(60):
        st = sw_state(pg)
        if st and st['active'] == 'activated' and sum(st['caches'].values()) > 50: break
        time.sleep(0.5)
    pg.reload(wait_until='networkidle'); pg.click('button[data-open="sohila"]'); time.sleep(0.8)
    pg.click('button[data-mode="meaning"]'); time.sleep(1.5)
    R['before'] = dict(sw=sw_state(pg), meaning=meaning_probe(pg), axe=[v for v in axe(pg) if v['id'] == 'label-content-name-mismatch'])
    R['before']['roleNameMatches'] = pg.get_by_role('button', name=re.compile('Sing the joyful song of praise')).count()
    pg.click('#reading-tools'); time.sleep(0.3); pg.click('#bookmark'); time.sleep(0.3); pg.fill('#note', 'W1A-SYNTHETIC-NOTE'); pg.click('#save-note'); time.sleep(0.5); pg.keyboard.press('Escape')
    # 2. the improvement build is published: it must wait, then apply on request
    switch('v4'); pg.reload(wait_until='networkidle'); time.sleep(1.0)
    if pg.evaluate('document.querySelector("#reader").hidden'): pg.click('button[data-open="sohila"]'); time.sleep(0.8)
    pg.click('#reading-tools'); time.sleep(0.3); pg.click('#check-update'); time.sleep(5)
    R['update_waiting'] = dict(sw=sw_state(pg), status=pg.inner_text('#offline-status'), applyVisible=pg.evaluate('!document.querySelector("#apply-update").hidden'),
                               stillOldCode=pg.evaluate('''() => { const x = document.querySelector('button.simple-meaning'); return x ? x.hasAttribute('aria-label') : null }'''))
    pg.click('#apply-update'); time.sleep(3.0); pg.wait_for_load_state('networkidle')
    if pg.evaluate('document.querySelector("#reader").hidden'): pg.click('button[data-open="sohila"]'); time.sleep(0.8)
    pg.click('button[data-mode="meaning"]'); time.sleep(1.5)
    R['after'] = dict(sw=sw_state(pg), meaning=meaning_probe(pg), axe=[v for v in axe(pg) if v['id'] == 'label-content-name-mismatch'], allAxe=[(v['id'], v['nodes']) for v in axe(pg)])
    R['after']['roleNameMatches'] = pg.get_by_role('button', name=re.compile('Sing the joyful song of praise')).count()
    pg.click('button[data-mode="study"]'); time.sleep(1.5)
    R['after']['study_axe'] = [(v['id'], v['nodes'], v['targets'][:2]) for v in axe(pg)]
    pg.click('#reading-tools'); time.sleep(0.4)
    R['after']['note'] = pg.input_value('#note'); R['after']['savedList'] = pg.inner_text('#saved-list')[:120].replace('\n', ' | '); pg.keyboard.press('Escape')
    # 3. Gurmukhi on screen unchanged, all six banis, in order
    seq = {}
    for bani in ('jaap', 'savaiye', 'chaupai', 'anand', 'rehras', 'sohila'):
        pg.goto(B + f'nitnem/index.html?bani={bani}', wait_until='networkidle'); time.sleep(1.2)
        dom = pg.evaluate('''() => [...document.querySelectorAll('#source-unit article.scripture-line, #source-unit p.meter-heading, #source-unit p.original-preface')].map(e => (e.querySelector && e.querySelector('p.tuk') ? e.querySelector('p.tuk').textContent : e.textContent))''')
        seq[bani] = dict(rows=len(dom), equalsBaselineRegister=(dom == [o['text'] for o in C if o['comp'] == bani]))
        pg.click('button[data-mode="meaning"]'); time.sleep(1.5)
        mp = meaning_probe(pg); seq[bani]['meaningButtons'] = mp['buttons']; seq[bani]['withAriaLabel'] = mp['withAriaLabel']
        pg.click('button[data-mode="read"]'); time.sleep(0.3)
    R['gurmukhi_and_meanings'] = seq
    # 4. offline on the new version
    c.set_offline(True); off = {}
    for bani in ('jaap', 'sohila'):
        pg.goto(B + f'nitnem/index.html?bani={bani}', wait_until='load'); time.sleep(1.5); pg.click('button[data-mode="meaning"]'); time.sleep(1.5)
        off[bani] = dict(lines=pg.evaluate('document.querySelectorAll("#source-unit article.scripture-line").length'), meanings=pg.evaluate('document.querySelectorAll("button.simple-meaning").length'))
    for page, sel in (('full-japji.html', '#continuous-reader article.scripture-line'), ('sukhmani.html', '#sukhmani-text [data-line-id]')):
        pg.goto(B + page, wait_until='load'); time.sleep(1.5); off[page] = pg.evaluate(f'document.querySelectorAll("{sel}").length')
    c.set_offline(False); R['offline_new_version'] = off; R['page_errors'] = errs
    b.close()
switch('v1')
json.dump(R, open('/home/claude/work/w1a_verify.json', 'w'), ensure_ascii=False, indent=1)
print(json.dumps(R, ensure_ascii=False, indent=1)[:5200])
