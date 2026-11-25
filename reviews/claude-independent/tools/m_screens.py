#!/usr/bin/env python3
"""M-01, M-03, M-04 automated screens over every meaning entry and every study string.
Usage: python3 -I m_screens.py <app_corpus.json> <meanings.json> <studies.json> <out.json>"""
import json, sys, re, unicodedata
from collections import Counter, defaultdict
occ = json.load(open(sys.argv[1], encoding='utf-8')); M = json.load(open(sys.argv[2], encoding='utf-8')); S = json.load(open(sys.argv[3], encoding='utf-8'))
lines = {o['id']: o for o in occ if o['kind'] not in ('preface',) and not o['id'].endswith(tuple(f'.heading{i:02d}' for i in range(1, 9)))}
R = {}
# ---- M-01 coverage / binding
mid = Counter(m['id'] for m in M)
line_ids = set(lines)
R['M-01'] = dict(source_line_records=len(line_ids), meaning_entries=len(M), lines_without_meaning=sorted(line_ids - set(mid))[:20], n_lines_without_meaning=len(line_ids - set(mid)),
                 meanings_without_line=sorted(set(mid) - line_ids)[:20], n_meanings_without_line=len(set(mid) - line_ids), duplicate_bindings=[k for k, v in mid.items() if v > 1][:20],
                 empty_english=[m['id'] for m in M if not m['en'].strip()], empty_punjabi=[m['id'] for m in M if not m['pa'].strip()])
# source hash carried by the meaning equals the line's hash?
stale = []
for m in M:
    h = m['extra'].get('sourceHash') or m['extra'].get('sourceSha256')
    if h and m['id'] in lines and lines[m['id']].get('declared_sha256') and h != lines[m['id']]['declared_sha256']: stale.append(m['id'])
R['M-01']['meanings_carrying_a_source_hash'] = sum(1 for m in M if m['extra'].get('sourceHash') or m['extra'].get('sourceSha256')); R['M-01']['meaning_source_hash_stale'] = stale
# ---- M-03 language hygiene
GUR = re.compile(r'[਀-੿]'); LAT = re.compile(r'[A-Za-z]{2,}')
LEAK = re.compile(r'\b(verify|to be verified|todo|tbd|fixme|placeholder|lorem|check grammar|needs? (?:review|checking|verification)|unverified|uncertain reading|confirm with|\?\?)\b', re.I)
HINDI = re.compile(r'(?<![਀-੿])(ਔਰ|ਲੇਕਿਨ|ਯਹ|ਵਹ|ਕੇ ਲਿਏ|ਕੇ ਲੀਏ|ਸਕਤਾ|ਸਕਤੇ|ਹੋਤਾ|ਹੋਤੇ|ਕਰਤਾ ਹੈ|ਕਰਤੇ ਹੈਂ|ਰਹਾ ਹੈ|ਰਹੇ ਹੈਂ|ਗਯਾ|ਕਿਯਾ|ਚਾਹੀਏ|ਨਹੀਂ ਹੈਂ|ਮੇਂ|ਕਿਆ ਹੈ|ਇਸਕਾ|ਉਸਕਾ|ਆਪਕਾ|ਹਮਾਰਾ|ਤੁਮ੍ਹਾਰਾ|ਬਹੁਤ ਹੀ ਅੱਛਾ|ਅੱਛਾ|ਲਿਏ)(?![਀-੿])')
pa_latin = [(m['id'], LAT.findall(m['pa'])) for m in M if LAT.search(m['pa'])]
en_gur = [(m['id'], m['en']) for m in M if GUR.search(m['en'])]
hindi = [(m['id'], HINDI.findall(m['pa']), m['pa']) for m in M if HINDI.search(m['pa'])]
R['M-03'] = dict(punjabi_field_contains_latin_words=len(pa_latin), punjabi_latin_samples=pa_latin[:15], english_field_contains_gurmukhi=len(en_gur), english_gurmukhi_samples=en_gur[:10],
                 hindi_looking_forms_in_punjabi=len(hindi), hindi_samples=hindi[:15])
leaks = []
for m in M:
    for f in ('en', 'pa'):
        if LEAK.search(m[f]): leaks.append(('meaning', m['comp'], m['id'], f, m[f][:200]))
    for k, v in m['extra'].items():
        if isinstance(v, str) and LEAK.search(v): leaks.append(('meaning-extra', m['comp'], m['id'], k, v[:200]))
for s in S:
    for k, v in s['fields'].items():
        if k.endswith('status') or 'sha256' in k.lower() or k.endswith('url') or k.endswith('.key'): continue
        if LEAK.search(v): leaks.append(('study', s['comp'], s['id'], k, v[:220]))
R['M-03']['editorial_notes_leaking_into_reader_text'] = dict(count=len(leaks), by_place={f'{k[0]}:{k[1]}': v for k, v in Counter((l[0], l[1]) for l in leaks).most_common()}, items=leaks)
# spelling consistency of very common Punjabi words
allpa = ' '.join(m['pa'] for m in M) + ' ' + ' '.join(v for s in S for k, v in s['fields'].items() if GUR.search(v) and not k.endswith('gurmukhi'))
def cnt(w): return len(re.findall(r'(?<![਀-੿])' + w + r'(?![਀-੿])', allpa))
R['M-03']['punjabi_spelling_pairs'] = {a + ' / ' + b: [cnt(a), cnt(b)] for a, b in [('ਵਿਚ', 'ਵਿੱਚ'), ('ਇਕ', 'ਇੱਕ'), ('ਉਤੇ', 'ਉੱਤੇ'), ('ਸਚ', 'ਸੱਚ'), ('ਇਥੇ', 'ਇੱਥੇ'), ('ਇਸੇ', 'ਇੱਸੇ'), ('ਵਿਚੋਂ', 'ਵਿੱਚੋਂ'), ('ਕੁਝ', 'ਕੁੱਝ'), ('ਰਬ', 'ਰੱਬ'), ('ਸਭ', 'ਸੱਭ'), ('ਹੁਕਮ', 'ਹੁਕਮੁ')]}
# ---- M-04 repetition
by_en = defaultdict(list)
for m in M: by_en[re.sub(r'\s+', ' ', m['en'].strip().lower())].append(m['id'])
dups = {k: v for k, v in by_en.items() if len(v) > 1}
same_text_dup = 0; diff_text_dup = []
for en, ids in dups.items():
    texts = {lines[i]['text'] for i in ids if i in lines}
    if len(texts) > 1: diff_text_dup.append(dict(english=en[:120], n=len(ids), distinct_gurmukhi=len(texts), ids=ids[:6], gurmukhi=[lines[i]['text'] for i in ids[:4] if i in lines]))
    else: same_text_dup += len(ids)
R['M-04'] = dict(distinct_english_meanings=len(by_en), entries_sharing_english_with_another_entry=sum(len(v) for v in dups.values()), of_which_same_gurmukhi_repeated_line=same_text_dup,
                 groups_where_identical_english_covers_different_gurmukhi=len(diff_text_dup), entries_in_those_groups=sum(d['n'] for d in diff_text_dup), samples=sorted(diff_text_dup, key=lambda d: -d['n'])[:25])
# word-count profile
def wc(s): return len(s.split())
prof = defaultdict(list)
for m in M:
    if m['id'] in lines: prof[m['comp']].append((wc(lines[m['id']]['text']), wc(m['en']), wc(m['pa'])))
R['length_profile'] = {c: dict(n=len(v), avg_gurmukhi_tokens=round(sum(x[0] for x in v) / len(v), 1), avg_english_words=round(sum(x[1] for x in v) / len(v), 1), avg_punjabi_words=round(sum(x[2] for x in v) / len(v), 1)) for c, v in prof.items()}
# ---- studies: structure and language parity
st = defaultdict(lambda: dict(n=0, with_any_punjabi=0, english_chars=0, punjabi_chars=0, field_names=Counter()))
for s in S:
    k = (s['comp'], s['kind']); st[k]['n'] += 1; anypa = False
    for f, v in s['fields'].items():
        base = re.sub(r'\[\d+\]', '[]', f); st[k]['field_names'][base] += 1
        if f.endswith(('sha256', 'url', 'status', 'id', 'unitId', 'key', 'type')) or 'gurmukhi' in f.lower(): continue
        g = len(GUR.findall(v)); l = len(re.findall(r'[A-Za-z]', v))
        if g > l: st[k]['punjabi_chars'] += len(v); anypa = True
        else: st[k]['english_chars'] += len(v)
    st[k]['with_any_punjabi'] += anypa
R['studies'] = {f'{k[0]}:{k[1]}': dict(n=v['n'], with_any_punjabi_prose=v['with_any_punjabi'], avg_english_chars=round(v['english_chars'] / v['n']), avg_punjabi_chars=round(v['punjabi_chars'] / v['n']), fields=dict(v['field_names'].most_common(40))) for k, v in st.items()}
json.dump(R, open(sys.argv[4], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('M-01', {k: (v if not isinstance(v, list) else (len(v), v[:5])) for k, v in R['M-01'].items()})
print('M-03 latin-in-PA', R['M-03']['punjabi_field_contains_latin_words'], R['M-03']['punjabi_latin_samples'][:6]); print('   gurmukhi-in-EN', R['M-03']['english_field_contains_gurmukhi'], R['M-03']['english_gurmukhi_samples'][:3])
print('   hindi-looking', R['M-03']['hindi_looking_forms_in_punjabi'], R['M-03']['hindi_samples'][:6]); print('   spelling pairs', R['M-03']['punjabi_spelling_pairs'])
print('   LEAKS', R['M-03']['editorial_notes_leaking_into_reader_text']['count'], R['M-03']['editorial_notes_leaking_into_reader_text']['by_place'])
for l in leaks[:40]: print('      ', l)
print('M-04', {k: v for k, v in R['M-04'].items() if k != 'samples'})
for d in R['M-04']['samples'][:14]: print('     ', d['n'], '×', repr(d['english'][:80]), '|', d['gurmukhi'][:3])
print('length', R['length_profile'])
for k, v in R['studies'].items(): print('studies', k, {kk: vv for kk, vv in v.items() if kk != 'fields'})
