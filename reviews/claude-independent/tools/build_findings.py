#!/usr/bin/env python3
"""Single source of truth for the review's findings.

Run:  python3 -I reviews/claude-independent/tools/build_findings.py
Writes findings/findings.json and FINDINGS_REGISTER.md (full register, one block per finding).
Every deliverable refers to findings by the IDs defined here, so an ID never changes meaning.

Severity scale is the one frozen in 00_BASELINE_AND_FROZEN_CRITERIA.md section 5.
`s0c` = "S0 candidate": would be Critical if a qualified print collation confirms the app's reading is wrong.
`status` values: OPEN · OPEN-NEEDS-SCHOLAR · OPEN-OWNER-DECISION · UPSTREAM · PASS-NOTE
`origin`: INDEPENDENT (found before the builder's tests and documents were opened) or COMPARISON (found while comparing).
"""
import json, pathlib, sys

HERE = pathlib.Path(__file__).resolve().parent.parent
E = 'reviews/claude-independent/evidence/'
F = []


def f(id, sev, area, title, where, verse, evidence, why, fix, test, status='OPEN', s0c=False, origin='INDEPENDENT'):
    F.append(dict(id=id, severity=sev, s0_candidate=s0c, area=area, title=title, location=where, composition_or_verse=verse,
                  evidence=evidence, why_it_matters=why, proposed_correction=fix, acceptance_test=test, status=status, origin=origin))


# ───────────────────────────── Scripture ─────────────────────────────
f('CI-S-01', 'S1', 'Scripture', 'Jaap Sahib chhand 62: an invocation is shown as a verse line and the heading order is reversed',
  'nitnem/data/jaap.json → unit jaap062 (heading01 "ਚਾਚਰੀ ਛੰਦ ॥", line01 "ਤੇਰਾ ਜੋਰੁ ॥")', 'Jaap Sahib, chhand 62',
  'Reference database line KUAA (Dasam Granth p. 4, line 7) is one heading: "ਤੇਰਾ ਜੋਰੁ ॥ ਚਾਚਰੀ ਛੰਦ ॥". The app shows "ਚਾਚਰੀ ਛੰਦ ॥" as heading, then "ਤੇਰਾ ਜੋਰੁ ॥" as verse "Line 1 of 5" with its own meaning. ' + E + 's05_differences.json (jaap062). The builder\'s own note in the data file says its source marks the phrase as a heading.',
  'Order and status of a line of Gurbani differ from the reference. A reader reciting from the app says the words in a different order from the Granth, and a heading is taught as a verse.',
  'After checking a named printed edition: show "ਤੇਰਾ ਜੋਰੁ ॥ ਚਾਚਰੀ ਛੰਦ ॥" as the heading in that order; chhand 62 then has four verse lines; rebind or retire the meaning written for "line 1".',
  'jaap062 renders one heading in print order and four verse lines; Jaap verse-line count drops from 782 to 781 with the heading count adjusted; the collation script reports no order difference at chhand 62; scholar sign-off recorded.',
  'OPEN-NEEDS-SCHOLAR', s0c=True)
f('CI-S-02', 'S1', 'Scripture', 'Jaap Sahib: the same word is stored in two different encodings, one of them ill-formed',
  'nitnem/data/jaap.json → jaap096.line01–04, jaap098.line04 ("ਚੱਤ੍ਰੁ") and jaap097.line01–04, jaap098.line01–03 ("ਚੱਤੁ੍ਰ")', 'Jaap Sahib, chhands 96–98',
  E + 's04_shaping.json, ' + E + 's05_differences.json, screenshot ' + E + 'screenshots/21_jaap096_098_chatr.png. In "ਚੱਤੁ੍ਰ" the vowel sign is stored before the joining mark, which is not a valid order; the two spellings draw differently on screen. The reference reads "ਚੱਤ੍ਰ" in all eleven places.',
  'Visibly inconsistent Gurbani within three adjacent chhands; how it draws depends on the phone\'s text engine (not tested on an iPhone).',
  'Choose one reading from a named printed edition and store it in valid mark order in all eleven places.',
  'All eleven occurrences are byte-identical for this word; a scan for "vowel sign before virama" over the whole corpus returns 0; rendering checked on a physical iPhone.',
  'OPEN-NEEDS-SCHOLAR', s0c=True)
f('CI-S-03', 'S1', 'Scripture', 'Jaap Sahib: four places where the text contradicts its own pattern',
  'nitnem/data/jaap.json → jaap108.line04, jaap122.line04, jaap198.line04 (vs jaap198.line02), jaap179.line04', 'Jaap Sahib 108.4, 122.4, 198.4, 179.4',
  '108.4 "ਕਿ ਗੈਬੁਲ ਗ਼ੈਬ ਹੈਂ" (the dot under ਗ is on the second word only; reference ਗ਼ੈਬੁਲ ਗ਼ੈਬ). 122.4 "ਜ਼ਮੀਨਲ ਜ਼ਮਾਨੈਂ" (every neighbouring word of this form ends -ੁਲ; reference ਜ਼ਮੀਨੁਲ). 198.4 "ਕਰੀਮਲੁ ਰਹੀਮੇ" while 198.2 in the same chhand has "ਕਰੀਮੁਲ" (reference ਕਰੀਮੁਲ in both). 179.4 "ਹੈਂ॥੧੭੯॥" has no space before the verse number, unlike the other 198 chhands. ' + E + 's05_differences.json.',
  'These read as transcription slips carried in from the source, in a bani recited daily.',
  'Correct after print confirmation; keep the previous reading and the supporting edition in the change record.',
  'The four lines match the confirmed edition; a pattern scan for words ending -ਲੁ where the chhand\'s other words end -ੁਲ returns 0; spacing before every verse number is uniform.',
  'OPEN-NEEDS-SCHOLAR', s0c=True)
f('CI-S-04', 'S2', 'Scripture', 'Jaap Sahib: 36 of 808 occurrences differ from the reference at letter level',
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
  'Examples shown to readers: "…not clinical efficacy data, and should not be used to dissuade anyone from medical treatment."; "…not a psychiatric treatment guarantee."; "…not a medical anatomy guide, yoga instruction or objective experimental map." Jaap chhand 1 brings in a present-day caste-injustice frame. Counted by script in this review.',
  'A reader opening the meaning of a line of Gurbani meets risk-management language written for a different purpose. Modern ideas are mixed into the explanation without being labelled as the editor\'s reflection.',
  'Remove these from line notes. Put one short, respectful general note in About ("Gurbani is not medical advice…"). Keep genuine interpretive notes (alternative readings, grammar) only.',
  'Disclaimer screen returns 0 on line notes; one general note exists; reviewers approve remaining notes.', 'OPEN-OWNER-DECISION')
f('CI-M-08', 'S2', 'Meanings', 'Editor\'s working notes and talk about "the app" and "this draft" appear in what readers see',
  'nitnem/learning/course.complete.json (jaap001 vocabulary "…; verify grammar"; anand25 "Exact morphology of the jeweled phrase needs review."; Jaap 7.1, 9.3, 11.4 "…gloss remains provisional"); js/japji-lessons.js (38 of 42 studies mention the draft or the app)', 'Jaap 1, 7, 9, 11; Anand 25; Japji studies',
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
  'Recruit two or three qualified reviewers; give them the focused packet in deliverable 2 (the 140 differing Dasam occurrences first).', 'Signed review records exist for each composition.', 'OPEN-OWNER-DECISION')


def render(findings):
    order = {'S0': 0, 'S1': 1, 'S2': 2, 'S3': 3, 'PASS': 4}
    out = ['# Findings register', '',
           'Generated by `tools/build_findings.py` — edit that file, not this one. Severity scale: see `00_BASELINE_AND_FROZEN_CRITERIA.md` §5.',
           '"S0 candidate" means: becomes Critical if a qualified collation against print confirms the app\'s reading is wrong. No S0 is confirmed today, because no printed edition has been consulted by anyone.', '']
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
                f'- **Proposed correction:** {x["proposed_correction"]}', f'- **Acceptance test:** {x["acceptance_test"]}', '']
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
