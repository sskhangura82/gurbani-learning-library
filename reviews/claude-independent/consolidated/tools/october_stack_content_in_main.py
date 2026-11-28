"""Is the teaching text in the October pull requests already in the published version by another route?
For several October heads: take every string of 40 or more characters from that branch's latest Nitnem course file
and count how many appear word for word anywhere in the published version's Nitnem data. Reads a local clone only.
Usage: python3 -I october_stack_content_in_main.py <repo with full history> <out.json> <pr number=commit> ..."""
import json, subprocess, sys
R, OUT, PAIRS = sys.argv[1], sys.argv[2], [a.split('=') for a in sys.argv[3:]]
def show(rev, path):
    r = subprocess.run(['git', '-C', R, 'show', f'{rev}:{path}'], capture_output=True)
    return r.stdout.decode('utf-8') if r.returncode == 0 else None
def strings(o, acc):
    if isinstance(o, str):
        if len(o) >= 40: acc.add(' '.join(o.split()))
    elif isinstance(o, list):
        for x in o: strings(x, acc)
    elif isinstance(o, dict):
        for x in o.values(): strings(x, acc)
    return acc
main = set()
for p in subprocess.run(['git', '-C', R, 'ls-tree', '-r', '--name-only', 'origin/main'], capture_output=True, text=True).stdout.splitlines():
    if p.startswith('nitnem/') and p.endswith('.json'):
        try: strings(json.loads(show('origin/main', p)), main)
        except ValueError: pass
out = dict(main=subprocess.run(['git', '-C', R, 'rev-parse', 'origin/main'], capture_output=True, text=True).stdout.strip(), stringsInPublishedNitnemData=len(main), pullRequests={})
for pr, rev in PAIRS:
    found = next(((v, t) for v in range(9, 0, -1) if (t := show(rev, f'nitnem/learning/course.v{v}.json'))), None)
    if not found: out['pullRequests'][pr] = dict(head=rev, courseFile=None); continue
    s = strings(json.loads(found[1]), set()); hit = len(s & main)
    out['pullRequests'][pr] = dict(head=rev, courseFile=f'course.v{found[0]}.json', strings=len(s), foundWordForWordInPublishedData=hit, notFound=len(s) - hit)
    print(f'#{pr}: {hit} of {len(s)} found word for word')
json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
