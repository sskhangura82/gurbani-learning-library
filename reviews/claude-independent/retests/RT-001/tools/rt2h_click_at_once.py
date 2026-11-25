"""RT-001 / CI-R-09: why does the builder's test manage to click the notice's button? Same seed and window as that test.
Compare: clicking the moment the reader is ready (as the test does) with clicking 1.5 seconds later (as a person would, at the earliest).
Usage: python3 rt2h_click_at_once.py <base-url> <out.json>"""
import json, sys, time
from playwright.sync_api import sync_playwright
B, OUT = sys.argv[1], sys.argv[2]; KEY = 'glp001.continuous.v2'
seed = {'version': 2, 'read': {'id': 'mool.line01', 'offset': 0}, 'bookmarks': ['future-edition.line99'], 'notes': {'future-edition.line99': 'SYNTHETIC unmatched reflection'}}
R = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, wait in (('click_the_moment_the_reader_is_ready', 0.0), ('click_after_1500_ms', 1.5)):
        runs = []
        for rep in range(3):
            c = b.new_context(viewport={'width': 390, 'height': 844}, service_workers='block', reduced_motion='reduce')
            c.add_init_script("(() => { const k = %s, raw = %s; if (localStorage.getItem(k) === null) localStorage.setItem(k, raw); })()" % (json.dumps(KEY), json.dumps(json.dumps(seed))))
            pg = c.new_page(); pg.goto(B + 'full-japji.html', wait_until='load')
            pg.wait_for_function("document.querySelector('#continuous-reader') && document.querySelector('#continuous-reader').dataset.sourceIntegrity === 'verified' && document.getElementById('retained-learning')", timeout=8000)
            if wait: time.sleep(wait)
            before = pg.evaluate("({immersive: document.body.classList.contains('quiet-reading'), scrolledTo: Math.round(scrollY)})")
            try: pg.locator('#retained-learning button').click(timeout=3000); ok = True
            except Exception: ok = False
            time.sleep(0.5)
            runs.append(dict(stateJustBeforeClick=before, clickSucceeded=ok, savedLearningOpened=pg.evaluate("!!document.getElementById('retained-learning-items')"), immersiveAfterwards=pg.evaluate("document.body.classList.contains('quiet-reading')")))
            c.close()
        R[name] = runs; print(name, json.dumps(runs))
    b.close()
json.dump(R, open(OUT, 'w'), indent=1)
