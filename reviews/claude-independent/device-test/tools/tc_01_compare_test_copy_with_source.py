"""Is the test copy what it says it is?  Compare every file in the test repository, at its staging commit, with the
repair candidate it names as its source; recompute every fingerprint in its offline list; look for anything personal.
Reads two local clones; changes nothing.
Usage: python3 -I tc_01_compare_test_copy_with_source.py <source repo> <source commit> <test repo> <staging commit> <out.json>"""
import collections, hashlib, json, re, subprocess, sys
SRC, SRC_REV, DST, DST_REV, OUT = sys.argv[1:6]
def git(repo, *a, raw=False):
    r = subprocess.run(['git', '-C', repo, *a], capture_output=True, check=True)
    return r.stdout if raw else r.stdout.decode('utf-8')
def tree(repo, rev):
    d = {}
    for line in git(repo, 'ls-tree', '-r', rev).splitlines():
        meta, path = line.split('\t', 1); d[path] = meta.split()[2]
    return d
a, b = tree(SRC, SRC_REV), tree(DST, DST_REV)
same = sorted(p for p in b if a.get(p) == b[p]); changed = sorted(p for p in b if p in a and a[p] != b[p]); extra = sorted(p for p in b if p not in a); missing = sorted(p for p in a if p not in b)
def lines_changed(p):
    import difflib
    x = git(SRC, 'show', f'{SRC_REV}:{p}').splitlines(); y = git(DST, 'show', f'{DST_REV}:{p}').splitlines()
    out = [l for l in difflib.unified_diff(x, y, lineterm='', n=0) if l[:1] in '+-' and l[:3] not in ('+++', '---')]
    return dict(removed=sum(l[0] == '-' for l in out), added=sum(l[0] == '+' for l in out), addedLines=[l[1:240] for l in out if l[0] == '+'][:6])
sw = git(DST, 'show', f'{DST_REV}:sw.js'); expected = json.loads(re.search(r'const EXPECTED=(\{.*?\});', sw, re.S).group(1))
ok, bad = 0, []
for path, digest in expected.items():
    rel = path[2:] or 'index.html'
    rel = rel + 'index.html' if rel.endswith('/') else rel
    if rel not in b: bad.append(('file missing', path)); continue
    if hashlib.sha256(git(DST, 'show', f'{DST_REV}:{rel}', raw=True)).hexdigest() == digest: ok += 1
    else: bad.append(('fingerprint differs', path))
pages = [p for p in b if p.endswith('.html')]
text = {p: git(DST, 'show', f'{DST_REV}:{p}') for p in b if p.rsplit('.', 1)[-1] in ('html', 'js', 'json', 'css', 'md', 'txt', 'webmanifest')}
R = {
 'source': dict(commit=git(SRC, 'rev-parse', SRC_REV).strip(), files=len(a)), 'testCopy': dict(commit=git(DST, 'rev-parse', DST_REV).strip(), files=len(b), commitsInRepository=int(git(DST, 'rev-list', '--count', DST_REV).strip())),
 'byteIdentical': dict(count=len(same), byType=dict(collections.Counter(p.rsplit('.', 1)[-1] for p in same)), everyScriptIdentical=all(p in same for p in b if p.endswith('.js') and p != 'sw.js'), everyDataFileIdentical=all(p in same for p in b if p.endswith('.json') and p in a), dataFilesOnlyInTheTestCopy=[p for p in extra if p.endswith('.json')]),
 'changed': {p: lines_changed(p) for p in changed}, 'onlyInTestCopy': extra,
 'notCopied': dict(count=len(missing), byTopFolder=dict(collections.Counter(p.split('/')[0] for p in missing)), licenceAndNoticeFilesNotCopied=[p for p in missing if p.startswith('vendor/')]),
 'offlineList': dict(entries=len(expected), fingerprintMatchesFile=ok, problems=bad, version=re.search(r'const VERSION="([^"]+)"', sw).group(1)),
 'pages': dict(count=len(pages), withTheTestBanner=sum('glp-qa-banner' in text[p] for p in pages), withANoIndexRequest=sum('name="robots"' in text[p] and 'noindex' in text[p] for p in pages), bannerText=sorted({m for p in pages for m in re.findall(r'<aside class="glp-qa-banner"[^>]*>(.*?)</aside>', text[p])}),
               buildLabelVisibleOnAnyPage=any(re.search(r'09e829e|9929720|build\s*(label|date|id)', re.sub(r'<script.*?</script>', '', text[p], flags=re.S), re.I) for p in pages)),
 'personalDataScan': dict(emailAddresses=sorted({m for t in text.values() for m in re.findall(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[a-z]{2,}', t)}), exportedLearningFiles=[p for p in b if 'learning' in p.lower() and p.endswith('.json') and '"records"' in text.get(p, '') and 'glp-family-learning' in text.get(p, '')]),
}
json.dump(R, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps({k: R[k] for k in ('byteIdentical', 'onlyInTestCopy', 'offlineList', 'pages', 'personalDataScan')}, ensure_ascii=False)[:1500]); print('changed:', {p: (v['removed'], v['added']) for p, v in R['changed'].items()}); print('not copied:', R['notCopied'])
