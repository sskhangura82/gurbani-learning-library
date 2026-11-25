import json, urllib.request, time
from playwright.sync_api import sync_playwright
B = 'http://127.0.0.1:8090/gurbani-learning-library/'
def switch(v): return urllib.request.urlopen('http://127.0.0.1:8090/__switch?root=' + v).read().decode()
with sync_playwright() as p:
    b = p.chromium.launch(); c = b.new_context(**p.devices['iPhone 14']); pg = c.new_page()
    switch('v1'); pg.goto(B + 'nitnem/index.html', wait_until='networkidle'); time.sleep(4); pg.reload(wait_until='networkidle')
    pg.click('button[data-open="sohila"]'); time.sleep(0.8); pg.click('#reading-tools'); time.sleep(0.3); pg.fill('#note', 'SAVED-PART'); pg.click('#save-note'); time.sleep(0.5)
    switch('v2'); pg.click('#check-update'); time.sleep(5)
    pg.fill('#note', 'SAVED-PART and UNSAVED-TAIL'); print('apply visible:', pg.evaluate('!document.querySelector("#apply-update").hidden'))
    pg.click('#apply-update'); time.sleep(3); pg.wait_for_load_state('networkidle')
    st = pg.evaluate('Object.fromEntries(Object.entries(localStorage))'); k = [k for k in st if 'sohila' in k][0]
    print('marker V2:', 'REVIEW-TEST-V2' in pg.inner_text('.lead'), '| note after update:', json.loads(st[k])['payload']['notes'])
    b.close()
switch('v1')
