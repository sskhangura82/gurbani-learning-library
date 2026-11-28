"""Round 3 — collate the 19 Gurbani rows of PR #45 (knowledge/pilot.json) against
 (a) my pinned reference: Shabad OS Database 5.0.0-next.0, asset SSA2 (pause marks removed, as in round 1 and 2), and
 (b) the file the pilot itself cites: Open Granth at commit 34d2a7c.
Also checks boundaries (against tools/k3_00 output), order, Ang, printed line, row number, file fingerprints,
character inventory, and every other string of Gurmukhi in the file.
Usage: python3 -I k3_01_collate_pilot_source.py <pilot.json> <master.sqlite> <open-granth dir> <k3_00 json> <out.json>
"""
import sys, json, re, sqlite3, hashlib, unicodedata, subprocess, importlib.util, os

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('s05', os.path.join(HERE, '..', '..', 'tools', 's05_collate_shabados.py'))
s05 = importlib.util.module_from_spec(spec); spec.loader.exec_module(s05)

GUR = re.compile(r'[਀-੿]')
def og_rows(path):
    rows = []; line_no = None
    for ln in open(path, encoding='utf-8'):
        m = re.match(r'<!-- LINE:(\d+) -->', ln)
        if m: line_no = int(m.group(1)); continue
        m = re.match(r'\*\*(.+)\*\*\s*$', ln)
        if m and GUR.search(m.group(1)): rows.append(dict(ordinal=len(rows) + 1, printedLine=line_no, text=m.group(1)))
    return rows

def main(pilot_path, db, og_dir, bounds_path, out):
    raw = open(pilot_path, 'rb').read()
    g = json.loads(raw)
    bounds = json.load(open(bounds_path, encoding='utf-8'))['groups']
    res = dict(pilotSha256=hashlib.sha256(raw).hexdigest(), counts={}, passages=[], rows=[], other=[])
    occ = {o['id']: o for o in g['occurrences']}
    res['counts'] = dict(nodes=len(g['nodes']), edges=len(g['edges']), occurrences=len(g['occurrences']),
                         byType={t: sum(1 for n in g['nodes'] if n['type'] == t) for t in sorted({n['type'] for n in g['nodes']})})
    all_exact_ref = all_exact_og = 0
    for p in [n for n in g['nodes'] if n['type'] == 'passage']:
        rows = [occ[i] for i in p['occurrenceIds']]
        # find the reference group whose last line equals the pilot's last row
        cand = [b for b in bounds if s05.norm_ref(b['lines'][-1]['raw']) == rows[-1]['text']]
        entry = dict(id=p['id'], rows=len(rows), referenceGroupsEndingOnSameLine=len(cand))
        if len(cand) == 1:
            b = cand[0]
            ref = [dict(text=s05.norm_ref(l['raw']), page=l['page'], line=l['line']) for l in b['lines']]
            entry.update(referenceLines=len(ref), referenceAuthor=b['author'], sameLength=len(ref) == len(rows),
                         firstLineSame=ref[0]['text'] == rows[0]['text'], lastLineSame=ref[-1]['text'] == rows[-1]['text'])
            og = og_rows(os.path.join(og_dir, rows[0]['sourcePath']))
            blob = subprocess.run(['git', '-C', og_dir, 'hash-object', rows[0]['sourcePath']], capture_output=True, text=True).stdout.strip()
            for i, o in enumerate(rows):
                r = ref[i] if i < len(ref) else None
                ogr = og[o['ordinal'] - 1] if 0 < o['ordinal'] <= len(og) else None
                row = dict(id=o['id'], ang=o['ang'], ordinal=o['ordinal'], printedLine=o['printedLine'], text=o['text'],
                           equalsReference=bool(r and r['text'] == o['text']), referenceAng=r and r['page'], referenceLine=r and r['line'],
                           angSame=bool(r and r['page'] == o['ang']), printedLineSame=bool(r and r['line'] == o['printedLine']),
                           equalsCitedFileRow=bool(ogr and ogr['text'] == o['text']), citedFilePrintedLine=ogr and ogr['printedLine'],
                           citedFileFingerprintSame=blob == o['sourceBlob'],
                           nfc=unicodedata.normalize('NFC', o['text']) == o['text'],
                           oddCharacters=sorted({'U+%04X' % ord(c) for c in o['text'] if not (GUR.match(c) or c in ' ॥')}))
                all_exact_ref += row['equalsReference']; all_exact_og += row['equalsCitedFileRow']
                res['rows'].append(row)
            # neighbours: the row before the first and after the last in the cited file must not be in the pilot
            before = og[rows[0]['ordinal'] - 2]['text'] if rows[0]['ordinal'] >= 2 else None
            after = og[rows[-1]['ordinal']]['text'] if rows[-1]['ordinal'] < len(og) else None
            entry.update(rowBeforeInCitedFile=before, rowAfterInCitedFile=after, ordinalsConsecutive=[o['ordinal'] for o in rows] == list(range(rows[0]['ordinal'], rows[0]['ordinal'] + len(rows))))
        res['passages'].append(entry)
    res['summary'] = dict(rows=len(res['rows']), equalReference=all_exact_ref, equalCitedFile=all_exact_og,
                          angSame=sum(r['angSame'] for r in res['rows']), printedLineSame=sum(r['printedLineSame'] for r in res['rows']),
                          fingerprintSame=sum(r['citedFileFingerprintSame'] for r in res['rows']), nfc=sum(r['nfc'] for r in res['rows']),
                          rowsWithOddCharacters=sum(1 for r in res['rows'] if r['oddCharacters']))
    # every other Gurmukhi string in the file
    source_texts = [o['text'] for o in g['occurrences']]
    source_words = {w for t in source_texts for w in t.split()}
    def walk(x, path):
        if isinstance(x, dict):
            for k, v in x.items(): walk(v, path + [k])
        elif isinstance(x, list):
            for i, v in enumerate(x): walk(v, path + [str(i)])
        elif isinstance(x, str) and GUR.search(x) and path[0] != 'occurrences':
            kind = ('whole line of Gurbani, second copy' if x in source_texts else
                    'contains a whole line of Gurbani' if any(t in x for t in source_texts) else
                    'single form found in the source rows' if x in source_words else 'other Gurmukhi (name, Punjabi teaching, label)')
            res['other'].append(dict(path='.'.join(path), kind=kind, text=x if len(x) < 80 else x[:77] + '…'))
    walk({k: v for k, v in g.items()}, [])
    kinds = {}
    for o in res['other']: kinds[o['kind']] = kinds.get(o['kind'], 0) + 1
    res['otherGurmukhiByKind'] = kinds
    json.dump(res, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(json.dumps(res['counts'], ensure_ascii=False)); print(json.dumps(res['summary']))
    for p in res['passages']: print({k: v for k, v in p.items()})
    print(kinds)
    for r in res['rows']:
        if not (r['equalsReference'] and r['equalsCitedFileRow'] and r['angSame'] and r['printedLineSame']):
            print('DIFF', r['id'], {k: r[k] for k in ('equalsReference','equalsCitedFileRow','angSame','printedLineSame','printedLine','referenceLine','citedFilePrintedLine')})

if __name__ == '__main__':
    main(*sys.argv[1:6])
