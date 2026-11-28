#!/usr/bin/env python3
"""S-07 structure: unit counts and verse-number sequences.
Usage: python3 -I s07_structure.py <app_corpus.json> <out.json>"""
import json, sys, re
from collections import defaultdict, OrderedDict
G = {c: i for i, c in enumerate('੦੧੨੩੪੫੬੭੮੯')}
def num(s): 
    n = 0
    for ch in s: n = n * 10 + G[ch]
    return n
def marks(text): return [[num(x) for x in re.findall(r'[੦-੯]+', m)] for m in re.findall(r'॥(?:[੦-੯]+॥)+', text)]
occ = json.load(open(sys.argv[1], encoding='utf-8'))
units = defaultdict(OrderedDict)
for o in occ:
    if o['kind'] in ('preface', 'heading') and o['comp'] != 'sukhmani': continue
    units[o['comp']].setdefault(o['unit'], []).append(o)
res = {}
def report(comp, msg): res.setdefault(comp, {}).setdefault('anomalies', []).append(msg)
# Japji
u = units['japji']; names = list(u)
res['japji'] = dict(units=len(names), unit_ids=names, lines=sum(len(v) for v in u.values()), anomalies=[])
pauri = [k for k in names if k.startswith('pauri')]
for i, k in enumerate(pauri, 1):
    m = marks(u[k][-1]['text'])
    if not m or m[-1][0] != i: report('japji', f'{k}: closing mark {m} expected {i}')
    inner = [x for ln in u[k][:-1] for x in marks(ln['text'])]
    if inner: res['japji'].setdefault('inner_marks', {})[k] = inner
res['japji']['pauris'] = len(pauri)
# Nitnem six: closing number of each unit
for comp, start in (('jaap', 1), ('savaiye', 1), ('chaupai', 1), ('anand', 1)):
    u = units[comp]; names = list(u); res[comp] = dict(units=len(names), lines=sum(len(v) for v in u.values()), anomalies=[])
    for i, k in enumerate(names, start):
        m = marks(u[k][-1]['text'])
        if not m or m[-1][0] != i: report(comp, f'{k}: closing mark {m} expected {i}; last line: {u[k][-1]["text"]}')
        inner = [(ln['id'], x) for ln in u[k][:-1] for x in marks(ln['text'])]
        if inner: report(comp, f'{k}: number mark inside the unit before its last line: {inner}')
        n = len(u[k])
        res[comp].setdefault('lines_per_unit_histogram', {}); h = res[comp]['lines_per_unit_histogram']; h[str(n)] = h.get(str(n), 0) + 1
# Sohila: five shabads; print closing marks
u = units['sohila']; res['sohila'] = dict(units=len(u), lines=sum(len(v) for v in u.values()), closing={k: marks(v[-1]['text']) for k, v in u.items()},
                                         all_marks={k: [(ln['id'].split('.')[-1], marks(ln['text'])) for ln in v if marks(ln['text'])] for k, v in u.items()}, anomalies=[])
# Rehras
u = units['rehras']; res['rehras'] = dict(units=len(u), lines=sum(len(v) for v in u.values()), closing={k: marks(v[-1]['text'])[-1:] for k, v in u.items()}, anomalies=[])
# Sukhmani
sk = [o for o in occ if o['comp'] == 'sukhmani']
by_a = defaultdict(list)
for o in sk: by_a[o['ashtpadi']].append(o)
res['sukhmani'] = dict(ashtpadis=len(by_a), lines=len(sk), anomalies=[], kinds={}, pauris=0, saloks=0)
from collections import Counter
res['sukhmani']['kinds'] = dict(Counter(o['kind'] for o in sk))
for a in sorted(by_a):
    lines = by_a[a]
    pauris = defaultdict(list); 
    for o in lines:
        if o['kind'] == 'pauri': pauris[o['pauri']].append(o)
    if sorted(pauris) != list(range(1, 9)): report('sukhmani', f'ashtpadi {a}: pauri numbers {sorted(pauris)}')
    res['sukhmani']['pauris'] += len(pauris)
    for p in sorted(pauris):
        m = marks(pauris[p][-1]['text'])
        exp = [p] if p < 8 else [8, a]
        if not m or m[-1] != exp: report('sukhmani', f'ashtpadi {a} pauri {p}: closing {m} expected {exp} :: {pauris[p][-1]["text"]}')
        if len(pauris[p]) != 10: res['sukhmani'].setdefault('pauris_not_10_lines', []).append((a, p, len(pauris[p])))
    sal = [o for o in lines if o['kind'] == 'salok']
    if sal:
        res['sukhmani']['saloks'] += 1
        m = marks(sal[-1]['text'])
        # every Sukhmani salok closes with ॥੧॥ in Sri Guru Granth Sahib
        if not m or m[-1] != [1]: report('sukhmani', f'ashtpadi {a} salok closing {m} expected [1] :: {sal[-1]["text"]}')
    else: report('sukhmani', f'ashtpadi {a}: no salok lines')
res['sukhmani']['rahau_lines'] = [o['text'] for o in sk if o['kind'] == 'rahau']
res['sukhmani']['headings'] = dict(Counter(o['text'] for o in sk if o['kind'] == 'heading'))
res['sukhmani']['ang_range'] = [min(o['ang'] for o in sk), max(o['ang'] for o in sk)]
json.dump(res, open(sys.argv[2], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for k, v in res.items():
    print('==', k, {kk: vv for kk, vv in v.items() if kk not in ('anomalies', 'unit_ids', 'closing', 'all_marks', 'rahau_lines', 'headings')})
    for a in v.get('anomalies', []): print('   ANOMALY', a)
print('sohila closing', res['sohila']['closing']); print('rehras closing', res['rehras']['closing'])
print('sukhmani rahau', res['sukhmani']['rahau_lines']); print('sukhmani headings', res['sukhmani']['headings'])
