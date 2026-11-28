# Round 2 — independent findings on PR #43, PR #41, PR #42 and the Salok Mahalla 9 draft

**Reviewer:** Claude (AI system; not a Sikh scholar, not a Santhiya teacher).
**Written:** 26 November 2026, 00:40 UTC — **before** I opened or ran any of the builder's tests for #41 or #43.
The comparison with the builder's tests is a separate file, `02_COMPARISON_WITH_BUILDER_TESTS.md`, written afterwards.
**Criteria:** frozen in `00_BASELINE_AND_FROZEN_CRITERIA_ROUND2.md` (commit `7bb82f6`).
**Everything below is desktop emulation in headless Chromium.** No iPhone, iPad, Android device, Safari or screen reader was used. Nothing here is a statement about a real device.

Verdict words asked for by the builder: **PASS · NEEDS_REVISION · INCOMPLETE**. Severity: S1 high, S2 medium, S3 low.

---

## 1. PR #43 — Daily Hukamnama reader (`fb49ef4`)

### Overall

**PASS as a development fixture. NEEDS_REVISION on four points before anything is built on it. INCOMPLETE as a daily reader** (which it says itself).

The part that matters most holds: the Gurbani is exact, the page never shows a reading under the wrong day, and it refuses damaged data.

### What I checked and what happened

| Area | Result |
|---|---|
| **The Gurbani** (HS-01…08) | **19 of 19** occurrences equal the reference letter for letter. I counted the Shabad in the reference myself: 19 (one heading, 18 lines). It starts at the Shabad's first line and ends at its last (`॥੮॥੪॥`); the line before belongs to the previous Shabad and the line after is the next heading. Ang **19 of 19**; the turn from 504 to 505 falls between the two Rahao lines, where the reference has it. Printed-line numbers 19 of 19. Author Guru Nanak Dev Ji, Raag Gujri: agree. Both Rahao lines are labelled on screen. What is drawn equals the data, in order, for both dates (19 of 19 each). **PASS** |
| **Is the dated event real?** (HE-01…05) | **25 Nov 2026:** I opened SGPC's own Mukhwak page. Date, place, heading, Ang, calendar line, first line, both Rahao lines, the half-ha word in stanza 4, eight stanzas, the last marker and completeness all agree with the data. SikhNet agrees on date, Ang, author and Raag. I could **not** compare all 19 lines letter for letter with an SGPC page, and I could **not** open the dated article the data names. **14 Oct 2025:** second-hand support only. **25 Nov 2017:** not verified; correctly held. Full log: `evidence/h04_source_retrieval_log.json`. **PASS for 2026 with stated limits · INCOMPLETE for 2025 and 2017** |
| **Dates** (HD-01…06) | The Amritsar date is right in **15 of 15** cases (five device time zones × three instants, including one second before and exactly at Amritsar midnight). After midnight, "Today in Amritsar" shows no Gurbani and says the selection is not available. A missing day, tomorrow, a far-future day, the held 2017 day, a leap day and year 1 each give a plain statement and no Gurbani; **22 of 22** odd inputs given straight to the date code are handled. A wrong device clock never produced a reading without its date. One Shabad record, referenced by three events, not copied. **PASS** |
| **Refusing damaged data** (HI-01…05) | **24 of 24** alterations refused with no Gurbani shown: a word changed, a line removed, lines swapped, the Rahao removed, the last stanza removed, an Ang changed, a date changed, the held day turned into a confirmed one, an event repointed, duplicates, an added date, approval flags flipped, a link changed, markup inserted, and the file cut short, empty, invalid, missing, re-saved, given Windows line endings or a byte-order mark. No Gurbani while the check is pending or when the browser cannot do the check. The existing offline worker holds none of these files; without a connection the page does not open at all, so no stale copy can appear. **One limit, by design:** the expected value lives in the program file, not beside the data. When I changed a word **and** changed the program file to expect it, the altered word was shown (1 case). The check protects against accident, damage and stale copies. It does not protect against someone who can change both files, and nothing in a static site can. **PASS** |
| **Saved learning** (HL) | The reader offers nothing to save. Recorded as **absent**, not as a pass. The other readers' saved records were unchanged by using it. |
| **Scope and rights** (HR) | The only address contacted was the test server. No audio, video or frame. No teaching shown as approved. Only the new folder, two test files, one workflow and the plan document are added; not linked from the home page; not in the offline copy. The data holds only Gurbani and the project's own descriptions. **PASS** |
| **Use and access** (HA) | Automated scan: **0 violations in 12 of 12 states** (reading, pending, held, future, empty, refused × light and dark). No sideways scrolling at 320, 390, 507, 768, 820, 1024, 1280 and 1440, also at the largest Gurmukhi size. Print gives all 19 lines with date and source. Points to fix are in R2-H-07. **PASS with small repairs** |

### Findings

| ID | Sev. | Finding | Evidence | What I recommend |
|---|---|---|---|---|
| **R2-H-01** | S2 | The link named "Official SGPC listening page" goes to `sgpc.net/daily.mukhwak-pdf/`. SGPC's page is `sgpc.net/daily-mukhwak-pdf/` (hyphen, not full stop). I could open SGPC's address; I was not able to open the reader's version to see what it returns, so: almost certainly a dead link, not proven. | `hukamnama/index.html` line 13; retrieval log, attempt 7 | Correct the address. Add a test that every outside address in the page and the data is one of a short, reviewed list. |
| **R2-H-02** | S2 | The reader always opens on 25 November 2026 and draws that reading, whatever day it is. It carries its date and is never called today's, so nothing false is said. But a visitor who opens the page next month meets a past reading first. | Screenshot `h_on_open_next_day_shows_25_nov.jpg`; `EXAMPLE_DATE` in `core.mjs` | Right for a fixture. Before any public use the opening state must be today's Amritsar date, with "not yet available" when there is none. Make this an explicit exit test of the daily-publisher phase. |
| **R2-H-03** | S2 | Each event's evidence is a sentence, not a record. There is no retrieval time, no stored digest of what was retrieved, and the 2025 event says "direct capture pending". Both dated events carry the same status although the support for them is not equal. The plan in #42 itself asks for a fetched time and an evidence digest per event. | `fixture.json`, the three `sourceEvidence` strings | Give every event: what was retrieved, from where, when, by what means, and a digest of the retrieved Gurmukhi. Use a weaker status for an event nobody has captured directly. |
| **R2-H-04** | S2 | Merging this to `main` publishes it. The site is served from `main`, so the page would be reachable at a public address the moment it is merged, unlinked and marked not-for-search but public. | Repository layout; the PR's own "no deployment" promise | Keep it unmerged until the owner decides. This is a release decision, not a code defect. |
| **R2-H-05** | S3 | The checker accepts exactly this Shabad and exactly these three dates. That is sound for a fixture, but it is not yet a mechanism that can admit a second day. The title's "shared Shabad foundation" promises more than is there. | `validateFixture` in `core.mjs` | Say so in the description. The registry and per-day files are still to be built (work order item E). |
| **R2-H-06** | S3 | "19 of 19 match" compares the data with Open Granth. Open Granth says it is derived from the Shabad OS database, which is also my reference. So the builder's check and mine are **one digital family, not two independent witnesses**. | Open Granth `NOTICE` at the pinned commit | Keep the claim as "matches one digital source". A print collation by a qualified person is still the missing step. |
| **R2-H-07** | S3 | Small use-and-access repairs: (a) pressing Enter in the date box does not open the date; (b) the English labels "Ang 504" and "Rahao · Ang 505" sit inside the Punjabi-marked line, so a screen reader would read them in a Punjabi voice 19 times and they are copied along with the Gurbani; (c) the refusal message says "pinned source fixture", which a reader will not understand; (d) the links called "pinned original-text witness" open third-party pages that also show a modern English translation — say so beside the link; (e) the skip link and home link are 27 px high; (f) with all text doubled, sideways scrolling appears at 320 and 390. | `evidence/h02_hukamnama_browser.json` | Fix (a)–(d) now; (e)–(f) with the next layout pass. |
| **R2-H-08** | S3 | The data file is checked byte for byte and the repository has no rule fixing line endings. On a Windows checkout that converts line endings the reader would refuse its own data (I reproduced the refusal with Windows line endings). | No `.gitattributes`; alteration test "Windows line endings" | Add a rule that this file is stored and checked out unchanged. |
| **R2-H-09** | — | **Observation that supports the design.** At about 05:40 in Amritsar on 26 November, SGPC's own page still showed 25 November's Mukhwak. The "not yet available" state is not an edge case: it is the normal condition for the first five to six hours of every Amritsar day. | Retrieval log, attempt 4 | The daily publisher must read the date printed on SGPC's page and compare it with the Amritsar date. It must never assume. |

---

## 2. PR #41 — Explorer and Ashtpadi 17 lesson (`dc66da9`)

### Overall

| Claim | Verdict |
|---|---|
| The Gurbani shown is exact and correctly placed | **PASS** — 9 of 9 opening lines exact and each is the first line of its unit; 9 of 9 Angs right, including the 285–286 turn in Pauri 5; the ਭਿ / ਭੀ note is correct |
| The teaching is sound | **NEEDS_REVISION** — nothing I read contradicts the lines, and the key terms are not flattened; but see R2-X-06 and R2-X-07 |
| Comparisons and sources | **NEEDS_REVISION** — R2-X-01, R2-X-08 |
| Finding and discovering | **NEEDS_REVISION** — R2-X-02, R2-X-03 |
| Private, additive, labelled as a draft | **PASS** — nothing leaves the device; the question is not kept; other readers' saved learning unchanged; 8 files added, none changed; not linked from home; "AI-assisted draft" is on screen |
| Layout and automated access checks | **PASS in emulation** — 0 violations in 12 of 12 states; no sideways scrolling at 8 of 8 widths; 27 of 27 keyboard stops show focus |
| Qualified human review; real devices | **INCOMPLETE** — not done by anyone yet |

### How I read the teaching

All nine units by hand, each against the ten lines of its own Pauri in the reference (two lines for the Salok). Every statement about a Pauri is carried by that Pauri's lines, or is marked as a caution or boundary. The lesson does not speak of "the poet", does not present Gurbani as treatment, keeps Naam, Hukam and Bibek as Sikh terms, and marks the Baba Sri Chand Ji account as contested later history. The psychology source exists and is what the lesson says it is (according to PubMed: Macri and Rogge, *Clinical Psychology Review*, 2024, [DOI](https://doi.org/10.1016/j.cpr.2024.102432)); the lesson claims no more than it supports. I know the two compared verses (Bhagavad Gita 2.16, Dhammapada 183) and the lesson describes them fairly; I did not open those two links.

What the lesson is **not**: it is an overview of each Pauri. It quotes 9 of the Ashtpadi's 82 lines. It is not a line-by-line meaning.

### Findings

| ID | Sev. | Finding | Evidence | What I recommend |
|---|---|---|---|---|
| **R2-X-01** | S2 | The source list still links to `dokumen.pub` for Nayar and Sandhu's book — a file-sharing copy of a book in copyright. The last commit moved the history note to the publisher's page but left this entry. | `lesson-17.json`, last bibliography entry; shown on screen under "Sources" | Point it at the publisher's page, as the note already does. Add a test with a short list of refused hosts. |
| **R2-X-02** | S2 | The finder shows unrelated passages as "a related written passage". It matches fragments of words: "car" → Pauri 4 (*care*), "war" → Pauri 1 (*awareness*), "art" → Pauri 2 (*heart*), "ant" → Pauri 8 (*sant*) and not Pauri 5, which is the Pauri of the ant. The single letter "a" matches. The Salok's first line typed in Roman letters goes to Pauri 8. "Japji Sahib" is answered with the Sukhmani Salok. "ਅਸਟਪਦੀ ੧੭" in Gurmukhi numerals is told no lesson exists. "Pauri 9" and "Pauri 0" show Pauri 1; "Pauri 12" shows Pauri 1. | `x02`, part B: 77 questions, each with what was shown and said | Match whole words. Accept Gurmukhi numerals. Say plainly when a Pauri number does not exist. Put these 77 questions in the builder's tests with the expected answer for each. |
| **R2-X-03** | S2 | A person who types words of distress gets nothing that points to a human being. "I want to die", "I am thinking of killing myself", "I am depressed" and "help me" get "we have not authored a lesson"; "I feel anxiety and cannot sleep" opens a Pauri and a psychology comparison. Nothing false is said, and the page does not offer Gurbani as treatment. But the page is silent at the one moment it should not be. | `x02`, part B | One fixed, reviewed sentence shown for such words, pointing to people who can help, and making no claim. The wording is for the owner and a qualified reviewer. |
| **R2-X-04** *(fixed on candidate PR #47 — see `retests/RT-003_PR47_LINKED_PASSAGE_VISIT.md`; still true of the published app)* | S2 | Following "Read the complete original" **replaces the person's saved place** in Sukhmani Sahib. A reader whose place was Ashtpadi 3, Pauri 1 came back with the place set to Ashtpadi 17. | `x02`, part G2: saved record before and after | Arriving by a link should be a visit. Keep the saved place until the person reads on, or offer "return to Ashtpadi 3". This is in the reader, so it belongs with the #40 repairs. |
| **R2-X-05** | S2 | The nine lines of Gurbani and 27 headwords in the lesson file are a second copy with no check. With one sign removed from the Salok line, the altered line was displayed as Gurbani. All **6 of 6** changes to content were displayed; only the 8 changes to the file's structure were refused. | `x02`, part F | Do not store the lines again. Draw each opening line from the reader's own checked text by its line identifier. That also honours "do not duplicate". |
| **R2-X-06** | S2 | Punjabi is first-level only. Each unit has one short Punjabi paragraph. The deeper teaching, the interpretation boundary, the reflection question, the comparisons and the history notes are English only. The file also contains a Punjabi introduction and a four-term glossary (Ang, Ashtpadi, Pauri, Salok) that are **never displayed**. | `x02`, part A: `punjabiIntroShownAnywhere: false`, `termsShownAnywhere: false` | Show the introduction and glossary. Decide whether full Punjabi depth is promised; if not, say "English, with a Punjabi summary". |
| **R2-X-07** | S3 | (a) Two headwords are listed under the wrong unit: ਸਤਿ under the Salok, whose word is ਸਚੁ; ਦਇਆ under Pauri 4, where it does not occur (it is in Pauri 3). 25 of 27 are right. (b) The Salok's teaching speaks of "Sat" without telling the learner that the Salok's own word is ਸਚੁ and that ਸਤਿ begins in Pauri 1. (c) Roman spellings are inconsistent: ਠਾਕੁਰ and ਢਾਕੈ are written without the dot used for ਟ and ਠ elsewhere, and ਤ੍ਰਿਪਤਾਨੇ is written with a dotted ṭ, which is the wrong sound. | `evidence/x01_lesson17_against_reference.json` | Correct the five entries. |
| **R2-X-08** | S3 | The Dhammapada source is titled "SuttaCentral" but links to another site's 2016 copy. | `lesson-17.json` | Link SuttaCentral itself, or name the site truthfully. |
| **R2-X-09** | S3 | A mangled link (address ending `#%`) hides the whole lesson and says "The teaching file did not load", which is not what happened. | `x02`, part E | Ignore an unreadable fragment and open the Salok. |
| **R2-X-10** | S3 | (a) A printed lesson leaves out the comparisons and the sources. (b) The label "EDUCATIONAL DRAFT" is 10 px; other labels are 9–11 px. (c) When the lesson file fails, "Find teaching" and the suggestion buttons stay active and do nothing. | `x02`, parts A, F, J | Print the sources. Raise the smallest text. Disable or explain the dead buttons. |

---

## 3. PR #42 — the build order (`16a4846`), a document

**Overall: sound and worth building to. NEEDS_REVISION in four places.** Every rule in the owner's assignment is carried (no random or earlier substitution; event separate from Shabad; no AI recitation; no invented or borrowed timings; permission before any use of a recording; no contact with custodians without authority; no live generated interpretation; free, private, no tracking). The counts the owner asked to keep apart are kept apart.

| ID | Sev. | Correction | Why |
|---|---|---|---|
| **R2-P-01** | S2 | Give each phase (B to F) one exit test that can fail. | Section 7 describes the phases; only G lists things to test. A phase without a failing-capable test cannot be called finished. Suggested tests are in `03_BUILD_ORDER_CORRECTIONS.md`. |
| **R2-P-02** | S2 | Decide who approves each day before it is public, and write it down, before the daily publisher is built. | A publisher that commits to `main` every morning **is** automatic public deployment, which the owner has ruled out. The plan says "manual/independent editorial approval" but not who, or what happens on a day nobody approves. This one needs the owner. |
| **R2-P-03** | S2 | The adapter must take the Gurmukhi and nothing else. | SGPC's page also carries a Punjabi explanation and an English translation. Those are modern works by other hands; SGPC's "©" on the page does not give us the right to reuse them. A field allow-list, tested, keeps them out. |
| **R2-P-04** | S3 | Name the risks the plan leaves out — fifteen are listed in `03_BUILD_ORDER_CORRECTIONS.md`. | Among them: three SGPC hosts with undated, replaceable file names; older font encodings that must never be "repaired" silently; calendar fields that shift from year to year and must be copied, never computed; the editorial load of a three-level bilingual lesson for every new Shabad; who holds the key if a manifest is "signed"; what the reader sees when SGPC corrects a published day; Sangrand and evening readings being mistaken for the morning Mukhwak. |

---

## 4. The Salok Mahalla 9 draft — recovered

It exists and is not lost. Branch `feature/glp-sukhmani-salok9-source-intake-20261027`, commit `d0dc1f2` (27 October 2026), file `study/sources/salok-mahala9-shabados-487-candidate.json`. It has no pull request, and its history is separate from `main`, which is why it was not visible.

| | |
|---|---|
| Extent | 117 rows: the invocation, the title and 57 Saloks, Ang 1426–1429. The reference also has 117 lines, from the same first line to the same last line (`॥੫੭॥੧॥`). Complete. |
| Teaching | Draft study notes for Saloks 12 and 56 only. The other 55 are unwritten, and the file says so. |
| **R2-K-01 · S1** | **The stored Gurmukhi carries pause marks inside the lines** — 204 marks (`;` `.` `,`) in 114 of the 117 rows. They come from the older database as reading aids. They are not part of the text of Sri Guru Granth Sahib Ji. As stored, **3 of 117** rows equal the reference; with the marks removed, **117 of 117** do. |
| What to do | Do not rebuild it. Take the text from the same pinned source the Sukhmani reader uses, or strip the marks and re-collate (117 of 117 expected). If pause marks are wanted later, they are a separate, labelled, reviewed Santhiya layer — never inside the scripture line. Do not show the file as it stands. |

Evidence: `evidence/k01_salok9_recovered_draft.json`.

---

## 5. PR #40 — first repairs

Head unchanged (`09e829e`) since my re-test RT-001. No reply and no new commit, so there is nothing new to test. The four asks in `retests/RT-001_PR40_FIRST_REPAIRS.md` stand. R2-X-04 above (a link replacing the saved place) is a fifth item for the same reader.

---

## 6. What none of this establishes

- No physical iPhone, iPad, Android device, Safari, VoiceOver or TalkBack result.
- No qualified human has reviewed any Gurbani text, meaning, comparison or Punjabi here. My reading of the Punjabi is an AI system's reading.
- The reference is one digital source. Nothing has been collated against print.
- For 14 October 2025 and 25 November 2017 I have not seen SGPC's own page.
- I opened the PubMed record; the other outside sources in the lesson were not opened by me.

## 7. Files

`tools/` — `h01` text against the reference · `h02` reader in the browser · `h03` offline worker · `x01` lesson against the reference · `x02` Explorer in the browser · `k01` Salok Mahalla 9 draft.
`evidence/` — one JSON result per script, the source retrieval log, two print PDFs, 13 screenshots.
