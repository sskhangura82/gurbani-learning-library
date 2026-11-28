"""D-02, D-05, D-06 and R-04 on the Nitnem reader. Synthetic data only."""
import json, sys, os, tempfile, hashlib
sys.path.insert(0, '/home/claude/work/tools')
from pw_common import *
R = {}
KP = 'glp001.nitnem.PRIVATE-SOURCE-REVIEW.v1.'
pack = json.load(open('/home/claude/site/gurbani-learning-library/nitnem/data/sohila.json', encoding='utf-8'))
ED = pack['editionId']; PREV = pack['previousEditionIds']
print('sohila edition', ED, '| previous', PREV)
def visible_text(pg): return pg.evaluate('''() => [...document.querySelectorAll('[role=status],[role=alert],.review-mode,#learning-status,#collection-status,.candidate-banner')].filter(e=>!e.hidden&&e.offsetParent!==null).map(e=>e.innerText.trim()).filter(Boolean)''')
def open_sohila(pg):
    pg.goto(BASE + 'nitnem/index.html', wait_until='networkidle'); pg.click('button[data-open="sohila"]'); pg.wait_for_load_state('networkidle'); time.sleep(0.8)
def mk(edition, notes, rev=3, extra=None):
    r = {'schema': 1, 'compositionId': 'sohila', 'editionId': edition, 'rev': rev, 'savedAt': '2026-10-26T00:00:00.000Z', 'payload': {'notes': notes, 'bookmarks': ['sohila02.line03'], 'lineId': 'sohila03.line05', 'size': 36, 'theme': 'day', 'pace': 70, 'mode': 'read', 'view': 'continuous'}}
    if extra: r.update(extra)
    return json.dumps(r, ensure_ascii=False)
def fresh(p, **kw): 
    s = Session(p, **kw); return s, s.page
with sync_playwright() as p:
    # --- D-02a: record saved under a documented previous edition id
    s, pg = fresh(p); pg.goto(BASE + 'nitnem/index.html', wait_until='networkidle')
    pg.evaluate('([k,v]) => localStorage.setItem(k,v)', [KP + 'sohila.' + PREV[0], mk(PREV[0], {'sohila02.line03': 'OLD-EDITION-NOTE'})])
    open_sohila(pg)
    pg.click('#reading-tools'); time.sleep(0.3); pg.click('#saved-lines summary'); time.sleep(0.3)
    R['D-02a_previous_edition'] = dict(saved_list=pg.inner_text('#saved-list')[:200], size_value=pg.inner_text('#size-value'), messages=visible_text(pg)[:5], keys=pg.evaluate('Object.keys(localStorage)'))
    print('D-02a', json.dumps(R['D-02a_previous_edition'], ensure_ascii=False)); s.close()
    # --- D-02b: record saved under an edition id the new reader does not list
    s, pg = fresh(p); pg.goto(BASE + 'nitnem/index.html', wait_until='networkidle')
    pg.evaluate('([k,v]) => localStorage.setItem(k,v)', [KP + 'sohila.some-earlier-edition-20261001', mk('some-earlier-edition-20261001', {'sohila02.line03': 'ORPHAN-NOTE'})])
    open_sohila(pg)
    pg.click('#reading-tools'); time.sleep(0.3); pg.click('#saved-lines summary'); time.sleep(0.3)
    R['D-02b_unlisted_edition'] = dict(saved_list=pg.inner_text('#saved-list')[:200], messages=visible_text(pg)[:5], any_mention_of_older_record='ORPHAN' in pg.inner_text('body') or 'earlier' in pg.inner_text('#tools-dialog').lower() or 'recover' in pg.inner_text('#tools-dialog').lower(), keys=pg.evaluate('Object.keys(localStorage)'))
    print('D-02b', json.dumps(R['D-02b_unlisted_edition'], ensure_ascii=False)); s.close()
    # --- D-02c: current-edition record containing a note on a line id that no longer exists (simulates re-division of lines)
    s, pg = fresh(p); pg.goto(BASE + 'nitnem/index.html', wait_until='networkidle')
    pg.evaluate('([k,v]) => localStorage.setItem(k,v)', [KP + 'sohila.' + ED, mk(ED, {'sohila02.line99': 'NOTE-ON-REMOVED-LINE', 'sohila01.line02': 'GOOD-NOTE'})])
    open_sohila(pg); s.shot('51_d02c_removed_line')
    body = pg.inner_text('body')
    R['D-02c_note_on_missing_line'] = dict(messages=visible_text(pg)[:6], reader_usable=pg.evaluate('document.querySelectorAll("#source-unit .scripture-line").length'), good_note_reachable='GOOD-NOTE' in body, recovery_offered=[b for b in pg.evaluate('[...document.querySelectorAll("button")].filter(b=>b.offsetParent!==null).map(b=>b.innerText.trim())') if 'recover' in b.lower() or 'download' in b.lower() or 'original' in b.lower()], raw_preserved=pg.evaluate('([k]) => localStorage.getItem(k)', [KP + 'sohila.' + ED]) is not None)
    print('D-02c', json.dumps(R['D-02c_note_on_missing_line'], ensure_ascii=False)); 
    # can the reader still save a new bookmark in this state?
    pg.click('#reading-tools'); time.sleep(0.3)
    R['D-02c_note_on_missing_line']['tools_state'] = dict(bookmark_disabled=pg.evaluate('document.querySelector("#bookmark").disabled'), note_disabled=pg.evaluate('document.querySelector("#note").disabled'), export_disabled=pg.evaluate('document.querySelector("#export-learning").disabled'), tools_text=pg.inner_text('#tools-dialog')[:1500])
    s.shot('52_d02c_tools')
    R['D-02c_note_on_missing_line']['after_bookmark_attempt'] = dict(status=visible_text(pg)[:6], raw_unchanged=json.loads(pg.evaluate('([k]) => localStorage.getItem(k)', [KP + 'sohila.' + ED]))['payload']['notes'].get('sohila02.line99') == 'NOTE-ON-REMOVED-LINE')
    print('   after bookmark attempt', json.dumps(R['D-02c_note_on_missing_line']['after_bookmark_attempt'], ensure_ascii=False)); s.close()
    # --- corrupted JSON record
    s, pg = fresh(p); pg.goto(BASE + 'nitnem/index.html', wait_until='networkidle')
    pg.evaluate('([k,v]) => localStorage.setItem(k,v)', [KP + 'sohila.' + ED, '{"schema":1,"compositionId":"sohila","editionId":"' + ED + '","rev":3,"payload":{"notes":{"sohila01.line01":"TRUNCATED'])
    open_sohila(pg)
    R['D-corrupt_record'] = dict(messages=visible_text(pg)[:6], lines_rendered=pg.evaluate('document.querySelectorAll("#source-unit .scripture-line").length'), raw_preserved=pg.evaluate('([k]) => localStorage.getItem(k)', [KP + 'sohila.' + ED]).endswith('TRUNCATED'), page_errors=s.errors)
    pg.click('#reading-tools'); time.sleep(0.3); R['D-corrupt_record']['tools_text_tail'] = pg.inner_text('#tools-dialog')[-600:]
    print('D-corrupt', json.dumps(R['D-corrupt_record'], ensure_ascii=False)); s.close()
    # --- D-05 two tabs
    s, pg = fresh(p); open_sohila(pg)
    pg2 = s.ctx.new_page(); s.attach(pg2); open_sohila(pg2)
    pg.click('#reading-tools'); time.sleep(0.3); pg.fill('#note', 'TAB-ONE-NOTE'); 
    pg2.click('#reading-tools'); time.sleep(0.3)
    t2_editable = pg2.evaluate('!document.querySelector("#note").disabled && !document.querySelector("#note").readOnly')
    t2_msg = pg2.inner_text('#save-status')
    try: pg2.fill('#note', 'TAB-TWO-NOTE', timeout=2000); pg2.click('#save-note', timeout=2000)
    except Exception as e: t2_err = str(e)[:120]
    else: t2_err = None
    time.sleep(0.5); pg.click('#save-note'); time.sleep(0.6)
    rec = json.loads(pg.evaluate('([k]) => localStorage.getItem(k)', [KP + 'sohila.' + ED]) or 'null')
    R['D-05_two_tabs'] = dict(tab2_note_field_editable=t2_editable, tab2_status=t2_msg, tab2_error=t2_err, tab2_status_after=pg2.inner_text('#save-status'), tab1_status=pg.inner_text('#save-status'), final_note=(rec or {}).get('payload', {}).get('notes'))
    print('D-05', json.dumps(R['D-05_two_tabs'], ensure_ascii=False)); s.close()
    # --- D-06 storage refuses writes; and no Web Locks
    s, pg = fresh(p); pg.add_init_script('(() => { const o = Storage.prototype.setItem; Storage.prototype.setItem = function(k,v){ if(String(k).includes("PRIVATE-SOURCE-REVIEW")) throw new DOMException("quota","QuotaExceededError"); return o.call(this,k,v); }; })()')
    open_sohila(pg); pg.click('#reading-tools'); time.sleep(0.3); pg.fill('#note', 'WILL-NOT-FIT'); pg.click('#save-note'); time.sleep(0.6)
    R['D-06_quota'] = dict(save_status=pg.inner_text('#save-status'), note_field_still_has_text=pg.input_value('#note'), messages=visible_text(pg)[:5], page_errors=s.errors)
    print('D-06 quota', json.dumps(R['D-06_quota'], ensure_ascii=False)); s.close()
    s, pg = fresh(p); pg.add_init_script('Object.defineProperty(Navigator.prototype, "locks", {get(){ return undefined }})')
    open_sohila(pg); pg.click('#reading-tools'); time.sleep(0.3)
    note_disabled = pg.evaluate('document.querySelector("#note").disabled')
    try: pg.fill('#note', 'NO-LOCKS', timeout=1500); pg.click('#save-note', timeout=1500)
    except Exception as e: pass
    time.sleep(0.5)
    R['D-06_no_weblocks'] = dict(note_disabled=note_disabled, save_status=pg.inner_text('#save-status'), messages=visible_text(pg)[:6], position_saved=pg.evaluate('Object.keys(localStorage).filter(k=>k.includes("sohila")).length'))
    print('D-06 no locks', json.dumps(R['D-06_no_weblocks'], ensure_ascii=False)); s.close()
json.dump(R, open('/home/claude/work/d_tests_nitnem2.json', 'w'), ensure_ascii=False, indent=1)
