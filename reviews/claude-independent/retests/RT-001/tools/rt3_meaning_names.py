"""RT-001 / CI-A-01: for EVERY meaning button in all three readers, what name does the browser give to assistive technology?
The name, role and description are read for every single button from Chromium's accessibility tree (the structure a screen
reader is given), over the browser's debugging protocol. This is not a VoiceOver test and not Safari.
Usage: python3 rt3_meaning_names.py <base-url> <out.json> <label>"""
import json, sys, time, re
from playwright.sync_api import sync_playwright
B, OUT, LABEL = sys.argv[1], sys.argv[2], sys.argv[3]
OLD = ['Meaning for this line. Tap to explore.', 'Passage context. Tap to explore.', 'Study this passage:', 'Read more about']
COLLECT = '''([sel]) => [...document.querySelectorAll(sel)].map(b => { const norm = s => (s || '').replace(/\\s+/g, ' ').trim();
   const en = b.querySelector('.english'), pa = b.querySelector('.punjabi');
   return {name: '', role: null, english: norm(en && en.textContent), punjabi: norm(pa && pa.textContent), punjabiTaggedAsPunjabi: pa ? pa.lang === 'pa' : null,
           ariaLabel: b.getAttribute('aria-label'), title: b.getAttribute('title'), visibleText: norm(b.innerText), tab: b.tabIndex, disabled: b.disabled}; })'''
R = {'label': LABEL, 'base': B, 'states': {}}
def judge(rows):
    n = len(rows)
    return dict(buttons=n, 
                nameContainsEnglish=sum(1 for r in rows if r['english'] and r['english'] in r['name']), haveEnglish=sum(1 for r in rows if r['english']),
                nameContainsPunjabi=sum(1 for r in rows if r['punjabi'] and r['punjabi'] in r['name']), havePunjabi=sum(1 for r in rows if r['punjabi']),
                punjabiTaggedAsPunjabi=sum(1 for r in rows if r['punjabiTaggedAsPunjabi']), stillHasFixedLabelAttribute=sum(1 for r in rows if r['ariaLabel'] is not None),
                nameIsAnOldFixedPhrase=sum(1 for r in rows if any(r['name'].startswith(o) for o in OLD)), roleButton=sum(1 for r in rows if r['role'] == 'button'),
                emptyName=sum(1 for r in rows if not r['name']), withTitleHint=sum(1 for r in rows if r['title']),
                example=dict(name=rows[0]['name'][:200], title=rows[0]['title'], visible=rows[0]['visibleText'][:120]) if rows else None)
with sync_playwright() as p:
    b = p.chromium.launch(args=['--enable-blink-features=AccessibilityObjectModel']); d = dict(p.devices['iPhone 14']); d['service_workers'] = 'block'
    c = b.new_context(**d); pg = c.new_page(); cdp = c.new_cdp_session(pg)
    cdp.send('DOM.enable'); cdp.send('Accessibility.enable')
    def state(key, sel):
        rows = pg.evaluate(COLLECT, [sel])
        doc = cdp.send('DOM.getDocument', {'depth': 0}); ids = cdp.send('DOM.querySelectorAll', {'nodeId': doc['root']['nodeId'], 'selector': sel})['nodeIds']
        assert len(ids) == len(rows), (len(ids), len(rows))
        for i, nid in enumerate(ids):
            ax = cdp.send('Accessibility.getPartialAXTree', {'nodeId': nid, 'fetchRelatives': False})['nodes'][0]
            rows[i]['name'] = re.sub(r'\s+', ' ', (ax.get('name') or {}).get('value', '') or '').strip(); rows[i]['role'] = (ax.get('role') or {}).get('value')
            rows[i]['description'] = ((ax.get('description') or {}).get('value') or ''); rows[i]['ignored'] = ax.get('ignored', False)
        j = judge(rows); j['withSpokenHint'] = sum(1 for r in rows if r['description']); j['hiddenFromAssistiveTechnology'] = sum(1 for r in rows if r['ignored'])
        j['nameEqualsVisibleMeaningExactly'] = sum(1 for r in rows if r['name'] == (r['english'] + ' ' + r['punjabi']).strip() or r['name'] == r['visibleText'])
        j['exampleHint'] = rows[0]['description'][:120] if rows else None; R['states'][key] = j
        print(key.ljust(26), '| buttons', j['buttons'], '| name has English', j['nameContainsEnglish'], '/', j['haveEnglish'], '| has Punjabi', j['nameContainsPunjabi'], '/', j['havePunjabi'], '| Punjabi tagged', j['punjabiTaggedAsPunjabi'],
              '| fixed label attr', j['stillHasFixedLabelAttribute'], '| old phrase', j['nameIsAnOldFixedPhrase'], '| empty', j['emptyName'], '| role button', j['roleButton'], '| hidden', j['hiddenFromAssistiveTechnology'], '| hint', j['withSpokenHint'], '| name==visible', j['nameEqualsVisibleMeaningExactly'])
    # Japji
    pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.5)
    pg.click('.modes button[data-depth="understand"]'); time.sleep(1.2); state('japji:meaning', '#continuous-reader button.simple-meaning')
    pg.click('.modes button[data-depth="study"]'); time.sleep(1.2); state('japji:study', '#continuous-reader button.simple-meaning')
    # does the button still do its job, by touch and by keyboard?
    pg.click('.modes button[data-depth="understand"]'); time.sleep(0.8)
    first = pg.locator('#continuous-reader button.simple-meaning').first; first.scroll_into_view_if_needed(); first.click(); time.sleep(0.8)
    R['japji_button_still_works'] = dict(afterTap=pg.evaluate("({dialogOpen: !!(document.getElementById('reader-dialog') && document.getElementById('reader-dialog').open), depth: (document.querySelector('.modes button[aria-pressed=\"true\"]') || {}).textContent || null})"))
    if pg.evaluate("!!document.getElementById('reader-dialog').open"): pg.keyboard.press('Escape'); time.sleep(0.3)
    R['japji_found_by_spoken_name'] = pg.get_by_role('button', name=re.compile(re.escape(R['states']['japji:meaning']['example']['name'][:40]))).count()
    # Sukhmani
    pg.goto(B + 'sukhmani.html', wait_until='networkidle'); time.sleep(2.5)
    pg.click('.modes button[data-depth="understand"]'); time.sleep(2.0); state('sukhmani:meaning', '#sukhmani-text button.simple-meaning')
    pg.click('.modes button[data-depth="study"]'); time.sleep(2.0); state('sukhmani:study', '#sukhmani-text button.simple-meaning')
    pg.click('.modes button[data-depth="understand"]'); time.sleep(1.5)
    first = pg.locator('#sukhmani-text button.simple-meaning').first; first.scroll_into_view_if_needed(); first.focus(); pg.keyboard.press('Enter'); time.sleep(1.2)
    R['sukhmani_button_still_works'] = dict(afterKeyboardEnter=pg.evaluate("({depth: (document.querySelector('.modes button[aria-pressed=\"true\"]') || {}).textContent || null, focusIsOn: (document.activeElement.className || document.activeElement.tagName).toString().slice(0, 40)})"))
    # Nitnem, all six banis
    tot = dict(buttons=0, en=0, haveEn=0, pa=0, havePa=0, label=0, old=0)
    for bani in ('jaap', 'savaiye', 'chaupai', 'anand', 'rehras', 'sohila'):
        pg.goto(B + f'nitnem/index.html?bani={bani}', wait_until='networkidle'); time.sleep(1.4)
        if pg.evaluate('document.querySelector("#reader").hidden'): pg.click(f'button[data-open="{bani}"]'); time.sleep(1.2)
        pg.click('button[data-mode="meaning"]'); time.sleep(1.8); state(f'nitnem:{bani}:meaning', '#source-unit button.simple-meaning'); j = R['states'][f'nitnem:{bani}:meaning']
        tot['buttons'] += j['buttons']; tot['en'] += j['nameContainsEnglish']; tot['haveEn'] += j['haveEnglish']; tot['pa'] += j['nameContainsPunjabi']; tot['havePa'] += j['havePunjabi']; tot['label'] += j['stillHasFixedLabelAttribute']; tot['old'] += j['nameIsAnOldFixedPhrase']
        if bani == 'sohila':
            pg.click('button[data-mode="study"]'); time.sleep(1.6); state('nitnem:sohila:study', '#source-unit button.simple-meaning')
            R['nitnem_other_buttons_in_study'] = pg.evaluate(COLLECT, ['#source-unit button[data-detail-unit]'])[:5]
            pg.click('button[data-mode="meaning"]'); time.sleep(1.2); first = pg.locator('#source-unit button.simple-meaning').first; first.scroll_into_view_if_needed(); first.click(); time.sleep(1.0)
            R['nitnem_button_still_works'] = pg.evaluate("({mode: (document.querySelector('button[data-mode][aria-pressed=\"true\"]') || {}).dataset ? document.querySelector('button[data-mode][aria-pressed=\"true\"]').dataset.mode : null, anyDialogOpen: !!document.querySelector('dialog[open]')})")
    R['nitnem_all_six'] = tot
    b.close()
json.dump(R, open(OUT, 'w'), ensure_ascii=False, indent=1)
print('NITNEM total', R['nitnem_all_six']); print('WORKS', R['japji_button_still_works'], R['sukhmani_button_still_works'], R.get('nitnem_button_still_works'), '| found by spoken name:', R['japji_found_by_spoken_name'])
for k in ('japji:meaning', 'sukhmani:meaning', 'nitnem:sohila:meaning'): print('EXAMPLE', k, json.dumps(R['states'][k]['example'], ensure_ascii=False), '| hint:', R['states'][k]['exampleHint'])
