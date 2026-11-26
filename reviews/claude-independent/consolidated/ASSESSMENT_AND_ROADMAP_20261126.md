# GLP-001 — Assessment of the Consolidated Master Revision, and one roadmap

**From:** Claude, independent second reviewer (AI system; not a Sikh scholar, historian or Santhiya teacher).
**In answer to:** "GLP-001 — Consolidated Master Revision & Claude Handoff", 25 November 2026, section 19.
**Repository as inspected:** 26 November 2026, 01:29 UTC. Published version `a3476ac`, unchanged. 36 open pull requests, 35 of them drafts.
**Everything I have tested in a browser was desktop emulation.** No iPhone, iPad, Android device, Safari or screen reader.

---

## The short answer

1. **The vision is worth building. The plan to reach it has one hole that no amount of engineering fills: people.** Today the project has no qualified Gurbani reviewer, no native Punjabi reader, no historian, no cleared recording and no device test. Twelve workstreams of AI-drafted religious and historical writing, each "pending review", is not a library. It is a backlog.
2. **The repairs have not moved.** The repair pull request (#40) is exactly where it was when I re-tested it. In the same hours four new feature drafts were opened (#41, #43, #45 and the plan #42). "Three parallel lanes" is the right idea; in practice only two of the three are moving.
3. **The published app can keep growing as a reader without being rebuilt.** It cannot become a *connected* library until one thing is settled first: a single way of naming a line of Gurbani. Today there are at least four.
4. **The smallest next milestone is not a feature.** It is the repaired reader, re-tested by me and opened once on a real iPhone, then released by the owner.

---

## 1. Corrections to the handoff's summary of my review

The handoff says its summary was recovered from memory and asks me to correct it. Six lines need correcting. The source of truth is this folder, not anyone's summary of it; ChatGPT can read it directly on the branch.

| The handoff says | What my record says |
|---|---|
| "42 source-integrity tamper tests passed" | 21 kinds of alteration on each of two readers, Japji and Sukhmani: 42 of 42 refused. **On the unreleased candidate #40, in emulation.** The published app still shows altered Gurbani in 5 of those cases per reader. Nitnem refuses 8 of 8 in both versions. |
| "3,773 meaning buttons passed" | All 3,773 carry the meaning as their name **in the browser's accessibility information**. The finding's own test is VoiceOver on a real iPhone. Nobody has done it. |
| "Saved reflections: risk of silent data loss remains" | Correct, and precise: notes the repaired reader *keeps aside* are destroyed without a word when an older copy of the reader touches them — after a rollback, or from a tab left open across the update (RT1-01). |
| "31 additional scripture occurrences identified … investigate" | These are not new scripture. They are 31 whole lines of Gurbani the app already shows **outside** its three readers (related teachings, an older lesson page, the Simran page), which my first audit had not counted. I have since compared them: **29 of 31 exact.** Investigated; closed except for the next line. |
| "Two textual differences require examination against printed and digital editions" | Two lines, three words (Ang 472 and Ang 394), written with a doubled half-ha sign where the reference **and the app's own Sukhmani text** use the single sign. In the test font an extra letter ਹ is drawn. This is an encoding fault in the app's quoted passages, not a disagreement between editions (CI-S-16). I have compared it with two digital texts. I cannot compare with print. |
| "Claude requested three specific repairs" | Three repairs **and one check on a real iPhone**, in that order. A fourth point for the same reader was found in round 2: a link from the new Explorer replaces the reader's saved place (R2-X-04). |

Two lines are right as written: the duplicate repair (#39) is closed, and #40 is unpublished. On the printed-edition notice for Savaiye and Chaupai: I recommended it as an owner decision; the candidate #40 already contains it. I read item 8 of the handoff ("preserve appropriate … notices") as the owner's decision to keep it. Say if that is wrong.

"320 automated checks passed" is the builder's figure. I did not count it and do not rely on it.

---

## 2. The ten questions

### 1. What is currently working, with evidence?

**In the published app** (first review, 64 findings; `FINDINGS_REGISTER.md`):
- Three readers open and read: Japji Sahib (385 lines), Sukhmani Sahib (2,027 lines), six Nitnem banis. Offline reading works from the saved copy (56 files) in emulation.
- The Gurbani in the readers was compared with one digital reference, occurrence by occurrence. The Sri Guru Granth Sahib text agrees except for the points registered; the Dasam Bani text differs from that reference in 138 places that need a named printed edition, not a ruling from me.
- Nothing leaves the device. No accounts, tracking or advertising.

**In unreleased drafts, in emulation only:**
- #40: altered Gurbani is refused (42 of 42); meanings are named for screen readers (3,773 of 3,773).
- #43: the Hukamnama fixture is exact (19 of 19), date handling is right across Amritsar midnight (15 of 15), damaged data is refused (24 of 24).
- #41: the nine lines of Gurbani shown are exact and rightly placed.

**Working in real life, on a real phone, checked by a qualified person:** nothing has been established by anyone.

### 2. What remains broken or incomplete?

- **Published app:** every first-review finding is still live, because nothing has been released since. That includes altered Gurbani being displayed, a saved note being silently deleted, meanings unreadable by screen reader, and three words drawn with an extra letter (CI-S-16).
- **#40:** RT1-01, the invisible notice (CI-R-09), no export on the failure screen. No reply and no new commit since my re-test.
- **#41, #42, #43:** 24 findings in round 2 (`round2/README.md`). No reply yet.
- **#45:** not yet reviewed.
- **Everywhere:** no device test; no qualified human review; no print collation; no cleared recording; 0 permission requests sent.
- **The repository itself:** 35 open drafts, and branches beside them. The Salok Mahalla 9 draft sat for a month on a branch with no pull request and no shared history with `main`, which is why it was thought lost.

### 3. Which immediate repairs come first?

In this order. Each has a test that can fail. This is Phase 0 and it is the builder's to write and mine to re-test.

| # | Repair | Test |
|---|---|---|
| 1 | Kept-aside notes survive an older copy of the reader (RT1-01) | With kept-aside notes present, open the published version and an old tab: 0 notes lost |
| 2 | The recovery notice is on screen (CI-R-09) | In all four return situations the notice is measured by its size on screen and is in the accessibility information: 4 of 4 |
| 3 | "Export learning" works on the failure screen; the advice there is true (CI-R-08) | From a refused reader, export, wipe, import: the saved record is identical |
| 4 | The three words (CI-S-16) | 31 of 31 lines outside the readers equal the reference, with a before-and-after record. This changes displayed Gurbani, so the owner signs it off at release |
| 5 | A link into the reader does not replace the saved place (R2-X-04). This is in the published reader, so a shared link does it today | Saved place before and after following the link is the same |
| 6 | Nothing regresses | 42 of 42 and 8 of 8 alterations still refused; my regression set passes |
| 7 | **One real iPhone** | A ten-minute script, run by a named person, at a test address (section 5) |

Items 6–10 of the handoff's own list ("investigate the 31", "examine the two differences", "re-run tests", "return evidence") are done or are covered by the table above.

### 4. Does the existing architecture support the proposed knowledge library?

**As a reader: yes. As a connected library: not yet.** What I found in the published code:

| | Today |
|---|---|
| Ways of naming a line of Gurbani | **At least four.** Japji (`mool.line01`), Sukhmani (`sukhmani.a17.salok.l01`), Nitnem (`anand01.line01`), the Hukamnama draft (`sggs.gujri.m1.ang504.shabad04.l00`). The knowledge draft (#45) adds its own records, which I have not opened. Some lines of Japji are stored in more than one file. |
| Shapes of scripture data | Four that I have opened: two script files, one file per Nitnem bani, the Hukamnama fixture. The knowledge pilot (#45) is a fifth by its own description. |
| Shapes of a lesson | At least four: Nitnem learning packs, the Ashtpadi 17 lesson, my draft for Ang 504–505, and (by its description) the knowledge pilot's lessons. |
| Saved learning | One separate record per reader (`glp001.continuous.v2`, `glp001.sukhmani.v1`, `glp001.nitnem.…`). No single "my learning". |
| Offline copy | One all-or-nothing set of 56 files, checked at install. Right for a reader of 13 MB. Wrong for 1,430 Angs plus lessons plus a search index. |
| Hosting | Static pages on GitHub. No server. This is a strength: private, free, simple. It is enough for the whole text of the Granth and a search over it. It is not enough for audio files. |

So "search for humility, find passages by several authors, open each in its reader at the right line, and come back" is not possible today, because a passage has no name that every part of the app agrees on.

### 5. What must change, and what can stay?

**Stay, untouched:** the three readers, their look, their saved records, the static hosting, the no-server and no-account design, the refuse-on-doubt behaviour.

**Change — four things, all additive:**
1. **One identity for a line.** Edition, Ang, position, and a fingerprint of the text. Existing readers keep their own names; a small table maps old names to the one identity. Nothing a reader has saved is renamed.
2. **One rule for everything written about a line.** It points at the line's identity and fingerprint and never stores the line again. If the source changes by a letter, the writing shows "needs re-review". (My draft #44 works this way; #41 does not: R2-X-05.)
3. **Two kinds of offline copy.** The reader's shell, as now. Library content fetched as needed, each file checked against a list of fingerprints.
4. **One place for a reader's own learning**, with one backup file — added beside the existing records, never replacing them, and only after Phase 0.

**Not needed:** a graph database, a server, accounts, a search service. A table of relationships in plain files, built and checked before publication, is enough for a long time.

### 6. Which features should be combined, deferred or rejected?

**Combine — twelve workstreams into five lanes:**

| Lane | Takes in |
|---|---|
| Foundation | repairs, integrity, access, privacy, saved learning |
| Scripture | Sri Guru Granth Sahib Ji, Nitnem, Daily Hukamnama |
| Understanding | lessons, dictionary, concepts ("Wisdom"), comparisons |
| Listening | Santhiya, Paath, Mukhwak audio |
| History and heritage | Gurus, Udasis, timeline, contributors, music |

**Defer, each until a named condition is met:**
- **History** — until a historian is engaged and the sources are in hand. I cannot open most of the books on the source list. An AI system writing "immersive narrative" history from memory is the surest way to invent history, which the handoff forbids.
- **Children's library, Sikh Way of Life, Punjab heritage, Raag and Kirtan, the Gurmukhi academy** — until the lane above them has one reviewed example.
- **Dasam Bani beyond Nitnem, Vaaran Bhai Gurdas Ji, Bhai Nand Lal Ji** — until the owner names an edition and a reviewer for each.
- **Three recordings per Bani** — until one recording is cleared. The count today is 0.
- **Neuroscience** — the claims that can honestly be made are few. Keep it inside the human-sciences note of a lesson.

**Reject as written:**
- **"Three levels for everything."** A deep interdisciplinary essay for every passage of 1,430 Angs cannot be reviewed by anyone. Make levels 1 and 2 the standard and level 3 a chosen few.
- **"Natural-language educational questions"** answered by matching tags. The first attempt already shows unrelated passages as "related" (R2-X-02: "ant" finds *sant*, not the Pauri of the ant). Call it "topics" and match whole words from a reviewed list.
- **The nine-tile home screen in section 5.** It contradicts the handoff's own rule in section 17. Four entries are enough: Today · Read · Explore · Saved. A section with no reviewed content should not appear at all.
- **The word "complete"** on anything not yet checked against print. The home page today says "Complete Sukhmani Sahib" and flags the teaching as draft. It does not say the text itself has been compared only with a digital source.
- **"Authenticated"** for anything whose only reviewers were two AI systems. The handoff says this too; the workflow must make it impossible, not merely discouraged.

### 7. The smallest independently verifiable next milestone

**M0 — the repaired reader, seen once on a real iPhone, released.**
The seven rows in question 3. Verifiable by three independent parties: the builder's tests, my re-test, and a person holding a phone. It changes what every real reader has today, which no draft does.

The milestone after it — **M1, one line, one name** — is the Shabad at Ang 504–505 held once and used by three things at the same time: the Hukamnama reader, its lesson, and the knowledge index. Test: change one letter of the source and all three refuse or flag it.

### 8. What can proceed in parallel safely?

Safe, because none of it touches what readers have:
- Finding reviewers (question 9). This is the long pole.
- Permission letters, once the owner allows them to be sent.
- The naming scheme and the editorial rules, as documents for cross-review.
- Recovering the Salok Mahalla 9 text with its pause marks removed.
- My review of #45.
- Synthetic-only work on listening (#46, stage A).

**Not safe in parallel:** anything that changes the published readers' data, saved records or offline copy before M0; any history narrative; more long lessons than a reviewer can read. Besides the 3,773 line meanings already published as drafts, three new long lessons (#44, and two in #45 by its description) and one Ashtpadi overview (#41) are waiting for a human reader who does not exist yet. I suggest a ceiling: no further long lesson is drafted until a qualified person has read one of these.

### 9. Permissions, sources and reviewers required

**People** — none engaged today:

| Needed for | Who |
|---|---|
| Any claim that a text is correct | A qualified Gurbani reader with a printed saroop, and a named printed gutka for Dasam Bani |
| Any Punjabi a reader will see | A native Punjabi reader |
| Any recitation | A Santhiya teacher |
| Any comparison | Someone who knows that tradition |
| Any history | A historian of the Sikhs |
| Wording around illness, grief and distress | A clinician |
| A real-device result | A person with the device |

**Permissions** — 0 requested, 0 granted. Register and unsent letters: #46.

**Sources.** I am not a lawyer; these are facts to put in front of one.
- *Mahan Kosh* (Bhai Kahn Singh Nabha, 1930; the author died in 1938) is old enough that the original is very probably free to use in most countries. A particular digital transcription may carry its own terms.
- *Sri Guru Granth Sahib Darpan* (Prof. Sahib Singh, 1962–64; died 1977) is almost certainly still in copyright. It can be cited and consulted. It cannot be reproduced or closely paraphrased line by line without permission.
- The same holds for Harbans Singh's *Encyclopaedia of Sikhism*, J. S. Grewal, Khushwant Singh, the *Oxford Handbook*, and every modern English translation.
- Macauliffe (1909), *Suraj Prakash*, *Panth Prakash*, *Sri Gur Sobha* and the Janamsakhis are old; modern editions and translations of them are not.
- BaniDB's published terms, as the builder recorded them, attach conditions to use of its data. Written clarification is needed before any use.
- The digital text the app already uses comes from one family (Open Granth, derived from Shabad OS). Its licence terms should be confirmed for the whole Granth before Phase 2.

### 10. Decisions that genuinely need the founder

| # | Decision | My recommendation |
|---|---|---|
| **F1** | **A separate address for iPhone testing** (section 5) | **Yes, on a separate site name.** This is the only one that blocks work today. |
| F2 | Release of the repairs after re-test and device check | Yours alone, when the seven rows pass |
| F3 | Who the qualified reviewers are, and on what terms | One Gurbani reader and one native Punjabi reader first |
| F4 | Which printed edition is the authority for each text | SGPC's standard saroop for Sri Guru Granth Sahib Ji; one named gutka for Nitnem Dasam Bani |
| F5 | Who approves each day's Hukamnama | The original may publish itself only when it equals a reviewed Shabad in every occurrence and SGPC's page carries today's Amritsar date; teaching never publishes itself |
| F6 | Whether the permission letters go out, and in whose name | Yes, in your own name |
| F7 | The sentence shown to a person who types words of distress | As a physician you are the right person to settle it |
| F8 | No further long lesson until a qualified person has read one; repairs before new features | Yes to both |
| F9 | Whether Dasam Bani beyond Nitnem, Bhai Gurdas Ji and Bhai Nand Lal Ji are in scope now | Not until F3 and F4 are answered for each |

---

## 3. Weaknesses in the proposal

I was asked not to simply agree. These are the points where I think the plan is wrong or thin.

1. **Review capacity is treated as a later step. It is the first constraint.** The plan says qualified people "should review". It does not say who, how many, or how they are found. Every phase after 0 produces writing that only such people can release.
2. **The lanes are parallel on paper only.** Since my re-test the repair lane produced nothing and the expansion lanes produced four pull requests. A plan that says "foundation first" needs a rule that makes it true.
3. **Two AI systems reviewing each other share blind spots.** Both read the same single family of digital text. Neither can open a printed saroop. Both write fluent Punjabi that no native speaker has read. Cross-review catches slips; it does not supply authority.
4. **The relay loses information.** My findings reached this handoff through a remembered summary, and two of them changed meaning on the way (section 1). Findings have identifiers. Replies should quote them, from the files.
5. **History is the highest-risk workstream and is described the most ambitiously.** Complete biographies, the Udasis, Partition, 1984. Writing these from an AI system's memory, without the sources open, will produce confident errors about matters people have died over.
6. **Comparisons multiply faster than they can be checked.** Each needs a reader from that tradition. My own eight in #44 have had none.
7. **The entity list is a design for the finished university.** Twenty-two kinds of record before one line has one name. Build the four that M1 needs.
8. **Reflections on an iPhone are less safe than the plan assumes.** By Safari's published policy, a site not added to the Home Screen can have its saved data cleared after seven days without a visit. I could not test this. Until someone does, "private reflections preserved on the device" is a hope, and the backup file is the only real protection.
9. **Thirty-five open drafts.** Nobody can say what is current. Each should be closed with a note or folded into a tracked item before more are opened.
10. **"Free forever" has a cost line nobody has written.** Text is free to host. A library of recitations is not, and GitHub's pages are not the place for it.
11. **The home screen mock-up undoes the Darbar Standard** the same document asks to preserve.

---

## 4. One roadmap

**The dividing line:** Phase 0 changes what readers have. Everything after it stays in drafts that the public app does not link to, until its own gate.

| Phase | What | Depends on | Passes when | Gate before the public sees it |
|---|---|---|---|---|
| **0 Repairs** | The seven rows in question 3 | F1 for row 7 | Every row passes; my re-test is recorded on a named commit | Owner's release (F2). Not automated tests alone |
| **1 One foundation** | One identity for a line; the rule that writing points and never copies; editorial rules; the 35 drafts closed or folded | Phase 0 released | **M1:** one Shabad, one name, three features; one changed letter is caught by all three; the published readers behave exactly as before | Cross-review. Nothing public changes |
| **2 Scripture** | Salok Mahalla 9 first (recovered), then the Granth by Ang, text only | Phase 1; licence confirmed; F4 | Every added line equals the pinned source: n of n. Labelled "compared with a digital source; not yet checked against print". A print-sampling plan agreed with a qualified reader | F3 reviewer's sample; owner's release |
| **3 Daily Hukamnama, original only** | The exit tests in `round2/03_BUILD_ORDER_CORRECTIONS.md` | Phase 1; F5; SGPC's reply or link-only | 14 real days run without publishing: 0 wrong, 0 stale, 0 substituted | Owner's release |
| **4 Understanding** | The lessons already drafted (#44, #45) and the Ashtpadi 17 overview (#41), read by a human; then topics at the reviewer's pace | F3 | A qualified reader's findings are recorded and answered for each published level | That reader's approval, level by level |
| **5 Listening** | Made-up material first; then one recording of Japji Sahib | F6; one written permission | Stage A: 12 of 12. Stage B: 0 of 385 lines wrong | Santhiya teacher's review; owner's release |
| **6 History and heritage** | Parked | A historian; sources in hand | — | — |

**Three working rules I am asking both of us to keep**
1. The builder's next commit is to the repair. No new feature draft while a review reply is unanswered.
2. No further long lesson until a qualified person has read one of those already drafted.
3. One author per subject, the other verifies, and neither approves their own work.

---

## 5. The iPhone test address — hosting, access and isolation

The handoff asks me to be exact about this before anything is switched on.

| | |
|---|---|
| **What it is** | A copy of one chosen draft (first: the repaired reader), served so a phone can open it |
| **The trap** | The library lives at `sskhangura82.github.io/gurbani-learning-library/`. Any second site under the same account would be `sskhangura82.github.io/…` too. A phone treats those as **one site** for saved data. A test copy there could read, change or delete your real saved notes on that phone. |
| **So: hosting** | A site under a **different name**: a new, free GitHub organisation used for nothing else. Different name, separate saved data. No cost. |
| **Access** | **Public but unlisted.** Anyone who has the address can open it. It asks search engines not to list it and carries a banner, "Test copy — not the library". **It is not private and must never be called private or secure.** |
| **What is on it** | Only what is already public in this repository's draft branches: app code and Gurbani text. No notes, no credentials, nothing unpublished beyond those drafts. |
| **Your notes** | Anything typed into the test copy stays on that phone, in the test site's own storage, apart from your real notes. Use made-up notes anyway. |
| **Who can put a copy there** | Only a step you approve each time. Nothing publishes itself. |
| **Taking it down** | Deleting the organisation's one repository removes it. |
| **What I need from you** | The organisation has to be created by you; I will not create accounts. After that I prepare the copy and the ten-minute script. |

An alternative that needs no new name — testing in Safari's private mode — is not a real test: private mode handles saved data and the offline copy differently.

---

## 6. What I did not verify

- #45, the knowledge registry: unopened.
- The builder's count of 320 checks.
- Safari's seven-day rule, on a device.
- Any printed text. Any recording. Any licence beyond the pages I recorded in round 2.
- The copyright notes in question 9 are from general knowledge, not from legal advice or a fresh check of each title.
