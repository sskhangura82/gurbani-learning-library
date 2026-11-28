"""RT-001 scope note: the repair candidate adds two kinds of wording — "AI-assisted educational draft" and "awaiting comparison with a
named printed edition". Where does each appear, and can a sighted reader see it? Phone emulation; strict on-screen test.
Usage: python3 rt5_disclosures_visible.py <base-url> <out.json>"""
import json, sys, time
from playwright.sync_api import sync_playwright
B, OUT = sys.argv[1], sys.argv[2]
FIND = '''([pattern]) => { const re = new RegExp(pattern, 'i'); const seen = e => { if (!e || e.hidden || e.closest('[hidden]')) return false; const b = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    return b.width >= 40 && b.height >= 10 && cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.05; };
  const onScreen = e => { const b = e.getBoundingClientRect(); return b.bottom > 0 && b.top < innerHeight; };
  return [...document.querySelectorAll('body *')].filter(e => re.test(e.textContent || '') && [...e.children].every(c => !re.test(c.textContent || ''))).map(e => ({where: e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.className ? '.' + String(e.className).split(' ')[0] : ''),
     drawn: seen(e), onScreenNow: seen(e) && onScreen(e), insideClosedSection: !!e.closest('details:not([open])'), text: (e.textContent.match(new RegExp('[^.]*(' + pattern + ')[^.]*\\\\.?', 'i')) || [''])[0].trim().slice(0, 130)})); }'''
R = {}
with sync_playwright() as p:
    b = p.chromium.launch(); d = dict(p.devices['iPhone 14']); d['service_workers'] = 'block'; c = b.new_context(**d); pg = c.new_page()
    def rec(key, pattern): R[key] = pg.evaluate(FIND, [pattern]); print(key, '|', json.dumps(R[key], ensure_ascii=False)[:700])
    pg.goto(B + 'nitnem/index.html', wait_until='networkidle'); time.sleep(0.8); rec('nitnem library page: "AI-assisted"', 'AI-assisted')
    for bani in ('savaiye', 'chaupai', 'rehras', 'jaap'):
        pg.goto(B + f'nitnem/index.html?bani={bani}', wait_until='networkidle'); time.sleep(1.3)
        if pg.evaluate('document.querySelector("#reader").hidden'): pg.click(f'button[data-open="{bani}"]'); time.sleep(1.2)
        rec(f'nitnem {bani} reader on open: "awaiting comparison"', 'awaiting comparison'); 
        if bani == 'savaiye': pg.screenshot(path='/home/claude/work/shots/rt5_pr40_savaiye_on_open.png'); rec('nitnem savaiye reader on open: "AI-assisted"', 'AI-assisted')
    pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.3); rec('japji reader, new reader, on open: "AI-assisted"', 'AI-assisted')
    pg.click('.modes button[data-depth="understand"]'); time.sleep(1.0); rec('japji reader, Meaning view: "AI-assisted"', 'AI-assisted'); pg.screenshot(path='/home/claude/work/shots/rt5_pr40_japji_meaning_view.png')
    pg.goto(B + 'sukhmani.html', wait_until='networkidle'); time.sleep(2.2); rec('sukhmani reader on open: "AI-assisted"', 'AI-assisted')
    pg.click('.modes button[data-depth="understand"]'); time.sleep(1.5); rec('sukhmani reader, Meaning view: "AI-assisted"', 'AI-assisted')
    b.close()
json.dump(R, open(OUT, 'w'), ensure_ascii=False, indent=1)
