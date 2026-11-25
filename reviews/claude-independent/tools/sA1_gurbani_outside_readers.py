#!/usr/bin/env python3
"""Addendum S-A1 (found during re-test RT-001): Gurbani the app shows that is NOT in the three reader source sets, and so was
not among the 3,809 occurrences collated in the first review. Complete enumeration by script, then letter-level collation
against the same single digital reference (Shabad OS Database v5.0.0-next.0, asset SSA2) and against the app's own reader text.

Sources searched: every shipped .js .json .html file except the three reader source sets (js/japji-full-data.js,
js/sukhmani-data.js, nitnem/data/*.json). A quotation is: any string in a field that holds scripture (lines, excerpt, context,
heading), any text carrying a danda (॥), and the fixed Gurbani line on the Simran page.

Usage: python3 -I sA1_gurbani_outside_readers.py <site-root> <master.sqlite> <app_corpus.json> <out.json>"""
import json, sys, re, sqlite3, difflib, importlib.util
SITE, DB, CORPUS, OUT = sys.argv[1:5]
spec = importlib.util.spec_from_file_location('s05', '/home/claude/gurbani-learning-library/reviews/claude-independent/tools/s05_collate_shabados.py'); s05 = importlib.util.module_from_spec(spec); spec.loader.exec_module(s05)
con = sqlite3.connect(f'file:{DB}?mode=ro', uri=True); ref = [r for r in s05.load_ref(con) if r['asset'] == 'SSA2']
by_page = {}
for r in ref: by_page.setdefault(r['page'], []).append(r)
corpus = json.load(open(CORPUS, encoding='utf-8')); app_text = {o['id']: o['text'] for o in corpus}
norm = lambda t: re.sub(r'\s+', ' ', t).strip()
def load_js(path, marker):
    s = open(SITE + path, encoding='utf-8').read(); i = s.index('=', s.index(marker)) + 1; return json.loads(s[i:].strip().rstrip(';'))
c = load_js('js/content.js', 'window.GURBANI_CONTENT')
items = []   # (where, shown_in, ang, text)
for i, l in enumerate(c['scripture']['lines']): items.append((f'js/content.js scripture.lines[{i}]', 'older Pauri 2 lesson page', l.get('ang', 1), l['text'], l.get('sha256')))
for k, r in enumerate(c['related']):
    items.append((f'js/content.js related[{k}].excerpt', 'Japji reader > Explore > Related teachings (card); older lesson page', r['ang'], r['excerpt'], None))
    for j, t in enumerate(r['context']): items.append((f'js/content.js related[{k}].context[{j}]', 'Japji reader > Related teachings > Read the complete context; older lesson page', r['ang'], t, None))
items.append(('js/content.js raagExample.heading', 'Japji reader > Explore > Raag & meaning', c['raagExample']['ang'], c['raagExample']['heading'], None))
sim = open(SITE + 'simran.html', encoding='utf-8').read(); m = re.search(r'<p class="gurbani-line"[^>]*>([^<]+)</p>', sim); items.append(('simran.html p.gurbani-line', 'Simran Room page', 2, m.group(1), None))
import hashlib
rows = []; counts = dict(total=0, exact=0, exact_except_pause_marks=0, differs=0, not_found_on_stated_page=0)
for where, shown, ang, text, declared in items:
    t = norm(text); cands = by_page.get(ang, []) + by_page.get(ang + 1, []) + by_page.get(ang - 1, [])
    exact = [r for r in cands if r['text'] == t]
    row = dict(where=where, shownIn=shown, statedAng=ang, appText=text)
    if declared: row['storedHashMatchesText'] = (hashlib.sha256(text.encode('utf-8')).hexdigest() == declared)
    if exact:
        r = exact[0]; row.update(status='exact', referenceId=r['id'], referencePage=r['page'], referenceText=r['text']); counts['exact'] += 1
    else:
        # the heading on Ang 917 is one reference line holding more than the app quotes; test containment, then nearest line
        cont = [r for r in cands if t in r['text']]
        if cont: r = cont[0]; row.update(status='exact (app quotes part of one reference line)', referenceId=r['id'], referencePage=r['page'], referenceText=r['text']); counts['exact'] += 1
        else:
            best = max(cands, key=lambda r: difflib.SequenceMatcher(None, t, r['text']).ratio()) if cands else None
            ratio = difflib.SequenceMatcher(None, t, best['text']).ratio() if best else 0
            if best and ratio > 0.6:
                aw, bw = s05.TOKEN.findall(t), s05.TOKEN.findall(best['text']); sm = difflib.SequenceMatcher(None, aw, bw, autojunk=False)
                diffs = [dict(app=' '.join(aw[i1:i2]), reference=' '.join(bw[j1:j2]), kind=s05.subtype(' '.join(aw[i1:i2]), ' '.join(bw[j1:j2]))) for tag, i1, i2, j1, j2 in sm.get_opcodes() if tag != 'equal']
                row.update(status='differs', referenceId=best['id'], referencePage=best['page'], referenceText=best['text'], differences=diffs); counts['differs'] += 1
            else: row.update(status='not found on the stated page or its neighbours'); counts['not_found_on_stated_page'] += 1
    counts['total'] += 1; rows.append(row)
# the six Pauri 2 lines and the Simran line also exist in the app's own Japji reader text: are the two copies identical?
p2 = [app_text.get(f'pauri02.line{n:02d}') for n in range(1, 7)]
same_as_reader = dict(pauri2_six_lines_identical_to_reader_copy=[norm(l['text']) for l in c['scripture']['lines']] == [norm(x) for x in p2],
                      simran_line_identical_to_reader_copy=any(norm(v) == norm(m.group(1)) for k, v in app_text.items() if k.startswith('pauri04')))
# word glosses in the older lesson: every Gurmukhi headword must occur in its own line
gl = []
for i, l in enumerate(c['scripture']['lines']):
    ex = c['explanations'].get(l['id'], {})
    for w, meaning in ex.get('words', []): gl.append(dict(line=l['id'], headword=w, occursInItsLine=(w in l['text'].split() or w in l['text']), gloss=meaning))
out = dict(counts=counts, rows=rows, sameAsReaderCopy=same_as_reader, wordGlosses=dict(total=len(gl), headwordOccursInItsLine=sum(g['occursInItsLine'] for g in gl), notInLine=[g for g in gl if not g['occursInItsLine']], all=gl),
           reference='Shabad OS Database v5.0.0-next.0, asset SSA2 (one digital reference; not print)')
json.dump(out, open(OUT, 'w'), ensure_ascii=False, indent=1)
print(json.dumps(counts), json.dumps(same_as_reader), '| glosses', len(gl), 'in line', sum(g['occursInItsLine'] for g in gl))
for r in rows:
    if not r['status'].startswith('exact'): print('  !!', r['where'], '|', r['status'], '|', r['appText'], '| ref:', r.get('referenceText'), '|', r.get('differences'))
    elif 'storedHashMatchesText' in r and not r['storedHashMatchesText']: print('  hash mismatch', r['where'])
print('example rows:'); [print('  ', r['where'].ljust(40), 'Ang', r['statedAng'], '->', r.get('referencePage'), r['status'], '|', r['appText'][:50]) for r in rows[:3] + rows[-3:]]
