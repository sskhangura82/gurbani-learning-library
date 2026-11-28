#!/usr/bin/env python3
"""Addendum S-A1, part 3: the vocabulary "headwords" in the teaching layer are words quoted from Gurbani.
Every headword in every shipped teaching file is checked: does it occur, exactly as written, in the passage it is attached to?
Usage: python3 -I sA1c_vocabulary_headwords.py <site-root> <app_corpus.json> <out.json>"""
import json, sys, re, collections
SITE, CORPUS, OUT = sys.argv[1:4]
corpus = json.load(open(CORPUS, encoding='utf-8')); norm = lambda t: re.sub(r'\s+', ' ', t).strip()
def load_js(path, marker):
    s = open(SITE + path, encoding='utf-8').read(); i = s.index('=', s.index(marker)) + 1; return json.loads(s[i:].strip().rstrip(';'))
unit_text = collections.defaultdict(list); comp_text = collections.defaultdict(list)
for o in corpus:
    unit_text[(o['comp'], o['unit'])].append(norm(o['text'])); comp_text[o['comp']].append(norm(o['text']))
    if o['comp'] == 'sukhmani' and o.get('ashtpadi') is not None: unit_text[('sukhmani-ashtpadi', str(o['ashtpadi']))].append(norm(o['text']))
J = lambda xs: ' ‖ '.join(xs)
def words_in(hw, text):
    """occurs as whole words, in order, inside one line"""
    return re.search(r'(?<![਀-੿])' + re.escape(hw) + r'(?![਀-੿])', text) is not None
rows = []
def near(hw, text):
    """forms in the passage that begin with the headword (to show what the passage actually has)"""
    return sorted(set(w for w in re.findall(r'[\u0A00-\u0A7F]+', text) if w != hw and (w.startswith(hw) or hw.startswith(w)) and abs(len(w) - len(hw)) <= 3))[:6]
def check(file, comp, unit_key, where, hw_field, gloss):
    # one field can hold several headwords, separated by a middle dot, a slash or a comma
    for hw in [norm(x) for x in re.split(r'[·/,]', hw_field) if norm(x)]:
        whole = unit_key[1] == '(whole composition)'; ut = J(comp_text.get(comp, [])) if whole else J(unit_text.get(unit_key, [])); ct = J(comp_text.get(comp, []))
        if ut and words_in(hw, ut): st = 'in its own passage, as written'
        elif words_in(hw, ct): st = 'elsewhere in the same composition, not in its own passage'
        elif all(words_in(w, ut) for w in hw.split()) and len(hw.split()) > 1: st = 'each word is in its own passage, but not side by side'
        elif hw in ut: st = 'in its own passage only as part of a longer word'
        elif hw in ct: st = 'in the composition only as part of a longer word'
        else: st = 'not in the composition as written'
        rows.append(dict(file=file, composition=comp, passage=unit_key[1], field=where, headword=hw, headwordField=hw_field, gloss=gloss, status=st, passageKnown=bool(ut), passageHas=near(hw, ut) if st != 'in its own passage, as written' else []))
jl = load_js('js/japji-lessons.js', 'window.GLP_JAPJI_LESSONS')['lessons']
for uid, les in (jl.items() if isinstance(jl, dict) else [(l.get('id'), l) for l in jl]):
    for v in les.get('vocabulary', []): check('js/japji-lessons.js', 'japji', ('japji', uid), 'vocabulary', v['gurmukhi'], v.get('english') or v.get('en') or '')
st = load_js('js/sukhmani-teaching.js', 'window.GLP_SUKHMANI_TEACHING')
for n, a in st['ashtpadis'].items():
    for v in a.get('vocabulary', []): check('js/sukhmani-teaching.js', 'sukhmani', ('sukhmani-ashtpadi', str(n)), 'vocabulary', v['gurmukhi'], v.get('en') or '')
co = json.load(open(SITE + 'nitnem/learning/course.complete.json', encoding='utf-8'))
for key, les in co['unitLessons'].items():
    comp, unit = key.split('|')[:2]
    for w in (les.get('study') or {}).get('words', []) or []:
        if isinstance(w, dict): check('nitnem course', comp, (comp, unit), 'study.words', w['gurmukhi'], w.get('workingGloss') or w.get('en') or '')
        elif isinstance(w, list) and w: check('nitnem course', comp, (comp, unit), 'study.words', w[0], w[1] if len(w) > 1 else '')
for comp, bn in co['banis'].items():
    for w in bn.get('words', []) or []:
        if isinstance(w, list) and w: check('nitnem course', comp, (comp, '(whole composition)'), 'banis.words', w[0], w[1] if len(w) > 1 else '')
c = load_js('js/content.js', 'window.GURBANI_CONTENT')
for i, l in enumerate(c['scripture']['lines']):
    for w, g in c['explanations'].get(l['id'], {}).get('words', []):
        ok = words_in(norm(w), norm(l['text'])); rows.append(dict(file='js/content.js', composition='japji (older Pauri 2 lesson)', passage=l['id'], field='explanations.words', headword=w, gloss=g, status='in its own passage, as written' if ok else 'not in its own line', passageKnown=True))
tot = collections.Counter(r['status'] for r in rows); per = collections.defaultdict(collections.Counter)
for r in rows: per[r['file']][r['status']] += 1
out = dict(totalHeadwords=len(rows), byStatus=dict(tot), byFile={f: dict(v) for f, v in per.items()}, exceptions=[r for r in rows if r['status'] != 'in its own passage, as written'], all=rows)
json.dump(out, open(OUT, 'w'), ensure_ascii=False, indent=1)
print('headwords:', len(rows), dict(tot)); [print('  ', f, dict(v)) for f, v in per.items()]
print('passage not identified for', sum(1 for r in rows if not r['passageKnown']), 'headwords')
for r in out['exceptions'][:80]: print('  •', r['composition'], r['passage'], '|', r['headword'], '|', r['status'], '| passage has:', r.get('passageHas'), '|', (r['gloss'] or '')[:50])
