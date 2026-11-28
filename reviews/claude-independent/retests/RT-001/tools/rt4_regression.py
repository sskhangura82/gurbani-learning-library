"""RT-001 regression run on the builder's repair candidate (PR #40 head): does everything that worked before still work?
Switchable local server on port 8090: v1 = published baseline a3476ac · v5 = PR #40 head · v6 = v5 with only its release name changed
(stands in for "a later release") · v7 = v5 with a new release name and one damaged file (stands in for "a broken release").
Headless Chromium, phone emulation, synthetic notes only.
Usage: python3 rt4_regression.py <out.json>"""
import json, sys, time, re, urllib.request, urllib.parse
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]; B = 'http://127.0.0.1:8090/gurbani-learning-library/'
C = json.load(open('/home/claude/work/app_corpus.json', encoding='utf-8'))
def switch(v): return urllib.request.urlopen('http://127.0.0.1:8090/__switch?root=' + v).read().decode()
norm = lambda t: ' '.join(t.split())
SW = '''async () => { const r = await navigator.serviceWorker.getRegistration(); if (!r) return null; const sizes = {}; for (const k of await caches.keys()) sizes[k.split(':').pop()] = (await (await caches.open(k)).keys()).length;
  return {active: r.active ? r.active.state : null, waiting: !!r.waiting, installing: !!r.installing, offlineCopies: sizes, inControl: !!navigator.serviceWorker.controller}; }'''
NIT = '''() => [...document.querySelectorAll('#source-unit article.scripture-line, #source-unit p.meter-heading, #source-unit p.original-preface')].map(e => (e.querySelector && e.querySelector('p.tuk') ? e.querySelector('p.tuk').textContent : e.textContent))'''
R = {}; hosts = set(); errs = []
with sync_playwright() as p:
    b = p.chromium.launch(); d = dict(p.devices['iPhone 14']); c = b.new_context(**d, accept_downloads=True)
    def page():
        pg = c.new_page(); pg.on('request', lambda r: hosts.add(urllib.parse.urlparse(r.url).netloc or urllib.parse.urlparse(r.url).scheme)); pg.on('pageerror', lambda e: errs.append(str(e)[:160])); return pg
    def fresh_tab():
        pg = page(); cdp = c.new_cdp_session(pg); cdp.send('Network.enable'); cdp.send('Network.setCacheDisabled', {'cacheDisabled': True}); return pg
    pg = page()
    # ---- 1. a reader on the published version, with synthetic learning in all three readers
    switch('v1'); pg.goto(B + 'nitnem/index.html', wait_until='networkidle')
    for _ in range(80):
        st = pg.evaluate(SW)
        if st and st['active'] == 'activated' and sum(st['offlineCopies'].values()) >= 56: break
        time.sleep(0.5)
    pg.reload(wait_until='networkidle'); pg.click('button[data-open="sohila"]'); time.sleep(0.8)
    pg.click('#reading-tools'); time.sleep(0.3); pg.click('#bookmark'); time.sleep(0.3); pg.fill('#note', 'RT4-NITNEM-NOTE'); pg.click('#save-note'); time.sleep(0.5); pg.keyboard.press('Escape')
    pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.0)
    pg.click('#tools-open'); time.sleep(0.3); pg.locator('#reader-dialog [data-action="note"]').first.click(); time.sleep(0.5); pg.fill('#reader-dialog textarea', 'RT4-JAPJI-NOTE'); time.sleep(1.3); pg.keyboard.press('Escape'); time.sleep(0.4)
    pg.goto(B + 'sukhmani.html', wait_until='networkidle'); time.sleep(1.8)
    pg.click('#sukhmani-text [data-line-id] >> nth=3'); time.sleep(0.5)
    bm = pg.get_by_role('button', name='Bookmark this line')
    if bm.count(): bm.first.click(); time.sleep(0.4)
    ta = pg.query_selector('dialog[open] textarea')
    if ta and not ta.is_disabled(): ta.fill('RT4-SUKHMANI-NOTE'); time.sleep(1.2)
    pg.keyboard.press('Escape'); time.sleep(1.0)
    before = json.loads(pg.evaluate('JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)])))'))
    R['1_on_published_version'] = dict(offline=pg.evaluate(SW), savedKeys=sorted(before.keys()), notesPresent={k: any(m in before[k] for m in ('RT4-NITNEM-NOTE', 'RT4-JAPJI-NOTE', 'RT4-SUKHMANI-NOTE')) for k in before})
    # ---- 2. the repair candidate is published: it must wait until the reader asks for it
    switch('v5'); pg.goto(B + 'nitnem/index.html', wait_until='networkidle'); time.sleep(0.8); pg.click('button[data-open="sohila"]'); time.sleep(0.8)
    pg.click('#reading-tools'); time.sleep(0.3); pg.click('#check-update'); time.sleep(6)
    pg.click('button[data-mode="meaning"]') if False else None
    R['2_update_is_waiting'] = dict(offline=pg.evaluate(SW), readerIsTold=pg.inner_text('#offline-status'), loadButtonShown=pg.evaluate('!document.querySelector("#apply-update").hidden'),
                                    readerStillRunsPublishedCode=pg.evaluate("!!document.querySelector('#bani-variant') && !/awaiting comparison/.test(document.querySelector('#bani-variant').textContent || '')"))
    pg.click('#apply-update'); time.sleep(3.5); pg.wait_for_load_state('networkidle'); time.sleep(0.8)
    after = json.loads(pg.evaluate('JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)])))'))
    R['3_after_loading_the_update'] = dict(offline=pg.evaluate(SW), everySavedRecordUnchangedByTheUpdate={k: (after.get(k) == before[k]) for k in before})
    # ---- 3. every composition: text on screen equals the text register of the first review, in order
    seq = {}
    for bani in ('jaap', 'savaiye', 'chaupai', 'anand', 'rehras', 'sohila'):
        pg.goto(B + f'nitnem/index.html?bani={bani}', wait_until='networkidle'); time.sleep(1.3)
        if pg.evaluate('document.querySelector("#reader").hidden'): pg.click(f'button[data-open="{bani}"]'); time.sleep(1.2)
        dom = pg.evaluate(NIT); want = [o['text'] for o in C if o['comp'] == bani]
        seq[bani] = dict(rowsOnScreen=len(dom), rowsInRegister=len(want), identicalInOrder=(dom == want), sourceNotice=pg.evaluate("(document.querySelector('#bani-variant') || {}).textContent || ''")[-110:])
    pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.5)
    dom = pg.evaluate("[...document.querySelectorAll('#continuous-reader article.scripture-line p.tuk')].map(e => e.textContent)"); want = [o['text'] for o in C if o['comp'] == 'japji']
    seq['japji'] = dict(rowsOnScreen=len(dom), rowsInRegister=len(want), identicalInOrder=([norm(x) for x in dom] == [norm(x) for x in want]), check=pg.evaluate("document.querySelector('#continuous-reader').dataset.sourceIntegrity"))
    pg.click('#tools-open'); time.sleep(0.3); pg.locator('#reader-dialog [data-action="note"]').first.click(); time.sleep(0.5); seq['japji']['noteStillThere'] = pg.input_value('#reader-dialog textarea'); pg.keyboard.press('Escape'); time.sleep(0.3)
    pg.goto(B + 'sukhmani.html', wait_until='networkidle'); time.sleep(2.5)
    dom = pg.evaluate("[...document.querySelectorAll('#sukhmani-text [data-line-id] .tuk')].map(e => e.textContent)"); want = [o['text'] for o in C if o['comp'] == 'sukhmani']
    seq['sukhmani'] = dict(rowsOnScreen=len(dom), rowsInRegister=len(want), identicalInOrder=([norm(x) for x in dom] == [norm(x) for x in want]), check=pg.evaluate("document.querySelector('#sukhmani-text').dataset.sourceIntegrity"),
                           savedMarkers=pg.evaluate("document.querySelectorAll('#sukhmani-text .line-saved:not([hidden])').length"))
    R['4_text_on_screen_vs_register'] = seq
    # ---- 4. with the network off: all nine compositions
    c.set_offline(True); off = {}
    for bani in ('jaap', 'savaiye', 'chaupai', 'anand', 'rehras', 'sohila'):
        pg.goto(B + f'nitnem/index.html?bani={bani}', wait_until='load'); time.sleep(1.5)
        if pg.evaluate('document.querySelector("#reader").hidden'): pg.click(f'button[data-open="{bani}"]'); time.sleep(1.2)
        pg.click('button[data-mode="meaning"]'); time.sleep(1.5)
        off[bani] = dict(lines=pg.evaluate('document.querySelectorAll("#source-unit article.scripture-line").length'), meanings=pg.evaluate('document.querySelectorAll("#source-unit button.simple-meaning").length'))
    for page_, sel, root in (('full-japji.html', '#continuous-reader article.scripture-line', '#continuous-reader'), ('sukhmani.html', '#sukhmani-text [data-line-id]', '#sukhmani-text')):
        pg.goto(B + page_, wait_until='load'); time.sleep(3.0); off[page_] = dict(lines=pg.evaluate(f'document.querySelectorAll("{sel}").length'), check=pg.evaluate(f"document.querySelector('{root}').dataset.sourceIntegrity"))
    for page_ in ('index.html', 'simran.html', 'gurdwaras.html', 'pauri-2-lesson.html'):
        try: pg.goto(B + page_, wait_until='load'); off[page_] = len(pg.inner_text('body')) > 200
        except Exception as e: off[page_] = 'did not open: ' + str(e)[:60]
    c.set_offline(False); R['5_network_off_on_repair_candidate'] = off
    # ---- 5. a broken release appears: the working version must stay
    switch('v7'); pg.goto(B + 'nitnem/index.html', wait_until='networkidle'); time.sleep(0.8); pg.click('button[data-open="sohila"]'); time.sleep(0.8)
    pg.click('#reading-tools'); time.sleep(0.3); pg.click('#check-update'); time.sleep(7)
    x = dict(offline=pg.evaluate(SW), readerIsTold=pg.inner_text('#offline-status'), loadButtonShown=pg.evaluate('!document.querySelector("#apply-update").hidden')); pg.keyboard.press('Escape')
    c.set_offline(True); t = fresh_tab(); t.goto(B + 'full-japji.html', wait_until='load'); time.sleep(2.5)
    x['japjiStillOpensOffline'] = dict(lines=t.evaluate('document.querySelectorAll("#continuous-reader article.scripture-line").length'), check=t.evaluate("document.querySelector('#continuous-reader').dataset.sourceIntegrity")); t.close(); c.set_offline(False)
    R['6_broken_release_offered'] = x
    # ---- 6. the offline copy of a scripture file is damaged; then a later release is loaded: does that repair it?
    switch('v5'); t = fresh_tab(); t.goto(B + 'full-japji.html', wait_until='load'); time.sleep(2.2)
    act = t.evaluate('''async () => { for (const k of await caches.keys()) { const c = await caches.open(k); for (const req of await c.keys()) { if (new URL(req.url).pathname.endsWith('/js/japji-full-data.js')) {
        const resp = await c.match(req); const text = await resp.text(); const h = new Headers(resp.headers); h.delete('content-length'); await c.put(req, new Response(text.replace('ਹੁਕਮਿ ਰਜਾਈ ਚਲਣਾ', 'ਹੁਕਮ ਰਜਾਈ ਚਲਣਾ'), {status: 200, headers: h})); return 'damaged'; } } } return 'not found'; }'''); t.close()
    t = fresh_tab(); t.goto(B + 'full-japji.html', wait_until='load'); time.sleep(2.2); y = dict(action=act, afterDamage=t.evaluate("document.querySelector('#continuous-reader').dataset.sourceIntegrity")); t.close()
    switch('v6'); pg.goto(B + 'nitnem/index.html', wait_until='networkidle'); time.sleep(0.8); pg.click('button[data-open="sohila"]'); time.sleep(0.8)
    pg.click('#reading-tools'); time.sleep(0.3); pg.click('#check-update'); time.sleep(6); y['laterReleaseOffered'] = pg.evaluate('!document.querySelector("#apply-update").hidden')
    if y['laterReleaseOffered']: pg.click('#apply-update'); time.sleep(3.5); pg.wait_for_load_state('networkidle'); time.sleep(0.8)
    y['offline'] = pg.evaluate(SW); t = fresh_tab(); t.goto(B + 'full-japji.html', wait_until='load'); time.sleep(2.5)
    y['afterLoadingLaterRelease'] = dict(check=t.evaluate("document.querySelector('#continuous-reader').dataset.sourceIntegrity"), lines=t.evaluate('document.querySelectorAll("#continuous-reader article.scripture-line").length'))
    end = json.loads(t.evaluate('JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)])))')); t.close()
    y['synthetic_notes_still_present_at_the_end'] = {m: any(m in v for v in end.values()) for m in ('RT4-NITNEM-NOTE', 'RT4-JAPJI-NOTE', 'RT4-SUKHMANI-NOTE')}
    R['7_damaged_offline_copy_then_later_release'] = y
    R['8_every_address_contacted_during_the_whole_run'] = sorted(hosts); R['9_page_errors'] = errs[:8]
    b.close()
switch('v1'); json.dump(R, open(OUT, 'w'), ensure_ascii=False, indent=1)
for k, v in R.items(): print(k, '|', json.dumps(v, ensure_ascii=False)[:1500])
