"""RT-001 / CI-R-02: the builder's own browser test waits for the kept-aside notice to be "visible" and then clicks its button.
This reproduces that test's exact situation (its seed, its 390x844 window, reduced motion, no phone emulation) and measures what a
sighted reader would actually see, then does the same at the phone window size used through the rest of this review.
Usage: python3 rt2e_builder_test_situation.py <base-url> <out.json>"""
import json, sys, time
from playwright.sync_api import sync_playwright
B, OUT = sys.argv[1], sys.argv[2]; KEY = 'glp001.continuous.v2'; SHOTS = '/home/claude/work/shots/'
longText = 'SYNTHETIC LONG REFLECTION\n' + 'ਕ' * 12050 + '\nEND <retained> & complete.'
seed = {'version': 2, 'read': {'id': 'mool.line01', 'offset': 0}, 'guide': {'index': 0, 'token': 0}, 'mode': 'read', 'theme': 'day', 'size': 30, 'pace': 70, 'bookmarks': ['future-edition.line99', 'pauri02.line02'],
        'notes': {'future-edition.line99': 'SYNTHETIC unmatched reflection <keep> & ਪੰਜਾਬੀ\nSecond line. ', 'pauri02.line01': longText, 'pauri02.line02': 'SYNTHETIC existing ordinary note.'}}
GEO = '''() => { const n = document.getElementById('retained-learning'); const b = n.getBoundingClientRect(), btn = n.querySelector('button'), bb = btn.getBoundingClientRect(); const cx = bb.left + bb.width / 2, cy = bb.top + bb.height / 2;
  const at = document.elementFromPoint(cx, cy); const cs = getComputedStyle(n);
  return {immersiveMode: document.body.classList.contains('quiet-reading'), pageScrolledTo: Math.round(scrollY), windowHeight: innerHeight, noticeBoxPx: [Math.round(b.width), Math.round(b.height)], noticeClip: cs.clip, noticePosition: cs.position,
          buttonBoxPx: [Math.round(bb.left), Math.round(bb.top), Math.round(bb.width), Math.round(bb.height)], elementUnderButtonCentre: at ? (at.tagName + (at.id ? '#' + at.id : '') + (at.className ? '.' + String(at.className).split(' ')[0] : '')) : null,
          buttonIsWhatATapWouldHit: !!(at && (at === btn || btn.contains(at))), aSightedReaderCanSeeTheNotice: b.width >= 40 && b.height >= 20 && b.bottom > 0 && b.top < innerHeight, noticeText: n.innerText.replace(/\\s+/g, ' ').trim().slice(0, 60)}; }'''
R = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, opts in (('builder_test_window_390x844_desktop_style', dict(viewport={'width': 390, 'height': 844}, service_workers='block', reduced_motion='reduce')),
                       ('phone_emulation_used_in_this_review', dict(**p.devices['iPhone 14'], service_workers='block'))):
        c = b.new_context(**opts); c.add_init_script("(() => { const k = %s, raw = %s; if (localStorage.getItem(k) === null) localStorage.setItem(k, raw); })()" % (json.dumps(KEY), json.dumps(json.dumps(seed))))
        pg = c.new_page(); pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.5)
        o = pg.evaluate(GEO); o['playwrightCallsItVisible'] = pg.locator('#retained-learning').is_visible()
        pg.screenshot(path=f"{SHOTS}rt2e_{name}.png")
        try: pg.locator('#retained-learning button').click(timeout=4000); o['playwrightClickSucceeded'] = True
        except Exception as e: o['playwrightClickSucceeded'] = False; o['clickProblem'] = [l.strip() for l in str(e).split('\n') if 'intercepts' in l][:1]
        o['savedLearningScreenOpened'] = pg.evaluate("!!document.getElementById('retained-learning-items')")
        R[name] = o; c.close(); print(name, json.dumps(o, ensure_ascii=False))
    b.close()
json.dump(R, open(OUT, 'w'), ensure_ascii=False, indent=1)
