#!/usr/bin/env python3
"""S-02 stored-hash integrity and S-03 Unicode hygiene for every occurrence.
Usage: python3 -I s02_s03_integrity.py <app_corpus.json> <out.json>
"""
import json, sys, hashlib, unicodedata, re
from collections import Counter, defaultdict
occ = json.load(open(sys.argv[1], encoding='utf-8'))
res = dict(total=len(occ))
# S-02
with_hash = [o for o in occ if o.get('declared_sha256')]
bad = [o['id'] for o in with_hash if hashlib.sha256(o['text'].encode('utf-8')).hexdigest() != o['declared_sha256']]
res['s02'] = dict(with_stored_hash=len(with_hash), without_stored_hash=len(occ) - len(with_hash),
                  mismatches=bad, without_ids_sample=[o['id'] for o in occ if not o.get('declared_sha256')][:10],
                  without_by_comp=dict(Counter(o['comp'] + ':' + o['kind'] for o in occ if not o.get('declared_sha256'))))
# S-03
cp = Counter(); viol = defaultdict(list)
ALLOWED_PUNCT = {0x0964, 0x0965, 0x20}
for o in occ:
    t = o['text']
    for ch in t: cp[ch] += 1
    if unicodedata.normalize('NFC', t) != t: viol['not_NFC'].append(o['id'])
    if unicodedata.normalize('NFD', t) != t: viol['NFD_differs(precomposed present)'].append(o['id'])
    if t != t.strip(): viol['leading_or_trailing_space'].append(o['id'])
    if '  ' in t: viol['double_space'].append(o['id'])
    for ch in set(t):
        c = ord(ch)
        if 0x0A00 <= c <= 0x0A7F or c in ALLOWED_PUNCT: continue
        viol[f'outside_gurmukhi U+{c:04X} {unicodedata.name(ch, "?")}'].append(o['id'])
    if re.search(r'[਼ਾ-੍ੑੰੱੵਁ-ਃ]{0}(^|\s)[ਾ-੍ੰੱਁਂਃ਼ੑੵ]', t):
        viol['word_starts_with_combining_mark'].append(o['id'])
    if re.search(r'।।', t): viol['two_single_dandas_instead_of_double'].append(o['id'])
    if re.search(r'[0-9]', t): viol['ascii_digit'].append(o['id'])
res['codepoints'] = [dict(cp=f'U+{ord(k):04X}', ch=k, name=unicodedata.name(k, '?'), count=v) for k, v in sorted(cp.items(), key=lambda kv: ord(kv[0]))]
res['s03_violations'] = {k: dict(count=len(v), ids=v[:40]) for k, v in viol.items()}
# precomposed letters that NFC keeps but have decompositions (ਸ਼ ਖ਼ ਗ਼ ਜ਼ ਫ਼ ਲ਼)
json.dump(res, open(sys.argv[2], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('total', res['total']); print('S-02', {k: (v if not isinstance(v, list) else len(v)) for k, v in res['s02'].items()})
print('S-03 violations:')
for k, v in res['s03_violations'].items(): print('  ', k, v['count'], v['ids'][:8])
print('code points:')
for c in res['codepoints']: print('  ', c['cp'], c['ch'] if c['cp'] not in ('U+0020',) else 'SP', c['name'], c['count'])
