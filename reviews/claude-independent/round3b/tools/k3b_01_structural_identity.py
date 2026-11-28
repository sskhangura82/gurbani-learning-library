"""Round 3b / R3-01, R3-02: are the candidate's new structural names true, and does the crosswalk hold?
R3-01 said the old name sggs.asa.470.m1.salok01 fitted two different Saloks of Mahalla 1 on Ang 470. The candidate
now names passages by their place in the Vaar. This works that structure out independently from the pinned reference
(Shabad OS 5.0.0-next.0, asset SSA2), reading the Pauri numbers from the text itself (each Pauri ends ॥N॥), and asks:
 - does each named passage stand exactly where its name says?
 - would any other Salok of the same Vaar get the same name?  (the R3-01 question)
 - the Kabir Salok: is it the seventh Salok of its own collection?
 - does every one of the old names map to exactly one new one, and does every stored fingerprint recompute?
Usage: python3 -I k3b_01_structural_identity.py <scripture.json> <master.sqlite> <out.json>"""
import hashlib, importlib.util, json, os, re, sqlite3, sys
SC, DB, OUT = sys.argv[1:4]
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('s05', os.path.join(HERE, '..', '..', 'tools', 's05_collate_shabados.py'))
s05 = importlib.util.module_from_spec(spec); spec.loader.exec_module(s05)
sc = json.load(open(SC, encoding='utf-8')); con = sqlite3.connect(DB); DIG = '੦੧੨੩੪੫੬੭੮੯'
def load(section):
    q = """select al.data, cast(lg.section_order as int), cast(l.line_group_order as int), a.name, json_extract(al.additional,'$.page')
           from asset_lines al join lines l on l.id = al.line_id join line_groups lg on lg.id = l.line_group_id
           left join authors a on a.id = lg.author_id where al.type = 'primary' and al.asset_id = 'SSA2' and lg.section_id = ? order by 2, 3"""
    out = []
    for d, go, lo, aname, page in con.execute(q, (section,)):
        if not out or out[-1]['go'] != go: out.append(dict(go=go, author=(json.loads(aname)['Latn'] if aname else None), page=page, lines=[]))
        out[-1]['lines'].append(s05.norm_ref(d))
    return out
def verse_number(line):
    m = re.findall(r'॥([੦-੯]+)॥', line)
    return int(''.join(str(DIG.index(c)) for c in m[-1])) if m else None
R = {'reference': 'Shabad OS Database 5.0.0-next.0, asset SSA2', 'checks': {}}
# ---- Asa Ki Vaar inside Raag Aasaa: Pauris numbered by the text, Saloks numbered within each block
groups = load('GAS9')
pauris = [(i, g, verse_number(g['lines'][-1])) for i, g in enumerate(groups) if g['lines'] and g['lines'][0].startswith('ਪਉੜੀ')]
R['checks']['vaar'] = dict(pauriGroupsFound=len(pauris), numbersReadFromTheText=[p[2] for p in pauris], numberingIsOneToTwentyFour=[p[2] for p in pauris] == list(range(1, len(pauris) + 1)))
names = {}
for n, (pi, pg, pnum) in enumerate(pauris):
    start = pauris[n - 1][0] + 1 if n else 0
    saloks = [j for j in range(start, pi) if not groups[j]['lines'][0].startswith('ਪਉੜੀ')]
    for k, j in enumerate(saloks, 1): names.setdefault('pauri%03d.salok%02d' % (pnum, k), []).append(j)
R['checks']['everyStructuralNameInTheVaarIsUnique'] = all(len(v) == 1 for v in names.values())
R['checks']['salokNamesInTheVaar'] = len(names)
R['checks']['namesUsedTwice'] = {k: len(v) for k, v in names.items() if len(v) > 1}
# ---- each named passage
def body(pid): return [o['text'] for o in sc['occurrences'] if o['passageId'] == pid and o['kind'] != 'heading']
def heading(pid): return next((o['text'] for o in sc['occurrences'] if o['passageId'] == pid and o['kind'] == 'heading'), None)
place = {}
for p in sc['passages']:
    pid = p['id']; b = body(pid); first = b[0] if b else None
    m = re.search(r'pauri(\d+)\.salok(\d+)', pid); claim = dict(beforePauri=int(m.group(1)), salokNumber=int(m.group(2))) if m else None
    where = next((nm for nm, idxs in names.items() if any(groups[j]['lines'][1:] == b and groups[j]['lines'][0] == heading(pid) for j in idxs)), None)
    place[pid] = dict(claimedByItsName=claim, bodyLines=len(b), headingInCandidate=heading(pid),
                      foundInTheReferenceAs=where, nameMatchesWhereItActuallyIs=bool(claim and where == 'pauri%03d.salok%02d' % (claim['beforePauri'], claim['salokNumber'])),
                      howManySalokMatchThatNameInTheReference=len(names.get(where, [])) if where else None)
R['checks']['passagePlacement'] = place
# ---- the old R3-01 collision, now resolved?
m1_470 = [dict(name=nm, author=groups[v[0]]['author'], page=groups[v[0]]['page'], lines=len(groups[v[0]]['lines']) - 1, first=groups[v[0]]['lines'][1][:46])
          for nm, v in sorted(names.items()) if groups[v[0]]['page'] == 470]
R['checks']['everySalokOnAng470'] = m1_470
R['checks']['theTwoThatSharedTheOldNameNowDiffer'] = len({x['name'] for x in m1_470}) == len(m1_470)
# ---- the Kabir Salok: its own collection
kab = next((sid for (sid,) in con.execute("select id from sections where source_id='SGGS'") if (lambda gs: gs and any('ਕਬੀਰ' in (gs[0]['lines'][0] or '') for g in gs[:1]))(None) ), None)
rows = con.execute("""select s.id, s.name, count(*) n, min(json_extract(al.additional,'$.page')) mn, max(json_extract(al.additional,'$.page')) mx
                      from asset_lines al join lines l on l.id=al.line_id join line_groups lg on lg.id=l.line_group_id join sections s on s.id=lg.section_id
                      where al.type='primary' and al.asset_id='SSA2' and s.source_id='SGGS' group by s.id having mn<=1364 and mx>=1364""").fetchall()
kb = {}
for sid, nm, n, mn, mx in rows:
    gs = load(sid); b = body('sggs.kabir.salok007'); h = heading('sggs.kabir.salok007')
    idx = next((i for i, g in enumerate(gs) if g['lines'][1:] == b or g['lines'] == b), None)
    sal = [i for i, g in enumerate(gs) if g['lines'] and not g['lines'][0].startswith(('ਪਉੜੀ',))]
    kb[nm] = dict(section=sid, groups=len(gs), ourPassageIsGroupNumber=(idx + 1) if idx is not None else None,
                  lastVerseNumberOfThatGroup=verse_number(gs[idx]['lines'][-1]) if idx is not None else None, page=gs[idx]['page'] if idx is not None else None)
R['checks']['kabirSalok'] = kb
# ---- crosswalk and fingerprints
lp, lo = sc.get('legacyPassageIds', {}), sc.get('legacyOccurrenceIds', {})
pids = {p['id'] for p in sc['passages']}; oids = {o['id'] for o in sc['occurrences']}
R['checks']['crosswalk'] = dict(oldPassageNames=sorted(lp), oldOccurrenceNames=len(lo), passagesInFile=len(pids), occurrencesInFile=len(oids),
    everyOldPassageNamePointsAtARealPassage=all(v in pids for v in lp.values()), everyOldOccurrenceNamePointsAtARealOccurrence=all(v in oids for v in lo.values()),
    everyOccurrenceHasExactlyOneOldName=sorted(lo.values()) == sorted(oids), passagesWithNoOldName=sorted(pids - set(lp.values())),
    anyNewNameClaimedByTwoOldNames=[v for v in set(lo.values()) if list(lo.values()).count(v) > 1])
bad = [o['id'] for o in sc['occurrences'] if hashlib.sha256(o['text'].encode()).hexdigest() != o.get('textSha256')]
R['checks']['fingerprints'] = dict(occurrences=len(sc['occurrences']), recompute=len(sc['occurrences']) - len(bad), wrong=bad)
print(json.dumps(R['checks'], ensure_ascii=False, indent=1)[:3000]); json.dump(R, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
