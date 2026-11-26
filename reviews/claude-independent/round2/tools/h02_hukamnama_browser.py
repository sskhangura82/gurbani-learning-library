"""Round 2 · PR #43 Daily Hukamnama reader at fb49ef4: dates, India-time rollover, damaged data, on-screen text, access, layout, scope.
Independent tests written from criteria frozen in round2/00_BASELINE_AND_FROZEN_CRITERIA_ROUND2.md before the builder's tests were opened.
Headless Chromium. Emulation only: not Safari, not a device.
Usage: python3 h02_hukamnama_browser.py <base-url> <site-root> <out.json>"""
import json, sys, time, hashlib, re, urllib.parse
from playwright.sync_api import sync_playwright
B, SITE, OUT = sys.argv[1:4]; U = B + 'hukamnama/index.html'; SH = '/home/claude/work/shots/r2/'
AXE = open('/home/claude/refs/axe/package/axe.min.js', encoding='utf-8').read()
raw = open(SITE + 'hukamnama/fixture.json', 'rb').read(); fx = json.loads(raw); OCC = fx['canonical']['occurrences']
STATE = '''() => { const q = id => document.getElementById(id); const lines = [...document.querySelectorAll('#scripture .pankti')];
  const seen = e => { if (!e || e.hidden || e.closest('[hidden]')) return false; const b = e.getBoundingClientRect(); return b.width > 20 && b.height > 8; };
  return {clock: q('clock').textContent, dateBox: q('date').value, status: q('status').textContent, readingShown: seen(q('reading')), lines: lines.length,
          firstLine: lines[0] ? lines[0].firstChild.textContent : null, lastLine: lines.length ? lines[lines.length - 1].firstChild.textContent : null,
          meta: seen(q('meta')) ? q('meta').textContent : null, calendar: seen(q('calendar')) ? q('calendar').textContent : null, heading: seen(q('reading-title')) ? q('reading-title').textContent : null,
          sourceLinks: [...document.querySelectorAll('#sources a')].map(a => a.textContent + ' -> ' + a.href), buttonsEnabled: [...document.querySelectorAll('button')].filter(b => !b.disabled).length,
          wordTodayNearReading: /today/i.test((q('reading').hidden ? '' : q('reading').innerText))}; }'''
R = {'candidate': 'PR #43 at fb49ef41bd890db879d7f93a861585915ef81622', 'base': B}
hosts = set()
with sync_playwright() as p:
    b = p.chromium.launch()
    def ctx(tz='America/Los_Angeles', now=None, **kw):
        c = b.new_context(viewport=kw.pop('viewport', {'width': 390, 'height': 664}), timezone_id=tz, service_workers='block', **kw); pg = c.new_page()
        pg.on('request', lambda r: hosts.add(urllib.parse.urlparse(r.url).netloc))
        if now: pg.clock.set_fixed_time(now)
        return c, pg
    def ready(pg):
        pg.goto(U, wait_until='networkidle'); pg.wait_for_function("document.getElementById('status').textContent.indexOf('Checking') < 0", timeout=8000); time.sleep(0.2)

    # ---- HD-01 / HD-02: Amritsar date at the two instants either side of Amritsar midnight, five device time zones
    hd = []
    for tz in ('America/Los_Angeles', 'UTC', 'Asia/Kolkata', 'Pacific/Kiritimati', 'Pacific/Pago_Pago'):
        for label, now, want in (('one second before Amritsar midnight', '2026-11-25T18:29:59Z', '2026-11-25'), ('Amritsar midnight', '2026-11-25T18:30:00Z', '2026-11-26'), ('next Amritsar morning 05:00', '2026-11-25T23:30:00Z', '2026-11-26')):
            c, pg = ctx(tz, now); ready(pg); on_open = pg.evaluate(STATE)
            pg.click('#today'); time.sleep(0.15); today = pg.evaluate(STATE)
            hd.append(dict(deviceZone=tz, instant=now, what=label, deviceLocalDate=pg.evaluate("new Date().toLocaleDateString('en-CA')"), amritsarDateShown=on_open['clock'], amritsarDateCorrect=(on_open['clock'] == 'Amritsar date: ' + want),
                           onOpen=dict(dateBox=on_open['dateBox'], lines=on_open['lines'], heading=on_open['heading'], meta=on_open['meta'], status=on_open['status']),
                           afterToday=dict(dateBox=today['dateBox'], lines=today['lines'], status=today['status'], meta=today['meta'])))
            if tz == 'America/Los_Angeles' and want == '2026-11-26' and label == 'Amritsar midnight':
                pg.screenshot(path=SH + 'h_today_pending_after_midnight.png', full_page=True)
                pg.reload(wait_until='networkidle'); time.sleep(0.4); pg.screenshot(path=SH + 'h_on_open_next_day_shows_25_nov.png', full_page=True)
            c.close()
    R['HD-01_02_rollover'] = hd
    # ---- HD-03: dates through the page, and through the date functions directly
    c, pg = ctx('America/Los_Angeles', '2026-11-25T12:00:00Z'); ready(pg); ui = {}
    for name, val in (('a day with no reading', '2026-11-24'), ('tomorrow', '2026-11-26'), ('far future', '2099-01-01'), ('held 2017', '2017-11-25'), ('the other real date', '2025-10-14'), ('leap day', '2024-02-29'), ('very old', '0001-01-01')):
        pg.evaluate("([v]) => { document.getElementById('date').value = v; }", [val]); pg.click('#open'); time.sleep(0.12); s = pg.evaluate(STATE)
        ui[name] = dict(asked=val, dateBox=s['dateBox'], status=s['status'], lines=s['lines'], meta=s['meta'], sourceLinks=s['sourceLinks'])
    for name, val in (('30 February', '2026-02-30'), ('month 13', '2026-13-01'), ('29 Feb, not a leap year', '2026-02-29'), ('letters', 'abc'), ('empty', ''), ('day first', '25/11/2026'), ('markup', '<img src=x onerror=1>'), ('one-digit month', '2026-1-5'), ('with a time', '2026-11-25T00:00')):
        pg.evaluate("([v]) => { document.getElementById('date').value = v; }", [val]); pg.click('#open'); time.sleep(0.12); s = pg.evaluate(STATE)
        ui[name] = dict(asked=val, dateBoxAfterBrowserFilter=s['dateBox'], status=s['status'], lines=s['lines'])
    R['HD-03_dates_through_the_page'] = ui
    R['HD-03_date_functions_directly'] = pg.evaluate('''async () => { const m = await import('./core.mjs'); const f = await (await fetch('./fixture.json')).arrayBuffer(); const pack = await m.decodeFixture(f); const now = new Date('2026-11-25T12:00:00Z');
        const vals = ['2026-02-30', '2026-13-01', '2026-02-29', '2024-02-29', 'abc', '', '0001-01-01', '0000-01-01', '9999-12-31', '2026-1-5', '25/11/2026', '<img>', ' 2026-11-25', '2026-11-25 ', '2026-11-25T00:00', '２０２６-11-25', '2026-11-25\\n', null, undefined, 20261125, {}, ['2026-11-25']];
        return vals.map(v => { let r; try { r = m.resolveDate(pack, v, now).status; } catch (e) { r = 'THREW: ' + e.message; } return [typeof v === 'string' ? JSON.stringify(v) : String(v), m.validDate(v), r]; }); }''')
    R['HD-05_published_reading_refuses_drafts'] = pg.evaluate('''async () => { const m = await import('./core.mjs'); const pack = await m.decodeFixture(await (await fetch('./fixture.json')).arrayBuffer());
        return ['2026-11-25', '2025-10-14', '2017-11-25', '2026-11-24'].map(d => [d, m.publishedReading(pack, d, new Date('2026-11-25T12:00:00Z')).status]); }''')
    c.close()
    # ---- HD-05: device clock wrong
    wc = {}
    for name, now in (('clock says 25 Nov 2017', '2017-11-25T05:00:00Z'), ('clock says 14 Oct 2025', '2025-10-14T05:00:00Z'), ('clock says 2031', '2031-03-01T05:00:00Z'), ('clock says 1999', '1999-01-01T05:00:00Z')):
        c, pg = ctx('UTC', now); ready(pg); s0 = pg.evaluate(STATE); pg.click('#today'); time.sleep(0.12); s1 = pg.evaluate(STATE)
        wc[name] = dict(amritsarDateShown=s0['clock'], onOpen=dict(dateBox=s0['dateBox'], lines=s0['lines'], meta=s0['meta'], status=s0['status']), afterToday=dict(dateBox=s1['dateBox'], lines=s1['lines'], status=s1['status'], meta=s1['meta'])); c.close()
    R['HD-05_wrong_device_clock'] = wc
    # ---- HS-08: text on screen equals the data, in order, for both dates
    c, pg = ctx('UTC', '2026-11-25T12:00:00Z'); ready(pg); hs = {}
    for dte in ('2026-11-25', '2025-10-14'):
        pg.click(f'button[data-date="{dte}"]'); time.sleep(0.15)
        dom = pg.evaluate("[...document.querySelectorAll('#scripture .pankti')].map(d => ({text: d.firstChild.textContent, id: d.dataset.occurrence, kind: d.dataset.kind, label: d.querySelector('small').textContent, labelLang: d.querySelector('small').lang || '(inherits ' + d.closest('[lang]').lang + ')'}))")
        hs[dte] = dict(rows=len(dom), identicalInOrder=[x['text'] for x in dom] == [o['text'] for o in OCC], idsInOrder=[x['id'] for x in dom] == [o['id'] for o in OCC], rahaoMarkedRows=[x['id'][-3:] for x in dom if x['label'].startswith('Rahao')],
                       angLabels=sorted(set(x['label'] for x in dom)), englishLabelLanguage=dom[0]['labelLang'], meta=pg.evaluate("document.getElementById('meta').textContent"), identity=pg.evaluate("document.getElementById('identity').textContent"))
    R['HS-08_on_screen_text'] = hs
    pg.click('button[data-date="2026-11-25"]'); time.sleep(0.2); pg.screenshot(path=SH + 'h_reading_390.png', full_page=True)
    rahao = pg.locator('.pankti[data-kind="rahao"]').first; rahao.scroll_into_view_if_needed(); pg.screenshot(path=SH + 'h_rahao_390.png')
    c.close()
    # ---- HI-01 / HI-02: data altered on its way to the browser
    def variant(name):
        d = json.loads(raw); o = d['canonical']['occurrences']; ev = d['events']
        if name == 'one word changed': o[2]['text'] = o[2]['text'].replace('ਬੈਰਾਗੀ', 'ਬੈਰਾਗ')
        elif name == 'a line removed': o.pop(7)
        elif name == 'two lines swapped': o[7], o[8] = o[8], o[7]
        elif name == 'both Rahao lines removed': del o[3:5]
        elif name == 'last stanza removed': del o[17:19]
        elif name == 'an Ang changed': o[5]['ang'] = 504
        elif name == 'a date changed': ev[1]['date'] = '2026-11-24'; ev[1]['id'] = 'harmandir-morning.2026-11-24'
        elif name == 'held entry marked as matched': ev[2]['status'] = 'DIGITAL_MATCH_DRAFT'
        elif name == 'an event pointed at another Shabad': ev[0]['shabadId'] = 'sggs.other'
        elif name == 'a date duplicated': ev.append(json.loads(json.dumps(ev[0])))
        elif name == 'a line duplicated': o.insert(6, json.loads(json.dumps(o[6])))
        elif name == 'a new date added for this Shabad': ev.append(dict(ev[0], date='2026-11-24', id='harmandir-morning.2026-11-24'))
        elif name == 'marked as approved for publication': d['policy']['publicationApproved'] = True
        elif name == 'a lesson marked approved': d['policy']['lessonApproved'] = True
        elif name == 'source link changed to another site': ev[1]['sourceUrl'] = 'https://example.org/x'
        elif name == 'markup put in a line': o[2]['text'] = '<img src=x onerror="window.__x=1">' + o[2]['text']
        return json.dumps(d, ensure_ascii=False, indent=2).encode('utf-8')
    bodies = {n: variant(n) for n in ('one word changed', 'a line removed', 'two lines swapped', 'both Rahao lines removed', 'last stanza removed', 'an Ang changed', 'a date changed', 'held entry marked as matched', 'an event pointed at another Shabad',
                                      'a date duplicated', 'a line duplicated', 'a new date added for this Shabad', 'marked as approved for publication', 'a lesson marked approved', 'source link changed to another site', 'markup put in a line')}
    bodies.update({'file cut in half': raw[:len(raw) // 2], 'file empty': b'', 'not valid data': b'{"schema": ', 'one space added at the end': raw + b' ', 'Windows line endings': raw.replace(b'\n', b'\r\n'), 'byte-order mark added': b'\xef\xbb\xbf' + raw,
                   'same data, re-saved by a tool (spacing changed)': json.dumps(fx, ensure_ascii=False).encode('utf-8')})
    hi = {}
    for name, body in bodies.items():
        c, pg = ctx('UTC', '2026-11-25T12:00:00Z'); pg.route('**/hukamnama/fixture.json*', (lambda _b: (lambda rt, *a: rt.fulfill(status=200, content_type='application/json', body=_b)))(body)); ready(pg); s = pg.evaluate(STATE)
        hi[name] = dict(lines=s['lines'], readingShown=s['readingShown'], status=s['status'], buttonsEnabled=s['buttonsEnabled'], scriptRan=pg.evaluate('window.__x || null')); c.close()
    c, pg = ctx('UTC', '2026-11-25T12:00:00Z'); pg.route('**/hukamnama/fixture.json*', lambda rt, *a: rt.fulfill(status=404, body='not found')); ready(pg); s = pg.evaluate(STATE); hi['file missing'] = dict(lines=s['lines'], readingShown=s['readingShown'], status=s['status'], buttonsEnabled=s['buttonsEnabled'])
    pg.screenshot(path=SH + 'h_refused_390.png', full_page=True); c.close()
    # altered word AND the expected value in the program changed to match: shows where the trust boundary is
    alt = variant('one word changed'); code = open(SITE + 'hukamnama/core.mjs', encoding='utf-8').read(); code2 = re.sub(r'FIXTURE_SHA256="[0-9a-f]{64}"', 'FIXTURE_SHA256="' + hashlib.sha256(alt).hexdigest() + '"', code)
    c, pg = ctx('UTC', '2026-11-25T12:00:00Z'); pg.route('**/hukamnama/fixture.json*', lambda rt, *a: rt.fulfill(status=200, content_type='application/json', body=alt)); pg.route('**/hukamnama/core.mjs*', lambda rt, *a: rt.fulfill(status=200, content_type='text/javascript', body=code2)); ready(pg); s = pg.evaluate(STATE)
    hi['one word changed AND the program file changed to expect it'] = dict(lines=s['lines'], readingShown=s['readingShown'], status=s['status'], alteredWordOnScreen=pg.evaluate("document.getElementById('scripture').textContent.includes('ਬੈਰਾਗ ਸੋਗ')")); c.close()
    R['HI-01_02_altered_data'] = hi
    # ---- HI-03: check pending / not possible
    c, pg = ctx('UTC', '2026-11-25T12:00:00Z'); pg.add_init_script("(() => { const real = crypto.subtle.digest.bind(crypto.subtle); let go; window.__gate = new Promise(r => go = r); window.__release = go; crypto.subtle.digest = (...a) => window.__gate.then(() => real(...a)); })()")
    pg.goto(U, wait_until='load'); time.sleep(1.2); pend = pg.evaluate(STATE); pg.evaluate('window.__release()'); time.sleep(0.8); rel = pg.evaluate(STATE); c.close()
    c, pg = ctx('UTC', '2026-11-25T12:00:00Z'); pg.add_init_script("Object.defineProperty(Crypto.prototype, 'subtle', {configurable: true, get() { return undefined; }});"); pg.goto(U, wait_until='load'); time.sleep(1.0); noc = pg.evaluate(STATE); c.close()
    R['HI-03_check_pending_or_impossible'] = dict(whilePending=dict(lines=pend['lines'], status=pend['status'], buttonsEnabled=pend['buttonsEnabled']), afterRelease=dict(lines=rel['lines'], status=rel['status']), noWebCrypto=dict(lines=noc['lines'], status=noc['status'], buttonsEnabled=noc['buttonsEnabled']))
    # ---- HL: saved learning; HR: requests and storage
    c, pg = ctx('UTC', '2026-11-25T12:00:00Z'); ready(pg)
    pg.evaluate("localStorage.setItem('glp001.continuous.v2', JSON.stringify({version: 2, notes: {'mool.line01': 'R2-SYNTHETIC'}})); localStorage.setItem('glp001.sukhmani.v1', '{\"version\":2}')"); before = pg.evaluate('JSON.stringify(Object.entries(localStorage).sort())')
    pg.reload(wait_until='networkidle'); time.sleep(0.3)
    for sel in ('button[data-date="2025-10-14"]', 'button[data-date="2017-11-25"]', '#today', 'button[data-date="2026-11-25"]'): pg.click(sel); time.sleep(0.1)
    pg.fill('#font-size', '44') if False else pg.evaluate("(() => { const r = document.getElementById('font-size'); r.value = 44; r.dispatchEvent(new Event('input', {bubbles: true})); })()")
    R['HL_saved_learning'] = dict(anythingToSaveOffered=pg.evaluate("!!document.querySelector('textarea, [contenteditable], [data-action*=note], [data-action*=bookmark]') || /bookmark|reflection|note/i.test(document.querySelector('main').innerText.replace(/No personal data[^.]*\\./, ''))"),
                                  otherReadersRecordsUnchanged=(pg.evaluate('JSON.stringify(Object.entries(localStorage).sort())') == before), storageKeysWrittenByThisPage=pg.evaluate("Object.keys(localStorage).filter(k => !['glp001.continuous.v2', 'glp001.sukhmani.v1'].includes(k))"),
                                  textSizeRemembered=None)
    pg.reload(wait_until='networkidle'); time.sleep(0.3); R['HL_saved_learning']['textSizeRemembered'] = pg.evaluate("document.getElementById('font-value').textContent") != '32 px'
    R['HR_page_facts'] = pg.evaluate('''() => ({title: document.title, robots: (document.querySelector('meta[name=robots]') || {}).content, audioOrVideoElements: document.querySelectorAll('audio,video,iframe,embed,object').length,
        externalLinks: [...document.querySelectorAll('a[href^="http"]')].map(a => a.textContent.trim().slice(0, 40) + ' -> ' + a.href), serviceWorkerRegistered: false, lessonText: document.querySelector('[aria-labelledby=study-title]').innerText.replace(/\\s+/g, ' ')})''')
    c.close()
    # ---- HA-01 / HA-02: accessibility scan in each state, light and dark
    ax = {}
    def scan(pg, key):
        pg.evaluate(AXE + '; void 0'); r = pg.evaluate("axe.run(document, {runOnly: {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']}}).then(r => r.violations.map(v => ({id: v.id, impact: v.impact, nodes: v.nodes.length, first: v.nodes[0].target.join(' '), help: v.help})))")
        ax[key] = r
    for scheme in ('light', 'dark'):
        c, pg = ctx('UTC', '2026-11-25T12:00:00Z', color_scheme=scheme); ready(pg); scan(pg, f'reading:{scheme}')
        for key, sel, val in (('pending', None, '2026-11-24'), ('held', 'button[data-date="2017-11-25"]', None), ('future', None, '2026-11-26'), ('empty', None, '')):
            if sel: pg.click(sel)
            else: pg.evaluate("([v]) => { document.getElementById('date').value = v; }", [val]); pg.click('#open')
            time.sleep(0.12); scan(pg, f'{key}:{scheme}')
        c.close()
        c, pg = ctx('UTC', '2026-11-25T12:00:00Z', color_scheme=scheme); pg.route('**/hukamnama/fixture.json*', lambda rt, *a: rt.fulfill(status=404, body='x')); ready(pg); scan(pg, f'refused:{scheme}'); c.close()
    R['HA-01_scan'] = ax
    c, pg = ctx('UTC', '2026-11-25T12:00:00Z'); ready(pg)
    R['HA-02_structure'] = pg.evaluate('''() => ({lang: document.documentElement.lang, headings: [...document.querySelectorAll('h1,h2,h3')].filter(h => !h.closest('[hidden]')).map(h => h.tagName + ':' + h.textContent.trim().slice(0, 30) + (h.lang ? ' [' + h.lang + ']' : '')),
        liveRegions: [...document.querySelectorAll('[aria-live],[role=status],[role=alert]')].map(e => e.id + ':' + (e.getAttribute('role') || '') + '/' + (e.getAttribute('aria-live') || '')),
        controls: [...document.querySelectorAll('button,input,a')].map(e => e.tagName.toLowerCase() + ':' + (e.id || e.dataset.date || e.getAttribute('href') || '').slice(0, 26) + ' = "' + (e.labels && e.labels[0] ? e.labels[0].textContent : e.textContent.trim()).slice(0, 34) + '"'),
        scriptureLang: document.getElementById('scripture').lang, targetSizesUnder44: [...document.querySelectorAll('button,input,a')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && (b.height < 44 || b.width < 44) && !e.closest('p,footer,.pankti'); }).map(e => (e.id || e.textContent.trim().slice(0, 20)) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height))})''')
    order = []
    for _ in range(14):
        pg.keyboard.press('Tab'); order.append(pg.evaluate("(() => { const e = document.activeElement; const cs = getComputedStyle(e); return (e.id || e.dataset.date || e.textContent.trim().slice(0, 22) || e.tagName) + (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2 ? '' : ' [no visible focus]'); })()"))
    R['HA-02_keyboard_order'] = order
    pg.focus('#date'); pg.keyboard.press('Enter'); time.sleep(0.1); R['HA-02_enter_in_date_box_opens_date'] = None
    pg.evaluate("document.getElementById('date').value = '2025-10-14'"); pg.focus('#date'); pg.keyboard.press('Enter'); time.sleep(0.15); R['HA-02_enter_in_date_box_opens_date'] = pg.evaluate("document.getElementById('meta').textContent.startsWith('2025-10-14')")
    c.close()
    # ---- HA-03: layout at eight widths, largest text, enlarged text, print
    lay = {}
    for w, h in ((320, 568), (390, 664), (507, 1024), (768, 1024), (820, 1180), (1024, 768), (1280, 800), (1440, 900)):
        c, pg = ctx('UTC', '2026-11-25T12:00:00Z', viewport={'width': w, 'height': h}); ready(pg)
        m = lambda: pg.evaluate("({sideways: document.scrollingElement.scrollWidth > innerWidth + 1, widest: Math.max(...[...document.querySelectorAll('main *')].map(e => Math.round(e.getBoundingClientRect().right))), w: innerWidth})")
        a = m(); pg.evaluate("(() => { const r = document.getElementById('font-size'); r.value = 52; r.dispatchEvent(new Event('input', {bubbles: true})); })()"); time.sleep(0.1); bq = m()
        pg.evaluate("document.documentElement.style.fontSize = '200%'"); time.sleep(0.1); cq = m()
        lay[str(w)] = dict(sidewaysScroll=a['sideways'], atLargestGurmukhi=bq['sideways'], withAllTextDoubled=cq['sideways'], gurmukhiPx=pg.evaluate("getComputedStyle(document.querySelector('.pankti')).fontSize"))
        if w in (320, 820, 1440): pg.evaluate("document.documentElement.style.fontSize = ''"); pg.screenshot(path=SH + f'h_reading_{w}.png', full_page=(w == 320))
        c.close()
    R['HA-03_layout'] = lay
    c, pg = ctx('UTC', '2026-11-25T12:00:00Z'); ready(pg); pg.emulate_media(media='print')
    R['HA-03_print'] = pg.evaluate('''() => { const seen = e => e && !e.closest('[hidden]') && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0; const q = s => document.querySelector(s);
        return {scriptureLines: [...document.querySelectorAll('.pankti')].filter(seen).length, dateAndSourceLine: seen(q('#meta')) ? q('#meta').textContent : null, statusLine: seen(q('#status')) ? q('#status').textContent : null, titleShown: seen(q('h1')), controlsHidden: !seen(q('.controls')), sourceLinksHidden: !seen(q('#sources')), aboutHidden: !seen(q('.notes'))}; }''')
    pdf = pg.pdf(format='A4'); open('/home/claude/work/r2/h_print.pdf', 'wb').write(pdf); R['HA-03_print']['pdfBytes'] = len(pdf); c.close()
    # reduced motion: any animation or transition at all?
    css = open(SITE + 'hukamnama/style.css', encoding='utf-8').read(); R['HA-03_motion'] = dict(animationsOrTransitionsInStyles=len(re.findall(r'animation|transition|scroll-behavior', css)))
    R['HR-01_every_address_contacted'] = sorted(hosts)
    b.close()
json.dump(R, open(OUT, 'w'), ensure_ascii=False, indent=1)
print('HD rollover: correct Amritsar date in', sum(x['amritsarDateCorrect'] for x in R['HD-01_02_rollover']), 'of', len(R['HD-01_02_rollover']))
for x in R['HD-01_02_rollover']:
    if x['deviceZone'] in ('America/Los_Angeles', 'Pacific/Kiritimati'): print('  ', x['deviceZone'], x['instant'], '| device date', x['deviceLocalDate'], '|', x['amritsarDateShown'], '| on open: box', x['onOpen']['dateBox'], 'lines', x['onOpen']['lines'], '| after Today: box', x['afterToday']['dateBox'], 'lines', x['afterToday']['lines'], '|', x['afterToday']['status'][:70])
for k, v in R['HD-03_dates_through_the_page'].items(): print('  UI', k.ljust(24), v.get('dateBox', v.get('dateBoxAfterBrowserFilter')), '| lines', v['lines'], '|', v['status'][:80], '|', v.get('sourceLinks', '')) 
print('  direct:', R['HD-03_date_functions_directly']); print('  published:', R['HD-05_published_reading_refuses_drafts'])
for k, v in R['HD-05_wrong_device_clock'].items(): print('  CLOCK', k, '|', v['amritsarDateShown'], '| open: lines', v['onOpen']['lines'], v['onOpen']['meta'], '| today:', v['afterToday']['lines'], v['afterToday']['status'][:60])
print('HS-08', json.dumps(R['HS-08_on_screen_text'], ensure_ascii=False)[:700])
bad = {k: v for k, v in R['HI-01_02_altered_data'].items() if v['lines'] or v['readingShown']}; print('HI altered:', len(R['HI-01_02_altered_data']), 'variants; reading shown in', len(bad), list(bad.keys())); print('   message:', R['HI-01_02_altered_data']['one word changed']['status'], '| buttons enabled', R['HI-01_02_altered_data']['one word changed']['buttonsEnabled'])
print('HI-03', R['HI-03_check_pending_or_impossible']); print('HL', R['HL_saved_learning']); print('HR facts', json.dumps(R['HR_page_facts'], ensure_ascii=False)[:900]); print('HR hosts', R['HR-01_every_address_contacted'])
print('AXE', {k: [(v['id'], v['nodes']) for v in vs] for k, vs in R['HA-01_scan'].items()}); print('HA-02', json.dumps(R['HA-02_structure'], ensure_ascii=False)[:1300]); print('  tab order', R['HA-02_keyboard_order'], '| Enter opens:', R['HA-02_enter_in_date_box_opens_date'])
print('LAYOUT', R['HA-03_layout']); print('PRINT', R['HA-03_print'], R['HA-03_motion'])
