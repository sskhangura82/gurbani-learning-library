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
