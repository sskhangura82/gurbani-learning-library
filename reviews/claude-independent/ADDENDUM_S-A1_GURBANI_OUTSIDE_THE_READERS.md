# Addendum S-A1 · Gurbani the app shows outside its three readers

**Date:** 25 November 2026 · **Found during:** re-test RT-001 · **Applies to:** the published
version `a3476ac` (these files are byte-for-byte the same in candidate PR #40)

## Why this addendum exists

My source audit (D02) said every occurrence of Gurbani had been compared: 3,809 of 3,809.
That count was the text of the three readers. While re-testing the builder's repair I
noticed that the app shows Gurbani in other places too, drawn from other files. Those
occurrences had not been counted, collated or tamper-tested. **The audit was complete for
the readers and incomplete for the app.** This addendum closes the gap and says what was
found.

I am an AI system. As in D02, this is a comparison with one digital reference — Shabad OS
Database v5.0.0-next.0 — not with print, and not a scholarly ruling.

## 1. How the search was done

Every shipped `.js`, `.json` and `.html` file was searched, except the three reader source
sets already audited (`js/japji-full-data.js`, `js/sukhmani-data.js`, `nitnem/data/*.json`).
Three kinds of Gurbani were looked for:

| Kind | How it was found | Count |
|---|---|---|
| A. Whole lines of Gurbani | Fields that hold scripture (lines, excerpt, context, heading); any text carrying a danda (॥); the fixed line on the Simran page | **31 occurrences** |
| B. Words and phrases quoted inside English teaching text | In an English sentence, a run of Gurmukhi script is a quotation | **1,889 runs** |
| C. Vocabulary headwords | The word lists attached to passages in the teaching layer | **1,508 headwords** |

Not covered, because script alone cannot separate it from prose: **Gurbani quoted inside
Punjabi-language teaching text.** That needs a person who reads Punjabi, and is part of the
human review that is still outstanding.

## 2. A — whole lines: 31 occurrences

Register: [`evidence/sA1_register.csv`](evidence/sA1_register.csv).

| Where the reader sees it | Source | Occurrences | Exact against the reference |
|---|---|---|---|
| Older Pauri 2 lesson page | Japji Pauri 2, Ang 1 | 6 | 6 |
| Japji reader → Explore → Related teachings, and the older lesson page | Salok M2, Ang 466 — excerpt and 8 lines | 9 | 9 |
| same | Salok M1, Ang 472 — excerpt and 5 lines | 6 | 5 |
| same | Asa M5, Ang 394 — excerpt and 7 lines | 8 | 7 |
| Japji reader → Explore → Raag & meaning | Anand heading, Ang 917 | 1 | 1 (the app quotes part of one reference line) |
| Simran Room page | Japji Pauri 4, Ang 2 | 1 | 1 |
| **Total** | | **31** | **29** |

- The six Pauri 2 lines and the Simran line are identical to the copies in the Japji reader.
- All six stored line hashes in `js/content.js` match their text.
- Every stated Ang is right.

**The two lines that differ (CI-S-16).** They differ in one sign, in three words:

| Ang | The app writes | The reference, and the app's own Sukhmani text, write |
|---|---|---|
| 472 | ਜਿਨ੍ਹ੍ਹੀ … ਤਿਨ੍ਹ੍ਹਾ | ਜਿਨੑੀ … ਤਿਨੑਾ |
| 394 | ਸਮ੍ਹ੍ਹਾਲੇ | ਸਮੑਾਲੇ |

The reference uses a single sign for the small half-ha under the letter. The app's related
passages write a subscript ha twice instead — a workaround found in some older digital
texts. In the font available to me the workaround is drawn with a full extra letter:
**ਜਿਨ੍ਹਹੀ, ਤਿਨ੍ਹਹਾ, ਸਮ੍ਹਹਾਲੇ**
([comparison](evidence/screenshots/sA1_doubled_ha_comparison.png),
[as shown in the app](evidence/screenshots/sA1_doubled_ha_related1_line.png)).
I could not test Apple's Gurmukhi font, so I do not know what an iPhone draws. I cannot
rule on the print reading; I can say that the app is inconsistent with itself and with the
reference, and that on the screen I tested three words of Gurbani are misspelt.

It also tells us something about sources: these passages were taken from a different
digital family (the file cites gurugranthdarpan.net) than the readers' text.

**None of the 31 is checked when it is opened (CI-R-07).** See the re-test record, 4.1.

## 3. B — words and phrases quoted inside English teaching text: 1,889

Register: [`evidence/sA1b_gurmukhi_quoted_in_english_teaching.csv`](evidence/sA1b_gurmukhi_quoted_in_english_teaching.csv) ·
exceptions with their sentences: [`evidence/sA1b_summary.json`](evidence/sA1b_summary.json).

| Result | Count |
|---|---|
| Occurs exactly as written in the app's Gurbani text | 1,829 |
| Does not — read one by one | 60 |

The 60 are all deliberate and labelled as what they are: readings from other sources set
beside the app's reading ("another consulted text reads …"), dictionary headwords, grammar
terms (ਔਂਕੜ, ਕੰਨਾ), or modern Punjabi spellings given for comparison (ਸ਼ਾਹ, ਜੋਸ਼). **No
misquotation of the line under discussion was found.**

A side observation in the builder's favour: the Nitnem teaching file records many of the
spelling differences that my collation found independently — including the words in Jaap
96–98 (CI-S-02) — and says each time that the app's reading was left unchanged.

## 4. C — vocabulary headwords: 1,508

Register: [`evidence/sA1c_vocabulary_headwords.csv`](evidence/sA1c_vocabulary_headwords.csv).

| File | Headwords | In their own passage, exactly as written |
|---|---|---|
| Japji lessons | 162 | 162 |
| Sukhmani teaching | 219 | 216 |
| Nitnem course | 1,115 | 1,108 |
| Older Pauri 2 lesson | 12 | 12 |
| **Total** | **1,508** | **1,498** |

The ten exceptions (CI-M-13, low): five give a base form the passage does not contain
(ਹੁਕਮ, ਸਿਰਜਣਹਾਰ, ਲਿਵ, ਕ੍ਰਿਪਾਲ, ਚਰਨ); two join words that are not side by side in the text;
three in the Rehras overview are terms about the bani rather than words in it. No headword
misspells a word of Gurbani.

## 5. What changes in the review

| Statement in the first review | Corrected |
|---|---|
| "Every occurrence of original Gurbani the app serves" = 3,809 | 3,809 inside the three readers **and 31 outside them**: 3,840 whole-line occurrences |
| Letter-level differences: 138, all in Dasam Bani | 138 in Dasam Bani **and 2 lines (3 words) in Sri Guru Granth Sahib text quoted outside the readers** |
| Sri Guru Granth Sahib text: 0 letter-level differences | Still 0 **inside the readers** (2,735 of 2,735). Outside them, where all 31 occurrences are Sri Guru Granth Sahib text: 29 of 31 exact |
| Critical if confirmed by print: 6 | 7 (adds CI-S-16) |

The verdict in D12 does not change: not approved as verified scripture; no print collation
exists.

## 6. Reproduce

```
python3 -I tools/sA1_gurbani_outside_readers.py <site> <master.sqlite> <app_corpus.json> <out.json>
python3 -I tools/sA1b_gurmukhi_quoted_in_english_teaching.py <site> <app_corpus.json> <sA1.json> <out.json>
python3 -I tools/sA1c_vocabulary_headwords.py <site> <app_corpus.json> <out.json>
```
