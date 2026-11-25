"""Remaining independent use/accessibility checks (written before reading the builder's tests).
U-16 landscape · A-06 reflow at 320 px and root-font scaling · A-07 reduced motion ·
A-04 keyboard reach/focus/dialog trap · U-07 maximum size · U-09 bookmark discoverability ·
U-15 provenance reachability · R-06 slow-connection timing.
Headless Chromium only. Nothing here is physical-device testing."""
import json, sys, time
sys.path.insert(0, '/home/claude/work/tools')
from pw_common import *

PAGES = {
    'home': 'index.html',
    'nitnem-collection': 'nitnem/index.html',
    'nitnem-jaap': 'nitnem/index.html?bani=jaap',
    'nitnem-rehras': 'nitnem/index.html?bani=rehras',
    'japji': 'full-japji.html',
    'sukhmani': 'sukhmani.html',
    'simran': 'simran.html',
    'gurdwaras': 'gurdwaras.html',
    'arrivals': 'arrivals.html',
    'pauri2-lesson': 'pauri-2-lesson.html',
}
OVERFLOW_JS = '''() => {
  const vw = document.documentElement.clientWidth;
  const sw = document.documentElement.scrollWidth;
  const wide = [];
  for (const e of document.querySelectorAll('body *')) {
    const r = e.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && (r.right > vw + 1 || r.left < -1)) {
      const cs = getComputedStyle(e);
      if (cs.position === 'fixed' && cs.visibility === 'hidden') continue;
      wide.push((e.tagName + (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : '')).slice(0, 60) + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
      if (wide.length >= 6) break;
    }
  }
  return {vw, sw, horizontalScroll: sw > vw + 1, sample: wide};
}'''
CHROME_JS = '''() => {
  // share of the viewport taken by fixed/sticky furniture
  let top = 0, bottom = 0;
  for (const e of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(e);
    if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
    const r = e.getBoundingClientRect();
    if (r.width < innerWidth * 0.5 || r.height < 8 || r.height > innerHeight * 0.8) continue;
    if (r.top <= 2) top = Math.max(top, r.bottom);
    if (r.bottom >= innerHeight - 2) bottom = Math.max(bottom, innerHeight - r.top);
  }
  return {innerHeight, fixedTop: Math.round(top), fixedBottom: Math.round(bottom), readingArea: Math.round(innerHeight - top - bottom)};
}'''
out = {}
with sync_playwright() as p:
    # ---------- A-06 reflow at 320 px ----------
    res = {}
    s = Session(p, device=None, viewport={'width': 320, 'height': 568}); pg = s.page
    for name, url in PAGES.items():
        pg.goto(BASE + url, wait_until='networkidle'); time.sleep(0.8)
        res[name] = pg.evaluate(OVERFLOW_JS)
    # depths in the three readers
    pg.goto(BASE + 'nitnem/index.html?bani=jaap', wait_until='networkidle'); time.sleep(0.8)
    for depth in ('meaning', 'study'):
        b = pg.query_selector(f'button[data-depth="{depth}"], button[data-mode="{depth}"]')
        if b: b.click(); time.sleep(1.5); res[f'nitnem-jaap:{depth}'] = pg.evaluate(OVERFLOW_JS)
    pg.goto(BASE + 'full-japji.html', wait_until='networkidle'); time.sleep(0.8)
    for depth in ('understand', 'study'):
        b = pg.query_selector(f'button[data-depth="{depth}"]')
        if b: b.click(); time.sleep(1.0); res[f'japji:{depth}'] = pg.evaluate(OVERFLOW_JS)
    pg.goto(BASE + 'sukhmani.html', wait_until='networkidle'); time.sleep(1.0)
    for depth in ('understand', 'meaning', 'study'):
        b = pg.query_selector(f'button[data-depth="{depth}"], button[data-mode="{depth}"]')
        if b: b.click(); time.sleep(1.2); res[f'sukhmani:{depth}'] = pg.evaluate(OVERFLOW_JS)
    s.shot('61_nitnem_320'); s.close()
    out['A06_reflow_320'] = res

    # ---------- U-16 landscape (844 x 390) ----------
    res = {}
    s = Session(p, device='iPhone 14 landscape'); pg = s.page
    for name in ('home', 'nitnem-collection', 'nitnem-jaap', 'japji', 'sukhmani'):
        pg.goto(BASE + PAGES[name], wait_until='networkidle'); time.sleep(0.9)
        pg.mouse.wheel(0, 1400); time.sleep(0.6)
        res[name] = {'overflow': pg.evaluate(OVERFLOW_JS), 'chrome': pg.evaluate(CHROME_JS)}
        s.shot(f'62_landscape_{name}')
    s.close()
    out['U16_landscape'] = res

    # ---------- portrait reading-area share, for comparison ----------
    res = {}
    s = Session(p); pg = s.page
    for name in ('nitnem-jaap', 'japji', 'sukhmani'):
        pg.goto(BASE + PAGES[name], wait_until='networkidle'); time.sleep(0.9)
        pg.mouse.wheel(0, 1400); time.sleep(0.6)
        res[name] = pg.evaluate(CHROME_JS)
    out['portrait_reading_area'] = res

    # ---------- A-06b does text follow the reader's own default font size? ----------
    res = {}
    for name in ('home', 'nitnem-jaap', 'japji', 'sukhmani'):
        pg.goto(BASE + PAGES[name], wait_until='networkidle'); time.sleep(0.9)
        res[name] = pg.evaluate('''() => {
          const pick = () => { const m = new Map(); let n = 0;
            for (const e of document.querySelectorAll('body *')) { if (!e.childNodes.length) continue;
              const own = [...e.childNodes].some(c => c.nodeType === 3 && c.textContent.trim().length > 1); if (!own) continue;
              const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
              m.set(e, parseFloat(getComputedStyle(e).fontSize)); if (++n > 400) break; } return m; };
          const before = pick(); const old = document.documentElement.style.fontSize;
          document.documentElement.style.fontSize = '200%';
          let grew = 0, same = 0; for (const [e, f] of before) { const g = parseFloat(getComputedStyle(e).fontSize); if (g > f * 1.5) grew++; else same++; }
          document.documentElement.style.fontSize = old;
          return {textElements: before.size, scaledWithRootFont: grew, fixedPixelSize: same};
        }''')
    s.close()
    out['A06_root_font_scaling'] = res

    # ---------- A-07 reduced motion ----------
    res = {}
    s = Session(p, reduced_motion='reduce'); pg = s.page
    for name, play in (('nitnem-jaap', '#play'), ('japji', '#play'), ('sukhmani', '#sk-play')):
        pg.goto(BASE + PAGES[name], wait_until='networkidle'); time.sleep(0.9)
        anim = pg.evaluate('''() => { let t = 0, a = 0; for (const e of document.querySelectorAll('*')) { const cs = getComputedStyle(e);
            if (cs.transitionDuration.split(',').some(x => parseFloat(x) > 0)) t++; if (cs.animationName !== 'none' && cs.animationDuration.split(',').some(x => parseFloat(x) > 0)) a++; } return {withTransition: t, withAnimation: a, mq: matchMedia('(prefers-reduced-motion: reduce)').matches}; }''')
        y0 = pg.evaluate('scrollY'); moved = None; label = None
        b = pg.query_selector(play)
        if b:
            label = b.get_attribute('aria-label')
            b.click(); time.sleep(6.0); y1 = pg.evaluate('scrollY'); moved = y1 - y0
            active = pg.evaluate('''() => document.querySelectorAll('[data-active="true"], .is-active, .active-word, .current').length''')
            b.click()
        res[name] = {'css': anim, 'guideButtonLabel': label, 'scrolledPxIn6sWithGuide': moved, 'activeMarkers': active if b else None}
    s.close()
    out['A07_reduced_motion'] = res

    # ---------- A-04 keyboard (desktop viewport) ----------
    res = {}
    s = Session(p, device=None, viewport={'width': 1280, 'height': 800}); pg = s.page
    FOCUS_JS = '''() => { const e = document.activeElement; if (!e || e === document.body) return null; const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
        return {tag: e.tagName, id: e.id || null, text: (e.getAttribute('aria-label') || e.innerText || '').replace(/\\s+/g, ' ').trim().slice(0, 50),
                outline: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0, shadow: cs.boxShadow !== 'none', visible: r.width > 0 && r.height > 0,
                inViewport: r.top >= 0 && r.bottom <= innerHeight + 1, inDialog: !!e.closest('dialog,[role=dialog]')}; }'''
    for name in ('home', 'nitnem-jaap', 'japji', 'sukhmani'):
        pg.goto(BASE + PAGES[name], wait_until='networkidle'); time.sleep(0.9)
        seq = []; no_ring = 0; offscreen = 0
        for i in range(40):
            pg.keyboard.press('Tab'); f = pg.evaluate(FOCUS_JS)
            if not f: continue
            seq.append(f['text'] or f['tag'])
            if not (f['outline'] or f['shadow']): no_ring += 1
            if not f['visible']: offscreen += 1
        res[name] = {'first40TabStops': seq[:40], 'withoutVisibleFocusRing': no_ring, 'focusOnInvisibleElement': offscreen}
    # dialog trap + Escape + focus return, per reader
    for name, opener in (('nitnem-jaap', '#reading-tools'), ('japji', '#tools-open'), ('sukhmani', '#sk-tools')):
        pg.goto(BASE + PAGES[name], wait_until='networkidle'); time.sleep(0.9)
        el = pg.query_selector(opener)
        if not el: res[name + ':dialog'] = 'opener not found'; continue
        el.focus(); pg.keyboard.press('Enter'); time.sleep(0.6)
        opened = pg.evaluate('''() => !!document.querySelector('dialog[open]')''')
        escaped = 0
        for i in range(60):
            pg.keyboard.press('Tab'); f = pg.evaluate(FOCUS_JS)
            if f and not f['inDialog']: escaped += 1
        pg.keyboard.press('Escape'); time.sleep(0.4)
        closed = pg.evaluate('''() => !document.querySelector('dialog[open]')''')
        back = pg.evaluate('document.activeElement && document.activeElement.id')
        res[name + ':dialog'] = {'openedWithEnter': opened, 'tabStopsThatLeftTheDialog_of60': escaped, 'escapeCloses': closed, 'focusReturnedTo': back, 'expected': opener.lstrip('#')}
    s.close()
    out['A04_keyboard'] = res

    # ---------- U-07 maximum Gurmukhi size: clipping / overlap ----------
    res = {}
    s = Session(p); pg = s.page
    pg.goto(BASE + 'nitnem/index.html?bani=jaap', wait_until='networkidle'); time.sleep(0.9)
    pg.click('#reading-tools'); time.sleep(0.5)
    pg.evaluate('''() => { const r = document.querySelector('#size'); r.value = r.max; r.dispatchEvent(new Event('input', {bubbles: true})); r.dispatchEvent(new Event('change', {bubbles: true})); }''')
    time.sleep(0.5); pg.keyboard.press('Escape'); time.sleep(0.5)
    res['nitnem'] = {'max': pg.evaluate('document.querySelector("#size").max'), 'overflow': pg.evaluate(OVERFLOW_JS),
                     'gurmukhiPx': pg.evaluate('''() => { const e = document.querySelector('[lang="pa"]'); return e ? getComputedStyle(e).fontSize : null }''')}
    s.shot('63_nitnem_max_size')
    pg.reload(wait_until='networkidle'); time.sleep(1.0)
    res['nitnem']['persistsAfterReload'] = pg.evaluate('document.querySelector("#size").value')
    s.close()
    out['U07_max_size'] = res

    # ---------- R-06 slow connection: time to first Gurbani ----------
    res = {}
    for name in ('home', 'nitnem-jaap', 'japji', 'sukhmani'):
        s = Session(p); pg = s.page
        cdp = s.ctx.new_cdp_session(pg)
        cdp.send('Network.enable')
        # "Slow 3G"-class profile commonly used for lab tests: 400 kbit/s down, 400 ms round trip
        cdp.send('Network.emulateNetworkConditions', {'offline': False, 'latency': 400, 'downloadThroughput': 400 * 1024 / 8, 'uploadThroughput': 400 * 1024 / 8})
        cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
        t0 = time.time()
        pg.goto(BASE + PAGES[name], wait_until='commit')
        first = None
        try:
            pg.wait_for_function('''() => [...document.querySelectorAll('[lang="pa"], .gurbani, .tuk, .g-line, .scripture-line')].some(e => { const r = e.getBoundingClientRect(); return r.height > 0 && (e.textContent || '').trim().length > 3 })''', timeout=120000)
            first = round(time.time() - t0, 1)
        except Exception as e:
            first = 'timeout: ' + str(e)[:60]
        res[name] = {'secondsToFirstGurmukhiText_400kbps_400ms_cpu4x': first}
        s.close()
    out['R06_slow_connection'] = res

json.dump(out, open('/home/claude/work/ua_remaining.json', 'w'), indent=1, ensure_ascii=False)
print(json.dumps(out, indent=1, ensure_ascii=False)[:9000])
