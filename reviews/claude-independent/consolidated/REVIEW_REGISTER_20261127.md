# Review register — current state, 27 November 2026

**This supersedes the classification in
`REVIEW_REGISTER_RECONCILIATION_20261126.md` wherever the two differ.** That
document is a dated snapshot and stays as it is; its §4 still lists #53 as
"requires repair (RB-01)", which was true when written and is no longer true.
I am not editing it, because the founder quoted from it and a silently rewritten
record is worse than a superseded one.

## Candidates and current verdicts

| PR | head | review | verdict now |
|---|---|---|---|
| #58 | `b68e08004` | RT-018 | **PASS**, 20 of 21 criteria; C18 passes with a stated limitation |
| #57 | `f720099b6` | RT-013, RB-01 closure | RB-01 **closed** against my frozen bar; RB-02 opened (low) |
| #56 | `389e79ba` | RT-011 | reviewed; this is the build deployed as Preview 4 |
| #55 | `acfeb0a1` | RT-010 | reviewed; ART-P01 characterised |
| #54 | `8917beaa` | RT-006 | reviewed; RT4-05 **closed** (my error, corrected) |
| #53 | `83acf3f9` | RT-008 | RB-01 raised here; **repaired in #57**, so no longer "requires repair" |
| #52 | `792afa20` | RT-009 | reviewed |
| #51 | `50ba6e17` | RT-012 | reviewed |
| #50, #41, #42 | — | RT-017 | reviewed |
| #49 | `1a4537ed` | RT-015 | reviewed; its conflict with #57 was re-authored into #58 |
| #48, #45 | `94f004a84`, `8fa9206d9` | RT-020 | chain members; #45 tested directly |
| #47 | `d8202caa1` | RT-019 | **PASS on its own claim.** Does **not** address SK-01 |
| #44, #46 | — | — | **my own drafts.** I may not review them; they need ChatGPT |

## Findings

### Closed

| ID | How |
|---|---|
| RB-01 | repaired in #57, verified against the bar I froze before seeing it |
| RT4-05 | **my register error.** The builder was right; I had conflated "my proposed remedy was rejected" with "no remedy exists" |
| RT17-C14 | closed by RT18-C17 — the Kabir entrance states only selected passages are indexed |
| SIG-01, attribution half | closed in #58: `ਨਾਨਕੁ` returns the Guru Angad passage with source provenance, an occurrence id and correct attribution |

### Open, for the builder

| ID | Severity | State |
|---|---|---|
| SK-01 | **open** | **Now deterministically reproducible** and the mechanism identified (RT-019). Not addressed by #47 |
| SRI-01 | pre-existing | demonstrated on `nitnem/index.html` and now also on `knowledge/index.html` |
| ART-P01 | open | characterised across four PDF engines on byte-identical input |
| SIG-01, recall half | open **by design** | `ਨਾਨਕ` does not infer `ਨਾਨਕੁ`. Stated in the UI and the handoff. I am **not** asking for this to be closed — inferring it would be a linguistic claim the pilot cannot support |
| CHAIN-01 | low | partial-landing hazard across #45→#58; three mitigations recorded |
| PREV-01 | low | the "Preview 4" label is on `preview.html`, not on the root the founder was told to open |
| RB-02 | low | split-field |
| ANG-01 | low | — |
| EXP-01 | low | — |

### Not closable by review at all

- Printed-source collation against a second textual lineage. Open Granth and my
  Shabad OS reference both declare the same upstream, so they are **one** lineage,
  not two witnesses.
- Physical iPhone / iPad / VoiceOver / airplane-mode acceptance.
- Audio rights; the gurbani.org permission letter is drafted and unsent.

## Corrections I have made to my own record

Kept together deliberately, because a reviewer's error rate belongs in the same
document as the findings.

1. **RT4-05** — downgraded verified work to "requires repair" in the document the
   founder was using to decide integration order. The builder caught it.
2. **SK-01 rate** — published 1-in-16, corrected to 1-in-60.
3. **SK-01 character** — wrote that an off-by-one hunt "would not have found it."
   Wrong: there is a deterministic off-by-N inside the race.
4. **SK-01 cost** — implied ~60 runs to verify a fix. Wrong in the expensive
   direction; it is now a deterministic test.
5. **RT18-C21 method** — verified the phone-preview clause against a branch in
   this repository when the preview is served from a different repository. Right
   answer, wrong method; re-verified against the served page.
6. Nineteen instrument errors recorded across the review line, four of them in
   RT-018 alone, plus two defects in my own frozen criteria.

## Outstanding founder acts

Unchanged, and still only these two:

1. **A branch-protection rule on `main`.** `main` is `protected: false`. CHAIN-01
   is now a concrete scenario for it: five stacked drafts are all simultaneously
   mergeable, and nothing prevents the oldest landing alone.
2. Closing the historical PRs that triage identified as housekeeping.

Neither is urgent tonight. Nothing else requires him, and I have not approved,
merged, deployed or pushed to `main`.


---

## Update, later the same evening — appended, not rewritten

Three entries above changed after I wrote them. Appending rather than editing, so
nothing already read changes meaning.

### Candidate added

| PR | head | review | verdict |
|---|---|---|---|
| #59 | `e0a6cff2` (app bytes identical to `b69d6b31`) | RT-021 | **PASS**, 25 of 26 criteria; C24 untested by me |

PR #59 repairs the reader-page subset of SRI-01 and the ordinary resume/reload
portion of SK-01. It is based on #56 and remains unmerged.

### Findings that moved

| ID | Was | Now |
|---|---|---|
| **PREV-01** | low, open | **WITHDRAWN.** My instrument was unfit for the question; the builder's raw bytes and rendered DOM stand. No defect asserted |
| **SK-01** | open, diagnosed | **open, with a verified fix awaiting merge.** The repair in #59 is independently confirmed: four zero-movement controls preserved, no input whitelist across three input paths, reload leaves the record byte-identical |
| **SRI-01** | pre-existing, open | **reader-page subset addressed in #59** — 36 of 36 pins valid, altered scripts refused, no scripture rendered when blocked, learning preserved. **Still open** for the library module graph, the served HTML document itself, and every page on `main`, which has 43 script tags and 0 pins |

### New

| ID | Severity | State |
|---|---|---|
| **CI-56-01** | low | PR #56, the build deployed as Preview 4, carries a stale test assertion — the manifest holds 85 assets, the test asserts 81 — which its own CI never ran because the workflows are path-filtered. Established four ways, and the builder reached it independently. Not a scripture or reader defect; the concern is that an unexplained red check is how a real regression gets dismissed later. Addressed in #59's follow-up commit |

### Unchanged

Open for the builder: RB-02, ANG-01, EXP-01, ART-P01, SIG-01's recall half (open
**by design**), CHAIN-01.

Not closable by review: printed-source collation against a genuinely second
textual lineage, physical iPhone / iPad / VoiceOver / airplane-mode acceptance,
and audio rights.

Founder acts: still only the branch-protection rule on `main` and closing the
housekeeping PRs. Neither urgent.

### My corrections and error count, updated

The six corrections above become seven, with PREV-01's withdrawal the most
consequential of the session because it reached the founder and concerned the
build he was about to open. Instrument errors now stand at **twenty-three**, of
which two in RT-021 were **repeats of errors I had already written down** — a
crude regex reading a denial as a claim, and measuring the Nitnem landing page.
Writing an error down has not been sufficient to stop me repeating it, which is
the honest summary of my own reliability tonight.


---

## Second update — PR #60 and the build lock

### Candidate added

| PR | head | review | verdict |
|---|---|---|---|
| #60 | `44401e35` (app bytes identical to `69e24fe4`) | RT-022, RT-023 | **PASS.** Closes MOD-01; all 9 delta criteria met; CI green on all nine checks |

### Findings that moved

| ID | State |
|---|---|
| **MOD-01** | **CLOSED** by #60. Bundling removes transitive imports, so entry-point integrity covers the graph. The RT-018 exploit — neutralising the guard in the loose `registry.mjs` — now has no effect |
| **BUILD-01** | **opened and CLOSED the same evening.** The lockfile held absolute paths from the generating machine, so `npm ci` and both documented checks could not run. Regenerated; install succeeds and the bundles now **reproduce byte-for-byte** from the reviewed modules |
| **SRI-01** | reader pages (#59) and Library/Articles/Knowledge (#60) now covered — **14 pages, 51 scripts, all pinned and recomputed valid.** Still open for the served HTML document itself, the worker, and all of `main`, which has 43 script tags and 0 pins |
| update-failure preservation | was "demonstrated by neither of us"; now **builder-demonstrated, not independently verified** — the previously skipped job ran and passed |

### A correction that was not mine

The builder corrected their own reference: the Explorer carrying EXP-01 is PR
#41, not #50. My RT-017 findings already attributed it to #41, so nothing of
mine needed changing. Recorded so the correction is not later credited to a fix
of mine.

### Error count

Unchanged at twenty-three. RT-022 and RT-023 added none — but their frozen
criteria caught a real gap in mine: I had tested nothing under a non-root URL
path, which is how the site is actually served. It passes, on their criterion.
