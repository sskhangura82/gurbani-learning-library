"""Writes the readable register (Markdown) from the files made by build_discrepancy_register.py. No new comparison.
Usage: python3 -I render_discrepancy_register.py <review folder> <register.json> <out.md>"""
import sys, json, csv, collections, os
REV, J, OUT = sys.argv[1:4]
R = json.load(open(J, encoding='utf-8')); rows = R['rows']; pub = [r for r in rows if r['published'] == 'yes']; readers = [r for r in rows if r['set'] == 'Published readers']
REG = list(csv.DictReader(open(os.path.join(REV, 'evidence', 's05_register.csv'), encoding='utf-8')))
SGGS = {'japji', 'sukhmani', 'anand', 'sohila', 'rehras:sggs-nine', 'rehras:anand', 'rehras:mundawani-slok'}
def tally(parts):
    c = collections.Counter(r['status'] for r in REG if (r['composition_part'] in SGGS) == parts); return c
s, d = tally(True), tally(False); n_s, n_d = sum(s.values()), sum(d.values())
CL = ['Layout only', 'Word division', 'Closing mark or verse number', 'Reading undecided', 'Probable slip', 'Encoding fault']
by_class = collections.Counter(r['disposition_class'] for r in pub); meta = {r['disposition_class']: (r['what_it_is'], r['who_decides']) for r in rows}
disp = {k: v['disposition'] for k, v in R['classes'].items()}
o = []; A = o.append
A('# Scripture discrepancy register\n')
A('**Reviewer:** Claude, independent second reviewer (AI system; not a Sikh scholar). **Date:** 26 November 2026.')
A('**Asked for by:** the builder\'s note relayed by the owner on 25 November 2026: list every exception, the passage, the source compared with, the difference and its disposition.\n')
A('This file adds **no new comparison**. It gathers into one place every comparison already recorded in this review (round 1, addendum S-A1, rounds 2 and 3) and gives each exception a disposition. It is built by script from those records: `tools/build_discrepancy_register.py`, `tools/render_discrepancy_register.py`. The full list, one row per exception with both texts, is `SCRIPTURE_DISCREPANCY_REGISTER_20261126.csv` (%d rows).\n' % len(rows))
A('## 1. The sentence this replaces\n')
A('In my plain-language summary to the owner I wrote that Gurbani "matches the digital source almost everywhere I checked". That was too loose. The exact statement is:\n')
A('- **Sri Guru Granth Sahib Ji, in the three published readers:** %s lines compared. **No letter differs in any of them.** %s are laid out or marked differently (%s divided or run together differently, %s with a closing mark or number that differs).' % (f'{n_s:,}', s['line_division_only'] + s['verse_mark_or_numbering_only'], s['line_division_only'], s['verse_mark_or_numbering_only']))
A('- **Dasam Bani, in the Nitnem reader:** %s lines compared. **%s differ in at least one letter — about one line in eight.** %s more differ only in a closing mark or number, in layout, or in where a word is divided.' % (f'{n_d:,}', d['letter_level_difference'], d['verse_mark_or_numbering_only'] + d['line_division_only'] + d['spacing_only']))
A('- **Gurbani quoted outside the readers:** %d lines compared. %d differ, in three words (an encoding fault).' % (R['outsideReaders']['lines'], R['outsideReaders']['differ']))
A('- **In all, in the published app:** %s lines compared, %s the same in every respect, **%d exceptions**.\n' % (f"{len(REG) + R['outsideReaders']['lines']:,}", f"{s['exact'] + d['exact'] + R['outsideReaders']['exact']:,}", len(pub)))
A('"The same" means the same as one digital source. It does not mean checked against print, and it does not mean approved by a qualified reader. No line in this project has been compared with a printed page.\n')
A('## 2. What was compared with what\n')
A('| Text in the app | Compared with |\n|---|---|')
A('| Japji Sahib, Sukhmani Sahib, Anand Sahib, Sohila, the Shabads of Rehras, and every other line from Sri Guru Granth Sahib Ji | Shabad OS Database 5.0.0-next.0, its text named "Shabadaarth". The database gives the origin of that text as SGPC, Sri Amritsar, 2009–2012, four volumes. |')
A('| Jaap Sahib, Tav-Prasad Savaiye, Benti Chaupai, and the Dasam Bani in Rehras | The same database, its text named "Das Granthi". The database gives its origin as SGPC, Sri Amritsar, July 2014. |\n')
A('Both are digital transcriptions. I have not seen either printed book, so I cannot say the transcriptions are faithful to them. The pause marks the database adds were removed before comparing; nothing else was changed. The app\'s own Sri Guru Granth Sahib text comes from Open Granth, which is derived from the same database: **one digital family**, so agreement shows faithful copying, not independent confirmation.\n')
A('## 3. Every exception in the published app, by kind\n')
A('| Kind | Exceptions | What it is | Disposition | Who decides |\n|---|---|---|---|---|')
for c in CL: A('| **%s** | %d | %s | %s | %s |' % (c, by_class[c], meta[c][0], disp[c], meta[c][1]))
A('| **Total** | **%d** | | | |\n' % len(pub))
A('The builder asked that each difference be recorded as an error, a textual tradition, or a mismatch of sources. For the %d lines of Dasam Bani that differ in a letter, what is **established** is that the app\'s source and the reference are different sources and read differently. Whether a given reading is a slip or an accepted reading is **not established**, and I cannot establish it: digital copies of Dasam Bani disagree with one another, and only a named printed edition read by a qualified person can settle it. I have marked as "probable slip" only the %d where the app contradicts itself, stores a word in an invalid order, or runs its opening words together.\n' % (by_class['Reading undecided'] + by_class['Probable slip'], by_class['Probable slip']))
A('## 4. By composition (published readers)\n')
comps = list(dict.fromkeys(r['where'] for r in readers)); tot = collections.Counter(r['composition_part'] for r in REG); ex = collections.Counter(r['composition_part'] for r in REG if r['status'] == 'exact')
NAME = {'japji': 'Japji Sahib', 'sukhmani': 'Sukhmani Sahib', 'anand': 'Anand Sahib', 'sohila': 'Sohila', 'jaap': 'Jaap Sahib', 'savaiye': 'Tav-Prasad Savaiye', 'chaupai': 'Benti Chaupai', 'rehras:sggs-nine': 'Rehras Sahib, the nine Shabads', 'rehras:chaupai': 'Rehras Sahib, Chaupai', 'rehras:savaiya-dohira': 'Rehras Sahib, Swaiya and Dohra', 'rehras:anand': 'Rehras Sahib, Anand', 'rehras:mundawani-slok': 'Rehras Sahib, Mundavani and Salok'}
A('| Composition | Lines | Same | ' + ' | '.join(CL[:5]) + ' |\n|---|---|---|' + '---|' * 5)
for part in tot:
    cc = collections.Counter(r['disposition_class'] for r in readers if r['where'] == NAME[part])
    A('| %s | %s | %s | %s |' % (NAME[part], f'{tot[part]:,}', f'{ex[part]:,}', ' | '.join(str(cc[c]) if cc[c] else '–' for c in CL[:5])))
A('| **All** | **%s** | **%s** | %s |\n' % (f'{len(REG):,}', f"{sum(ex.values()):,}", ' | '.join('**%d**' % sum(1 for r in readers if r['disposition_class'] == c) for c in CL[:5])))
A('## 5. Every exception, listed\n')
A('Each line gives the place in the app\'s data, the page of the reference, and the words that differ: **app → reference**. Where only layout differs, the app\'s line is given. Both full lines are in the CSV.\n')
order = ['CI-S-16', 'CI-S-02', 'CI-S-03', 'CI-S-05', 'CI-S-04', 'CI-S-06', 'CI-S-07', 'CI-S-11 (and CI-S-10 for the layout)', 'CI-S-08', 'CI-S-10', 'CI-S-01', 'CI-S-14', 'none raised (counted in the round 1 table)']
TITLE = {'CI-S-16': 'Three words drawn with a doubled sign, outside the readers', 'CI-S-02': 'Jaap Sahib 96–98: one word stored two ways', 'CI-S-03': 'Jaap Sahib: four places where the text contradicts its own pattern', 'CI-S-05': 'Openings of Savaiye and Chaupai run together', 'CI-S-04': 'Jaap Sahib: readings that differ from the reference',
         'CI-S-06': 'Benti Chaupai (and the same text stored again in Rehras): readings that differ', 'CI-S-07': 'Tav-Prasad Savaiye: readings that differ', 'CI-S-11 (and CI-S-10 for the layout)': 'Rehras: Swaiya and Dohra', 'CI-S-08': 'Verse numbers follow a different convention', 'CI-S-10': 'Rehras: Shabads stored as run-on blocks',
         'CI-S-01': 'Jaap Sahib 62: an invocation stored as a verse line', 'CI-S-14': 'Small points: headings without a closing mark; Jaap 55, 56 and 73', 'none raised (counted in the round 1 table)': 'Counted in round 1 but given no finding of their own: word division, and four lines of Sohila'}
for f in order:
    g = [r for r in pub if r['finding'] == f]
    if not g: continue
    cls = collections.Counter(r['disposition_class'] for r in g)
    A('### %s — %s (%d)\n' % (f.split(' (')[0] if f.startswith('CI') else 'No separate finding', TITLE[f], len(g)))
    A('*' + '; '.join('%s: %d' % (k, v) for k, v in cls.items()) + '.*\n')
    for r in g:
        if r['disposition_class'] == 'Layout only': body = r['app_text'] if len(r['app_text']) <= 70 else r['app_text'][:67] + '…'
        else: body = r['words_app_then_reference']
        A('- `%s` · p. %s · %s' % (r['id'], r['ang_or_page'], body))
    A('')
dr = R['salokMahalla9Draft']
A('## 6. Material that is not published\n')
A('| Material | Lines compared | Same | Exceptions |\n|---|---|---|---|')
A('| Daily Hukamnama fixture, PR #43 (Gujri Mahalla 1, Ang 504–505) | 19 | 19 | 0 |')
A('| Explorer lesson, PR #41 (opening lines of Sukhmani Ashtpadi 17) | 9 | 9 | 0 — but its nine lines and 27 headwords are a second, unchecked copy (R2-X-05), and 2 of 27 headwords sit under a unit where they do not occur (R2-X-07) |')
A('| Knowledge pilot, PR #45 (three Saloks) | 19 | 19 | 0 |')
A('| Draft lesson, PR #44 (mine) | holds no Gurbani; points to the 19 lines of PR #43 by fingerprint | – | – |')
A('| Recovered draft of Salok Mahalla 9 (never merged) | %d | %d | **%d** rows carry %d pause marks inside the line; all %d are the same once the marks are removed (R2-K-01). Listed in the CSV. |\n' % (dr['rows'], dr['exactAsStored'], dr['rowsWithPauseMarks'], dr['pauseMarks'], dr['exactAfterRemoval']))
A('## 7. Recorded, but not differences from the reference\n')
A('- **Anand Sahib 24.3, ਕਚਂੀ (CI-S-13).** Same as the reference, which keeps an unusual order of signs. Open question is how an iPhone draws it. Needs a look on a real phone.')
A('- **Ang numbers.** 2,733 checked; 2,732 agree; the one difference is at a page turn where the app is right.')
A('- **The reference is not infallible.** Its ready-made list for Sukhmani Sahib omits one line that the app has (CI-S-15). In Benti Chaupai 26.3 the reference reads ਦੇਖ where the app reads ਦੇਹ; that row is among the undecided ones.')
A('- **Which Rehras and which Chaupai (CI-S-09).** A choice of tradition, for the owner. Not a textual difference.')
A('- **No composition names a printed edition (CI-S-12).** This is why so many rows above end in "undecided".\n')
A('## 8. Corrections to my own earlier wording\n')
A('1. "Almost everywhere" (my summary of 25 November) is replaced by section 1.')
A('2. Round 1 said Dasam Bani was compared with the database\'s "Dasam Granth text". Precisely, it was the database\'s **"Das Granthi"** text (SGPC, 2014, as the database records it). The comparison itself is unchanged.')
A('3. Finding CI-S-02 says the word in Jaap Sahib 96–98 occurs in "eleven places". The register has **%d** (5 in one spelling, 7 in the other). The list of places in the finding was already complete; the count in its sentence was wrong.\n' % R['jaap96to98'])
A('## 9. What would close each kind\n')
A('| Kind | Closed when |\n|---|---|')
A('| Layout only | The app divides the lines as the reference does, headings are headings, and a fresh comparison shows 0 of this kind. Saved places on the old rows still open. |')
A('| Encoding fault | The three words are stored with the single sign; before-and-after record kept; the owner has signed it off. |')
A('| Probable slip · Reading undecided · Word division · Closing mark or number | The owner has named one printed edition for Dasam Bani; a qualified reader has gone through the list against it and written keep or change, with the page, beside every row; each change is made with a before-and-after record and compared again by someone who did not make it. |')
A('| Unpublished draft | The pause marks are removed or kept as a separate labelled layer, and a fresh comparison shows 117 of 117. |\n')
A('The list for a qualified reader already exists for the %d lines that differ in a letter: `scholar-packet/DASAM_BANI_DIFFERENCES_FOR_PRINT_COLLATION.md`, with an empty decision column.' % d['letter_level_difference'])
open(OUT, 'w', encoding='utf-8').write('\n'.join(o) + '\n')
print('written', OUT, len(o), 'blocks; SGGS', n_s, dict(s), '| Dasam', n_d, dict(d))
