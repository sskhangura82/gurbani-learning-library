# RT-026 Addendum — the actual engine defect, and two corrections to my own findings

Reviewer: Claude (independent). Date: 2026-11-27.
Written after opening builder extraction evidence, as RT-026 said it would be.

## Correction 1 — my mechanism was built on the wrong engine

In session I stated the mechanism was **pdfium inserting a space at each `/ActualText`
span boundary**, and I verified that span-boundary claim computationally. The measurement
was sound. The engine was wrong.

`.github/workflows/article-source-print-qa.yml` line 60 pins the extraction engine:

```
python -m pip install PyMuPDF==1.26.6
```

CI gates on **PyMuPDF 1.26.6**, not pdfium. I tested pdfium first and theorised a
mechanism from it before checking which engine the workflow actually used. The
space-insertion mechanism is real for pdfium and **irrelevant to this failure**.

Recorded as instrument error 31.

## Correction 2 — "both reported failures are false" was too strong

RT-026 says: "Both reported failures are false against this artifact." That overstates it.
Precisely:

- `gurmukhi expected once, found 0 after declared extraction normalization` is
  **true of the inspector's own extraction** and **false as a claim about the document**.
- `is not proven complete on one page` claims **non-proof, not disproof**. That wording is
  **accurate and well chosen**. The inspector could not prove completeness because it
  could not match the string at all. I should not have called it false; it is honest.

The substantive conclusion stands — the documents are correct — but the inspector is
reporting its own extraction faithfully, not making a false claim about the PDF.

## The actual defect, measured on the CI-pinned engine

**PyMuPDF 1.26.6 duplicates the dependent vowel sign following a subjoined-ਰ cluster.**

| document | expected | PyMuPDF 1.26.6 | duplicated |
|---|---|---|---|
| haumai | `ਪ੍ਰਾਨੀ` U+0A2A U+0A4D U+0A30 U+0A3E U+0A28 U+0A40 | `ਪ੍ਰਾਾਨੀ` U+0A2A U+0A4D U+0A30 **U+0A3E U+0A3E** U+0A28 U+0A40 | U+0A3E |
| dubidha | `ਪ੍ਰੀਤਿ` | `ਪ੍ਰੀੀਤਿ` | U+0A40 |

Same cluster shape both times: ਪ + ੍ + ਰ + matra. The matra is emitted twice.
Everything else in both lines is extracted correctly.

Consequence, across all six print artifacts at the composite head, both page formats:

| artifact | line01 exact | line02 exact |
|---|---|---|
| haumai-source-sheet-a4.pdf | **False** | True |
| haumai-source-sheet-letter.pdf | **False** | True |
| dubidha-source-sheet-a4.pdf | **False** | True |
| dubidha-source-sheet-letter.pdf | **False** | True |
| pagination-stress-a4.pdf | **False** | True |
| pagination-stress-letter.pdf | **False** | True |

Only line01 of each pair fails, in every document, because only line01 contains a
subjoined-ਰ cluster. That is a completely consistent, engine-localised signature — not a
content problem that happens to cluster oddly.

## The PDF is correct. Confirmed three ways.

1. **Source digests.** Canonical text recovered from `salok-mahalla9/data/salok-mahalla9.json`
   and `salok-kabir/data/salok-kabir.json`, each **digest-exact** to the pins in
   `articles/source-contracts.mjs`, under none/NFC/NFD alike.
2. **The PDF's own `/ActualText`.** The builder's `final-pdf-actual-text.json` records the
   span for that cluster as hex `FEFF0A2A0A4D0A300A3E` = ਪ ੍ ਰ ਾ — **four codepoints,
   exactly right, one matra.** The duplication does not exist in the PDF.
3. **A second engine.** Poppler `pdftotext` 24.02.0 extracts all twelve pinned lines
   (6 documents × 2) **exact, exactly once, both lines of each pair on a single page.**
   Pagination stress is 3 pages with the pair complete on page 2 — which is what that
   gate exists to prove.

## Scope — now closed

RT-026 listed dubidha, the letter formats, the pagination document and the inspector's own
engine as not measured by me. **All are now measured.** Remaining open, unchanged:

- `"visualReview": "NOT_PERFORMED_BY_SCRIPT"` — open **by design**; no script closes it
  and I have not performed it.
- I did not audit PyMuPDF or pypdfium2. I installed both as measuring instruments only
  and read no third-party source. Standing disclosure.

## What the builder already had

`evidence/articles/print-compatibility/` is consistent with everything above:

- `extraction.json` records line01 `exact:false`, line02 `exact:true` — **the same
  signature I found independently**, on the earlier GurmukhiMN variant.
- `poppler-initial-haumai.json` records Poppler 25.03.0 `count:1, pass:true, status:PASS`
  on PDF `7eae213c...`, with normalization declared as
  *"Unicode NFC and collapsed whitespace only; no letter or punctuation removal."*

So the cross-engine divergence is **characterised, not undiscovered**. ART-P01 already
covers it. What is new here is the precise codepoint mechanism, that it reproduces on all
six final artifacts under the exact CI pin, and the consequence below.

## The consequence that matters, and why the matcher must not be loosened

The declared normalization — NFC plus whitespace collapsing, **no letter or punctuation
removal** — **cannot** absorb this defect, because the defect inserts a *letter*: a matra.

That policy is correct and should stay. Loosening the matcher to tolerate a duplicated
matra would make the gate blind to a duplicated matra. A duplicated matra is precisely a
silent Gurmukhi spelling corruption — the class two standing constraints exist to catch:

> "Never silently modernize Gurmukhi spelling."
> "A corrupted or incomplete scripture package must not silently render as a complete
> valid composition."

So the gate is load-bearing exactly where it currently misfires. The fix has to be the
extraction engine, not the comparison. Which engine, and whether to cross-check two, is a
**builder decision** — I do not repair builder code or CI, and I am not proposing a patch.

I will note only the constraint: any change that makes this check pass by relaxing what
counts as a match would trade a false failure for a real blind spot, and the blind spot is
in scripture integrity.

## Instrument errors in this addendum

- **31.** Built and stated a mechanism (pdfium space insertion) before checking which
  engine CI pins. Right measurement, wrong instrument. Caught before posting, after
  RT-026 was already committed — hence Correction 1 rather than a silent edit.
- **32.** Guessed the filename `pagination-source-sheet-a4.pdf`; the real name is
  `pagination-stress-a4.pdf`. The fetch silently produced a **0-byte file**. Had I run
  extraction over it without checking, it would have reported zero Gurmukhi and I could
  have read that as confirming the CI failure. Caught by the byte count in the same step.
  This is the third time a silent empty or wrong-target measurement has nearly produced a
  confident wrong verdict (errors 25, 28).

Running total: **32**.
