#!/usr/bin/env python3
"""Round 2 · PR #41 · XS-01…04, XT-01: every piece of Gurmukhi in explore/lesson-17.json against the reference
(Shabad OS Database v5.0.0-next.0, asset SSA2) and against the app's own Sukhmani reader data.
Usage: python3 -I x01_lesson17_against_reference.py <site-root> <master.sqlite> <out.json>"""
import json, sys, sqlite3, re, unicodedata, importlib.util, glob, os
SITE, DB, OUT = sys.argv[1:4]
L = json.load(open(SITE + 'explore/lesson-17.json', encoding='utf-8'))
spec = importlib.util.spec_from_file_location('s05', '/home/claude/gurbani-learning-library/reviews/claude-independent/tools/s05_collate_shabados.py'); s05 = importlib.util.module_from_spec(spec); spec.loader.exec_module(s05)
con = sqlite3.connect(f'file:{DB}?mode=ro', uri=True)
ref = [r for r in s05.load_ref(con) if r['asset'] == 'SSA2']
# Ashtpadi 17 in the reference: from the Salok 'ਆਦਿ ਸਚੁ ਜੁਗਾਦਿ ਸਚੁ ॥' on Ang 285 to the line ending ॥੮॥੧੭॥
i0 = next(i for i, r in enumerate(ref) if r['page'] == 285 and r['text'].startswith('ਆਦਿ ਸਚੁ ਜੁਗਾਦਿ ਸਚੁ'))
while not ref[i0 - 1]['text'].endswith('॥੮॥੧੬॥'): i0 -= 1
i1 = next(i for i in range(i0, i0 + 200) if ref[i]['text'].endswith('॥੮॥੧੭॥'))
A = ref[i0:i1 + 1]
units = {}; cur = 'salok'; n = 0; units[cur] = []
for r in A:
    t = r['text']
    if t.strip() in ('ਸਲੋਕੁ ॥', 'ਅਸਟਪਦੀ ॥'):
        units.setdefault('headings', []).append(r); continue
    units.setdefault(cur, []).append(r)
    m = re.search(r'॥([੧-੮])॥(੧੭॥)?$', t)
    if m and not (cur == 'salok' and len(units[cur]) < 2):
        if cur == 'salok': cur = 'pauri-1'
        else:
            k = int(cur.split('-')[1]); cur = f'pauri-{k + 1}'
        units.setdefault(cur, [])
units = {k: v for k, v in units.items() if v}
out = {'reference': 'Shabad OS Database v5.0.0-next.0, asset SSA2', 'referenceLinesInAshtpadi17': len(A), 'referenceUnits': {k: dict(lines=len(v), pages=sorted({r['page'] for r in v}), first=v[0]['text'], last=v[-1]['text']) for k, v in units.items()}}
gur = re.compile(r'[਀-੿]')
rows = []
for u in L['units']:
    R = units.get(u['id'], []); joined = ' '.join(r['text'] for r in R); words = set(re.findall(r'[਀-੿]+', joined))
    pages = sorted({r['page'] for r in R}); claim = [int(x) for x in re.findall(r'\d+', str(u['ang']))]
    row = dict(unit=u['id'], cue=u['cue'], cueIsFirstLineOfUnit=(bool(R) and R[0]['text'] == u['cue']), cueFoundExactlyInUnit=any(r['text'] == u['cue'] for r in R),
               angClaimed=u['ang'], angInReference=pages, angMatches=(claim == pages), nfcStable=(unicodedata.normalize('NFC', u['cue']) == u['cue']), vocabulary=[])
    for v in u['vocabulary']:
        parts = v['g'].split(); inUnit = (v['g'] in joined) if len(parts) > 1 else (v['g'] in words)
        elsewhere = [k for k, rr in units.items() if k not in ('headings', u['id']) and ((v['g'] in ' '.join(r['text'] for r in rr)) if len(parts) > 1 else (v['g'] in set(re.findall(r'[਀-੿]+', ' '.join(r['text'] for r in rr)))))]
        row['vocabulary'].append(dict(word=v['g'], roman=v['roman'], inThisUnitExactly=inUnit, foundInstead=elsewhere if not inUnit else None))
    rows.append(row)
out['units'] = rows
# Gurmukhi quoted inside the English teaching text
quoted = []
for u in L['units']:
    for field in ('newcomer', 'deep', 'caution', 'prompt'):
        for m in re.findall(r'[਀-੿][਀-੿ ]*[਀-੿]|[਀-੿]', u.get(field, '')):
            allw = set(re.findall(r'[਀-੿]+', ' '.join(r['text'] for r in ref[i0 - 3000:i1 + 3000])))
            quoted.append(dict(unit=u['id'], field=field, text=m, wordInAshtpadi17=all(w in set(re.findall(r'[਀-੿]+', ' '.join(r['text'] for r in A))) for w in m.split())))
out['gurmukhiQuotedInEnglish'] = quoted
# The 'ਭੀ / ਭਿ' claim
jap = next(r for r in ref if r['page'] == 1 and r['text'].startswith('ਹੈ ਭੀ ਸਚੁ')) if any(r['page'] == 1 and r['text'].startswith('ਹੈ ਭੀ ਸਚੁ') for r in ref) else None
out['japjiLine'] = jap['text'] if jap else [r['text'] for r in ref if r['page'] == 1][:8]
out['sukhmaniSalokLine2'] = units['salok'][1]['text'] if len(units['salok']) > 1 else None
# The app's own Sukhmani reader data for the same lines (does the lesson's cue equal what the reader shows?)
hits = {}
for f in glob.glob(SITE + '**/*.js', recursive=True) + glob.glob(SITE + '**/*.json', recursive=True):
    if '/explore/' in f or '/node_modules/' in f: continue
    try: s = open(f, encoding='utf-8').read()
    except Exception: continue
    for u in L['units']:
        if u['cue'] in s: hits.setdefault(u['id'], []).append(os.path.relpath(f, SITE))
out['cueFoundInAppReaderData'] = {u['id']: hits.get(u['id'], []) for u in L['units']}
out['summary'] = dict(units=len(rows), cuesExact=sum(r['cueFoundExactlyInUnit'] for r in rows), cuesAreFirstLine=sum(r['cueIsFirstLineOfUnit'] for r in rows), angsMatch=sum(r['angMatches'] for r in rows),
                      vocabularyWords=sum(len(r['vocabulary']) for r in rows), vocabularyInItsUnit=sum(v['inThisUnitExactly'] for r in rows for v in r['vocabulary']),
                      vocabularyNotInItsUnit=[(r['unit'], v['word'], v['foundInstead']) for r in rows for v in r['vocabulary'] if not v['inThisUnitExactly']])
json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps(out['summary'], ensure_ascii=False, indent=1)); print(json.dumps(out['referenceUnits'], ensure_ascii=False, indent=1)[:2500]); print(out['japjiLine'], '|', out['sukhmaniSalokLine2']); print(json.dumps(out['gurmukhiQuotedInEnglish'], ensure_ascii=False)); print(json.dumps(out['cueFoundInAppReaderData'], ensure_ascii=False))
