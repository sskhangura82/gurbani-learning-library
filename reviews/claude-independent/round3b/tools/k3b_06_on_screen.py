"""Round 3b / R3-03, R3-04 on screen: what does a reader actually see now?
 A the first screen and its wording            B a passage: what is its name, and where is the editorial title
 C can teaching be mistaken for Gurbani (script, language tag, placement, label)
 D the editorial title found by search still reaches the passage
 E an editorial title written as a Gurbani heading (the one gap the mutations found) — how does it read on screen
Chromium, phone-sized. Emulation only.   Usage: python3 k3b_06_on_screen.py <base-url ending in /> <out.json> <shots dir>"""
import json, sys, time
from playwright.sync_api import sync_playwright
B, OUT, SH = sys.argv[1:4]; R = {'note': 'emulation only (Chromium, 390 x 844)'}
with sync_playwright() as p:
    b = p.chromium.launch(); c = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2); pg = c.new_page()
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:160]))
    pg.goto(B + 'index.html', wait_until='networkidle'); time.sleep(2.0)
    R['A_first_screen'] = dict(status=pg.evaluate("(document.getElementById('status')||{}).textContent"),
        text=pg.evaluate("document.body.innerText.replace(/\\s+/g,' ').slice(0,420)"), pageErrors=errs[:3])
    def search_open(q):
        pg.fill('#query', q); pg.evaluate("document.getElementById('search-form').requestSubmit()"); time.sleep(0.9)
        got = pg.evaluate("[...document.querySelectorAll('#results button.result')].map(b => ({text: b.textContent.trim().slice(0,70), lang: b.getAttribute('lang')}))")
        return got
    R['D_editorial_title_in_search'] = dict(query='Humility beyond appearances', results=search_open('Humility beyond appearances'))
    if R['D_editorial_title_in_search']['results']:
        pg.evaluate("document.querySelector('#results button.result').click()"); time.sleep(1.2)
    R['B_passage_screen'] = pg.evaluate("""(() => { const s = document.getElementById('content');
      const heads = [...s.querySelectorAll('h1,h2,h3')].map(h => ({tag: h.tagName, lang: h.getAttribute('lang'), text: h.textContent.trim().slice(0,60)}));
      const notes = [...s.querySelectorAll('.note')].map(n => ({lang: n.getAttribute('lang'), text: n.textContent.trim().slice(0,90)}));
      const pa = [...s.querySelectorAll('[lang=pa]')].length, all = s.innerText.replace(/\\s+/g,' ');
      return {headings: heads, notes: notes, elementsTaggedPunjabi: pa, firstPartOfScreen: all.slice(0, 420)}; })()""")
    pg.screenshot(path=SH + 'k3b_passage.png', full_page=False)
    R['C_teaching_vs_gurbani'] = pg.evaluate("""(() => { const s = document.getElementById('content');
      const gur = /[\\u0A00-\\u0A7F]/; const out = [];
      for (const n of s.querySelectorAll('p, h1, h2, h3, li, button')) { const t = n.textContent.trim(); if (!t) continue;
        out.push({text: t.slice(0,46), hasGurmukhi: gur.test(t), lang: n.getAttribute('lang'), cls: n.className || null, tag: n.tagName}); }
      return out.slice(0, 26); })()""")
    b.close()
R['E_note'] = 'The mutation harness showed an editorial title may be set to a Gurmukhi heading string; on screen it is drawn after the words "Library topic (editorial): ".'
json.dump(R, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps(R['A_first_screen'], ensure_ascii=False)[:500]); print(); print(json.dumps(R['B_passage_screen'], ensure_ascii=False)[:1400]); print(); print('search:', json.dumps(R['D_editorial_title_in_search'], ensure_ascii=False)[:300])
