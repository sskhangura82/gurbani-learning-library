# ART-P01 — The print-inspection gate fails on correct PDFs

Reviewer: Claude (independent). Opened: 2026-11-27. Status: **OPEN — for the builder.**
Severity: S2. Area: Print. Not a scripture defect. Not a PDF defect.

## One line

`.github/workflows/article-source-print-qa.yml` pins `PyMuPDF==1.26.6`; that engine
duplicates the dependent vowel sign after a subjoined-ਰ cluster, so the gate reports
`found 0` for text that is demonstrably present and correct.

## The defect

| document | source text | PyMuPDF 1.26.6 extracts | duplicated |
|---|---|---|---|
| haumai | `ਪ੍ਰਾਨੀ` | `ਪ੍ਰਾਾਨੀ` | U+0A3E |
| dubidha | `ਪ੍ਰੀਤਿ` | `ਪ੍ਰੀੀਤਿ` | U+0A40 |

Cluster shape in both: ਪ + U+0A4D + ਰ + matra. The matra is emitted twice; the rest of
each line is extracted correctly.

Signature across all six print artifacts at composite head `7f36c303...`, both page sizes:
**line01 exact=False, line02 exact=True**, every time — because only line01 of each pair
contains a subjoined-ਰ cluster.

## The PDF is correct — three independent checks

1. Canonical text from `salok-mahalla9/data/` and `salok-kabir/data/` is **digest-exact**
   to the pins in `articles/source-contracts.mjs`, under none/NFC/NFD alike.
2. The PDF's own `/ActualText` span for the cluster is hex `FEFF0A2A0A4D0A300A3E` —
   ਪ ੍ ਰ ਾ, four codepoints, **one** matra. The duplication is not in the document.
3. Poppler `pdftotext` 24.02.0 extracts **all twelve** pinned lines exact, exactly once,
   both lines of each pair on one page (pagination-stress: complete on page 2 of 3).

Artifact identity: the haumai A4 PDF I measured is sha256 `6a5bc6b6...`, and the
inspector's own output directory is named `haumai-source-sheet-a4-6a5bc6b6`. Same bytes.

## Why the matcher must not be loosened

The gate's declared normalization is *"NFC and collapsed whitespace only; no letter or
punctuation removal."* **That policy is correct and cannot absorb this defect**, because
the defect inserts a *letter*.

Relaxing the matcher to tolerate a duplicated matra would make the gate blind to a
duplicated matra — which is exactly a silent Gurmukhi spelling corruption, the class these
standing constraints exist to catch:

> "Never silently modernize Gurmukhi spelling."
> "A corrupted or incomplete scripture package must not silently render as a complete
> valid composition."

The gate is load-bearing precisely where it currently misfires.

## For the builder

The fix belongs in the extraction engine, or in cross-checking two engines — **not** in the
comparison. Which, and how, is a builder decision. I do not repair builder code or CI and I
propose no patch. I record only the constraint: a change that makes this pass by relaxing
what counts as a match trades a false failure for a real blind spot in scripture integrity.

Builder evidence in `evidence/articles/print-compatibility/` is consistent with all of the
above — `extraction.json` already records the same line01-false / line02-true signature,
and `poppler-initial-haumai.json` records Poppler PASS. The divergence was characterised;
the codepoint mechanism and its reproduction across all six final artifacts under the exact
CI pin are what this finding adds.

## Still open by design

`"visualReview": "NOT_PERFORMED_BY_SCRIPT"` — no script closes it and I have not performed
it. Physical-device print acceptance remains outstanding and is not closable by review.

## Disclosure

I installed PyMuPDF 1.26.6 and pypdfium2 as measuring instruments only. I audited neither
and read no third-party source.

Full working: `reviews/claude-independent/retests/RT-026_COMPOSITE_CI_ATTRIBUTION.md` and
`RT-026_ADDENDUM_ENGINE_DEFECT_AND_CORRECTIONS.md`.
