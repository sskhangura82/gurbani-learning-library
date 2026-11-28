#!/usr/bin/env python3
"""Extract every original-Gurbani occurrence served by the app into one flat register.

Independent reviewer tool (Claude). Reads the shipped runtime files only:
  js/japji-full-data.js, js/sukhmani-data.js, nitnem/data/*.json
Writes a JSON list of occurrences: {comp, unit, id, kind, text, ang, seq, declared_sha256}
Usage: python3 -I extract_corpus.py <repo_root> <out.json>
"""
import json, sys, re, hashlib, pathlib

def load_js_object(path):
    s = pathlib.Path(path).read_text(encoding='utf-8')
    i = s.index('=', s.index('window.')) + 1
    body = s[i:].strip()
    if body.endswith(';'):
        body = body[:-1]
    return json.loads(body)

def main(root, out):
    root = pathlib.Path(root)
    occ = []
    # --- Japji
    j = load_js_object(root / 'js/japji-full-data.js')
    seq = 0
    for u in j['units']:
        for ln in u['lines']:
            seq += 1
            occ.append(dict(comp='japji', unit=u['id'], id=ln['id'], kind='line', text=ln['text'],
                            ang=ln.get('ang'), source_line=ln.get('sourceLine'), seq=seq,
                            declared_sha256=ln.get('sha256')))
    # --- Sukhmani
    s = load_js_object(root / 'js/sukhmani-data.js')
    seq = 0
    for a in s['ashtpadis']:
        for ln in a['lines']:
            seq += 1
            occ.append(dict(comp='sukhmani', unit=ln.get('unitId'), id=ln['id'], kind=ln.get('kind', 'line'),
                            text=ln['gurmukhi'], ang=ln.get('ang'), source_line=ln.get('sourceLine'), seq=seq,
                            declared_sha256=ln.get('sha256'), ashtpadi=ln.get('ashtpadi'), pauri=ln.get('pauri')))
    # --- Nitnem six
    lib = json.loads((root / 'nitnem/data/library.json').read_text(encoding='utf-8'))
    for cid, meta in lib['entries'].items():
        d = json.loads((root / 'nitnem' / meta['path']).read_text(encoding='utf-8'))
        seq = 0
        for k, p in enumerate(d.get('preface', []), 1):
            seq += 1
            occ.append(dict(comp=cid, unit='preface', id=f'{cid}.preface{k:02d}', kind='preface', text=p['text'],
                            ang=None, source_line=None, seq=seq, declared_sha256=p.get('sha256')))
        for u in d['units']:
            heads = []
            for k, h in enumerate(u.get('metricalHeadings', []), 1):
                text = h['text'] if isinstance(h, dict) else h
                heads.append(dict(comp=cid, unit=u['id'], id=f"{u['id']}.heading{k:02d}", kind='heading', text=text,
                                  ang=None, source_line=None,
                                  declared_sha256=(h.get('sha256') if isinstance(h, dict) else None),
                                  heading_raw=h if isinstance(h, dict) else None))
            lines = {}
            for ln in u['lines']:
                loc = ln.get('location') or {}
                lines[ln['id']] = dict(comp=cid, unit=u['id'], id=ln['id'], kind='line', text=ln['text'],
                                       ang=loc.get('ang') or loc.get('page'), source_line=loc.get('line'),
                                       declared_sha256=ln.get('sha256'), location=loc, held=ln.get('held'),
                                       family=ln.get('family'))
            # Correction 2026-11-25 (comparison step): the reader draws a unit in `sourceDisplayOrder` when the
            # unit has one (Jaap chhand 62). The first version of this script always put headings first, which
            # produced a false "order reversed" finding. The register must follow the order on screen.
            if u.get('sourceDisplayOrder'):
                ordered = [lines[e['id']] if e['kind'] == 'line' else heads[e['index']] for e in u['sourceDisplayOrder']]
            else:
                ordered = heads + list(lines.values())
            for o in ordered:
                seq += 1
                o['seq'] = seq
                occ.append(o)
    pathlib.Path(out).write_text(json.dumps(occ, ensure_ascii=False, indent=1), encoding='utf-8')
    from collections import Counter
    c = Counter((o['comp'], o['kind']) for o in occ)
    for k in sorted(c):
        print(k, c[k])
    print('TOTAL', len(occ))

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
