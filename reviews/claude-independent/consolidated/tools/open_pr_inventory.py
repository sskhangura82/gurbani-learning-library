"""Where does every open pull request stand against the published version?
For each: when it left main, how far ahead and behind it is, how many files it changed, where those files stand in
main today, and whether merging it into today's main would conflict. Facts only; no judgement about what to keep.
Needs a clone with FULL history (a shallow clone gives wrong answers — the first run of this check did, and was thrown away).
Usage: gh api "repos/<owner>/<repo>/pulls?state=open&per_page=100" --jq '.[] | [.number,.draft,.head.ref,.head.sha,.base.ref,.created_at[0:10],.updated_at[0:10],.title] | @tsv' > prs.tsv
       python3 -I open_pr_inventory.py <repo> prs.tsv <out.json>"""
import csv, json, subprocess, sys
R, TSV, OUT = sys.argv[1:4]
def g(*a): return subprocess.run(['git', '-C', R, *a], capture_output=True, text=True).stdout.strip()
assert g('rev-parse', '--is-shallow-repository') == 'false', 'needs full history'
def tree(rev):
    d = {}
    for l in g('ls-tree', '-r', rev).splitlines():
        m, p = l.split('\t', 1); d[p] = m.split()[2]
    return d
M = tree('origin/main'); blobs = set(M.values()); rows = []
for n, draft, ref, sha, base, created, updated, title in csv.reader(open(TSV, encoding='utf-8'), delimiter='\t'):
    mb = g('merge-base', 'origin/main', sha); T = tree(sha); changed = g('diff', '--name-only', f'origin/main...{sha}').splitlines()
    rows.append(dict(number=int(n), draft=draft == 'true', branch=ref, head=sha[:7], base=base, opened=created, lastCommit=g('log', '-1', '--format=%cI', sha)[:10], title=title,
        headAlreadyInMain=subprocess.run(['git', '-C', R, 'merge-base', '--is-ancestor', sha, 'origin/main']).returncode == 0,
        leftMainOn=g('log', '-1', '--format=%cI', mb)[:10], commitsAhead=int(g('rev-list', '--count', f'origin/main..{sha}')), commitsBehind=int(g('rev-list', '--count', f'{sha}..origin/main')),
        filesChangedSinceLeavingMain=len(changed),
        ofThose=dict(sameInMainToday=sum(1 for p in changed if p in T and M.get(p) == T[p]), differentInMainToday=sum(1 for p in changed if p in T and p in M and M[p] != T[p]), notInMainToday=sum(1 for p in changed if p in T and p not in M and T[p] not in blobs)),
        wouldConflictWithMainToday=subprocess.run(['git', '-C', R, 'merge-tree', '--write-tree', '--name-only', 'origin/main', sha], capture_output=True).returncode != 0))
rows.sort(key=lambda r: r['number'])
json.dump(dict(main=g('rev-parse', 'origin/main'), commitsOnMain=int(g('rev-list', '--count', 'origin/main')), openPullRequests=len(rows), rows=rows), open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
old = [r for r in rows if r['opened'] < '2026-11-01']
print(len(rows), 'open |', len(old), 'opened in October |', sum(r['wouldConflictWithMainToday'] for r in old), 'of those would conflict with main today |', sum(r['base'] != 'main' for r in old), 'of those are stacked on another branch |', sum(r['headAlreadyInMain'] for r in rows), 'already in main')
print('October set: behind main by', sorted({r['commitsBehind'] for r in old}), '| last commit between', min(r['lastCommit'] for r in old), 'and', max(r['lastCommit'] for r in old), '| largest:', max(old, key=lambda r: r['filesChangedSinceLeavingMain'])['number'], max(r['filesChangedSinceLeavingMain'] for r in old), 'files')
