"""Check on one of this reviewer's own earlier statements: is the Nitnem reader's "saved learning was kept unchanged" warning really visible
to a sighted reader? (The first review listed page text with a helper that could not tell visible text from text clipped to one pixel.)
Usage: python3 rt2g_nitnem_warning_visible.py <base-url> <site-root> <out.json> <label>"""
import json, sys, time
from playwright.sync_api import sync_playwright
B, SITE, OUT, LABEL = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
pack = json.load(open(SITE + 'nitnem/data/sohila.json', encoding='utf-8')); ED = pack['editionId']; KP = 'glp001.nitnem.PRIVATE-SOURCE-REVIEW.v1.'
rec = json.dumps({'schema': 1, 'compositionId': 'sohila', 'editionId': ED, 'rev': 3, 'savedAt': '2026-10-26T00:00:00.000Z', 'payload': {'notes': {'sohila02.line99': 'NOTE-ON-REMOVED-LINE', 'sohila01.line02': 'GOOD-NOTE'}, 'bookmarks': ['sohila02.line03'], 'lineId': 'sohila03.line05', 'size': 36, 'theme': 'day', 'pace': 70, 'mode': 'read', 'view': 'continuous'}})
VIS = '''() => { const seen = e => { if (!e || e.hidden) return false; const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return b.width >= 40 && b.height >= 12 && b.bottom > 0 && b.top < innerHeight && cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.05; };
  const hits = [...document.querySelectorAll('body *')].filter(e => /kept unchanged|outside this edition|recovery copy|Saving is paused/i.test(e.textContent || '') && [...e.children].every(c => !/kept unchanged|outside this edition|recovery copy|Saving is paused/i.test(c.textContent || '')));
  return hits.map(e => ({where: e.tagName + (e.id ? '#' + e.id : '') + (e.className ? '.' + String(e.className).split(' ')[0] : ''), visibleToSighted: seen(e), box: (b => [Math.round(b.width), Math.round(b.height), Math.round(b.top)])(e.getBoundingClientRect()), text: e.textContent.trim().slice(0, 110)})); }'''
with sync_playwright() as p:
    b = p.chromium.launch(); d = dict(p.devices['iPhone 14']); d['service_workers'] = 'block'; c = b.new_context(**d); pg = c.new_page()
    pg.goto(B + 'nitnem/index.html', wait_until='networkidle'); pg.evaluate('([k, v]) => localStorage.setItem(k, v)', [KP + 'sohila.' + ED, rec])
    pg.goto(B + 'nitnem/index.html', wait_until='networkidle'); pg.click('button[data-open="sohila"]'); time.sleep(1.5)
    R = {'label': LABEL, 'on_open': pg.evaluate(VIS)}; pg.screenshot(path=f'/home/claude/work/shots/rt2g_{LABEL}_nitnem_warning_on_open.png')
    pg.mouse.wheel(0, 700); time.sleep(1.2); R['after_scrolling'] = pg.evaluate(VIS)
    pg.screenshot(path=f'/home/claude/work/shots/rt2g_{LABEL}_nitnem_warning_after_scroll.png'); b.close()
json.dump(R, open(OUT, 'w'), ensure_ascii=False, indent=1); print(LABEL, json.dumps(R, ensure_ascii=False)[:1400])
