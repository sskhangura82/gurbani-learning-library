"""Do the repair candidate's readers open at a plain http address (no fingerprint function, no offline worker)?
Serve the PR #40 checkout one directory above at port 8086, then: python3 readers_on_plain_http_address.py <out.json>
Headless Chromium; not a device."""
import json, sys, time
from playwright.sync_api import sync_playwright
B = 'http://127.0.0.1:8086/gurbani-learning-library/'; out = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, page in (('Japji reader', 'full-japji.html'), ('Sukhmani reader', 'sukhmani.html'), ('Nitnem reader', 'nitnem/index.html')):
        for mode in ('secure address (as now)', 'plain http address on a home network (no fingerprint function, no offline worker)'):
            c = b.new_context(viewport={'width': 390, 'height': 760}, service_workers='block'); pg = c.new_page(); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)[:120]))
            if mode.startswith('plain'): pg.add_init_script("Object.defineProperty(crypto, 'subtle', {value: undefined}); Object.defineProperty(window, 'isSecureContext', {value: false});")
            try:
                r = pg.goto(B + page, wait_until='networkidle', timeout=15000); time.sleep(1.2)
                txt = pg.evaluate("document.body.innerText"); gur = pg.evaluate("[...document.querySelectorAll('[lang=pa],.gurmukhi,.pankti,.line')].filter(e => /[\\u0a00-\\u0a7f]{3,}.*॥/.test(e.textContent) && e.getBoundingClientRect().height > 0).length")
                out.setdefault(name, {})[mode] = dict(status=r.status if r else None, gurbaniElementsVisible=gur, firstWords=' | '.join([t for t in txt.split('\n') if t.strip()][:5])[:260], pageErrors=errs[:2])
            except Exception as e: out.setdefault(name, {})[mode] = dict(error=str(e)[:160])
            c.close()
    b.close()
json.dump(out, open(sys.argv[1], 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print(json.dumps(out, ensure_ascii=False, indent=1))
