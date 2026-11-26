# Reconciliation after the owner's update of 26 November 2026

Written by Claude, independent second reviewer, the same day. It reads the owner's "Founder Update, Authorization
and Consolidated Build Direction" beside the review records on GitHub, and says what is settled, what is done, what
is open, and where I think the plan is weak.

Three kinds of statement are kept apart throughout: **checked by me** (always on a computer, never a phone),
**reported by the builder** (not yet something I can check), and **seen by the owner**.

---

## 1. Settled — not to be asked again

| Decision | Source |
|---|---|
| A separate iPhone test address: **yes**. It exists. ChatGPT may stage later test builds there, with the source commit recorded and the previous copy kept. This is not permission to change the live app. | Owner, in chat, 26 Nov |
| Repairs before anything new, in this order: RT1-01, CI-R-09, CI-R-08, CI-S-16, R2-X-04, CI-R-11, CI-U-11; then regression; then my re-test of the named commit. | Owner, 26 Nov |
| A visible source commit and build date on the test copy. | Owner, 26 Nov |
| Made-up notes only in testing; existing reflections, saved lines, reading places and the live offline files are protected. | Owner, 26 Nov |
| Four entrances — Today, Read, Explore, Saved. One passage central; Understand, Listen, Related, Sources one tap deeper. | Owner, 26 Nov |
| R3-01, R3-02, R3-03 before a fourth Salok. A lasting identity for every passage and line; edition locations and fingerprints kept separate from it; Gurbani and teaching in separate files with separate checks and histories; existing reader identifiers carried over by an explicit crosswalk. | Owner, 26 Nov |
| No scores, streaks, rankings, advertising or engagement tricks. | Owner, 26 Nov |
| Daily Hukamnama: the official morning Hukamnama for the Amritsar date; never yesterday's, a random passage or unverified text presented as today's. | Owner, 26 Nov |
| Audio: human, authorised, verified recordings only; no synthetic recitation, no extraction, no relaying of live streams; nothing described as sent or agreed that is not. | Owner, 26 Nov |
| History: documented fact, traditional Sakhi, differing accounts and unverified tradition are labelled apart; nothing invented; no generated images or voices of the Gurus or of Sri Guru Granth Sahib Ji. | Owner, 26 Nov |
| No live generative religious interpretation in the public reader for now. Two AI systems agreeing is not qualified approval. | Owner, 26 Nov |
| ChatGPT builds and researches. Claude reviews independently and verifies exact commits. Where Claude writes, ChatGPT reviews. Neither approves its own work. GitHub is the shared record. | Owner, 26 Nov |
| Milestone 1: a repaired reader, independently reviewed and tested on a physical iPhone. Milestone 2: one canonical passage and its knowledge resources working across several parts of the library. | Owner, 26 Nov |

Three questions I had left open are closed by the update, and I will not raise them again:

- **Shown with a label, or withheld?** The update treats explanations as shown and labelled as drafts awaiting
  review. I work on that basis.
- **Which edition for Dasam Bani?** A question for the qualified reader, not for the owner. The packet is ready
  (`scholar-packet/DASAM_BANI_DIFFERENCES_FOR_PRINT_COLLATION.md`, 138 lines).
- **Which lesson goes to review first?** The owner asks for one complete lesson. My proposal is in section 5; it is
  for the builder to accept or counter on the thread, not a decision for the owner.

## 2. Done

**Checked by me**

- The test copy is the repair candidate plus a label and nothing else: 47 of 60 files identical, every script and
  data file among them; 58 of 58 offline fingerprints match (`device-test/TEST_COPY_VERIFICATION_20261126.md`).
- The ten-minute iPhone check is written and rehearsed; 13 of its 14 steps behave as written on the published
  version, the candidate and the test copy (`device-test/`).
- Gurbani in the published app compared line by line with the digital reference: 3,840 lines, 245 exceptions, each
  listed with its disposition (`consolidated/SCRIPTURE_DISCREPANCY_REGISTER_20261126.md`).
- Three rounds of review and one re-test: 66 entries in the register, and separate lists for PRs #40 to #45.
- Criteria for the next re-test are frozen before the repaired commit exists
  (`retests/RT-002_FROZEN_CRITERIA_BEFORE_SECOND_REPAIRS.md`).

**Reported by the builder — unpushed, so not yet something I can check**

- RT1-01: a separate storage record for kept-aside notes; 20 focused tests passing.
- CI-R-09: the notice freed from the style rule that shrank it; four return situations passing in desktop Chromium.
- Browser run: 14 of 16. Two failing: an export that timed out on an oddly shaped note; an old-reader test blocked
  by the app's own security policy.

**Seen by the owner**

- The test address opens and works on his phone. A first look, by his own words — not the formal check.

**Not done by anyone**

- The formal iPhone check, Safari, VoiceOver, Airplane Mode. Any review by a qualified Gurbani scholar, a Punjabi
  reader, a Santhiya teacher or a historian. Any comparison with a printed page.

## 3. Open, by milestone

### Milestone 1 — the repaired reader

| Step | Who | State |
|---|---|---|
| 1. Push the corrected commit to PR #40 and name it | ChatGPT | In progress on the builder's machine |
| 2. Re-test that exact commit; verdicts before reading the builder's tests | Claude | Ready; criteria frozen |
| 3. Stage it on the test address with the label corrected (TC-01, TC-02, TC-03) | ChatGPT | Not started |
| 4. Check the staged copy is that commit and nothing else | Claude | Tools ready |
| 5. The ten-minute check on the iPhone; answers recorded | Owner | Script ready |
| 6. The three follow-ups that test the repairs on the phone (FU-3, FU-4, FU-5) | Owner, with made-up files from Claude and one special build from ChatGPT | Not started |
| 7. Release decision | Owner | Separate, and after all of the above |

### Milestone 2 — one canonical passage

| Step | Who | State |
|---|---|---|
| 1. Correct R3-01, R3-02, R3-03 in PR #45; publish the old-to-new crosswalk as a file | ChatGPT | Accepted, not started |
| 2. Re-test: the same 19 lines, 35 edits and 582 search cases | Claude | Ready |
| 3. One passage read from one record in two places | ChatGPT | See 5.6 |

## 4. Where I think the plan is weak

1. **"Tested on a physical iPhone" has no definition yet.** Without one it will be argued later. Proposal: the
   ten-minute script answered on the labelled, repaired build, plus FU-3, FU-4 and FU-5 — the three checks that
   exercise the repairs themselves. The other follow-ups can come after release.
2. **The export that timed out should be treated as a fault in the app until shown otherwise.** A person whose
   saved record is damaged is exactly the person who most needs export to work. My re-test will try export against
   ten kinds of damaged record; a hang counts as a failure.
3. **A second storage record is a sound idea with four conditions.** It must be in the export; any control that
   removes notes must remove it too; the shared-device warning must cover it; and importing the same backup twice
   must not double it. All four are in the frozen criteria.
4. **The test banner is in the way.** It covers the line being read in the Japji reader (9 of 9 measurements) and
   the Nitnem reader's own top bar (4 of 4 controls). A phone result taken with it there would look one line off
   even on a correct reader. It also shows no build label (TC-01, TC-02).
5. **Nothing outside GitHub can be reviewed.** Content Pack 002 (Hukam, Maya) is on no branch. Pack 001 is, in
   effect, the two lessons inside PR #45, which round 3 has already examined. The addendum mentioned on 25 November
   has not appeared either.
6. **Review capacity is the real limit, and the numbers are stark.** Compared with a digital reference: 3,840 lines
   of Gurbani. Read by a qualified person: none. Teaching text published as labelled drafts in the Nitnem
   course file alone: about 7,300 passages of forty characters or more. Reviewed by a qualified person: none. The update is
   right to stop adding long lessons until one has gone all the way through review.
7. **CI-S-16 cannot be closed by software.** Its acceptance includes a comparison with a printed page. Put those
   two lines in the first packet for the qualified reader.
8. **Thirty-six pull requests are open.** See section 6.
9. **The long-term rooms should wait for Milestone 2.** History, the dictionary and encyclopedia, and comparisons
   with psychology and other traditions all need the canonical records to point at. A source list can be gathered
   now; writing should not start.

## 5. Proposals — for the builder to accept or counter

1. **Definition of the phone milestone:** as in 4.1.
2. **First lesson for qualified review: Haumai**, once R3-07 and R3-08 are corrected. It is the only lesson whose
   Gurbani has been compared line by line (19 of 19), its weaknesses are already listed, and the owner has named
   what it must address — ਦਾਰੂ ਭੀ ਇਸੁ ਮਾਹਿ, within the whole Salok.
3. **What the first packet holds**, so it can be read in one sitting: the Salok as it stands in the named edition;
   the vocabulary; the English and Punjabi explanations side by side; the sources; the open questions of
   interpretation, stated as questions; and two short extras — the two lines of CI-S-16 for a print comparison, and
   the first page of the Dasam Bani list. The reply is recorded as: who · which item · which version, by
   fingerprint · which language · which area of expertise · date · any conditions.
4. **Who prepares what:** ChatGPT drafts the packet and the list of possible reviewers with outreach letters;
   I check every statement about a person or institution against their own published pages; nothing is sent
   without the owner.
5. **The old-reader test:** the real published reader can be served at the same local address as the candidate and
   swapped on command — no script is injected and the app's security policy is left alone. That is how RT-001 did
   it (`retests/RT-001/tools/switch_server.py`, `rt2c_older_copy_of_reader.py`). Use it freely.
6. **The first canonical passage:** the Salok of Guru Angad Dev Ji on Ang 466. It is already stored twice — once
   in the published app and once in the pilot (R3-22). Making both read one record is the smallest honest proof of
   "one source of Gurbani, many pathways".

## 6. The open pull requests

Facts, from a full-history copy of the repository (`evidence/open_pull_requests_20261126.json`):

| Group | Count | Where they stand |
|---|---|---|
| Opened 23–27 October (#4, #7–#33) | 28 | All left main on 23 October and are 12 to 16 commits behind it. 16 are stacked on one another rather than on main. 19 would conflict with main today. None has been merged. |
| Opened 25–26 November (#38, #40–#46) | 8 | All current with main or one commit behind; none conflicts. |

One further fact about the October set: its teaching text is already in the published version by another route. Of
the 2,130 passages of teaching in the latest course file on that line (#31, #32, #33), **2,115 are in the
published Nitnem data word for word** (`evidence/october_stack_content_in_main_20261126.json`).

Recommendation — the builder's and the owner's to carry out, not mine:

- **October set:** for each, the builder states one of three things — carried into main, superseded, or still
  wanted. The first two are closed with a one-line note; closing loses nothing, the branches remain. I will check
  any "carried into main" statement the same way as above.
- **November set, in order:** #40 (repairs) first. #45 next, as the one canonical record. #43 (Hukamnama) and #41
  (Explorer) then read from that record instead of keeping their own — otherwise the library has three "single
  sources". #42 is a plan and can be folded into the roadmap. #44 and #46 are mine and wait for ChatGPT's review.
  #38 holds only review files and touches nothing in the app.

## 7. What I need from the owner

Nothing now. His next act is the ten-minute check, when the repaired and labelled build has been staged and I have
confirmed the copy.
