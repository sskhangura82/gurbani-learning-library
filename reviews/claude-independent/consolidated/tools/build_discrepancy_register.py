"""Builds one register of every place where Gurbani in this project differs from the reference it was compared with.
It adds no new comparison: it gathers the comparisons already recorded in this review (round 1, addendum S-A1,
rounds 2 and 3) and gives each exception a finding and a disposition.
Usage: python3 -I build_discrepancy_register.py <review folder> <master.sqlite> <out.csv> <out.json> [<Salok Mahalla 9 draft file>]
"""
import sys, csv, json, sqlite3, re, collections, importlib.util, os
REV, DB, OUT_CSV, OUT_JSON = sys.argv[1:5]; CAND = sys.argv[5] if len(sys.argv) > 5 else None
spec = importlib.util.spec_from_file_location('s05', os.path.join(REV, 'tools', 's05_collate_shabados.py')); s05 = importlib.util.module_from_spec(spec); spec.loader.exec_module(s05)
con = sqlite3.connect(f'file:{DB}?mode=ro', uri=True)
ASSET = {'SSA2': 'Shabad OS Database 5.0.0-next.0, text "Shabadaarth"', 'DGDG': 'Shabad OS Database 5.0.0-next.0, text "Das Granthi"'}   # what the database records about each is in section 2 of the register
PART_ASSET = {'japji': 'SSA2', 'sukhmani': 'SSA2', 'anand': 'SSA2', 'sohila': 'SSA2', 'rehras:sggs-nine': 'SSA2', 'rehras:anand': 'SSA2', 'rehras:mundawani-slok': 'SSA2',
              'jaap': 'DGDG', 'savaiye': 'DGDG', 'chaupai': 'DGDG', 'rehras:chaupai': 'DGDG', 'rehras:savaiya-dohira': 'DGDG'}
NAME = {'japji': 'Japji Sahib', 'sukhmani': 'Sukhmani Sahib', 'anand': 'Anand Sahib', 'sohila': 'Sohila', 'jaap': 'Jaap Sahib', 'savaiye': 'Tav-Prasad Savaiye', 'chaupai': 'Benti Chaupai',
        'rehras:sggs-nine': 'Rehras Sahib, the nine Shabads', 'rehras:chaupai': 'Rehras Sahib, Chaupai', 'rehras:savaiya-dohira': 'Rehras Sahib, Swaiya and Dohra', 'rehras:anand': 'Rehras Sahib, Anand', 'rehras:mundawani-slok': 'Rehras Sahib, Mundavani and Salok'}
def ref_text(ids, asset):
    out = []
    for i in ids:
        r = con.execute("select data from asset_lines where type='primary' and asset_id=? and line_id=?", (asset, i)).fetchone()
        if r: out.append(s05.norm_ref(r[0]))
    return out
CLASS = {
 'L': ('Layout only', 'App layout fault, not a difference of text', 'Same letters. Lines are run together or divided differently in the app. Repair the layout; the words do not change.', 'Builder repairs; reviewer compares again'),
 'W': ('Word division', 'Undetermined; editions are known to differ on word division', 'Same letters. A word is joined or split differently from the reference. Leave as it is until a named printed edition is chosen.', 'Qualified reader with the named edition'),
 'M': ('Closing mark or verse number', 'Difference of convention, or a small omission; undetermined', 'Letters agree. A closing mark or a verse number differs. Follow the named printed edition once chosen.', 'Owner names the edition; qualified reader confirms'),
 'U': ('Reading undecided', 'The two sources differ (established). Slip or accepted reading: undetermined', "The app's source and the reference read differently. It may be a slip on either side or a real difference between printed traditions. Needs one named printed edition and a qualified reader. Do not change before that.", 'Qualified reader with the named edition'),
 'P': ('Probable slip', "Probable error carried in from the app's source; unconfirmed", 'The app contradicts its own pattern or stores the word in an invalid order. Confirm against print, then correct with a before-and-after record.', 'Qualified reader confirms; builder corrects; owner signs off'),
 'E': ('Encoding fault', 'App encoding error', 'The app stores a doubled sign where the reference has one; an extra letter is drawn in the test font. Correct with a before-and-after record.', 'Builder corrects; owner signs off because displayed Gurbani changes'),
 'D': ('Unpublished draft', 'Reading aids from an older database stored inside the lines; not part of the text', 'Never published. Identical to the reference once the pause marks are removed. Not to be used until cleaned.', 'Builder cleans; reviewer compares again'),
}
rows = []
def add(setname, published, where, oid, page, app, ref, kinds, words, asset, finding, cls, note=''):
    c = CLASS[cls]
    rows.append(dict(set=setname, published='yes' if published else 'no', where=where, id=oid, ang_or_page=page, app_text=app, reference_text=ref, kind_of_difference=kinds, words_app_then_reference=words,
                     compared_with=ASSET[asset], finding=finding, disposition_class=c[0], what_it_is=c[1], disposition=c[2] + (' ' + note if note else ''), who_decides=c[3]))

# ---- 1. the three published readers (round 1, test S-05)
D = json.load(open(os.path.join(REV, 'evidence', 's05_differences.json'), encoding='utf-8')); by = collections.defaultdict(list)
for d in D:
    for i in d['app_ids']: by[i].append(d)
REG = list(csv.DictReader(open(os.path.join(REV, 'evidence', 's05_register.csv'), encoding='utf-8')))
tally = collections.defaultdict(collections.Counter)
for r in REG:
    part, st, oid = r['composition_part'], r['status'], r['occurrence_id']; tally[part][st] += 1
    if st == 'exact': continue
    ds = by.get(oid, []); asset = PART_ASSET[part]
    ref = ' / '.join(dict.fromkeys(l for d in ds for l in d['ref_lines'])) or ' / '.join(ref_text(r['reference_line_ids'].split(), asset))
    words = '; '.join(f"{d['app'] or '(nothing)'} → {d['ref'] or '(nothing)'}" for d in ds); kinds = ', '.join(sorted({d['type'].replace('_', ' ') for d in ds})) or st.replace('_', ' ')
    letter = [d for d in ds if d['type'] not in ('verse_mark_or_numbering', 'spacing')]
    n = re.search(r'(\d+)', oid); num = int(n.group(1)) if n else None; note = ''
    if part in ('rehras:sggs-nine', 'rehras:mundawani-slok'): f, c = 'CI-S-10', 'L'
    elif part == 'rehras:savaiya-dohira': f, c, note = 'CI-S-11 (and CI-S-10 for the layout)', 'U', 'The row is also run together (layout).'
    elif part == 'sohila' and st == 'line_division_only': f, c = 'none raised (counted in the round 1 table)', 'L'
    elif part in ('anand', 'sohila'): f, c = 'CI-S-14', 'M'
    elif part == 'jaap':
        if oid.startswith(('jaap096', 'jaap097', 'jaap098')) and any('ਚੱਤ' in d['app'] for d in ds): f, c, note = 'CI-S-02', 'P', 'One word is stored two ways within three chhands; one way is an invalid order of signs.'
        elif oid in ('jaap108.line04', 'jaap122.line04', 'jaap198.line04'): f, c = 'CI-S-03', 'P'
        elif oid == 'jaap179.line04': f, c, note = 'CI-S-03', 'L', 'No space before the verse number, unlike the other 198 chhands.'
        elif oid.startswith('jaap062'): f, c, note = 'CI-S-01', 'L', 'An invocation is stored as a verse line.'
        elif oid.startswith('jaap.preface'): f, c, note = 'CI-S-04', 'U', 'An opening invocation is in the app and not in the reference text.'
        elif st == 'letter_level_difference': f, c = 'CI-S-04', 'U'
        elif st == 'spacing_only': f, c = 'none raised (counted in the round 1 table)', 'W'
        else: f, c, note = 'CI-S-14', ('M' if st == 'verse_mark_or_numbering_only' else 'L'), 'Chhands 55, 56 and 73: the app closes each half-line with a mark where the reference has one line.'
    elif part in ('savaiye', 'chaupai', 'rehras:chaupai'):
        if '.preface' in oid: f, c, note = 'CI-S-05', ('L' if st == 'line_division_only' else 'P'), 'Opening lines run together and divided in the wrong places.'
        elif st == 'letter_level_difference': f, c = ('CI-S-07' if part == 'savaiye' else 'CI-S-06'), 'U'
        elif st == 'verse_mark_or_numbering_only': f, c, note = 'CI-S-08', 'M', 'The app numbers from 1; the reference keeps the numbering of the Granth.' + (' A word is also divided differently.' if any(d['type'] == 'spacing' for d in ds) else '')
        else: f, c = 'none raised (counted in the round 1 table)', 'W'
        if part == 'rehras:chaupai': note = (note + ' The same text is stored a second time in the Rehras file.').strip()
    else: f, c = 'unassigned', 'U'
    add('Published readers', True, NAME[part], oid, r['reference_pages'] or r['app_ang'], r['app_text'], ref, kinds, words, asset, f, c, note)

# ---- 2. Gurbani shown outside the readers (addendum S-A1)
A1 = list(csv.DictReader(open(os.path.join(REV, 'evidence', 'sA1_register.csv'), encoding='utf-8'))); a1_exact = 0
for r in A1:
    if r['status'].startswith('exact'): a1_exact += 1; continue
    ds = json.loads(r['differences'])
    add('Published, outside the readers', True, r['shown_in'], r['where_in_app_files'], r['reference_ang'], r['app_text'], r['reference_text'], 'doubled sign under the letter', '; '.join(f"{d['app']} → {d['reference']}" for d in ds), 'SSA2', 'CI-S-16', 'E')

# ---- 3. unpublished material compared in rounds 2 and 3
K = json.load(open(os.path.join(REV, 'round2', 'evidence', 'k01_salok9_recovered_draft.json'), encoding='utf-8'))
if CAND:   # the draft file itself (never merged; branch and commit are named in the round 2 evidence), so that every row can be listed
    d = json.load(open(CAND, encoding='utf-8'))
    cand = sorted([(h['orderId'], h['ang'], h['sourceAngLine'], re.sub(r'\s+', ' ', h['text']).strip()) for h in d['sourceHeadings']] + [(r['orderId'], r['ang'], r['sourceAngLine'], re.sub(r'\s+', ' ', r['text']).strip()) for sk in d['saloks'] for r in sk['sourceRows']])
    ref = [r for r in s05.load_ref(con) if r['asset'] == 'SSA2']
    i0 = next(i for i, r in enumerate(ref) if r['page'] >= 1426 and 'ਸਲੋਕ ਮਹਲਾ ੯' in r['text']); i1 = next(i for i in range(i0, len(ref)) if '॥੫੭॥' in ref[i]['text'])
    while ref[i0 - 1]['page'] == 1426 and 'ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ' in ref[i0 - 1]['text']: i0 -= 1
    R = ref[i0:i1 + 1]; assert len(R) == len(cand) == 117, (len(R), len(cand))
    for (_, ang, line, text), rr in zip(cand, R):
        if text == rr['text']: continue
        assert s05.norm_ref(text) == rr['text'], text   # equal once the pause marks are removed
        marks = [ch for ch in text if ch in ';.,']
        add('Recovered draft, Salok Mahalla 9 (never published)', False, 'Salok Mahalla 9', f'Ang {ang}, line {line}', str(ang), text, rr['text'], 'pause marks inside the line', f"{len(marks)} mark(s): {' '.join(marks)}", 'SSA2', 'R2-K-01', 'D')
out = dict(publishedReaders={NAME[p]: dict(t) for p, t in tally.items()}, outsideReaders=dict(lines=len(A1), exact=a1_exact, differ=len(A1) - a1_exact),
           salokMahalla9Draft=dict(rows=K['pauseMarks']['of'], exactAsStored=K['pauseMarks']['exactAsStored'], rowsWithPauseMarks=K['pauseMarks']['rowsCarryingPauseMarks'], pauseMarks=K['pauseMarks']['pauseMarksInAll'], exactAfterRemoval=K['pauseMarks']['exactAfterRemovingPauseMarks'], listedHere=sum(1 for r in rows if r['finding'] == 'R2-K-01'), marksListedHere=sum(int(r['words_app_then_reference'].split(' ')[0]) for r in rows if r['finding'] == 'R2-K-01')),
           byClassPublished=dict(collections.Counter(r['disposition_class'] for r in rows if r['published'] == 'yes')), byFindingPublished=dict(collections.Counter(r['finding'] for r in rows if r['published'] == 'yes')),
           byCompositionAndClass={w: dict(collections.Counter(r['disposition_class'] for r in rows if r['where'] == w and r['set'] == 'Published readers')) for w in dict.fromkeys(r['where'] for r in rows if r['set'] == 'Published readers')},
           classes={v[0]: dict(whatItIs=v[1], disposition=v[2], whoDecides=v[3]) for v in CLASS.values()}, rowsPublished=sum(1 for r in rows if r['published'] == 'yes'), rowsUnpublished=sum(1 for r in rows if r['published'] == 'no'), jaap96to98=sum(1 for r in rows if r['finding'] == 'CI-S-02'), rows=rows)
with open(OUT_CSV, 'w', encoding='utf-8', newline='') as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
json.dump(out, open(OUT_JSON, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('published exceptions', out['rowsPublished'], '| unpublished', out['rowsUnpublished']); print('by class', out['byClassPublished']); print('by finding', out['byFindingPublished']); print('Jaap 96-98 rows', out['jaap96to98'])
for w, c in out['byCompositionAndClass'].items(): print('  ', w, c)
print('outside readers', out['outsideReaders']); print('draft', out['salokMahalla9Draft']); print('rows without reference text:', sum(1 for r in rows if not r['reference_text']))
