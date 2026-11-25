"""RT-001: facts needed to say whether each newly noticed point is true of the PUBLISHED version, of the repair candidate, or both.
(1) Nitnem: one bani file damaged in the offline copy — does trying again, or reloading, ever repair it? are other banis and the backup still reachable?
(2) Japji: wording shown when the saved record cannot be read; what happens when a backup holding a note on an unknown line is restored.
(3) Sukhmani: is its saved-learning warning actually visible to a sighted reader?
Usage: python3 rt7_both_builds_extras.py <base-url> <site-root> <out.json> <label>"""
import json, sys, time, re, os, tempfile
from playwright.sync_api import sync_playwright
B, SITE, OUT, LABEL = sys.argv[1:5]; KEY = 'glp001.continuous.v2'
EXPECTED_FILES = len(re.findall(r'"\./[^"]*":"[0-9a-f]{64}"', open(SITE + 'sw.js', encoding='utf-8').read()))
SEEN = '''(e) => { if (!e || e.hidden || e.closest('[hidden]')) return false; const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return b.width >= 40 && b.height >= 12 && b.bottom > 0 && b.top < innerHeight && cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.05; }'''
WARN = '''([pattern]) => { const seen = %s; const re = new RegExp(pattern, 'i');
  return [...document.querySelectorAll('body *')].filter(e => re.test(e.textContent || '') && [...e.children].every(c => !re.test(c.textContent || ''))).map(e => ({where: e.tagName.toLowerCase() + (e.id ? '#' + e.id : ''), visibleToSighted: seen(e), text: e.textContent.replace(/\\s+/g, ' ').trim().slice(0, 150)})); }''' % SEEN
R = {'label': LABEL, 'base': B}
with sync_playwright() as p:
    b = p.chromium.launch(); d = dict(p.devices['iPhone 14'])
    # ---- 1. Nitnem: damaged bani file in the offline copy
    c = b.new_context(**d, accept_downloads=True); pg = c.new_page(); pg.goto(B + 'nitnem/index.html', wait_until='load')
    for _ in range(120):
        if pg.evaluate("(async () => { let t = 0; for (const k of await caches.keys()) t += (await (await caches.open(k)).keys()).length; return t; })()") >= EXPECTED_FILES: break
        time.sleep(0.5)
    pg.evaluate("navigator.serviceWorker.ready.then(() => true)"); pg.reload(wait_until='load'); time.sleep(0.6)
    act = pg.evaluate('''async () => { for (const k of await caches.keys()) { const c = await caches.open(k); for (const req of await c.keys()) { if (new URL(req.url).pathname.endsWith('/nitnem/data/sohila.json')) {
        const resp = await c.match(req); const text = await resp.text(); const h = new Headers(resp.headers); h.delete('content-length'); await c.put(req, new Response(text.replace('ਧੂਪੁ ਮਲਆਨਲੋ', 'ਧੂਪੁ ਮਲਆਨਲ'), {status: 200, headers: h})); return 'damaged'; } } } return 'not found'; }''')
    pg.close(); o = {'action': act}
    def tab():
        t = c.new_page(); cdp = c.new_cdp_session(t); cdp.send('Network.enable'); cdp.send('Network.setCacheDisabled', {'cacheDisabled': True}); return t
    def sohila(t):
        t.goto(B + 'nitnem/index.html', wait_until='load'); time.sleep(0.8); t.click('button[data-open="sohila"]'); time.sleep(1.8)
        return t.evaluate('''() => ({readerOpen: !document.querySelector('#reader').hidden, lines: document.querySelectorAll('#source-unit .scripture-line').length,
            said: [...document.querySelectorAll('[role=status],[role=alert],#collection-status,.loading-note')].filter(e => !e.hidden && e.offsetParent !== null).map(e => e.textContent.trim().slice(0, 130)).filter(x => /could not|verification|try again/i.test(x)).slice(0, 1),
            tryAgainControl: [...document.querySelectorAll('button,a')].filter(e => e.getBoundingClientRect().width > 0 && /try again|retry|download again|repair/i.test(e.textContent)).map(e => e.textContent.trim().slice(0, 30))})''')
    t = tab(); o['first_open'] = sohila(t); o['second_try_same_tab'] = (t.click('button[data-open="sohila"]'), time.sleep(1.8), t.evaluate("document.querySelectorAll('#source-unit .scripture-line').length"))[2]
    t.reload(wait_until='load'); time.sleep(0.8); o['after_reload_online'] = sohila(t)
    t.goto(B + 'nitnem/index.html', wait_until='load'); time.sleep(0.6); t.click('button[data-open="jaap"]'); time.sleep(1.8); o['another_bani_opens_lines'] = t.evaluate("document.querySelectorAll('#source-unit .scripture-line').length")
    t.click('#reading-tools'); time.sleep(0.4); o['backup_control_reachable_from_another_bani'] = t.evaluate("[...document.querySelectorAll('#tools-dialog button, dialog[open] button')].filter(e => e.getBoundingClientRect().width > 0 && /export|backup|back up|download/i.test(e.textContent)).map(e => e.textContent.trim().slice(0, 40))")
    R['1_nitnem_damaged_offline_copy'] = o; c.close(); print('1', json.dumps(o, ensure_ascii=False)[:900])
    # ---- 2. Japji wording
    d2 = dict(d); d2['service_workers'] = 'block'; o = {}
    c = b.new_context(**d2, accept_downloads=True); pg = c.new_page(); pg.goto(B + 'index.html'); pg.evaluate('([k, v]) => localStorage.setItem(k, v)', [KEY, '{"version":2,"notes":{"mool.line01":"KEEP-ME'])
    pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.2)
    pg.click('#tools-open'); time.sleep(0.3); pg.locator('#reader-dialog [data-action="note"]').first.click(); time.sleep(0.6)
    o['unreadable_record_note_screen_says'] = pg.inner_text('#reader-dialog').replace('\n', ' | ')[-200:]; pg.keyboard.press('Escape'); c.close()
    c = b.new_context(**d2, accept_downloads=True); pg = c.new_page(); pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.2)
    path = os.path.join(tempfile.mkdtemp(), 'other-edition.json'); json.dump({'format': 'glp-family-learning', 'version': 1, 'projectId': 'GLP-001', 'records': {KEY: json.dumps({'version': 2, 'notes': {'pauri99.line01': 'NOTE-FROM-ANOTHER-EDITION'}})}}, open(path, 'w'))
    pg.click('#tools-open'); time.sleep(0.3); pg.locator('#reader-dialog [data-action="reader-explore"]').click(); time.sleep(0.3); pg.locator('#reader-dialog [data-action="learning"]').click(); time.sleep(0.4)
    pg.set_input_files('#import-file', path); time.sleep(0.9); o['restore_backup_with_note_on_unknown_line_says'] = pg.inner_text('#import-preview')[:160]
    btn = pg.query_selector('#import-preview [data-action="apply-import"]')
    if btn: btn.click(); time.sleep(1.3); o['after_merge_pressed'] = (pg.inner_text('#import-preview')[:160] if pg.query_selector('#import-preview') else 'dialog closed')
    o['note_anywhere_in_saved_record'] = 'NOTE-FROM-ANOTHER-EDITION' in (pg.evaluate('([k]) => localStorage.getItem(k)', [KEY]) or '')
    R['2_japji_wording'] = o; c.close(); print('2', json.dumps(o, ensure_ascii=False)[:700])
    # ---- 3. Sukhmani warning visibility
    o = {}
    for name, seed in (('cut_off_json', '{"version":2,"notes":{"sukhmani.a01.p01.l02":"KEEP-ME'), ('note_on_unknown_line', json.dumps({'version': 2, 'read': 'sukhmani.a99.p01.l01', 'guide': 'x', 'notes': {'sukhmani.a99.p09.l01': 'KEEP-ME'}, 'bookmarks': ['zz']}))):
        c = b.new_context(**d2); pg = c.new_page(); pg.goto(B + 'index.html'); pg.evaluate('([v]) => localStorage.setItem("glp001.sukhmani.v1", v)', [seed])
        pg.goto(B + 'sukhmani.html', wait_until='networkidle'); time.sleep(2.2); x = {'on_open': pg.evaluate(WARN, ['could not be read|outside this reading pack|has been preserved'])}
        pg.mouse.wheel(0, 700); time.sleep(1.2); x['after_scrolling'] = pg.evaluate(WARN, ['could not be read|outside this reading pack|has been preserved'])
        x['record_untouched'] = (pg.evaluate('localStorage.getItem("glp001.sukhmani.v1")') == seed)
        if name == 'note_on_unknown_line': pg.evaluate('window.scrollTo(0,0)'); time.sleep(0.5); pg.screenshot(path=f'/home/claude/work/shots/rt7_{LABEL}_sukhmani_warning.png')
        o[name] = x; c.close()
    R['3_sukhmani_warning_visibility'] = o; print('3', json.dumps(o, ensure_ascii=False)[:900])
    b.close()
json.dump(R, open(OUT, 'w'), ensure_ascii=False, indent=1)
