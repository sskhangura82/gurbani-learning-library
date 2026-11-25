"""U-09 bookmark discoverability · U-15 provenance reachability · Sukhmani Ang label clipping. Headless Chromium."""
import json, sys, time
sys.path.insert(0, '/home/claude/work/tools')
from pw_common import *
out = {}
VISIBLE = '''() => [...document.querySelectorAll('button,a,[role=button],summary')].filter(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0 && cs.visibility !== 'hidden' }).map(e => (e.getAttribute('aria-label') || e.innerText || '').replace(/\\s+/g, ' ').trim().slice(0, 70)).filter(Boolean)'''
with sync_playwright() as p:
    s = Session(p, device=None, viewport={'width': 320, 'height': 568}); pg = s.page
    pg.goto(BASE + 'sukhmani.html', wait_until='networkidle'); time.sleep(1.0)
    pg.evaluate('''() => { const e = document.querySelector('.ang-label'); e && e.scrollIntoView({block: 'center'}) }'''); time.sleep(0.5)
    out['sukhmani_ang_label_320'] = pg.evaluate('''() => { const e = document.querySelector('.ang-label'); const r = e.getBoundingClientRect(); return {text: e.textContent, left: r.left, right: r.right, fontPx: getComputedStyle(e).fontSize, clippedPx: Math.max(0, -r.left)} }''')
    s.shot('64_sukhmani_ang_label_320'); s.close()

    s = Session(p); pg = s.page
    # U-09: is there any visible "save this line" affordance while reading, before opening any menu?
    for name, url in (('nitnem-jaap', 'nitnem/index.html?bani=jaap'), ('japji', 'full-japji.html'), ('sukhmani', 'sukhmani.html')):
        pg.goto(BASE + url, wait_until='networkidle'); time.sleep(1.0)
        pg.mouse.wheel(0, 1200); time.sleep(0.6)
        vis = pg.evaluate(VISIBLE)
        hit = [v for v in vis if any(w in v.lower() for w in ('save', 'bookmark', 'keep', 'mark this'))]
        out.setdefault('U09_visible_save_controls_while_reading', {})[name] = {'visibleControls': len(vis), 'mentionSaveOrBookmark': hit[:5]}
    # Nitnem: path to save a line
    pg.goto(BASE + 'nitnem/index.html?bani=jaap', wait_until='networkidle'); time.sleep(1.0)
    pg.click('#reading-tools'); time.sleep(0.5)
    out['U09_nitnem_tools_dialog'] = {'bookmarkLabel': pg.inner_text('#bookmark'), 'currentLabel': pg.inner_text('#tools-current')[:120]}
    pg.keyboard.press('Escape')
    # Sukhmani / Japji: what happens when a line is tapped
    pg.goto(BASE + 'sukhmani.html', wait_until='networkidle'); time.sleep(1.0)
    pg.click('#sukhmani-text [data-line-id] >> nth=3'); time.sleep(0.6)
    out['U09_sukhmani_tap_line'] = {'dialogOpen': pg.evaluate('!!document.querySelector("dialog[open]")'), 'dialogButtons': pg.evaluate('''() => [...document.querySelectorAll('dialog[open] button')].map(b => (b.getAttribute('aria-label') || b.innerText).trim().slice(0, 50))''')[:12]}
    pg.keyboard.press('Escape')
    pg.goto(BASE + 'full-japji.html', wait_until='networkidle'); time.sleep(1.0)
    pg.click('#continuous-reader article.scripture-line >> nth=3'); time.sleep(0.6)
    out['U09_japji_tap_line'] = {'dialogOpen': pg.evaluate('!!document.querySelector("dialog[open]")'), 'dialogButtons': pg.evaluate('''() => [...document.querySelectorAll('dialog[open] button')].map(b => (b.getAttribute('aria-label') || b.innerText).trim().slice(0, 50))''')[:12]}
    pg.keyboard.press('Escape')
    # U-15: where does the text come from / what does draft mean — visible wording and taps
    for name, url, opener in (('nitnem-jaap', 'nitnem/index.html?bani=jaap', None), ('japji', 'full-japji.html', '#coverage-open'), ('sukhmani', 'sukhmani.html', '#sources-open')):
        pg.goto(BASE + url, wait_until='networkidle'); time.sleep(1.0)
        rec = {}
        if opener:
            pg.click(opener); time.sleep(0.6)
            body = pg.inner_text('dialog[open]')
            rec = {'tapsFromReaderTop': 1, 'chars': len(body), 'mentionsSourceName': [w for w in ('Open Granth', 'Shabad OS', 'BaniDB', 'SriGranth', 'SGPC', 'Sahib Singh') if w in body], 'explainsDraft': ('draft' in body.lower()), 'first300': body[:300].replace('\n', ' ')}
        else:
            body = pg.inner_text('#source-lineage') if pg.query_selector('#source-lineage') else ''
            vis = pg.evaluate('''() => { const e = document.querySelector('#source-lineage'); if (!e) return null; const r = e.getBoundingClientRect(); return {top: Math.round(r.top + scrollY), height: Math.round(r.height), open: e.open === undefined ? null : e.open, tag: e.tagName} }''')
            rec = {'element': vis, 'chars': len(body), 'mentionsSourceName': [w for w in ('Open Granth', 'Shabad OS', 'BaniDB', 'SriGranth', 'SGPC', 'Sahib Singh') if w in body], 'explainsDraft': ('draft' in (pg.inner_text('#learning-status') + body).lower()), 'first300': body[:300].replace('\n', ' ')}
        out.setdefault('U15_provenance', {})[name] = rec
    s.close()
json.dump(out, open('/home/claude/work/u09_u15.json', 'w'), indent=1, ensure_ascii=False)
print(json.dumps(out, indent=1, ensure_ascii=False)[:6000])
