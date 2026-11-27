# RT-018 — PR #58, combined Knowledge search and attribution: frozen acceptance criteria

Committed **before** opening the implementation and **before** opening
`evidence/knowledge-integration/BUILDER_EVIDENCE.md`.

- Candidate: PR #58, head `b68e080043bb0b4e5cb3d17977e65c8cd62c15b3`, draft, open,
  unmerged. Verified against the API, not taken from the handoff.
- Base: `fix/knowledge-editorial-boundary-20261126`.
- **Verified by ancestry:** contains PR #57 (`f720099`, the frozen RB-01 repair),
  and does **not** contain PR #49 as an ancestor. So this is a **re-authoring** of
  #49's behaviour on top of #57, not a merge of the two — which is the right
  response to a conflict and changes the question from "was the merge resolved
  correctly" to "was the behaviour carried forward correctly."
- `main` re-checked: `a3476ac4…`, unchanged, `protected: false`.

## Why this candidate exists

RT-014 found that #49 and #57 **do not merge** — 11 conflict regions across 4
files, two of them the files RB-01 lives in — and concluded that no combined state
could be reviewed until someone authored a resolution, and that the resolution
would be new code needing its own review. This is that resolution. My own finding
is the reason it exists, which raises rather than lowers the bar: I should be
hardest on the thing I asked for.

## Disclosed exposure

Substantial and stated plainly. Before freezing I read: the PR shape, the changed
file **names**, and `knowledge/INTEGRATION_REVIEW_HANDOFF.md` in full — which the
builder offers as the pre-findings scope document. I have also already read
`search.mjs`, `app.mjs` and `core.mjs` on the **parent** branches while producing
RT-014 and RT-015.

From the handoff I know the claims, including that builder-authored author aliases
are labelled *"Editorial author lookup"* and that inflected-form recall is **not**
implemented. **I have not opened `BUILDER_EVIDENCE.md` or any report under
`evidence/knowledge-integration/`,** and will not until these findings are
committed.

Verified before freezing, because it was cheap and decides what to test:
`knowledge/scripture.json`, `knowledge/pilot.json`, `knowledge/registry.mjs` and
`knowledge/source-lock.mjs` are **byte-identical to PR #57**. So the RB-01 loader
guard I verified in RT-013 is untouched, and the question here is whether the
integration can get **around** it rather than whether it still exists.

## Criteria

### The three ways RT-014 said this could go wrong

| ID | Criterion | Fails if |
|---|---|---|
| RT18-C1 | `contentKind` survives and there is exactly **one** definition shared by rendering and search | the classifier is duplicated, or diverges between the two paths |
| RT18-C2 | #57's editorial/source **display** separation survives — kind labels, `.editorial-copy`, `.editorial-pa`, `data-contentKind`, `lang="pa"` on scripture only | any reverts to #49's bare rendering |
| RT18-C3 | Provenance survives in **search results** — an editorial match and a source match are distinguishable | result rows lose their origin |

### The combined boundary

| ID | Criterion | Fails if |
|---|---|---|
| RT18-C4 | Editorial copy never appears **inside** the original-scripture container | any editorial string renders in the scripture element |
| RT18-C5 | A selection notice never renders inside the scripture container | it does |
| RT18-C6 | The attribution guard still refuses re-pinned teaching mutations through this build | a forged editorial title loads |
| RT18-C7 | A heading-like editorial string the lexical guard **accepts** is still structurally labelled editorial | it renders unlabelled |
| RT18-C8 | Source verification completes **before** the teaching package is requested | teaching is fetched first, or on an unverified source |

### SIG-01, which this candidate addresses in part

| ID | Criterion | Fails if |
|---|---|---|
| RT18-C9 | A builder-authored author alias is labelled as an **editorial** lookup | it reads as a source or attribution match |
| RT18-C10 | A literal word found in the source carries an **occurrence identity** and a distinct source-text reason | a literal match is indistinguishable from an alias match |
| RT18-C11 | An author-alias result carries **no occurrence quotation of its own** | it quotes scripture as though the alias were in the text |
| RT18-C12 | The inflected-form limit is **stated**, not silently papered over, and no linguistic inference is manufactured | `ਨਾਨਕ` is made to match `ਨਾਨਕੁ` by a guessed rule |

### Navigation and refusal

| ID | Criterion | Fails if |
|---|---|---|
| RT18-C13 | Occurrence identity survives opening, Back, Forward and reload | a restored address resolves elsewhere |
| RT18-C14 | Both first-letter modes and exact source quotations still work | either regresses from #49's behaviour |
| RT18-C15 | Invalid and **cross-passage** line addresses refuse explicitly, with no ordinal, text or fuzzy fallback | any guesses |
| RT18-C16 | The named false positives (NASA, category) stay refused while legitimate matches survive | either regresses |

### Honesty and reach

| ID | Criterion | Fails if |
|---|---|---|
| RT18-C17 | The Kabir author entrance states that **only selected passages** are indexed, not the complete Bani — this closes RT17-C14, which I left **INCOMPLETE** | coverage reads as more than it is |
| RT18-C18 | The committed failure screenshots and the harness crash are **genuine preserved failures**, explained, not superseded silently | a failure is presented as a pass |
| RT18-C19 | Nothing claims qualified review, device acceptance or audio rights | any appears |
| RT18-C20 | The workflow cannot deploy | it can |
| RT18-C21 | Knowledge remains **unreachable** from the unified library, the phone preview and `main` | it is live anywhere |

## Method limits, stated in advance

- One lineage (RT-005). Chromium only; **nothing here is device acceptance.**
- Synthetic data only.
- **Every harness gets a control case.** Thirteen of my instruments produced a
  wrong first answer earlier today, one of which looked like a catastrophic
  scripture mismatch and was my own sort order.
- RB-02 is expected to remain open. Its persistence is **not** a failure of this
  candidate; the handoff records it, and a lexical guard catching every editorial
  imitation was never claimed.

Verdicts: PASS / NEEDS_REVISION / INCOMPLETE.

Frozen at this point.
