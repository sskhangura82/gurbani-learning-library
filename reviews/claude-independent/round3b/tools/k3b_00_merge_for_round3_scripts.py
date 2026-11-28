"""Round 3b: the candidate (PR #48) splits the pilot into knowledge/scripture.json (Gurbani) and knowledge/pilot.json
(teaching). The round 3 scripts expect one file. This makes a merged view so those scripts can be rerun with their
comparison logic untouched — only the shape of their input is adapted, nothing is filtered or corrected.
Usage: python3 -I k3b_00_merge_for_round3_scripts.py <scripture.json> <pilot.json> <out merged.json>"""
import json, sys
sc = json.load(open(sys.argv[1], encoding='utf-8')); pl = json.load(open(sys.argv[2], encoding='utf-8'))
merged = dict(pl)
merged['occurrences'] = sc['occurrences']
merged['nodes'] = list(pl['nodes']) + list(sc.get('sourceNodes', [])) + [dict(p, type='passage') for p in sc['passages']]
merged['_mergedFrom'] = dict(scripture=sys.argv[1], editorial=sys.argv[2], passages=len(sc['passages']), occurrences=len(sc['occurrences']), editorialNodes=len(pl['nodes']), sourceNodes=len(sc.get('sourceNodes', [])), edges=len(pl['edges']))
json.dump(merged, open(sys.argv[3], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps(merged['_mergedFrom']))
