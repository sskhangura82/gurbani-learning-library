# RT-004 — PR #52, Salok Bhagat Kabir Ji: independent verdict

Criteria and cold scripture verification were frozen first, in
RT-004_FROZEN_CRITERIA_AND_SCRIPTURE_VERIFICATION.md, before this file.

- Candidate: PR #52, head 792afa209c98bb53f257a8dfd5500bef10bfc8e3, draft,
  branch feature/kabir-salok-reader-20261126, stacked on PR #51
  (feature/salok-mahalla9-reader-20261126, head 50ba6e17), base
  fix/claude-review-first-repairs-20261125.
- Reference used, independently of the application: Shabad OS Database
  v5.0.0-next.0, dist/master.sqlite, asset SSA2, section SQST.
- Protocol note repeated: the relayed build report had already shown me the
  builder's claimed figures and test counts, so I was not blind on those. The
  scripture verification was done cold and before reading their work.

## Verdict on the scripture layer: PASS

This is the strongest scripture verification result the project has produced.

| Check | Result |
|---|---|
| Numbered Saloks in the text | **243**, 1–243, no gaps, no duplicates |
| Occurrences: verse + structural | 486 + 8 = **494** |
| Reference line count for the same section | **494** — exact match |
| Lines byte-identical to the reference, in order | **493 of 494** |
| Embedded Mahalla Saloks | **6** (5 Guru Arjan, 1 Guru Amardas) in original positions |
| Salok Mahalla 9 (PR #51) | **57**, 1–57, no gaps, no duplicates |

Normalisation applied before comparison: the reference inserts its own editorial
phrasing marks (comma, semicolon, full stop) which are not Gurbani. With those
stripped, 493 of 494 lines are identical in content and in sequence.

### The single difference, and it is documented

| | Text |
|---|---|
| Reference | `ਸਲੋਕ ਭਗਤ ਕਬੀਰ ਜੀਉ ਕੇ ॥` |
| Candidate | `ਸਲੋਕ ਭਗਤ ਕਬੀਰ ਜੀਉ ਕੇ` |

The collection heading, without the trailing danda. This is **not silent**: it is
recorded in sourceAudit.explicitHeadingSelections with before and after
SHA-256 values, action SELECT_EXACT_ALTERNATE_WITNESS_HEADING, and three cited
bases, with the honest note that publisher attribution on one scan is not
independently authenticated. Process correct.

## Integrity chain: independently reproduced in full

| Check | Result |
|---|---|
| Per-line SHA-256 recomputed from the line text alone | **494 / 494 correct** |
| Data file digest vs the value recorded in library.json | **match** |
| sourceTextSequenceSha256 | **reproduces** as SHA-256 of the newline-joined texts |
| Structure and attribution pin at reader.js line 112 | **reproduces** as SHA-256 of JSON.stringify([preface, units, sourceAudit]) |

The design point worth naming: **both digests are pinned in reader code, not
only in the data file.** A tampered data file cannot quietly update its own
digest and pass. That is the right shape for this guard and it is the first
place in the project where I have seen it done this way.

Teaching bindings are enforced in code, not merely labelled: an explanation
throws unless it carries a source anchor whose id and SHA-256 both match a real
source line, and unless its status is DRAFT_AI_UNREVIEWED.

## Separation of scripture from teaching: PASS

Of the 494 scripture lines, **1** appears verbatim inside the teaching file, and
it is the collection title used as a label. There is no second copy of Gurbani.
The builder's stated goal of avoiding competing copies is met in fact.

The reader also reuses the existing shared verification path in nitnem/reader.js
rather than introducing a parallel implementation.

## Draft labelling and coverage honesty: PASS

All **737** teaching entries (243 unit lessons, 486 line notes, 8 heading notes)
carry status DRAFT_AI_UNREVIEWED. Zero exceptions.

The coverage block reports reviewedUnitLessons: 0 and
reviewedSourceMeaningLines: 0 alongside writtenUnitLessons: 243. Educational
drafting and independent review are counted in separate columns, which is what
the standing rule requires. The 111 AI corrections are nowhere counted as
review. RT4-03, which I raised pre-emptively, is satisfied by the implementation.

## RT4-01 — CLOSED, and the builder is vindicated

I raised that the excluded "Farid occurrence" was not reproducible against my
reference. Their sourceAudit.excludedFromKabir answers it exactly:

> upstream line V41B, group G4W, section **X63C SalokFareedJee**, author FRID;
> printed Ang 1378 begins with this line; the pinned importer sorting by
> page/line caused the interleaving.

My own reference independently confirms that **X63C is Salok Fareed Jee**, that
the Kabir Saloks run to Ang 1377, and that there is **no Farid attribution and no
occurrence of ਫਰੀਦ anywhere** in the Kabir section. So the line was never a Kabir
Salok, the exclusion is correct, and it is recorded with
canonicalRelocationApplied: false and frozenPR50Modified: false — nothing
relocated, nothing in the frozen intake touched.

My question was the right one to ask and the answer was already in the file.

## RT4-02 — CLOSED, and they went further than I did

I flagged Saloks 212 and 213 — the Trilochan and Namdev dialogue, which names
both Bhagats yet is attributed by the reference to Kabir — as the hardest case
of "a signature alone does not assign authorship", in reverse.

Their attributionPolicy.namedVoiceReviewSaloks lists **212, 213, 241, 242**, and
limitation 4 states that named voices in those four are preserved separately and
that signatures alone do not assign authorship. They identified the same two I
did plus two I had not checked.

## FINDING RT4-04 (low, new information) — a fourth witness disagrees on the heading

The builder cited three bases for dropping the trailing danda from the collection
heading. **Shabad OS Database v5.0.0-next.0 asset SSA2 carries the heading WITH
the danda**, so it is a fourth independent digital witness and it disagrees with
the selection.

This is not a defect and does not change my PASS. Their process was correct and
the difference is recorded. But the witness count on each side has changed and
the qualified reviewer should see that, rather than reading "three bases" as
unanimity. Recommend adding Shabad OS to the witness list on the opposing side.

## Two errors of my own, recorded

**My normaliser under-stripped the reference's pause marks, twice.** The first
pass reported 47 differing blocks and 442 of 494 lines identical. Every one of
those blocks was a comma the reference inserts and the candidate does not. After
fixing my own normaliser the true figure is 493 of 494. Had I reported the first
number it would have been a serious false alarm about scripture.

**Earlier in the day the same class of error** nearly made me report a verified
Sukhmani line as unverified, because the reference inserts a semicolon mid-line.
That is twice in one day from the same root cause: my tooling treats the
reference's editorial phrasing marks as text. I have folded comma, semicolon and
full stop into the normaliser used here, and any future comparison tool must do
the same before reporting a discrepancy.

## Overall verdict: INCOMPLETE — not because anything failed, but because I have not finished

PASS on everything I tested: the scripture, the counts, the integrity chain, the
separation, the draft labelling and the coverage honesty.

Not yet tested, and therefore not claimed:

| Criterion | State |
|---|---|
| RT4-C5 separation-guard mutation test in a live reader | not run |
| RT4-C6 large-backup round trip | not run — this is the repair they report, and it is unverified by me |
| RT4-C7 on-screen label check at mobile width | not run |

And the two that no amount of my work can close:

- **Qualified Sikh scholarly and Punjabi review.** 737 draft entries, none
  reviewed by a qualified human. The builder states this plainly and the data
  enforces it. It remains the binding constraint.
- **Physical device acceptance.** I now have Safari 26.6 on macOS evidence
  (see device-test/results/SAFARI_MACOS_20261126.md), which is desktop WebKit
  only. No iPhone, iPad, Home Screen or VoiceOver result is claimed by anyone.

## Note for the builder on SF-01

Separately from this PR, Safari 26.6 testing today found that going to the
library and pressing Back loses the reading place in the Japji reader on build
1470477, three times out of three, and that the cause is the
history.scrollRestoration='manual' repair. This new Kabir reader loads the same
shared nitnem/reader.js and continuous-core.js. **It is likely to share the
defect and I have not tested it here.** Worth checking before this stack goes
further.

## Do not merge

I do not approve and I do not merge. Both PRs are drafts and should stay drafts.
Nothing here authorises promotion to the live family application, and automated
and hosted checks passing is not a basis for merging.

---

# Addendum — RT4-C6 backup round trip now tested, and two corrections

Added after the verdict above, on the same candidate (792afa2). The backup
repair was the one claim in this PR I had flagged as unverified by me. It is now
tested. Synthetic data only.

## The bug they fixed was real

The old guard was a flat cap: `text.length > 2500000`. For this collection a
rule-legal maximal backup needs **486 lines × 12,000 units = 5,832,000 units**
of notes alone. So the old fixed cap genuinely could refuse a learner's own
valid backup, exactly as reported. The new guard scales with the collection:
envelope + `ids.size × NOTE_LIMIT × 6`, which for Kabir is **35,035,195 bytes**.

## RT4-C6: PASS on the repair, with a boundary finding

Tested against the shipped code and the shipped data in a real browser.

| Test | Result |
|---|---|
| Legitimate backup of 2,741,599 chars (10% over the old cap) | **parse ACCEPTED, import ACCEPTED** |
| Round trip of that backup | **486 of 486 notes present and byte-intact, 50 bookmarks preserved** |
| A note of 12,001 units | **refused** — per-note limit preserved as claimed |
| A note of exactly 12,000 units | **accepted** — the limit is not off by one |
| A file deliberately over the new budget | **refused** |
| Page errors throughout | none |

## FINDING RT4-05 (medium) — the new ceiling is above the real one

At the **maximum** rule-legal backup — every one of the 486 lines noted at
exactly the 12,000-unit limit, every line bookmarked:

| | |
|---|---|
| Size | 5,875,177 chars / **17,539,177 UTF-8 bytes** |
| Against the old cap | **2.35×** |
| Against the new budget | within it, with 17.5 MB of headroom |
| Size guard | **ACCEPTED** |
| Actual import | **FAILED — localStorage quota exceeded** |

The repair raised the importer's own limit to about 35 MB, but browser
localStorage is typically 5–10 MB per origin. So there is now a window where the
importer says yes and the browser says no. The guard is no longer the binding
constraint; storage is, and nothing checks it.

**The data is safe — see below — but the message is not.** On that path the
learner sees the raw browser string:

> Failed to execute 'setItem' on 'Storage': Setting the value of
> 'glp001.nitnem.PRIVATE-SOURCE-REVIEW.v1.salok-kabir…' exceeded the quota.

Every other refusal in this importer ends with reassurance — "Nothing changed",
"The original record is preserved", "Keep both backups; nothing changed". This
one does not, and it is the only path that reaches the physical ceiling. A
learner seeing it has no way to know their own reflections are intact.

**Recommendation:** cap the allowance at the lesser of the rule-derived budget
and a realistic storage budget, and wrap the quota failure in the same
reassuring language as the others. Status OPEN.

## Confirmed safe: a failed import does not destroy existing work

The standing rule is "a failed update must not destroy a working previous
version." Tested directly: seeded synthetic reflections, then attempted the
maximal import.

| | Before | After the failed import |
|---|---|---|
| Notes | 2 | **2, both byte-intact** |
| Bookmarks | 1 | **1** |
| Revision | 1 | **1 — not advanced** |
| Reading position | preserved | **preserved** |
| Export afterwards | — | **works, 2 notes** |

**Verdict: PRESERVED.** The rule holds.

Worth recording that the two failure paths differ. With an **empty** store the
maximal import reaches the storage write and fails on quota with the raw message
above. With **existing** notes it fails earlier and more gracefully, at the merge
guard: "Combining these reflections would exceed the limit. Keep both backups;
nothing changed." Both preserve data. Only the first is unhelpful, and it is the
one a new learner restoring a backup on a fresh device would hit.

## CORRECTION to my own PR comment — SF-01 does not affect this reader

In the comment I posted on PR #52 I wrote that because the Kabir reader loads
the same shared nitnem scripts it was "likely to share" the SF-01
back-navigation defect.

**That was wrong, and I had not checked before saying it.**
`history.scrollRestoration='manual'` is set in exactly one file in the whole
build, `js/japji-full.js`. It appears nowhere in `nitnem/reader.js`,
`nitnem/continuous-core.js`, any other shared script, or the Kabir reader's own
page. The Kabir reader and the Nitnem readers do not set it and do not inherit
the defect. SF-01 is confined to the Japji full reader.

I have posted the correction on the PR. Recorded here because a reviewer's
unchecked guess sent to a builder is a defect in the review, not a note in it.

## Revised state of the frozen criteria

| Criterion | State |
|---|---|
| RT4-C1 scripture extent and numbering | PASS |
| RT4-C2 embedded Mahalla Saloks | PASS |
| RT4-C3 no authorship from a name alone | PASS |
| RT4-C4 differences recorded openly | PASS (RT4-01 closed in their favour) |
| RT4-C5 separation guard, live mutation | **still not run** |
| RT4-C6 large-backup round trip | **PASS, with RT4-05 open** |
| RT4-C7 on-screen labels at mobile width | **still not run** |
| RT4-C8 no false device claims | PASS |

Overall verdict unchanged: **INCOMPLETE**, now for two reasons rather than
three, plus RT4-05 open. Qualified human review and physical device acceptance
remain outside anything I can close. No approval. No merge. Drafts stay drafts.
