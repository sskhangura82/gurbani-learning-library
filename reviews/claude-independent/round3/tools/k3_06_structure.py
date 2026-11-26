"""Round 3 · structure of knowledge/pilot.json: connections, items nothing points to, names shared by two items,
identity pattern, what a passage is called, lesson length and language balance.
Usage: python3 -I k3_06_structure.py <pilot.json> <k3_00 boundaries json> <out.json>"""
import sys, json, re, collections
g = json.load(open(sys.argv[1], encoding='utf-8')); bounds = json.load(open(sys.argv[2], encoding='utf-8'))['groups']; R = {}
N = {n['id']: n for n in g['nodes']}; E = g['edges']
R['counts'] = dict(items=len(N), connections=len(E), rows=len(g['occurrences']), dictionaryEntries=sum(n['type'] == 'word' for n in g['nodes']), senses=sum(len(n['senses']) for n in g['nodes'] if n['type'] == 'word'),
                   concepts=sum(n['type'] == 'concept' for n in g['nodes']), conceptsWithLesson=sum(1 for n in g['nodes'] if n['type'] == 'concept' and n.get('lessonId')), lessons=sum(n['type'] == 'lesson' for n in g['nodes']),
                   studies=sum(n['type'] == 'study' for n in g['nodes']), courses=sum(n['type'] == 'course' for n in g['nodes']), authors=sum(n['type'] == 'author' for n in g['nodes']), collections=sum(n['type'] == 'collection' for n in g['nodes']))
R['connections'] = dict(endsMissing=[e['id'] for e in E if e['from'] not in N or e['to'] not in N], selfConnections=[e['id'] for e in E if e['from'] == e['to']],
                        duplicates=[k for k, v in collections.Counter((e['from'], e['to'], e['type']) for e in E).items() if v > 1], reversedPairs=[(e['id'], f['id']) for e in E for f in E if e['id'] < f['id'] and e['from'] == f['to'] and e['to'] == f['from']],
                        types=dict(collections.Counter(e['type'] for e in E)), evidenceKinds=dict(collections.Counter(type(e.get('evidence')).__name__ for e in E if 'evidence' in e)), withReason=sum('reason' in e for e in E), withEvidence=sum('evidence' in e for e in E))
pointed = set()
for e in E: pointed |= {e['from'], e['to']}
for n in g['nodes']:
    for k, v in n.items():
        if k.endswith('Id') and isinstance(v, str): pointed.add(v)
        if k.endswith('Ids') and isinstance(v, list): pointed |= set(v)
R['itemsNothingPointsTo'] = [dict(id=n['id'], status=n.get('status') or n.get('review')) for n in g['nodes'] if n['id'] not in pointed]
names = collections.defaultdict(set)
for n in g['nodes']:
    for a in {n.get('title'), n.get('pa'), *(n.get('aliases') or [])} - {None}: names[a.lower()].add(n['id'])
R['namesSharedByTwoItems'] = {k: sorted(v) for k, v in names.items() if len(v) > 1}
R['sameLabelOnScreen'] = [sorted(v) for k, v in collections.defaultdict(list, {}).items()]
labels = collections.defaultdict(list)
for n in g['nodes']: labels[(n.get('title') or n['id']) + (' · ' + n['pa'] if n.get('pa') else '')].append(n['id'])
R['sameLabelOnScreen'] = {k: v for k, v in labels.items() if len(v) > 1}
# identity pattern: would the pilot's own naming give two Saloks the same id?
pat = collections.defaultdict(list)
for b in bounds:
    last = b['lines'][-1]['raw']; m = re.search(r'॥([੦-੯]+)॥\s*$', last); first = b['lines'][0]['raw']
    mah = re.search(r'ਮ[ਃ:]\s*([੦-੯])|ਮਹਲਾ\s*([੦-੯])', first)
    if not m or 'ਪਉੜੀ' in first: continue
    num = int(''.join(str('੦੧੨੩੪੫੬੭੮੯'.index(c)) for c in m.group(1)))
    author = json.loads(b['author'])['Latn'] if b['author'] else None
    page = b['lines'][-1]['page']  # the Ang on which the Salok ends; 'startsOnAng' shows where it begins
    pat[(page, author, num)].append(dict(lines=len(b['lines']), startsOnAng=b['lines'][0]['page'], endsOnAng=page, first=b['lines'][1]['raw'] if len(b['lines']) > 1 else first))
R['saloksThatWouldShareAnIdentity'] = [dict(ang=k[0], author=k[1], salokNumber=k[2], howMany=len(v), bothWhollyOnThisAng=all(x['startsOnAng'] == x['endsOnAng'] for x in v), each=v) for k, v in pat.items() if len(v) > 1]
R['passageNames'] = [dict(id=n['id'], libraryTitle=n['title'], libraryTitlePunjabi=n.get('pa'), firstLineOfGurbani=next(o['text'] for o in g['occurrences'] if o['id'] == n['occurrenceIds'][1 if len(n['occurrenceIds']) > 2 else 0]), headingRowMarked=any('role' in o or 'heading' in o for o in g['occurrences'] if o['passageId'] == n['id']), pauriRecorded=any(k.lower().startswith('pauri') for k in n)) for n in g['nodes'] if n['type'] == 'passage']
R['lessons'] = [dict(id=n['id'], depth=d, englishWords=len(n[d]['en'].split()), punjabiWords=len(n[d]['pa'].split()), englishSentences=len(re.findall(r'[.?!](\s|$)', n[d]['en'])), punjabiSentences=len(re.findall(r'[।?!](\s|$)', n[d]['pa'])),
                     gurmukhiQuotedInEnglish=re.findall(r'[਀-੿]+', n[d]['en']), mentionsRemedyWithin=bool(re.search(r'remedy|cure|medicine|ਦਾਰੂ|ਇਲਾਜ|ਦਵਾ', n[d]['en'] + n[d]['pa'], re.I))) for n in g['nodes'] if n['type'] == 'lesson' for d in ('simple', 'detailed', 'deep')]
R['reviewStates'] = dict(collections.Counter((n['type'], n.get('review') or n.get('status')) for n in g['nodes']).most_common()) and {f'{k[0]}: {k[1]}': v for k, v in collections.Counter((n['type'], n.get('review') or n.get('status')) for n in g['nodes']).items()}
json.dump(R, open(sys.argv[3], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for k in ('counts', 'connections', 'itemsNothingPointsTo', 'namesSharedByTwoItems', 'sameLabelOnScreen', 'saloksThatWouldShareAnIdentity', 'passageNames', 'reviewStates'): print(k, '=', json.dumps(R[k], ensure_ascii=False)[:900])
for l in R['lessons']: print(l)
