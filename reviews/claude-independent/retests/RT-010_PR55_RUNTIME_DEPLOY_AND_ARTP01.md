# RT-010 — PR #55: the three outstanding checks

Closes RT7-C5, RT7-C15, RT7-C12 and RT7-C13, which RT-007 left unverified.

- Candidate `acfeb0a157fc2cf38ae7ccbaeb2c53d8e97d3bec`, confirmed by `git rev-parse`.
- Synthetic mutations on throwaway copies. **No repository file was modified.**
- PyMuPDF held at **1.26.6 / MuPDF 1.26.11** — the version that fails. Not upgraded.
- No normalisation was used to turn a failure into a pass. An NFC comparison was
  computed, labelled diagnostic-only, and changed no outcome.

## RT7-C5 — nothing renders when a source check fails: PASS

Instrument validated first: I reproduced the engine's whole digest chain
independently — 57/57 unit digests, 117/117 line fingerprints, the sequence
digest and the file digest. So every refusal below is attributable to the
mutation, not to my arithmetic.

Thirteen cases against the live page, each on a fresh copy. The engine was also
probed directly so I have the **reason** for each refusal, not just the absence
of output.

| Case | Refusal code | Rendered? |
|---|---|---|
| Control, nothing altered | — | **2 lines, Gurmukhi present, print enabled** |
| One character changed, digests stale | `ARTICLE_SOURCE_DIGEST` | no |
| Same, in-file digests regenerated | `ARTICLE_SOURCE_DIGEST` | no |
| Same, + package file pin repinned | `ARTICLE_SOURCE_SEQUENCE` | no |
| Same, + sequence pin repinned | `ARTICLE_REFERENCE` | no |
| Same, **all five pin layers forged** | accepted | **yes — see below** |
| Selection token altered, all pins forged | `ARTICLE_SELECTION` | no |
| A verse line deleted, all pins forged | `ARTICLE_SOURCE_IDENTITY` | no |
| `humanCollationApproved` flipped true | `ARTICLE_SOURCE_REVIEW` | no |
| **An explanation sentence injected into the catalog** | `ARTICLE_EXPOSITION` | no |
| **A teaching claim injected into the catalog** | `ARTICLE_EXPOSITION` | no |
| **`reviewStatus` raised to QUALIFIED_REVIEW_COMPLETE** | `ARTICLE_LAYER` | no |
| `semanticReviewed` flipped true | `ARTICLE_SELECTION` | no |

Every refusal lands on its own distinct gate, and the four pin layers peel off
one at a time in the right order. On refusal the text never reaches the DOM at
all — not hidden, **absent**: no Gurmukhi anywhere in the document, `#passages`
empty, print disabled, and an honest panel saying *"The source references could
not be checked. No passage has been displayed."* That is a stronger result than
RT7-C5 asked for, which only required that no failure path display text.

**The four catalog cases are the ones that matter most to the project's rules.**
`catalog.json` is editable data with no byte pin, yet an injected explanation, an
injected teaching claim, a raised review status and a forged semantic-review flag
are all refused by frozen code contracts. That is the structural reason an
AI-written explanation cannot reach the reader as scripture, and it holds even
though the catalog is the easiest file in the tree to edit.

**The selection-token result deserves its own line.** With the *entire* digest
chain forged — all five pin layers repinned — altering the selection token was
still refused, because the engine independently re-verifies that the literal
token occurs in the linked Salok. That is a real second mechanism, not another
digest.

### The limit, stated as a limit

With all five pin layers forged, the page rendered my altered text. It rendered
**ਕਹੁ ਮਾਨਕ** where the source reads **ਕਹੁ ਨਾਨਕ** — my mutation altered the Guru's
name and the page displayed it.

This is inherent, not a defect, and I am not filing it as one: rewriting
`reader.js`/`source-contracts.mjs` and the page's integrity attribute means
owning the application, and no in-app check survives that. It locates the root of
trust exactly — **the served HTML** — and nothing inside the application protects
it. Same conclusion as PR #52's deep test, reached independently here. Carried to
the architecture review.

## RT7-C15 — the workflows cannot deploy: PASS on the workflows, with one gap I cannot close

All five workflows checked mechanically, not by eye:

- `permissions: contents: read` on every one. No `pages: write`, no
  `id-token: write`, no `contents: write`, no `deployments`.
- Triggers are `pull_request` and `workflow_dispatch` only. No `push`, no
  `schedule`, no `release`, and **no `pull_request_target`** — so a fork PR
  cannot obtain a writable token.
- No `deploy-pages`, `upload-pages-artifact`, `gh-pages`, `peaceiris`,
  `JamesIves`, auto-commit action, `git push`, `environment:` or `secrets.`
  anywhere in the repository.
- The only uploads are `actions/upload-artifact`, which stores evidence on the
  run. That is not publication.

So **no workflow can publish the application.** The `build-offline` and
`refresh-*-sri` steps do write files in the runner's checkout, but they are
immediately followed by `git diff --exit-code`, which makes them reproducibility
assertions rather than a write path, and `contents: read` means nothing can leave
the runner regardless.

**The gap.** `has_pages` is true on the repository, and since no workflow
deploys, Pages must be serving from a branch. I could not read which branch:
`/repos/.../pages` and the branch-protection endpoint are both blocked to me
through this proxy (HTTP 403). So I can confirm the workflows are not the deploy
path, and I cannot confirm what is. If Pages serves `main`, then **a merge is the
deploy**, with no gate between merge and the public family application. That is a
founder item, listed in the consolidated report.

## ART-P01 — four engines, identical bytes. RT7-C12 and RT7-C13 satisfied

Ground truth taken from the **local source packages, never from a PDF**. Byte
identity proven on both machines: `haumai-source-sheet-a4.pdf` is
`6a5bc6b6…aba3a3c` and `dubidha-source-sheet-a4.pdf` is `ca89a453…c0634d9f` in my
container and on the Mac. Same bytes, four engines.

| Engine | Result | Mechanism |
|---|---|---|
| **Poppler 24.02.0** | **exact** — both lines, both sheets, A4 and Letter | honours the per-cluster `/ActualText` |
| **PDFium 5.14.0** | every character correct, but a **spurious space inserted before each `/ActualText` span** | treats each span as its own text segment |
| **PyMuPDF 1.26.6** | line 1 only: **ਾ (U+0A3E) duplicated** → `ਪ੍ਰਾਾਨੀ` | seam bug at the `ਪ੍ਰਾ`∣`ਨੀ` boundary |
| **PDFKit (macOS)** | **worst.** 10 × U+0000 NULL per sheet replacing the conjunct and several vowel signs; sihari reordered before its consonant | ignores `/ActualText`, falls back to glyph-level ToUnicode |

PDFium's spacing is fully accounted for: all eight split points on line 1 sit
exactly on an `/ActualText` boundary.

PDFKit was tested on the **copy path proper** —
`selectionForEntireDocument.string`, which is what Select All + Copy yields — not
only the extraction API. On the dubidha sheet it destroys **ਦੁਬਿਧਾ**, the sheet's
own topic word: the aunkar becomes NULL and the sihari jumps ahead of its
consonant. On the haumai sheet **ਹਉਮੈ** loses its dulavan to a NULL.

This matters more than the other three combined, because PDFKit is Preview and
Quick Look — the default way a PDF opens on every Mac, iPhone and iPad. A family
member who opens the printed sheet on an iPad and copies a line gets Gurbani
containing null bytes and transposed letters.

### Two corrections to my own earlier framing

1. I had described the PyMuPDF failure as **losing the conjunct ਪ੍ਰ**. That was
   wrong. The conjunct is intact (`0A2A 0A4D 0A30`); a **vowel sign is
   duplicated**. I had the right file and the wrong defect.
2. I expected to find that the PDF lacked `/ActualText` and that this was a
   **generation defect**. Wrong on both counts. `/ActualText` is present — 23 and
   25 spans — carrying correct Unicode in correct logical order with the
   conjunct intact (`ਪ੍ਰਾ` = `0A2A 0A4D 0A30 0A3E`).

**So the generated PDF is standards-correct and all three failures are
viewer-side.** This reverses the recommendation I was heading toward: there is no
font change and no generator fix that would make Apple Preview copy correctly,
because the correct mechanism is already in the file and Preview ignores it.

### What follows

The builder's existing on-sheet warning — *"Copying Gurmukhi from a saved PDF can
change characters in some viewers. Use the reader for the original text."* — is
the **right mitigation and is already present**. The architecture is sound: the
reader is the authority, the PDF is a convenience. My only wording point is that
"can change characters" understates NULL bytes and transposed letters in Apple's
default viewer.

A possible improvement, offered as a direction and not a design: merging the
per-cluster `/ActualText` spans into one span per verse line would likely fix
PDFium and PyMuPDF. It would probably **not** fix PDFKit, which ignores the
mechanism altogether. **ART-P01 stays OPEN, reclassified** from extractor
disagreement to characterised viewer-side `/ActualText` handling.

### A separate finding: the committed print evidence is not what CI produces

The committed PDFs embed **.SFNS-Regular, Charter-Roman and GurmukhiMN** — all
Apple system fonts. They were generated on a Mac. But CI regenerates these same
paths with Chromium on Linux plus `fonts-noto-core`, and **does not diff the
PDFs** against the committed copies (its `git diff --exit-code` covers the frozen
source files and `sw.js`, not `evidence/articles/print/`).

So the committed artifacts are a Mac snapshot that CI never validates, and a
green run does not establish that the committed evidence is what the pipeline
makes. My ART-P01 results are specific to the committed bytes. The mechanism is
span-boundary handling, which I expect to be font-independent, but I have not
tested the Noto-generated output and do not claim it.

## Verdict

RT7-C5 **PASS**. RT7-C15 **PASS** on the workflows, with the Pages source
unverifiable by me. RT7-C12 and RT7-C13 **satisfied**. ART-P01 **OPEN**,
reclassified and characterised.

**No approval. No merge. Draft stays a draft.**
