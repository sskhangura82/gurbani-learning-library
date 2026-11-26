# D10 · Prioritized improvement backlog

Generated from `findings/findings.json`. Each row links to its full entry (location, evidence, correction, acceptance test) in `FINDINGS_REGISTER.md`.
Updated after re-test RT-001 (2026-11-25): six items added (CI-R-07 to CI-R-10, CI-S-16, CI-M-13) and a "Where it stands" column. "Fix verified on candidate" means the second reviewer saw the fix work on an unmerged candidate in emulation; the public app is unchanged until it is merged and deployed.
Updated 2026-11-26 while preparing the device test: two items added (CI-R-11 in wave 1, CI-U-11 in wave 3).
Order inside a wave is by severity. "S0 cand." = critical if print collation confirms it.

## Wave 1 — Safety, honesty and access (can start now; no Gurbani text changes)

*Who:* Claude proposes, ChatGPT reviews (no scripture text touched)

| ID | Severity | What to do | Done when | Where it stands |
|---|---|---|---|---|
| [CI-A-01](FINDINGS_REGISTER.md#ci-a-01) | S1 | Remove the override so the button's own text is its name; add the hint as a separate description. | Automated scan clean; VoiceOver on a physical iPhone reads the English and Punjabi meaning. | Fix verified on candidate PR #40 in emulation — not yet public |
| [CI-A-05](FINDINGS_REGISTER.md#ci-a-05) | S1 | A one-hour scripted device session by a person with an iPhone (script supplied in deliverable 6). | Checklist completed with photos or screen recordings. | Open |
| [CI-R-01](FINDINGS_REGISTER.md#ci-r-01) | S1 | Give all readers the Nitnem reader's check (whole-file hash, per-line hash, expected counts) and refuse to show text that fails. | The tamper script reports "refused" for every variant in all three readers. | Fix verified on candidate PR #40 in emulation — not yet public |
| [CI-R-02](FINDINGS_REGISTER.md#ci-r-02) | S1 | Never drop: move unknown items to a "kept aside" list the reader can see and export. | The same test shows the note preserved and visible; no silent truncation. | Partly fixed on candidate PR #40 — not yet public |
| [CI-R-03](FINDINGS_REGISTER.md#ci-r-03) | S1 | Build and test migration before any scripture correction ships: map old IDs to new, keep unmatched notes visible, offer export. | After a test edition change, every synthetic note and bookmark is still reachable. | Open |
| [CI-M-07](FINDINGS_REGISTER.md#ci-m-07) | S2 | Make the caution field optional and drop the test rule that requires one on every line. Remove these from line notes. Put one short, respectful general note in About. Keep genuine interpretive notes (alternative readings, grammar) only. | Disclaimer screen returns 0 on line notes; one general note exists; reviewers approve remaining notes. | Open — owner decision |
| [CI-M-08](FINDINGS_REGISTER.md#ci-m-08) | S2 | Move such notes to a reviewer-only field; correct the ਅਨਭਉ gloss. | Screen for "verify", "needs review", "provisional", "this draft", "the app" in reader-facing fields returns 0. | Open |
| [CI-M-09](FINDINGS_REGISTER.md#ci-m-09) | S2 | Say plainly, once per bani and in About: "Simple draft explanation written with AI assistance. Not a translation. Not yet reviewed by a qualified person." | Statement visible within one tap from any meaning; identical wording in all three readers. | Open |
| [CI-R-07](FINDINGS_REGISTER.md#ci-r-07) | S2 | Hold every quoted line of Gurbani in a checked source set and have these screens quote from it by line reference. Until then give js/content.js the same file check and verify its scripture strings before drawing them. | The tamper script, extended to these screens, reports "withheld" for every variant; the collation register lists these occurrences. | Open |
| [CI-R-08](FINDINGS_REGISTER.md#ci-r-08) | S2 | On a failed check, fetch that file again past the offline copy, check it, and replace the bad copy if the fresh one passes. Offer "Download again". Keep "Export learning" working on the failure screen. Say what failed, that notes are safe, and what to press. | With a damaged offline copy and the network on, the reader recovers by itself or with one press and saved learning is untouched; with the network off, the screen still offers export and says to reconnect. | Open |
| [CI-R-09](FINDINGS_REGISTER.md#ci-r-09) | S2 | Show the notice where immersive reading does not hide it — for example a small marker on the bottom bar that opens Saved learning — and announce it once. Do not reuse a style that is hidden on purpose. | In each return situation (at the top, resumed mid-text, after scrolling, during guided reading) a measurement of the notice's size on screen, not its mere presence in the page, shows it visible and its button tappable. | Open |
| [CI-R-11](FINDINGS_REGISTER.md#ci-r-11) | S2 | At the top of the reader, tell the browser to leave scroll position alone (history.scrollRestoration = "manual"), so that the reader's own stored place is the only thing that positions the page; and do not record a new place until the reader's own restore has finished. Check the other two readers the same way. | device-test/tools/dt_01_saved_place_on_reopen.py reports "same line every time" for all four ways of reopening, in Chromium and in a WebKit engine; and on a physical iPhone, step A7 of device-test/IPHONE_TEN_MINUTE_SCRIPT.md names the same line after two reloads. | Open |
| [CI-U-03](FINDINGS_REGISTER.md#ci-u-03) | S2 | Plain words in English and Punjabi ("Slower / Faster", "Text size"); move technical detail to an About page. | A plain-language review of every visible string by a Punjabi-speaking family tester. | Open |
| [CI-X-01](FINDINGS_REGISTER.md#ci-x-01) | S2 | Anyone with a normal connection can run the supplied hash check against the live site. | Live files match evidence/baseline-sha256.txt. | Open |
| [CI-X-03](FINDINGS_REGISTER.md#ci-x-03) | S2 | Commit the five files (or regenerate them) and name the printed edition, publisher, year and pages. | Every file named in an audit exists at the cited path; the printed edition is named. | Open |
| [CI-R-10](FINDINGS_REGISTER.md#ci-r-10) | S3 | Plain sentences that say what happened and what to do. On restore, keep unplaceable notes aside, as opening a record now does in PR #40. Offer "set the damaged record aside and start afresh", keeping the original for export. | No message shown to a reader contains a file name or the words JSON or SHA; restoring the other-edition backup brings its note in as kept aside. | Open |

## Wave 2 — Scripture and meaning foundation (needs the owner and qualified reviewers)

*Who:* Owner decides edition and reviewers; scholars collate; then builder applies with before/after records

| ID | Severity | What to do | Done when | Where it stands |
|---|---|---|---|---|
| [CI-M-01](FINDINGS_REGISTER.md#ci-m-01) | S1 | Rewrite these entries as plain meanings in the voice of the line; move any context into the separate, labelled note. Use "Guru Sahib" / "ਗੁਰੂ ਸਾਹਿਬ", never "the poet". Have qualified reviewers approve. | The screen in tools/m_screens returns 0 for the listed patterns; a reviewer-signed sample of 100 Nitnem lines contains none. | Open — needs a qualified reviewer |
| [CI-M-02](FINDINGS_REGISTER.md#ci-m-02) | S1 | Give the plain meaning; put historical or pastoral context in the labelled note; let qualified reviewers decide wording for martial vocabulary. | Each listed line reviewed and signed; meaning and note are separate fields on screen. | Open — needs a qualified reviewer |
| [CI-S-02](FINDINGS_REGISTER.md#ci-s-02) | S1 (S0 cand.) | Choose one reading from a named printed edition and store it in valid mark order in all eleven places. | All eleven occurrences are byte-identical for this word; a scan for "vowel sign before virama" over the whole corpus returns 0; rendering checked on a physical iPhone. | Open — needs a qualified reviewer |
| [CI-S-03](FINDINGS_REGISTER.md#ci-s-03) | S1 (S0 cand.) | Correct after print confirmation; keep the previous reading and the supporting edition in the change record. | The four lines match the confirmed edition; a pattern scan for words ending -ਲੁ where the chhand's other words end -ੁਲ returns 0; spacing before every verse number is uniform. | Open — needs a qualified reviewer |
| [CI-S-05](FINDINGS_REGISTER.md#ci-s-05) | S1 (S0 cand.) | Re-enter the opening lines from a named printed edition with correct spacing and line division. | Opening lines of both banis equal the chosen edition character for character; no Gurmukhi letter is directly followed by a numeral or ॥ without the edition showing it so. | Open — needs a qualified reviewer |
| [CI-S-06](FINDINGS_REGISTER.md#ci-s-06) | S1 (S0 cand.) | Replace the text with a transcription of one named printed edition (decision for the owner and reviewers); keep the old readings in the change record; only then re-check meanings. | Edition named in the data and on screen; collation against that edition shows 0 unexplained differences; half-ਯ encoded consistently; the Rehras copy is generated from the same records, not stored twice. | Open — needs a qualified reviewer |
| [CI-S-07](FINDINGS_REGISTER.md#ci-s-07) | S1 (S0 cand.) | Same as CI-S-06. | Same as CI-S-06, for Savaiye. | Open — needs a qualified reviewer |
| [CI-S-10](FINDINGS_REGISTER.md#ci-s-10) | S1 | Re-divide these rows into the same tuks as the reference, with headings as headings. Because line IDs will change, add a saved-learning migration first (see CI-R-03). | Rehras SGGS section has one record per tuk with Ang; 0 occurrences of ॥ followed by a letter; headings typed as headings; existing bookmarks and notes on the old rows still open after the change. | Open |
| [CI-S-11](FINDINGS_REGISTER.md#ci-s-11) | S1 (S0 cand.) | Same as CI-S-06. | Both rows equal the named edition. | Open — needs a qualified reviewer |
| [CI-S-12](FINDINGS_REGISTER.md#ci-s-12) | S1 | Name one printed edition per source (for example the SGPC standard 1430-page saroop for Sri Guru Granth Sahib; one named Dasam Granth or SGPC gutka for Dasam Bani); arrange human collation; record it. | Each data file names edition, publisher and year; a collation record signed by named qualified reviewers exists for each composition. | Open — needs a qualified reviewer |
| [CI-S-16](FINDINGS_REGISTER.md#ci-s-16) | S1 (S0 cand.) | Write the sign as the readers do. Better: quote related passages by line reference from the same checked source as the readers, so one collation and one run-time check cover every line of Gurbani the app shows. | The 31 occurrences collate exactly; a device screenshot of both lines matches a printed page. | Open |
| [CI-X-02](FINDINGS_REGISTER.md#ci-x-02) | S1 | Recruit two or three qualified reviewers; give them the focused packet in deliverable 2 (the 138 differing Dasam occurrences first). | Signed review records exist for each composition. | Open — owner decision |
| [CI-M-03](FINDINGS_REGISTER.md#ci-m-03) | S2 | After CI-S-10, write line meanings for each tuk; correct the README count now. | Every Rehras tuk has its own meaning; README numbers equal what the screen shows. | Open |
| [CI-M-04](FINDINGS_REGISTER.md#ci-m-04) | S2 | Correct the six; add an English–Punjabi agreement check to review. | Six lines corrected and signed. | Open — needs a qualified reviewer |
| [CI-M-05](FINDINGS_REGISTER.md#ci-m-05) | S2 | Correct 1.5 and 1.6; get a ruling on the three words. | Lines corrected and signed. | Open — needs a qualified reviewer |
| [CI-P-01](FINDINGS_REGISTER.md#ci-p-01) | S2 | Owner decision: choose licences for code and for the original teaching text (they can differ); add notices for BaniDB and SriGranth as their terms require. | LICENSE files present; notices checked against each source's terms. | Open — owner decision |
| [CI-S-04](FINDINGS_REGISTER.md#ci-s-04) | S2 | Give the list to qualified reviewers for collation against one named printed edition; record each decision. | Every row in the list carries a decision (keep / change), the edition and page, and the reviewer. | Open — needs a qualified reviewer |
| [CI-S-08](FINDINGS_REGISTER.md#ci-s-08) | S2 | State the edition; keep its numbering exactly, including the Dohra number. | Numbering equals the named edition everywhere; the About text says which convention is used. | Open — needs a qualified reviewer |
| [CI-S-09](FINDINGS_REGISTER.md#ci-s-09) | S2 | Owner decision on which tradition(s) to serve. Then say in plain words, in English and Punjabi, which maryada is followed and what other traditions add; later offer the longer forms as clearly named options. | A first-time reader can find, within two taps, a plain statement of which tradition the Chaupai and Rehras follow. | Open — owner decision |
| [CI-S-13](FINDINGS_REGISTER.md#ci-s-13) | S2 | Check on a physical iPhone and iPad; if it breaks, keep the stored text and fix the display only. | Photo of the line on a physical iPhone shows no dotted circle. | Open |
| [CI-S-01](FINDINGS_REGISTER.md#ci-s-01) | S3 | When line IDs are next migrated (see CI-R-03), type the phrase as an invocation/heading and keep its saved-learning link. | Chhand 62 is labelled with four verse lines; a bookmark saved on the old ID still opens. | Open |
| [CI-S-14](FINDINGS_REGISTER.md#ci-s-14) | S3 | Confirm against print; store dotted letters in one agreed form. | Decision recorded for each; all lines stable under Unicode normalisation or the build refuses to normalise. | Open |

## Wave 3 — One reader, one saved-learning store

*Who:* Builder and Claude, design agreed first

| ID | Severity | What to do | Done when | Where it stands |
|---|---|---|---|---|
| [CI-A-02](FINDINGS_REGISTER.md#ci-a-02) | S2 | Lines are text; offer one "line actions" control per line or a single roving focus. | Fewer than 60 focus stops per ashtpadi; scan clean. | Open |
| [CI-R-04](FINDINGS_REGISTER.md#ci-r-04) | S2 | One backup file for the whole library; a gentle reminder after new notes; plain explanation of the Home Screen point. | One export restores everything on a clean browser; reminder appears after the first note. | Open |
| [CI-U-01](FINDINGS_REGISTER.md#ci-u-01) | S2 | One reader, one data shape, one saved-learning store (see implementation plan). | The same test script passes unchanged against all nine compositions. | Open |
| [CI-U-02](FINDINGS_REGISTER.md#ci-u-02) | S2 | Gurbani within the first screen; on Study, bring the study block into view or show a clear pointer. | First verse line visible without scrolling at 390×664; pressing Study changes what is on screen. | Open |
| [CI-U-04](FINDINGS_REGISTER.md#ci-u-04) | S2 | One appearance setting for the whole app, following the phone by default. | Set Dark once; every page opens dark; a fresh visitor with a dark phone gets dark everywhere. | Open |
| [CI-U-05](FINDINGS_REGISTER.md#ci-u-05) | S2 | One "Text size" control that scales Gurmukhi, meanings and labels together; sizes in relative units; nothing under 12 px. | At the largest setting meanings are at least 20 px; with the browser default at 200% all text grows. | Open |
| [CI-U-06](FINDINGS_REGISTER.md#ci-u-06) | S2 | Group by chhand type with Gurmukhi names; add first-letter and text search working offline. | Any line can be reached by typing its first letters; Jaap list grouped under its 22 chhand headings. | Open |
| [CI-U-07](FINDINGS_REGISTER.md#ci-u-07) | S2 | One way everywhere: tap or long-press a line → Save · Note · Meaning. | Same gesture saves a line in all nine compositions, found without instructions by a first-time tester. | Open |
| [CI-U-09](FINDINGS_REGISTER.md#ci-u-09) | S2 | Load one ashtpadi at a time; split teaching text per ashtpadi; show Gurbani first. | First line within 3 s on the slow profile from a real compressed host; memory stays flat while scrolling. | Open |
| [CI-U-10](FINDINGS_REGISTER.md#ci-u-10) | S2 | Bring the Nitnem reader to the single-dock design (best done by unifying the readers, CI-U-01). | No fixed header in any reader; the dock is the only persistent control. | Open |
| [CI-U-11](FINDINGS_REGISTER.md#ci-u-11) | S2 | List every line that carries a note, with the first words of the note, beside the saved lines — as the other two readers already do. Say "No saved lines or reflections yet." only when both are empty. | After a note is written on a line that is not saved, the Saved learning screen lists that line and tapping it opens the note; the rehearsal reports savedLearningScreenListsIt: true. | Open |
| [CI-A-03](FINDINGS_REGISTER.md#ci-a-03) | S3 | Darken two colours; give links 44 px touch height. | All text ≥ 4.5:1; all targets ≥ 24 px, primary ones ≥ 44 px. | Open |
| [CI-P-02](FINDINGS_REGISTER.md#ci-p-02) | S3 | Tighten the two policies; refresh descriptions; close or label stale drafts. | Policy scan clean on all pages; descriptions current. | Open |
| [CI-R-05](FINDINGS_REGISTER.md#ci-r-05) | S3 | One shared file; say "Saving the library for offline use (1.5 MB)". | One copy; visible offline notice. | Open |
| [CI-U-08](FINDINGS_REGISTER.md#ci-u-08) | S3 | Auto-hide furniture in landscape; exact resume everywhere; name the source on screen. | Covered by the unified reader tests. | Open |

## Wave 4 — Depth: words, cross-references, Punjabi-first study

*Who:* After waves 1–3; with scholars for content

| ID | Severity | What to do | Done when | Where it stands |
|---|---|---|---|---|
| [CI-E-01](FINDINGS_REGISTER.md#ci-e-01) | S2 | See the learning blueprint (deliverable 8): word records with sourced origins, then cross-references reviewed by scholars. | For a pilot bani every word opens a sourced entry and every passage has at least one reviewed cross-reference. | Open |
| [CI-E-02](FINDINGS_REGISTER.md#ci-e-02) | S2 | A calm "Return to" list ordered by time since last visit; opt-in; on-device only. | A saved line reappears in the list after a set interval; nothing is counted or scored. | Open |
| [CI-M-06](FINDINGS_REGISTER.md#ci-m-06) | S2 | Adopt a term sheet: keep the Gurmukhi-origin word, gloss it once, link to a concept note. | Term screen shows each core term kept in at least 95% of its occurrences. | Open |
| [CI-M-10](FINDINGS_REGISTER.md#ci-m-10) | S2 | Write Punjabi study text first-class, not as a shortened translation. | Every study has Punjabi focus, close reading, reflection and teach-back; length ratio within 0.7–1.3. | Open |
| [CI-M-11](FINDINGS_REGISTER.md#ci-m-11) | S3 | Adopt one spelling list; one transliteration scheme, labelled approximate. | Spelling screen returns one form per word. | Open |
| [CI-M-13](FINDINGS_REGISTER.md#ci-m-13) | S3 | Show the form from the line first and the base form second, labelled as such; mark terms about a bani as terms. | The headword script reports no unlabelled exception. | Open |
| [CI-S-15](FINDINGS_REGISTER.md#ci-s-15) | S3 | Report upstream. | Upstream issue filed. | Report upstream |

## Not in the backlog on purpose

- New compositions (the release note names Salok Mahalla 9 next). Recommendation: none until waves 1 and 2 are closed.
- Audio, recitation, AI inside the reader, accounts, sharing, analytics: excluded by the assignment.

