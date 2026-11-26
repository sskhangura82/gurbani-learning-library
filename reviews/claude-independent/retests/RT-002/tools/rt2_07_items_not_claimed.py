"""RT-002: the two items of the owner's list that this candidate does not claim — CI-S-16 and R2-X-04 — measured anyway.
 R2-X-04: a reader whose saved place is in Ashtpadi 3 opens Sukhmani Sahib by a link to Ashtpadi 17. Is the saved place kept?
          (Same steps as round 2, part G2; the link is opened directly because this branch has no Explorer.)
 CI-S-16: is the file that holds the 31 lines outside the readers changed at all between the two candidates?
Chromium, 390 x 664 window.   Usage: python3 rt2_07_items_not_claimed.py <base-url> <repo> <old commit> <new commit> <out.json>"""
import json, subprocess, sys, time
from playwright.sync_api import sync_playwright
B, REPO, OLD, NEW, OUT = sys.argv[1:6]; R = {'note': 'emulation only (Chromium)'}
REC = "(() => { const o = {}; for (const k of Object.keys(localStorage)) { try { const v = JSON.parse(localStorage.getItem(k)); o[k] = {read: v.read || v.position || v.last || null}; } catch (e) { o[k] = localStorage.getItem(k).slice(0, 60); } } return o; })()"
LABEL = "(document.getElementById('sk-position') || {}).innerText || null"
with sync_playwright() as p:
    b = p.chromium.launch(); c = b.new_context(viewport={'width': 390, 'height': 664}, service_workers='block'); pg = c.new_page()
    pg.goto(B + 'sukhmani.html', wait_until='networkidle'); time.sleep(1.5)
    pg.evaluate("document.querySelector('#ashtpadi-nav a:nth-child(3)').click()"); time.sleep(1.5); pg.mouse.wheel(0, 600); time.sleep(1.8)
    before, label_before = pg.evaluate(REC), pg.evaluate(LABEL)
    pg.goto(B + 'index.html', wait_until='networkidle'); time.sleep(0.4); pg.goto(B + 'sukhmani.html#ashtpadi-17', wait_until='networkidle'); time.sleep(2.5)
    after, label_after = pg.evaluate(REC), pg.evaluate(LABEL); offered = pg.evaluate("[...document.querySelectorAll('button, a')].filter(e => e.getBoundingClientRect().height > 0 && /return to|resume|back to (your|ashtpadi)|continue (from|where)/i.test(e.textContent)).map(e => e.textContent.trim().slice(0, 60))")
    pg.goto(B + 'index.html', wait_until='networkidle'); time.sleep(0.4); pg.goto(B + 'sukhmani.html', wait_until='networkidle'); time.sleep(2.5)
    R['R2-X-04'] = dict(placeBefore=label_before, savedBefore=before, placeOnArrivalByLink=label_after, savedOnArrivalByLink=after, savedPlaceKeptOnArrival=before == after, wayBackOffered=offered, placeWhenOpenedTheOrdinaryWayAfterwards=pg.evaluate(LABEL), savedAfterwards=pg.evaluate(REC))
    b.close()
diff = subprocess.run(['git', '-C', REPO, 'diff', '--name-only', OLD, NEW, '--', 'js/content.js', 'pauri-2-lesson.html', 'simran.html', 'js/japji-lessons.js'], capture_output=True, text=True).stdout.split()
R['CI-S-16'] = dict(filesHoldingTheLinesOutsideTheReaders=['js/content.js', 'pauri-2-lesson.html', 'simran.html', 'js/japji-lessons.js'], changedBetweenTheTwoCandidates=diff, verdict='not attempted in this candidate: the files are unchanged, so the two lines differ from the reference exactly as before' if not diff else 'changed: compare again')
print(json.dumps(R, ensure_ascii=False, indent=1)[:1800]); json.dump(R, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
