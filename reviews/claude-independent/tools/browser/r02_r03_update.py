"""R-02 / R-03 / D-02 / R-01(offline): service-worker update behaviour with a real good update and a real broken update."""
import json, sys, urllib.request
from playwright.sync_api import sync_playwright
import time
B = 'http://127.0.0.1:8090/gurbani-learning-library/'
def switch(v): return urllib.request.urlopen('http://127.0.0.1:8090/__switch?root=' + v).read().decode()
R = {}
def sw_state(pg): return pg.evaluate('''async () => { const r = await navigator.serviceWorker.getRegistration(); if(!r) return null; const keys = await caches.keys(); const sizes = {}; for (const k of keys) sizes[k.split(':').pop()] = (await (await caches.open(k)).keys()).length; return {active: r.active && r.active.state, waiting: !!r.waiting, installing: !!r.installing, caches: sizes, controlled: !!navigator.serviceWorker.controller} }''')
def marker(pg): 
    t = pg.inner_text('.lead'); return 'V3-BROKEN' if 'V3-BROKEN' in t else 'V2' if 'REVIEW-TEST-V2' in t else 'V1'
with sync_playwright() as p:
    b = p.chromium.launch(); d = dict(p.devices['iPhone 14']); c = b.new_context(**d); pg = c.new_page()
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:150]))
    switch('v1'); pg.goto(B + 'nitnem/index.html', wait_until='networkidle')
    for _ in range(40):
        st = sw_state(pg)
        if st and st['active'] == 'activated' and sum(st['caches'].values()) > 50: break
        time.sleep(0.5)
    R['v1_installed'] = dict(state=st, offline_message=pg.inner_text('#offline-message'), marker=marker(pg)); print('v1 installed', R['v1_installed'])
    pg.reload(wait_until='networkidle'); time.sleep(0.5)
    # save synthetic learning
    pg.click('button[data-open="sohila"]'); time.sleep(0.8); pg.click('#reading-tools'); time.sleep(0.3); pg.click('#bookmark'); time.sleep(0.3)
    pg.fill('#note', 'UPDATE-TEST-NOTE'); pg.click('#save-note'); time.sleep(0.5); pg.keyboard.press('Escape')
    before = pg.evaluate('JSON.stringify(Object.fromEntries(Object.entries(localStorage)))')
    # ---- offline with v1
    c.set_offline(True)
    off = {}
    for path, sel in [('index.html', 'h1'), ('nitnem/index.html', '#collection-title'), ('full-japji.html', '#continuous-reader .scripture-line'), ('sukhmani.html', '#sukhmani-text [data-line-id]'), ('simran.html', 'h1'), ('gurdwaras.html', 'h1'), ('gurdwara.html', 'h1'), ('pauri-2-lesson.html', 'h1')]:
        try:
            pg.goto(B + path, wait_until='load', timeout=15000); time.sleep(0.8); off[path] = pg.evaluate(f'document.querySelectorAll("{sel}").length')
        except Exception as e: off[path] = 'FAILED ' + str(e)[:80]
    pg.goto(B + 'nitnem/index.html', wait_until='load'); time.sleep(0.5)
    for comp in ['jaap', 'savaiye', 'chaupai', 'anand', 'rehras', 'sohila']:
        pg.goto(B + 'nitnem/index.html', wait_until='load'); time.sleep(0.3); pg.click(f'button[data-open="{comp}"]'); time.sleep(1.0)
        n = pg.evaluate('document.querySelectorAll("#source-unit .scripture-line").length'); pg.click('button[data-mode="meaning"]'); time.sleep(1.5)
        off['nitnem:' + comp] = dict(lines=n, meanings=pg.evaluate('document.querySelectorAll("#source-unit .simple-meaning").length'))
    R['offline_v1'] = off; print('offline v1', off)
    c.set_offline(False)
    # ---- good update available
    switch('v2'); pg.goto(B + 'nitnem/index.html', wait_until='networkidle'); time.sleep(0.5)
    pg.click('button[data-open="sohila"]'); time.sleep(0.8); pg.click('#reading-tools'); time.sleep(0.3); pg.click('#check-update')
    for _ in range(40):
        st = sw_state(pg)
        if st['waiting']: break
        time.sleep(0.5)
    R['v2_waiting'] = dict(state=st, page_still_shows=marker(pg), offline_status=pg.inner_text('#offline-status'), apply_button_visible=pg.evaluate('!document.querySelector("#apply-update").hidden'))
    print('v2 waiting', R['v2_waiting'])
    pg.keyboard.press('Escape'); pg.reload(wait_until='networkidle'); time.sleep(0.6)
    R['v2_waiting']['after_plain_reload_page_shows'] = marker(pg); print('  after plain reload still:', marker(pg))
    # unsaved reflection guard
    pg.click('button[data-open="sohila"]') if pg.evaluate('document.querySelector("#reader").hidden') else None; time.sleep(0.8)
    pg.click('#reading-tools'); time.sleep(0.4); pg.fill('#note', 'UPDATE-TEST-NOTE plus UNSAVED words'); 
    vis = pg.evaluate('!document.querySelector("#apply-update").hidden'); print('  apply visible after reload:', vis)
    if not vis: pg.click('#check-update'); time.sleep(1.5)
    pg.click('#apply-update'); time.sleep(1.5)
    R['v2_apply_with_unsaved_text'] = dict(offline_status=pg.inner_text('#offline-status') if pg.query_selector('#offline-status') else None, marker=marker(pg), note_field=pg.input_value('#note') if pg.query_selector('#note') else None)
    print('apply with unsaved text', R['v2_apply_with_unsaved_text'])
    if marker(pg) != 'V2':
        pg.click('#save-note'); time.sleep(0.6); pg.click('#apply-update'); time.sleep(2.5)
    pg.wait_for_load_state('networkidle'); time.sleep(1.0)
    after = pg.evaluate('JSON.stringify(Object.fromEntries(Object.entries(localStorage)))')
    R['v2_applied'] = dict(state=sw_state(pg), marker=marker(pg), learning_note_present='UPDATE-TEST-NOTE' in after, bookmarks_kept=json.loads(json.loads(after)[[k for k in json.loads(after) if 'sohila' in k][0]])['payload']['bookmarks'])
    print('v2 applied', R['v2_applied'])
    # ---- broken update
    switch('v3'); 
    if pg.evaluate('document.querySelector("#reader").hidden'): pg.click('button[data-open="sohila"]'); time.sleep(0.8)
    pg.click('#reading-tools'); time.sleep(0.3); pg.click('#check-update'); time.sleep(6)
    st = sw_state(pg)
    R['v3_broken'] = dict(state=st, offline_status=pg.inner_text('#offline-status'), marker=marker(pg), apply_button_visible=pg.evaluate('!document.querySelector("#apply-update").hidden'))
    print('v3 broken', R['v3_broken'])
    c.set_offline(True); pg.goto(B + 'nitnem/index.html', wait_until='load'); time.sleep(0.5)
    R['v3_broken']['offline_after_failed_update'] = dict(marker=marker(pg)); pg.click('button[data-open="jaap"]'); time.sleep(1.0); R['v3_broken']['offline_after_failed_update']['jaap_lines'] = pg.evaluate('document.querySelectorAll("#source-unit .scripture-line").length')
    R['v3_broken']['learning_note_present'] = 'UPDATE-TEST-NOTE' in pg.evaluate('JSON.stringify(Object.fromEntries(Object.entries(localStorage)))')
    print('  offline after failed update', R['v3_broken']['offline_after_failed_update'], '| note kept', R['v3_broken']['learning_note_present'])
    c.set_offline(False); R['page_errors'] = errs; print('page errors', errs)
    b.close()
switch('v1')
json.dump(R, open('/home/claude/work/r02_r03_update.json', 'w'), ensure_ascii=False, indent=1)
