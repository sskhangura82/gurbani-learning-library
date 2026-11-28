"""Does the test copy's own banner get in the way of what the phone check looks at?
The banner is fixed to the top of the screen. The Japji reader places the line being read 14 pixels from the top.
For three passages: jump there, then measure where the banner ends, where the line named by the bottom bar begins,
and what is actually on top at that line's position. Same for two window widths. Chromium, emulation only.
Usage: python3 dt_03_test_copy_banner.py <base url ending in /> <out.json>"""
import json, sys, time
from playwright.sync_api import sync_playwright
B, OUT = sys.argv[1:3]; R = {'note': 'emulation only (Chromium); not an iPhone result', 'japji': [], 'pages': []}
MEASURE = """(() => { const ban = document.querySelector('.glp-qa-banner'); const br = ban ? ban.getBoundingClientRect() : null;
  const s = JSON.parse(localStorage.getItem('glp001.continuous.v2') || '{}'); const d = document.getElementById('dock-position');
  const rows = [...document.querySelectorAll('.scripture-line')]; const named = rows.find(r => r.dataset.occurrence === (s.read && s.read.id)) || null;
  const firstBelow = br ? rows.find(r => r.getBoundingClientRect().top >= br.bottom - 1) : null;
  const nr = named ? named.getBoundingClientRect() : null; const top = nr ? document.elementFromPoint(Math.round(innerWidth / 2), Math.max(1, Math.round(nr.top + 6))) : null;
  return {barSays: (d.getAttribute('aria-label') || d.textContent).trim().replace('. Jump to a passage', ''), bannerPosition: ban ? getComputedStyle(ban).position : null,
    bannerTop: br ? Math.round(br.top) : null, bannerBottom: br ? Math.round(br.bottom) : null, namedLineTop: nr ? Math.round(nr.top) : null, namedLineBottom: nr ? Math.round(nr.bottom) : null,
    namedLineText: named ? (named.querySelector('[lang=pa]') || named).textContent.trim().slice(0, 40) : null,
    whatIsOnTopAtTheNamedLine: top ? (top.closest('.glp-qa-banner') ? 'the test banner' : top.closest('.scripture-line') ? 'the line itself' : top.tagName + '.' + top.className) : null,
    pixelsOfTheNamedLineUnderTheBanner: br && nr ? Math.max(0, Math.min(nr.bottom, br.bottom) - Math.max(nr.top, br.top)) : null,
    firstLineFullyBelowTheBanner: firstBelow ? firstBelow.dataset.occurrence : null}; })()"""
with sync_playwright() as p:
    b = p.chromium.launch()
    for width in (390, 375, 320):
        c = b.new_context(viewport={'width': width, 'height': {390: 844, 375: 667, 320: 568}[width]}, service_workers='block'); c.set_default_timeout(8000); pg = c.new_page()
        pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.5)
        for name in ('Pauri 5', 'Pauri 20', 'Pauri 38'):
            if pg.evaluate("getComputedStyle(document.getElementById('dock-position')).display") != 'none': pg.click('#dock-position')
            else:   # on a 320-pixel screen the bar has no passage name; go through the controls instead
                pg.click('#tools-open'); time.sleep(0.4); pg.evaluate("[...document.querySelectorAll('dialog[open] button')].find(b => b.textContent.trim().startsWith('Jump to a passage')).click()")
            time.sleep(0.5)
            pg.evaluate("([t]) => [...document.querySelectorAll('dialog[open] button')].find(b => b.textContent.trim().startsWith(t + 'Ang')).click()", [name]); time.sleep(0.6)
            pg.evaluate("document.querySelector('dialog[open] #dialog-close')?.click()"); time.sleep(1.5)
            m = pg.evaluate(MEASURE); m.update(window=width, jumpedTo=name, passageNameShownOnTheBar=pg.evaluate("getComputedStyle(document.getElementById('dock-position')).display") != 'none'); R['japji'].append(m); print(width, name, '->', {k: m[k] for k in ('barSays', 'bannerBottom', 'namedLineTop', 'whatIsOnTopAtTheNamedLine', 'pixelsOfTheNamedLineUnderTheBanner', 'firstLineFullyBelowTheBanner')}, flush=True)
        for page in ('index.html', 'sukhmani.html', 'nitnem/index.html'):
            pg.goto(B + page, wait_until='networkidle'); time.sleep(1.2); pg.mouse.wheel(0, 1500); time.sleep(1.0)
            info = pg.evaluate("""(() => { const ban = document.querySelector('.glp-qa-banner'); const br = ban.getBoundingClientRect();
              const fixed = [...document.querySelectorAll('body *')].filter(e => e !== ban && !ban.contains(e) && ['sticky', 'fixed'].includes(getComputedStyle(e).position) && e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().top < 140 && e.getBoundingClientRect().bottom > 0 && e.getBoundingClientRect().width > 100)
                .map(e => ({what: e.tagName + (e.id ? '#' + e.id : '') + '.' + String(e.className).split(' ')[0], top: Math.round(e.getBoundingClientRect().top), bottom: Math.round(e.getBoundingClientRect().bottom), text: e.innerText.trim().replace(/\\s+/g, ' ').slice(0, 50)}));
              return {bannerTop: Math.round(br.top), bannerBottom: Math.round(br.bottom), bannerStillOnScreenAfterScrolling: br.bottom > 0 && br.top < innerHeight, otherBarsFixedNearTheTop: fixed, sidewaysScroll: document.documentElement.scrollWidth > innerWidth + 1}; })()""")
            info.update(window=width, page=page); R['pages'].append(info); print(width, page, '->', info, flush=True)
        c.close()
    b.close()
json.dump(R, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
