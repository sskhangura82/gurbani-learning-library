#!/usr/bin/env python3
"""Round 2 · HS-01…HS-07: the Gurbani in hukamnama/fixture.json against the reference (Shabad OS Database v5.0.0-next.0, asset SSA2),
and against the readers' own conventions. Counts are taken from the reference, not from the fixture's own claim.
Usage: python3 -I h01_collate_hukamnama_fixture.py <fixture.json> <master.sqlite> <out.json>"""
import json, sys, sqlite3, re, unicodedata, hashlib
FIX, DB, OUT = sys.argv[1:4]
d = json.load(open(FIX, encoding='utf-8')); occ = d['canonical']['occurrences']
import importlib.util
spec = importlib.util.spec_from_file_location('s05', '/home/claude/gurbani-learning-library/reviews/claude-independent/tools/s05_collate_shabados.py'); s05 = importlib.util.module_from_spec(spec); spec.loader.exec_module(s05)
con = sqlite3.connect(f'file:{DB}?mode=ro', uri=True)
norm = lambda t: re.sub(r'\s+', ' ', t).strip()
ref = [dict(id=r['id'], group=(r['section'], r['group']), text=r['text'], page=r['page'], line=r['line'], section=r['section']) for r in s05.load_ref(con) if r['asset'] == 'SSA2']
first = next(i for i, r in enumerate(ref) if r['text'].startswith('ਐ ਜੀ ਨਾ ਹਮ ਉਤਮ ਨੀਚ ਨ ਮਧਿਮ'))
g = ref[first]['group']; grp = [r for r in ref if r['group'] == g]
i0 = ref.index(grp[0]); i1 = ref.index(grp[-1])
out = {'reference': 'Shabad OS Database v5.0.0-next.0, asset SSA2', 'referenceGroupId': g, 'referenceLinesInThisShabad': len(grp), 'fixtureOccurrences': len(occ)}
out['lineBeforeShabad'] = ref[i0 - 1]['text']; out['lineAfterShabad'] = ref[i1 + 1]['text']
lg = con.execute('select lg.id, lg.author_id from lines l join line_groups lg on lg.id = l.line_group_id where l.id = ?', (grp[1]['id'],)).fetchone(); out['referenceGroupId'] = lg[0]
out['author'] = [r for r in con.execute("select * from authors where id = ?", (lg[1],))] if con.execute("select name from sqlite_master where name='authors'").fetchone() else lg[1]
out['section'] = con.execute('select id, name, description from sections where id=?', (grp[0]['section'],)).fetchone()
pairs = []; exact = 0
for k in range(max(len(grp), len(occ))):
    a = occ[k]['text'] if k < len(occ) else None; b = grp[k]['text'] if k < len(grp) else None
    same = (a is not None and b is not None and norm(a) == b); exact += same
    pairs.append(dict(n=k, fixtureId=occ[k]['id'] if k < len(occ) else None, kind=occ[k]['kind'] if k < len(occ) else None, same=same, fixture=a, reference=b,
                      fixtureAng=occ[k]['ang'] if k < len(occ) else None, fixturePrintedLine=occ[k].get('printedLine') if k < len(occ) else None, refAng=grp[k]['page'] if k < len(grp) else None, refPrintedLine=grp[k]['line'] if k < len(grp) else None))
out['exact'] = exact; out['pairs'] = pairs
# hygiene
alltext = ''.join(o['text'] for o in occ)
out['hygiene'] = dict(nfcStable=all(unicodedata.normalize('NFC', o['text']) == o['text'] for o in occ), nfdRoundTrip=all(unicodedata.normalize('NFC', unicodedata.normalize('NFD', o['text'])) == o['text'] for o in occ),
                      nonGurmukhiChars=sorted(set(ch for ch in alltext if not ('਀' <= ch <= '੿' or ch in ' ॥'))), usesUdaat=alltext.count('ੑ'), doubledHalfHa=alltext.count('੍ਹ੍ਹ'),
                      leadingOrTrailingSpace=[o['id'] for o in occ if o['text'] != o['text'].strip()], doubleSpaces=[o['id'] for o in occ if '  ' in o['text']])
out['ids'] = dict(unique=len(set(o['id'] for o in occ)) == len(occ), ordinalsInOrderWithinAng=all((occ[k]['ang'], occ[k]['ordinal']) < (occ[k + 1]['ang'], occ[k + 1]['ordinal']) for k in range(len(occ) - 1)))
out['rahao'] = dict(fixtureRahaoKinds=[o['id'][-3:] for o in occ if o['kind'] == 'rahao'], linesContainingRahaoWord=[o['id'][-3:] for o in occ if 'ਰਹਾਉ' in o['text']])
out['stanzaNumbersInText'] = [re.findall(r'॥([੦-੯]+)॥', o['text']) for o in occ]
out['angAgree'] = sum(1 for p in pairs if p['fixtureAng'] == p['refAng']); out['printedLineAgree'] = sum(1 for p in pairs if p['fixturePrintedLine'] == p['refPrintedLine'])
print({k: out[k] for k in ('referenceGroupId', 'referenceLinesInThisShabad', 'fixtureOccurrences', 'exact', 'angAgree', 'printedLineAgree', 'author', 'section')})
print('before:', out['lineBeforeShabad']); print('after :', out['lineAfterShabad'])
print('hygiene', out['hygiene']); print('ids', out['ids']); print('rahao', out['rahao'])
for p in pairs:
    if not p['same']: print('DIFF', p)
print([(p['n'], p['fixtureAng'], p['refAng'], p['fixturePrintedLine'], p['refPrintedLine']) for p in pairs])

json.dump(out, open(OUT, 'w'), ensure_ascii=False, indent=1)
