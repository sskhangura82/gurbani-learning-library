"""Round 3 · PR #45 knowledge pilot at 8fa9206: what is drawn, words, lessons, moving about, layout, access, damaged data,
privacy, the offline worker, print. Written from criteria frozen in round3/00_BASELINE_AND_FROZEN_CRITERIA_ROUND3.md
before the builder's tests were opened. Headless Chromium. Emulation only: not Safari, not a device.
Usage: python3 k3_03_pilot_browser.py <base-url ending in /> <site-root ending in /> <out.json> <shots dir>"""
import json, sys, time, re, os, urllib.parse, copy
from playwright.sync_api import sync_playwright
B, SITE, OUT, SH = sys.argv[1:5]; U = B + 'knowledge/index.html'; os.makedirs(SH, exist_ok=True)
AXE = open('/home/claude/refs/axe/package/axe.min.js', encoding='utf-8').read()
raw = open(SITE + 'knowledge/pilot.json', 'rb').read(); G = json.loads(raw)
OCC = {o['id']: o for o in G['occurrences']}; NODES = {n['id']: n for n in G['nodes']}
PASSAGES = [n for n in G['nodes'] if n['type'] == 'passage']
R = {'candidate': 'PR #45 at 8fa9206d9b4d6e90835972575458853b5d08247a', 'base': B}
def save(): json.dump(R, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)

STATE = '''() => { const c = document.getElementById('content'); const vis = e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
  return {status: document.getElementById('status').textContent, kicker: c.querySelector('.kicker')?.textContent ?? null, heading: c.querySelector('h2')?.textContent ?? null,
    lines: [...c.querySelectorAll('.pankti')].map(p => p.textContent), contentChildren: c.childElementCount, results: [...document.querySelectorAll('#results > div')].map(d => d.innerText.replace(/\\n+/g, ' | ')),
    browse: document.querySelectorAll('#browse button').length, searchEnabled: !document.getElementById('search-button').disabled,
    notes: [...c.querySelectorAll('.note')].map(n => n.textContent), related: [...c.querySelectorAll('.connection')].map(d => d.innerText.replace(/\\n+/g, ' | ')),
    active: document.activeElement ? (document.activeElement.id || document.activeElement.tagName + ':' + (document.activeElement.textContent || '').slice(0, 40)) : null, scrollY: Math.round(scrollY)}; }'''
LAYOUT = '''() => { const W = innerWidth; const vis = e => { const b = e.getBoundingClientRect(); const s = getComputedStyle(e); return b.width > 0 && b.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const inter = [...document.querySelectorAll('a,button,input,select,[tabindex="0"]')].filter(vis).map(e => { const b = e.getBoundingClientRect(); return {what: e.tagName.toLowerCase() + (e.className ? '.' + e.className : ''), text: (e.textContent || e.value || e.placeholder || '').trim().slice(0, 40), w: Math.round(b.width), h: Math.round(b.height)}; });
  const texts = []; const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
  while ((n = tw.nextNode())) { if (!n.textContent.trim()) continue; const e = n.parentElement; if (!e || !vis(e) || e.closest('dialog:not([open])')) continue; texts.push({px: parseFloat(getComputedStyle(e).fontSize), el: e.tagName.toLowerCase() + (e.className ? '.' + e.className : ''), t: n.textContent.trim().slice(0, 50)}); }
  const over = [...document.querySelectorAll('body *')].filter(vis).filter(e => e.getBoundingClientRect().right > W + 1).map(e => e.tagName.toLowerCase() + (e.className ? '.' + e.className : '')).slice(0, 8);
  const clipped = [...document.querySelectorAll('.pankti,.pa')].filter(vis).filter(e => e.scrollWidth > e.clientWidth + 1).length;
  return {width: W, sidewaysScroll: document.documentElement.scrollWidth > W + 1, pageWidth: document.documentElement.scrollWidth, pastTheEdge: over, clippedGurmukhi: clipped,
    targets: inter.length, under24: inter.filter(x => x.w < 24 || x.h < 24), under44: inter.filter(x => x.w < 44 || x.h < 44),
    smallestTextPx: Math.min(...texts.map(x => x.px)), under12: [...new Map(texts.filter(x => x.px < 12).map(x => [x.el, x])).values()], under14count: texts.filter(x => x.px < 14).length}; }'''
with sync_playwright() as p:
    b = p.chromium.launch()
    requests = []
    def ctx(viewport=None, sw='block', **kw):
        c = b.new_context(viewport=viewport or {'width': 390, 'height': 760}, service_workers=sw, reduced_motion='reduce', **kw); c.set_default_timeout(8000); pg = c.new_page()
        pg.on('request', lambda r: requests.append(r.url)); return c, pg
    def ready(pg, url=U):
        pg.goto(url, wait_until='networkidle'); pg.wait_for_function("document.getElementById('status').textContent.indexOf('Checking') < 0", timeout=8000); time.sleep(0.15)
    def find(pg, q, mode='auto', author=''):
        pg.fill('#query', q); pg.select_option('#mode', mode); pg.select_option('#author', author); pg.click('#search-button'); time.sleep(0.12)
    def open_result(pg, title):
        pg.evaluate("([t]) => { const b = [...document.querySelectorAll('#results button')].find(x => x.textContent.startsWith(t)); if (!b) throw Error('no result ' + t); b.click(); }", [title]); time.sleep(0.15)
    def open_passage(pg, n): find(pg, str(n['angStart'])); open_result(pg, n['title'])

    # ---------------- A. first load: what is asked for, what is stored, what is said
    log('A first load')
    try:
        c, pg = ctx(); msgs = []; pg.on('console', lambda m: msgs.append(m.type + ': ' + m.text)); pg.on('pageerror', lambda e: msgs.append('pageerror: ' + str(e)))
        requests.clear(); ready(pg); s = pg.evaluate(STATE)
        store = pg.evaluate('''async () => ({localStorage: Object.keys(localStorage), sessionStorage: Object.keys(sessionStorage), cookies: document.cookie, databases: indexedDB.databases ? (await indexedDB.databases()).map(d => d.name) : 'n/a', caches: await caches.keys(), workers: (await navigator.serviceWorker?.getRegistrations?.() || []).length})''')
        R['A_first_load'] = dict(state=s, console=msgs, requested=sorted({urllib.parse.urlparse(u).path for u in requests}), hosts=sorted({urllib.parse.urlparse(u).netloc for u in requests}), stored=store,
                                 firstScreenText=pg.evaluate("document.body.innerText").split('\n')[:14], csp=pg.evaluate("document.querySelector('meta[http-equiv=Content-Security-Policy]')?.content"), robots=pg.evaluate("document.querySelector('meta[name=robots]')?.content"))
        pg.screenshot(path=SH + 'k_first_screen_phone.png', full_page=True); c.close()
    except Exception as e: R['A_first_load'] = {'error': str(e)}
    save()

    # ---------------- B. what is drawn equals the data; C. words
    log('B/C passages and words')
    try:
        c, pg = ctx(); ready(pg); out = []; words = []
        for n in PASSAGES:
            open_passage(pg, n); s = pg.evaluate(STATE); want = [OCC[i]['text'] for i in n['occurrenceIds']]
            marks = pg.evaluate("[...document.querySelectorAll('#content .pankti')].map(p => ({cls: p.className, cur: p.getAttribute('aria-current'), style: p.getAttribute('style'), mark: !!p.querySelector('mark')}))")
            langs = pg.evaluate("({scripture: document.querySelector('#content .scripture')?.lang, heading: document.querySelector('#content h2')?.closest('[lang]')?.lang})")
            out.append(dict(passage=n['id'], heading=s['heading'], kicker=s['kicker'], metaLine=s['notes'][0] if s['notes'] else None, linesDrawn=len(s['lines']), linesWanted=len(want), equalInOrder=s['lines'] == want,
                            focusRowInData=n['focusId'], anyRowMarkedOnScreen=any(m['cur'] or m['mark'] or m['style'] or m['cls'] != 'pankti' for m in marks), langs=langs, notes=s['notes'], related=s['related'],
                            links=pg.evaluate("[...document.querySelectorAll('#content a')].map(a => a.textContent + ' -> ' + a.href)")))
            if n['angStart'] == 470: pg.screenshot(path=SH + 'k_passage_470_phone.png', full_page=True)
            btns = pg.evaluate("[...document.querySelectorAll('#content .word')].map((b, i) => { const r = b.getBoundingClientRect(); return {i, form: b.textContent, row: b.closest('.pankti').dataset.occurrence, w: Math.round(r.width), h: Math.round(r.height)}; })")
            for wb in btns:
                pg.evaluate("([i]) => document.querySelectorAll('#content .word')[i].click()", [wb['i']]); time.sleep(0.1)
                d = pg.evaluate("({open: document.getElementById('word-dialog').open, title: document.getElementById('word-title').textContent, body: document.getElementById('word-body').innerText.replace(/\\n+/g, ' | '), focusIn: document.getElementById('word-dialog').contains(document.activeElement), focusOn: document.activeElement.textContent.slice(0, 30)})")
                if wb['i'] == 0 and n['angStart'] == 470: pg.screenshot(path=SH + 'k_word_dialog_phone.png')
                pg.keyboard.press('Escape'); time.sleep(0.1)
                back = pg.evaluate("([i]) => ({closed: !document.getElementById('word-dialog').open, focusBackOnSameWord: document.activeElement === document.querySelectorAll('#content .word')[i]})", [wb['i']])
                words.append(dict(passage=n['id'], **wb, dialog=d, afterEscape=back))
            # a word with no entry is plain text
            plain = pg.evaluate("[...document.querySelectorAll('#content .pankti')].map(p => [...p.childNodes].filter(x => x.nodeType === 3 && x.textContent.trim()).length).reduce((a, b) => a + b, 0)")
            out[-1]['wordsWithEntries'] = len(btns); out[-1]['textRunsWithoutEntries'] = plain
        R['B_passages'] = out; R['C_words'] = words
        # dictionary entry and the way back
        n = PASSAGES[0]; open_passage(pg, n); pg.evaluate("document.querySelectorAll('#content .word')[0].scrollIntoView({block: 'center'})"); y0 = pg.evaluate('Math.round(scrollY)')
        pg.evaluate("document.querySelectorAll('#content .word')[0].click()"); time.sleep(0.1); pg.evaluate("[...document.querySelectorAll('#word-body button')][0].click()"); time.sleep(0.15); entry = pg.evaluate(STATE)
        entry_text = pg.evaluate("document.getElementById('content').innerText")
        pg.evaluate("document.querySelector('#content > button').click()"); time.sleep(0.15); after = pg.evaluate(STATE)
        R['C_dictionary_entry_and_back'] = dict(entryHeading=entry['heading'], entryKicker=entry['kicker'], entryText=entry_text.split('\n'), backHeading=after['heading'], scrollBefore=y0, scrollAfterBack=after['scrollY'], backToSamePlace=abs(after['scrollY'] - y0) <= 4, focusAfterBack=after['active'])
        c.close()
    except Exception as e: R['B_error'] = str(e)
    save()

    # ---------------- D. lessons: three depths, two languages, draft label, place kept
    log('D lessons')
    try:
        c, pg = ctx(); ready(pg); les = []
        for cid in ('concept.humility', 'concept.haumai'):
            find(pg, NODES[cid]['title']); open_result(pg, NODES[cid]['title']); L = NODES[NODES[cid]['lessonId']]
            for d, label in (('simple', 'Simple'), ('detailed', 'Detailed'), ('deep', 'Deep study')):
                pg.evaluate("([d]) => document.querySelector('[data-depth=\"' + d + '\"]').scrollIntoView({block: 'center'})", [d]); y0 = pg.evaluate('Math.round(scrollY)')
                pg.evaluate("([d]) => document.querySelector('[data-depth=\"' + d + '\"]').click()", [d]); time.sleep(0.1)
                st = pg.evaluate('''() => { const c = document.getElementById('content'); const ps = [...c.querySelectorAll(':scope > p')]; return {ps: ps.map(p => ({t: p.textContent, cls: p.className, lang: p.lang})), pressed: [...c.querySelectorAll('[data-depth]')].map(b => b.dataset.depth + '=' + b.getAttribute('aria-pressed')), y: Math.round(scrollY), active: document.activeElement.dataset?.depth || document.activeElement.id}; }''')
                texts = [x['t'] for x in st['ps']]
                les.append(dict(concept=cid, depth=d, englishShown=L[d]['en'] in texts, punjabiShown=L[d]['pa'] in texts, punjabiMarkedPa=any(x['t'] == L[d]['pa'] and x['lang'] == 'pa' for x in st['ps']),
                                draftNoteEnglish=[t for t in texts if 'draft' in t.lower()], draftNoteInPunjabi=any(re.search(r'ਖਰੜਾ|ਡਰਾਫਟ|ਡਰਾਫ਼ਟ|ਮਸੌਦਾ', t) for t in texts), versionShown=any(re.search(r'revision|version|ਸੰਸਕਰਣ', t, re.I) for t in texts),
                                pressed=st['pressed'], scrollBefore=y0, scrollAfter=st['y'], focusAfter=st['active'], wordsEn=len(L[d]['en'].split()), wordsPa=len(L[d]['pa'].split())))
            if cid == 'concept.haumai': pg.screenshot(path=SH + 'k_lesson_haumai_deep_phone.png', full_page=True)
        R['D_lessons'] = les
        # opening another item and coming back: is the depth kept?
        find(pg, 'Humility'); open_result(pg, 'Humility'); pg.evaluate("document.querySelector('[data-depth=deep]').click()"); time.sleep(0.1)
        pg.evaluate("[...document.querySelectorAll('#content .connection button')][0].click()"); time.sleep(0.15); pg.evaluate("document.querySelector('#content > button').click()"); time.sleep(0.15)
        R['D_depth_kept_after_going_and_coming_back'] = pg.evaluate("[...document.querySelectorAll('[data-depth]')].map(b => b.dataset.depth + '=' + b.getAttribute('aria-pressed'))")
        # the four concepts without teaching, the studies, the course, a lesson record
        other = {}
        for q, title in (('Hukam', 'Hukam'), ('Seva', 'Seva'), ('Shabad', 'Shabad'), ('Kirpa', 'Kirpa'), ('psychology', 'Intellectual humility'), ('buddhism', 'Buddhist reflection on conceit')):
            find(pg, q); open_result(pg, title); other[title] = pg.evaluate("document.getElementById('content').innerText").split('\n')
        pg.evaluate("[...document.querySelectorAll('#browse button')].find(b => b.textContent.startsWith('Understanding the human mind')).click()"); time.sleep(0.15); other['course'] = pg.evaluate("document.getElementById('content').innerText").split('\n')
        find(pg, 'ਹਉਮੈ'); R['D_results_for_haumai_in_gurmukhi'] = pg.evaluate(STATE)['results']
        R['D_other_pages'] = other; pg.screenshot(path=SH + 'k_course_phone.png', full_page=True); c.close()
    except Exception as e: R['D_error'] = str(e)
    save()

    # ---------------- E. search through the page (the bulk is in k3_02): what the reader is told
    log('E search on the page')
    try:
        c, pg = ctx(); ready(pg); dialogs = []; pg.on('dialog', lambda d: (dialogs.append(d.message), d.dismiss())); ui = {}
        for name, q, mode in (('empty', '', 'auto'), ('blank spaces', '   ', 'auto'), ('unrelated word: category', 'category', 'auto'), ('unrelated word: NASA', 'NASA', 'auto'), ('one Gurmukhi letter', 'ਹ', 'auto'),
                              ('first letters without choosing the mode', 'ਮਨਨਗਚਤ', 'auto'), ('first letters, mode chosen', 'ਮਨਨਗਚਤ', 'first-letter'), ('first letters by the vowel-carrier convention', 'ੳਜਅਅਕਜਨਕ', 'first-letter'),
                              ('a line that is not in the pilot', 'ਸੋਚੈ ਸੋਚਿ ਨ ਹੋਵਈ', 'auto'), ('Ang outside the pilot', '465', 'auto'), ('Ang beyond 1430', '1431', 'auto'), ('markup', '<img src=x onerror=alert(1)>', 'auto'),
                              ('5,000 characters', 'x' * 5000, 'auto'), ('humility', 'humility', 'auto'), ('Ang 466 in Gurmukhi', 'ਅੰਗ ੪੬੬', 'auto'), ('page 466', 'page 466', 'auto'), ('Mahalla 2', 'Mahalla 2', 'auto'), ('grace', 'grace', 'auto')):
            find(pg, q, mode); s = pg.evaluate(STATE); ui[name] = dict(status=s['status'], results=s['results'], injected=pg.evaluate("document.querySelectorAll('#results img, #results script').length"))
        R['E_search_on_page'] = ui; R['E_alerts_raised'] = dialogs
        find(pg, 'haumai'); pg.screenshot(path=SH + 'k_results_haumai_phone.png', full_page=True)
        # Enter in the box
        pg.fill('#query', 'kabir'); pg.press('#query', 'Enter'); time.sleep(0.12); R['E_enter_key_searches'] = pg.evaluate(STATE)['results']
        c.close()
    except Exception as e: R['E_error'] = str(e)
    save()

    # ---------------- F. moving about: the page's own Previous, the browser's Back, an address for an item, reload
    log('F moving about')
    try:
        c, pg = ctx(); pg.goto(B + 'index.html', wait_until='domcontentloaded'); ready(pg)
        h0 = pg.evaluate('history.length'); n = PASSAGES[1]; open_passage(pg, n); find(pg, 'haumai'); open_result(pg, 'Haumai'); h1 = pg.evaluate('history.length'); url1 = pg.url
        pg.go_back(wait_until='domcontentloaded'); time.sleep(0.3)
        R['F_browser_back'] = dict(historyEntriesBefore=h0, historyEntriesAfterThreeMoves=h1, addressAfterMoves=url1, addressAfterBrowserBack=pg.url, leftThePilot='knowledge/' not in pg.url)
        addr = {}
        for frag in ('#concept.haumai', '#sggs.asa.466.m2.salok02', '?id=concept.haumai', '#%', '#' + 'x' * 3000, '?q=haumai'):
            ready(pg, U + frag); s = pg.evaluate(STATE); addr[frag if len(frag) < 40 else frag[:12] + '…(3,000)'] = dict(heading=s['heading'], status=s['status'])
        R['F_address_for_an_item'] = addr
        ready(pg); open_passage(pg, PASSAGES[0]); pg.reload(wait_until='networkidle'); time.sleep(0.3); R['F_after_reload_on_a_passage'] = pg.evaluate(STATE)['heading']
        # page's own Previous through four moves
        ready(pg); trail = [pg.evaluate(STATE)['heading']]
        open_passage(pg, PASSAGES[0]); trail.append(pg.evaluate(STATE)['heading']); pg.evaluate("document.querySelectorAll('#content .word')[1].click()"); time.sleep(0.1); pg.evaluate("[...document.querySelectorAll('#word-body button')][0].click()"); time.sleep(0.15); trail.append(pg.evaluate(STATE)['heading'])
        find(pg, 'kabir'); open_result(pg, 'Bhagat Kabir Ji'); trail.append(pg.evaluate(STATE)['heading']); backs = []
        for _ in range(4):
            if pg.evaluate("document.querySelector('#content > button').disabled"): backs.append('(Previous is disabled)'); break
            pg.evaluate("document.querySelector('#content > button').click()"); time.sleep(0.12); backs.append(pg.evaluate(STATE)['heading'])
        R['F_previous_button'] = dict(forward=trail, back=backs, retracesExactly=backs[:3] == trail[::-1][1:])
        c.close()
    except Exception as e: R['F_error'] = str(e)
    save()

    # ---------------- G. layout at eight widths, four states
    log('G layout')
    try:
        lay = []
        for w, h in ((320, 568), (375, 667), (390, 844), (430, 932), (768, 1024), (820, 1180), (1280, 800), (1440, 900)):
            c, pg = ctx({'width': w, 'height': h}); ready(pg)
            for state in ('lesson', 'results', 'passage', 'word dialog'):
                if state == 'results': find(pg, 'haumai')
                if state == 'passage': open_passage(pg, PASSAGES[0])
                if state == 'word dialog': pg.evaluate("document.querySelectorAll('#content .word')[0].click()"); time.sleep(0.1)
                m = pg.evaluate(LAYOUT); m['state'] = state; lay.append(m)
                if state == 'passage' and w in (320, 768, 1280): pg.screenshot(path=SH + 'k_passage_%d.png' % w, full_page=True)
            c.close()
        R['G_layout'] = [dict(width=m['width'], state=m['state'], sidewaysScroll=m['sidewaysScroll'], pageWidth=m['pageWidth'], pastTheEdge=m['pastTheEdge'], clippedGurmukhi=m['clippedGurmukhi'], targets=m['targets'],
                              under24=m['under24'], under44=len(m['under44']), under44examples=m['under44'][:6], smallestTextPx=m['smallestTextPx'], under12=m['under12'], under14count=m['under14count']) for m in lay]
        # text at twice the size: the reader's own setting, then page zoom
        c, pg = ctx({'width': 390, 'height': 844}); ready(pg); before = pg.evaluate("parseFloat(getComputedStyle(document.querySelector('#content p')).fontSize)")
        pg.evaluate("document.documentElement.style.fontSize = '200%'"); time.sleep(0.1); after = pg.evaluate("parseFloat(getComputedStyle(document.querySelector('#content p')).fontSize)")
        R['G_reader_text_size_setting'] = dict(bodyTextPxAtDefault=before, bodyTextPxWhenReaderDoublesDefault=after, follows=after > before * 1.5); c.close()
        c, pg = ctx({'width': 640, 'height': 400}, device_scale_factor=2); ready(pg); open_passage(pg, PASSAGES[0]); m = pg.evaluate(LAYOUT)
        R['G_zoom_200_of_1280'] = dict(sidewaysScroll=m['sidewaysScroll'], clippedGurmukhi=m['clippedGurmukhi']); c.close()
    except Exception as e: R['G_error'] = str(e)
    save()

    # ---------------- H. accessibility scan; language marking; keyboard
    log('H access')
    try:
        ax = []
        for scheme in ('light', 'dark'):
            for w in (390, 1280):
                c, pg = ctx({'width': w, 'height': 844}, color_scheme=scheme); ready(pg)
                for state in ('lesson', 'results', 'passage', 'word dialog'):
                    if state == 'results': find(pg, 'haumai')
                    if state == 'passage': open_passage(pg, PASSAGES[1])
                    if state == 'word dialog': pg.evaluate("document.querySelectorAll('#content .word')[0].click()"); time.sleep(0.1)
                    pg.evaluate(AXE); r = pg.evaluate("axe.run(document, {resultTypes: ['violations', 'incomplete']}).then(r => ({v: r.violations.map(v => ({id: v.id, impact: v.impact, n: v.nodes.length, help: v.help, first: v.nodes[0].target.join(' '), detail: (v.nodes[0].any[0]?.message || '').slice(0, 160)})), inc: r.incomplete.map(v => v.id + ' ×' + v.nodes.length)}))")
                    ax.append(dict(scheme=scheme, width=w, state=state, violations=r['v'], needsHumanCheck=r['inc']))
                if scheme == 'dark' and w == 390: pg.keyboard.press('Escape'); pg.screenshot(path=SH + 'k_passage_dark_phone.png', full_page=True)
                c.close()
        R['H_axe'] = ax
        c, pg = ctx(); ready(pg); find(pg, 'haumai')
        R['H_language_marking'] = pg.evaluate('''() => { const G = /[\\u0a00-\\u0a7f]/, L = /[A-Za-z]{3,}/; const out = {gurmukhiInsideEnglish: [], englishInsidePunjabi: []}; const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
            while ((n = tw.nextNode())) { const t = n.textContent.trim(); if (!t) continue; const e = n.parentElement; if (e.closest('dialog:not([open])')) continue; const lang = e.closest('[lang]').lang;
              if (G.test(t) && lang !== 'pa') out.gurmukhiInsideEnglish.push((e.tagName.toLowerCase() + (e.className ? '.' + e.className : '')) + ': ' + t.slice(0, 50)); if (L.test(t) && lang === 'pa') out.englishInsidePunjabi.push(t.slice(0, 50)); }
            return {gurmukhiNotMarkedCount: out.gurmukhiInsideEnglish.length, examples: out.gurmukhiInsideEnglish.slice(0, 6), englishInsidePunjabi: out.englishInsidePunjabi}; }''')
        # keyboard only: from the top to a word's meaning and back
        ready(pg); steps = []
        def act(): return pg.evaluate("(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); const o = getComputedStyle(a).outlineStyle; return (a.id || a.tagName.toLowerCase()) + ' «' + (a.textContent || a.value || '').trim().slice(0, 28) + '» outline=' + o; })()")
        for _ in range(6): pg.keyboard.press('Tab'); steps.append(act())
        pg.focus('#query'); pg.keyboard.type('466'); pg.keyboard.press('Enter'); time.sleep(0.15); steps.append('typed 466 + Enter → ' + pg.evaluate(STATE)['status'])
        for _ in range(12):
            pg.keyboard.press('Tab'); a = act()
            if 'Understanding Haumai' in a: steps.append(a); break
        pg.keyboard.press('Enter'); time.sleep(0.15); steps.append('Enter on the result → focus on ' + act() + ' · heading ' + str(pg.evaluate(STATE)['heading']))
        for _ in range(8):
            pg.keyboard.press('Tab'); a = act()
            if a.startswith('button «ਹਉਮੈ'): steps.append(a); break
        pg.keyboard.press('Enter'); time.sleep(0.15); steps.append('Enter on the word → dialog open ' + str(pg.evaluate("document.getElementById('word-dialog').open")) + ' · focus ' + act())
        pg.keyboard.press('Tab'); steps.append(act()); pg.keyboard.press('Tab'); steps.append(act()); pg.keyboard.press('Tab'); steps.append('third Tab (should stay inside the dialog) → ' + act() + ' inside=' + str(pg.evaluate("document.getElementById('word-dialog').contains(document.activeElement)")))
        pg.keyboard.press('Escape'); time.sleep(0.1); steps.append('Escape → dialog open ' + str(pg.evaluate("document.getElementById('word-dialog').open")) + ' · focus ' + act())
        R['H_keyboard_path'] = steps; c.close()
    except Exception as e: R['H_error'] = str(e)
    save()

    # ---------------- J. damaged data on its way to the browser
    log('J damaged data')
    try:
        def J(x): return (json.dumps(x, ensure_ascii=False, indent=1) + '\n').encode('utf-8')
        def mut(fn):
            g = copy.deepcopy(G); fn(g); return J(g)
        def word_changed(g): g['occurrences'][4]['text'] = g['occurrences'][4]['text'].replace('ਮਿਠਤੁ', 'ਮਿਠਤ')
        def line_removed(g): o = g['occurrences'].pop(3); [n['occurrenceIds'].remove(o['id']) for n in g['nodes'] if n['type'] == 'passage' and o['id'] in n['occurrenceIds']]; g['coverage']['originalOccurrences'] -= 1
        def lines_reordered(g): a, b2 = g['occurrences'][2], g['occurrences'][3]; a['text'], b2['text'] = b2['text'], a['text']
        def last_line_removed(g): o = g['occurrences'].pop(8); [n['occurrenceIds'].remove(o['id']) for n in g['nodes'] if n['type'] == 'passage' and o['id'] in n['occurrenceIds']]; g['coverage']['originalOccurrences'] -= 1
        def item_removed(g): g['nodes'] = [n for n in g['nodes'] if n['id'] != 'concept.seva']
        def connection_repointed(g): [e.update(to='author.bhagat-kabir') for e in g['edges'] if e['id'] == 'edge.4']; [n.update(authorId='author.bhagat-kabir') for n in g['nodes'] if n['id'] == 'sggs.asa.466.m2.salok02']
        def lesson_changed(g): [n['simple'].update(en=n['simple']['en'].replace('not self-hatred', 'self-hatred')) for n in g['nodes'] if n['id'] == 'lesson.humility.r1']
        def draft_label_removed(g): [n.update(review='APPROVED') for n in g['nodes'] if n['type'] == 'lesson']
        def ang_changed(g): [o.update(ang=471) for o in g['occurrences'] if o['ang'] == 470]; [n.update(angStart=471, angEnd=471) for n in g['nodes'] if n['id'] == 'sggs.asa.470.m1.salok01']
        cases = [('one letter of Gurbani changed', mut(word_changed)), ('a line removed', mut(line_removed)), ('two lines swapped', mut(lines_reordered)), ('the last line of a Salok removed', mut(last_line_removed)), ('an item removed', mut(item_removed)),
                 ('a Salok re-attributed to another author', mut(connection_repointed)), ('lesson wording reversed', mut(lesson_changed)), ('draft label changed to approved', mut(draft_label_removed)), ('Ang changed', mut(ang_changed)),
                 ('same content, re-saved with different spacing', J(G)), ('same content with Windows line endings', raw.replace(b'\n', b'\r\n')), ('a byte-order mark added', b'\xef\xbb\xbf' + raw), ('one space added at the end', raw + b' '),
                 ('cut short', raw[:len(raw) // 2]), ('empty', b''), ('not valid', b'{"schema":'), ('a web page instead of data', b'<!doctype html><title>Not found</title>')]
        dmg = []
        for name, body in cases:
            c, pg = ctx(); pg.route('**/knowledge/pilot.json', (lambda bb: (lambda route: route.fulfill(status=200, content_type='application/json', body=bb)))(body)); ready(pg); s = pg.evaluate(STATE)
            dmg.append(dict(case=name, status=s['status'], gurbaniLinesShown=len(s['lines']), anythingInContent=s['contentChildren'], searchEnabled=s['searchEnabled'], browseButtons=s['browse'], refused=('could not be verified' in s['status'] and not s['lines'] and s['contentChildren'] == 0 and not s['searchEnabled'])))
            if name == 'one letter of Gurbani changed': pg.screenshot(path=SH + 'k_refused_phone.png', full_page=True)
            c.close()
        for name, status in (('file missing (404)', 404), ('server error (500)', 500)):
            c, pg = ctx(); pg.route('**/knowledge/pilot.json', (lambda st: (lambda route: route.fulfill(status=st, body='x')))(status)); ready(pg); s = pg.evaluate(STATE)
            dmg.append(dict(case=name, status=s['status'], gurbaniLinesShown=len(s['lines']), anythingInContent=s['contentChildren'], searchEnabled=s['searchEnabled'], refused=('could not be verified' in s['status'] and not s['lines'] and s['contentChildren'] == 0 and not s['searchEnabled']))); c.close()
        c, pg = ctx(); pg.route('**/knowledge/pilot.json', lambda route: route.abort()); ready(pg); s = pg.evaluate(STATE); dmg.append(dict(case='no connection for the data file', status=s['status'], gurbaniLinesShown=len(s['lines']), anythingInContent=s['contentChildren'], searchEnabled=s['searchEnabled'], refused=('could not be verified' in s['status'] and not s['lines'] and s['contentChildren'] == 0))); c.close()
        c, pg = ctx(); pg.add_init_script("Object.defineProperty(crypto, 'subtle', {value: undefined});"); ready(pg); s = pg.evaluate(STATE); dmg.append(dict(case='browser cannot compute the fingerprint', status=s['status'], gurbaniLinesShown=len(s['lines']), anythingInContent=s['contentChildren'], searchEnabled=s['searchEnabled'], refused=('could not be verified' in s['status'] and not s['lines'] and s['contentChildren'] == 0))); c.close()
        R['J_damaged_data'] = dmg; R['J_refused'] = '%d of %d' % (sum(d['refused'] for d in dmg), len(dmg))
        # nothing before the check has passed
        c, pg = ctx(); pg.route('**/knowledge/pilot.json', lambda route: (time.sleep(1.2), route.continue_())); pg.goto(U, wait_until='commit'); time.sleep(0.6); mid = pg.evaluate(STATE); time.sleep(1.4); end = pg.evaluate(STATE)
        R['J_while_checking'] = dict(statusWhileWaiting=mid['status'], linesWhileWaiting=len(mid['lines']), contentWhileWaiting=mid['contentChildren'], searchEnabledWhileWaiting=mid['searchEnabled'], statusAfter=end['status']); c.close()
        # can the text be changed after it has passed? (the page's own data object)
        c, pg = ctx(); ready(pg); R['J_data_reachable_from_page_after_check'] = pg.evaluate("(async () => { const m = await import('./app.mjs'); return {exports: Object.keys(m)}; })()"); c.close()
    except Exception as e: R['J_error'] = str(e)
    save()

    # ---------------- K. the readers' offline worker and the pilot
    log('K offline worker')
    try:
        c, pg = ctx(sw='allow'); pg.goto(B + 'index.html', wait_until='networkidle'); pg.evaluate("navigator.serviceWorker.ready.then(() => true)"); time.sleep(1.5)
        keys0 = pg.evaluate("(async () => { const o = {}; for (const k of await caches.keys()) o[k] = (await (await caches.open(k)).keys()).length; return o; })()")
        served = []; pg.on('response', lambda r: served.append((urllib.parse.urlparse(r.url).path.split('/')[-1], r.from_service_worker, r.status)) if '/knowledge/' in r.url else None)
        ready(pg); s1 = pg.evaluate(STATE)
        keys1 = pg.evaluate("(async () => { const o = {}; let k2 = 0; for (const k of await caches.keys()) { const ks = await (await caches.open(k)).keys(); o[k] = ks.length; k2 += ks.filter(r => r.url.includes('/knowledge/')).length; } return {caches: o, pilotFilesInside: k2}; })()")
        c.set_offline(True); off = {}
        try: pg.goto(U, wait_until='load', timeout=6000); time.sleep(0.8); off = dict(title=pg.title(), status=pg.evaluate("document.getElementById('status')?.textContent ?? null"), lines=pg.evaluate("document.querySelectorAll('.pankti').length"), bodyStart=pg.evaluate("document.body.innerText.slice(0, 160)"))
        except Exception as e: off = dict(navigationFailed=str(e).split('\n')[0][:120])
        try: pg.goto(B + 'index.html', wait_until='load', timeout=6000); home_off = pg.title()
        except Exception as e: home_off = 'failed: ' + str(e)[:80]
        R['K_offline_worker'] = dict(workerControlsPilotPage=pg.evaluate("!!navigator.serviceWorker.controller"), readersCacheBefore=keys0, afterVisitingPilot=keys1, pilotOnlineWithWorker=dict(status=s1['status'], heading=s1['heading']), pilotFilesServed=served, pilotOffline=off, homeOfflineStillOpens=home_off)
        c.close()
    except Exception as e: R['K_error'] = str(e)
    save()

    # ---------------- L. print; M. workshop words on screen
    log('L/M print and wording')
    try:
        c, pg = ctx({'width': 794, 'height': 1123}); ready(pg); open_passage(pg, PASSAGES[0]); pg.emulate_media(media='print')
        vis = pg.evaluate('''() => { const out = []; const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) { const t = n.textContent.trim(); if (!t) continue; const e = n.parentElement; const b = e.getBoundingClientRect(); if (b.width > 0 && b.height > 0 && getComputedStyle(e).visibility !== 'hidden') out.push(t); } return out; }''')
        R['L_print_passage'] = dict(text=vis, gurbaniLines=sum(1 for t in vis if '॥' in t), linkAddressesPrinted=any('http' in t for t in vis), draftLabelPrinted=any('DRAFT' in t.upper() for t in vis), sourceNamed=any('Ang 470' in t for t in vis))
        pg.pdf(path=SH + 'k_print_passage.pdf', format='A4'); c.close()
        c, pg = ctx(); ready(pg); seen = [pg.evaluate("document.body.innerText")]
        for n in PASSAGES: open_passage(pg, n); seen.append(pg.evaluate("document.body.innerText"))
        for q in ('haumai', 'kabir', 'asa', 'psychology', 'buddhism', 'Nivi'):
            find(pg, q); seen.append(pg.evaluate("document.body.innerText")); pg.evaluate("document.querySelector('#results button')?.click()"); time.sleep(0.12); seen.append(pg.evaluate("document.body.innerText"))
        text = '\n'.join(seen); found = {}
        for wd in ('node', 'edge', 'fixture', 'occurrence', 'digest', 'schema', 'pack', 'indexed', 'index', 'substring', 'normalization', 'attested', 'written_by', 'in_raag', 'CONCEPT', 'PASSAGE', 'WORD', 'STUDY', 'COMPOSITION', 'AUTHOR', 'RAAG', 'COURSE', 'LESSON', 'deep-link', 'revision', 'curated alias', 'authored', 'retrieval', 'pathway'):
            m = re.findall(r'[^\n]*\b' + re.escape(wd) + r'\b[^\n]*', text, flags=0 if wd.isupper() else re.I)
            if m: found[wd] = sorted(set(x.strip()[:110] for x in m))[:3]
        R['M_workshop_words_on_screen'] = found; c.close()
    except Exception as e: R['L_error'] = str(e)
    save(); b.close()
log('done'); print(json.dumps({k: (v if isinstance(v, str) else '…') for k, v in R.items() if k.endswith('error') or k == 'J_refused'}, ensure_ascii=False))
