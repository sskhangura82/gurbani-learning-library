"""RT-002 / CI-R-09 b–e: the "kept aside" notice across phone widths, reading modes, text sizes and with the silent guide running.
For each of 36 combinations (3 widths × Read/Meaning/Study × normal/largest text × guide off/running), with the reader
resumed mid-text: is the whole notice inside the screen; how big is its button; does a tap at the button's centre reach it;
is any of its text cut off; how much of the screen's height does it take. Then: can it be dismissed; what a screen reader
is given; and what happens under the test copy's banner. For that last part the candidate is staged locally the way the test
repository stages it — the same banner element and the same qa-banner.css added to the page files, nothing else — because the
app's own security policy (rightly) refuses a style injected from outside.
Chromium, made-up notes only.   Usage: python3 rt2_03_notice_extras.py <base-url> <base-url of the locally staged copy> <out.json>"""
import itertools, json, sys, time
from playwright.sync_api import sync_playwright
B, STAGED, OUT = sys.argv[1:4]; KEY = 'glp001.continuous.v2'; ARCH = 'glp001.continuous.retained.v1'
ARCHIVE = json.dumps({'version': 1, 'keptAside': {'notes': [{'id': 'nope.line99', 'text': 'KEPT-ASIDE-NOTE', 'reason': 'unknown_line'}], 'bookmarks': ['nope.line98']}})
M = """(() => { const n = document.getElementById('retained-learning'); if (!n || n.hidden) return {noticePresent: false};
  const r = n.getBoundingClientRect(), btn = n.querySelector('button'), br = btn.getBoundingClientRect(), p = n.querySelector('p');
  const top = document.elementFromPoint(br.left + br.width / 2, br.top + br.height / 2); const mid = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return {noticePresent: true, text: n.innerText.replace(/\\s+/g, ' ').trim(), width: Math.round(r.width), height: Math.round(r.height), top: Math.round(r.top),
    wholeNoticeInsideTheScreen: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, buttonWidth: Math.round(br.width), buttonHeight: Math.round(br.height),
    tapAtButtonCentreReachesTheButton: top === btn, whatIsOnTopAtTheNoticeCentre: mid ? (mid.closest('.glp-qa-banner') ? 'the test banner' : mid.closest('#retained-learning') ? 'the notice itself' : mid.tagName) : null,
    textCutOff: p.scrollWidth > p.clientWidth + 1 || p.scrollHeight > p.clientHeight + 1, shareOfScreenHeightPercent: Math.round(100 * r.height / innerHeight), immersive: document.body.classList.contains('quiet-reading')}; })()"""
R = {'note': 'emulation only (Chromium); made-up notes only', 'combinations': []}
with sync_playwright() as p:
    b = p.chromium.launch()
    def reader(width, height, mode, size, base=None):
        base = base or B
        c = b.new_context(viewport={'width': width, 'height': height}, service_workers='block', has_touch=True); c.set_default_timeout(8000); pg = c.new_page()
        pg.goto(base + 'index.html'); pg.evaluate('([a, b, k1, k2]) => { localStorage.setItem(k1, a); localStorage.setItem(k2, b); }', [json.dumps({'version': 2, 'mode': mode, 'size': size, 'read': {'id': 'pauri20.line01', 'offset': 0}, 'notes': {'mool.line01': 'ORDINARY-NOTE'}, 'bookmarks': []}), ARCHIVE, KEY, ARCH])
        pg.goto(base + 'full-japji.html', wait_until='networkidle'); time.sleep(1.6)
        pg.mouse.wheel(0, 500); time.sleep(1.3); return c, pg
    for (w, h), mode, size, guide in itertools.product(((320, 568), (375, 667), (390, 844)), ('read', 'meaning', 'study'), (30, 48), (False, True)):
        c, pg = reader(w, h, mode, size)
        if guide: pg.click('#play'); time.sleep(1.8)
        m = pg.evaluate(M); m.update(window=f'{w}x{h}', mode=mode, textSize=size, guideRunning=guide, modeTheReaderIsIn=pg.evaluate("JSON.parse(localStorage.getItem('glp001.continuous.v2')).mode"))
        m['passes'] = bool(m.get('noticePresent') and m['wholeNoticeInsideTheScreen'] and m['buttonWidth'] >= 44 and m['buttonHeight'] >= 44 and m['tapAtButtonCentreReachesTheButton'] and not m['textCutOff'])
        R['combinations'].append(m); c.close()
    ok = [m for m in R['combinations'] if m['passes']]; bad = [m for m in R['combinations'] if not m['passes']]
    R['summary'] = dict(combinations=len(R['combinations']), pass_=len(ok), fail=len(bad), noticeHeights=sorted({m.get('height') for m in R['combinations']}), buttonSizes=sorted({(m.get('buttonWidth'), m.get('buttonHeight')) for m in R['combinations']}), shareOfScreenHeightPercent=sorted({m.get('shareOfScreenHeightPercent') for m in R['combinations']}), failing=[{k: m.get(k) for k in ('window', 'mode', 'textSize', 'guideRunning', 'wholeNoticeInsideTheScreen', 'buttonWidth', 'buttonHeight', 'tapAtButtonCentreReachesTheButton', 'textCutOff', 'top', 'height')} for m in bad][:8])
    print(json.dumps(R['summary'], ensure_ascii=False))
    # ---- tapping it; can it be dismissed; does it ever go away
    c, pg = reader(390, 844, 'read', 30); o = {}
    pg.click('#retained-learning button'); time.sleep(0.6); o['tapOpens'] = pg.evaluate("(document.querySelector('dialog[open] h2, dialog[open] [id$=title]') || {}).textContent || null"); o['keptAsideItemsListedThere'] = pg.evaluate("!!document.querySelector('dialog[open] #retained-learning-items')")
    pg.keyboard.press('Escape'); time.sleep(0.5); o['noticeStillThereAfterViewing'] = pg.evaluate(M).get('noticePresent')
    o['controlsInsideTheNotice'] = pg.evaluate("[...document.querySelectorAll('#retained-learning button, #retained-learning a')].map(e => e.textContent.trim())")
    pg.reload(wait_until='networkidle'); time.sleep(1.5); o['noticeStillThereAfterReopening'] = pg.evaluate(M).get('noticePresent')
    # whether the line being read is clear of the notice is measured properly in rt2_05_place_extras.py (part b2), after a jump and after reopening
    try: o['whatAScreenReaderIsGiven'] = pg.locator('#retained-learning').aria_snapshot()
    except Exception as e: o['whatAScreenReaderIsGiven'] = 'aria snapshot not available: ' + str(e)[:80]
    o['attributes'] = pg.evaluate("(() => { const n = document.getElementById('retained-learning'), p = n.querySelector('p'); return {element: n.tagName.toLowerCase(), label: n.getAttribute('aria-label'), messageRole: p.getAttribute('role'), messageLive: p.getAttribute('aria-live')}; })()")
    R['tapping_and_dismissing'] = o; print(json.dumps(o, ensure_ascii=False)[:900]); c.close()
    # ---- with the test copy's banner on top
    R['with_the_test_banner'] = []
    for (w, h) in ((320, 568), (375, 667), (390, 844)):
        c, pg = reader(w, h, 'read', 30, base=STAGED); m = pg.evaluate(M); ban = pg.evaluate("(() => { const r = document.querySelector('.glp-qa-banner').getBoundingClientRect(); return {top: Math.round(r.top), bottom: Math.round(r.bottom)}; })()")
        m.update(window=f'{w}x{h}', banner=ban, pixelsOfTheNoticeUnderTheBanner=max(0, min(m['top'] + m['height'], ban['bottom']) - max(m['top'], ban['top']))); R['with_the_test_banner'].append(m); c.close()
        print('with banner', m['window'], '| notice', m['top'], 'to', m['top'] + m['height'], '| banner', ban, '| under the banner:', m['pixelsOfTheNoticeUnderTheBanner'], 'px | tap reaches button:', m['tapAtButtonCentreReachesTheButton'], '| on top at notice centre:', m['whatIsOnTopAtTheNoticeCentre'])
    b.close()
json.dump(R, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
