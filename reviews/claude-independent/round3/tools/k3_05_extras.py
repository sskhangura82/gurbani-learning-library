"""Round 3 · three follow-up measurements on PR #45 (same local copy, headless Chromium):
 (1) does text follow the reader's own text-size setting, (2) a closing ॥ left alone on a visual line, (3) the pages for an author and a Raag.
Usage: python3 k3_05_extras.py <base-url ending in /> <out.json> <shots dir>"""
import json, sys, time
from playwright.sync_api import sync_playwright
B, OUT, SH = sys.argv[1:4]; U = B + 'knowledge/index.html'; R = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    def page(w=390, h=844, **kw):
        c = b.new_context(viewport={'width': w, 'height': h}, service_workers='block', reduced_motion='reduce', **kw); pg = c.new_page(); pg.goto(U, wait_until='networkidle'); pg.wait_for_function("document.getElementById('status').textContent.indexOf('Checking') < 0"); time.sleep(0.15); return c, pg
    def find(pg, q): pg.fill('#query', q); pg.click('#search-button'); time.sleep(0.12)
    def first(pg, t): pg.evaluate("([t]) => [...document.querySelectorAll('#results button')].find(x => x.textContent.startsWith(t)).click()", [t]); time.sleep(0.15)
    SIZES = '''() => { const px = s => { const e = document.querySelector(s); return e ? parseFloat(getComputedStyle(e).fontSize) : null; };
       return {lessonEnglish: px('#content > p:not([class])'), lessonPunjabi: px('#content > p.pa'), note: px('#content .note'), label: px('#content .kicker'), button: px('#content button'), searchBox: px('#query'), gurbani: px('#content .pankti')}; }'''
    # (1) reader's default text size doubled (root font size 32px stands in for the browser's own setting)
    c, pg = page(); a = pg.evaluate(SIZES); find(pg, '470'); first(pg, 'Humility beyond'); a['gurbani'] = pg.evaluate(SIZES)['gurbani']; c.close()
    c, pg = page(); pg.evaluate("document.documentElement.style.fontSize = '200%'"); time.sleep(0.1); d = pg.evaluate(SIZES); find(pg, '470'); first(pg, 'Humility beyond'); d['gurbani'] = pg.evaluate(SIZES)['gurbani']; c.close()
    R['text_size_setting'] = {k: dict(atDefault=a[k], whenReaderDoubles=d[k], follows=bool(a[k] and d[k] and d[k] > a[k] * 1.5)) for k in a}
    # (2) a closing mark alone on a visual line, by width
    alone = {}
    for w in (320, 360, 375, 390, 412, 430, 768, 1280):
        c, pg = page(w, 900); rows = []
        for q, t in (('470', 'Humility beyond'), ('466', 'Understanding Haumai'), ('1364', 'Turning criticism')):
            find(pg, q); first(pg, t)
            rows += pg.evaluate('''() => [...document.querySelectorAll('#content .pankti')].map(p => { const r = document.createRange(); const nodes = []; const tw = document.createTreeWalker(p, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) nodes.push(n);
                 const last = nodes[nodes.length - 1]; const txt = last.textContent; const i = txt.lastIndexOf('॥', txt.search(/॥[^॥]*$/) >= 0 ? txt.length : 0); const start = txt.search(/॥[੦-੯॥]*\\s*$/); if (start < 0) return null;
                 r.setStart(last, start); r.setEnd(last, txt.length); const markTop = r.getBoundingClientRect().top;
                 // the word before the mark
                 const words = []; for (const nd of nodes) { const re = /[^\\s॥]+/g; let m; while ((m = re.exec(nd.textContent))) { if (nd === last && m.index >= start) break; const rr = document.createRange(); rr.setStart(nd, m.index); rr.setEnd(nd, m.index + m[0].length); words.push(rr.getBoundingClientRect().top); } }
                 const lines = new Set(words.map(t => Math.round(t / 4))).size; return {text: p.textContent, markAlone: words.length > 0 && Math.abs(words[words.length - 1] - markTop) > 8, visualLines: lines + (words.length > 0 && Math.abs(words[words.length - 1] - markTop) > 8 ? 1 : 0)}; }).filter(Boolean)''')
        alone[w] = dict(rows=len(rows), closingMarkAlone=[r['text'] for r in rows if r['markAlone']], rowsOnOneLine=sum(1 for r in rows if r['visualLines'] == 1)); c.close()
    R['closing_mark_alone_on_a_line'] = alone
    # (3) author and Raag pages
    c, pg = page(); pages = {}
    for q, t in (('nanak', 'Guru Nanak Dev Ji'), ('angad', 'Guru Angad Dev Ji'), ('kabir', 'Bhagat Kabir Ji'), ('asa', 'Raag Asa'), ('asa di vaar', 'Asa Di Vaar'), ('kabir saloks', 'Salok Bhagat Kabir Ji')):
        find(pg, q); first(pg, t); pages[t] = [x for x in pg.evaluate("document.getElementById('content').innerText").split('\n') if x]
        if t == 'Guru Nanak Dev Ji': pg.evaluate("document.getElementById('content').scrollIntoView()"); pg.screenshot(path=SH + 'k_author_page_phone.png')
    R['author_raag_composition_pages'] = pages
    # two identical buttons under "Start exploring"
    R['start_exploring_buttons'] = pg.evaluate("[...document.querySelectorAll('#browse button')].map(b => b.textContent)"); c.close(); b.close()
json.dump(R, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps(R['text_size_setting'])); 
for w, v in R['closing_mark_alone_on_a_line'].items(): print(w, 'rows', v['rows'], 'on one line', v['rowsOnOneLine'], 'mark alone:', len(v['closingMarkAlone']), v['closingMarkAlone'][:2])
for k, v in R['author_raag_composition_pages'].items(): print(k, '::', v)
print(R['start_exploring_buttons'])
