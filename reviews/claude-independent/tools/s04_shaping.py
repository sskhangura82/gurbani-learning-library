#!/usr/bin/env python3
"""S-04: shape every distinct Gurbani word with HarfBuzz in several Gurmukhi fonts.
Flags words where the shaper inserts a dotted circle (U+25CC = invalid mark order) or
uses the missing-glyph box. Usage: python3 -I s04_shaping.py <app_corpus.json> <font_dir> <out.json>
"""
import json, sys, glob, os, unicodedata
import uharfbuzz as hb
from collections import defaultdict
occ = json.load(open(sys.argv[1], encoding='utf-8'))
words = defaultdict(list)
for o in occ:
    for w in o['text'].split(' '):
        if w: words[w].append(o['id'])
fonts = sorted(glob.glob(os.path.join(sys.argv[2], '*-400-normal.ttf')))
out = dict(distinct_words=len(words), fonts=[], problems={})
for fp in fonts:
    blob = hb.Blob.from_file_path(fp); face = hb.Face(blob); font = hb.Font(face)
    dotted = font.get_nominal_glyph(0x25CC)
    name = os.path.basename(fp)
    bad = {}
    for w, ids in words.items():
        buf = hb.Buffer(); buf.add_str(w); buf.guess_segment_properties()
        hb.shape(font, buf, {})
        gids = [g.codepoint for g in buf.glyph_infos]
        issues = []
        if 0 in gids: issues.append('missing_glyph')
        if dotted and dotted in gids and '◌' not in w: issues.append('dotted_circle_inserted')
        if issues:
            bad[w] = dict(issues=issues, codepoints=' '.join(f'U+{ord(c):04X}' for c in w), count=len(ids), ids=ids[:12])
    out['fonts'].append(name); out['problems'][name] = bad
    print(name, '| problem words:', len(bad))
    for w, b in sorted(bad.items(), key=lambda kv: -kv[1]['count'])[:40]:
        print('   ', w, b['issues'], b['codepoints'], 'x', b['count'], b['ids'][:4])
json.dump(out, open(sys.argv[3], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('distinct words', len(words))
