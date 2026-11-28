"""Round 2 · PR #43 · HI-05: how the existing offline worker treats the Daily Hukamnama files.
Headless Chromium, emulation only. Usage: python3 h03_hukamnama_offline_worker.py <base-url> <out.json>"""
import json, sys, time
from playwright.sync_api import sync_playwright
B, OUT = sys.argv[1:3]; R = {'candidate': 'PR #43 at fb49ef41bd890db879d7f93a861585915ef81622'}
with sync_playwright() as p:
    b = p.chromium.launch(); c = b.new_context(viewport={'width': 390, 'height': 664}); pg = c.new_page()
    pg.goto(B + 'index.html', wait_until='networkidle')
    pg.wait_for_function("navigator.serviceWorker && navigator.serviceWorker.controller !== null || (navigator.serviceWorker.ready.then(()=>true))", timeout=15000)
    pg.evaluate("navigator.serviceWorker.ready.then(()=>1)"); time.sleep(1.5); pg.reload(wait_until='networkidle'); time.sleep(0.5)
    R['workerControlsHome'] = pg.evaluate("!!navigator.serviceWorker.controller")
    R['cachedPathsMentioningHukamnama'] = pg.evaluate("(async()=>{const out=[];for(const k of await caches.keys()){const c=await caches.open(k);for(const r of await c.keys()){if(/hukamnama/.test(r.url))out.push(r.url)}}return out})()")
    R['cacheEntryCount'] = pg.evaluate("(async()=>{let n=0;for(const k of await caches.keys()){n+=(await (await caches.open(k)).keys()).length}return n})()")
    R['homeLinksToHukamnama'] = pg.evaluate("[...document.querySelectorAll('a')].filter(a=>/hukamnama/.test(a.href)).length")
    pg.goto(B + 'hukamnama/index.html', wait_until='networkidle'); time.sleep(0.6)
    R['online_withWorker'] = pg.evaluate("({controlled: !!navigator.serviceWorker.controller, lines: document.querySelectorAll('#scripture .pankti').length, status: document.getElementById('status').textContent})")
    R['cachedAfterVisit'] = pg.evaluate("(async()=>{const out=[];for(const k of await caches.keys()){const c=await caches.open(k);for(const r of await c.keys()){if(/hukamnama/.test(r.url))out.push(r.url)}}return out})()")
    c.set_offline(True)
    try:
        pg.reload(wait_until='domcontentloaded', timeout=8000); time.sleep(0.5)
        R['offline_reload'] = dict(loaded=True, title=pg.title(), lines=pg.evaluate("document.querySelectorAll('#scripture .pankti').length"), body=pg.evaluate("document.body ? document.body.innerText.slice(0,200) : ''"))
    except Exception as e:
        R['offline_reload'] = dict(loaded=False, error=str(e).splitlines()[0][:160])
    c.close(); b.close()
json.dump(R, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print(json.dumps(R, ensure_ascii=False, indent=1))
