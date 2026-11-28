#!/usr/bin/env python3
"""Round 2 · recovery of the existing Salok Mahalla 9 draft (branch feature/glp-sukhmani-salok9-source-intake-20261027, commit d0dc1f2)
and comparison of its Gurmukhi with the reference (Shabad OS Database v5.0.0-next.0, asset SSA2).
Usage: python3 -I k01_salok9_recovered_draft.py <candidate.json> <master.sqlite> <out.json>"""
import json, sqlite3, re, importlib.util, unicodedata, sys
CAND, DB, OUT = sys.argv[1:4]
d = json.load(open(CAND, encoding='utf-8'))
spec = importlib.util.spec_from_file_location('s05', '/home/claude/gurbani-learning-library/reviews/claude-independent/tools/s05_collate_shabados.py'); s05 = importlib.util.module_from_spec(spec); spec.loader.exec_module(s05)
con = sqlite3.connect(f'file:{DB}?mode=ro', uri=True); ref = [r for r in s05.load_ref(con) if r['asset'] == 'SSA2']
i0 = next(i for i, r in enumerate(ref) if r['page'] >= 1426 and 'ਸਲੋਕ ਮਹਲਾ ੯' in r['text'])
i1 = next(i for i in range(i0, len(ref)) if '॥੫੭॥' in ref[i]['text'])
while ref[i0 - 1]['page'] == 1426 and 'ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ' in ref[i0 - 1]['text']: i0 -= 1
R = ref[i0:i1 + 1]
def texts(o, acc):
    if isinstance(o, dict):
        for k, v in o.items():
            if isinstance(v, str) and re.search(r'[਀-੿]', v) and k.lower() in ('gurmukhi', 'unicode', 'text', 'gurmukhiunicode', 'original', 'line', 'title', 'heading'): acc.append((k, v))
            else: texts(v, acc)
    elif isinstance(o, list):
        for x in o: texts(x, acc)
    return acc
print('first salok record:', json.dumps(d['saloks'][0], ensure_ascii=False)[:700]); print('headings:', json.dumps(d['sourceHeadings'], ensure_ascii=False)[:500]); print('provenance keys:', list(d['provenance'].keys()))
cand = [re.sub(r'\s+', ' ', v).strip() for k, v in texts(d['sourceHeadings'], []) + texts(d['saloks'], [])]
RT = [r['text'] for r in R]; seen = set(RT)
out = dict(recoveredFrom='branch feature/glp-sukhmani-salok9-source-intake-20261027, commit d0dc1f29666fa2615234d4b62899873179bde024, file study/sources/salok-mahala9-shabados-487-candidate.json',
           candidateSays=dict(salokCount=d['salokCount'], sourceRowCount=d['sourceRowCount'], pageSpan=d['pageSpan'], admission=d['admission'], teachingState=d['teachingState'], publicationAllowed=d['publicationAllowed']),
           reference=dict(lines=len(R), firstPage=R[0]['page'], lastPage=R[-1]['page'], first=R[0]['text'], last=R[-1]['text'], lineBefore=ref[i0 - 1]['text'], lineAfter=ref[i1 + 1]['text'] if i1 + 1 < len(ref) else None),
           candidateGurmukhiStrings=len(cand), candidateStringsFoundExactlyInReference=sum(c in seen for c in cand), referenceLinesPresentInCandidate=sum(t in set(cand) for t in RT),
           notFoundInReference=[c for c in cand if c not in seen][:20], referenceLinesMissingFromCandidate=[t for t in RT if t not in set(cand)][:20], sameOrder=([c for c in cand if c in seen] == [t for t in RT if t in set(cand)]),
           nfcStable=all(unicodedata.normalize('NFC', c) == c for c in cand))
json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print(json.dumps(out, ensure_ascii=False, indent=1)[:2600])
