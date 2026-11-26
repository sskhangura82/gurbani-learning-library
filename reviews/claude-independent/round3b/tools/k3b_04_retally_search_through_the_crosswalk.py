"""Round 3b: the round 3 search matrix hard-codes the old passage names, which PR #48 has renamed. Re-judge every
case by mapping my old expectation through the candidate's own crosswalk (legacyPassageIds), so round 3 and round 3b
can be compared honestly — and so the crosswalk itself is exercised. Nothing else about the cases is changed.
Usage: python3 -I k3b_04_retally_search_through_the_crosswalk.py <round3 matrix json> <round3b matrix json> <scripture.json> <out.json>"""
import collections, json, re, sys
OLD, NEW, SC, OUT = sys.argv[1:5]
old = json.load(open(OLD, encoding='utf-8')); new = json.load(open(NEW, encoding='utf-8')); sc = json.load(open(SC, encoding='utf-8'))
cross = sc['legacyPassageIds']
def translate(x):
    if isinstance(x, str): return cross.get(x, x)
    if isinstance(x, list): return [translate(i) for i in x]
    return x
def judged(c):
    if c['ok']: return True, 'as judged by the script'
    exp, got = c['expect'], c['got']
    if isinstance(exp, str) and exp.startswith('subset of '):
        want = translate(exp[len('subset of '):])
        ids = [g.split(' (')[0] for g in got] if got and isinstance(got[0], str) else got
        return bool(ids) and all(i == want for i in ids), 'old name in my expectation, translated'
    want = translate(exp)
    ids = [g.split(' (')[0] for g in got] if got and isinstance(got[0], str) else got
    if isinstance(want, list) and sorted(ids) == sorted(want): return True, 'old name in my expectation, translated'
    return False, 'genuinely not met'
tally = collections.defaultdict(lambda: [0, 0]); fixed = []; still = []
for c in new['cases']:
    ok, why = judged(c); g = c['group']; tally[g][0] += 1; tally[g][1] += ok
    if ok and not c['ok']: fixed.append(dict(group=g, query=c['query'], opts=c.get('opts'), reason=why))
    if not ok: still.append(dict(group=g, query=c['query'], opts=c.get('opts'), expect=c['expect'], got=c['got'][:3] if isinstance(c['got'], list) else c['got']))
oldt = collections.defaultdict(lambda: [0, 0])
for c in old['cases']: oldt[c['group']][0] += 1; oldt[c['group']][1] += bool(c['ok'])
R = dict(note='The round 3 cases, re-judged with my old passage names mapped through the candidate crosswalk. Only the expectation name is translated.',
         crosswalkUsed=cross, casesRound3=len(old['cases']), casesRound3b=len(new['cases']),
         totalRound3=sum(v[1] for v in oldt.values()), totalRound3b=sum(v[1] for v in tally.values()),
         casesThatOnlyFailedBecauseOfTheRename=len(fixed), stillNotMet=len(still),
         byGroup={g: dict(round3=oldt.get(g, [0, 0]), round3b=tally[g]) for g in sorted(set(tally) | set(oldt))}, stillNotMetCases=still)
print(json.dumps({k: R[k] for k in ('casesRound3', 'casesRound3b', 'totalRound3', 'totalRound3b', 'casesThatOnlyFailedBecauseOfTheRename', 'stillNotMet')}))
for g, v in R['byGroup'].items():
    a, b = v['round3'], v['round3b']
    flag = '' if (a[0] and a[1] / a[0]) == (b[1] / b[0] if b[0] else 0) else '   <-- differs'
    print(f"  {g[:46]:46} round 3 {str(a[1])+'/'+str(a[0]):>8}   round 3b {str(b[1])+'/'+str(b[0]):>8}{flag}")
json.dump(R, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
