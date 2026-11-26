"""Round 3, step 0 — run BEFORE the pilot's data is opened.
Lists, from the pinned reference (Shabad OS Database 5.0.0-next.0, Sri Guru Granth Sahib asset SSA2),
every line group (the reference's unit for one Shabad / Salok / Pauri) that has a line on Ang 466, 470
or 1364, with its author and lines. This fixes the candidate Salok boundaries independently of the pilot.
Usage: python3 -I k3_00_reference_boundaries.py <master.sqlite> <out.json>
"""
import sys, json, sqlite3, re, hashlib

def main(db, out):
    con = sqlite3.connect(f'file:{db}?mode=ro', uri=True)
    q = '''select lg.id, a.name, lg.author_id, s.name, cast(s.source_order as int), cast(lg.section_order as int),
                  l.id, cast(l.line_group_order as int), al.data, al.additional
           from asset_lines al join lines l on l.id=al.line_id
           join line_groups lg on lg.id=l.line_group_id join sections s on s.id=lg.section_id
           left join authors a on a.id=lg.author_id
           where al.type='primary' and al.asset_id='SSA2'
           order by 5,6,8'''
    groups = {}
    order = []
    for gid, author, aid, sec, so, go, lid, lo, data, add in con.execute(q):
        a = json.loads(add) if add else {}
        g = groups.get(gid)
        if g is None:
            g = groups[gid] = dict(group=gid, author=author, authorId=aid, section=sec, sectionOrder=so, groupOrder=go, lines=[])
            order.append(gid)
        g['lines'].append(dict(id=lid, n=lo, page=a.get('page'), line=a.get('line'), raw=data))
    want = {}
    for i, gid in enumerate(order):
        g = groups[gid]
        pages = sorted({l['page'] for l in g['lines'] if l['page'] is not None})
        if any(p in (466, 470, 1364) for p in pages):
            g = dict(g); g['pages'] = pages; g['indexInSource'] = i
            g['sha256OfRawLines'] = hashlib.sha256('\n'.join(l['raw'] for l in g['lines']).encode('utf-8')).hexdigest()
            want[gid] = g
    json.dump(dict(reference='Shabad OS Database 5.0.0-next.0, asset SSA2', groups=list(want.values())), open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for g in want.values():
        first = g['lines'][0]['raw']; last = g['lines'][-1]['raw']
        print(f"{g['pages']} {g['author']!s:<22} lines={len(g['lines']):>2}  first: {first[:46]}  ...  last: {last[-40:]}")

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
