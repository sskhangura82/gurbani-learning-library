# Round 3 · Baseline and criteria, frozen before testing

**Reviewer:** Claude, independent second reviewer · **Written:** 26 November 2026, 01:58–02:15 UTC
**Subject:** PR #45, "knowledge library foundation" (builder: ChatGPT), a development-only pilot.
**Asked for by:** the builder's review request on PR #45 (comment 7179264367) and the owner's
standing protocol: own criteria first, findings recorded, only then the builder's tests.

This file is committed **before** I open any file of PR #45. Up to this point I have read only:
the pull-request description, the builder's review request, and the list of nine file names with
their sizes. I have also run one query against my own pinned reference (section 3) — not against
the pilot.

## 1. Exact state inspected

| | Head | Checks reported by GitHub at 01:57 UTC | State |
|---|---|---|---|
| `main` (published) | `a3476ac4b9be90dde350fb35dd13ce0b672c120d` | — | unchanged |
| PR #45 knowledge pilot | `8fa9206d9b4d6e90835972575458853b5d08247a` | 5 of 5 pass | draft, on `main`, 9 files added, 0 changed |
| PR #40 first repairs | `09e829e` | — | unchanged since re-test RT-001; no reply |
| PR #41 · #42 · #43 | `dc66da9` · `16a4846` · `fb49ef4` | — | unchanged since round 2; no reply |
| PR #38 my review | `59c52a2` | 3 of 3 pass | open |
| PR #44 · #46 my drafts | `0a047f8` · `af78b41` | 2 of 2 · 3 of 3 pass | drafts, not yet cross-reviewed |

Files in PR #45: `knowledge/pilot.json` (1,015 lines), `knowledge/core.mjs` (107),
`knowledge/app.mjs` (71), `knowledge/index.html` (7), `knowledge/style.css` (1),
`docs/GLP_KNOWLEDGE_LIBRARY_ARCHITECTURE_V1_20261125.md` (42), `tests/knowledge-contract.mjs` (42),
`tests/knowledge-browser.mjs` (25), `.github/workflows/knowledge-pilot-qa.yml` (39).
The two test files and the workflow stay closed until my findings are pushed.

## 2. What PR #45 says it delivers (its promises)

1. Additive and development-only. No existing reader, home page, offline copy or saved learning changed.
2. 31 typed items ("nodes") and 26 typed connections ("relationships").
3. 19 occurrences of Gurbani: three complete Saloks — Ang 470 (Mahalla 1), Ang 466 (Mahalla 2),
   Ang 1364 (Bhagat Kabir Ji, Salok 7) — from a pinned corpus with a digital comparison. No print
   check, no qualified approval.
4. Six dictionary entries, each sense tied to an exact form in its context.
5. Six concepts; two lessons (Humility, Haumai), each at three depths in English and Punjabi,
   versioned and visibly draft.
6. Two comparative studies with references and stated limits (psychology; Buddhist), and one course.
7. Search on the device: exact phrase, first letters, Ang, curated other names, author.
8. Word lookup in context, a way back, full passage with the place kept, a layout for phone,
   tablet and desktop, and a pinned fingerprint of the data file.
9. No live AI, no data collection, no audio.
10. Source, teaching, concepts and comparisons are kept apart. A logical identity is distinguished
    from an edition-bound one. Collections are distinct.
11. Not claimed: links into the existing readers, the full 1,430-Ang index, the 30–50 topic library,
    rights, independent or qualified review, production or offline use, any physical device.

## 3. Reference boundaries, decided before the pilot is opened

From my pinned reference (Shabad OS Database 5.0.0-next.0, Sri Guru Granth Sahib asset; script
`tools/k3_00_reference_boundaries.py`, output `evidence/k3_00_reference_boundaries.json`):

| Where | What the reference holds there | What I therefore expect |
|---|---|---|
| Ang 466, Mahalla 2 | Exactly **one** Salok by Guru Angad Dev Ji: 8 lines (the heading ਮਹਲਾ ੨ and 7 lines), ending ॥੨॥ | These 8, no more, no fewer |
| Ang 470, Mahalla 1 | **Four** Saloks by Guru Nanak Dev Ji: 7, 15, 9 and 11 lines | The request does not say which. 19 − 8 − 2 = 9, so I expect the 9-line Salok (heading ਸਲੋਕੁ ਮਃ ੧ and 8 lines, ending ॥੧॥). The pilot must itself say which one, unambiguously |
| Ang 1364, Bhagat Kabir Ji, Salok 7 | 2 lines ending ॥੭॥. It has no heading of its own; the heading ਸਲੋਕ ਭਗਤ ਕਬੀਰ ਜੀਉ ਕੇ stands before Salok 1 | These 2. If a heading is shown with it, it is marked as the collection's heading, not this Salok's line |

Asa Ki Vaar sets Saloks before each Pauri. A Salok lifted out of the Vaar is complete as a Salok;
whether its place in the Vaar (which Pauri it precedes) is recorded is criterion KS-03.

The reference is one digital family (Shabad OS; Open Granth derives from it). Agreement with it
is agreement with one witness, not with print. I will say so wherever I report a match.

## 4. Criteria

Verdict words: **Pass · Partial · Fail · Not testable here**. Each verdict will name what was
examined and out of how many. Severity as before: S1 wrong or unsafe Gurbani on screen or lost
learning · S2 misleads, or blocks a promise · S3 polish.

### Source text
| ID | Criterion |
|---|---|
| KS-01 | Every occurrence of Gurbani in the data equals the reference letter for letter. I count occurrences in the reference myself rather than accept 19. |
| KS-02 | Each of the three Saloks starts at its first line and ends at its last, with nothing from a neighbour. Boundaries as in section 3. |
| KS-03 | Author, Mahalla, Raag or collection, Ang, and Salok number agree with the reference. For the two Saloks from Asa Ki Vaar the setting is stated (it is a Salok of the Vaar, not a free-standing Shabad). Heading lines are marked as headings. |
| KS-04 | Stored fingerprints recompute. The edition is named and pinned to an exact version. |
| KS-05 | No legacy or stray characters, no pause marks, no invisible characters; the same conventions as the published readers. |
| KS-06 | Wherever Gurbani is drawn — passage, search result, dictionary entry, concept, lesson, comparison, course — it equals the data, whole or visibly marked as an excerpt. |
| KS-07 | Gurbani is stored once. Every other place points to it by identity. I list every string of Gurmukhi outside the source occurrences and classify it: pointer, exact quotation, or a second copy. Second copies fail. |
| KS-08 | Where a line of these Saloks already appears in the published app, the two texts agree. |

### Identity
| ID | Criterion |
|---|---|
| KI-01 | The logical identity of a line does not depend on an edition's page or line number; the edition-bound identity names its edition. One maps to the other without loss for this corpus. |
| KI-02 | The new identities do not collide with the four schemes already in the app, and the document says how they will be joined. No claim that they are joined. |
| KI-03 | Identities are unique across all kinds of item, are not positions in a list, and every reference resolves. Items nothing points to are declared or absent. |
| KI-04 | A piece of teaching can never be taken for a line of Gurbani — in the data (separate collections, typed) and on screen (label, script, placement). |

### Dictionary
| ID | Criterion |
|---|---|
| KD-01 | Each headword form occurs, as a whole word, letter for letter, in the occurrence it cites. |
| KD-02 | Each sense is tied to one named occurrence. The sense given is defensible for that line; where grammar is claimed (case, number, tense) it is right or flagged as unreviewed. Form and dictionary form are distinguished. |
| KD-03 | Each entry says where its meaning comes from and that it is a draft. No modern dictionary or commentary is copied. |
| KD-04 | A word in the passage opens its entry; a word with no entry says so and never guesses; the way back returns to the same line. |

### Connections
| ID | Criterion |
|---|---|
| KR-01 | I count items and connections myself. Every end of every connection exists. Every type comes from a declared list. |
| KR-02 | Direction means something: where "A explains B" is stored, the screen does not also say "B explains A". Each connection carries its evidence, and the evidence supports it. |
| KR-03 | An editorial connection (someone's judgment) is told apart from a textual one (the word is in the line). Nothing equates a Gurbani concept with a concept from another tradition or from psychology. |
| KR-04 | No duplicates, contradictions or self-connections. From either end of a connection the other end can be reached on screen. |

### Lessons
| ID | Criterion |
|---|---|
| KL-01 | Two lessons × three depths × two languages are all present and all reachable on screen. Changing depth or language keeps the reader's place. |
| KL-02 | Each claim a lesson makes about a Salok is supported by that Salok's words and setting. Nothing invented: no story, date, quotation or saying without a source. |
| KL-03 | "Draft, not reviewed" is on screen at every depth, in both languages, together with who wrote it and its version. Nothing says verified, approved, authentic or complete. |
| KL-04 | The Punjabi is Punjabi — not English in Gurmukhi letters — and carries the same content as the English at every depth. (I can check completeness and obvious faults; a native reader must judge quality.) |
| KL-05 | Teaching is never set in the voice of the Guru and is visually apart from Gurbani. |
| KL-06 | Nothing reads as treatment or as a verdict on the reader. Where ego, worth or shame is discussed, the wording could be read by someone in distress without harm. |

### Comparative studies and the course
| ID | Criterion |
|---|---|
| KC-01 | Every work cited exists and says what is attributed to it. I look each one up. Author, year, title and place of publication are right. |
| KC-02 | The limits are stated where the comparison is made, not only in a footnote: the traditions are not said to teach the same thing; where they differ (for example Haumai and the Buddhist teaching of not-self) the difference is named. |
| KC-03 | Links go to the publisher or another legitimate holder, over a secure connection. No copied protected translation. |
| KC-04 | The course is an ordered path through items that exist; it promises nothing that is not there (no certificate, score or streak). |

### Search
| ID | Criterion |
|---|---|
| KQ-01 | Exact phrase: for every line, its full text, and a two- or three-word phrase from it, find that line. With and without the closing ॥ marks. |
| KQ-02 | First letters: I work out the first letters of every line myself; each finds its line. The rule for what counts as a first letter (vowel carriers, ੴ, conjuncts) is stated or discoverable. |
| KQ-03 | Ang: 466, 470 and 1364 find theirs. 465, 471, 0, 1431, 14300, −1 and ੪੬੬ give a plain answer and never a wrong passage. |
| KQ-04 | Other names: the curated list is findable; each name finds its item regardless of capitals or accents. |
| KQ-05 | Author: Guru Nanak Dev Ji, Guru Angad Dev Ji, Bhagat Kabir Ji — in English and in Gurmukhi, by Mahalla number where that applies. |
| KQ-06 | What must find nothing finds nothing: unrelated words (car, war, ant), single letters, "a", "the", blanks, a 5,000-character string, markup, pattern characters, emoji, invisible characters, mixed scripts. No accident of letters inside longer words. No markup runs. No crash. |
| KQ-07 | Each result says what it is (Gurbani, dictionary, concept, lesson, comparison) and why it matched. The order is the same every time. |
| KQ-08 | The page says what it holds. A well-known line that is not among these three Saloks gets "not in this pilot" — never an answer that could be read as "not in Gurbani". |

### Using it
| ID | Criterion |
|---|---|
| KU-01 | From any result, entry or lesson, "full passage" opens the whole Salok with the line marked; going back — by the browser and by the page — returns to the same place. |
| KU-02 | At 320, 375, 390, 430, 768, 820, 1280 and 1440 wide: no sideways scrolling, no clipped Gurmukhi, things to tap are at least 24 px (noting any under 44), text no smaller than 12 px. At 200 % text size it still works. |
| KU-03 | Keyboard alone completes every path. Focus is visible and in order. Automated accessibility scan (axe) reports no serious faults. Gurmukhi, Punjabi and English are each marked with their language. Search results are announced. |
| KU-04 | A wrong or damaged address (unknown item, `#%`, empty) gives a plain message. A direct address to each kind of item opens it. No errors in the console. |
| KU-05 | Workshop words (node, edge, fixture, occurrence, digest, schema) do not appear to the reader. |
| KU-06 | Printing gives the passage with its source and the draft label. |

### Refusing damaged data, privacy, isolation
| ID | Criterion |
|---|---|
| KT-01 | With the data file altered on its way to the browser — a word changed; a line removed; lines reordered; an item removed; a connection re-pointed; lesson wording changed; the draft label removed; cut short; empty; missing; not valid — nothing is shown and a clear message is. |
| KT-02 | The same when the fingerprints stored inside the file are recomputed to match. This asks where the expected value lives. |
| KT-03 | No Gurbani before the check has passed, or when the browser cannot perform it. |
| KT-04 | Nothing is requested from another site. Nothing is written to the device (or, if something is, it is named and does not touch the `glp001.*` keys of the readers). No tracking. Data is never inserted as markup. |
| KT-05 | With the published offline worker installed (and candidate #40's), the pilot's page is not answered from a stale copy, and visiting it does not disturb the readers' offline copy. |
| KT-06 | Additive: the nine files and nothing else. The published readers' own tests still pass on this branch. Nothing on the home page links to the pilot. |
| KT-07 | The fingerprint is stable across machines (line endings pinned). The workflow deploys nothing and holds no secrets. |

### The document and the claims
| ID | Criterion |
|---|---|
| KA-01 | Every number in the description — 31, 26, 19, 6, 6, 2, 2, 1 — is what I count. |
| KA-02 | The document answers: how one line gets one identity across the whole app; that writing points and never copies; how this grows from 19 lines to the whole of Sri Guru Granth Sahib Ji (size, loading, who checks); how draft, independently reviewed and qualified-approved are recorded for each item separately. |
| KA-03 | Nothing is called indexed, joined, verified, authentic or complete that is not. |
| KA-04 | It keeps the owner's rules: no generative AI in the reader, no tracking, free, private on the device, no audio without permission. |
| KA-05 | Fit with what already exists: PR #41 holds a lesson in one form, PR #44 (mine) in another, this pilot in a third. I record whether the pilot names which form is meant to last, since the owner's rule is one author per subject and no duplicate parallel artefacts. |

## 5. What I will not be able to test, said in advance

- Any real iPhone, iPad, Android device, Safari, VoiceOver or TalkBack. Chromium on a server only.
- Print against paper; a reading by a qualified Gurbani scholar; a native Punjabi reader's judgment.
- Agreement with a printed Sri Guru Granth Sahib Ji. My reference is one digital family.
- Whether the lessons teach well. That needs real learners.

## 6. Order of work

1. This file pushed.
2. Open the data, the code and the document. Not the tests, not the workflow.
3. Record findings in `01_INDEPENDENT_FINDINGS_ROUND3.md`; push.
4. Open the builder's two tests and the workflow; run them; write
   `02_COMPARISON_WITH_BUILDER_TESTS_ROUND3.md`.
5. Reply on PR #45 with verdicts and bounded corrections. No approval, no merge.
