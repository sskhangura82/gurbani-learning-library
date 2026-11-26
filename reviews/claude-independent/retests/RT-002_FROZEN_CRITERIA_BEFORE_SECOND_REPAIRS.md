# RT-002 · Criteria frozen before the second repairs exist

| | |
|---|---|
| Role | Independent second reviewer. I will not write, change, approve or merge the candidate. |
| Frozen | 26 November 2026 (UTC), before any corrected commit has been pushed to PR #40. The head is still `09e829e`. |
| Will be applied to | The exact commit the builder names on PR #40 — nothing unpushed, nothing on a private machine. |
| Compared with | The published version (`a3476ac`) and the first candidate (`09e829e`). |
| Scope | The seven items the owner listed on 26 November: RT1-01, CI-R-09, CI-R-08, CI-S-16, R2-X-04, CI-R-11, CI-U-11 — plus everything that passed before, plus the test copy. |

## What I already know, said plainly

From the owner's note of 26 November I know three things about the unpushed work: a separate storage record has been
introduced for kept-aside notes; the notice has been taken out of the style rule that shrank it; and the builder's
own browser run stood at 14 of 16, with one export that timed out on an oddly shaped note and one test blocked by
the app's own security policy. I have not seen the code, the tests or the report.

The criteria below are about what a reader experiences, not how it is built. One of them — "export never hangs" —
is there because of what the note told me.

## Order of work

1. Pin the commit. List which files changed.
2. Run my own checks and write my verdicts, and commit them.
3. Only then open the builder's tests, test reports and evidence files (including
   `evidence/review-repairs-browser-verification.json`), run them, and compare.

I may read the changed application code at any point. I will not open the builder's tests or reports before step 3.

## The seven items

"Rerun unchanged" means the script from `retests/RT-001/tools/`, `round2/tools/` or `device-test/tools/` as it is
today, so the numbers can be laid side by side.

### RT1-01 (high) — kept-aside notes destroyed by an older copy of the reader

Acceptance, as recorded in RT-001: *the rollback test and the old-tab test both end with every kept-aside item still
in storage and still shown after rolling forward; both tests are in the quality gate.*

| # | Check | Passes when |
|---|---|---|
| a | `rt2c_older_copy_of_reader.py` rerun unchanged: rollback, and old tab, with the real published reader as the older copy and the same three made-up items (a note on an unknown line, a 12,500-character note, an unknown bookmark) | 3 of 3 items in storage and shown after rolling forward, on both routes |
| b | The same with the first candidate (`09e829e`) as the older copy — that is what is on the test address today | 3 of 3, both routes |
| c | After rolling forward: export, empty the browser, import | The three items come back equal, character for character |
| d | Three rounds of old copy / new copy, and the same backup imported three times | The count of kept-aside items does not grow |
| e | An ordinary note written in the old tab during the episode | Still there |
| f | The separate record made unreadable in the 10 ways used in RT-001 | The reader opens, shows Gurbani, loses nothing that was readable, says something visible, and export still works |
| g | The browser refuses to write the separate record (storage full) | The reader says so where it can be seen; the main record is not damaged |
| h | Export and import | The export holds the kept-aside items; the import says how many before merging |
| i | Removal and privacy | Any control that removes notes also removes the kept-aside copy, or says it does not; the notice about shared devices covers it |
| j | Both tests present in the quality gate | Checked in step 3 |

Any kept-aside item lost on any route: **not fixed**.

### CI-R-09 (medium) — the notice about kept-aside notes cannot be seen

Acceptance: *in each return situation (at the top, resumed mid-text, after scrolling, during guided reading) a
measurement of the notice's size on screen, not its mere presence in the page, shows it visible and its button
tappable.*

| # | Check | Passes when |
|---|---|---|
| a | `rt2b_notice_visibility.py`, `rt2f_notice_timeline.py`, `rt2h_click_at_once.py` rerun unchanged | Visible and tappable in 4 of 4 situations (it was 1 of 4) |
| b | The same at 320, 375 and 390 pixels wide; in Read, Meaning and Study; with the reader's text at its largest; with the silent guide running | The whole notice inside the screen; its button at least 44 pixels in each direction; a tap at the button's centre reaches the button |
| c | Tapping it | Opens the kept-aside items; after it is dismissed they can still be reached from Saved learning |
| d | What a screen reader is given | A name and a role that announce it (measured from the browser's accessibility tree; not VoiceOver) |
| e | On the test copy | The test banner does not cover it |

### CI-R-08 (medium) — no way back after a failed scripture check

Acceptance: *with a damaged offline copy and the network on, the reader recovers by itself or with one press and
saved learning is untouched; with the network off, the screen still offers export and says to reconnect.*

| # | Check | Passes when |
|---|---|---|
| a | `rt1c_offline_copy_damage.py` rerun unchanged, Japji and Sukhmani | Recovers online; offers export offline; saved record identical before and after |
| b | Export pressed on the refusal screen | A file equal to the saved record — notes, saved lines, kept-aside items |
| c | Export with each of the 10 unreadable or oddly shaped records | Either a file that keeps everything, the odd part included as it was, or a plain message that it could not. **Never a hang.** A time-out is a failure of the app until shown otherwise |
| d | The wording on the refusal screen | Does not advise a step that cannot work |
| e | The refusal itself — `rt1_integrity.py` rerun unchanged | Still 21 of 21 alterations refused in each reader; no Gurbani shown while a check is failing |

### CI-S-16 (high) — three words outside the readers

Acceptance: *the 31 occurrences collate exactly; a device screenshot of both lines matches a printed page.*

| # | Check | Passes when |
|---|---|---|
| a | The 31 lines outside the readers compared again with the reference | 31 of 31 equal |
| b | The change itself | Before and after listed letter by letter; the source edition and page named in the commit; recorded as a correction — not a silent respelling |
| c | Everything else | No other line of Gurbani differs from `09e829e`: 3,809 of 3,809 reader rows unchanged |
| d | Print | **Not something I can do.** Stays "not done" until a person compares the two lines with a printed page |

The most this item can earn from me is "fixed in the digital comparison; print check not done".

### R2-X-04 (medium) — following a link replaces the saved place

Acceptance: *arriving by a link is a visit; the saved place is kept until the person reads on, or a way back to it
is offered.*

| # | Check | Passes when |
|---|---|---|
| a | Saved place Ashtpadi 3, Pauri 1. Open the reader by a link to Ashtpadi 17 | The stored place is unchanged on arrival |
| b | Close. Open the reader the ordinary way | It opens at Ashtpadi 3, or offers it plainly |
| c | Read on after arriving by the link | Whatever happens to the place is said on screen, and the earlier place can be reached |
| d | The same for a link into Japji Sahib, if one exists | As above |

### CI-R-11 (medium) — the Japji reading place moves back on reload and Back

Acceptance: *`dt_01_saved_place_on_reopen.py` reports "same line every time" for all four ways of reopening; on a
physical iPhone, step A7 names the same line after two reloads.*

| # | Check | Passes when |
|---|---|---|
| a | `dt_01` rerun unchanged | Same line and same stored place: 4 ways × 3 reopenings (it was 2 of 4 ways) |
| b | From Pauri 5 and Pauri 38 as well; in Meaning and Study; at three widths; after a change of text size | Same line every time |
| c | When the place is written | Not before the reader has finished putting the page where it was |
| d | Sukhmani and Nitnem readers, reloaded twice | No worse than before |
| e | A WebKit engine, if one is available in the session | Same; if not available, said so |
| f | iPhone | **Not something I can do.** Step A7 of the phone script |

### CI-U-11 (medium) — a written note is listed nowhere in the Japji reader

Acceptance: *after a note is written on a line that is not saved, the Saved learning screen lists that line and
tapping it opens the note.*

| # | Check | Passes when |
|---|---|---|
| a | `dt_02` rerun unchanged | `savedLearningScreenListsIt: true`; and all 14 steps as written (it was 13) |
| b | One note, no saved line | The screen does not say there is nothing saved |
| c | A line with both a saved mark and a note | Listed once |
| d | 200 made-up notes | The list still scrolls and nothing overflows sideways |
| e | A note emptied | Leaves the list |
| f | Where the note goes | Nowhere: no request leaves the site, nothing of the note appears in the address |

## Everything that passed before must still pass

| Check | Rerun | Passes when |
|---|---|---|
| Gurbani letter for letter | The row-by-row comparison with the reference | 3,809 of 3,809 rows as in `09e829e` |
| Teaching text | File comparison with `09e829e` | Unchanged, unless the builder names a change |
| Altered scripture refused | `rt1_integrity.py` | 21 of 21, twice |
| Meanings named for screen readers | `rt3_meaning_names.py` | 3,773 of 3,773 |
| Update, saved records, offline, broken release, repair | `rt4_regression.py` | As in RT-001 |
| Disclosures visible | `rt5_disclosures_visible.py` | As in RT-001 |
| Records written by older versions | Records saved by the published version and by `09e829e` | Open with nothing lost |
| Network | Request log during every run | No destination that was not there before |
| Storage | Names of everything the app stores | Only names the app declares; any new one is in the export and in the privacy wording |

## The test copy

Before any phone result is taken on a new build: `device-test/tools/tc_01_compare_test_copy_with_source.py` shows
the copy is the named commit plus a label and nothing else; `dt_03_test_copy_banner.py` shows the label is not over
the reading line; a build label can be read on the page.

## Words I will use

Per item: **fixed** (always meaning *in emulation, on the candidate*), **partly fixed**, **not fixed**, **could not
be tested**. Overall: PASS, NEEDS_REVISION or INCOMPLETE.

A pass from me is not a release decision, and it is not a phone result. Safari, an iPhone, VoiceOver and a printed
page are outside what I can test; those stay "not done" until a person does them.
