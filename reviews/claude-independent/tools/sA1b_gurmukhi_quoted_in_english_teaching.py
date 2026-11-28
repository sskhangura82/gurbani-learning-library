#!/usr/bin/env python3
"""Addendum S-A1, part 2: Gurmukhi words and phrases quoted INSIDE English teaching text.
In an English sentence, a run of Gurmukhi script is a quotation (of a source word or phrase, or a Punjabi term). Every such run in
every shipped teaching file is listed and checked: does it occur, as written, in the app's own Gurbani text (the 3,809 collated
occurrences plus the 31 found outside the readers)? Runs that do not occur are listed for reading; they are either Punjabi terms
(titles, names) or misquotations.
Usage: python3 -I sA1b_gurmukhi_quoted_in_english_teaching.py <site-root> <app_corpus.json> <sA1.json> <out.json>"""
import json, sys, re, collections
SITE, CORPUS, SA1, OUT = sys.argv[1:5]
corpus = json.load(open(CORPUS, encoding='utf-8')); extra = json.load(open(SA1, encoding='utf-8'))['rows']
norm = lambda t: re.sub(r'\s+', ' ', t).strip()
texts = [norm(o['text']) for o in corpus] + [norm(r['appText']) for r in extra]
joined = ' ‖ '.join(texts); vocab = set(w for t in texts for w in t.split())
strip_marks = lambda w: re.sub(r'[॥।੦-੯\s]+$', '', re.sub(r'^[॥।\s]+', '', w))
vocab_bare = set(strip_marks(w) for w in vocab)
def load_js(path, marker):
    s = open(SITE + path, encoding='utf-8').read(); i = s.index('=', s.index(marker)) + 1; return json.loads(s[i:].strip().rstrip(';'))
def walk(o, path=''):
    if isinstance(o, dict):
        for k, v in o.items(): yield from walk(v, path + '.' + str(k))
    elif isinstance(o, list):
        for i, v in enumerate(o): yield from walk(v, path + '[%d]' % i)
    elif isinstance(o, str): yield path, o
sources = {'js/content.js': load_js('js/content.js', 'window.GURBANI_CONTENT'), 'js/japji-lessons.js': load_js('js/japji-lessons.js', 'window.GLP_JAPJI_LESSONS'),
           'js/line-meanings.js': load_js('js/line-meanings.js', 'window.GLP_LINE_MEANINGS'), 'js/sukhmani-teaching.js': load_js('js/sukhmani-teaching.js', 'window.GLP_SUKHMANI_TEACHING'),
           'nitnem/learning/course.complete.json': json.load(open(SITE + 'nitnem/learning/course.complete.json', encoding='utf-8'))}
G = re.compile(r'[਀-੿][਀-੿‌‍ ॥।]*[਀-੿॥]|[਀-੿]')
rows = []; stats = collections.Counter(); per_file = collections.defaultdict(collections.Counter)
for f, data in sources.items():
    for path, s in walk(data):
        g = len(re.findall(r'[਀-੿]', s)); l = len(re.findall(r'[A-Za-z]', s))
        if not g or l <= g: continue                       # only strings that are mainly English
        if re.search(r'\.(scripture|related)\b', path) and f == 'js/content.js' and re.search(r'(text|excerpt|context)', path): continue
        for m in G.finditer(s):
            run = norm(m.group(0)); bare = strip_marks(run)
            if not bare: continue
            words = bare.split()
            if run in joined or bare in joined: st = 'occurs as written in the app\'s Gurbani text'
            elif all(w in vocab_bare for w in words): st = 'each word occurs in the app\'s Gurbani text, but not together in this order'
            else: st = 'not in the app\'s Gurbani text'
            stats[st] += 1; per_file[f][st] += 1
            rows.append(dict(file=f, field=path[-90:], quoted=run, words=len(words), status=st, context=s[max(0, m.start() - 70):m.end() + 50]))
out = dict(totalQuotedRuns=len(rows), byStatus=dict(stats), byFile={f: dict(c) for f, c in per_file.items()}, notFound=[r for r in rows if r['status'].startswith('not in')],
           wordsNotTogether=[r for r in rows if r['status'].startswith('each word')], all=rows)
json.dump(out, open(OUT, 'w'), ensure_ascii=False, indent=1)
print('quoted Gurmukhi runs inside English teaching text:', len(rows)); print(dict(stats)); [print('  ', f, dict(c)) for f, c in per_file.items()]
nf = collections.Counter(r['quoted'] for r in out['notFound']); print('distinct not found:', len(nf)); [print('    ', q, n) for q, n in nf.most_common(60)]
nt = collections.Counter(r['quoted'] for r in out['wordsNotTogether']); print('distinct "words not together":', len(nt)); [print('    ', q, n) for q, n in nt.most_common(25)]
