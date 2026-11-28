"""RT-001 / CI-R-02: for how long after opening is the kept-aside notice actually on screen, in the builder's own test situation?
Usage: python3 rt2f_notice_timeline.py <base-url> <out.json>"""
import json, sys, time
from playwright.sync_api import sync_playwright
B, OUT = sys.argv[1], sys.argv[2]; KEY = 'glp001.continuous.v2'
seed = {'version': 2, 'read': {'id': 'mool.line01', 'offset': 0}, 'bookmarks': ['future-edition.line99'], 'notes': {'future-edition.line99': 'SYNTHETIC unmatched reflection'}}
WATCH = '''(() => { window.__tl = []; const t0 = performance.now(); let last = null;
  const tick = () => { const n = document.getElementById('retained-learning'); if (n) { const b = n.getBoundingClientRect(); const seen = !n.hidden && b.width >= 40 && b.height >= 20 && b.bottom > 0 && b.top < innerHeight;
      const s = (seen ? 'ON SCREEN' : 'not on screen') + '|' + (document.body.classList.contains('quiet-reading') ? 'immersive' : 'normal'); if (s !== last) { window.__tl.push([Math.round(performance.now() - t0), s, Math.round(scrollY)]); last = s; } }
    if (performance.now() - t0 < 4000) requestAnimationFrame(tick); }; requestAnimationFrame(tick); })();'''
R = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, opts in (('builder_test_window_390x844', dict(viewport={'width': 390, 'height': 844}, service_workers='block', reduced_motion='reduce')), ('phone_emulation', dict(**p.devices['iPhone 14'], service_workers='block'))):
        runs = []
        for rep in range(3):
            c = b.new_context(**opts); c.add_init_script("(() => { const k = %s, raw = %s; if (localStorage.getItem(k) === null) localStorage.setItem(k, raw); })()" % (json.dumps(KEY), json.dumps(json.dumps(seed))))
            c.add_init_script(WATCH); pg = c.new_page(); pg.goto(B + 'full-japji.html', wait_until='load'); time.sleep(4.3)
            tl = pg.evaluate('window.__tl'); on = [t for t in tl if t[1].startswith('ON SCREEN')]; off_after = [t for t in tl if on and t[0] > on[0][0] and not t[1].startswith('ON SCREEN')]
            runs.append(dict(timeline_ms_state_scroll=tl, msOnScreen=(off_after[0][0] - on[0][0]) if on and off_after else (None if not on else 'stayed on screen')))
            c.close()
        R[name] = runs; print(name, json.dumps(runs)[:900])
    b.close()
json.dump(R, open(OUT, 'w'), ensure_ascii=False, indent=1)
