"""RT-001 / CI-R-02: is the "kept aside" notice actually visible to a sighted reader, in the situations a returning reader is in?
Usage: python3 rt2b_notice_visibility.py <base-url> <out.json> <label>"""
import json, time, sys
from playwright.sync_api import sync_playwright
B, OUT, LABEL = sys.argv[1], sys.argv[2], sys.argv[3]
SHOTS = '/home/claude/work/shots/'
KEPT = {'notes': {'nope.line99': 'KEEP-ME'}, 'bookmarks': ['nope.line98']}
SEEDS = {
    'returning_reader_at_the_start': dict(version=2, **KEPT),
    'returning_reader_resuming_at_pauri_20': dict(version=2, read={'id': 'pauri20.line01', 'offset': 0}, **KEPT),
    'returning_reader_resuming_at_pauri_2': dict(version=2, read={'id': 'pauri02.line01', 'offset': 0}, **KEPT),
}
GEO = '''() => { const n = document.getElementById('retained-learning'); if (!n) return {noticeInPage: false};
  const b = n.getBoundingClientRect(), btn = n.querySelector('button'), bb = btn.getBoundingClientRect(); const cx = bb.left + bb.width / 2, cy = bb.top + bb.height / 2;
  const at = (cx >= 0 && cy >= 0 && cx <= innerWidth && cy <= innerHeight) ? document.elementFromPoint(cx, cy) : null;
  const inView = b.bottom > 0 && b.top < innerHeight; const big = b.width >= 40 && b.height >= 20;
  return {noticeInPage: true, hiddenAttribute: n.hidden, immersiveMode: document.body.classList.contains('quiet-reading'), pageScrolledTo: Math.round(scrollY), noticeWidthPx: Math.round(b.width), noticeHeightPx: Math.round(b.height),
          noticeTopRelativeToScreen: Math.round(b.top), insideTheScreen: inView, drawnAtReadableSize: big, buttonCanBeTapped: !!(at && (at === btn || btn.contains(at))),
          aSightedReaderCanSeeIt: !n.hidden && inView && big, text: n.innerText.replace(/\\s+/g, ' ').trim().slice(0, 90)}; }'''
R = {'label': LABEL, 'base': B, 'situations': {}}
with sync_playwright() as p:
    b = p.chromium.launch(); d = dict(p.devices['iPhone 14']); d['service_workers'] = 'block'
    for name, seed in SEEDS.items():
        c = b.new_context(**d); pg = c.new_page(); o = {}
        pg.goto(B + 'index.html'); pg.evaluate('([v]) => localStorage.setItem("glp001.continuous.v2", v)', [json.dumps(seed)])
        pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.6)
        o['when_the_reader_opens'] = pg.evaluate(GEO); pg.screenshot(path=f"{SHOTS}rt2b_{LABEL}_{name}_on_open.png")
        o['spoken_status_line_on_open'] = pg.evaluate("(document.getElementById('status') || {}).textContent || ''")
        pg.touchscreen.tap(195, 300) if False else None
        pg.mouse.wheel(0, 500); time.sleep(0.8); o['after_scrolling_down_a_little'] = pg.evaluate(GEO)
        pg.evaluate('window.scrollTo(0, 0)'); time.sleep(0.8); o['after_scrolling_back_to_the_very_top'] = pg.evaluate(GEO); pg.screenshot(path=f"{SHOTS}rt2b_{LABEL}_{name}_back_at_top.png")
        # where else is the reader told? the saved-learning screen, reached through the tools
        pg.click('#tools-open'); time.sleep(0.3)
        o['tools_menu_mentions_kept_aside_items'] = pg.evaluate("/kept aside|needs recovery|saved items/i.test(document.getElementById('reader-dialog').innerText)")
        pg.locator('#reader-dialog [data-action="reader-explore"]').click(); time.sleep(0.3)
        o['explore_menu_mentions_kept_aside_items'] = pg.evaluate("/kept aside|needs recovery|saved items/i.test(document.getElementById('reader-dialog').innerText)")
        pg.locator('#reader-dialog [data-action="learning"]').click(); time.sleep(0.4)
        o['saved_learning_screen_shows_kept_aside_items'] = pg.evaluate("!!document.getElementById('retained-learning-items')")
        o['taps_from_reading_to_the_kept_aside_items'] = 3
        pg.screenshot(path=f"{SHOTS}rt2b_{LABEL}_{name}_saved_learning_screen.png")
        R['situations'][name] = o; c.close()
        print(name)
        for k in ('when_the_reader_opens', 'after_scrolling_down_a_little', 'after_scrolling_back_to_the_very_top'):
            v = o[k]; print('   ', k.ljust(38), '| sighted reader can see it:', v.get('aSightedReaderCanSeeIt'), '| immersive:', v.get('immersiveMode'), '| scrolled to', v.get('pageScrolledTo'), '| notice', v.get('noticeWidthPx'), 'x', v.get('noticeHeightPx'), 'px at', v.get('noticeTopRelativeToScreen'), '| tappable:', v.get('buttonCanBeTapped'))
        print('    status line on open:', repr(o['spoken_status_line_on_open'][:80]), '| tools menu mentions:', o['tools_menu_mentions_kept_aside_items'], '| explore menu mentions:', o['explore_menu_mentions_kept_aside_items'], '| saved-learning screen shows items:', o['saved_learning_screen_shows_kept_aside_items'])
    b.close()
json.dump(R, open(OUT, 'w'), ensure_ascii=False, indent=1)
