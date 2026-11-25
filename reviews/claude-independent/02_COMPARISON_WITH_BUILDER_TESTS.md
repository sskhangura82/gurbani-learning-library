# 02 · Comparison with the builder's tests, evidence and documents

**Protocol step 6.** Done only after commit `1246fb4` had preserved my independent findings.
From this point I read: all of `tests/` (30 files, by inventory and targeted reading),
`.github/workflows/reader-qa.yml`, `evidence/` (69 files, by inventory and the summaries
quoted below), `docs/` (27 files; read in full: `NITNEM_COMPLETE.md`,
`CLAUDE_REVIEW_DECISIONS_20261023.md`; searched: the rest), and
`research/nitnem/20261125/` (16 files; read: source audit, source amendments, source
manifest, the four editorial-review headers).

Evidence tags as before: **[V]** verified by me · **[R]** reported by the builder ·
**[I]** my interpretation.

## 1. I was wrong about one thing

| | |
|---|---|
| What I had reported | Jaap Sahib chhand 62 shows "ਚਾਚਰੀ ਛੰਦ ॥" before "ਤੇਰਾ ਜੋਰੁ ॥" — order reversed against the reference; rated high, "critical if confirmed" |
| What the builder's records said | "`ਤੇਰਾ ਜੋਰੁ ॥` … is displayed before the Chachari metre heading, as in the selected witness" (`docs/NITNEM_COMPLETE.md`); a test asserts it (`tests/nitnem-content.mjs:139`); evidence flag `jaap62SourceDisplayOrderVerified: true` |
| What the screen shows **[V]** | "ਤੇਰਾ ਜੋਰੁ ॥" first, then "ਚਾਚਰੀ ਛੰਦ ॥", in both layouts — the reference order (`evidence/s09_jaap62_order.json`, screenshot `67_jaap062_continuous.png`) |
| Cause | My extraction script put headings before lines inside every unit. One unit in the whole library carries an explicit display order, and it is this one |
| What I did | Fixed the script; re-ran the full collation; added a new check that on-screen order equals collation order at every position in all six Nitnem banis (`evidence/s11c_rendered_order.json`: identical everywhere except these two rows, which are right on screen) |
| Effect on numbers | Letter-level differences 140 → **138**; Jaap 36 → **34**; S0 candidates 7 → **6**. CI-S-01 lowered from high to low |

The builder was right and I was wrong. This is the value of doing the comparison at all,
and it is a reason to treat my other scripture findings as *candidates for human checking*,
which is how they are labelled.

## 2. Where the builder's records and my results agree

| Topic | Builder **[R]** | This review **[V]** |
|---|---|---|
| Counts | 385 Japji occurrences; 2,027 Sukhmani; 1,361 Nitnem records; 42 + 217 + 327 studies | Same |
| Builder's contract tests | "PASS" in CI run 45628466334 | Re-ran all ten Node test files on the reviewed commit: all exit 0 |
| Sukhmani text | 2,027 exact matches against SriGranth; "independent editions not proven" | 2,027 exact against Shabad OS; same caveat (CI-S-12) |
| Japji Pauri 13 line 1 | Carried as an **open** comparison since 23 October | Matches the reference exactly (`s05_register.csv`, `pauri13.line01`). Closed at the digital level; print still outstanding |
| Savaiye, Chaupai | 12 and 49 differences from BaniDB "retained as variants" | 12 and 50 letter-level differences from Shabad OS |
| Human review | "qualified human review … remains zero" | Confirmed in the data (CI-X-02) |
| Devices | "Physical iPhone, Home Screen, VoiceOver and actual airplane-mode … remain distinct from automated Chromium tests" | I had none either (CI-A-05). **No one has tested this app on an iPhone in any recorded review since October** |
| Study language | "Earlier detailed studies are chiefly English" | Measured (CI-M-10) |
| Update and offline behaviour | Tested in Node and Chromium | Independently reproduced, including a deliberately broken update (CI-R-06) |
| Nitnem saved learning | "A damaged, unknown or newer saved record is kept unchanged" | True for the Nitnem and Sukhmani readers |

## 3. Where they differ, or where the builder's tests did not look

| Topic | Builder's position | What I found | Finding |
|---|---|---|---|
| "Every source record is checked against its stored hash" (README) | Checked in Node tests and by the Nitnem reader at run time | Japji and Sukhmani readers have no run-time check and displayed altered Gurbani without warning | CI-R-01 |
| "Unknown or damaged saved records are preserved" (README) | Tests cover export of unknown *fields* | The Japji reader deletes a note attached to an unknown *line* on load | CI-R-02 |
| Accessibility | No accessibility tool is used in any test; two files check a label string | Meanings are not announced to screen readers in any reader; Sukhmani has 2,027 button-lines | CI-A-01, CI-A-02 |
| Dasam Bani text | Pass condition was "equal to the selected provider" (Jaap = BaniDB snapshot exactly) | Equality with one provider imports that provider's slips: two encodings of one word, "ਗੈਬੁਲ ਗ਼ੈਬ", "ਜ਼ਮੀਨਲ", "ਕਰੀਮਲੁ"/"ਕਰੀਮੁਲ", a missing space | CI-S-02, CI-S-03 |
| Opening lines of Savaiye and Chaupai | Not discussed | Fused words and split invocation, visible on screen | CI-S-05 |
| Rehras structure | "Nine opening SGGS hymns match the entire consecutive source range"; 57 aggregate IDs mapped to Ang ranges | True at letter level; but shown as 23 run-on blocks with 105 missing spaces and headings inside verse | CI-S-10 |
| Meaning review | Three "independent editorial reviews", each by an AI agent, status "PASS with qualified human review pending" | Reading 342 lines by hand found the distancing voice, softening and errors those reviews passed | CI-M-01, CI-M-02, CI-M-04 |
| Cautions on meanings | A test **requires** a caution on every line (`tests/nitnem-content.mjs:219`) | 309 of 1,361 are medical- or legal-style disclaimers; the rule manufactures them | CI-M-07 |
| Source evidence | Audit cites six comparison files and "the visually checked printed source" | Five of the six files are not in the repository; the printed source is not named anywhere | CI-X-03 |
| Reading design | Decision of 23 October: "One quiet dock, no persistent header"; design review before each promotion | Nitnem reader has a permanent 71 px header; no design review of this release is recorded | CI-U-10 |
| Browser tests in CI | Sukhmani and Nitnem browser suites run | The Japji browser suites exist (`reader-browser.js`, `r7-browser.mjs`) but are not run by the quality gate | noted in deliverable 7 |

## 4. What the builder's own corrections tell us

The release corrected twelve occurrences (`research/…/source-amendments.json`): a missing
word in Chaupai 5.2 ("ਕਾ"), "ਦ੍ਰਿਸਾਟਿ" for "ਦ੍ਰਿਸਟਿ", "ਸੱਘਰੋ" for "ਸੰਘਰੋ", "ਸਵਗੁਨ" for
"ਸਿਵਗੁਨ", two Savaiye words, one Jaap word, and a private-use character in Anand 24.3.
**[I]** Six real transcription errors found by the builder in 156 lines of Savaiye and
Chaupai is itself evidence that the web text those two banis came from is not reliable
enough to patch one word at a time. It supports replacing it with a transcription of a
named printed edition (CI-S-06, CI-S-07).

## 5. Reading across both sets of work

1. The builder's engineering discipline is real: hashes, preserved IDs, before/after
   records for every text change, honest limits. Nothing found here suggests concealment.
2. Its tests answer "did we keep what we had?" very well. They do not ask "is what we have
   right?", "can a blind reader use it?" or "does the meaning say what the line says?".
   Most of this review's findings sit in those three gaps.
3. "Independent review" inside the build has meant one AI agent checking another, the same
   day. That catches slips of process; it did not catch tone, softening or doctrine.
4. The release note names the next addition as Salok Mahalla 9. **[REC]** Do not add
   compositions until the high-severity items are closed; each new bani multiplies the
   present gaps by three readers.
