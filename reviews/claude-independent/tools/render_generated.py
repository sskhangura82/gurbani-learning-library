#!/usr/bin/env python3
"""Generate the data-driven parts of the deliverables so that numbers are never typed by hand.

Run from the repository root:  python3 -I reviews/claude-independent/tools/render_generated.py
Reads   evidence/s05_register.csv, evidence/s05_differences.json, findings/findings.json
Writes  scholar-packet/DASAM_BANI_DIFFERENCES_FOR_PRINT_COLLATION.{md,csv}
        D09_PRODUCT_EXCELLENCE_SCORECARD.md
        D10_PRIORITIZED_IMPROVEMENT_BACKLOG.md
"""
import csv, json, pathlib, collections

R = pathlib.Path(__file__).resolve().parent.parent
EV = R / 'evidence'
rows = list(csv.DictReader(open(EV / 's05_register.csv', encoding='utf-8')))
diffs = json.load(open(EV / 's05_differences.json', encoding='utf-8'))
F = json.load(open(R / 'findings' / 'findings.json', encoding='utf-8'))

# ───────────── scholar packet ─────────────
DASAM = ('jaap', 'savaiye', 'chaupai', 'rehras:chaupai', 'rehras:savaiya-dohira')
NAMES = {'jaap': 'Jaap Sahib', 'savaiye': 'Tav-Prasad Savaiye', 'chaupai': 'Benti Chaupai', 'rehras:chaupai': 'Rehras Sahib — Chaupai (same text as Benti Chaupai)',
         'rehras:savaiya-dohira': 'Rehras Sahib — Swaiya and Dohra'}
TYPE = {'vowel_sign': 'vowel sign', 'letters_or_word': 'letters / word', 'nasal_sign': 'nasal sign (bindi / tippi)', 'addak': 'addak', 'nukta': 'dot under letter',
        'yayya_encoding': 'half-ਯ form', 'mark_order': 'order of marks', 'spacing': 'spacing', 'verse_mark_or_numbering': 'danda / verse number',
        'app_has_extra_word': 'word only in app', 'reference_has_extra_word': 'word only in reference'}
by_id = collections.defaultdict(list)
for d in diffs:
    for i in d['app_ids']:
        by_id[i].append(d)
pk = R / 'scholar-packet'; pk.mkdir(exist_ok=True)
md = ['# Dasam Bani: every place where the app differs from the reference database at letter level', '',
      'Prepared for qualified reviewers. **Purpose: decide each row against one named printed edition.**',
      'The reviewer who compiled this list is an AI system; nothing here says which reading is correct.', '',
      '- "App" is what the Gurbani Learning Library shows at commit `a3476ac`.',
      '- "Reference" is the Shabad OS Database v5.0.0-next.0 Dasam Granth text (with its pause marks removed). It has slips of its own.',
      '- The page is the Dasam Granth page given by that database.',
      '- Spacing-only, danda-only and line-division-only differences are not listed here; they are in `evidence/s05_register.csv`.', '']
out_csv = [['composition', 'occurrence_id', 'reference_page', 'app_text', 'reference_text', 'what_differs', 'app_word', 'reference_word', 'decision', 'edition_and_page', 'reviewer']]
total = 0
for part in DASAM:
    sel = [r for r in rows if r['composition_part'] == part and r['status'] == 'letter_level_difference']
    allp = [r for r in rows if r['composition_part'] == part]
    total += len(sel)
    md += [f'## {NAMES[part]} — {len(sel)} of {len(allp)} occurrences', '', '| # | Place | Page | App | Reference | What differs (app → reference) | Decision |', '|---|---|---|---|---|---|---|']
    for n, r in enumerate(sel, 1):
        ds = [d for d in by_id.get(r['occurrence_id'], []) if d['type'] not in ('spacing', 'verse_mark_or_numbering')] or by_id.get(r['occurrence_id'], [])
        what = '; '.join(f"{TYPE.get(d['type'], d['type'])}: {d['app'] or '∅'} → {d['ref'] or '∅'}" for d in ds)
        ref_text = ' / '.join(dict.fromkeys(t for d in by_id.get(r['occurrence_id'], []) for t in d['ref_lines']))
        md.append(f"| {n} | `{r['occurrence_id']}` | {r['reference_pages']} | {r['app_text']} | {ref_text} | {what} | |")
        for d in ds:
            out_csv.append([NAMES[part], r['occurrence_id'], r['reference_pages'], r['app_text'], ref_text, TYPE.get(d['type'], d['type']), d['app'], d['ref'], '', '', ''])
    md.append('')
md.insert(4, f'**{total} occurrences** in all (Dasam Bani occurrences in the app: {sum(1 for r in rows if r["composition_part"] in DASAM)}). The Rehras copy of Chaupai repeats the Benti Chaupai rows.')
(pk / 'DASAM_BANI_DIFFERENCES_FOR_PRINT_COLLATION.md').write_text('\n'.join(md) + '\n', encoding='utf-8')
with open(pk / 'DASAM_BANI_DIFFERENCES_FOR_PRINT_COLLATION.csv', 'w', encoding='utf-8', newline='') as fh:
    csv.writer(fh).writerows(out_csv)

# ───────────── scorecard (rubric frozen in 00_…, section 6) ─────────────
# (category, weight, verdicts reached, test cases, score 0-4, what holds the score, score once high-severity items are closed, score once medium ones are closed too)
CATS = [
    ('Original Gurbani accuracy and provenance', 25, 11, 12, 1, 'CI-S-02, 03, 05, 06, 07, 10, 11, 12 open (high). S-06 second-witness check not done', 2, 3),
    ('Interpretation and theological fidelity', 20, 9.5, 10, 1, 'CI-M-01, CI-M-02 open (high). M-05 counted as half: 342 of 3,773 lines read', 2, 3),
    ('Educational depth and effectiveness', 20, 5, 5, 2, 'No high-severity item; word-by-word and cross-scripture levels absent (CI-E-01), Punjabi study thin (CI-M-10)', 2, 3),
    ('User experience and ease of use', 15, 17, 17, 2, 'No high-severity item; three different readers, jargon, small print (CI-U-01…10). Simulated use only', 2, 3),
    ('Accessibility and language support', 8, 8, 9, 1, 'CI-A-01 open (high); no real screen reader or device (A-09 not tested)', 2, 3),
    ('Reliability and offline functionality', 7, 13, 14, 1, 'CI-R-01, 02, 03 open (high). Safari storage rule not testable (D-08)', 2, 3),
    ('Privacy and spiritual integrity', 5, 8, 8, 2, 'Privacy itself is sound; no licence (CI-P-01); tone issues counted under interpretation', 2, 3),
]


def weighted_total(col):
    return sum(w * (c[col] * (c[2] / c[3])) / 4 for c in CATS for w in [c[1]])


now, s1closed, s2closed = weighted_total(4), weighted_total(6), weighted_total(7)
sev = collections.Counter(x['severity'] for x in F)
sc = ['# D09 · Product excellence scorecard', '',
      'Generated by `tools/render_generated.py`. The rubric, weights and the rule "untested is never a pass" were fixed in',
      '`00_BASELINE_AND_FROZEN_CRITERIA.md` §6 before any test was run. This is **our own quality score against that rubric**.',
      'It says nothing about being better or worse than any other app.', '',
      '## How to read it', '',
      '- Each category is scored 0–4. **1** = present but with a high-severity defect open. **2** = works for the main case, medium defects. **3** = sound on all evidence available without qualified human review. **4** = sound *and* validated by qualified scholars or real devices and readers.',
      '- A score counts only in proportion to how many of its test cases reached a verdict on real evidence.',
      '- **3 is the ceiling today for every category**, because no qualified human review and no real-device testing exist. So the highest total reachable right now is 75.', '',
      '## Scores', '',
      '| Category | Weight | Verdicts reached | Score | Counted | Points | What holds the score |', '|---|---|---|---|---|---|---|']
for name, w, got, of, score, why, a, b in CATS:
    cov = got / of
    sc.append(f'| {name} | {w}% | {got:g} of {of} ({cov:.0%}) | {score} | {score * cov:.2f} | {w * score * cov / 4:.1f} | {why} |')
sc += [f'| **Total** | 100% | | | | **{now:.0f} of 100** | Ceiling without human and device validation: 75 |', '',
       '## Override', '',
       '- **Confirmed critical defects (S0): 0.**',
       f'- **Critical if confirmed by print collation (S0 candidates): {sum(1 for x in F if x["s0_candidate"])}** — {sum(1 for x in F if x["s0_candidate"]) - 1} in Dasam Bani text, and one (CI-S-16, found in re-test RT-001) in three words of Sri Guru Granth Sahib quoted outside the readers. Because no printed edition has been consulted by anyone, these are unknown, and unknown is not a pass.',
       '- No privacy breach found. One data-loss path found (CI-R-02), rated high rather than critical because it does not occur in ordinary use today.',
       '- Under the gate rule the release is **not approved as verified scripture**. See D12.', '',
       '## After re-test RT-001 (2026-11-25)', '',
       '- The score above describes the **published** version and has not moved: nothing has been merged or deployed since the review.',
       '- On candidate PR #40 the fixes for CI-R-01 and CI-A-01 were reproduced and verified in emulation, and CI-R-02 was partly fixed. If that candidate is corrected as the re-test record asks, merged and deployed, the reliability and accessibility rows lose a high-severity item each; reliability still holds CI-R-03.',
       '- Six entries were added to the register (one high: CI-S-16). None changes a category score: scripture was already held at 1 by open high-severity items.', '',
       '## After the device-test preparation (2026-11-26)', '',
       '- Two medium entries were added (CI-R-11, CI-U-11), found in emulation on the published version and on candidate PR #40. Neither changes a category score: reliability is already held at 1 by open high-severity items, and ease of use at 2 by medium ones.',
       '- No device result exists yet, so the ceiling of 3 per category stands.', '',
       '## What moves the number', '',
       '| If… | Total |', '|---|---|',
       f'| Today | {now:.0f} |',
       f'| All high-severity findings closed (still no human review) | about {s1closed:.0f} |',
       f'| Medium findings closed as well | about {s2closed:.0f} |',
       '| Qualified scholarly review and real-device testing added on top | up to 100 |', '',
       '## Findings behind the scores', '',
       f'{len(F)} register entries: ' + ', '.join(f'{sev[k]} {lab}' for k, lab in (('S1', 'high'), ('S2', 'medium'), ('S3', 'low'), ('PASS', 'passed notes'))) + '. Full list: `FINDINGS_REGISTER.md`.']
(R / 'D09_PRODUCT_EXCELLENCE_SCORECARD.md').write_text('\n'.join(sc) + '\n', encoding='utf-8')

# ───────────── backlog ─────────────
# wave: 1 = before anything else (safety, honesty, access); 2 = scripture foundation (needs owner + scholars); 3 = one reader; 4 = depth
WAVE = {'CI-R-01': 1, 'CI-R-02': 1, 'CI-A-01': 1, 'CI-M-09': 1, 'CI-M-08': 1, 'CI-X-03': 1, 'CI-X-01': 1, 'CI-A-05': 1, 'CI-R-03': 1, 'CI-M-07': 1, 'CI-U-03': 1,
        'CI-S-12': 2, 'CI-X-02': 2, 'CI-S-06': 2, 'CI-S-07': 2, 'CI-S-05': 2, 'CI-S-02': 2, 'CI-S-03': 2, 'CI-S-04': 2, 'CI-S-11': 2, 'CI-S-10': 2, 'CI-S-08': 2, 'CI-S-09': 2,
        'CI-S-13': 2, 'CI-S-14': 2, 'CI-S-01': 2, 'CI-P-01': 2, 'CI-M-01': 2, 'CI-M-02': 2, 'CI-M-03': 2, 'CI-M-04': 2, 'CI-M-05': 2,
        'CI-U-01': 3, 'CI-U-02': 3, 'CI-U-04': 3, 'CI-U-05': 3, 'CI-U-06': 3, 'CI-U-07': 3, 'CI-U-08': 3, 'CI-U-09': 3, 'CI-U-10': 3, 'CI-A-02': 3, 'CI-A-03': 3, 'CI-R-04': 3, 'CI-R-05': 3, 'CI-P-02': 3,
        'CI-M-06': 4, 'CI-M-10': 4, 'CI-M-11': 4, 'CI-E-01': 4, 'CI-E-02': 4, 'CI-S-15': 4,
        # found during re-test RT-001
        'CI-R-07': 1, 'CI-R-08': 1, 'CI-R-09': 1, 'CI-R-10': 1, 'CI-S-16': 2, 'CI-M-13': 4,
        # found while preparing the device test (2026-11-26)
        'CI-R-11': 1, 'CI-U-11': 3}
STATUS_WORDS = {'OPEN': 'Open', 'OPEN-NEEDS-SCHOLAR': 'Open — needs a qualified reviewer', 'OPEN-OWNER-DECISION': 'Open — owner decision', 'UPSTREAM': 'Report upstream',
                'FIX-VERIFIED-ON-CANDIDATE': 'Fix verified on candidate PR #40 in emulation — not yet public', 'PARTLY-FIXED-ON-CANDIDATE': 'Partly fixed on candidate PR #40 — not yet public'}
WHO = {1: 'Claude proposes, ChatGPT reviews (no scripture text touched)', 2: 'Owner decides edition and reviewers; scholars collate; then builder applies with before/after records',
       3: 'Builder and Claude, design agreed first', 4: 'After waves 1–3; with scholars for content'}
TITLE = {1: 'Wave 1 — Safety, honesty and access (can start now; no Gurbani text changes)', 2: 'Wave 2 — Scripture and meaning foundation (needs the owner and qualified reviewers)',
         3: 'Wave 3 — One reader, one saved-learning store', 4: 'Wave 4 — Depth: words, cross-references, Punjabi-first study'}
order = {'S1': 0, 'S2': 1, 'S3': 2}
bl = ['# D10 · Prioritized improvement backlog', '', 'Generated from `findings/findings.json`. Each row links to its full entry (location, evidence, correction, acceptance test) in `FINDINGS_REGISTER.md`.',
      'Updated after re-test RT-001 (2026-11-25): six items added (CI-R-07 to CI-R-10, CI-S-16, CI-M-13) and a "Where it stands" column. "Fix verified on candidate" means the second reviewer saw the fix work on an unmerged candidate in emulation; the public app is unchanged until it is merged and deployed.',
      'Updated 2026-11-26 while preparing the device test: two items added (CI-R-11 in wave 1, CI-U-11 in wave 3).',
      'Order inside a wave is by severity. "S0 cand." = critical if print collation confirms it.', '']
open_items = [x for x in F if x['severity'] != 'PASS']
missing = [x['id'] for x in open_items if x['id'] not in WAVE]
assert not missing, missing
for w in (1, 2, 3, 4):
    items = sorted([x for x in open_items if WAVE[x['id']] == w], key=lambda x: (order[x['severity']], x['id']))
    bl += [f'## {TITLE[w]}', '', f'*Who:* {WHO[w]}', '', '| ID | Severity | What to do | Done when | Where it stands |', '|---|---|---|---|---|']
    for x in items:
        sv = x['severity'] + (' (S0 cand.)' if x['s0_candidate'] else '')
        bl.append(f"| [{x['id']}](FINDINGS_REGISTER.md#{x['id'].lower()}) | {sv} | {x['proposed_correction']} | {x['acceptance_test']} | {STATUS_WORDS.get(x['status'], x['status'])} |")
    bl.append('')
bl += ['## Not in the backlog on purpose', '',
       '- New compositions (the release note names Salok Mahalla 9 next). Recommendation: none until waves 1 and 2 are closed.',
       '- Audio, recitation, AI inside the reader, accounts, sharing, analytics: excluded by the assignment.', '']
(R / 'D10_PRIORITIZED_IMPROVEMENT_BACKLOG.md').write_text('\n'.join(bl) + '\n', encoding='utf-8')
print('scholar packet rows:', total, '| scorecard now/S1 closed/S2 closed:', round(now, 1), round(s1closed, 1), round(s2closed, 1), '| backlog items:', len(open_items))
