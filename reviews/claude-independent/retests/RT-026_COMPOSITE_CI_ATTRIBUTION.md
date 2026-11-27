# RT-026 — Composite CI run (#63): attribution of the `browser-and-print` failure

Reviewer: Claude (independent). Date: 2026-11-27.
Status: **FINDINGS RECORDED BEFORE OPENING BUILDER EXTRACTION EVIDENCE.**

## Why this retest exists

I closed CHAIN-02 with a stated limit, verbatim:

> "A clean merge is not a passing test suite: I verified the composite's pins and
> structure, not its full behaviour as a merged whole... the composite has never been
> exercised by CI as a merge into `main` — only each link against its own base."

and I posted, verbatim:

> "If you want that closed before the founder decides, a CI run against the composite
> would be the thing, and it's yours to arrange, not mine."

The builder arranged exactly that as validation-only draft **#63**
(`validation/glp001-composite-20261127`). It found something. That is the point of the
exercise. This retest attributes what it found.

## Identity

- #63 head: `7f36c3039ca95fac6e69ca28f631b9e3734c70e9`
- #62 reviewed head: `7f36c3039ca95fac6e69ca28f631b9e3734c70e9` — **identical SHA**
- Differing paths between them: **zero**
- Base `main`: `a3476ac4b9be90dde350fb35dd13ce0b672c120d` (unchanged; `protected: false`)
- Against main: 930 paths, +186034/-199

**There is no new code in #63.** RT-025 applies unchanged. Nothing merged.

## The failure

One check failed: `browser-and-print`, check-run `140501633742`, owned by
`.github/workflows/article-source-print-qa.yml`.

The browser half **passed**: `{"passed":25,"failed":0}`.
The print-inspection half **failed**, reporting for `haumai`:

- `Pair glp.article-ref.salok-mahalla9.019: gurmukhi expected once, found 0 after declared extraction normalization`
- `Pair glp.article-ref.salok-mahalla9.019 is not proven complete on one page`

Equivalent failures for `dubidha` (`glp.article-ref.salok-kabir.025`) and for `pagination`.
`"visualReview": "NOT_PERFORMED_BY_SCRIPT"`.

## Attribution: pre-existing at #55, not introduced by the composite

| PR | head | `browser-and-print` |
|----|------|---------------------|
| #55 | `acfeb0a157fc2cf38ae7ccbaeb2c53d8e97d3bec` | **failure** |
| #56 | — | DID NOT RUN |
| #59 | — | DID NOT RUN |
| #60 | — | DID NOT RUN |
| #61 | — | DID NOT RUN |
| #62 / #63 composite | `7f36c303...` | failure |

The workflow triggers on `branches: [main, feature/learning-reliability-practice-20261126]`.
#56, #59, #60 and #61 target neither, so the check never ran on them.

**This is not a composite-introduced regression.** It has been failing since #55 and was
invisible for four consecutive candidates because of branch filtering. The composite run
did not create the red check; it removed the thing that was hiding it.

This is the second instance of the same class I attributed in RT-021 (the 85-vs-81 case):
a real red check concealed by trigger filtering. Recorded separately as CI-02.

## My independent measurement: the PDF is correct

Artifact identity — the PDF I measured is **byte-identical to the one CI inspected**:

- git blob `55dcc50290799acb0e5d50694c8def11712439c4`, 162257 bytes
- sha256 `6a5bc6b63e2d1c54c0f8da852adc06ce228eeb0d9e84647bba934e998aba3a3c`
- the inspector's own output directory is named `haumai-source-sheet-a4-6a5bc6b6` —
  the first 8 hex of that sha256. Same bytes, same artifact.

Canonical expected text, recovered from `salok-mahalla9/data/salok-mahalla9.json`
(`/units[18]/lines[0..1]/text`) and confirmed **digest-exact** against the pins in
`articles/source-contracts.mjs`:

- line01 `ਜਿਹਿ ਪ੍ਰਾਨੀ ਹਉਮੈ ਤਜੀ ਕਰਤਾ ਰਾਮੁ ਪਛਾਨਿ ॥`
  → sha256 `a7338568...f733` ✓ matches pin
- line02 `ਕਹੁ ਨਾਨਕ ਵਹੁ ਮੁਕਤਿ ਨਰੁ ਇਹ ਮਨ ਸਾਚੀ ਮਾਨੁ ॥੧੯॥`
  → sha256 `28fc1044...5d5d` ✓ matches pin

Both digests match under **none, NFC and NFD alike** — this text is normalization-stable,
so no normalization choice can explain a miss.

Extraction with Poppler `pdftotext` 24.02.0, page 1 only:

| test | line01 | line02 |
|------|--------|--------|
| exact substring present | **True** | **True** |
| whitespace-collapsed match | True | True |
| occurrences (collapsed) | **1** | **1** |
| danda-stripped match | True | True |

Page 2 contains **zero** Gurmukhi characters.

So, against the artifact CI actually inspected:

- the pair's gurmukhi **is** present,
- it occurs **exactly once**, not zero times,
- **both** lines sit on **one page** (page 1), so the pair is provably complete on one page,
- and the text is digest-exact to the pinned contract.

**Both reported failures are false against this artifact.** The inspection reports 0
occurrences where an exact-substring search finds exactly 1, with no normalization applied.

## What this means

This is an **instrument defect in the print inspector**, not a content defect in the PDF
and not a defect in the scripture. It is ART-P01's territory — PDF text-extraction
fidelity differs by engine — now with a concrete CI manifestation and a proof that the
underlying document is right.

I am **not** concluding the PDFs are all correct. See scope below.

## Scope of what I measured — stated, not assumed

Measured: `haumai-source-sheet-a4.pdf` at the composite head, page-level, for pair
`glp.article-ref.salok-mahalla9.019`, with one extraction engine (Poppler 24.02.0).

**Not measured by me:**

- `dubidha` / `glp.article-ref.salok-kabir.025`
- the `letter` format variants
- the `pagination` document
- the inspector's own engine and its declared normalization (deliberately deferred —
  see ordering note)
- `"visualReview": "NOT_PERFORMED_BY_SCRIPT"` remains open **by design**; no script
  closes it and I have not performed it

I have not yet opened `evidence/articles/print-compatibility/*.json`
(`extraction.json`, `pdfium-extraction.json`, `poppler-initial-haumai.json`,
`final-pdf-actual-text.json`). Those are builder evidence on exactly this question.
This file is committed first so my measurement stands on its own; an addendum will follow
once I read them, including whether the builder already knew.

## Bearing on the founder's pending merge decision

Direct, and he should know it **before** deciding rather than discovering it after:

Merging the reviewed composite into `main` will put a **red `browser-and-print` check on
`main`**, because the workflow does trigger on `main`. That red is pre-existing from #55,
and on the one document I verified it is a measurement limitation, not broken scripture
and not a broken PDF.

It is not a reason to withhold the merge, and it is not something to merge without
knowing. It is also **not mine to decide** — I do not approve, merge or release.

## Instrument errors in this retest

None detected. Two guards I applied deliberately, both being repeats of errors I have
already made:

- I did **not** trust my own Gurmukhi regex as the test. `[਀-੿]` excludes the
  danda (U+0964/U+0965), so my first pass split lines at `॥` and could have been read as
  truncated text. I recovered the canonical strings from pinned data instead.
  (Guards against the class of errors 18, 27 and 29 — crude regex as evidence.)
- I did **not** guess the canonical form. I verified text against the contract digests and
  checked none/NFC/NFD explicitly before claiming a match.
  (Guards against errors 26 and 30 — normalization mistakes.)

---

## CORRECTION — appended 2026-11-27, after opening builder evidence

Two statements above are corrected in
`RT-026_ADDENDUM_ENGINE_DEFECT_AND_CORRECTIONS.md`. Read it with this file.

1. **"Both reported failures are false against this artifact" is too strong.**
   `found 0 after declared extraction normalization` is true of the inspector's own
   extraction and false only as a claim about the document. `is not proven complete on one
   page` claims non-proof, not disproof — that wording is accurate and I should not have
   called it false.

2. **The engine named in session was wrong.** I theorised a pdfium space-insertion
   mechanism before checking the workflow. CI pins **PyMuPDF 1.26.6** (workflow line 60).
   The real mechanism is a **duplicated matra after a subjoined-ਰ cluster**
   (`ਪ੍ਰਾਨੀ` → `ਪ੍ਰਾਾਨੀ`), not whitespace. Instrument error 31.

The conclusion that the documents are correct **stands and is strengthened**: all six print
artifacts, both pairs, both page sizes now verified. Opened as finding **ART-P01**.
