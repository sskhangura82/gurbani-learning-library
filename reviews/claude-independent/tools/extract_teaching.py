#!/usr/bin/env python3
"""Flatten every meaning entry and every passage study shipped by the app.
Usage: python3 -I extract_teaching.py <repo_root> <out_meanings.json> <out_studies.json>"""
import json, sys, re, pathlib
def load_js(path):
    s = pathlib.Path(path).read_text(encoding='utf-8'); out = {}
    for m in re.finditer(r'window\.([A-Z_0-9]+)\s*=\s*', s):
        out[m.group(1)], _ = json.JSONDecoder().raw_decode(s[m.end():])
    return out
def strings(o, path=''):
    """yield (path, string) for every string leaf"""
    if isinstance(o, str): yield path, o
    elif isinstance(o, dict):
        for k, v in o.items(): yield from strings(v, f'{path}.{k}' if path else k)
    elif isinstance(o, list):
        for i, v in enumerate(o): yield from strings(v, f'{path}[{i}]')
root = pathlib.Path(sys.argv[1]); meanings = []; studies = []
jm = load_js(root / 'js/line-meanings.js')['GLP_LINE_MEANINGS']
for e in jm: meanings.append(dict(comp='japji', id=e['id'], en=e.get('english', ''), pa=e.get('punjabi', ''), extra={k: v for k, v in e.items() if k not in ('id', 'english', 'punjabi')}))
jl = load_js(root / 'js/japji-lessons.js')['GLP_JAPJI_LESSONS']['lessons']
for k, v in jl.items(): studies.append(dict(comp='japji', kind='unit', id=k, fields=dict(strings(v)), raw_keys=sorted(v.keys())))
st = load_js(root / 'js/sukhmani-teaching.js')['GLP_SUKHMANI_TEACHING']
for k, v in st['meanings'].items(): meanings.append(dict(comp='sukhmani', id=k, en=v.get('en', ''), pa=v.get('pa', ''), extra={kk: vv for kk, vv in v.items() if kk not in ('en', 'pa')}))
def walk_sk(a_no, a):
    tag = f'ashtpadi{int(a_no):02d}'
    studies.append(dict(comp='sukhmani', kind='ashtpadi_overview', id=tag, fields=dict(strings({k: v for k, v in a.items() if k not in ('pauris', 'salok', 'rahau')})), raw_keys=sorted(a.keys())))
    for key in ('salok', 'rahau'):
        if a.get(key): studies.append(dict(comp='sukhmani', kind=key, id=f'{tag}.{key}', fields=dict(strings(a[key])), raw_keys=sorted(a[key].keys()) if isinstance(a[key], dict) else []))
    sub = a.get('pauris')
    items = sub.items() if isinstance(sub, dict) else enumerate(sub or [], 1)
    for pk, pv in items: studies.append(dict(comp='sukhmani', kind='pauri', id=f'{tag}.pauri{pk}', fields=dict(strings(pv)), raw_keys=sorted(pv.keys()) if isinstance(pv, dict) else []))
for k, a in st['ashtpadis'].items(): walk_sk(k, a)
c = json.loads((root / 'nitnem/learning/course.complete.json').read_text(encoding='utf-8'))
for k, v in c['closeTextNotes'].items():
    meanings.append(dict(comp=k.split('|')[0], id=k.split('|')[1], en=v.get('simpleEn', ''), pa=v.get('simplePa', ''), extra={kk: vv for kk, vv in v.items() if kk not in ('simpleEn', 'simplePa')}))
for k, v in c['unitLessons'].items(): studies.append(dict(comp=k.split('|')[0], kind='unit', id=k.split('|')[-1], fields=dict(strings(v)), raw_keys=sorted(v.keys())))
json.dump(meanings, open(sys.argv[2], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(studies, open(sys.argv[3], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
from collections import Counter
print('meanings', len(meanings), dict(Counter(m['comp'] for m in meanings)))
print('studies', len(studies), dict(Counter((s['comp'], s['kind']) for s in studies)))
print('sukhmani ashtpadi keys:', sorted(st['ashtpadis']['1'].keys()))
print('nitnem closeTextNotes sample:', json.dumps(list(c['closeTextNotes'].items())[0], ensure_ascii=False)[:700])
print('nitnem unitLesson keys:', Counter(tuple(sorted(v.keys())) for v in c['unitLessons'].values()).most_common(4))
print('sukhmani meta:', json.dumps(st['meta'], ensure_ascii=False)[:900])
print('course meta:', json.dumps(c['meta'], ensure_ascii=False)[:1500]); print('coverage:', json.dumps(c['coverage'], ensure_ascii=False)[:900])
