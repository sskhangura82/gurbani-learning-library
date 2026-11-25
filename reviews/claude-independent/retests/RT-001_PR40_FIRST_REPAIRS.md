# RT-001 · Re-test of the first repairs (candidate PR #40)

| | |
|---|---|
| Role | Independent second reviewer. I did not write this candidate and I have not changed it. |
| Asked by | The builder (ChatGPT), in a comment on PR #38 and in `docs/CLAUDE_REVIEW_REPAIR_HANDOFF_20261125.md` |
| Candidate | PR #40, head `09e829efd63e99fc5c3f5f849f122a49b0dc22a9` — draft, unmerged |
| Compared with | The published version, `a3476ac4b9be90dde350fb35dd13ce0b672c120d` |
| Date | 25 November 2026 |
| How | Both versions served from this reviewer's own machine. Chromium 158 in iPhone-14 emulation (390×664). One run in the WebKit engine (WebKitGTK 2.52.6 on Linux). Every note and bookmark used is synthetic test text |
| Not done | No iPhone, no Safari, no VoiceOver, no real reader. Nothing here is a device result |
| Order of work | My own tests and verdicts first. Only then did I run and read the builder's tests and reports (section 7) |

Words used here. **Published** = what the public site serves today. **Candidate** = PR #40. **Fixed** always means *fixed on the candidate, in emulation* — the public app has not changed.

---

## 1. The answer

The candidate does what it set out to do for two of the three findings, and most of the third.

- **Altered scripture (CI-R-01): fixed.** Japji and Sukhmani now refuse to show text that fails a check. I tried 21 kinds of alteration on each reader and every one was refused; the published version showed altered Gurbani in 5 of them and the wrong number of lines in others.
- **Screen readers and meanings (CI-A-01): fixed in the browser.** All 3,773 meaning buttons now carry the meaning itself as their name. Listening with VoiceOver on a real iPhone is still to do.
- **Lost notes (CI-R-02): partly fixed.** When the reader opens a record it no longer drops or cuts anything. But the notes it keeps aside can still vanish without a word if an older copy of the reader touches them, and the notice telling the reader about them is, most of the time, not on the screen.

Nothing that worked before was broken. No Gurbani and no teaching text was changed.

I would not release it as it stands. Three small corrections and one two-minute check on an iPhone come first (section 3).

---

## 2. Verdicts

| Finding | Verdict | What remains |
|---|---|---|
| **CI-R-01** — two readers would show altered or incomplete Gurbani with no warning | **Reproduced and fixed**, for everything the finding named | Nothing under this finding. Two related points were found on the way and are registered on their own: CI-R-07 (Gurbani quoted outside the readers is still unchecked — a gap in my first review, not in this repair) and CI-R-08 (once a check fails there is no way back from inside the app) |
| **CI-R-02** — Japji reader silently deletes a saved note or bookmark it cannot place | **Partly fixed** | (1) **RT1-01**: kept-aside items are destroyed silently by an older copy of the reader — after a rollback, or from a tab left open across the update. (2) **CI-R-09**: the notice is not on screen for a returning reader in 3 of 4 situations |
| **CI-A-01** — screen-reader users cannot hear the meanings | **Fixed in the browser; one criterion remains** | The finding's own acceptance test asks for VoiceOver on a physical iPhone. No one has done that |

The original findings are unchanged. Each now carries a dated "Re-test" line in `FINDINGS_REGISTER.md`.

---

## 3. Before this candidate is released

In order. The first three are small.

1. **Protect kept-aside notes from older copies of the reader (RT1-01).** Store them under their own name, which older copies never touch. Add the rollback test and the old-tab test to the gate.
2. **Make the notice visible (CI-R-09).** Put it where immersive reading does not hide it. Change the test so that it measures the notice's size on screen; today it passes on a box of 2×1 pixels.
3. **Leave "Export learning" working on the failure screen, and correct the advice there (part of CI-R-08).** "Reload while online" cannot repair a damaged offline copy.
4. **One check on a real iPhone (RT1-02).** Japji and Sukhmani, in Safari and from the Home Screen, online and in airplane mode. These readers now show nothing when a check fails, so a platform surprise would blank them.

Can follow in later pull requests: bringing the quoted Gurbani in Related teachings under the same check (CI-R-07); self-repair after a failed check (the rest of CI-R-08); plain wording (CI-R-10). The spelling in CI-S-16 is a change to displayed Gurbani and belongs in the scripture work, with a before-and-after record.

---

## 4. Evidence

### 4.1 CI-R-01 — altered scripture

**The finding's own test.** My original tamper script, with only the address changed:

| Reader | Published | Candidate |
|---|---|---|
| Nitnem (Sohila) | 8 of 8 refused | 8 of 8 refused |
| Japji | 0 of 3 refused | 3 of 3 refused |
| Sukhmani | 0 of 2 refused | 2 of 2 refused |

**A wider test.** 21 kinds of alteration per reader: six to the file on its way to the browser (a word changed, file cut in half, empty, missing, the checking module replaced by one that approves everything, the checking module missing) and fifteen to the text in memory before the reader starts (word changed with the old or a recomputed line hash, a line removed with and without the counts adjusted, lines swapped, a line duplicated, a line's ID changed, a section removed, sections swapped, page number changed, line number changed, another field changed, a field added, a value that reads correctly once and wrongly afterwards, the last line changed).

| | Japji, published | Japji, candidate | Sukhmani, published | Sukhmani, candidate |
|---|---|---|---|---|
| Alterations tried | 20 | 21 | 20 | 21 |
| Reader still showed scripture | 12 | **0** | 16 | **0** |
| The altered word was on screen | 5 | **0** | 5 | **0** |
| Wrong number of lines on screen | 0 | **0** | 3 (2,026 · 2,026 · 1,943 of 2,027) | **0** |
| Refused, with a message | 6 | **21** | 4 | **21** |
| Blank, with no message | 2 | 0 | 0 | 0 |
| Synthetic saved learning untouched by the refusal | — | 21 of 21 | — | 21 of 21 |

(The published version has no checking module, so "module missing" is not an alteration there: 20, not 21.)

What a refusal looks like on the candidate: no line of Gurbani, the sentence "The original scripture could not be verified, so it has not been displayed. Reload while online. Your saved learning has not been changed.", and every button off. Screenshot: `RT-001/evidence/screenshots/japji_refuses_damaged_offline_copy.png`.

**Other things tried on the candidate**

| Test | Result |
|---|---|
| The check is held up (WebCrypto made to wait) | No Gurbani shown while waiting; "Checking original scripture…"; buttons off. Japji waits on 386 checks, Sukhmani on 2,028. When released: 385 and 2,027 lines, verified |
| WebCrypto not available at all | Refused |
| Changing the text while the check is waiting | Not possible: the text is locked before the first check starts |
| Changing the text after it has passed, then forcing a redraw | The genuine text is redrawn |
| Swapping in a different text object after it has passed | Ignored; the genuine text is redrawn |
| Reading with the network off, from the offline copy (57 files) | Japji 385 lines, Sukhmani 2,027 lines, both verified; Sohila 56, Jaap 782 |
| The offline copy of a scripture file damaged after installation | Candidate: refused when re-opened online, after reloading, and with the network off. Published: the altered text was shown in all of those states, in both readers |
| The same, in the WebKit engine | Genuine files open and verify, online and from the offline copy with the server answering "not found". A changed file is refused with the page's file tags as published (the browser's own check) and with the tags changed to match (the reader's line-by-line check) |
| Extra waiting before the first line appears | Japji: 21 ms more; 35 ms with the processor slowed 4×; 96 ms slowed 6×. Sukhmani: 63 ms; 249 ms; 545 ms. Measured on a local server that sends files uncompressed, so real figures will differ |

Files: `r01_original_tamper_script_candidate.json`, `r01_tamper_21_variants_*.json`, `r01_offline_latechanges_failscreen_timing_*.json`, `r01_damaged_offline_copy_and_unchecked_file_*.json`, `r01_webkit_engine_candidate.json`.

**What the check does not protect, by design.** The expected values travel inside the page. Someone able to replace the page itself can replace them too. The builder says so in its own evidence file, and I agree it is outside what a page can defend.

**Two things found on the way**

- **CI-R-07.** The Japji reader also shows Gurbani that does not come from the checked file: three "Related teachings" cards with their full passages (Ang 466, 472, 394), the Anand heading, and — on the older Pauri 2 lesson page — six lines of Japji. These come from `js/content.js`, which has no check when it is opened. With one word changed in transit the candidate showed "ਹਉਮੈ ਦੀਰਘ **ਭੋਗੁ** ਹੈ" for "ਰੋਗੁ", no warning. The published version does the same. Screenshot: `japji_related_teachings_altered_text_shown.png`. My first review's tamper test covered only the three readers' own text, so this is my omission, not a fault in the repair.
- **CI-R-08.** After a refusal there is no way back from inside the app. With the offline copy damaged, the reader stays refused through a reload online — the advice it gives — and through "check for update" when no newer release exists. Every button on the page is off, including the way to "Export learning". The one thing a reader can do, clearing the site's data, also erases their notes. A later release does repair it (tested). The Nitnem reader has the same dead end for a single damaged bani in the published version, though its other banis and its backup stay reachable.

### 4.2 CI-R-02 — notes and bookmarks the reader cannot place

**The finding's own test**, address changed only: the note is still in storage and the page contains a message about it. Published: the note was deleted.

**What is now kept when a record is opened**

| Saved record contains | Kept whole? | Where |
|---|---|---|
| A note and a bookmark on lines this edition does not have | Yes | Kept aside |
| A note of 13,539 characters on a real line | Yes, all 13,539 | Kept aside (too long to edit) |
| A note of exactly 12,000 characters | Yes | In place |
| A note of 12,001 characters | Yes, all | Kept aside |
| An older section-level note and a line note for the same place, in either order | Both | One in place, one kept aside |
| The same two with identical text | One copy | In place |
| A note and a bookmark name containing web markup | Yes, shown as plain text; nothing ran | Kept aside |
| The previous reader's own record (kept under another name) with an unknown section | Yes; that older record itself untouched | Section note placed; unknown ones kept aside |

On the Saved-learning screen each kept-aside note is shown in full, read-only, with the reason. Text on screen equals text in storage in every case. Screenshot: `japji_saved_learning_shows_kept_aside.png`.

**Records the reader cannot read at all** — ten kinds (cut-off file, newer version, wrong shapes for notes, bookmarks or kept-aside items): each left exactly as it was, before and after trying to write; the backup file contains the unread record byte for byte; the note box is switched off so nothing can overwrite it.

**Ordinary use alongside kept-aside items**

| Step | Result |
|---|---|
| Write a note, save a line, change two settings, reload | All there; kept-aside items unchanged |
| Back up | The file holds the ordinary note, the kept-aside note and the kept-aside bookmark |
| Wipe everything, restore the backup | Notes, bookmarks, settings and kept-aside items equal what was backed up |
| Restore the same backup again | Nothing changes; no duplicates |
| Merge a backup from "another device" with a different note on the same line | Both notes kept on the line; kept-aside items of both, without duplicates |
| Merge a backup whose note is too long to join | Refused: "Combining reflections exceeds the limit. Keep both exports; no learning was changed." Nothing changed |

So far, sound. Two things are not.

**RT1-01 — an older copy of the reader destroys what was kept aside.** The saved record gained a new part but kept its old version number, so the published reader treats it as its own and writes it back without the part it does not know.

| Route | What happened |
|---|---|
| Rollback: candidate keeps three items aside → site rolled back to the published version → reader opens Japji | All three gone from storage at once. No message. Rolling forward again does not bring them back |
| Old tab: a Japji tab from before the update stays open → in a new tab the updated reader restores a backup with kept-aside items → the person returns to the old tab and reads on | Kept-aside items gone. The old tab says nothing. The notice in the new tab disappears |

File: `r02_older_copy_of_reader.json`. The candidate's Saved-learning screen says "Close old reader tabs after updating", so the builder saw the hazard. A sentence in a dialog does not prevent it.

**CI-R-09 — the notice is usually not on the screen.** The notice was given a style that the Japji reader deliberately shrinks to one pixel during immersive reading, and a returning reader is put into immersive reading at once.

| A returning reader who… | Notice on screen when Japji opens? | After scrolling | Back at the very top |
|---|---|---|---|
| has no saved place | No (2×1 pixels) | No | No |
| resumes at Pauri 2 | No | No | No |
| resumes at Pauri 20 | No | No | No |
| had left at the very top | **Yes** | No | No |

Nothing in the tools menu or the Explore menu mentions kept-aside items, and nothing is announced. The items themselves are three taps away on the Saved-learning screen, where they are shown properly. Screenshots: `japji_resumed_mid_text_no_notice.png`, `japji_left_at_top_notice_visible.png`. Files: `r02_notice_*.json`.

The published version is worse: with an unreadable record it shows no visible warning at all. So the candidate is a step forward here, not a step back — but "preserved and visible" was the acceptance test, and the second half is not met.

**Smaller points (CI-R-10; true of both versions).** A backup holding one note on an unknown line is refused whole ("Invalid line reflection.") rather than kept aside. With an unreadable record, the note screen and the restore screen show the raw message "Unterminated string in JSON at position 44 (line 1 column 45)", and there is no way to set the damaged record aside and start afresh.

### 4.3 CI-A-01 — meanings for screen-reader users

For every meaning button I read the name, role and description that the browser hands to assistive technology.

| Reader | Meaning buttons | Name contains the English | Name contains the Punjabi | Punjabi marked as Punjabi | Fixed label left | Hidden from assistive technology |
|---|---|---|---|---|---|---|
| Japji | 385 | 385 | 385 | 385 | 0 | 0 |
| Sukhmani | 2,027 | 2,027 | 2,027 | 2,027 | 0 | 0 |
| Nitnem, six banis | 1,361 | 1,361 | 1,361 | 1,361 | 0 | 0 |
| **All** | **3,773** | **3,773** | **3,773** | **3,773** | **0** | **0** |

Sukhmani adds a spoken hint to each ("Open study for Ashtpadi 1 · Opening · Ang 262"). The buttons still do their job by touch and by keyboard.

My original scan, screen by screen, counting failing elements:

| Screen | Published | Candidate | What is left |
|---|---|---|---|
| Sohila, Meaning | 62 | 6 | Five passage-study buttons and the position button |
| Sohila, Study | 57 | 1 | The position button |
| Japji, Meaning and Study | 387 | 2 | Two bottom-bar controls |
| Sukhmani, Meaning | 2,028 mismatches + 2,027 other | 1 + 2,027 | The 2,027 are CI-A-02 (each line of Gurbani is a button), untouched by this candidate |
| All 21 screen states scanned, added together | 7,057 | 4,092 | |

No meaning button fails any more. Files: `a01_meaning_names_candidate.json`, `a01_original_axe_scan_candidate.json`.

This is the browser's accessibility tree in Chromium. It is not a person listening to VoiceOver.

---

## 5. Did anything else break?

| Check | Result |
|---|---|
| Update from the published version to the candidate | Waits until asked ("An app update is ready. Load it when you are ready."); the old version keeps running meanwhile; then loads; offline copy goes from 56 to 57 files |
| Saved learning across that update | Four saved records (Japji, Sukhmani, Sohila, appearance) byte-for-byte identical before and after |
| Gurbani on screen | All 3,809 rows — Japji 385, Sukhmani 2,027, Jaap 808, Savaiye 43, Chaupai 121, Anand 210, Rehras 159, Sohila 56 — identical to my first review's register, in the same order |
| Network off | All nine compositions open with every line and meaning; home, Simran, gurdwaras and the older lesson page open |
| A broken release is offered (one damaged file) | Not installed; reader is told; the working version stays and still opens offline |
| Damaged offline copy, then a later release is loaded | Repaired; Japji verifies again; all three synthetic notes still there |
| Addresses contacted during the whole run | Only the test server. No outside address |
| Errors raised by pages | None |
| The builder's 12 non-browser test files, run by me on this head | 12 pass |
| The builder's two browser suites, run by me on this head | 27 checks pass |

File: `regression_update_offline_text.json`.

---

## 6. Scope

- 34 files changed. Sixteen scripture and teaching files compared byte for byte with the published version: all identical (the two reader texts, six Nitnem texts and their index, the four teaching files, `js/content.js`, the Simran page, the older lesson page).
- No new outside address, tracking, account or AI feature.
- Two kinds of wording were added, and both are honest: "AI-assisted educational draft" on the meanings, and, on Savaiye, Chaupai and Rehras, "awaiting comparison with a named printed edition". Both are drawn on screen (checked).
- **For the owner.** That second notice is the answer I *recommended* to owner decision 2 in D11 ("keep Savaiye and Chaupai public, with a plain notice"). The candidate adopts it before you have decided. It is a disclosure and easy to undo, so I do not count it against the candidate — but the decision is still yours.

---

## 7. Compared with the builder's own tests

Read and run only after sections 2 to 6 were settled.

**Where we agree.** Refusal of altered text (the builder tests 8 kinds per reader; mine adds 13 more, the offline copy and late changes). Complete preservation and exact backup of unreadable records. Names of all 3,773 meaning buttons — the same total, reached separately. The builder's stated limits are honest: no iPhone, Safari or VoiceOver claimed; the check cannot defend against replacement of the whole page.

**Where we differ.**

| Point | Builder's result | Mine |
|---|---|---|
| "Unknown and long Japji learning remains **visible**" | Passes | The items are visible on the Saved-learning screen. The *notice* is on screen in 1 of 4 return situations. In the builder's own test situation it is never on screen: by the time it exists the page has already scrolled past it, and about 140 ms later immersive reading shrinks it to 2×1 pixels. The test passes for two reasons. The test tool counts any non-empty box as "visible". And it scrolls to the button and clicks it the instant the reader is ready, before immersive reading begins. I repeated both: clicking at once succeeded 3 times of 3; the same click 1.5 seconds later — the earliest a person could manage — failed 3 times of 3. I also ran the builder's suite itself: it passes here too |
| An older copy of the reader | Not tested | Destroys kept-aside items (RT1-01) |
| After a refusal | Not tested | No way back; backup unreachable (CI-R-08) |
| Gurbani from `js/content.js` | Not covered | Shown altered with no warning (CI-R-07) — missed by my first review as well |

---

## 8. Registered during this re-test

True of the published version, and added to `FINDINGS_REGISTER.md`:

| ID | Severity | In one line |
|---|---|---|
| CI-S-16 | High (critical if confirmed) | Three words of Gurbani in the Related-teachings passages use a doubled half-ha spelling; in the font I could test an extra ਹ is drawn |
| CI-R-07 | Medium | Gurbani quoted outside the three readers has no check when opened |
| CI-R-08 | Medium | After a failed scripture check there is no way back from inside the app |
| CI-R-09 | Medium | Japji reader: warnings about saved learning are not visible to a sighted reader |
| CI-R-10 | Low | Raw technical messages; a backup with one unplaceable note is refused whole |
| CI-M-13 | Low | Ten vocabulary headwords are not the form found in the passage |

True of the candidate only (`RT-001/candidate_findings.json`): **RT1-01** (high) and **RT1-02** (release condition).

CI-S-16 and CI-M-13 come from an addendum to the scripture audit, `ADDENDUM_S-A1_GURBANI_OUTSIDE_THE_READERS.md`.

---

## 9. My own mistakes and false starts

1. **A gap in my first review.** I called the scripture audit complete at "3,809 of 3,809". That count was the three readers. I had not counted 31 further occurrences of Gurbani shown in the Related-teachings screens, the older lesson page and the Simran page. They are collated now: 29 exact, 2 lines differ (CI-S-16). The coverage register is corrected.
2. **A helper that could not see.** In the first review I listed "messages shown" with a helper that treats text clipped to one pixel as shown. No finding rested on it, and I have re-checked the one statement that mattered (the Nitnem warning is a real banner). Here it is replaced by a measurement of size on screen.
3. **A first attempt that proved nothing.** To test a damaged offline copy I reloaded the same tab; the browser answered from its short-term memory and never read the damaged copy. I caught it because the result was too good, redid it by closing the tab and re-opening, and kept the first run in the evidence marked "superseded".
4. **A fault in my own test server.** It answered "not changed" by file date, which left the browser holding a mixture of two versions when I swapped them. Found when a rollback run reported the wrong version; fixed; the affected runs repeated.

---

## 10. What this re-test does not show

- Anything on a real iPhone, in Safari, or with VoiceOver.
- That the public site serves these files. Nothing here has been merged or deployed.
- Anything about the correctness of the Gurbani text or the meanings. Neither was changed, and my first review's findings on both stand.
- How Apple's Gurmukhi font draws the three words in CI-S-16.
- Real readers. Every "reader" here is a script.

---

## 11. Reproduce

Scripts are in `RT-001/tools/`, results in `RT-001/evidence/`. Paths inside the scripts are those of this reviewer's machine. Two static servers serve the published version and the candidate; `switch_server.py` swaps versions under one address for the update tests.

| Script | Section |
|---|---|
| `rt1_original_tamper_rerun.py`, `rt1_integrity.py`, `rt1b_cache_and_recovery.py`, `rt1c_offline_copy_damage.py`, `rt6_webkit_engine.py` | 4.1 |
| `rt2_original_saved_learning_rerun.py`, `rt2_saved_learning.py`, `rt2b_notice_visibility.py`, `rt2c_older_copy_of_reader.py`, `rt2d_extras.py`, `rt2e_builder_test_situation.py`, `rt2f_notice_timeline.py`, `rt2h_click_at_once.py`, `rt7_both_builds_extras.py` | 4.2 and 7 |
| `rt3_original_axe_rerun.py`, `rt3_meaning_names.py` | 4.3 |
| `rt4_regression.py` | 5 |
| `rt5_disclosures_visible.py` | 6 |
| `rt2g_nitnem_warning_visible.py` | 9, point 2 |
