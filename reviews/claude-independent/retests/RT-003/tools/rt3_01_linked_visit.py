"""RT-003 / R2-X-04: does opening Sukhmani Sahib by a link leave the reader's saved place alone?
Frozen checks a–d (RT-002 criteria file), plus what a careful reader would try next:
 A arrive by a link to Ashtpadi 17 with a saved place in Ashtpadi 3      B read on during the visit (every storage write is logged)
 C write a note during the visit                                          D "Return to saved place"
 E "Use this as my reading place"                                         F close, open the ordinary way
 G reload and Back during a visit; Back out of the link inside the page   H links to a single line, to a unit, and a link that does not exist
 I two tabs: one reading on, one visiting                                 J a first-time reader arriving by link
 K the visit notice at three phone widths                                 M a link into Japji Sahib
 N ordinary reading with no link: is the place still saved as before
Chromium, made-up notes only. Emulation only.   Usage: python3 rt3_01_linked_visit.py <base-url> <out.json>"""
import json, sys, time
from playwright.sync_api import sync_playwright
B, OUT = sys.argv[1:3]; KEY = 'glp001.sukhmani.v1'; R = {'note': 'emulation only (Chromium); made-up notes only'}
LOG = "window.__writes = []; const _s = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { try { if (k === 'glp001.sukhmani.v1') window.__writes.push({ms: Math.round(performance.now()), read: JSON.parse(v).read}); } catch (e) {} return _s.call(this, k, v); };"
S = """(() => { let rec = null; try { rec = JSON.parse(localStorage.getItem('glp001.sukhmani.v1')); } catch (e) {} const n = document.getElementById('sk-link-visit'); const vis = n && !n.hidden; const r = vis ? n.getBoundingClientRect() : null;
  const btns = vis ? [...n.querySelectorAll('button')].map(b => { const br = b.getBoundingClientRect(); const top = document.elementFromPoint(br.left + br.width / 2, br.top + br.height / 2); return {text: b.textContent.trim(), w: Math.round(br.width), h: Math.round(br.height), disabled: b.disabled, tapReachesIt: top === b}; }) : [];
  const res = document.getElementById('resume-notice'); const cur = document.querySelector('#sukhmani-text [aria-current="true"], #sukhmani-text .sk-current');
  const rows = [...document.querySelectorAll('#sukhmani-text [data-line-id]')]; const floor = r ? r.bottom : 0; const first = rows.find(x => x.getBoundingClientRect().bottom > floor + 4);
  return {storedPlace: rec ? rec.read : null, storedNotes: rec && rec.notes ? Object.keys(rec.notes).length : 0, positionLabel: ((document.getElementById('sk-position') || {}).innerText || '').replace(/\\s+/g, ' ').trim(), address: location.pathname.split('/').pop() + location.hash,
    visitNotice: vis ? {text: n.innerText.replace(/\\s+/g, ' ').trim(), top: Math.round(r.top), height: Math.round(r.height), insideScreen: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, shareOfScreenPercent: Math.round(100 * r.height / innerHeight), buttons: btns} : null,
    resumeNotice: res && !res.hidden ? res.innerText.replace(/\\s+/g, ' ').trim().slice(0, 140) : null, firstLineBelowTheNotice: first ? first.dataset.lineId : null, firstLineTop: first ? Math.round(first.getBoundingClientRect().top) : null,
    pixelsOfThatLineUnderTheNotice: first && r ? Math.max(0, Math.round(r.bottom - first.getBoundingClientRect().top)) : 0, writes: (window.__writes || []).length}; })()"""
with sync_playwright() as p:
    b = p.chromium.launch()
    def ctx(w=390, h=664):
        c = b.new_context(viewport={'width': w, 'height': h}, service_workers='block', has_touch=True); c.set_default_timeout(8000); c.add_init_script(LOG); return c
    def open_(pg, addr): pg.goto(B + addr, wait_until='networkidle'); time.sleep(2.6)
    def set_place_a3(pg):
        open_(pg, 'sukhmani.html'); pg.evaluate("document.querySelector('#ashtpadi-nav a:nth-child(3)').click()"); time.sleep(1.5); pg.mouse.wheel(0, 600); time.sleep(1.8); return pg.evaluate(S)
    def read_on(pg, n=5):
        for _ in range(n): pg.mouse.wheel(0, 800); time.sleep(0.25)
        time.sleep(1.5)
    # ---- A, B, C, D
    c = ctx(); pg = c.new_page(); before = set_place_a3(pg); pg.goto(B + 'index.html', wait_until='networkidle'); time.sleep(0.4)
    open_(pg, 'sukhmani.html#ashtpadi-17'); a = pg.evaluate(S)
    R['A_arrival_by_link'] = dict(before=dict(storedPlace=before['storedPlace'], positionLabel=before['positionLabel']), onArrival=a, savedPlaceKept=a['storedPlace'] == before['storedPlace'], writesToStorageOnArrival=a['writes'], showsAshtpadi17=a['positionLabel'].startswith('Ashtpadi 17'))
    read_on(pg); bb = pg.evaluate(S); R['B_reading_on_during_the_visit'] = dict(afterReadingOn=bb, savedPlaceKept=bb['storedPlace'] == before['storedPlace'], writesToStorage=bb['writes'], noticeStillOnScreen=bool(bb['visitNotice'] and bb['visitNotice']['insideScreen']))
    pg.click('#sukhmani-text [data-line-id] >> nth=1600'); time.sleep(0.6); ta = pg.query_selector('dialog[open] textarea'); wrote = False
    if ta and not ta.is_disabled(): ta.fill('NOTE WRITTEN DURING A VISIT'); time.sleep(1.4); wrote = True
    pg.keyboard.press('Escape'); time.sleep(0.8); cc = pg.evaluate(S); R['C_note_written_during_the_visit'] = dict(couldWrite=wrote, noteStored='NOTE WRITTEN DURING A VISIT' in (pg.evaluate("localStorage.getItem('glp001.sukhmani.v1')") or ''), savedPlaceKept=cc['storedPlace'] == before['storedPlace'], after=cc)
    pg.click('#sk-visit-return'); time.sleep(1.2); d = pg.evaluate(S); R['D_return_to_saved_place'] = dict(after=d, backAtAshtpadi3=d['positionLabel'].startswith('Ashtpadi 3'), savedPlaceKept=d['storedPlace'] == before['storedPlace'], linkGoneFromAddress='#' not in d['address'], noticeGone=d['visitNotice'] is None, said=pg.evaluate("[...document.querySelectorAll('[role=status],[aria-live]')].map(e => e.textContent.trim()).filter(t => /saved reading place|Returned/i.test(t))[0] || null"))
    read_on(pg, 2); d2 = pg.evaluate(S); R['D_return_to_saved_place']['afterReturningOrdinaryReadingIsSavedAgain'] = d2['storedPlace'] != before['storedPlace']; c.close()
    # ---- E
    c = ctx(); pg = c.new_page(); before = set_place_a3(pg); open_(pg, 'index.html'); open_(pg, 'sukhmani.html#ashtpadi-17'); pg.click('#sk-visit-keep'); time.sleep(1.2); e = pg.evaluate(S)
    R['E_use_this_as_my_reading_place'] = dict(after=e, storedPlaceIsNowInAshtpadi17=str(e['storedPlace']).startswith('sukhmani.a17'), linkGoneFromAddress='#' not in e['address'], noticeGone=e['visitNotice'] is None); c.close()
    # ---- F
    c = ctx(); pg = c.new_page(); before = set_place_a3(pg); open_(pg, 'index.html'); open_(pg, 'sukhmani.html#ashtpadi-17'); read_on(pg, 3); pg.close(); pg = c.new_page(); open_(pg, 'sukhmani.html'); f = pg.evaluate(S)
    R['F_closed_then_opened_the_ordinary_way'] = dict(after=f, savedPlaceKept=f['storedPlace'] == before['storedPlace'], opensAtOrOffersAshtpadi3=f['positionLabel'].startswith('Ashtpadi 3') or 'Ashtpadi 3' in (f['resumeNotice'] or '')); c.close()
    # ---- G
    c = ctx(); pg = c.new_page(); before = set_place_a3(pg); open_(pg, 'index.html'); open_(pg, 'sukhmani.html#ashtpadi-17'); read_on(pg, 2)
    pg.reload(wait_until='networkidle'); time.sleep(2.6); g1 = pg.evaluate(S); open_(pg, 'index.html'); pg.go_back(wait_until='networkidle'); time.sleep(2.6); g2 = pg.evaluate(S)
    open_(pg, 'sukhmani.html'); time.sleep(0.5); pg.evaluate("location.hash = '#ashtpadi-17'"); time.sleep(1.5); g3 = pg.evaluate(S); pg.go_back(); time.sleep(1.5); g4 = pg.evaluate(S)
    R['G_reload_and_back'] = dict(afterReloadDuringVisit=dict(savedPlaceKept=g1['storedPlace'] == before['storedPlace'], stillAVisit=g1['visitNotice'] is not None, position=g1['positionLabel']), afterLeavingAndPressingBack=dict(savedPlaceKept=g2['storedPlace'] == before['storedPlace'], stillAVisit=g2['visitNotice'] is not None, position=g2['positionLabel']),
                                  linkFollowedInsideThePage=dict(savedPlaceKept=g3['storedPlace'] == before['storedPlace'], isAVisit=g3['visitNotice'] is not None, position=g3['positionLabel']), thenBack=dict(savedPlaceKept=g4['storedPlace'] == before['storedPlace'], visitEnded=g4['visitNotice'] is None, position=g4['positionLabel'], address=g4['address'])); c.close()
    # ---- H
    c = ctx(); pg = c.new_page(); before = set_place_a3(pg); H = {}
    for name, link in (('a single line', '#sukhmani.a17.p03.l02'), ('a unit', '#unit-sukhmani.a17.p01'), ('a link that does not exist', '#nope-nothing-here'), ('the skip link', '#sukhmani-text')):
        open_(pg, 'index.html'); open_(pg, 'sukhmani.html' + link); h = pg.evaluate(S); H[name] = dict(link=link, savedPlaceKept=h['storedPlace'] == before['storedPlace'], isAVisit=h['visitNotice'] is not None, position=h['positionLabel'], notice=h['visitNotice'] and h['visitNotice']['text'][:150], useThisDisabled=h['visitNotice'] and next((x['disabled'] for x in h['visitNotice']['buttons'] if x['text'].startswith('Use this')), None), writes=h['writes'])
    R['H_other_links'] = H; R['H_unit_ids_sample'] = pg.evaluate("[...document.querySelectorAll('#sukhmani-text [id^=unit-]')].slice(0, 3).map(e => e.id)"); c.close()
    # ---- I
    c = ctx(); t1 = c.new_page(); before = set_place_a3(t1); t2 = c.new_page(); open_(t2, 'sukhmani.html#ashtpadi-17'); read_on(t2, 2)
    t1.bring_to_front(); t1.evaluate("document.querySelector('#ashtpadi-nav a:nth-child(6)').click()"); time.sleep(1.5); t1.mouse.wheel(0, 500); time.sleep(1.8); p1 = t1.evaluate(S)
    t2.bring_to_front(); time.sleep(0.8); mid = t2.evaluate(S); t2.click('#sk-visit-return'); time.sleep(1.2); p2 = t2.evaluate(S)
    R['I_two_tabs'] = dict(otherTabMovedThePlaceTo=p1['storedPlace'], visitingTabNoticeNowSays=mid['visitNotice'] and mid['visitNotice']['text'][:140], afterReturnVisitingTabIsAt=p2['positionLabel'], storedPlaceStillTheOtherTabs=p2['storedPlace'] == p1['storedPlace']); c.close()
    # ---- J
    c = ctx(); pg = c.new_page(); open_(pg, 'sukhmani.html#ashtpadi-17'); j0 = pg.evaluate(S); read_on(pg, 4); j1 = pg.evaluate(S); pg.close(); pg = c.new_page(); open_(pg, 'sukhmani.html'); j2 = pg.evaluate(S)
    R['J_first_time_reader_arriving_by_link'] = dict(noticeSays=j0['visitNotice'] and j0['visitNotice']['text'], anythingStoredOnArrival=j0['storedPlace'], anythingStoredAfterReadingOn=j1['storedPlace'], nextOrdinaryOpeningStartsAt=j2['positionLabel'], offeredAnything=j2['resumeNotice']); c.close()
    # ---- K
    K = []
    for (w, h) in ((320, 568), (375, 667), (390, 844)):
        c = ctx(w, h); pg = c.new_page(); set_place_a3(pg); open_(pg, 'index.html'); open_(pg, 'sukhmani.html#ashtpadi-17'); k = pg.evaluate(S); n = k['visitNotice']
        K.append(dict(window=f'{w}x{h}', noticeHeight=n['height'], shareOfScreenPercent=n['shareOfScreenPercent'], insideScreen=n['insideScreen'], buttons=[(x['text'], x['w'], x['h'], x['tapReachesIt']) for x in n['buttons']], linkedLineClearOfTheNotice=k['pixelsOfThatLineUnderTheNotice'] == 0, firstLineBelowTheNotice=k['firstLineBelowTheNotice'], sidewaysScroll=pg.evaluate('document.documentElement.scrollWidth > innerWidth + 1')))
        read_on(pg, 2); k2 = pg.evaluate(S); K[-1]['stillOnScreenAfterScrolling'] = bool(k2['visitNotice'] and k2['visitNotice']['insideScreen']); c.close()
    R['K_notice_at_three_widths'] = K
    try:
        c = ctx(); pg = c.new_page(); set_place_a3(pg); open_(pg, 'index.html'); open_(pg, 'sukhmani.html#ashtpadi-17'); R['K_what_a_screen_reader_is_given'] = pg.locator('#sk-link-visit').aria_snapshot(); c.close()
    except Exception as ex: R['K_what_a_screen_reader_is_given'] = 'not available: ' + str(ex)[:80]
    # ---- M
    c = b.new_context(viewport={'width': 390, 'height': 844}, service_workers='block'); pg = c.new_page(); pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.4)
    pg.click('#dock-position'); time.sleep(0.5); pg.evaluate("[...document.querySelectorAll('dialog[open] button')].find(b => b.textContent.trim().startsWith('Pauri 20Ang')).click()"); time.sleep(0.6); pg.evaluate("document.querySelector('dialog[open] #dialog-close')?.click()"); time.sleep(1.6)
    jb = pg.evaluate("JSON.parse(localStorage.getItem('glp001.continuous.v2')).read.id"); M = {}
    for link in ('#pauri05.line01', '#line-100', '#pauri-5'):
        pg.goto(B + 'index.html', wait_until='networkidle'); time.sleep(0.3); pg.goto(B + 'full-japji.html' + link, wait_until='networkidle'); time.sleep(2.0)
        M[link] = dict(storedPlaceAfter=pg.evaluate("JSON.parse(localStorage.getItem('glp001.continuous.v2')).read.id"), barSays=pg.evaluate("(document.getElementById('dock-position').getAttribute('aria-label') || '').replace('. Jump to a passage', '')"))
    R['M_links_into_japji'] = dict(storedPlaceBefore=jb, tried=M, anyLinkMovesTheReader=any(v['barSays'] != 'Pauri 20 · line 1' for v in M.values()), savedPlaceKeptEveryTime=all(v['storedPlaceAfter'] == jb for v in M.values())); c.close()
    # ---- N
    c = ctx(); pg = c.new_page(); n0 = set_place_a3(pg); read_on(pg, 4); n1 = pg.evaluate(S); pg.reload(wait_until='networkidle'); time.sleep(2.6); n2 = pg.evaluate(S)
    R['N_ordinary_reading_no_link'] = dict(placeMovesAsTheReaderReads=n1['storedPlace'] != n0['storedPlace'], noVisitNotice=n1['visitNotice'] is None, afterReload=dict(storedPlaceSame=n2['storedPlace'] == n1['storedPlace'], offered=n2['resumeNotice'], position=n2['positionLabel'])); c.close()
    b.close()
for k, v in R.items(): print(k, '::', json.dumps(v, ensure_ascii=False)[:700])
json.dump(R, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
