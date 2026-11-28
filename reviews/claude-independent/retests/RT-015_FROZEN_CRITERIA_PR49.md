# RT-015 — PR #49, search and navigation repair: frozen acceptance criteria

Committed **before** opening the changed implementation or the builder's evidence.

- Candidate: PR #49, head `1a4537edeecea070d7418e4dbc85f6b18207bbdf`, draft, open,
  unmerged. Verified against the API.
- Base: `fix/knowledge-source-identity-20261126`.
- Reviewed as step 1 of the sequence I recommended in RT-014: the builder should
  not invest in authoring a conflict resolution that preserves behaviour nobody
  has checked.

## A distinction I must hold throughout

**Verified by ancestry: this candidate does NOT contain PR #53 or PR #57.** So
**RB-01 is open on this tree by inheritance from its base, not as a defect PR #49
introduced.** I will not report inherited RB-01 surfaces as findings against this
candidate. The only RB-01-adjacent question that is fair here is whether #49 adds
a *new* surface its base did not have.

Equally, the RT-014 interaction finding is not a finding against #49. A conflict
belongs to a pair, not to one side of it.

## Disclosed exposure

Substantial, and it needs stating. Before freezing I read the PR shape, the
changed file names, and the PR body, which names the defects claimed fixed ("Asa
for NASA", "Haumai for category", missed first-letter searches, lost navigation
context) and summarises validation counts. **No builder test output was
disclosed.**

I have also already read `search.mjs` and the conflicting hunks of `app.mjs` and
`core.mjs` while producing RT-014. So I am **not blind on this implementation** —
I have read parts of it already, in a different context and for a different
purpose. That is exactly the exposure the protocol asks me to declare rather than
pretend away.

What I have never done: exercised this search engine against queries, tested the
navigation behaviour, or checked the claimed false-positive repairs.

## Criteria

### The claimed repairs — each is testable, so each gets tested

| ID | Criterion | Fails if |
|---|---|---|
| RT15-C1 | An English query that merely *contains* an indexed name no longer matches — the "NASA → Asa" class | a substring match still returns the node |
| RT15-C2 | The "category → Haumai" class is likewise refused | a substring match still returns the node |
| RT15-C3 | Genuine queries still match: the exact name, the alias, and the ordinary word | any legitimate query stops returning its node |
| RT15-C4 | First-letter search works in both Start and Anywhere modes and returns the right passage | a known initial sequence misses its passage |
| RT15-C5 | **Nukta distinctions are preserved** — letters differing only by nukta are not collapsed | a nukta-bearing query matches a non-nukta line or the reverse |
| RT15-C6 | Gurmukhi phrase search returns the passage containing that exact substring | an exact in-source phrase misses |

### The rule that outranks search quality

| ID | Criterion | Fails if |
|---|---|---|
| RT15-C7 | Search normalisation is applied to **comparison copies only** and never to stored or displayed scripture | any stored text or rendered line is normalised |
| RT15-C8 | No scripture, teaching or source-lock byte changed from the base | any differs |
| RT15-C9 | Search cannot surface a line whose source check failed | a failure path becomes reachable through search |

### Navigation

| ID | Criterion | Fails if |
|---|---|---|
| RT15-C10 | A reusable address restores the same item, line and depth | a link reopens something else |
| RT15-C11 | Back and Forward return to the previous position; a reload recovers it | position is lost |
| RT15-C12 | An invalid or malformed link **refuses explicitly** rather than guessing | it silently falls back to some other node |
| RT15-C13 | Legacy identities resolve through the recorded crosswalk, with no ordinal or first-line fallback | any fuzzy or positional fallback appears |

### Honesty

| ID | Criterion | Fails if |
|---|---|---|
| RT15-C14 | The Kabir author entrance states its **actual** coverage, not implied completeness | coverage reads as more than it is |
| RT15-C15 | A literal word match is not presented as an attribution or an interpretation | a word hit reads as authorship or meaning |
| RT15-C16 | Nothing claims qualified review or device acceptance | any appears |
| RT15-C17 | The modified workflow still cannot deploy | it can publish |

## Method limits, stated in advance

- One lineage (RT-005). Chromium only; **nothing here is device acceptance.**
- Synthetic data only.
- **Every harness gets a control case.** Eight of my instruments produced a wrong
  first answer today — the eighth about the review itself — and not one was caught
  by cleverness, only by refusing to report a first result.
- RT15-C15 is where my own architecture-review observation lands: `search.mjs`
  carries a static `lookupAliases` map routing `ਨਾਨਕ` to the author node, while the
  word is the poetic signature in thousands of lines by later Gurus. I already
  established it is builder-authored and **not** an injection surface. The question
  here is only how a result built from it **reads**.

Verdicts: PASS / NEEDS_REVISION / INCOMPLETE.

Frozen at this point.
