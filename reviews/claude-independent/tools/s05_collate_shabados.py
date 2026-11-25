#!/usr/bin/env python3
"""S-05 Collation A (v2): word-level collation of every original-Gurbani occurrence
served by the app against the Shabad OS Database v5.0.0-next.0 primary Gurmukhi
(asset SSA2 = SGPC Shabadaarth for Sri Guru Granth Sahib; asset DGDG for Dasam Bani).

What is compared
  * Sri Guru Granth Sahib compositions are compared with the database's SSA2 lines in
    *source order* for the relevant Ang range (not with the database's ready-made bani
    lists: its Sukhmani list omits one tuk, see the audit report).
  * Jaap and Savaiye use the database's bani lists (source order, Dasam Granth).
  * Chaupai uses the Charitropakhyan section lines 377-405.
  * Rehras is compared part by part against the same sources.

Reference normalisation (stated, not hidden): pause marks ; , . are removed from the
reference, as are zero-width joiners, variation selectors and subscript note digits.
Nothing in the app text is altered. For comparison only, both sides are split into
tokens: words, and verse marks (a danda group such as "॥", "॥੧॥", "॥੧॥੨੧॥").

Usage: python3 -I s05_collate_shabados.py <app_corpus.json> <master.sqlite> <out_dir>
"""
import json, sys, sqlite3, re, difflib, os, unicodedata, csv
from collections import defaultdict, Counter

STRIP = dict.fromkeys(map(ord, ';,.‍︀︁₁₂₃₄₅₆₇₈₉'), None)
TOKEN = re.compile(r'॥(?:[੦-੯]+॥)*|[^\s॥]+')
MARK = re.compile(r'^॥')
NASAL = 'ਂੰਁ'
ADDAK = 'ੱ'
MATRA = 'ਾਿੀੁੂੇੈੋੌ'
NUKTA_MAP = {'ਸ਼': 'ਸ', 'ਖ਼': 'ਖ', 'ਗ਼': 'ਗ', 'ਜ਼': 'ਜ', 'ਫ਼': 'ਫ', 'ਲ਼': 'ਲ'}

def norm_ref(s):
    return re.sub(r'\s+', ' ', s.translate(STRIP)).strip()

def drop(s, chars):
    return ''.join(c for c in s if c not in chars)

def yay(s):
    # collapse the three ways a half/attached yayya reaches Unicode: virama+ya, yakash, plain ya
    return s.replace('੍ਯ', 'ਯ').replace('ੵ', 'ਯ')

def subtype(a, b):
    """Classify a letter-level difference between app word(s) a and reference word(s) b."""
    if not a: return 'reference_has_extra_word'
    if not b: return 'app_has_extra_word'
    A = a.replace(' ', ''); B = b.replace(' ', '')
    if A == B: return 'spacing'
    if sorted(A) == sorted(B): return 'mark_order'
    if yay(A) == yay(B): return 'yayya_encoding'
    if ''.join(NUKTA_MAP.get(c, c) for c in A) == ''.join(NUKTA_MAP.get(c, c) for c in B): return 'nukta'
    if drop(A, NASAL) == drop(B, NASAL): return 'nasal_sign'
    if drop(A, ADDAK) == drop(B, ADDAK): return 'addak'
    if drop(A, ADDAK + NASAL) == drop(B, ADDAK + NASAL): return 'addak_and_nasal'
    if drop(yay(A), MATRA + NASAL + ADDAK) == drop(yay(B), MATRA + NASAL + ADDAK): return 'vowel_sign'
    return 'letters_or_word'

def load_ref(con):
    q = '''select al.line_id, al.asset_id, al.data, al.additional, s.id, cast(s.source_order as int),
                  cast(lg.section_order as int), cast(l.line_group_order as int)
           from asset_lines al join lines l on l.id=al.line_id
           join line_groups lg on lg.id=l.line_group_id join sections s on s.id=lg.section_id
           where al.type='primary' and al.asset_id in ('SSA2','DGDG')
           order by al.asset_id, 6, 7, 8'''
    rows = []
    for lid, asset, data, add, sec, so, go, lo in con.execute(q):
        a = json.loads(add) if add else {}
        rows.append(dict(id=lid, asset=asset, raw=data, text=norm_ref(data), page=a.get('page'), line=a.get('line'), section=sec, group=go))
    return rows

def bani(con, ref_by_id, code):
    ids = [r[0] for r in con.execute('select line_id from bani_lines where bani_id=? order by section_order, line_order', (code,))]
    return [ref_by_id[i] for i in ids if i in ref_by_id]

def collate(comp, A, B, register, diffs):
    aw = [(t, i) for i, o in enumerate(A) for t in TOKEN.findall(o['text'])]
    bw = [(t, j) for j, l in enumerate(B) for t in TOKEN.findall(l['text'])]
    sm = difflib.SequenceMatcher(None, [w for w, _ in aw], [w for w, _ in bw], autojunk=False)
    a2b = defaultdict(set); issues = defaultdict(list)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'equal':
            for k in range(i2 - i1): a2b[aw[i1 + k][1]].add(bw[j1 + k][1])
            continue
        if tag == 'insert' and (i1 == 0 or i1 == len(aw)):
            continue   # reference text before/after the composition in the same Ang range: not a difference
        a_tok = [w for w, _ in aw[i1:i2]]; b_tok = [w for w, _ in bw[j1:j2]]
        if tag == 'insert' and len(b_tok) > 40:
            continue   # a deliberate selection gap (e.g. Rehras takes Anand pauris 1-5 and 40); reported in the summary instead
        a_lines = sorted({i for _, i in aw[i1:i2]}); b_lines = sorted({j for _, j in bw[j1:j2]})
        if not a_lines and i1 > 0 and all(MARK.match(t) for t in b_tok):
            a_lines = [aw[i1 - 1][1]]   # a verse mark the reference has and the app lacks belongs to the app line just before it
        # peel verse marks from words so that numbering is reported apart from letters
        a_words = [t for t in a_tok if not MARK.match(t)]; b_words = [t for t in b_tok if not MARK.match(t)]
        a_marks = [t for t in a_tok if MARK.match(t)]; b_marks = [t for t in b_tok if MARK.match(t)]
        recs = []
        if a_words or b_words:
            st = subtype(' '.join(a_words), ' '.join(b_words))
            recs.append((st, ' '.join(a_words), ' '.join(b_words)))
        if a_marks != b_marks:
            recs.append(('verse_mark_or_numbering', ' '.join(a_marks), ' '.join(b_marks)))
        for st, aa, bb in recs:
            d = dict(comp=comp, type=st, app=aa, ref=bb,
                     app_ids=[A[i]['id'] for i in a_lines], app_lines=[A[i]['text'] for i in a_lines],
                     ref_ids=[B[j]['id'] for j in b_lines], ref_lines=[B[j]['text'] for j in b_lines],
                     ref_pages=sorted({B[j]['page'] for j in b_lines if B[j]['page'] is not None}))
            diffs.append(d)
            for i in a_lines: issues[i].append(st)
        for i in a_lines:
            for j in b_lines: a2b[i].add(j)
    used = set()
    for i, o in enumerate(A):
        kinds = set(issues.get(i, [])); refs = sorted(a2b.get(i, [])); used.update(refs)
        letter = kinds - {'spacing', 'verse_mark_or_numbering'}
        if letter: st = 'letter_level_difference'
        elif 'verse_mark_or_numbering' in kinds: st = 'verse_mark_or_numbering_only'
        elif 'spacing' in kinds: st = 'spacing_only'
        elif not refs: st = 'no_counterpart'
        elif len(refs) == 1 and B[refs[0]]['text'] == o['text']: st = 'exact'
        else: st = 'line_division_only'
        ref_pages = sorted({B[j]['page'] for j in refs if B[j]['page'] is not None})
        ang_ok = None
        if o.get('ang') is not None and ref_pages:
            ang_ok = o['ang'] in ref_pages
        register.append(dict(comp=comp, id=o['id'], kind=o['kind'], status=st, subtypes=sorted(kinds),
                             app_ang=o.get('ang'), ref_pages=ref_pages, ang_agrees=ang_ok,
                             ref_ids=[B[j]['id'] for j in refs], text=o['text']))
    if used:
        lo, hi = min(used), max(used)
        return [B[j] for j in range(lo, hi + 1) if j not in used]
    return []

def main(corpus_path, db_path, out_dir):
    occ = json.load(open(corpus_path, encoding='utf-8'))
    con = sqlite3.connect(f'file:{db_path}?mode=ro', uri=True)
    ref = load_ref(con); ref_by_id = {r['id']: r for r in ref}
    ssa = [r for r in ref if r['asset'] == 'SSA2']; dg = [r for r in ref if r['asset'] == 'DGDG']
    def pages(lo, hi): return [r for r in ssa if r['page'] is not None and lo <= r['page'] <= hi]
    def dsec(section, g1, g2): return [r for r in dg if r['section'] == section and g1 <= r['group'] <= g2]
    def upto(lines, marker):
        for k, r in enumerate(lines):
            if marker in r['text']: return lines[:k + 1]
        return lines
    chaupai_ref = [r for r in dg if r['page'] in (809,) and r['text'] in ('ੴ ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਹ ॥', 'ਪਾਤਿਸਾਹੀ ੧੦ ॥')][:2] + upto(dsec('07NX', 3132, 3134), '॥੪੦੫॥')
    register = []; diffs = []; summary = {}
    plan = [
        ('japji', lambda o: True, pages(1, 8), 'SSA2 Ang 1-8, source order'),
        ('sukhmani', lambda o: True, pages(262, 296), 'SSA2 Ang 262-296, source order'),
        ('anand', lambda o: True, pages(917, 922), 'SSA2 Ang 917-922, source order'),
        ('sohila', lambda o: True, pages(12, 13), 'SSA2 Ang 12-13, source order'),
        ('jaap', lambda o: True, bani(con, ref_by_id, 'JAAP'), 'DGDG, Jaap bani list'),
        ('savaiye', lambda o: True, bani(con, ref_by_id, 'TPSS'), 'DGDG, Tav-Prasad Savaiye bani list'),
        ('chaupai', lambda o: True, chaupai_ref, 'DGDG, Charitropakhyan 404 verses 377-405'),
        ('rehras:sggs-nine', lambda o: '.sggs' in o['id'], pages(8, 12), 'SSA2 Ang 8-12, source order'),
        ('rehras:chaupai', lambda o: '.chaupai' in o['id'], upto(dsec('07NX', 3132, 3132), '॥੪੦੧॥')[1:], 'DGDG, Charitropakhyan 404 verses 377-401'),
        ('rehras:savaiya-dohira', lambda o: '.savaiya' in o['id'] or '.dohira' in o['id'], upto(dsec('QUTV', 312, 313), '॥੮੬੪॥'), 'DGDG, Ram Avtar 863-864'),
        ('rehras:anand', lambda o: '.anand' in o['id'], pages(917, 922), 'SSA2 Ang 917-922, source order'),
        ('rehras:mundawani-slok', lambda o: '.mundawani' in o['id'] or '.slok' in o['id'], pages(1429, 1429), 'SSA2 Ang 1429'),
    ]
    for key, pick, B, label in plan:
        comp = key.split(':')[0]
        A = [o for o in occ if o['comp'] == comp and pick(o)]
        n0 = len(register)
        unused = collate(key, A, B, register, diffs)
        c = Counter(r['status'] for r in register[n0:])
        summary[key] = dict(reference=label, app_occurrences=len(A), status=dict(c),
                            reference_lines_inside_span_without_app_counterpart=[dict(id=u['id'], page=u['page'], text=u['text']) for u in unused])
        print(f'{key:24s} n={len(A):5d} {dict(c)} | ref lines skipped inside span: {len(unused)}')
    # format defects on the app side
    fmt = []
    for o in occ:
        t = o['text']
        n1 = len(re.findall(r'॥(?=[^\s॥੦-੯])', t)); n2 = len(re.findall(r'[^\s॥੦-੯]॥', t)); n3 = len(re.findall(r'[^\s॥੦-੯][੦-੯]+॥', t))
        if n1 or n2 or n3:
            fmt.append(dict(id=o['id'], comp=o['comp'], no_space_after_mark=n1, no_space_before_mark=n2, digit_glued_to_word=n3, text=t[:160]))
    os.makedirs(out_dir, exist_ok=True)
    tot = Counter(r['status'] for r in register)
    out = dict(total_occurrences=len(register), overall_status=dict(tot), by_part=summary,
               difference_types=dict(Counter(d['type'] for d in diffs)),
               difference_types_by_part={k: dict(Counter(d['type'] for d in diffs if d['comp'] == k)) for k in summary},
               ang_reference_check=dict(checked=sum(1 for r in register if r['ang_agrees'] is not None),
                                        agree=sum(1 for r in register if r['ang_agrees'] is True),
                                        disagree=[dict(id=r['id'], app_ang=r['app_ang'], ref_pages=r['ref_pages'], text=r['text'][:80]) for r in register if r['ang_agrees'] is False]),
               format_defects=dict(occurrences_affected=len(fmt), no_space_after_mark=sum(f['no_space_after_mark'] for f in fmt),
                                   no_space_before_mark=sum(f['no_space_before_mark'] for f in fmt), items=fmt))
    json.dump(out, open(os.path.join(out_dir, 's05_summary.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    json.dump(diffs, open(os.path.join(out_dir, 's05_differences.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    with open(os.path.join(out_dir, 's05_register.csv'), 'w', encoding='utf-8', newline='') as f:
        w = csv.writer(f); w.writerow(['composition_part', 'occurrence_id', 'kind', 'status', 'difference_types', 'app_ang', 'reference_pages', 'ang_agrees', 'reference_line_ids', 'app_text'])
        for r in register:
            w.writerow([r['comp'], r['id'], r['kind'], r['status'], ' '.join(r['subtypes']), r['app_ang'] if r['app_ang'] is not None else '',
                        ' '.join(map(str, r['ref_pages'])), '' if r['ang_agrees'] is None else r['ang_agrees'], ' '.join(r['ref_ids']), r['text']])
    print('TOTAL', len(register), dict(tot))
    print('difference types', out['difference_types'])
    print('Ang check', out['ang_reference_check']['checked'], 'agree', out['ang_reference_check']['agree'], 'disagree', len(out['ang_reference_check']['disagree']))
    print('format defects: occurrences', len(fmt), 'no space after mark', out['format_defects']['no_space_after_mark'], 'before', out['format_defects']['no_space_before_mark'])

if __name__ == '__main__':
    main(*sys.argv[1:4])
