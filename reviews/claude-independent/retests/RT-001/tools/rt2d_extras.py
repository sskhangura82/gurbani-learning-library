"""RT-001 / CI-R-02 extras: (1) notice visibility for a reader who left at the very top; (2) what a sighted reader sees while a record is unreadable,
on the repair candidate and on the published baseline; (3) the words shown when two notes are too long to combine; (4) is there any start-fresh control.
Usage: python3 rt2d_extras.py <base-url> <out.json> <label>"""
import json, sys, time, os, tempfile
from playwright.sync_api import sync_playwright
B, OUT, LABEL = sys.argv[1], sys.argv[2], sys.argv[3]; KEY = 'glp001.continuous.v2'; SHOTS = '/home/claude/work/shots/'
VIS = '''() => { const seen = e => { if (!e || e.hidden) return false; const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return b.width >= 40 && b.height >= 12 && b.bottom > 0 && b.top < innerHeight && cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.05; };
  const n = document.getElementById('retained-learning'), st = document.getElementById('status');
  const anyVisible = [...document.querySelectorAll('body *')].filter(e => e.children.length === 0 && /recover|kept aside|could not be read|newer reader/i.test(e.textContent || '') && seen(e)).map(e => e.textContent.trim().slice(0, 110));
  return {immersive: document.body.classList.contains('quiet-reading'), noticePresent: !!(n && !n.hidden), noticeVisibleToSighted: seen(n), statusLineText: st ? st.textContent.slice(0, 110) : null, statusLineVisibleToSighted: seen(st),
          anyVisibleWarningText: anyVisible.slice(0, 3)}; }'''
R = {'label': LABEL, 'base': B}
with sync_playwright() as p:
    b = p.chromium.launch(); d = dict(p.devices['iPhone 14']); d['service_workers'] = 'block'
    # 1. reader who left at the very top (record written by the reader itself), then gains a kept-aside item
    c = b.new_context(**d, accept_downloads=True); pg = c.new_page(); pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.2)
    pg.click('#tools-open'); time.sleep(0.3); pg.locator('#reader-dialog [data-action="reader-save"]').click(); time.sleep(0.8)
    if pg.evaluate('!!document.getElementById("reader-dialog").open'): pg.keyboard.press('Escape')
    time.sleep(0.4); r = json.loads(pg.evaluate('([k]) => localStorage.getItem(k)', [KEY])); r['notes']['nope.line99'] = 'KEEP-ME'
    pg.evaluate('([k, v]) => localStorage.setItem(k, v)', [KEY, json.dumps(r)]); pg.reload(wait_until='networkidle'); time.sleep(1.4)
    o = {'savedReadingPlace': r.get('read'), 'on_open': pg.evaluate(VIS)}; pg.screenshot(path=f"{SHOTS}rt2d_{LABEL}_left_at_top_on_open.png")
    pg.mouse.wheel(0, 500); time.sleep(0.8); o['after_scrolling_down_a_little'] = pg.evaluate(VIS)
    pg.evaluate('window.scrollTo(0,0)'); time.sleep(0.8); o['back_at_the_very_top'] = pg.evaluate(VIS)
    R['reader_who_left_at_the_very_top'] = o; c.close()
    # 2. unreadable record: what does a sighted reader see while reading?
    U = {}
    for name, seed in (('cut_off_json', '{"version":2,"notes":{"mool.line01":"KEEP-ME'), ('newer_version', json.dumps({'version': 9, 'notes': {'mool.line01': 'KEEP-ME'}})),
                       ('a_note_is_a_number', json.dumps({'version': 2, 'notes': {'mool.line01': 'KEEP-ME', 'mool.line02': 5}, 'read': {'id': 'pauri05.line01', 'offset': 0}}))):
        c = b.new_context(**d, accept_downloads=True); pg = c.new_page(); pg.goto(B + 'index.html'); pg.evaluate('([k, v]) => localStorage.setItem(k, v)', [KEY, seed])
        pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.4); x = {'on_open': pg.evaluate(VIS)}
        if name == 'cut_off_json': pg.screenshot(path=f"{SHOTS}rt2d_{LABEL}_unreadable_on_open.png")
        pg.mouse.wheel(0, 600); time.sleep(1.6); x['while_reading_after_a_scroll'] = pg.evaluate(VIS); x['recordUntouched'] = (pg.evaluate('([k]) => localStorage.getItem(k)', [KEY]) == seed)
        if name == 'cut_off_json': pg.screenshot(path=f"{SHOTS}rt2d_{LABEL}_unreadable_while_reading.png")
        x['startFreshControls'] = pg.evaluate("[...document.querySelectorAll('button,a')].filter(e => /start fresh|set aside|reset|clear saved|repair/i.test(e.textContent)).map(e => (e.id || e.dataset.action || e.tagName) + ':' + e.textContent.trim().slice(0, 40))")
        U[name] = x; c.close()
    R['unreadable_record'] = U
    # 3. two notes too long to combine: what is the reader told?
    if LABEL == 'pr40':
        c = b.new_context(**d, accept_downloads=True); pg = c.new_page(); pg.goto(B + 'index.html')
        pg.evaluate('([k, v]) => localStorage.setItem(k, v)', [KEY, json.dumps({'version': 2, 'notes': {'mool.line01': 'A' * 7000}})]); pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.2)
        path = os.path.join(tempfile.mkdtemp(), 'b.json'); json.dump({'format': 'glp-family-learning', 'version': 1, 'projectId': 'GLP-001', 'records': {KEY: json.dumps({'version': 2, 'notes': {'mool.line01': 'Z' * 7000}})}}, open(path, 'w'))
        before = pg.evaluate('([k]) => localStorage.getItem(k)', [KEY])
        pg.click('#tools-open'); time.sleep(0.3); pg.locator('#reader-dialog [data-action="reader-explore"]').click(); time.sleep(0.3); pg.locator('#reader-dialog [data-action="learning"]').click(); time.sleep(0.4)
        pg.set_input_files('#import-file', path); pg.wait_for_selector('#import-preview [data-action="apply-import"]', timeout=6000); pg.click('#import-preview [data-action="apply-import"]'); time.sleep(1.4)
        R['two_notes_too_long_to_combine'] = dict(readerIsTold=pg.inner_text('#import-preview')[:200], nothingChanged=(json.loads(pg.evaluate('([k]) => localStorage.getItem(k)', [KEY]))['notes'] == json.loads(before)['notes']))
        c.close()
    b.close()
json.dump(R, open(OUT, 'w'), ensure_ascii=False, indent=1)
print(json.dumps(R, ensure_ascii=False, indent=1)[:4200])
