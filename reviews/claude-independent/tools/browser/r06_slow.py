"""R-06 time to the first scripture line on a slow-connection lab profile (fresh visit, nothing cached).
Profile: 400 kbit/s down, 400 ms latency, CPU slowed 4x. Headless Chromium; a lab figure, not a field measurement."""
import json, sys, time
sys.path.insert(0, '/home/claude/work/tools')
from pw_common import *
T = {'nitnem-jaap': ('nitnem/index.html?bani=jaap', '#source-unit article.scripture-line p.tuk'),
     'nitnem-rehras': ('nitnem/index.html?bani=rehras', '#source-unit article.scripture-line p.tuk'),
     'japji': ('full-japji.html', '#continuous-reader article.scripture-line p.tuk'),
     'sukhmani': ('sukhmani.html', '#sukhmani-text [data-line-id]')}
out = {}
with sync_playwright() as p:
    for name, (url, sel) in T.items():
        for profile, (kbps, lat, cpu) in {'slow_400kbps': (400, 400, 4), 'typical_4g_9mbps': (9000, 170, 4)}.items():
            s = Session(p); pg = s.page
            cdp = s.ctx.new_cdp_session(pg)
            cdp.send('Network.enable')
            cdp.send('Network.emulateNetworkConditions', {'offline': False, 'latency': lat, 'downloadThroughput': kbps * 1024 / 8, 'uploadThroughput': kbps * 1024 / 8})
            cdp.send('Emulation.setCPUThrottlingRate', {'rate': cpu})
            t0 = time.time(); pg.goto(BASE + url, wait_until='commit')
            try:
                pg.wait_for_function('(sel) => { const e = document.querySelector(sel); return !!e && e.getBoundingClientRect().height > 0 && e.textContent.trim().length > 2 }', arg=sel, timeout=180000)
                first = round(time.time() - t0, 1)
            except Exception as e:
                first = 'timeout'
            xfer = sum(1 for r in s.requests)
            out.setdefault(name, {})[profile] = {'secondsToFirstScriptureLine': first, 'requestsSoFar': xfer}
            s.close()
json.dump(out, open('/home/claude/work/r06_slow.json', 'w'), indent=1)
print(json.dumps(out))
