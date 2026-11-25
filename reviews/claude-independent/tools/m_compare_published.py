#!/usr/bin/env python3
"""M-02 / M-05 aids: line-aligned comparison of the app's English meanings with published
translations carried in the Shabad OS database (comparison aids only; nothing is copied
into the app or into this review beyond short identifiers and similarity numbers).

  DSSK = Dr Sant Singh Khalsa (English, SGGS) · SBMS = Manmohan Singh (English/Punjabi, SGGS)
  PSST = Prof. Sahib Singh, Darpan (Punjabi, SGGS) · DSKO = Dr S. S. Kohli (English, Dasam)

Outputs, per app line: similarity to each published English line (originality check),
similarity to the neighbouring lines' translations (shift check) and a divergence rank.
Usage: python3 -I m_compare_published.py <s05_register.csv> <meanings.json> <master.sqlite> <out_dir>"""
import csv, json, sys, sqlite3, re, difflib, os
from collections import defaultdict
reg = list(csv.DictReader(open(sys.argv[1], encoding='utf-8')))
M = {m['id']: m for m in json.load(open(sys.argv[2], encoding='utf-8'))}
con = sqlite3.connect(f'file:{sys.argv[3]}?mode=ro', uri=True)
tr = defaultdict(dict)
for lid, asset, data, add in con.execute("select line_id, asset_id, data, additional from asset_lines where type='translation' and asset_id in ('DSSK','SBMS','PSST','DSKO')"):
    lang = (json.loads(add) if add else {}).get('language', 'en')
    tr[lid][(asset, lang)] = data
STOP = set('the a an of and to in is are was were be been by for with that this it its his her their our your you thy thee thou he she they we i o as at on from not no nor but or so who whom which what when where all any one ones into upon unto there here those these such than then do does did have has had will shall may can cannot more most very own same also only even both each every his'.split())
def words(s): return [w for w in re.findall(r"[a-z']+", s.lower()) if w not in STOP and len(w) > 2]
def stem(w):
    for suf in ('ingly', 'edly', 'ing', 'ed', 'es', 's', 'ly'):
        if w.endswith(suf) and len(w) - len(suf) >= 4: return w[:-len(suf)]
    return w
def bag(s): return {stem(w) for w in words(s)}
def jac(a, b): return len(a & b) / len(a | b) if a and b else 0.0
def ratio(a, b): return difflib.SequenceMatcher(None, a.lower(), b.lower(), autojunk=False).ratio() if a and b else 0.0
def ngram(a, b, n=6):
    A = re.findall(r"[a-z']+", a.lower()); B = ' ' + ' '.join(re.findall(r"[a-z']+", b.lower())) + ' '
    best = 0
    for i in range(len(A)):
        for j in range(i + 3, min(len(A), i + 14) + 1):
            if ' ' + ' '.join(A[i:j]) + ' ' in B: best = max(best, j - i)
            else: break
    return best
rows = []
for r in reg:
    if r['kind'] in ('preface',) or r['occurrence_id'] not in M: continue
    m = M[r['occurrence_id']]; refs = r['reference_line_ids'].split()
    def cat(asset, lang): return ' '.join(tr[i].get((asset, lang), '') for i in refs).strip()
    rows.append(dict(id=m['id'], part=r['composition_part'], status=r['status'], n_refs=len(refs), gurmukhi=r['app_text'], en=m['en'], pa=m['pa'],
                     dssk=cat('DSSK', 'en'), sbms=cat('SBMS', 'en'), sbms_pa=cat('SBMS', 'pa'), psst=cat('PSST', 'pa'), dsko=cat('DSKO', 'en')))
for i, x in enumerate(rows):
    pub = [p for p in (x['dssk'], x['sbms'], x['dsko']) if p]
    x['max_ratio'] = round(max([ratio(x['en'], p) for p in pub] or [0]), 3)
    x['max_shared_run_words'] = max([ngram(x['en'], p) for p in pub] or [0])
    b = bag(x['en']); own = max([jac(b, bag(p)) for p in pub] or [0]); x['content_overlap_own'] = round(own, 3)
    nb = 0.0
    for d in (-1, 1):
        if 0 <= i + d < len(rows) and rows[i + d]['part'] == x['part'] and rows[i + d]['gurmukhi'] != x['gurmukhi']:
            y = rows[i + d]; nb = max(nb, max([jac(b, bag(p)) for p in (y['dssk'], y['sbms'], y['dsko']) if p] or [0]))
    x['content_overlap_neighbour'] = round(nb, 3); x['has_published'] = bool(pub)
os.makedirs(sys.argv[4], exist_ok=True)
have = [x for x in rows if x['has_published']]
def hist(vals, edges):
    out = {}
    for lo, hi in zip(edges, edges[1:]): out[f'{lo:.1f}-{hi:.1f}'] = sum(1 for v in vals if lo <= v < hi)
    return out
summary = dict(meaning_entries=len(rows), with_a_published_translation_to_compare=len(have),
               originality=dict(similarity_ratio_histogram=hist([x['max_ratio'] for x in have], [0, .2, .4, .6, .7, .8, .9, 1.01]),
                                entries_with_ratio_at_least_0_80=sum(1 for x in have if x['max_ratio'] >= .8),
                                entries_sharing_a_run_of_6_or_more_words=sum(1 for x in have if x['max_shared_run_words'] >= 6),
                                entries_sharing_a_run_of_8_or_more_words=sum(1 for x in have if x['max_shared_run_words'] >= 8)),
               shift_screen=dict(rule='own-line overlap < 0.10 and a neighbouring line overlap >= 0.30', flagged=[dict(id=x['id'], own=x['content_overlap_own'], neighbour=x['content_overlap_neighbour'], gurmukhi=x['gurmukhi'], app_en=x['en']) for x in have if x['content_overlap_own'] < .10 and x['content_overlap_neighbour'] >= .30]),
               content_overlap_own_histogram=hist([x['content_overlap_own'] for x in have], [0, .05, .1, .2, .3, .5, 1.01]),
               by_part={p: dict(n=sum(1 for x in have if x['part'] == p), mean_overlap=round(sum(x['content_overlap_own'] for x in have if x['part'] == p) / max(1, sum(1 for x in have if x['part'] == p)), 3), zero_overlap=sum(1 for x in have if x['part'] == p and x['content_overlap_own'] == 0)) for p in sorted({x['part'] for x in have})})
json.dump(summary, open(os.path.join(sys.argv[4], 'm_compare_summary.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(rows, open(os.path.join(sys.argv[4], 'm_compare_rows.private.json'), 'w', encoding='utf-8'), ensure_ascii=False)
print(json.dumps({k: v for k, v in summary.items() if k != 'shift_screen'}, ensure_ascii=False, indent=1))
print('shift flags:', len(summary['shift_screen']['flagged']))
for f in summary['shift_screen']['flagged'][:30]: print('  ', f['id'], f['own'], f['neighbour'], '|', f['gurmukhi'][:50], '|', f['app_en'][:90])
print('highest similarity to a published line:')
for x in sorted(have, key=lambda x: -x['max_ratio'])[:12]: print('  ', x['id'], x['max_ratio'], x['max_shared_run_words'], '|', x['en'][:100])
