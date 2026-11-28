# 00 · Baseline and frozen review criteria

**Reviewer:** Claude (Anthropic), independent second reviewer for GLP-001
**Frozen:** 2026-11-25, before any file under `tests/` was opened and before any
`evidence/*.json` or prior review document was read. The commit that adds this file is the
freeze point. Later changes to this file are append-only and dated.

This file exists so that anyone can check that my criteria were written **before** I
looked at the builder's own tests, and were not bent afterwards to fit what I found.

What I had already seen when I wrote it: `README.md`; the markup of `index.html` and
`nitnem/index.html`; the names and sizes of all files in the repository (including test
and evidence file *names*); the shape of the shipped scripture data files, which carry
the builder's own source notes inside them; and GitHub's records for PR #37, the quality
run and the Pages deployment. Nothing else.

---

## 1. Exact version under review

| Item | Value | How I know |
|---|---|---|
| Repository | `sskhangura82/gurbani-learning-library` (public) | cloned 2026-11-25 |
| Branch / commit | `main` @ `a3476ac4b9be90dde350fb35dd13ce0b672c120d` | `git rev-parse HEAD` on a fresh clone |
| Commit date | 2026-11-25 05:58:47 −0800 | `git log -1` |
| Release PR | #37, merged 2026-11-25T13:58:48Z, 53 files, +91,276 / −22 | GitHub REST API |
| Tested commit | PR head `7c0273174d5f8788495398422928b9e8c2838cec` | Actions run 45628466334 (`GLP Reader Quality Gate`, conclusion `success`) |
| Tested tree = released tree? | **Yes.** Both commits point at tree `8d097de175c7f3c74eaa95e2f9a0c2311b1d4541` | GitHub REST `git/commits` for both SHAs |
| Public deployment | GitHub Pages deployment `8059611312`, ref `main`, sha `a3476ac…`, status `success` at 2026-11-25T13:59:22Z | GitHub REST `deployments` + `statuses` |
| Changed since recorded release? | **No.** `main` HEAD equals the recorded release commit | same as above |
| File manifest | 229 tracked files, SHA-256 each | `evidence/baseline-sha256.txt` |

**Limits of this baseline (stated, not hidden):**

- I could not fetch `sskhangura82.github.io` from my review environment (its network
  allows GitHub and package registries only). "The public site serves commit `a3476ac`"
  therefore rests on GitHub's own deployment record, not on my byte-for-byte download of
  the live files. A byte-level live check is listed as outstanding (OV-01).
- All hands-on application testing below is done on the **repository content at
  `a3476ac`, served locally** over `http://127.0.0.1`. That is the same content GitHub
  Pages was told to deploy, but it is not the same origin, TLS setup or CDN.

## 2. Evidence classes used in every deliverable

| Tag | Meaning |
|---|---|
| **[V]** | Independently verified by me in this review (command, script or observation is named) |
| **[R]** | Previously reported by the builder (README, docs, evidence files); not re-verified |
| **[I]** | My interpretation or judgement |
| **[A]** | Assumption I had to make |
| **[Q]** | Unresolved question |
| **[REC]** | Recommendation |

Kinds of testing are kept apart: *static inspection*, *scripted check*, *headless-browser
emulation (Chromium)*, *physical device*. I have no physical iPhone, no Safari/WebKit, and
no VoiceOver in this environment. Nothing in this review may be read as physical-device
testing.

## 3. Promise inventory (what the app itself says it does)

Taken only from public text a user or visitor can read: `README.md`, `index.html`,
`nitnem/index.html`. Each promise becomes something to test.

| ID | Promise (paraphrased) | Source |
|---|---|---|
| P-01 | No account needed | README, home footer |
| P-02 | All seven Nitnem banis and all 24 Ashtpadis of Sukhmani Sahib, in original Gurmukhi | README, home |
| P-03 | Jaap 199 chhands · Savaiye 10 · Chaupai 25 + four clearly marked additional · Anand 40 pauris · Rehras six-part selection · Sohila five shabads | README, Nitnem page |
| P-04 | Six added readers hold 1,361 source records, 1,361 English/Punjabi meaning pairs, 327 passage Study drafts | README |
| P-05 | Japji: 38 pauris + Mool Mantar + Saloks, 385 source occurrences, 385 meaning drafts, 42 Study drafts | README |
| P-06 | Sukhmani: 24 saloks, 192 pauris, the Rahau, Ang 262–296, 2,027 source occurrences, 217 passage studies | README |
| P-07 | Read, Meaning and Study show the same Gurmukhi | README |
| P-08 | Continuous and one-passage layouts; silent visual guide; Light/Dark; adjustable size | README, Nitnem page |
| P-09 | Saved position, bookmarks, private reflections, backup export/import | README, Nitnem page |
| P-10 | Import merges; old backups stay compatible; unknown or damaged saved records are preserved | README |
| P-11 | Whole library available offline; an update waits for an explicit action | README |
| P-12 | Every source record is checked against its stored hash | README |
| P-13 | Scripture, lessons and saved learning are separate structures; Gurmukhi is never changed to fit a translation | README |
| P-14 | Reflections are not uploaded; no ads, streaks or scores | README, home footer |
| P-15 | Explanations are labelled educational drafts awaiting qualified human review | home, Nitnem page |
| P-16 | "Each explanation carries its own source and review status" | home |
| P-17 | No AI voice, synthetic recitation or unlicensed photo | README |
| P-18 | Installable on the iPhone Home Screen | home footer, Reading tools |
| P-19 | Chaupai and Rehras boundaries differ between traditions and this is disclosed | Nitnem page |
| P-20 | Gurdwara pages: verified summaries, local time, official outgoing broadcast links | README |

## 4. Test cases (written before running any of them)

Pass/fail is defined here. "N/T" = not testable in my environment; it is then carried as
an outstanding verification, never scored as a pass.

### 4.1 Scripture — original Gurbani (highest priority)

| ID | Test | Pass condition |
|---|---|---|
| S-01 | Build a register of **every** original-Gurbani occurrence the app serves (lines, prefaces, headings), from the shipped runtime files | Register count equals the app's declared counts; the denominator for all later coverage is this register |
| S-02 | Recompute SHA-256 of each stored text and compare with its stored hash | 100% match |
| S-03 | Unicode hygiene on every occurrence: NFC-stable; code points limited to Gurmukhi block, space, danda/double danda; no private-use, Latin, zero-width, non-breaking or doubled spaces; no leading/trailing space | 0 violations, or each violation explained |
| S-04 | Mark-order validity: shape every distinct word with a real text-shaping engine (HarfBuzz) and at least two Gurmukhi fonts; record any word where the engine inserts a dotted circle or leaves a missing glyph | 0 broken clusters |
| S-05 | Collation A: compare every occurrence with the Shabad OS Database (v5.0.0-next.0) primary Gurmukhi, in sequence, after removing that database's pause marks | Every occurrence classified: exact · spacing only · line-division only · letter-level difference · no counterpart. Every letter-level difference listed individually |
| S-06 | Collation B: for each letter-level difference, and for Dasam Bani generally, consult a further witness (BaniDB, SriGranth, printed SGPC editions where a readable copy can be reached) | Each difference ends with a provenance note and a status: app agrees with majority · app is alone · witnesses split |
| S-07 | Structure: unit counts; verse-number sequences (॥੧॥ …) continuous with no gap or repeat; chhand, salok, pauri, ashtpadi boundaries | Counts as promised in P-03/05/06; no unexplained gap or repeat |
| S-08 | Ang references: every Sri Guru Granth Sahib line's Ang equals the reference | 100% match, differences at page turns explained |
| S-09 | Headings and attribution: Raag/Mahalla headings and Dasam chhand headings present, in place, and never presented as verse | No missing or misplaced heading |
| S-10 | Rehras and Chaupai boundaries compared with the SGPC Sikh Rehat Maryada wording, and other living traditions named | Boundaries match what the app says it follows, and the app says it clearly |
| S-11 | Rendered fidelity: text in the page (DOM) equals the data, in Read, Meaning and Study | 100% of rendered lines equal data for each mode, for every composition |
| S-12 | Provenance and licence trail: each composition names an edition someone else can open; third-party notices kept | Complete and openable |

### 4.2 Meanings and teaching

| ID | Test | Pass condition |
|---|---|---|
| M-01 | Coverage and binding: each source line has exactly one English and one Punjabi meaning bound to that line's ID | 100%; no orphan, no duplicate binding |
| M-02 | Shift check: meaning actually belongs to its own line (not the neighbour) | 0 shifted in a full scripted screen + manual sample |
| M-03 | Language hygiene: Punjabi field is Gurmukhi-script modern Punjabi, English field is English; no placeholder text | 0 violations |
| M-04 | Repetition: share of meanings that are exact or near duplicates of another line's meaning where the Gurmukhi differs; share of boilerplate sentences in Study | Reported with exact counts; judged in context |
| M-05 | Fidelity: line-by-line reading of meanings against the Gurmukhi, with Prof. Sahib Singh's Darpan (for Sri Guru Granth Sahib) and Dr. Rattan Singh Jaggi's rendering (for Dasam Bani) as comparison aids | Exact numerator/denominator of lines I actually read; every material problem logged with ID |
| M-06 | Core concepts — Naam, Hukam, Haumai, Shabad, Maya, Sahaj, Gurmukh, Manmukh, Sant, Saadh, Brahm Giani, Satguru, Nadar, Kirpa, Jot, Nirgun, Sargun: how each occurrence is rendered | Not flattened into a single Western word; rendering consistent or the variation justified |
| M-07 | Separation: translation, explanation and reflection are visibly distinct; drafts are labelled; no voice-of-the-Guru claims | Holds on every screen type |
| M-08 | Transliteration: labelled approximate; one consistent scheme | Holds |
| M-09 | Study drafts: coverage, structure, English/Punjabi parity, and **every cross-reference checked** (does the cited verse exist, is it quoted exactly, is the Ang right) | Exact counts; 0 wrong citations |
| M-10 | Imported ideas: modern psychological, scientific or other-tradition concepts presented as the literal meaning | 0 unlabelled instances in the reviewed set |

### 4.3 Learning design

| ID | Test | Pass condition |
|---|---|---|
| E-01 | Map what exists today onto the six levels (Read · Understand · Word-by-word · Deep Study · Cross-scripture · Reflection) | Honest present/partial/absent per level per composition |
| E-02 | Word-level help: is a word explained in its grammatical and scriptural context, with sourced origin | Present / partial / absent, with counts |
| E-03 | Revisit loop: can a learner save a word or passage and meet it again later | Present / absent |
| E-04 | No game mechanics: no streak, score, leaderboard, engagement nudges | 0 found in code and UI |

### 4.4 Use, as ten kinds of reader

Simulated personas only — no real participant is claimed. Tasks, run at a 390×844 phone
viewport unless stated; I count taps from a cold open of the home page.

| ID | Task | Pass condition |
|---|---|---|
| U-01 | Regular Nitnem reader: open the app and be reading Japji Sahib | ≤ 2 taps; Gurbani visible without study furniture |
| U-02 | Same reader: open Jaap Sahib and read it straight through | ≤ 3 taps; whole bani scrolls continuously |
| U-03 | Return tomorrow: reopen and continue where I stopped | ≤ 2 taps; lands on the same line |
| U-04 | Learner: from a line I am reading, see its meaning, then return to the same line | ≤ 2 taps each way; place kept |
| U-05 | Student: open deeper Study for the passage I am in | ≤ 2 taps; place kept |
| U-06 | Go to a specific place (Japji Pauri 20; Jaap Chhand 150; Sukhmani Ashtpadi 12 Pauri 3) | ≤ 4 taps each |
| U-07 | Elderly reader: make Gurmukhi much larger and keep it | ≤ 3 taps; persists after reload; no clipped or overlapping text at maximum |
| U-08 | Night reader: switch to Dark and back | ≤ 2 taps; persists |
| U-09 | Save a line; find it again later | Discoverable without instructions; ≤ 3 taps to save |
| U-10 | Write a private reflection; reload; it is still there | Persists; clearly marked private |
| U-11 | Start, pause and re-pace the silent guide | Controls self-explanatory; speed labelled in words a family understands |
| U-12 | Export a backup; clear the browser; import; everything returns | Round trip is lossless |
| U-13 | Read with no connection after one online visit | Every composition opens offline |
| U-14 | Beginner / child with parent: understand what the three depths are without help | Labels self-explanatory at first sight |
| U-15 | Find where the text comes from and what "draft" means | ≤ 3 taps from any reader |
| U-16 | Rotate the phone | Layout holds in landscape |
| U-17 | Consistency: the three readers (Japji, Nitnem six, Sukhmani) behave the same way | Same controls, names and positions, or the difference is purposeful |

### 4.5 Accessibility (WCAG 2.2 AA)

| ID | Test | Pass condition |
|---|---|---|
| A-01 | Automated rule scan (axe-core) of each page and each main state, Light and Dark | 0 serious/critical violations |
| A-02 | Contrast of Gurbani, meanings, small labels and controls in both themes | ≥ 4.5:1 text, ≥ 3:1 large text and control boundaries |
| A-03 | Target size | ≥ 24×24 CSS px (2.5.8); I also report how many are under 44×44 |
| A-04 | Keyboard: reach and operate everything; visible focus; dialogs trap and release focus; Escape closes | Holds |
| A-05 | Language tagging: Gurmukhi runs carry `lang="pa"` so a screen reader can switch voice | Holds for Gurbani and Punjabi meanings |
| A-06 | Zoom and reflow: pinch-zoom not blocked; 200% text; 320 px width with no horizontal scroll | Holds |
| A-07 | Reduced motion respected by the moving guide and transitions | Holds |
| A-08 | Names, roles, states of custom controls; status messages announced | Holds |
| A-09 | Screen reader on a real device (VoiceOver, TalkBack) | **N/T here** → outstanding |

### 4.6 Reliability, offline, data safety

Synthetic data only. No real user's notes are touched.

| ID | Test | Pass condition |
|---|---|---|
| R-01 | Offline completeness: every file each page needs is in the offline cache list, with matching hash | 100% |
| R-02 | Update safety: a new version waits; old version keeps working until the user accepts | Holds |
| R-03 | Failed update: new version partly unavailable (one file 404 / truncated) | Old version stays intact and usable |
| R-04 | Corrupted scripture package: alter one character / remove one line / truncate a data file | App refuses or warns; it must **not** silently show altered text as valid |
| R-05 | Console and network: no script errors and no request to any other origin during all flows | 0 errors, 0 third-party requests |
| R-06 | Weight: bytes and requests for first open and for each reader; time to first Gurbani on a slow connection profile | Reported; judged against a family phone on mobile data |
| D-01 | Saved learning survives reload, navigation between readers, and browser restart | Holds |
| D-02 | Saved learning survives an app update | Holds |
| D-03 | Hostile import: script in a note, wrong types, huge file, prototype keys, wrong composition, not-JSON | No script runs; app does not crash; existing data untouched on failure |
| D-04 | Import merge: same line with a different note; older vs newer; duplicates | Nothing silently overwritten or duplicated without reason |
| D-05 | Two tabs open: save a different note in each | Neither note is lost without warning |
| D-06 | Storage refuses to write (full / blocked) | User is told; nothing is silently dropped |
| D-07 | Export → wipe → import is byte-equivalent for notes, bookmarks, position | Lossless |
| D-08 | Platform eviction: Safari's seven-day storage rule for sites not added to the Home Screen | **N/T here**; I check whether the app explains the risk and prompts for backup |

### 4.7 Privacy, integrity, licence

| ID | Test | Pass condition |
|---|---|---|
| PV-01 | Network log of full sessions | Only same-origin requests |
| PV-02 | Content-Security-Policy on every page; no inline script/style needed; no `unsafe-*` | Holds on every HTML file |
| PV-03 | No cookies, analytics, fingerprinting, remote fonts | 0 |
| PV-04 | User-written text is never inserted as HTML | Holds in code and in D-03 |
| PV-05 | Outgoing links are marked as leaving the app and cannot reach back (`noopener`) | Holds |
| PV-06 | Repository hygiene: no secrets, no personal data, no real reflections | 0 |
| PV-07 | Licence: the project's own licence, and the licences/notices of every third-party text, font or code it carries | Present and consistent with "free to use" |

## 5. Severity scale

| Level | Definition | Effect |
|---|---|---|
| **S0 Critical** | A displayed Gurbani letter, word, line, order or attribution is wrong against every witness consulted; a verse is missing or duplicated; private reflections leave the device; saved learning is lost in ordinary use | Overrides any score. No release approval while open |
| **S1 High** | Gurbani renders broken for some readers; a meaning reverses or materially misstates the verse; a promise in §3 is false; an accessibility barrier blocks a whole group | Must be fixed or publicly disclosed before the next release |
| **S2 Medium** | Weakens trust or learning but has a workaround: unclear labels, inconsistent behaviour between readers, shallow or repeated teaching, gaps in disclosure | Scheduled |
| **S3 Low** | Polish, maintainability, optional improvement | Backlog |

## 6. Scorecard rubric (defined before scoring)

Each category is scored 0–4, then weighted with the weights in the assignment. A category
score is capped by how much of it I actually examined: **score counted = score × evidence
coverage**, where coverage is the share of that category's test cases that reached a
verdict on real evidence. Untested is never a pass.

| Score | Meaning |
|---|---|
| 0 | Absent, or a critical defect is open |
| 1 | Present but with high-severity defects or mostly unverified |
| 2 | Works for the main case; several medium defects; partly verified |
| 3 | Sound; only low-severity defects; verified on the evidence available without qualified human review |
| 4 | Sound **and** externally validated (qualified Sikh scholarly review for scripture and meaning; real-device and real-user evidence for use and accessibility) |

Consequence, stated in advance: until qualified human collation and scholarly review
exist, scripture and interpretation **cannot score above 3**, whatever the digital checks
show. Until physical-device and real-reader evidence exists, user experience and
accessibility cannot score above 3.

| Category | Weight | Scored from test cases |
|---|---|---|
| Original Gurbani accuracy and provenance | 25% | S-01 … S-12 |
| Interpretation and theological fidelity | 20% | M-01 … M-10 |
| Educational depth and effectiveness | 20% | E-01 … E-04, M-09 |
| User experience and ease of use | 15% | U-01 … U-17 |
| Accessibility and language support | 8% | A-01 … A-09 |
| Reliability and offline functionality | 7% | R-01 … R-06, D-01 … D-08 |
| Privacy and spiritual integrity | 5% | PV-01 … PV-07, E-04 |

**Gate rule:** any open S0 means the verdict is "not approved", regardless of the number.

**Internal vs market:** the number is our own quality score against this rubric. It says
nothing about being better than another app. A comparative claim needs the same test
cases run on the other app, and is made only feature by feature where that was done.

## 7. Order of work

1. Freeze this file (this commit).
2. First use as a new reader; record findings (separate commit) — still without opening `tests/`.
3. Scripture audit, then meanings, then technical and privacy tests.
4. Only then read the builder's tests, evidence files and earlier reviews, and compare.
5. Improvement work is a separate, later phase on separate branches. Nothing in the app
   is changed by this review branch; it adds files under `reviews/claude-independent/` only.
