# RT-007 — PR #55, article engine: findings

Criteria frozen first in RT-007_FROZEN_CRITERIA_PR55.md, committed before any
changed code, doc or evidence file was opened. Protocol honesty is recorded
there: the builder's evidence summary was collapsed behind a
"read-after-findings" block but was delivered to me in full by the notification
channel, so I was not blind on it. The scripture work below was done cold.

- Candidate: PR #55, head `acfeb0a157fc2cf38ae7ccbaeb2c53d8e97d3bec`, draft.
- Base: PR #54 at `8917beaa…`, which I verified in RT-006.

## Verdict on everything I tested: PASS. And ART-P01 is substantially resolved — see §4.

## 1. Scope — RT7-C1 PASS

Outside `articles/`, `docs/`, `evidence/`, `tests/` and `.github/`, exactly three
files differ from the frozen base: `index.html` (+6, home navigation), `sw.js`
(offline list) and `tools/build-offline.mjs`. **No source package, teaching
package, source lock or existing reader is touched.** Their claim holds.

## 2. Scripture correctness — RT7-C2, C3, C4 PASS

The engine displays two complete Saloks. Verified three ways.

| Check | Salok Mahalla 9 · 19 | Salok Kabir · 25 |
|---|---|---|
| Source package digest pin | **MATCH** | **MATCH** |
| Lines in source vs lines pinned | 2 / 2, **complete** | 2 / 2, **complete** |
| Each line's SHA-256 vs the contract pin | **MATCH** ×2 | **MATCH** ×2 |
| Each line's SHA-256 vs the package's own record | **MATCH** ×2 | **MATCH** ×2 |
| Unit `sourceDigest` recomputed | **MATCH** | **MATCH** |
| Unique consecutive match in **my independent reference** | **yes**, index 38 | **yes**, index 50 |
| Selection token present in the text | `ਹਉਮੈ` **yes** | `ਦੁਬਿਧਾ` **yes** |
| Exact lines rendered on screen | **yes** ×2 | **yes** ×2 |

Both Saloks close with their own numbering — `॥੧੯॥` and `॥੨੫॥` — confirming each
is a whole unit rather than an excerpt.

**I make no judgement on whether these two Saloks are apt to their topics.** The
contract marks the association `LITERAL_TOKEN` with `semanticReviewed: false`,
and the aptness is a qualified reviewer's call, not mine. What I verify is that
the token is genuinely present and the text is genuinely complete and correct.

### The crosswalk design is right

`source-contracts.mjs` is frozen, held separately from the editable catalog, and
states explicitly: *"No row, ordinal, Ang, first-line or fuzzy fallback is
permitted. A future edition requires a separately reviewed crosswalk; v1 has no
automatic migration."* That refuses, by construction, every weak locator the
standing rules ban. The pinned Kabir figures — 243 units, 486 lines, 494
occurrences, sequence digest `f8de1c67…` — are identical to what I verified
independently in RT-004.

## 3. Honesty of the framing — RT7-C6 through C10 PASS

| Criterion | Result |
|---|---|
| RT7-C6 explanations genuinely empty | **PASS** — `explanation: null`, `claims: []` in the catalog; 11 and 12 empty-slot markers rendered on screen; no explanatory sentence about meaning anywhere |
| RT7-C7 topic association labelled as a literal word match awaiting review | **PASS** — present on screen in both sheets |
| RT7-C8 no Ang asserted as fact | **PASS** — no bare `Ang N` claim rendered |
| RT7-C9 draft and editorial status visible | **PASS** — on screen, and `reviewStatus: AWAITING_QUALIFIED_REVIEW` in the data |
| RT7-C10 no claim of review, device acceptance or printed authentication | **PASS** |
| RT7-C11 verse and slot stay together for pagination | **PASS** — `break-inside: avoid` resolves on the `pair` element, which is the fix from my corrected v2 proof, carried through correctly |

No page errors on either sheet.

## 4. FINDING RT7-01 — ART-P01 is an extractor-version artifact, not a document defect

The builder reported ART-P01 open: strict **PyMuPDF 1.26.6** extraction fails for
a conjunct in each sheet, while Poppler 25.03.0 extracted the Haumai PDF exactly.
They preserved the failure and refused to normalise it away, which was right.

I attempted to reproduce it rather than relay it, and then isolated it.

**Step 1 — could not reproduce.** I rendered both sheets to PDF with Chromium and
extracted:

| | PyMuPDF **2.2** (MuPDF 1.28.6) | Poppler **24.02** |
|---|---|---|
| Haumai line 1 and 2 | **EXACT** | **EXACT** |
| Dubidha line 1 and 2 | **EXACT** | **EXACT** |

**Step 2 — the decisive experiment.** I installed the builder's exact extractor
version and re-ran it against **the identical PDF bytes**:

| | PyMuPDF **1.26.6** (MuPDF 1.26.11) | PyMuPDF **2.2** (MuPDF 1.28.6) |
|---|---|---|
| Haumai line 1 | **NOT EXACT** — diverges after 9 chars | EXACT |
| Haumai line 2 | EXACT | EXACT |
| Dubidha line 1 | **NOT EXACT** — diverges after 9 chars | EXACT |
| Dubidha line 2 | EXACT | EXACT |

**Same bytes. Different result by extractor version.** So the failure is in the
extraction library, not in the document.

**And the divergence point names the culprit.** Both failures break at the same
place:

- `ਜਿਹਿ ਪ੍ਰਾ` | `ਨੀ ਹਉਮੈ…`
- `ਕਬੀਰ ਪ੍ਰੀ` | `ਤਿ ਇਕ ਸਿ…`

In both cases the character reached is the conjunct **ਪ੍ਰ** — pa with subjoined
ra, *pairin rara*. And in both sheets **line 2 extracts perfectly**, because
neither line 2 contains that conjunct. That is exactly the "a conjunct in each
sheet" the builder described, now identified.

### What this does and does not settle

**Settles:** MuPDF 1.26.11 mis-extracts the pairin-rara conjunct and MuPDF
1.28.6 does not, on identical input. The gate as currently written is measuring
the extractor at least as much as the document.

**Does not settle, and the builder's caution stands:** real-world copy-paste.
PDFium (Chrome's viewer) and PDFKit (Apple's Preview and iOS) are different code
paths again, and the builder reported those two differ. A family member copying
Gurmukhi out of Preview on a Mac is using PDFKit, not MuPDF, so **cross-viewer
fidelity remains unresolved** and ART-P01 should stay open on that basis.

**One caveat against myself:** my PDF is not their PDF. Mine was produced by
Chromium in this Linux container with the fonts available here; theirs was
produced elsewhere. The mechanism I isolated is consistent with their symptom
but the artifacts are not the same file.

### Recommendation, and what not to do

**Do not upgrade the extractor to make the gate pass.** That would be gaming the
gate, and the builder's instinct to preserve the failure was correct.

Instead: relabel the PyMuPDF result as an **extractor-version observation**, and
point the real gate at what readers actually use — PDFKit on Apple devices and
PDFium in Chrome. Those are the paths that decide whether a person copying a
verse out of a printed or exported sheet gets correct Gurmukhi. Everything else
is a library comparison.

## 5. Not tested

- RT7-C5, that no render path survives a failed source check. I read the
  contracts and the refusal design but did not force a digest mismatch at
  runtime. **Not claimed.**
- RT7-C15, that the workflows cannot deploy. Not independently verified.
- RB-01 on PR #53, still mine and still open.
- The PR #52 live separation-guard mutation test and mobile label check.

## 6. Unchanged by any of this

Qualified Sikh scholarly and Punjabi review of every teaching draft, and
physical iPhone, iPad, Home Screen, VoiceOver and airplane-mode acceptance. No
device result is claimed anywhere in this file. The printed-source collation gate
is untouched and remains the only route to a second textual lineage.

**No verdict of acceptance. I do not approve and I do not merge. Draft stays a
draft.**
