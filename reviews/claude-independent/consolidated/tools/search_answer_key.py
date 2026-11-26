"""Answer key for the search acceptance cases proposed by the builder (exact word, word variant, topic, Ang, no match),
taken from the reference so that a future full index can be checked against something the builder did not produce.
Reference: Shabad OS Database 5.0.0-next.0, text 'Shabadaarth' (Sri Guru Granth Sahib Ji only), pause marks removed.
A "word" is a run of letters between spaces. One digital family; not print.
Usage: python3 -I search_answer_key.py <review folder> <master.sqlite> <out.json>"""
import sys, json, sqlite3, re, collections, importlib.util, os
REV, DB, OUT = sys.argv[1:4]
spec = importlib.util.spec_from_file_location('s05', os.path.join(REV, 'tools', 's05_collate_shabados.py')); s05 = importlib.util.module_from_spec(spec); spec.loader.exec_module(s05)
con = sqlite3.connect(f'file:{DB}?mode=ro', uri=True)
q = '''select lg.id, a.name, al.data, al.additional from asset_lines al join lines l on l.id=al.line_id join line_groups lg on lg.id=l.line_group_id
       join sections s on s.id=lg.section_id left join authors a on a.id=lg.author_id
       where al.type='primary' and al.asset_id='SSA2' and s.source_id='SGGS' order by cast(s.source_order as int), cast(lg.section_order as int), cast(l.line_group_order as int)'''
L = []
for gid, author, data, add in con.execute(q):
    a = json.loads(add) if add else {}; L.append(dict(group=gid, author=json.loads(author)['Latn'] if author else None, page=a.get('page'), text=s05.norm_ref(data)))
R = dict(reference='Shabad OS Database 5.0.0-next.0, Shabadaarth text, Sri Guru Granth Sahib Ji', lines=len(L), passages=len({l['group'] for l in L}), angs=len({l['page'] for l in L}))
def stats(word):
    whole = [l for l in L if word in l['text'].split()]; inside = [l for l in L if word in l['text']]
    return dict(linesWithThisExactWord=len(whole), passagesWithThisExactWord=len({l['group'] for l in whole}), angsWithThisExactWord=len({l['page'] for l in whole}), linesWhereTheLettersOccurAnywhere=len(inside), linesAMatchOnLettersWouldAddWrongly=len(inside) - len(whole))
R['exactWord'] = {w: stats(w) for w in ['ਮਾਇਆ', 'ਹੁਕਮ', 'ਹੁਕਮੁ', 'ਹੁਕਮਿ', 'ਹੁਕਮੀ', 'ਹੁਕਮੈ', 'ਹੁਕਮੇ', 'ਹੁਕਮਾਉ', 'ਹਉਮੈ', 'ਨਿਮਰਤਾ', 'ਨੀਵੀ']}
forms = collections.Counter(t for l in L for t in l['text'].split() if t.startswith('ਹੁਕਮ')); R['everyWordBeginningHukam'] = dict(forms.most_common())
# Ang 522
g = collections.OrderedDict()
for l in L: g.setdefault(l['group'], []).append(l)
on = [v for v in g.values() if any(x['page'] == 522 for x in v)]
R['ang522'] = dict(passagesWithALineOnThisAng=len(on), beginOnAnEarlierAng=sum(1 for v in on if v[0]['page'] < 522), endOnALaterAng=sum(1 for v in on if v[-1]['page'] > 522),
                   passages=[dict(author=v[0]['author'], lines=len(v), pages=sorted({x['page'] for x in v}), heading=v[0]['text'], firstLine=v[1]['text'] if len(v) > 1 else None, linesWithTheWordMaya=sum('ਮਾਇਆ' in x['text'].split() for x in v)) for v in on])
t = next(v for v in on if any('ਨਾਨਕ ਸਤਿਗੁਰਿ ਭੇਟਿਐ' in x['text'] for x in v))
R['theSalokInTheExample'] = dict(author=t[0]['author'], lines=[x['text'] for x in t], containsTheWordMaya=any('ਮਾਇਆ' in x['text'].split() for x in t), expectedResultFor=dict(exactWordMaya='must NOT appear', topicMaya='may appear, labelled as a connection someone made, with who made it and its review state', ang522='appears as one of ten passages'))
R['noMatchExamples'] = {w: sum(w in l['text'] for l in L) for w in ['ਕੰਪਿਊਟਰ', 'ਇੰਟਰਨੈੱਟ', 'computer']}
json.dump(R, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print({k: R[k] for k in ('lines', 'passages', 'angs')}); 
for w, s in R['exactWord'].items(): print(w, s)
print(R['everyWordBeginningHukam']); print({k: v for k, v in R['ang522'].items() if k != 'passages'}); print(R['theSalokInTheExample']); print(R['noMatchExamples'])
