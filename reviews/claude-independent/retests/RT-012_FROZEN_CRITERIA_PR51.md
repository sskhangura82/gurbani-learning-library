# RT-012 — PR #51, complete Salok Mahalla 9 reader: frozen acceptance criteria

Committed **before** opening the changed application code, the `docs/` file, the
`research/` files or any `evidence/` file.

- Candidate: PR #51, head `50ba6e1750963573b1ba7d50d54100fab2856e50`, draft, open,
  unmerged. Verified against the API.
- Base: `fix/claude-review-first-repairs-20261125`.
- The builder requests no verdict and claims no acceptance.

## Why this candidate is being reviewed now, and out of order

My own register reconciliation found PR #51 had **never been reviewed as a
candidate** — no frozen criteria, no verdict by commit id — while sitting beneath
#52, #54, #55 and now #56 in a strict containment chain. Six candidates are
blocked behind one unreviewed one. The builder independently reached the same
conclusion and calls it a prerequisite for the reader chain. I am reviewing it
ahead of the new RB-01 candidate (PR #57) for that reason, and because PR #57 sits
in the knowledge stack, which is held anyway pending the PR #49 interaction
review.

## Disclosed exposure — substantial, and it must be stated plainly

**I am not blind on this candidate, and not even close.** Its data has been under
my instruments all day as a *dependency* of candidates above it. Specifically,
already done and recorded elsewhere:

- While reviewing PR #55 I **reproduced this collection's entire digest chain
  independently**: 57 of 57 unit digests, 117 of 117 line fingerprints, the
  complete sequence digest, and the package file digest. All matched.
- I verified the anchor line ਅੰਮ੍ਰਿਤ ਵੇਲਾ ਸਚੁ ਨਾਉ; ਵਡਿਆਈ ਵੀਚਾਰੁ ॥ and others against
  the reference earlier in the project.
- The live Preview 3 verification touched this collection's label.
- The PR #56 review confirmed this collection's source package byte unchanged
  from #55.

So the integrity *arithmetic* of this package is already verified by me, and I am
not re-running it as if new. What I have **never** done, and what this review is
actually for:

1. Compared the 117 Gurmukhi occurrences to my reference database, letter by
   letter. Internal digest consistency proves the file is self-consistent; it
   says nothing about whether the text is right.
2. Examined the `nitnem/reader.js` change, **+55/-17** — this is where this
   collection's pins were introduced into the project's pin-holding file.
3. Examined whether the teaching drafts are bound to source and separated from it.

Before freezing I read the PR shape, the changed file **names**, and the PR body's
"Why" and opening "What changes" text, which the notification channel delivered.
From that I know the claims: 57 numbered Saloks, 114 verse occurrences, opening
invocation, collection heading, Dohra before Salok 53, **117 exact source
occurrences across Ang 1426–1429**, Salok 29 spanning two Angs, and Mundavani
Mahalla 5 excluded. No builder test results were disclosed.

**One corroboration obtained before freezing, recorded for honesty:** my reference
database's section `SO3P`, "Salok Ninth Mehl", contains exactly **117 lines**.
That matches the claimed occurrence count independently of anything the builder
says. It is a count, not a text comparison.

## Criteria

### Scripture correctness — the reason this review exists

| ID | Criterion | Fails if |
|---|---|---|
| RT12-C1 | All 117 occurrences are letter-for-letter identical to my reference, after comparison-only punctuation normalisation | one character differs and is not documented |
| RT12-C2 | The collection is **complete and correctly ordered** — 57 numbered Saloks, no line dropped, none added, order preserved | the line set or order differs from the reference |
| RT12-C3 | The boundary claims hold: the Dohra sits before Salok 53, Salok 29 is one passage across two Angs, and Mundavani Mahalla 5 is **excluded** | any boundary differs from the reference structure |
| RT12-C4 | No Gurmukhi spelling is silently modernised and the danda is preserved | any normalisation is applied to stored text |
| RT12-C5 | Every stored line's recorded digest matches its own text | any fingerprint mismatches |

### The pin-holding file

| ID | Criterion | Fails if |
|---|---|---|
| RT12-C6 | The `nitnem/reader.js` change adds this collection's pins without removing, loosening or computing any existing pin | an existing pin is weakened or derived at runtime |
| RT12-C7 | The new collection's pins are genuine constants, not regenerated from the data they check | a pin is computed from the file it authenticates |
| RT12-C8 | The page that loads the pinned scripts carries a matching integrity hash | the hash is stale, absent or wrong |

### Teaching separation and honesty

| ID | Criterion | Fails if |
|---|---|---|
| RT12-C9 | Teaching drafts are bound to source occurrences and cannot render as scripture | any teaching text can appear as original text |
| RT12-C10 | Damaged scripture refuses to render; damaged teaching refuses independently | either bypasses its boundary |
| RT12-C11 | Draft, educational and awaiting-qualified-review labelling is visible, including at 320 px | any reading surface omits it |
| RT12-C12 | No Ang is asserted as an independently established locator | an Ang appears as fact without its basis |
| RT12-C13 | No qualified review, printed collation or device acceptance is claimed | any appears |

### Regression on what already worked

| ID | Criterion | Fails if |
|---|---|---|
| RT12-C14 | The existing Nitnem readers, their saved learning and their storage keys are unaffected | any existing key, note or reading place changes |
| RT12-C15 | The offline shell stays complete and consistent | a manifest hash does not match its bytes |

## Method limits, stated in advance

- **The reference and the candidate share one textual lineage** (RT-005): Open
  Granth declares Shabad OS as its source. A letter-for-letter match therefore
  establishes *faithful transcription within one tradition*, *not* independent
  textual authentication. Printed-page collation remains outstanding and nothing
  here substitutes for it.
- Punctuation normalisation is **comparison-only**: the reference inserts
  editorial comma, semicolon and full stop that Gurbani does not carry. Stored
  text is never altered. The danda ॥ is part of the text and is never touched.
- Chromium only. **Nothing here is Safari, iPhone, iPad or VoiceOver acceptance.**
- Synthetic learning records only.
- Every harness gets a **control case**.

Verdicts: PASS / NEEDS_REVISION / INCOMPLETE.

Frozen at this point.
