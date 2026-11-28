#!/usr/bin/env python3
"""Check that Salok Sheikh Farid teaching drafts do not reproduce commentary wording.

The drafts are original writing. Four commentaries in the Shabad OS database were
consulted to compare readings: Prof. Sahib Singh (PSST), the Faridkot Teeka (NKFT),
Bhai Manmohan Singh (SBMS) and Sant Singh Khalsa (DSSK). This tool maps each
selected Farid line to its Shabad OS line, then measures the longest run of
consecutive shared words between every authored field of a Salok and the
commentary text for that Salok's lines. Punjabi fields are compared with the
Punjabi commentaries and English fields with the English one.

A run of MAX_RUN words or more fails the check. The database is not part of this
repository; pass its path explicitly.

Usage:
  python3 -I tools/check-salok-farid-teaching-overlap.py --db /path/to/master.sqlite \
      --pack salok-farid/data/salok-farid.json research/salok-farid/teaching-001-016.json
"""
import argparse
import difflib
import hashlib
import json
import re
import sqlite3
import sys
import unicodedata

MAX_RUN = 8
PA_ASSETS = ('PSST', 'NKFT', 'SBMS')
EN_ASSETS = ('DSSK',)


def norm_line(text):
    text = unicodedata.normalize('NFC', text)
    text = re.sub(r'[.,;]', '', text)
    return re.sub(r'\s+', ' ', text).strip()


def words(text):
    text = unicodedata.normalize('NFC', text).lower()
    text = re.sub(r'[^\w਀-੿]+', ' ', text)
    return [w for w in text.split() if w]


def longest_run(a, b):
    if not a or not b:
        return 0, ''
    m = difflib.SequenceMatcher(None, a, b, autojunk=False).find_longest_match(0, len(a), 0, len(b))
    return m.size, ' '.join(a[m.a:m.a + m.size])


def authored_fields(entry):
    for i, line in enumerate(entry['lines']):
        yield f'lines[{i}].simpleEn', 'en', line['simpleEn']
        yield f'lines[{i}].interpretiveCaution', 'en', line['interpretiveCaution']
        yield f'lines[{i}].simplePa', 'pa', line['simplePa']
        yield f'lines[{i}].interpretiveCautionPa', 'pa', line['interpretiveCautionPa']
    yield 'simple.en', 'en', entry['simple']['en']
    yield 'simple.pa', 'pa', entry['simple']['pa']
    study = entry['study']
    for key in ('focus', 'closeReading', 'interpretationCare', 'reflection', 'teachBack'):
        yield f'study.{key}', 'en', study[key]
        yield f'study.{key}Pa', 'pa', study[key + 'Pa']
    for j, w in enumerate(study['words']):
        yield f'study.words[{j}].workingGloss', 'en', w['workingGloss']
        yield f'study.words[{j}].workingGlossPa', 'pa', w['workingGlossPa']


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--db', required=True)
    ap.add_argument('--pack', required=True)
    ap.add_argument('--report')
    ap.add_argument('teaching', nargs='+')
    args = ap.parse_args()

    db_bytes = open(args.db, 'rb').read()
    db = sqlite3.connect(args.db)
    pack = json.load(open(args.pack, encoding='utf-8'))
    units = {u['ordinal']: u for u in pack['units']}

    primary = {}
    for lid, data, add in db.execute("select line_id,data,additional from asset_lines where asset_id='SSA2' and type='primary'"):
        page = json.loads(add or '{}').get('page')
        if page and 1376 <= page <= 1385:
            primary[lid] = norm_line(data)

    def map_line(text):
        n = norm_line(text)
        for lid, t in primary.items():
            if t == n:
                return lid, 1.0
        lid, t = max(primary.items(), key=lambda kv: difflib.SequenceMatcher(None, kv[1], n).ratio())
        return lid, round(difflib.SequenceMatcher(None, t, n).ratio(), 3)

    def commentary(lid, asset):
        rows = db.execute('select data from asset_lines where line_id=? and asset_id=?', (lid, asset)).fetchall()
        return ' '.join(r[0] or '' for r in rows)

    report = {'schema': 'glp.farid.teaching-overlap-check.v1', 'maxAllowedRun': MAX_RUN - 1,
              'database': {'sha256': hashlib.sha256(db_bytes).hexdigest()},
              'pack': {'path': args.pack, 'sha256': hashlib.sha256(open(args.pack, 'rb').read()).hexdigest()},
              'files': [], 'status': 'PASS'}
    for path in args.teaching:
        raw = open(path, 'rb').read()
        entries = json.loads(raw)
        file_report = {'path': path, 'sha256': hashlib.sha256(raw).hexdigest(), 'saloks': []}
        for entry in entries:
            unit = units[entry['ordinal']]
            mapped = [map_line(l['text']) for l in unit['lines']]
            pa_words = words(' '.join(commentary(lid, a) for lid, _ in mapped for a in PA_ASSETS))
            en_words = words(' '.join(commentary(lid, a) for lid, _ in mapped for a in EN_ASSETS))
            worst = {'en': (0, '', ''), 'pa': (0, '', '')}
            for field, lang, text in authored_fields(entry):
                size, run = longest_run(words(text), pa_words if lang == 'pa' else en_words)
                if size > worst[lang][0]:
                    worst[lang] = (size, run, field)
            salok_report = {
                'ordinal': entry['ordinal'],
                'mappedLines': [{'lineId': l['id'], 'shabadosLineId': lid, 'match': score}
                                for l, (lid, score) in zip(unit['lines'], mapped)],
                'longestSharedRun': {lang: {'words': w[0], 'field': w[2], 'text': w[1]} for lang, w in worst.items()},
            }
            if max(worst['en'][0], worst['pa'][0]) >= MAX_RUN:
                salok_report['status'] = 'FAIL'
                report['status'] = 'FAIL'
            file_report['saloks'].append(salok_report)
        report['files'].append(file_report)

    text = json.dumps(report, ensure_ascii=False, indent=2) + '\n'
    if args.report:
        open(args.report, 'w', encoding='utf-8').write(text)
    summary = [(s['ordinal'], s['longestSharedRun']['en']['words'], s['longestSharedRun']['pa']['words'])
               for f in report['files'] for s in f['saloks']]
    print(json.dumps({'status': report['status'], 'maxAllowedRun': MAX_RUN - 1,
                      'worstEn': max(x[1] for x in summary), 'worstPa': max(x[2] for x in summary)}))
    return 0 if report['status'] == 'PASS' else 1


if __name__ == '__main__':
    sys.exit(main())
