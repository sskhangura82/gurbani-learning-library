# RT-002 · Re-test of the second repairs (candidate PR #40)

| | |
|---|---|
| Role | Independent second reviewer. I did not write this candidate and I have not changed it. |
| Asked by | The owner, in chat, 26 November 2026; and the builder (ChatGPT), in a note on PR #40 the same day |
| Candidate | PR #40, head `1470477b5a27a8f975f1efce74443a0e136aa94e` — draft, unmerged |
| Compared with | The published version `a3476ac`, and the first candidate `09e829e` |
| Date | 26 November 2026 (UTC) |
| How | All versions served from this reviewer's own machine. Chromium in phone emulation. Every note and saved line used is made-up test text |
| Not done | No iPhone, no Safari, no VoiceOver, no printed page, no real reader. No WebKit engine was available in this session. Nothing here is a device result |
| Order of work | Criteria written before I had seen any of the candidate (`RT-002_FROZEN_CRITERIA_BEFORE_SECOND_REPAIRS.md`, with a correction about their timing). Then my own tests and the verdicts below. **Sections 1 to 6 were committed before I opened the builder's tests, test reports or hand-off note.** Section 7 was added afterwards |

Words used here. **Published** = what the public site serves today. **Candidate** = PR #40 at `1470477`. **Fixed**
always means *fixed on the candidate, in emulation* — the public app has not changed.

---

## 1. The answer

The candidate claims five repairs. **Three are fixed, two are partly fixed, and nothing that worked before is
broken.** Two further items on the owner's list were not attempted in this candidate, as the builder said.

| Finding | Verdict | In one line |
|---|---|---|
| **RT1-01** (high) — kept-aside notes destroyed by an older copy | **Fixed** | All three made-up items survive both routes, with either older version, and come back through export and import |
| **CI-R-09** — the notice could not be seen | **Fixed** | Visible and tappable in 36 of 36 combinations of width, mode, text size and guide |
| **CI-R-11** — reading place moved back | **Fixed** | Same line every time: 4 of 4 ways of reopening; 36 of 36 further combinations |
| **CI-U-11** — notes listed nowhere | **Partly fixed** | Every line with a note is now listed. Tapping it goes to the line; it does not open the note |
| **CI-R-08** — no way back after a failed check | **Partly fixed** | The backup half is fixed. The reader still cannot recover from a damaged offline copy |
| **CI-S-16** (high) — three words outside the readers | Not attempted | The files are unchanged |
| **R2-X-04** — a link replaces the saved place | Not attempted | Still happens |

No Gurbani and no teaching text was changed: the data files are byte-identical to the first candidate, and 3,809 of
3,809 rows on screen match the register.

**Overall: INCOMPLETE as a release candidate — and fit to be staged for the phone check.** Incomplete, because one
high item on the owner's list (CI-S-16) is untouched and the recovery half of CI-R-08 remains. Fit to stage, because
what it does claim holds up, and the phone check does not need to wait for the rest. One condition on staging is in
section 3.

## 2. Item by item

### RT1-01 — fixed

Kept-aside items now also live in a second stored record, which older copies of the reader never touch.

| Check | Result |
|---|---|
| a. Rollback and old tab, older copy = the published reader | 3 of 3 items in storage and shown after rolling forward, on both routes. During the rollback they sit untouched in the second record |
| b. The same, older copy = the first candidate | 3 of 3, both routes |
| c. Export, empty the browser, import | All three come back, the 12,500-character note complete |
| d. Same backup three times, then three more rounds of old copy / new copy | The count never grew |
| e. An ordinary note written in the old tab | Still there |
| f. The second record made unreadable in 10 ways | 10 of 10: Gurbani shown, both records left exactly as they were, a visible notice, export produces a file holding the damaged record as it was |
| g. The browser refuses to store | Visible notice; the main record is not damaged; export still works |
| h. Export and import | The export holds the kept-aside items. **The import does not say how many it will bring** (RT2-02) |
| i. Removal | There is no control that removes a kept-aside note — see RT2-01 |
| j. Both tests in the quality gate | Section 7 |

The unchanged RT-001 script, which looks only at the main record, agrees: after rolling forward it finds two notes
and one saved line kept aside where RT-001 found none.

Evidence: `RT-002/evidence/rt1_01_older_copy_all_storage.json`, `rt1_01_cir08_damaged_records_and_export.json`,
`r02_older_copy_of_reader__unchanged_script.json`, `r02_saved_learning__unchanged_script.json`.

### CI-R-09 — fixed

| Check | Result |
|---|---|
| a. The RT-001 scripts, unchanged | Visible and tappable in 9 of 9 measured moments across three return situations (RT-001: 0 of 9). It stays on screen, and a tap 1.5 seconds after opening works |
| b. 3 widths × Read, Meaning, Study × normal and largest text × guide off and running | **36 of 36**: whole notice inside the screen, button at least 44 pixels each way, tap reaches it, no text cut off |
| c. Tapping it | Opens Saved learning, where the kept-aside items are listed |
| d. What a screen reader is given | A region named "Saved learning recovery", a status message, a button "View saved learning" — from the browser's accessibility tree, not VoiceOver |
| e. Under the test copy's banner | **Covered** — see section 3 |

The line being read is kept clear of the notice: 0 of 12 overlaps after a jump, two reloads and Back.

Two things to know, neither a reason to hold the verdict: the notice takes 9 to 14 per cent of the screen's height,
and it cannot be dismissed (RT2-01).

Evidence: `r09_notice_visibility__unchanged_script.json`, `r09_notice_timeline__unchanged_script.json`,
`r09_notice_click_at_once_or_later__unchanged_script.json`, `cir09_notice_extras.json`, `cir11_place_extras.json`.

### CI-R-11 — fixed

| Check | Result |
|---|---|
| a. The preparation script, unchanged | Same line every time in 4 of 4 ways of reopening (it was 2 of 4) |
| b. Pauri 5, 20, 38 × Read, Meaning, Study × 320 and 390 wide × normal and largest text; two reloads and Back | **36 of 36** same line, same stored place |
| b2. With the notice showing | 12 of 12 |
| c. When the place is written | One write, half a second after opening, keeping the same place |
| d. Sukhmani and Nitnem readers, reloaded twice | Behave exactly as on the published version |
| e. A WebKit engine | **Could not be tested** — none available in this session |
| f. iPhone | **Not done** — step A7 of the phone script |

Evidence: `r11_saved_place_on_reopen__unchanged_script.json`, `cir11_place_extras.json`.

### CI-U-11 — partly fixed

The fault as titled is gone: a note on a line that was never saved is listed, marked "Reflection"; a line with both
is listed once, marked "Saved line · Reflection"; the list follows the order of the Bani; with nothing saved the
screen says "No saved lines or reflections yet."; 200 made-up notes list in about a second, scroll, and do not spill
sideways; an emptied note leaves the list; nothing of a note leaves the site.

What keeps this at "partly": the acceptance test I froze also said *tapping it opens the note*. Tapping goes to the
line and closes the panel; the note is two more taps away, and the list does not show its first words. Small, and
tracked as RT2-03.

Evidence: `ciu11_saved_list_extras.json`, `u11_journey_rehearsal__unchanged_script.json`.

### CI-R-08 — partly fixed

**The backup half — fixed.** On the refusal screen, in both readers, reopened online, reloaded, and with the network
off: no Gurbani shown; a button "Export original learning", 161 × 44 pixels, inside the screen and reachable; a file
arrives at once; it holds the saved records exactly; storage is untouched — **6 of 6**. With the saved record damaged
in 10 ways, and the second record damaged in 10 ways, export produced a file every time and never hung — **20 of
20**. The screen no longer advises a reload that cannot work. The refusal itself is as strict as before: 21 of 21
alterations refused in each reader.

**The recovery half — not fixed.** With a damaged offline copy and the network on, the reader does not recover by
itself or with one press: it fails when reopened, fails when reloaded, and fails after the app's own update check.
Only a later release repairs it. The screen now tells the person what not to do — do not clear website data, do not
remove the app — but not what to do next.

Evidence: `cir08_refusal_screen_export.json`, `rt1_01_cir08_damaged_records_and_export.json`,
`r08_damaged_offline_copy__unchanged_script.json`, `r01_tamper_21_variants__unchanged_script.json`.

### CI-S-16 and R2-X-04 — not attempted in this candidate

- **CI-S-16.** The four files that hold the 31 lines outside the readers are unchanged, so the two lines differ from
  the reference exactly as before.
- **R2-X-04.** A reader whose place is Ashtpadi 3 opens Sukhmani Sahib by a link to Ashtpadi 17: the saved place
  becomes Ashtpadi 17 on arrival and stays so. The only way back offered is "Return to the beginning".

Evidence: `items_not_claimed_r2x04_cis16.json`.

## 3. One condition before this is staged for the phone

**The test banner must come off the top of the reader first.** With the candidate staged locally the way the test
repository stages it — the same banner, the same style sheet — the repaired notice lies entirely under the banner at
all three phone widths, and a tap on its button does not reach it. The owner would look for the repair on his phone
and not find it. This is the banner's fault, not the candidate's (TC-01 in
`device-test/TEST_COPY_VERIFICATION_20261126.md`), and it now matters more than it did this morning.

## 4. Noticed on the way — candidate only, kept out of the main register

| # | What | Suggested |
|---|---|---|
| **RT2-01** (medium) | **The notice can never be dismissed, and a kept-aside note can never be removed.** Once one stray note exists, a bar of 62 to 81 pixels stays at the top of the reader for good. And a note a person wants gone cannot be deleted from inside the app — on a shared device others can read it. | Let the reader put the notice away once the items have been viewed; bring it back only when something new is kept aside. Allow a kept-aside item to be removed, after offering export. |
| RT2-02 (low) | The import asks "Merge this learning backup?" without saying how many notes, saved lines and kept-aside items the file holds. | Say the three counts before merging. |
| RT2-03 (low) | In Saved learning, tapping a line that has a note goes to the line; the note itself is two taps further, and the list does not show its first words. | Show the first words; open the note on tap. |
| RT2-04 (low) | When the browser cannot store anything, the reader says "Saved learning needs recovery". Nothing is damaged; it simply could not save. | "This browser could not save. Your earlier notes are unchanged. Export a backup." |
| RT2-05 (low) | On a refusal screen each reader exports only its own notes — the Japji file has no Sukhmani or Nitnem notes, and the reverse. The screen does not say so. | Say which notes the file holds, or export all three. |
| RT2-06 (trivial) | An emptied note leaves an empty entry in the stored record. | Remove the entry. |

Listed in `RT-002/candidate_findings.json`.

## 5. Everything that passed before

| Check | Result |
|---|---|
| Gurbani and teaching files | 0 changed between the two candidates |
| Rows on screen against the register | 3,809 of 3,809, in order |
| Altered scripture refused | 21 of 21, in each of two readers; saved learning untouched 21 of 21 |
| Meanings named for screen readers | 3,773 of 3,773, identical to RT-001 state by state |
| Update from the published version | Offered, waits to be loaded, 4 of 4 saved records unchanged by it |
| Offline | Every composition opens with the network off; Japji and Sukhmani verify |
| A broken release | Refused; the working copy keeps running |
| A damaged offline copy, then a later release | Repaired by the later release; made-up notes still present |
| Records the reader cannot place or read (RT-001 set) | Nothing dropped, nothing cut, backup exact — as in RT-001, and the notice is now on screen |
| Disclosures | As in RT-001 |
| Addresses contacted in every run | Only this machine |
| Names of what the app stores | One new name, the second record for kept-aside notes; it is in the export |
| Offline list | 57 entries, 57 fingerprints match |

## 6. What this does not establish

- Nothing about an iPhone, Safari or VoiceOver. RT1-02 — one real-device check before release — stands.
- Nothing about a WebKit engine: none was available today, so the one WebKit run of RT-001 was not repeated.
- Nothing about print. CI-S-16 cannot be closed without a printed page.
- Nothing about whether the teaching is right. Two AI systems agreeing is not a qualified review.
- A verdict of "fixed" here is not a release decision.

Notes on my own method. The criteria were committed about ninety seconds after the candidate was pushed, not before
— I did not know, and the criteria file says so. One measurement in my notice script was confounded by my own
scrolling and reported a line as covered when it was not; I removed it and measured that properly elsewhere (0 of
12). Two of my scripts first looked in the wrong place for the kept-aside list and for the storage setter; both were
corrected and rerun before any figure here was taken.

## 7. Comparison with the builder's tests

*To be added after sections 1 to 6 are committed.*
