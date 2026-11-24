#!/usr/bin/env python3
"""Read-only comparison to pinned upstream Gurmukhi. No translation is imported.

Use --cache /path/to/source/upstream to verify already retrieved originals.
Without --cache, this downloads the manifest's original Markdown files to memory only.
The project retains ancient Gurmukhi, not the modern English translation in those files.
"""
from pathlib import Path
import argparse
import concurrent.futures
import hashlib
import json
import re
import urllib.request

ROOT = Path(__file__).resolve().parents[2]
ap = argparse.ArgumentParser()
ap.add_argument('--cache', type=Path)
args = ap.parse_args()
manifest = json.loads((ROOT / 'evidence/sukhmani-upstream-manifest.json').read_text())
script = (ROOT / 'js/sukhmani-data.js').read_text()
source = json.loads(script.split('window.GLP_SUKHMANI = ', 1)[1].rsplit(';', 1)[0])

def retrieve(entry):
    path = entry['path']
    if args.cache:
        raw = (args.cache / path).read_bytes()
    else:
        url = f"https://raw.githubusercontent.com/opengranth/open-granth/{manifest['commit']}/{path}"
        with urllib.request.urlopen(url, timeout=30) as response:
            raw = response.read()
    assert hashlib.sha256(raw).hexdigest() == entry['sha256'], path
    ang = int(re.search(r'ang-(\d+)', path)[1])
    return [(ang, int(m[1]), i, m[2]) for i, m in enumerate(
        re.finditer(r'<!-- LINE:(\d+) -->\s*\n\*\*(.*?)\*\*', raw.decode('utf-8'), re.S), 1)]

entries = [e for e in manifest['files'] if e['path'].startswith('corpus/')]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
    fetched = [row for page in ex.map(retrieve, entries) for row in page]
start = next(i for i,r in enumerate(fetched) if r[3]=='ਗਉੜੀ ਸੁਖਮਨੀ ਮਃ ੫ ॥')
end = next(i for i,r in enumerate(fetched) if r[3].endswith('॥੮॥੧੨॥'))
selected = fetched[start:end+1]
runtime = [l for a in source['ashtpadis'] for l in a['lines']]
assert len(selected)==len(runtime)==1019
for line,row in zip(runtime, selected):
    assert (line['ang'],line['sourceLine'],line['sourceRecord'],line['gurmukhi'])==row,line['id']
print(json.dumps({'status':'PASS','matchedSourceOccurrences':len(runtime),'pinnedCommit':manifest['commit'],'networkUsed':not bool(args.cache)}))
