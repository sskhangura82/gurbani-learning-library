# RT-007 — PR #55, article engine: frozen acceptance criteria

Committed **before** opening any changed code, any `docs/` file or any
`evidence/` file.

- Candidate: PR #55, head `acfeb0a157fc2cf38ae7ccbaeb2c53d8e97d3bec`, draft.
- Base: PR #54 at `8917beaab7acc5770cb5a8fee682c9702a0689cb`, which I verified in
  RT-006 and which the builder states is unchanged and unmerged.
- The builder requests no verdict and claims no acceptance.

## Protocol honesty, stated before anything else

The builder placed their evidence summary inside a collapsed block labelled
"after your findings are committed." **That block was delivered to me in full by
the notification channel, so I have already read it.** I am not blind on their
evidence summary and will not pretend otherwise. Specifically I already know they
report an open finding ART-P01 on PDF text-copy interoperability, that strict
PyMuPDF extraction fails for a conjunct in each sheet, and that PDFium, PDFKit
and Poppler disagree.

What I can still do cold, and will do first, is the scripture correctness of the
two Saloks the engine displays. That is the part their tests cannot substitute
for, and it is where a content-free framework can still do real damage.

Read before freezing: the PR shape and the changed file **names** only. All new
code is under `articles/`, with `index.html`, `sw.js`, `tools/build-offline.mjs`
and some test files modified. **No scripture or teaching data file appears, and
no existing reader is modified** — consistent with their claim and itself
criterion RT7-C1.

## Criteria

### Scripture correctness — the part that matters most

| ID | Criterion | Fails if |
|---|---|---|
| RT7-C1 | No source package, teaching package, source lock or existing reader changed | any differs from the frozen base beyond offline-manifest and integrity-hash mechanics |
| RT7-C2 | Every Gurmukhi line the engine displays is byte-identical to the source package it cites | one character differs |
| RT7-C3 | The two Saloks are **complete** — no line dropped, none added, order preserved | the line set or order differs from the source |
| RT7-C4 | Every displayed line's anchor resolves to a real line id **and** its recorded SHA-256 matches | any anchor dangles or any digest mismatches |
| RT7-C5 | Nothing in the engine can render a line whose source check failed | a failure path still displays text |

### Honesty of the framing

| ID | Criterion | Fails if |
|---|---|---|
| RT7-C6 | Explanations are genuinely empty — no exposition, paraphrase or interpretation anywhere | any explanatory sentence about meaning appears |
| RT7-C7 | Topic associations are labelled as literal word matches awaiting qualified review | they read as established thematic coverage |
| RT7-C8 | No Ang is asserted as independently established | an Ang appears as fact without its basis |
| RT7-C9 | Editorial and draft status visible on screen **and in print** | either omits it |
| RT7-C10 | No claim of qualified review, device acceptance or printed-source authentication | any appears |

### Print and copy fidelity

| ID | Criterion | Fails if |
|---|---|---|
| RT7-C11 | A verse and its explanation slot stay together across a page break | they can split — the defect the builder found in my own v2 proof |
| RT7-C12 | ART-P01 is reproduced or refuted by me independently, not taken on report | I assert their result without testing |
| RT7-C13 | No normalisation workaround hides a copy-fidelity failure | extracted text is silently repaired before comparison |

RT7-C12 matters because a reader copying Gurmukhi out of a printed or exported
sheet and getting a corrupted conjunct is a scripture-fidelity problem, not a
typography nicety. I will attempt my own extraction rather than relay theirs.

### Scope

| ID | Criterion | Fails if |
|---|---|---|
| RT7-C14 | The knowledge-pilot stack is not integrated and RB-01 is not implicitly closed | either is touched |
| RT7-C15 | Workflows test and upload only; nothing can deploy | any workflow can publish |

## Method limits, stated in advance

- Scripture comparison normalises the reference's editorial comma, semicolon and
  full stop **for comparison only**. Raw strings are never altered. The danda
  `॥` is part of the text and is never touched.
- Any Ang I can check sits in one textual lineage (RT-005): the app pins Open
  Granth, which declares Shabad OS as its source. No Ang finding of mine can be
  called independently authenticated.
- I will test by **anchor id and digest**, not by scroll position — adopting the
  better instrument the builder demonstrated in RT-006.

Verdicts: PASS / NEEDS_REVISION / INCOMPLETE.

Frozen at this point.
