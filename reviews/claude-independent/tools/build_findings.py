#!/usr/bin/env python3
"""Single source of truth for the review's findings.

Run:  python3 -I reviews/claude-independent/tools/build_findings.py
Writes findings/findings.json and FINDINGS_REGISTER.md (full register, one block per finding).
Every deliverable refers to findings by the IDs defined here, so an ID never changes meaning.

Severity scale is the one frozen in 00_BASELINE_AND_FROZEN_CRITERIA.md section 5.
`s0c` = "S0 candidate": would be Critical if a qualified print collation confirms the app's reading is wrong.
`status` values: OPEN · OPEN-NEEDS-SCHOLAR · OPEN-OWNER-DECISION · UPSTREAM · PASS-NOTE
               · FIX-VERIFIED-ON-CANDIDATE (second reviewer reproduced the defect and saw it fixed on a named, unmerged candidate, in emulation;
                 the public app is unchanged until that candidate is merged and deployed)
               · PARTLY-FIXED-ON-CANDIDATE (as above, with named criteria still open)
`origin`: INDEPENDENT (found before the builder's tests and documents were opened), COMPARISON (found while comparing),
          or RETEST (found during a re-test; true of the published version unless the entry says otherwise).
A re-test never rewrites a finding: `retest(...)` adds a dated note and may change the status, nothing else.
"""
import json, pathlib, sys

HERE = pathlib.Path(__file__).resolve().parent.parent
E = 'reviews/claude-independent/evidence/'
F = []


def f(id, sev, area, title, where, verse, evidence, why, fix, test, status='OPEN', s0c=False, origin='INDEPENDENT'):
    F.append(dict(id=id, severity=sev, s0_candidate=s0c, area=area, title=title, location=where, composition_or_verse=verse,
                  evidence=evidence, why_it_matters=why, proposed_correction=fix, acceptance_test=test, status=status, origin=origin))


# ───────────────────────────── Scripture ─────────────────────────────
f('CI-S-01', 'S3', 'Scripture', 'Jaap Sahib chhand 62: the invocation "ਤੇਰਾ ਜੋਰੁ ॥" is counted and taught as a verse line (reviewer\'s first claim of a reversed order is withdrawn)',
  'nitnem/data/jaap.json → unit jaap062 (line01 "ਤੇਰਾ ਜੋਰੁ ॥", metricalHeadings[0] "ਚਾਚਰੀ ਛੰਦ ॥", sourceDisplayOrder)', 'Jaap Sahib, chhand 62',
  'CORRECTED 2026-11-25 during comparison. On screen the reader draws "ਤੇਰਾ ਜੋਰੁ ॥" and then "ਚਾਚਰੀ ਛੰਦ ॥", which is the reference order (database line KUAA, Dasam Granth p. 4: "ਤੇਰਾ ਜੋਰੁ ॥ ਚਾਚਰੀ ਛੰਦ ॥") — ' + E + 's09_jaap62_order.json, ' + E + 's11c_rendered_order.json. My first register listed headings before lines inside each unit and so reported a reversed order; that was my extraction script\'s mistake, not the app\'s. The builder\'s release note and tests already described and checked this order. What remains: the phrase is stored as verse "Line 1 of 5" with its own meaning, where the reference has it inside the heading line, so chhand 62 shows five lines against the Granth\'s four.',
  'Small: a learner is told chhand 62 has five lines. The builder kept the line ID on purpose so that saved bookmarks would survive.',
  'When line IDs are next migrated (see CI-R-03), type the phrase as an invocation/heading and keep its saved-learning link.',
  'Chhand 62 is labelled with four verse lines; a bookmark saved on the old ID still opens.',
  'OPEN')
f('CI-S-02', 'S1', 'Scripture', 'Jaap Sahib: the same word is stored in two different encodings, one of them ill-formed',
  'nitnem/data/jaap.json → jaap096.line01–04, jaap098.line04 ("ਚੱਤ੍ਰੁ") and jaap097.line01–04, jaap098.line01–03 ("ਚੱਤੁ੍ਰ")', 'Jaap Sahib, chhands 96–98',
  E + 's04_shaping.json, ' + E + 's05_differences.json, screenshot ' + E + 'screenshots/21_jaap096_098_chatr.png. In "ਚੱਤੁ੍ਰ" the vowel sign is stored before the joining mark, which is not a valid order; the two spellings draw differently on screen. The reference reads "ਚੱਤ੍ਰ" in all eleven places. The builder reports [R] that its Jaap text equals a BaniDB snapshot exactly, so this inconsistency probably comes from that source and should be reported to it once print is checked.',
  'Visibly inconsistent Gurbani within three adjacent chhands; how it draws depends on the phone\'s text engine (not tested on an iPhone).',
  'Choose one reading from a named printed edition and store it in valid mark order in all eleven places.',
  'All eleven occurrences are byte-identical for this word; a scan for "vowel sign before virama" over the whole corpus returns 0; rendering checked on a physical iPhone.',
  'OPEN-NEEDS-SCHOLAR', s0c=True)
f('CI-S-03', 'S1', 'Scripture', 'Jaap Sahib: four places where the text contradicts its own pattern',
  'nitnem/data/jaap.json → jaap108.line04, jaap122.line04, jaap198.line04 (vs jaap198.line02), jaap179.line04', 'Jaap Sahib 108.4, 122.4, 198.4, 179.4',
  '108.4 "ਕਿ ਗੈਬੁਲ ਗ਼ੈਬ ਹੈਂ" (the dot under ਗ is on the second word only; reference ਗ਼ੈਬੁਲ ਗ਼ੈਬ). 122.4 "ਜ਼ਮੀਨਲ ਜ਼ਮਾਨੈਂ" (every neighbouring word of this form ends -ੁਲ; reference ਜ਼ਮੀਨੁਲ). 198.4 "ਕਰੀਮਲੁ ਰਹੀਮੇ" while 198.2 in the same chhand has "ਕਰੀਮੁਲ" (reference ਕਰੀਮੁਲ in both). 179.4 "ਹੈਂ॥੧੭੯॥" has no space before the verse number, unlike the other 198 chhands. ' + E + 's05_differences.json. The builder reports [R] exact equality with a BaniDB snapshot, so these are probably that source\'s slips, accepted because "equal to the provider" was the pass condition.',
  'These read as transcription slips carried in from the source, in a bani recited daily.',
  'Correct after print confirmation; keep the previous reading and the supporting edition in the change record.',
  'The four lines match the confirmed edition; a pattern scan for words ending -ਲੁ where the chhand\'s other words end -ੁਲ returns 0; spacing before every verse number is uniform.',
  'OPEN-NEEDS-SCHOLAR', s0c=True)
f('CI-S-04', 'S2', 'Scripture', 'Jaap Sahib: 34 of 808 occurrences differ from the reference at letter level',
  'nitnem/data/jaap.json (full list in the register)', 'Jaap Sahib (e.g. 1.2 ਸਕਤਿ/ਸਕਤ, 79.4 ਰਿਸਾਲ/ਰਸਾਲ, 81.4 ਖੇਲਿ/ਖੇਲ, 86.3 ਨੇਤਿ/ਨੇਤ, 92.2 ਨ੍ਰਿਕਾਮ/ਨਿਕਾਮ, 125.2 ਬਿਭੂਤਿ/ਬਿਭੂਤ, 128.2 ਸਰੂਪੇ/ਸਰੂਪੈ, 141.4 ਅਜਾਦਿ/ਅਜਾਦ, 148.1 ਪੁਤ੍ਰੈ/ਪੁੱਤ੍ਰੈ, 179.1 ਅਮਿਤੇਸ੍ਵਰ/ਅਮ੍ਰਿਤੇਸ੍ਵਰ, 197.1 ਪ੍ਰਨਾਮੇ/ਪ੍ਰਣਾਮੇ)',
  E + 's05_register.csv (status = letter_level_difference, part = jaap) and ' + E + 's05_differences.json. For 1.2 two further web witnesses were seen and they disagree with each other, which shows digital copies of Dasam Bani cannot settle this.',
  'Neither side is proven right. Without a named printed edition nobody can say which reading the app intends to publish.',
  'Give the list to qualified reviewers for collation against one named printed edition; record each decision.',
  'Every row in the list carries a decision (keep / change), the edition and page, and the reviewer.',
  'OPEN-NEEDS-SCHOLAR')
f('CI-S-05', 'S1', 'Scripture', 'Savaiye and Chaupai Sahib: opening lines are run together and split in the wrong places',
  'nitnem/data/savaiye.json and nitnem/data/chaupai.json → preface records', 'Tav-Prasad Savaiye and Benti Chaupai, opening',
  'App: "ੴ" / "ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ ॥ ਸ੍ਰੀ ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਹ ॥" / "ਪਾਤਿਸਾਹੀ੧੦॥ ਤ੍ਵਪ੍ਰਸਾਦਿ ॥ ਸ੍ਵਯੇ ॥" and "ਪਾਤਿਸਾਹੀ੧੦॥ ਕਬਯੋ ਬਾਚ ਬੇਨਤੀ ॥ ਚੌਪਈ ॥". Reference: "ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ ॥", "ਪਾਤਿਸਾਹੀ ੧੦ ॥", "ਤ੍ਵ ਪ੍ਰਸਾਦਿ ॥ ਸਵੱਯੇ ॥", "ਕਬ੍ਯੋ ਬਾਚ ਬੇਨਤੀ ॥ ਚੌਪਈ ॥". Screenshots ' + E + 'screenshots/26_savaiye_preface.png, 27_chaupai_preface.png.',
  'The first thing a reader sees in two daily banis has missing spaces, ੴ cut off from ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ, and words fused.',
  'Re-enter the opening lines from a named printed edition with correct spacing and line division.',
  'Opening lines of both banis equal the chosen edition character for character; no Gurmukhi letter is directly followed by a numeral or ॥ without the edition showing it so.',
  'OPEN-NEEDS-SCHOLAR', s0c=True)
f('CI-S-06', 'S1', 'Scripture', 'Chaupai Sahib: 50 of 121 occurrences differ from the reference at letter level, and the source is not named',
  'nitnem/data/chaupai.json (edition id chaupai-expanded29-narrow-repairs-20261125; originalCompositionId chaupai-website-expanded-29-variant); the same text is repeated in nitnem/data/rehras.json (40 of 100)', 'Benti Chaupai, pauris 1–29',
  E + 's05_register.csv, ' + E + 's05_differences.json. Examples: half-ਯ written as full ਯ (ਸਿੱਖਯ ×3, ਅਸਿੱਖਯ, ਧਯਾਊਂ, ਕਬਯੋ); ਚਿੱਤ/ਚਿਤ, ਨਿਜੁ/ਨਿਜ, ਬੈਰਿਨ ਕੌ/ਬੈਰਨ ਕੋ, ਤੋਰਿ/ਤੋਰ, ਪਿਯਾਸਾ/ਪਿਆਸਾ, ਚੁਨ ਚੁਨ ਸੱਤ੍ਰੁ/ਚੁਨਿ ਚੁਨਿ ਸਤ੍ਰ, ਸਾਧਨ/ਸਾਧੁਨ, ਆਪੁਨੀ ਬੂਝਿ/ਆਪਨੀ ਬੂਝ, ਮਹਿ/ਮੋ (23.2), ਮੈਂ ਸਰਨਿ/ਮੈ ਸਰਣਿ (25.1). The data file\'s own note records 49 differences from BaniDB as well. The reference is not infallible either (26.3 app "ਦੇਹ", reference "ਦੇਖ").',
  'A bani recited morning and evening is published from a web text that matches neither of two well-known databases, with no edition a reviewer can open.',
  'Replace the text with a transcription of one named printed edition (decision for the owner and reviewers); keep the old readings in the change record; only then re-check meanings.',
  'Edition named in the data and on screen; collation against that edition shows 0 unexplained differences; half-ਯ encoded consistently; the Rehras copy is generated from the same records, not stored twice.',
  'OPEN-NEEDS-SCHOLAR', s0c=True)
f('CI-S-07', 'S1', 'Scripture', 'Tav-Prasad Savaiye: 12 of 43 occurrences differ from the reference at letter level, and the source is not named',
  'nitnem/data/savaiye.json (edition id savaiye-discover-narrow-repairs-20261125)', 'Savaiye 2.2 ਕਉ/ਕੋ, 2.4 ਕੌ/ਕੋ, 5.3 ਮਤੰਗਨ/ਮਤੰਗਨਿ, 7.1 ਭਵਿੱਖ/ਭਵਿਖ, 8.2 ਸਾਜ/ਸਾਜਿ, 8.3 ਫਾਸਿ/ਫਾਸ, 9.1 ਦੋਉ/ਦੋਊ, 9.3 ਸੋ/ਸੋਂ, 9.4 ਪ੍ਰਭ/ਪ੍ਰਭੁ, 10.3 ਕੋਉ/ਕੋਊ ×2',
  E + 's05_register.csv, ' + E + 's05_differences.json. The data file\'s own note records 12 differences from BaniDB.',
  'Same as CI-S-06.', 'Same as CI-S-06.', 'Same as CI-S-06, for Savaiye.', 'OPEN-NEEDS-SCHOLAR', s0c=True)
f('CI-S-08', 'S2', 'Scripture', 'Verse numbers in Chaupai and Savaiye follow a different convention from the Granth and this is not stated',
  'nitnem/data/chaupai.json, nitnem/data/savaiye.json, nitnem/data/rehras.json', 'Chaupai ॥੧॥–॥੨੯॥ (Granth ॥੩੭੭॥–॥੪੦੫॥); Savaiye ॥੧॥… (Granth ॥੧॥੨੧॥…); Rehras Swaiya ॥੧॥ (Granth ॥੮੬੩॥), Dohra number absent',
  E + 's05_differences.json (type verse_mark_or_numbering).', 'Both conventions exist in printed gutkas, so this may be intended; but numbers are part of the printed text and the app does not say which edition it follows.',
  'State the edition; keep its numbering exactly, including the Dohra number.', 'Numbering equals the named edition everywhere; the About text says which convention is used.', 'OPEN-NEEDS-SCHOLAR')
f('CI-S-09', 'S2', 'Scripture', 'Which Chaupai and which Rehras: tradition choices are made but not clearly explained to the reader',
  'nitnem/index.html, nitnem/data/library.json, nitnem/data/rehras.json', 'Morning Chaupai = pauris 1–25 plus four closing pauris, without the Swaiya "ਪਾਂਇ ਗਹੇ" and Dohra "ਸਗਲ ਦੁਆਰ"; Rehras = the shortest (SGPC Rehat Maryada) selection',
  'Reader subtitle for Chaupai: "selected expanded29-group reading … the evening Rehras selection ends after25". Parts widely recited in other traditions are absent from Rehras (for example ਹਰਿ ਜੁਗੁ ਜੁਗੁ ਭਗਤ ਉਪਾਇਆ, ਦੁਖੁ ਦਾਰੂ ਸੁਖੁ ਰੋਗੁ ਭਇਆ, ਤਿਥੈ ਤੂ ਸਮਰਥੁ, ਅੰਤਰਿ ਗੁਰੁ ਆਰਾਧਣਾ, ਰਖੇ ਰਖਣਹਾਰਿ). ' + E + 'u09_u15.json.',
  'A family that recites a longer Rehras or Chaupai will think lines are missing; the present wording is internal jargon.',
  'Owner decision on which tradition(s) to serve. Then say in plain words, in English and Punjabi, which maryada is followed and what other traditions add; later offer the longer forms as clearly named options.',
  'A first-time reader can find, within two taps, a plain statement of which tradition the Chaupai and Rehras follow.', 'OPEN-OWNER-DECISION')
f('CI-S-10', 'S1', 'Scripture', 'Rehras Sahib: nine shabads are stored as 23 run-on blocks with headings merged into verse and 105 missing spaces after ॥',
  'nitnem/data/rehras.json → rehras.sggs01 … rehras.sggs09 (23 rows); also savaiya01, dohira01, mundawani, slok (4 rows)', 'Rehras Sahib: So Dar through the ninth shabad; Swaiya, Dohra, Mundavani, Salok Mahala 5',
  'Rows hold up to twelve verse segments each. Raag and Mahalla headings sit inside verse rows ("ਆਸਾ ਮਹਲਾ ੧ ॥ਸੁਣਿ ਵਡਾ ਆਖੈ…"). In 105 places ॥ is followed directly by the next word ("ਸਮਾਲੇ ॥ਵਾਜੇ"). No letter differs from the reference. ' + E + 's05_differences.json (line_division, spacing), screenshot ' + E + 'screenshots/23_rehras_sodar_top.png.',
  'The first half of the evening prayer cannot be read line by line, has no line-level place, bookmark or meaning, and looks visibly different from the same shabads elsewhere in the Granth.',
  'Re-divide these rows into the same tuks as the reference, with headings as headings. Because line IDs will change, add a saved-learning migration first (see CI-R-03).',
  'Rehras SGGS section has one record per tuk with Ang; 0 occurrences of ॥ followed by a letter; headings typed as headings; existing bookmarks and notes on the old rows still open after the change.', 'OPEN')
f('CI-S-11', 'S1', 'Scripture', 'Rehras Swaiya and Dohra differ from the reference at letter level',
  'nitnem/data/rehras.json → rehras.savaiya01.line01, rehras.dohira01.line01', 'Swaiya "ਪਾਂਇ ਗਹੇ ਜਬ ਤੇ ਤੁਮਰੇ" and Dohra "ਸਗਲ ਦੁਆਰ ਕਉ ਛਾਡਿ ਕੈ"',
  'ਨਹੀ/ਨਹੀਂ, ਸਿੰਮ੍ਰਿਤਿ/ਸਿੰਮ੍ਰਿਤ, ਕਹੈ/ਕਹੈਂ, ਗਹਯੋ/ਗਹਿਓ, ਅਸਿ/ਅਸ, ਆਨਯੋ·ਮਾਨਯੋ (half-ਯ); Dohra verse number absent. ' + E + 's05_differences.json.',
  'Same as CI-S-06.', 'Same as CI-S-06.', 'Both rows equal the named edition.', 'OPEN-NEEDS-SCHOLAR', s0c=True)
f('CI-S-12', 'S1', 'Scripture', 'No composition names a printed edition, and agreement between related databases is being treated as confirmation',
  'js/japji-full-data.js, js/sukhmani-data.js, nitnem/data/*.json (source notes); README.md', 'All nine compositions',
  'Japji, Sukhmani and Anand come from Open Granth, which takes its Gurmukhi from the Shabad OS database — the same family as this review\'s reference. So "0 letter differences" for the 2,735 Sri Guru Granth Sahib occurrences shows faithful copying of that database, not independent confirmation against print. Savaiye and Chaupai come from an unnamed website text.',
  'The assignment asks that agreement among websites not be taken as independent textual confirmation. Today no reviewer can open the edition the app claims to reproduce.',
  'Name one printed edition per source (for example the SGPC standard 1430-page saroop for Sri Guru Granth Sahib; one named Dasam Granth or SGPC gutka for Dasam Bani); arrange human collation; record it.',
  'Each data file names edition, publisher and year; a collation record signed by named qualified reviewers exists for each composition.', 'OPEN-NEEDS-SCHOLAR')
f('CI-S-13', 'S2', 'Scripture', 'Anand Sahib pauri 24: one word stores the nasal dot before the vowel sign; device rendering is unverified',
  'nitnem/data/anand.json → anand24.line03 ("ਕਚਂੀ")', 'Anand Sahib 24.3',
  'Identical to the reference database, which keeps the printed order. Draws without error in the test engine with four fonts (' + E + 's04_shaping.json; screenshot ' + E + 'screenshots/20_anand24_kachi.png). Apple\'s text engine was not available.',
  'Some text engines draw a dotted circle for this order. If an iPhone does, a reader sees a broken word in Anand Sahib.',
  'Check on a physical iPhone and iPad; if it breaks, keep the stored text and fix the display only.', 'Photo of the line on a physical iPhone shows no dotted circle.', 'OPEN')
f('CI-S-14', 'S3', 'Scripture', 'Small points for print check: two headings without ॥, extra dandas in Jaap 55–56, 26 lines that change if text is normalised',
  'nitnem/data/anand.json and sohila.json (first headings); nitnem/data/jaap.json (jaap055, jaap056; 26 lines with precomposed dotted letters)', 'Anand and Sohila headings; Jaap 55–56',
  E + 's05_differences.json, ' + E + 's02_s03_integrity.json.', 'Minor, but hashes would break if any tool normalises the 26 lines.',
  'Confirm against print; store dotted letters in one agreed form.', 'Decision recorded for each; all lines stable under Unicode normalisation or the build refuses to normalise.', 'OPEN')
f('CI-S-15', 'S3', 'Scripture', 'Reference database issue found on the way: its ready-made Sukhmani list omits one line',
  'Shabad OS Database v5.0.0-next.0, bani list SKMI', 'Sukhmani Sahib, Ang 278: "ਤਬ ਲਗੁ ਗਰਭ ਜੋਨਿ ਮਹਿ ਫਿਰਤਾ ॥" (line SEBD)',
  'The line exists in the database but is missing from the list; the app has it correctly. Found when the first collation showed a false difference.',
  'Not an app defect. Worth reporting to that project, and a reminder that every digital source has slips.', 'Report upstream.', 'Upstream issue filed.', 'UPSTREAM')

# ───────────────────────────── Meanings and teaching ─────────────────────────────
f('CI-M-01', 'S1', 'Meanings', 'Many Nitnem meanings describe the verse from a distance instead of giving its meaning, and call Guru Sahib "the poet" or "the speaker"',
  'nitnem/learning/course.complete.json → closeTextNotes (simpleEn, simplePa) and unitLessons', 'Chaupai, Savaiye, Rehras, Anand (especially pauri 40), Sohila',
  'Automated screen: 157 of 3,773 entries (Chaupai 46/116, Rehras Chaupai 32/100, Rehras shabad rows 11/23, Savaiye 10/40, Anand 23/208, Sohila 6/56, Jaap 10/782, Japji 4/385, Sukhmani 4/2,027) — ' + E + 'm07b_reporting_voice_broadened.json. Reading by hand found more: 32 of 56 Chaupai lines read, 5 of 6 lines of Anand pauri 40 — ' + E + 'm05_manual_reading.json. Examples: "ਹਮਰੀ ਕਰੋ ਹਾਥ ਦੈ ਰੱਛਾ" → "An opening request for Divine protection."; "ਦੂਖ ਰੋਗ ਸੰਤਾਪ ਉਤਰੇ ਸੁਣੀ ਸਚੀ ਬਾਣੀ" → "…are described as lifted by hearing the true Bani." "The poet" appears in 29 meaning lines and 11 studies, "the speaker" in 16 and 75, "the poem" in 19 and 39.',
  'A learner asking "what does this line say?" is told what kind of line it is. Gurbani\'s direct speech is turned into a report about a poem, which is both a teaching failure and a matter of reverence.',
  'Rewrite these entries as plain meanings in the voice of the line; move any context into the separate, labelled note. Use "Guru Sahib" / "ਗੁਰੂ ਸਾਹਿਬ", never "the poet". Have qualified reviewers approve.',
  'The screen in tools/m_screens returns 0 for the listed patterns; a reviewer-signed sample of 100 Nitnem lines contains none.', 'OPEN-NEEDS-SCHOLAR')
f('CI-M-02', 'S1', 'Meanings', 'Chaupai and Savaiye: meanings soften or change what the line says',
  'nitnem/learning/course.complete.json → closeTextNotes for savaiye and chaupai', 'Savaiye 1.3, 1.4, 9.3, 9.4, 10.1–10.4; Chaupai 1.1, 1.2, 4.1, 4.2, 22.1, 24.1, 24.3, 26.4',
  E + 'm05_manual_reading.json. The best-known line of the Savaiye, "ਸਾਚੁ ਕਹੋਂ ਸੁਨ ਲੇਹੁ ਸਭੈ ਜਿਨ ਪ੍ਰੇਮ ਕੀਓ ਤਿਨ ਹੀ ਪ੍ਰਭ ਪਾਇਓ", is given as "The stanza culminates in a striking affirmation that love is the way to encounter the Divine." "ਕੂਰ ਕ੍ਰਿਆ ਉਰਝਿਓ ਸਭ ਹੀ ਜਗ" becomes "can leave people…". Chaupai 24.3 adds "seeks its sustaining protection", which is not in the line. Enemies (ਦੁਸਟ, ਸੱਤ੍ਰੁ, ਬੈਰਿਨ) are regularly turned into abstract "forces".',
  'Readers are given a milder text than the one Guru Sahib wrote. Whether and how to explain strong lines is a decision for the owner and qualified teachers, not something to do silently inside the meaning.',
  'Give the plain meaning; put historical or pastoral context in the labelled note; let qualified reviewers decide wording for martial vocabulary.',
  'Each listed line reviewed and signed; meaning and note are separate fields on screen.', 'OPEN-NEEDS-SCHOLAR')
f('CI-M-03', 'S2', 'Meanings', 'Rehras Sahib: 27 blocks have a short summary only — no line-by-line meaning for the nine shabads, Swaiya, Dohra, Mundavani and Salok',
  'nitnem/learning/course.complete.json → 27 closeTextNotes of kind AGGREGATED_SOURCE_RECORD…; README.md ("1,361 English/Punjabi meaning pairs")', 'Rehras Sahib, all Sri Guru Granth Sahib shabads and the closing pieces',
  'One 20–35 word summary stands for up to twelve verse segments. The screen labels these "Passage context", which is honest, but the public count calls them meaning pairs. Content is also softened: "ਖਸਮੁ ਵਿਸਾਰਹਿ ਤੇ ਕਮਜਾਤਿ ॥ ਨਾਨਕ ਨਾਵੈ ਬਾਝੁ ਸਨਾਤਿ" becomes "condemned as spiritual disregard"; the Swaiya\'s statement about other scriptures "appear[s] in a strong comparison". ' + E + 'm05_manual_reading.json.',
  'The "Understand" level is missing for the first half of the evening prayer.', 'After CI-S-10, write line meanings for each tuk; correct the README count now.',
  'Every Rehras tuk has its own meaning; README numbers equal what the screen shows.', 'OPEN')
f('CI-M-04', 'S2', 'Meanings', 'Sohila and Anand: individual meaning errors found in reading',
  'nitnem/learning/course.complete.json', 'sohila01.line03, sohila01.line06, sohila05.line02, sohila05.line06, anand01.line04, anand05.line03',
  E + 'm05_manual_reading.json. Added clause not in the line (Sohila 1.3); "ਹਉ ਵਾਰੀ" → "I cherish" (1.6); "ਸੰਤ ਟਹਲ" reduced to "serve with humility" and "ਕਰਉ ਬੇਨੰਤੀ" dropped (5.2); the Brahm Gyani becomes "spiritual wisdom" in English but not in Punjabi (5.6); English and Punjabi disagree (Anand 1.4); "ਤੁਧੁ" — the Divine as the doer — dropped (Anand 5.3).',
  'Each is small; together they show the English and Punjabi were not checked against each other or against the line.', 'Correct the six; add an English–Punjabi agreement check to review.', 'Six lines corrected and signed.', 'OPEN-NEEDS-SCHOLAR')
f('CI-M-05', 'S2', 'Meanings', 'Jaap Sahib chhand 1 misreads two phrases; three words elsewhere are given doubtful or inconsistent senses',
  'nitnem/learning/course.complete.json', 'Jaap 1.5 (ਤ੍ਰਿਭਵਣ ਮਹੀਪ, ਨੇਤ ਨੇਤ), 1.6 (ਬਰਨਤ ਸੁਮਤਿ); 62.5 ਅਭੇ; 103.2 vs 104.1 ਆਭਿੱਜ/ਆਭਿਜ; 104.3 ਬਰਨੈ',
  E + 'm05_manual_reading.json. The later chhands read (79, 96, 150, 197–199) are direct and sound.', 'The opening chhand is the one most learners will study first.',
  'Correct 1.5 and 1.6; get a ruling on the three words.', 'Lines corrected and signed.', 'OPEN-NEEDS-SCHOLAR')
f('CI-M-06', 'S2', 'Meanings', 'Core Sikh terms are often replaced by a single English word, and the Divine is named inconsistently',
  'js/line-meanings.js, js/sukhmani-teaching.js, nitnem/learning/course.complete.json', 'Haumai → "ego" 6 of 7; Sant → "saint" 75 of 100; Sadh → "holy" 121 of 128; Sahaj rendered six ways; "God" 143 times (Sukhmani only), "the Divine" 393, "the One" 382, "Lord" 25',
  E + 'm06_concepts.json. Kept well: Hukam 20/22, Naam 177/216, Shabad 22/28, Brahm Gyani 72/73.', 'The assignment asks that these concepts not be reduced to Western equivalents.',
  'Adopt a term sheet: keep the Gurmukhi-origin word, gloss it once, link to a concept note.', 'Term screen shows each core term kept in at least 95% of its occurrences.', 'OPEN')
f('CI-M-07', 'S2', 'Meanings', 'Modern legal- and medical-style disclaimers are attached to hundreds of lines',
  'nitnem/learning/course.complete.json → interpretiveCaution (shown under "Interpretation and context", nitnem/learning/learning-ui.js:84); studies in all three data sets', '309 of 1,361 Nitnem line notes (148 distinct texts) and 154 of 610 studies',
  'Examples shown to readers: "…not clinical efficacy data, and should not be used to dissuade anyone from medical treatment."; "…not a psychiatric treatment guarantee."; "…not a medical anatomy guide, yoga instruction or objective experimental map." Jaap chhand 1 brings in a present-day caste-injustice frame. Counted by script in this review. Root cause found in comparison: the builder\'s own test (tests/nitnem-content.mjs:219) fails unless every one of the 1,361 line notes has a caution, so a caution was written even where there was nothing to caution about.',
  'A reader opening the meaning of a line of Gurbani meets risk-management language written for a different purpose. Modern ideas are mixed into the explanation without being labelled as the editor\'s reflection.',
  'Make the caution field optional and drop the test rule that requires one on every line. Remove these from line notes. Put one short, respectful general note in About. Keep genuine interpretive notes (alternative readings, grammar) only.',
  'Disclaimer screen returns 0 on line notes; one general note exists; reviewers approve remaining notes.', 'OPEN-OWNER-DECISION')
f('CI-M-08', 'S2', 'Meanings', 'Editor\'s working notes and talk about "the app" and "this draft" appear in what readers see',
  'nitnem/learning/course.complete.json (jaap001 vocabulary "…; verify grammar"; anand25 "Exact morphology of the jeweled phrase needs review."; Jaap 7.1, 9.3, 11.4 "…gloss remains provisional"); js/japji-lessons.js (34 of 42 studies mention "this draft" or "the app")', 'Jaap 1, 7, 9, 11; Anand 25; Japji studies',
  'Counted by script; e.g. a Japji teach-back question asks why "the app" counts 42 display units. In jaap001 the word ਅਨਭਉ is glossed "Self-existent", which is not its sense.',
  'Readers should meet the teaching, not the production process.', 'Move such notes to a reviewer-only field; correct the ਅਨਭਉ gloss.', 'Screen for "verify", "needs review", "provisional", "this draft", "the app" in reader-facing fields returns 0.', 'OPEN')
f('CI-M-09', 'S2', 'Meanings', 'The screen says "Meaning" where the data itself says "selective paraphrase, not literal translation"',
  'nitnem/learning/learning-ui.js:77 ("Draft meaning · tap to explore"); nitnem/index.html (depth button "Meaning"); data kind SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION, status DRAFT_AI_UNREVIEWED', 'All six Nitnem readers',
  'Verified in code and on screen. "Draft" is shown; "paraphrase, not translation" and "written with AI assistance, not yet reviewed by a qualified person" are not shown at the line.',
  'Honest labelling is one of the app\'s own promises.', 'Say plainly, once per bani and in About: "Simple draft explanation written with AI assistance. Not a translation. Not yet reviewed by a qualified person."',
  'Statement visible within one tap from any meaning; identical wording in all three readers.', 'OPEN')
f('CI-M-10', 'S2', 'Meanings', 'Study material is mostly in English; Punjabi study text is missing for most Nitnem passages',
  'nitnem/learning/course.complete.json → unitLessons; js/japji-lessons.js; js/sukhmani-teaching.js', 'Punjabi study fields exist for 79 of 199 Jaap passages, 1 of 40 Anand, 0 of 10 Savaiye, 0 of 29 Chaupai, 0 of 5 Sohila, 0 of 44 Rehras',
  'Average characters English/Punjabi per study: Japji 2,703/582; Sukhmani pauri 1,043/550; Jaap 1,373/452; Chaupai 721/83; Rehras 895/85. Counted by script from the shipped files.',
  'A Punjabi-reading elder or a learner who wants to study in Punjabi gets far less than an English reader.', 'Write Punjabi study text first-class, not as a shortened translation.', 'Every study has Punjabi focus, close reading, reflection and teach-back; length ratio within 0.7–1.3.', 'OPEN')
f('CI-M-11', 'S3', 'Meanings', 'Punjabi spelling is not uniform; Sukhmani transliteration is mechanical',
  'js/sukhmani-teaching.js, js/line-meanings.js, nitnem/learning/course.complete.json', 'ਵਿਚ 58 / ਵਿੱਚ 2,051; ਇਕ 21 / ਇੱਕ 519; ਇਥੇ 55 / ਇੱਥੇ 151; e.g. "gauRee sukhamanee mah 5 ||"',
  E + 'm_screens.json.', 'Polish; matters for a product that aims at excellent Punjabi.', 'Adopt one spelling list; one transliteration scheme, labelled approximate.', 'Spelling screen returns one form per word.', 'OPEN')
f('CI-M-12', 'PASS', 'Meanings', 'Checks that passed: every line has its own English and Punjabi entry; no sign of copying from published translations; cited page numbers are right',
  'all meaning and study data', '3,773 lines ↔ 3,773 pairs; 3,388 carry the hash of their line, none stale; 259 studies cite page numbers, all correct',
  E + 'm_screens.json, ' + E + 'm_compare_summary.json (of 3,748 comparable lines, 4 share a run of eight or more words with a published translation).', 'Good foundations to build on.', '—', '—', 'PASS-NOTE')

# ───────────────────────────── Learning design ─────────────────────────────
f('CI-E-01', 'S2', 'Learning', 'Against the six-level learning standard, three levels are thin or absent',
  'whole app', 'Read: present. Understand: present as drafts (not for 27 Rehras blocks). Word-by-word: absent — only 2 to 8 selected words per passage, marked "working gloss, not approved". Deep study: fuller for Japji and Sukhmani, thin for the Nitnem set. Cross-scriptural: 1 reference in 610 studies. Reflection: present (prompt plus private note)',
  'Counted by script from the shipped study files (' + E + 'm_screens.json and the study field census in this review).', 'The stated aim is a learner who understands each word, the grammar, and how the same idea appears elsewhere in Gurbani.',
  'See the learning blueprint (deliverable 8): word records with sourced origins, then cross-references reviewed by scholars.', 'For a pilot bani every word opens a sourced entry and every passage has at least one reviewed cross-reference.', 'OPEN')
f('CI-E-02', 'S2', 'Learning', 'Nothing brings a learner back to what they saved',
  'nitnem/local-learning.js, js/learning.js, js/sukhmani-reader.js', 'Saved lines and notes are lists only; no saved words; no "revisit" view',
  'Observed in all three readers.', 'Understanding fades without return; this can be done quietly, without streaks or scores.', 'A calm "Return to" list ordered by time since last visit; opt-in; on-device only.', 'A saved line reappears in the list after a set interval; nothing is counted or scored.', 'OPEN')
f('CI-E-03', 'PASS', 'Learning', 'No streaks, scores, badges or nudges were found', 'whole app', '—', 'Code and screens searched.', 'Matches the stated values.', '—', '—', 'PASS-NOTE')

# ───────────────────────────── Use ─────────────────────────────
f('CI-U-01', 'S2', 'Use', 'Three readers that look and behave differently',
  'full-japji.html + js/japji-full.js; nitnem/index.html + nitnem/reader.js; sukhmani.html + js/sukhmani-reader.js', 'Japji, the six Nitnem banis, Sukhmani',
  'Different colours (gold/green), different names for the same control, different guide behaviour, different maximum text size (48/60), different ways to save a line, different resume behaviour, separate storage and separate backups. Screenshots ' + E + 'screenshots/03_jaap_read_top.png, 14_sukhmani_meaning.png; ' + E + 'ua_remaining.json, u09_u15.json.',
  'A family learns the app three times. Every fix must be made three times.', 'One reader, one data shape, one saved-learning store (see implementation plan).', 'The same test script passes unchanged against all nine compositions.', 'OPEN')
f('CI-U-02', 'S2', 'Use', 'Nitnem reader: a screen of headings and counts before the first line; switching to Study shows no change where you are reading',
  'nitnem/index.html, nitnem/reader.js', 'All six Nitnem readers', 'Screenshots ' + E + 'screenshots/03_jaap_read_top.png, 06_jaap_study.png. The study block sits after the passage\'s last line, off screen.',
  'The reader came to read; and a button that seems to do nothing teaches people not to press it.', 'Gurbani within the first screen; on Study, bring the study block into view or show a clear pointer.', 'First verse line visible without scrolling at 390×664; pressing Study changes what is on screen.', 'OPEN')
f('CI-U-03', 'S2', 'Use', 'Engineering words on family-facing screens',
  'nitnem/index.html, nitnem/reader.js:730, js/japji-full.js:76, nitnem/data/library.json', '"tokens per minute", "30px", "70 pace", "selected expanded29-group reading", "ends after25", "All40 pauris", "Jaap Sahib · Jaap Sahib · Chhand 1", "SGGS Rehras Hymn 1", "385 frozen Gurmukhi occurrences", "Digital collation found 384 matches after HTML spacing normalization"',
  E + 'u09_u15.json and screenshots.', 'An elder or child cannot use what they cannot read.', 'Plain words in English and Punjabi ("Slower / Faster", "Text size"); move technical detail to an About page.', 'A plain-language review of every visible string by a Punjabi-speaking family tester.', 'OPEN')
f('CI-U-04', 'S2', 'Use', 'Dark mode has to be switched on in four places',
  'js/home.js, nitnem/appearance.js, js/japji-full.js, js/sukhmani-reader.js', 'Home, Nitnem, Japji, Sukhmani', 'Each keeps its own setting; only the Nitnem reader follows the phone\'s dark setting. Tested in this review.',
  'A reader at amrit vela opens the next bani and is hit by a bright page.', 'One appearance setting for the whole app, following the phone by default.', 'Set Dark once; every page opens dark; a fresh visitor with a dark phone gets dark everywhere.', 'OPEN')
f('CI-U-05', 'S2', 'Use', 'Small print that cannot be enlarged, and text that ignores the reader\'s own font-size setting',
  'css/japji-full.css, css/sukhmani.css, nitnem/reader.css', 'Labels at 9–11 px; meanings at 14–16 px with no control (only Gurmukhi size can be changed); 0 of 401 sampled text elements in each reader scale with the browser\'s default font size',
  E + 'a02_contrast_targets.json, ' + E + 'ua_remaining.json (A06_root_font_scaling).', 'Elderly readers are a core audience.', 'One "Text size" control that scales Gurmukhi, meanings and labels together; sizes in relative units; nothing under 12 px.', 'At the largest setting meanings are at least 20 px; with the browser default at 200% all text grows.', 'OPEN')
f('CI-U-06', 'S2', 'Use', 'Finding a place: one long flat list, no search',
  'nitnem/reader.js (jump list), index.html', 'Jaap Sahib: 199 unlabelled English items ("Chhand 1 … Chhand 199"); no search anywhere; the home page link to Japji is a 17 px line at the very bottom',
  'Screenshot ' + E + 'screenshots/09_jump_dialog.png.', 'A learner looking for a remembered line cannot find it.', 'Group by chhand type with Gurmukhi names; add first-letter and text search working offline.', 'Any line can be reached by typing its first letters; Jaap list grouped under its 22 chhand headings.', 'OPEN')
f('CI-U-07', 'S2', 'Use', 'Saving a line works three different ways and is hidden in two readers',
  'nitnem/index.html (#bookmark inside the tools sheet), js/japji-full.js, js/sukhmani-reader.js', 'Sukhmani: tap a line → "Bookmark this line". Nitnem: open the ⌃ sheet → "☆ Save current line". Japji: no save control is visible while reading and tapping a line does nothing',
  E + 'u09_u15.json.', 'Saving a line that moved you is the most personal act in the app.', 'One way everywhere: tap or long-press a line → Save · Note · Meaning.', 'Same gesture saves a line in all nine compositions, found without instructions by a first-time tester.', 'OPEN')
f('CI-U-08', 'S3', 'Use', 'Other use notes', 'various', 'Landscape: header and control bar take about 39% of the height in the Nitnem reader (' + E + 'screenshots/62_landscape_nitnem-jaap.png). Resume: Japji reopens about three lines early; Sukhmani asks first; Nitnem is exact. The Nitnem reader does not name the source of Savaiye, Chaupai, Anand or Sohila on screen.',
  E + 'ua_remaining.json, u09_u15.json.', 'Polish.', 'Auto-hide furniture in landscape; exact resume everywhere; name the source on screen.', 'Covered by the unified reader tests.', 'OPEN')
f('CI-U-09', 'S2', 'Use', 'Sukhmani Sahib is one very heavy page',
  'sukhmani.html, js/sukhmani-data.js, js/sukhmani-teaching.js', '3.16 MB of files (625 kB compressed) before the first line; 24,600 page elements; first Meaning switch in a Nitnem reader fetches a further 2.3 MB (503 kB compressed)',
  'Measured in this review. On a slow-connection lab profile with uncompressed local serving the first Sukhmani line took 65.7 s; from the compressed size the real figure is estimated at about 13 s (estimate, not measured). ' + E + 'r06_slow.json.',
  'Families on older phones or weak mobile data wait, and older phones may struggle with so large a page.', 'Load one ashtpadi at a time; split teaching text per ashtpadi; show Gurbani first.', 'First line within 3 s on the slow profile from a real compressed host; memory stays flat while scrolling.', 'OPEN')

# ───────────────────────────── Accessibility ─────────────────────────────
f('CI-A-01', 'S1', 'Accessibility', 'Screen-reader users cannot hear the meanings',
  'nitnem/learning/learning-ui.js:75, js/japji-full.js, js/sukhmani-reader.js:89', 'All readers — 62 buttons in Sohila, 387 in Japji, 2,028 in Sukhmani',
  'Each meaning is a button whose spoken name is replaced by a fixed phrase ("Meaning for this line. Tap to explore.", "Study this passage: …"), so the meaning text itself is not announced. Automated scan: ' + E + 'a01_axe.json. Not confirmed with VoiceOver (none available).',
  'Blind and low-vision readers — the people a spoken interface serves most — get no meanings at all. Fails WCAG 2.5.3 and 4.1.2.',
  'Remove the override so the button\'s own text is its name; add the hint as a separate description.', 'Automated scan clean; VoiceOver on a physical iPhone reads the English and Punjabi meaning.', 'OPEN')
f('CI-A-02', 'S2', 'Accessibility', 'Sukhmani: 2,027 lines of Gurbani are each a button and a keyboard stop',
  'js/sukhmani-reader.js:88', 'Sukhmani Sahib', '4,089 focusable elements in Meaning view; 2,027 uses of a label on an element that may not carry one. ' + E + 'a01_axe.json.',
  'A screen-reader user hears "button" 2,027 times; a keyboard user cannot move through the bani.', 'Lines are text; offer one "line actions" control per line or a single roving focus.', 'Fewer than 60 focus stops per ashtpadi; scan clean.', 'OPEN')
f('CI-A-03', 'S3', 'Accessibility', 'Minor contrast and touch-target shortfalls',
  'nitnem/reader.css (collection numbers #9c865c on #faf7ee = 3.28:1); pauri-2-lesson.html (two labels 4.07:1); several text links under 24 px tall ("Back to the library" 15 px; 32 small links in Japji study; home Japji link 17 px)', 'Nitnem collection page, Pauri 2 lesson, Japji study',
  E + 'a02_contrast_targets.json.', 'Small, cheap to fix.', 'Darken two colours; give links 44 px touch height.', 'All text ≥ 4.5:1; all targets ≥ 24 px, primary ones ≥ 44 px.', 'OPEN')
f('CI-A-04', 'PASS', 'Accessibility', 'Checks that passed in emulation', 'whole app', 'No sideways scrolling at 320 px on any page or depth; visible focus ring on every stop; all three dialogs keep focus inside, close on Escape and return focus; reduced-motion setting removes transitions; Gurmukhi is tagged as Punjabi; pinch-zoom is not blocked; Gurbani contrast 11–15:1',
  E + 'ua_remaining.json, ' + E + 'a02_contrast_targets.json.', 'Solid base.', '—', '—', 'PASS-NOTE')
f('CI-A-05', 'S1', 'Accessibility', 'Not tested by anyone on this review: a real iPhone, Safari, VoiceOver, TalkBack',
  'n/a', 'whole app', 'This review used headless Chromium with phone emulation only.', 'The app is aimed at the iPhone Home Screen. Emulation cannot show Apple\'s text drawing, storage rules or VoiceOver behaviour.',
  'A one-hour scripted device session by a person with an iPhone (script supplied in deliverable 6).', 'Checklist completed with photos or screen recordings.', 'OPEN')

# ───────────────────────────── Reliability and data safety ─────────────────────────────
f('CI-R-01', 'S1', 'Reliability', 'Two of the three readers will display altered or incomplete Gurbani with no warning',
  'js/japji-full.js, js/sukhmani-reader.js (no run-time check); nitnem/reader.js:24–66 (has one); README.md ("Every source record is checked against its stored hash")', 'Japji Sahib and Sukhmani Sahib readers',
  'With the data file changed in transit: Japji showed "ਹੁਕਮ ਰਜਾਈ ਚਲਣਾ" for "ਹੁਕਮਿ ਰਜਾਈ ਚਲਣਾ"; Sukhmani showed "ਦੁਖੁ ਪਾਵਉ" for "ਸੁਖੁ ਪਾਵਉ" and, in another run, 2,026 lines instead of 2,027 — all with no message. The Nitnem reader refused all eight kinds of tampering. ' + E + 'r04_corrupt_package.json; screenshots ' + E + 'screenshots/65_…, 66_…, 60_….',
  'The assignment requires that a corrupted or incomplete scripture package must not silently render as valid. The only protection for these two readers is the offline installer\'s check, which does not cover the first visit or a browser without it.',
  'Give all readers the Nitnem reader\'s check (whole-file hash, per-line hash, expected counts) and refuse to show text that fails.', 'The tamper script reports "refused" for every variant in all three readers.', 'OPEN')
f('CI-R-02', 'S1', 'Reliability', 'Japji reader silently deletes a saved note or bookmark it cannot place',
  'js/continuous-core.js:23 (normalise); README.md ("unknown or damaged saved records are preserved")', 'Japji Sahib reader',
  'A saved record containing a note on a line ID the reader does not know was cleaned and written back on load: the note was gone and no message appeared. Notes are also cut at 12,000 characters. (Records that were unreadable or of the wrong version were kept safely.) ' + E + 'd_tests_japji_sukhmani.json.',
  'Private reflections are the one thing the app cannot recreate. Today this needs an unusual record; it becomes ordinary the day any line ID changes.',
  'Never drop: move unknown items to a "kept aside" list the reader can see and export.', 'The same test shows the note preserved and visible; no silent truncation.', 'OPEN')
f('CI-R-03', 'S1', 'Reliability', 'Nitnem reader: a note on a line that no longer exists stops all saving, and notes under an older edition name disappear from view',
  'nitnem/local-learning.js', 'All six Nitnem readers',
  'Tested with synthetic data: saving pauses with no way to repair it inside the app; a record stored under an edition ID not listed as a previous one is not shown and not mentioned; without the browser\'s locking feature nothing is saved at all, not even the reading place. ' + E + 'd_tests_nitnem2.json.',
  'Correcting scripture (CI-S-06, CI-S-10) changes line and edition IDs. Without a migration path, the corrections would cost readers their notes.',
  'Build and test migration before any scripture correction ships: map old IDs to new, keep unmatched notes visible, offer export.', 'After a test edition change, every synthetic note and bookmark is still reachable.', 'OPEN')
f('CI-R-04', 'S2', 'Reliability', 'Backups are eight separate files, with no single "back up everything" and no reminder',
  'js/learning.js, js/shared-learning.js, nitnem/local-learning.js, js/sukhmani-reader.js', 'Storage keys glp001.reader.v1, glp001.fullJapji.v1, glp001.continuous.v2, glp001.sukhmani.v1 and six Nitnem keys',
  'Observed in all readers. On iPhone, Safari may clear a website\'s saved data after seven days without a visit unless the app is on the Home Screen (platform rule; not testable here). Only the Japji information sheet mentions exporting before moving to the Home Screen.',
  'A family could lose years of reflections without ever having been told to back up.', 'One backup file for the whole library; a gentle reminder after new notes; plain explanation of the Home Screen point.', 'One export restores everything on a clean browser; reminder appears after the first note.', 'OPEN')
f('CI-R-05', 'S3', 'Reliability', 'Maintenance risks', 'js/continuous-core.js vs nitnem/continuous-core.js; sw.js', 'Two copies of the same core file already differ (maximum size 48 vs 60). The whole library (7.2 MB, about 1.5 MB compressed) downloads in the background on the first visit, even from the home page, without saying so.',
  'File comparison and network log in this review.', 'Drift causes bugs; silent downloads cost data.', 'One shared file; say "Saving the library for offline use (1.5 MB)".', 'One copy; visible offline notice.', 'OPEN')
f('CI-R-06', 'PASS', 'Reliability', 'Checks that passed in emulation: offline, updates, failed update, Nitnem saved learning',
  'sw.js, nitnem/offline.js, nitnem/local-learning.js', 'All 56 offline entries match their hashes; every page and all nine compositions open offline after one visit; a new version waits for the reader; a broken update leaves the old version working, offline too; typed-but-unsaved text is saved before an update; Nitnem export → wipe → import returns every note and bookmark; eleven hostile import files refused; two tabs cannot overwrite each other; a full-storage error is reported',
  E + 'r02_r03_update.json, ' + E + 'd_tests_nitnem.json, ' + E + 'd_tests_nitnem2.json.', 'The engineering here is careful and worth keeping.', '—', '—', 'PASS-NOTE')

# ───────────────────────────── Privacy, licence, integrity ─────────────────────────────
f('CI-P-01', 'S2', 'Privacy and licence', 'The project has no licence, and two of its text sources have no formal notice',
  'repository root (no LICENSE); vendor/opengranth/LICENSE and NOTICE exist', 'whole project', 'File listing at the baseline commit.', 'Without a licence nobody else may legally reuse the work, which contradicts a gift "for humanity"; source projects deserve credit on their own terms.',
  'Owner decision: choose licences for code and for the original teaching text (they can differ); add notices for BaniDB and SriGranth as their terms require.', 'LICENSE files present; notices checked against each source\'s terms.', 'OPEN-OWNER-DECISION')
f('CI-P-02', 'S3', 'Privacy and licence', 'Small security and housekeeping points',
  'pauri-2-lesson.html (allows inline styles in its security policy); index.html (a frame rule placed where browsers ignore it — console error); most pages set no referrer policy; manifest.webmanifest and robots.txt carry out-of-date descriptions; 28 draft pull requests (#4–#33) are open', 'whole project',
  'Observed in this review (console log, file contents, GitHub API).', 'Low risk today; tidy before growth.', 'Tighten the two policies; refresh descriptions; close or label stale drafts.', 'Policy scan clean on all pages; descriptions current.', 'OPEN')
f('CI-P-03', 'PASS', 'Privacy and licence', 'Checks that passed: nothing leaves the device', 'whole app', 'No request to any other website in any tested flow; no cookies, analytics or remote fonts; notes are shown as text, never run as code; outgoing links cannot reach back; no secrets or personal data in the repository',
  'Network logs from every browser script in this review; repository scan.', 'This is the app\'s strongest promise and it holds.', '—', '—', 'PASS-NOTE')

# ───────────────────────────── Process ─────────────────────────────
f('CI-X-01', 'S2', 'Process', 'Not yet verified: that the public website serves exactly the reviewed files',
  'https://sskhangura82.github.io/gurbani-learning-library/', 'whole site', 'This review\'s environment could not reach the public site. GitHub\'s own record says commit a3476ac was deployed successfully; all testing was on that commit served locally.',
  'A small gap between "tested" and "what families open".', 'Anyone with a normal connection can run the supplied hash check against the live site.', 'Live files match evidence/baseline-sha256.txt.', 'OPEN')
f('CI-X-02', 'S1', 'Process', 'No qualified human has reviewed any Gurbani text or any meaning',
  'nitnem/learning/course.complete.json → coverage.reviewedUnitLessons = 0, reviewedSourceMeaningLines = 0; README.md', 'whole library', 'The app says so itself; this review confirms the files say 0.', 'Every digital check in this review, however complete, is a check of copying — not of correctness.',
  'Recruit two or three qualified reviewers; give them the focused packet in deliverable 2 (the 138 differing Dasam occurrences first).', 'Signed review records exist for each composition.', 'OPEN-OWNER-DECISION')

f('CI-U-10', 'S2', 'Use', 'The Nitnem reader keeps a permanent header, against the design decision already accepted for this project',
  'nitnem/index.html, nitnem/reader.css; docs/CLAUDE_REVIEW_DECISIONS_20261023.md (decision 2: "One quiet dock, no persistent header")', 'All six Nitnem readers',
  'A 71 px header stays on screen in the Nitnem reader; the Japji and Sukhmani readers have none. In landscape, header plus dock leave about 61% of the height for Gurbani (' + E + 'screenshots/62_landscape_nitnem-jaap.png, ' + E + 'ua_remaining.json). The same ledger asked for a design review before each promotion; no such review of the Nitnem release is recorded in the repository.',
  'The newest and largest part of the app departs from the reading design the owner approved, and was published without the agreed check.',
  'Bring the Nitnem reader to the single-dock design (best done by unifying the readers, CI-U-01).', 'No fixed header in any reader; the dock is the only persistent control.', 'OPEN', origin='COMPARISON')
f('CI-X-03', 'S2', 'Process', 'Five of the six source-comparison files the builder\'s audit cites are not in the repository, and the "printed source" it relied on is not named',
  'research/nitnem/20261125/source-audit-report.json → variantEvidence; research/nitnem/20261125/proposed-source-manifest.json; docs/NITNEM_COMPLETE.md', 'Jaap, Savaiye, Chaupai, Anand, Sohila, Rehras',
  'Cited but absent: jaap-direct-banidb-comparison.json, jaap-historical-variant-analysis.json, savaiye-direct-provider-comparison.json, chaupai-direct-provider-comparison.json, sggs-source-comparison.json. Present: rehras-sggs-ang-mapping.json. The words "printed", "gutka" and "pdf" do not occur in the source manifest, although six corrections are described as supported by "the visually checked printed source".',
  'Claims such as "808 occurrences agree exactly with direct BaniDB" and "printed-supported" cannot be checked by anyone else. Evidence that is cited should be kept.',
  'Commit the five files (or regenerate them) and name the printed edition, publisher, year and pages.', 'Every file named in an audit exists at the cited path; the printed edition is named.', 'OPEN', origin='COMPARISON')
f('CI-X-04', 'PASS', 'Process', 'Where the builder\'s own records and this review agree',
  'README.md, docs/NITNEM_COMPLETE.md, evidence/nitnem-content-verification.json, evidence/sukhmani-source-collation.json', 'whole library',
  'Counts (385; 2,027; 1,361 lines; 42 + 217 + 327 studies) agree. Sukhmani: the builder found 2,027 exact matches against SriGranth, this review 2,027 against Shabad OS; both say digital agreement is not print confirmation. Japji Pauri 13 line 1, which the builder has carried as an open comparison since October, matches the reference exactly here. Both say: zero qualified human review; no iPhone, Safari or VoiceOver testing; studies are chiefly English.',
  'The builder has been honest about limits; the differences in this review are mostly things its tests never looked at, not things it hid.', '—', '—', 'PASS-NOTE', origin='COMPARISON')


# ───────────────────────────── Found during re-test RT-001 (2026-11-25) ─────────────────────────────
# Each of these is true of the published version a3476ac (and of candidate PR #40 unless stated). Evidence: retests/RT-001/ and evidence/sA1_*.
RT = 'reviews/claude-independent/retests/RT-001/evidence/'
f('CI-S-16', 'S1', 'Scripture', 'Three words quoted from Sri Guru Granth Sahib outside the readers use a doubled half-ha spelling; in the test font an extra letter ਹ is drawn',
  'js/content.js → related[1].context[4] ("ਜਿਨ੍ਹ੍ਹੀ", "ਤਿਨ੍ਹ੍ਹਾ") and related[2].context[4] ("ਸਮ੍ਹ੍ਹਾਲੇ"); drawn by js/japji-full.js context() (Japji reader → Explore → Related teachings → Read the complete context) and by pauri-2-lesson.html',
  'Sri Guru Granth Sahib Ang 472, Salok M1: "ਨਾਨਕ ਜਿਨੑੀ ਗੁਰਮੁਖਿ ਬੁਝਿਆ ਤਿਨੑਾ ਸੂਤਕੁ ਨਾਹਿ ॥੩॥"; Ang 394, Asa M5: "ਸਿਮਰਿ ਸਿਮਰਿ ਤਿਸੁ ਸਦਾ ਸਮੑਾਲੇ ॥੧॥ ਰਹਾਉ ॥" (reference spelling)',
  'The first review collated the 3,809 occurrences inside the three readers and missed 31 occurrences of Gurbani shown elsewhere. Collated now (addendum S-A1): 29 of 31 exact against the same digital reference; these two lines differ, and only in this sign. '
  'The reference, and the app\'s own Sukhmani text, write the sign as one character (ੑ). Here it is written as subscript-ha twice. In the font available to this review the doubled form is drawn as ਜਿਨ੍ਹਹੀ, ਤਿਨ੍ਹਹਾ, ਸਮ੍ਹਹਾਲੇ — a full extra ਹ. '
  'Apple\'s Gurmukhi font was not available, so what an iPhone draws is unknown. ' + E + 'sA1_gurbani_outside_readers.json; ' + E + 'screenshots/sA1_doubled_ha_comparison.png, sA1_doubled_ha_related1_line.png.',
  'On the screen tested, three words of Gurbani are misspelt. It also shows these passages were taken from a different digital source family than the readers, so one source review does not cover both.',
  'Write the sign as the readers do. Better: quote related passages by line reference from the same checked source as the readers, so one collation and one run-time check cover every line of Gurbani the app shows.',
  'The 31 occurrences collate exactly; a device screenshot of both lines matches a printed page.', s0c=True, origin='RETEST')

f('CI-R-07', 'S2', 'Reliability', 'Gurbani shown outside the three readers has no check when it is opened: Related teachings, the older Pauri 2 lesson and the Simran page',
  'js/content.js (scripture.lines, related[].excerpt, related[].context, raagExample.heading), used by js/japji-full.js related(), context(), raag() and by pauri-2-lesson.html with js/app.js; simran.html (p.gurbani-line). Not covered by js/source-integrity.js in PR #40',
  '31 occurrences: Japji Pauri 2 (6 lines); Ang 466 salok (8 lines and an excerpt); Ang 472 salok (5 and an excerpt); Ang 394 shabad (7 and an excerpt); the Anand heading, Ang 917; one line of Japji Pauri 4 on the Simran page',
  'With one word of js/content.js changed in transit, the Japji reader showed "ਹਉਮੈ ਦੀਰਘ ਭੋਗੁ ਹੈ" for "ਰੋਗੁ" in the Related-teachings card and in its full context, and the older lesson page showed "ਹੁਕਮੀ ਹੋਵਨਿ ਅਕਾਰ" for "ਆਕਾਰ" — no warning, on the published version and on candidate PR #40 alike. '
  'The offline installer\'s whole-file check still covers these files at install time. Missed in the first review: its tamper test and its collation covered only the three readers\' own text. ' + RT + 'r01_damaged_offline_copy_and_unchecked_file_candidate.json, …_published.json; screenshot ' + RT + 'screenshots/japji_related_teachings_altered_text_shown.png.',
  'The same rule as CI-R-01 — altered scripture must not be shown as if it were sound — on a smaller surface.',
  'Hold every quoted line of Gurbani in a checked source set and have these screens quote from it by line reference. Until then give js/content.js the same file check and verify its scripture strings before drawing them.',
  'The tamper script, extended to these screens, reports "withheld" for every variant; the collation register lists these occurrences.', origin='RETEST')

f('CI-R-08', 'S2', 'Reliability', 'After a failed scripture check there is no way back from inside the app',
  'sw.js fetch handler (the offline copy answers first, also when online); nitnem/reader.js failure message ("Please try again"); on PR #40 also the failure branch of js/japji-full.js and js/sukhmani-reader.js (every control switched off; advice "Reload while online")',
  'Published version: any Nitnem bani. Candidate PR #40: also Japji Sahib and Sukhmani Sahib',
  'A scripture file was altered inside the offline copy after a clean install. The reader refused to show it, which is right — and then kept refusing: on trying again, on reloading while online, with the network off, and after "check for update" when no newer release existed. '
  'Published version, Nitnem: the damaged bani never opens again; other banis and "Export my learning" stay reachable. Candidate, Japji and Sukhmani: the page shows only the message, and every button is off, including the way to "Export learning", so that reader\'s notes cannot be backed up while the fault lasts. '
  'The one thing a reader can do — clear the site\'s data or remove the Home Screen app — also erases saved notes. Loading a later release does repair it (tested). ' + RT + 'r01_damaged_offline_copy_and_unchecked_file_candidate.json; both_builds_extras_published.json, …_candidate.json; regression_update_offline_text.json.',
  'Refusing is right. Leaving a person with no reading, no backup and advice that cannot work is not. Damage to an offline copy is rare, but this is the moment the app most needs to be trusted.',
  'On a failed check, fetch that file again past the offline copy, check it, and replace the bad copy if the fresh one passes. Offer "Download again". Keep "Export learning" working on the failure screen. Say what failed, that notes are safe, and what to press.',
  'With a damaged offline copy and the network on, the reader recovers by itself or with one press and saved learning is untouched; with the network off, the screen still offers export and says to reconnect.', origin='RETEST')

f('CI-R-09', 'S2', 'Reliability', 'Japji reader: warnings about saved learning are not visible to a sighted reader',
  'Published: js/japji-full.js writes the warning only to #status, an announcement line that is not drawn on screen. PR #40 adds aside#retained-learning with class "coverage-note", which css/japji-full.css line 78 clips to one pixel during immersive reading (body.quiet-reading .coverage-note)',
  'Japji Sahib reader',
  'Published version: when the saved record cannot be read, saving stops and nothing appears on screen (0 visible warnings in 3 cases tested). Candidate PR #40: a notice exists, but a returning reader is put straight into immersive reading, where the notice measures 2×1 pixels. '
  'It was on screen in 1 of 4 return situations (only when the reader had left at the very top), vanished at the first scroll and did not return at the top. In the builder\'s own test situation it was never on screen; that test passes because the test tool counts any non-empty box as "visible" and clicks the instant the reader is ready, before immersive reading begins about 140 ms later — the same click 1.5 seconds later failed 3 times of 3. '
  'The Sukhmani and Nitnem readers show a real banner on opening (checked). The first review listed page messages with a helper that could not tell drawn text from text clipped to a pixel; no finding rested on it, and it is replaced here by a size-on-screen measurement. '
  + RT + 'r02_notice_visibility_candidate.json, r02_notice_extras_candidate.json, …_published.json, r02_notice_builder_test_situation.json, r02_notice_timeline.json, r02_notice_click_at_once_or_later.json; screenshots/japji_resumed_mid_text_no_notice.png, japji_left_at_top_notice_visible.png.',
  'A person whose notes have been kept aside, or whose saving has stopped, is not told unless they use a screen reader or happen to open Saved learning.',
  'Show the notice where immersive reading does not hide it — for example a small marker on the bottom bar that opens Saved learning — and announce it once. Do not reuse a style that is hidden on purpose.',
  'In each return situation (at the top, resumed mid-text, after scrolling, during guided reading) a measurement of the notice\'s size on screen, not its mere presence in the page, shows it visible and its button tappable.', origin='RETEST')

f('CI-R-10', 'S3', 'Reliability', 'Saved-learning wording and restore: raw technical messages, and a backup holding one unplaceable note is refused whole',
  'js/japji-full.js (note screen and #import-preview print the raw error text); js/learning.js parse() ("Invalid line reflection."); nitnem/reader.js ("Source SHA-256 verification failed: data/sohila.json")',
  'Japji Sahib and Nitnem readers',
  'Shown to readers on both versions: "Unterminated string in JSON at position 44 (line 1 column 45)"; "Invalid line reflection."; "This bani could not load: Source SHA-256 verification failed: data/sohila.json. Please try again." '
  'Restoring a backup that holds one note on a line this edition does not have is refused whole, and the note is not brought in (the backup file itself is unchanged). With an unreadable saved record the Japji reader can save nothing new and offers no way to set that record aside and start afresh — the same gap as CI-R-03. '
  + RT + 'both_builds_extras_published.json, …_candidate.json; r02_saved_learning_candidate.json.',
  'A parent or grandparent cannot act on these words. And a note from another edition should be kept aside, not turned away.',
  'Plain sentences that say what happened and what to do. On restore, keep unplaceable notes aside, as opening a record now does in PR #40. Offer "set the damaged record aside and start afresh", keeping the original for export.',
  'No message shown to a reader contains a file name or the words JSON or SHA; restoring the other-edition backup brings its note in as kept aside.', origin='RETEST')

f('CI-M-13', 'S3', 'Meanings and teaching', 'Ten vocabulary headwords are not the form found in the passage',
  'js/sukhmani-teaching.js → ashtpadis 11, 18, 23 (vocabulary); nitnem/learning/course.complete.json → unitLessons sohila|sohila01, anand|anand06 (study.words) and banis.jaap, banis.chaupai, banis.rehras (words)',
  'Sukhmani Ashtpadis 11, 18, 23; Sohila shabad 1; Anand pauri 6; overview word lists for Jaap, Chaupai, Rehras',
  'Every vocabulary headword in the teaching layer was checked against the passage it belongs to: 1,498 of 1,508 occur there exactly as written. Five give a base form the passage does not contain (ਹੁਕਮ where the passage has ਹੁਕਮਿ and ਹੁਕਮੇ; ਸਿਰਜਣਹਾਰ for ਸਿਰਜਣਹਾਰੋ; ਲਿਵ for ਲਿਵੈ; ਕ੍ਰਿਪਾਲ for ਕ੍ਰਿਪਾਲੇ and ਕ੍ਰਿਪਾਲੰ; ਚਰਨ for ਚਰਨਨ). '
  'Two join words that do not stand side by side in the text (ਨਿਰਗੁਨੁ ਸਰਗੁਨੁ; ਅਨਹਤ ਨਾਦ). Three in the Rehras overview are terms about the bani, not words in it (ਰਹਿਰਾਸਿ, ਬਖ਼ਸ਼ਿਸ਼, ਅਰਦਾਸ). '
  'Also checked: 1,889 Gurmukhi words or phrases quoted inside English teaching text. 1,829 match the app\'s Gurbani exactly; the other 60 were read one by one and are labelled variant readings from other sources, dictionary headwords or grammar terms. No misquotation was found. '
  'Not checked, because script alone cannot separate them from prose: quotations inside Punjabi-language teaching text. ' + E + 'sA1c_vocabulary_headwords.csv; ' + E + 'sA1b_gurmukhi_quoted_in_english_teaching.csv.',
  'A learner who compares the word list with the line will not find the word. Small — but in scripture study the written form is the point.',
  'Show the form from the line first and the base form second, labelled as such; mark terms about a bani as terms.',
  'The headword script reports no unlabelled exception.', origin='RETEST')


# ───────────────────────────── Re-test outcomes (status and a dated note only) ─────────────────────────────
def retest(fid, status, note):
    x = next(x for x in F if x['id'] == fid); x['status'] = status; x['retest'] = note

RT1 = 'Re-test RT-001, 2026-11-25, candidate PR #40 at 09e829e (unmerged; the public app is unchanged). '
retest('CI-R-01', 'FIX-VERIFIED-ON-CANDIDATE', RT1 + 'REPRODUCED AND FIXED, for everything this finding named. The original tamper script now reports "refused" for every variant in all three readers '
       '(Nitnem 8 of 8 as before; Japji 3 of 3; Sukhmani 2 of 2). A wider test — 21 kinds of alteration per reader, to the file in transit and to the text in memory — was refused 21 of 21 by both readers; the published version showed altered text in 5 of the 21 and a wrong number of lines in others. '
       'A damaged offline copy is refused. Genuine text opens online and offline, in Chromium and in the WebKit engine. Emulation only: no device. Found alongside and registered separately: CI-R-07, CI-R-08. Record: retests/RT-001_PR40_FIRST_REPAIRS.md.')
retest('CI-R-02', 'PARTLY-FIXED-ON-CANDIDATE', RT1 + 'PARTLY FIXED. Fixed: opening a record no longer drops or cuts anything — notes and bookmarks on unknown lines, notes over 12,000 characters and colliding notes are kept whole, shown on the Saved-learning screen, '
       'included in the backup, and survive wipe-and-restore (restoring twice changes nothing). Remaining: (1) RT1-01 — kept-aside items are destroyed without a word when an older copy of the reader opens the same record: a rollback to the published version, or a tab left open from before the update. '
       '(2) CI-R-09 — the notice is not on screen for a returning reader in 3 of 4 situations. Record: retests/RT-001_PR40_FIRST_REPAIRS.md.')
retest('CI-A-01', 'FIX-VERIFIED-ON-CANDIDATE', RT1 + 'FIXED IN THE BROWSER; ONE CRITERION REMAINS. All 3,773 meaning buttons (Japji 385, Sukhmani 2,027, Nitnem 1,361) now give assistive technology a name containing the English and the Punjabi meaning; none carries a fixed label. '
       'The original scan falls from 62, 387 and 2,028 failing elements to 6, 2 and 1, none of them a meaning. Remaining, from this finding\'s own acceptance test: VoiceOver on a physical iPhone, which no one has run. Sukhmani\'s 2,027 line-buttons (CI-A-02) are unchanged. Record: retests/RT-001_PR40_FIRST_REPAIRS.md.')


def render(findings):
    order = {'S0': 0, 'S1': 1, 'S2': 2, 'S3': 3, 'PASS': 4}
    out = ['# Findings register', '',
           'Generated by `tools/build_findings.py` — edit that file, not this one. Severity scale: see `00_BASELINE_AND_FROZEN_CRITERIA.md` §5.',
           '"S0 candidate" means: becomes Critical if a qualified collation against print confirms the app\'s reading is wrong. No S0 is confirmed today, because no printed edition has been consulted by anyone.',
           'Entries CI-S-16, CI-R-07 to CI-R-10 and CI-M-13 were found during re-test RT-001 (2026-11-25). A "Re-test" line under a finding is a dated addition; the finding above it is unchanged. Defects that exist only in an unmerged candidate are not listed here: see `retests/`.', '']
    counts = {}
    for x in findings: counts[x['severity']] = counts.get(x['severity'], 0) + 1
    out += ['| Severity | Count |', '|---|---|'] + [f'| {k} | {counts[k]} |' for k in sorted(counts, key=lambda k: order[k])]
    out += ['', f'S0 candidates: {sum(1 for x in findings if x["s0_candidate"])}', '', '## Index', '', '| ID | Sev. | Area | Finding | Status |', '|---|---|---|---|---|']
    for x in findings:
        sev = x['severity'] + (' (S0 cand.)' if x['s0_candidate'] else '')
        out.append(f'| [{x["id"]}](#{x["id"].lower()}) | {sev} | {x["area"]} | {x["title"]} | {x["status"]} |')
    out.append('')
    for x in findings:
        sev = x['severity'] + (' — S0 candidate pending print confirmation' if x['s0_candidate'] else '')
        out += [f'<a id="{x["id"].lower()}"></a>', f'### {x["id"]} · {x["title"]}', '',
                f'- **Severity:** {sev}', f'- **Area:** {x["area"]} · **Found:** {x["origin"].lower()} · **Status:** {x["status"]}',
                f'- **Exact location:** {x["location"]}', f'- **Composition / verse:** {x["composition_or_verse"]}',
                f'- **Evidence:** {x["evidence"]}', f'- **Why it matters:** {x["why_it_matters"]}',
                f'- **Proposed correction:** {x["proposed_correction"]}', f'- **Acceptance test:** {x["acceptance_test"]}'] + ([f'- **Re-test:** {x["retest"]}'] if x.get('retest') else []) + ['']
    return '\n'.join(out)


if __name__ == '__main__':
    ids = [x['id'] for x in F]
    assert len(ids) == len(set(ids)), 'duplicate finding id'
    (HERE / 'findings').mkdir(exist_ok=True)
    (HERE / 'findings' / 'findings.json').write_text(json.dumps(F, ensure_ascii=False, indent=1), encoding='utf-8')
    (HERE / 'FINDINGS_REGISTER.md').write_text(render(F) + '\n', encoding='utf-8')
    sev = {}
    for x in F: sev[x['severity']] = sev.get(x['severity'], 0) + 1
    print(len(F), 'findings', sev, '| S0 candidates:', sum(1 for x in F if x['s0_candidate']))
