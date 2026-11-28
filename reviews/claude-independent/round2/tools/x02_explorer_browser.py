"""Round 2 · PR #41 Explorer + Ashtpadi 17 lesson at dc66da9: what is drawn, finding, discovering, damaged lesson file, link to the reader,
privacy, access, layout. Written from criteria frozen in round2/00_BASELINE_AND_FROZEN_CRITERIA_ROUND2.md before the builder's tests were opened.
Headless Chromium. Emulation only: not Safari, not a device.  Usage: python3 x02_explorer_browser.py <base-url> <site-root> <out.json>"""
import json, sys, time, re, urllib.parse, collections
from playwright.sync_api import sync_playwright
B, SITE, OUT = sys.argv[1:4]; U = B + 'explore/index.html'; SH = '/home/claude/work/shots/r2/'
AXE = open('/home/claude/refs/axe/package/axe.min.js', encoding='utf-8').read()
L = json.load(open(SITE + 'explore/lesson-17.json', encoding='utf-8')); UN = L['units']
SHOWN = '''() => { const q = id => document.getElementById(id); const seen = e => { if (!e || e.hidden || e.closest('[hidden]')) return false; const b = e.getBoundingClientRect(); return b.width > 20 && b.height > 8; };
  return {studyShown: seen(q('study')), location: q('lesson-location').textContent, heading: q('lesson-heading').textContent, cue: q('source-cue').textContent, newcomer: q('beginner-text').textContent, punjabi: q('beginner-pa').textContent,
    deep: q('deep-text').textContent, caution: q('boundary-text').textContent, prompt: q('reflection-text').textContent, words: [...document.querySelectorAll('#word-list dt')].map(d => d.textContent),
    comparisons: [...document.querySelectorAll('#comparison-list summary')].map(s => s.textContent), noComparisonNote: (document.querySelector('#comparison-list > p') || {}).textContent || null,
    feedback: q('search-feedback').innerText, current: (document.querySelector('#lesson-nav button[aria-current="true"]') || {}).textContent || null, hash: location.hash, draftLabel: q('lesson-status').textContent}; }'''
R = {'candidate': 'PR #41 at dc66da9f1e41e51408e47b7321ab5a414c44012b', 'base': B}; hosts = set(); errors = []
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
def save(): json.dump(R, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
with sync_playwright() as p:
    b = p.chromium.launch()
    def ctx(**kw):
        kw.setdefault('reduced_motion', 'reduce'); c = b.new_context(viewport=kw.pop('viewport', {'width': 390, 'height': 664}), service_workers='block', **kw); pg = c.new_page(); pg.set_default_timeout(12000)
        pg.on('request', lambda r: hosts.add(urllib.parse.urlparse(r.url).netloc)); pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None); pg.on('pageerror', lambda e: errors.append('PAGEERROR ' + str(e)))
        return c, pg
    def ready(pg, url=U):
        pg.goto(url, wait_until='networkidle'); time.sleep(0.25)
    # ---- A. what is drawn equals the lesson file, all nine units
    c, pg = ctx(); ready(pg); rows = []
    for u in UN:
        pg.click(f'#lesson-nav button[data-unit="{u["id"]}"]'); time.sleep(0.08); s = pg.evaluate(SHOWN)
        rows.append(dict(unit=u['id'], cue=(s['cue'] == u['cue']), newcomer=(s['newcomer'] == u['newcomer']), punjabi=(s['punjabi'] == u['punjabi']), deep=(s['deep'] == u['deep']), caution=(s['caution'] == u['caution']), prompt=(s['prompt'] == u['prompt']),
                         words=(len(s['words']) == len(u['vocabulary'])), comparisons=s['comparisons'], location=s['location'], hash=s['hash']))
    R['A_drawn_equals_file'] = dict(units=len(rows), allFieldsEqual=sum(all(r[k] for k in ('cue', 'newcomer', 'punjabi', 'deep', 'caution', 'prompt', 'words')) for r in rows), rows=rows)
    R['A_languageMarks'] = pg.evaluate('''() => ({cue: document.getElementById('source-cue').lang, punjabiPara: document.getElementById('beginner-pa').lang, html: document.documentElement.lang,
        introHasPunjabi: /[\\u0A00-\\u0A7F]/.test(document.getElementById('study-intro').textContent), punjabiIntroShownAnywhere: document.body.innerText.includes('ਸਤਾਰ੍ਹਵੀਂ ਅਸਟਪਦੀ'),
        termsShownAnywhere: document.body.innerText.includes('A section containing eight pauris'), draftWordsOnScreen: [...document.querySelectorAll('.method-note, #lesson-status, footer p')].map(e => e.innerText.slice(0, 160)),
        smallestText: [...document.querySelectorAll('body *')].filter(e => e.children.length === 0 && e.textContent.trim() && e.getBoundingClientRect().height > 0).map(e => [parseFloat(getComputedStyle(e).fontSize), e.textContent.trim().slice(0, 50)]).sort((a, b) => a[0] - b[0]).slice(0, 8)})''')
    pg.screenshot(path=SH + 'x_lesson_390.png', full_page=True); c.close()
    save(); log('section', 'B')
    # ---- B. finding: what each question gets
    QUERIES = ['', '   ', 'Sukhmani 17', 'Sukhmani Ashtpadi 17', 'ashtpadi 5', 'Ashtpadi 24', 'ashtpadi 25', 'ashtpadi 0', 'ਅਸਟਪਦੀ ੧੭', 'ਅਸਟਪਦੀ 3', 'pauri 3', 'pauri 9', 'pauri 0', 'Pauri 12', 'Hukam', 'ਹੁਕਮ', 'What is Hukam?', 'Naam', 'ਨਾਮ', 'bibek', 'ਬਿਬੇਕ', 'Sat', 'truth', 'seva', 'Buddhism', 'buddha', 'psychology', 'anxiety', 'uncertainty',
               'I feel anxiety and cannot sleep', 'I want to die', 'I am thinking of killing myself', 'I am depressed', 'help me', 'Japji Sahib', 'Anand Sahib', 'Guru Nanak', 'What is the weather today', 'who won the cricket', 'car', 'war', 'art', 'man', 'age', 'her', 'ant', 'god', 'God', 'Waheguru', 'Islam', 'Christianity', 'karma', 'reincarnation', 'meditation', 'mindfulness',
               '<img src=x onerror=alert(1)>', '"><script>alert(1)</script>', '%%%', '????', '17', '1', 'a', 'x' * 5000, 'ਸਤਿ', 'ਚਰਨ', 'ਆਦਿ ਸਚੁ ਜੁਗਾਦਿ ਸਚੁ', 'aad sach jugaad sach', 'saadh sangat', 'sant', 'grace', 'fear', 'death', 'money', 'sex', 'abuse', 'my guru told me to obey him']
    c, pg = ctx(); ready(pg); res = []
    for q in QUERIES:
        pg.evaluate("([q]) => { document.querySelector('#lesson-nav button[data-unit=\"salok\"]').click(); document.getElementById('search-feedback').replaceChildren(); document.getElementById('find-query').value = q; document.getElementById('find-form').requestSubmit(); }", [q]); time.sleep(0.03); s = pg.evaluate(SHOWN)
        res.append(dict(query=(q if len(q) < 80 else q[:20] + f'… ({len(q)} characters)'), shows=s['current'], says=s['feedback'], injected=pg.evaluate("!!document.querySelector('#search-feedback img, #search-feedback script')")))
    R['B_finding'] = res
    R['B_question_kept_or_sent'] = pg.evaluate("({url: location.href, local: Object.keys(localStorage), session: Object.keys(sessionStorage), cookies: document.cookie})"); c.close()
    save(); log('section', 'C')
    # ---- C. privacy: other readers' saved learning unchanged; nothing leaves the device
    c, pg = ctx(); pg.goto(B + 'index.html', wait_until='networkidle')
    seed = {'glp001.continuous.v2': json.dumps({'version': 2, 'marks': ['x1'], 'notes': {'a': 'synthetic note'}}), 'glp001.sukhmani.v1': json.dumps({'version': 1, 'read': 'sk-17-s-1', 'notes': {'b': 'synthetic'}})}
    pg.evaluate("s => { for (const k in s) localStorage.setItem(k, s[k]); }", seed); before = pg.evaluate("JSON.stringify(Object.entries(localStorage).sort())")
    ready(pg); pg.fill('#find-query', 'my private question about fear'); pg.press('#find-query', 'Enter'); pg.click('#surprise'); pg.click('#next'); time.sleep(0.2)
    after = pg.evaluate("JSON.stringify(Object.entries(localStorage).sort())"); R['C_privacy'] = dict(otherReadersSavedLearningUnchanged=(before == after), hostsContacted=sorted(hosts), externalLinks=pg.evaluate("[...document.querySelectorAll('a[href^=\"http\"]')].map(a => a.href).filter(h => !h.startsWith(location.origin))")); c.close()
    save(); log('section', 'D')
    # ---- D. "Teach me something"
    c, pg = ctx(); ready(pg); seen = collections.Counter(); repeats = 0; prev = pg.evaluate(SHOWN)['current']; msg = None
    for i in range(300):
        pg.evaluate("document.getElementById('surprise').click()"); s = pg.evaluate(SHOWN); seen[s['current']] += 1; repeats += (s['current'] == prev); prev = s['current']; msg = s['feedback']
    R['D_teach_me_something'] = dict(presses=300, unitsReached=len(seen), spread=dict(seen), sameTwiceRunning=repeats, lastMessage=msg); c.close()
    save(); log('section', 'E')
    # ---- E. addresses with a fragment
    E = {}
    for name, frag in (('valid unit', '#pauri-5'), ('unknown', '#nothing'), ('malformed percent', '#%'), ('malformed percent 2', '#%E0%A4%A'), ('markup', '#<img src=x onerror=1>'), ('unit in capitals', '#PAURI-5')):
        c, pg = ctx(); ready(pg, U + frag); s = pg.evaluate(SHOWN); E[name] = dict(address=frag, studyShown=s['studyShown'], shows=s['current'], says=s['feedback']); c.close()
    R['E_fragment'] = E
    save(); log('section', 'F')
    # ---- F. lesson file damaged on the way to the browser
    def altered(fn):
        d = json.loads(json.dumps(L)); fn(d); return json.dumps(d, ensure_ascii=False).encode()
    F = {}
    def c1(d): d['units'][0]['cue'] = d['units'][0]['cue'].replace('ਸਚੁ', 'ਸਚ', 1)
    def c2(d): d['units'][3]['cue'] = d['units'][5]['cue']
    def c3(d): d['units'][7]['newcomer'] = 'This pauri teaches that you must obey your leader without question.'
    def c4(d): d['units'][2]['ang'] = '999'
    def c5(d): d['status'] = 'APPROVED_BY_SCHOLARS'
    def c6(d): d['comparisons'][0]['source']['url'] = 'https://example.org/evil'
    def c7(d): d['units'].pop()
    def c8(d): d['units'][1], d['units'][2] = d['units'][2], d['units'][1]
    def c9(d): d['units'][4]['vocabulary'][0]['g'] = 'ਕੀੜੀ'
    def c10(d): d['bibliography'][0]['url'] = 'javascript:alert(1)'
    cases = [('one sign removed from the Salok cue', altered(c1)), ('Pauri 3 given the opening line of Pauri 5', altered(c2)), ('the first-understanding text of Pauri 7 replaced', altered(c3)), ('the Ang of Pauri 2 changed to 999', altered(c4)), ('status changed to APPROVED_BY_SCHOLARS', altered(c5)), ('a source link repointed', altered(c6)),
             ('last unit removed', altered(c7)), ('two units swapped', altered(c8)), ('a headword of Pauri 4 respelled', altered(c9)), ('a source link made a script address', altered(c10)), ('file cut in half', json.dumps(L, ensure_ascii=False).encode()[:15000]), ('file empty', b''), ('file missing', None), ('file is a web page', b'<!doctype html><title>x</title>')]
    for name, body in cases:
        c, pg = ctx()
        if body is None: pg.route('**/lesson-17.json', lambda r: r.fulfill(status=404, body='nf'))
        else: pg.route('**/lesson-17.json', (lambda bb: (lambda route: route.fulfill(status=200, content_type='application/json', body=bb)))(body))
        ready(pg); s = pg.evaluate(SHOWN); shown_now = {}
        if s['studyShown']:
            for uid in ('salok', 'pauri-2', 'pauri-3', 'pauri-4', 'pauri-7'):
                if pg.query_selector(f'#lesson-nav button[data-unit="{uid}"]'):
                    pg.click(f'#lesson-nav button[data-unit="{uid}"]'); t = pg.evaluate(SHOWN); shown_now[uid] = dict(cue=t['cue'], location=t['location'], newcomer=t['newcomer'][:70], firstWord=t['words'][:1])
        F[name] = dict(lessonShown=s['studyShown'], says=s['feedback'], draftLabel=s['draftLabel'] if s['studyShown'] else None, sample=shown_now, links=pg.evaluate("[...document.querySelectorAll('#bibliography a, #comparison-list a')].map(a => a.getAttribute('href')).slice(0, 2)") if s['studyShown'] else None,
                       buttonsStillEnabled=pg.evaluate("[...document.querySelectorAll('button')].filter(b => !b.disabled && b.getBoundingClientRect().height > 0).map(b => b.textContent.trim())") if not s['studyShown'] else None)
        if name == 'file missing': pg.screenshot(path=SH + 'x_lesson_missing_390.png', full_page=True)
        c.close()
    R['F_lesson_file_altered'] = F
    save(); log('section', 'G')
    # ---- G. the link to the existing reader
    G = {}
    for name, seeded in (('first visit', None), ('reader with a saved place in Ashtpadi 3', 'x')):
        c, pg = ctx(viewport={'width': 390, 'height': 664})
        if seeded:
            pg.goto(B + 'sukhmani.html', wait_until='networkidle'); time.sleep(0.8)
            pg.evaluate("document.getElementById('ashtpadi-3') && document.getElementById('ashtpadi-3').scrollIntoView()"); time.sleep(0.8)
        ready(pg); pg.click('#original-link'); pg.wait_for_load_state('networkidle'); time.sleep(2.0)
        G[name] = pg.evaluate('''() => { const secs = [...document.querySelectorAll('section[id^="ashtpadi-"]')]; const top = secs.map(s => [s.id, Math.round(s.getBoundingClientRect().top)]).filter(x => x[1] <= 120).pop();
            const t = document.getElementById('ashtpadi-17'); return {url: location.pathname + location.hash, scrollY: Math.round(scrollY), sectionAtTopOfScreen: top ? top[0] : null, ashtpadi17Exists: !!t, ashtpadi17DistanceFromTop: t ? Math.round(t.getBoundingClientRect().top) : null, positionLabel: (document.getElementById('sk-position') || {}).innerText || null}; }''')
        if not seeded: pg.screenshot(path=SH + 'x_link_to_reader_lands_390.png')
        c.close()
    R['G_link_to_original_reader'] = G
    c, pg = ctx(viewport={'width': 390, 'height': 664}); pg.goto(B + 'sukhmani.html', wait_until='networkidle'); time.sleep(1.0)
    pg.evaluate("document.querySelector('#ashtpadi-nav a:nth-child(3)').click()"); time.sleep(1.5); pg.mouse.wheel(0, 600); time.sleep(1.5)
    rec = lambda: pg.evaluate("(() => { const o = {}; for (const k of Object.keys(localStorage)) { try { const v = JSON.parse(localStorage.getItem(k)); o[k] = {read: v.read || v.position || v.last || null, keys: Object.keys(v)}; } catch (e) { o[k] = localStorage.getItem(k).slice(0, 60); } } return o; })()")
    before = rec(); label_before = pg.evaluate("(document.getElementById('sk-position') || {}).innerText")
    ready(pg); pg.click('#original-link'); pg.wait_for_load_state('networkidle'); time.sleep(2.5); after = rec()
    R['G2_saved_place_after_following_the_link'] = dict(placeBefore=label_before, savedBefore=before, savedAfter=after, placeLabelAfter=pg.evaluate("(document.getElementById('sk-position') || {}).innerText")); c.close()
    save(); log('section', 'H')
    # ---- H. automated accessibility scan in each state, light and dark
    H = {}
    for scheme in ('light', 'dark'):
        c, pg = ctx(color_scheme=scheme); ready(pg)
        def scan(label):
            pg.evaluate(AXE + '; void 0'); r = pg.evaluate("axe.run(document, {resultTypes: ['violations']}).then(r => r.violations.map(v => ({id: v.id, impact: v.impact, nodes: v.nodes.length, first: v.nodes[0].target.join(' '), help: v.help})))"); H[f'{label} · {scheme}'] = r
        scan('lesson open'); pg.fill('#find-query', 'Hukam'); pg.press('#find-query', 'Enter'); time.sleep(0.1); scan('after a search')
        pg.evaluate("document.querySelectorAll('details').forEach(d => d.open = true)"); time.sleep(0.1); scan('all notes and comparisons open')
        pg.fill('#find-query', 'weather'); pg.press('#find-query', 'Enter'); scan('nothing found'); pg.select_option('#ashtpadi-select', '5'); pg.click('#ashtpadi-open'); scan('Ashtpadi without a lesson')
        if scheme == 'dark': pg.screenshot(path=SH + 'x_lesson_dark_390.png', full_page=True)
        c.close()
        c, pg = ctx(color_scheme=scheme); pg.route('**/lesson-17.json', lambda r: r.fulfill(status=404, body='nf')); ready(pg); scan('lesson file missing'); c.close()
    R['H_axe'] = {k: v for k, v in H.items()}; R['H_axe_summary'] = dict(states=len(H), statesWithViolations=sum(1 for v in H.values() if v), violationIds=sorted({x['id'] for v in H.values() for x in v}))
    save(); log('section', 'I')
    # ---- I. keyboard and structure
    c, pg = ctx(viewport={'width': 1280, 'height': 800}); ready(pg)
    R['I_structure'] = pg.evaluate('''() => ({headings: [...document.querySelectorAll('h1,h2,h3,h4')].filter(h => h.getBoundingClientRect().height > 0).map(h => h.tagName + ' ' + h.textContent.trim().slice(0, 40)), landmarks: [...document.querySelectorAll('header,main,nav,aside,footer,[role]')].map(e => e.tagName.toLowerCase() + (e.getAttribute('role') ? '[' + e.getAttribute('role') + ']' : '') + (e.getAttribute('aria-label') ? ' "' + e.getAttribute('aria-label') + '"' : '')),
        liveRegions: [...document.querySelectorAll('[aria-live],[role=status],[role=alert]')].map(e => e.id + ':' + (e.getAttribute('aria-live') || e.getAttribute('role'))), smallTargets: [...document.querySelectorAll('a,button,select,input,summary')].filter(e => { const r = e.getBoundingClientRect(); return r.height > 0 && (r.height < 24 || r.width < 24); }).map(e => e.textContent.trim().slice(0, 30) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height))})''')
    stops = []
    for i in range(60):
        pg.keyboard.press('Tab'); a = pg.evaluate('''() => { const e = document.activeElement; if (!e || e === document.body) return null; const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return {what: e.tagName.toLowerCase() + (e.id ? '#' + e.id : ''), text: (e.textContent || e.value || '').trim().slice(0, 28), outline: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0, onScreen: r.height > 0}; }''')
        if a is None: break
        stops.append(a)
        if a['what'] == 'a' and 'Return to the existing' in a['text']: break
    R['I_keyboard'] = dict(stops=len(stops), withoutVisibleFocus=[s for s in stops if not s['outline']], first=[s['what'] + ' ' + s['text'] for s in stops[:8]])
    pg.click('#lesson-nav button[data-unit="pauri-2"]'); R['I_focus_after_choosing_a_unit'] = pg.evaluate("(() => { const e = document.activeElement; const cs = getComputedStyle(e); return {focusOn: e.tagName.toLowerCase() + '#' + e.id, ringShown: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0, statusText: document.getElementById('search-feedback').innerText}; })()")
    c.close()
    save(); log('section', 'J')
    # ---- J. layout at eight widths; enlarged text; print
    J = {}
    for w, h in ((320, 568), (390, 664), (507, 800), (768, 1024), (820, 1180), (1024, 768), (1280, 800), (1440, 900)):
        c, pg = ctx(viewport={'width': w, 'height': h}); ready(pg); pg.click('#lesson-nav button[data-unit="pauri-5"]'); pg.evaluate("document.querySelectorAll('details').forEach(d => d.open = true)"); time.sleep(0.15)
        J[str(w)] = pg.evaluate('''() => { const de = document.documentElement; const nav = document.getElementById('lesson-nav'); const cue = document.getElementById('source-cue'); const over = [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > innerWidth + 1) && !e.closest('#lesson-nav'); }).slice(0, 3).map(e => e.tagName.toLowerCase() + '.' + e.className);
            return {sidewaysScroll: de.scrollWidth > innerWidth, pageWidth: de.scrollWidth, unitButtonsStripScrolls: nav.scrollWidth > nav.clientWidth + 1, unitButtonsInStrip: nav.children.length, unitButtonsFullyVisible: [...nav.children].filter(b => { const r = b.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }).length, cueFontPx: parseFloat(getComputedStyle(cue).fontSize), cueLines: Math.round(cue.getBoundingClientRect().height / parseFloat(getComputedStyle(cue).lineHeight)), elementsPastRightEdge: over}; }''')
        if w in (320, 507, 820, 1440): pg.screenshot(path=SH + f'x_lesson_{w}.png', full_page=True)
        c.close()
    R['J_layout'] = J
    Z = {}
    for w in (320, 390, 768, 1280):   # browser zoom 200% is the same as half the viewport width at double pixel ratio
        c, pg = ctx(viewport={'width': w // 2, 'height': 500}, device_scale_factor=2); ready(pg); Z[f'{w} wide at 200% zoom'] = pg.evaluate("({sidewaysScroll: document.documentElement.scrollWidth > innerWidth + 1, pageWidth: document.documentElement.scrollWidth, viewport: innerWidth})"); c.close()
    R['J_zoom_200_percent'] = Z
    c, pg = ctx(); ready(pg); pg.emulate_media(media='print')
    R['J_print'] = pg.evaluate('''() => { const seen = s => [...document.querySelectorAll(s)].some(e => e.getBoundingClientRect().height > 0); return {draftNoticePrinted: seen('.method-note'), draftLabelPrinted: seen('#lesson-status'), cuePrinted: seen('#source-cue'), teachingPrinted: seen('#beginner-text'), deeperPrinted: seen('#deep-text'), boundaryPrinted: seen('#boundary-text'), comparisonsPrinted: seen('#comparison-list'), sourcesPrinted: seen('#bibliography'), controlsPrinted: seen('.finder')}; }''')
    pg.pdf(path='/home/claude/work/r2/x_print.pdf'); c.close()
    c, pg = ctx(reduced_motion='reduce'); ready(pg); R['J_reduced_motion'] = dict(reduce=pg.evaluate("getComputedStyle(document.documentElement).scrollBehavior")); c.close()
    c, pg = ctx(reduced_motion='no-preference'); ready(pg); R['J_reduced_motion']['noPreference'] = pg.evaluate("getComputedStyle(document.documentElement).scrollBehavior"); c.close()
    b.close()
R['consoleErrors'] = sorted(set(errors))[:12]; R['hostsContactedOverall'] = sorted(hosts)
json.dump(R, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('written', OUT)
