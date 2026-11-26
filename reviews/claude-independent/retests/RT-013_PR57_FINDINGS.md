# RT-013 — PR #57, RB-01 repair: findings

Candidate `f720099b6181919d597e249f9ad42b9f00cabe68`. Criteria frozen in
`RT-013_FROZEN_CRITERIA_PR57.md` before I opened the implementation.

## Verdict: RB-01 is CLOSED. One narrower residual opened as RB-02 (low)

I raised RB-01, so I bound myself in the frozen criteria: *"I will not describe
RB-01 as closed unless all five attacks are refused and C7 still passes."*

**All five are refused and C7 passes.** So RB-01 closes. The residual I found
afterwards was not one of the five, so it gets its own identity and severity
rather than being used to keep RB-01 open — that is the honest application of a
criterion frozen in advance.

| ID | Criterion | Result |
|---|---|---|
| RT13-C1 | RB-01-a prefixed heading | **refused** |
| RT13-C2 | RB-01-b node `pa` | **refused** |
| RT13-C3 | RB-01-b node `title` | **refused** |
| RT13-C4 | RB-01-c real line in a node | **refused** |
| RT13-C5 | RB-01-d editorial aliases | **refused** |
| RT13-C6 | control still loads | **PASS** — 31 nodes |
| RT13-C7 | legitimate editorial content still accepted | **PASS** |
| RT13-C8 | genuine scripture still renders | **PASS** |
| RT13-C9 | no scripture or teaching byte changed | **PASS** |
| RT13-C10 | editorial material stays labelled | **PASS** |
| RT13-C11 | structural, not a denylist | **PASS** |
| RT13-C12 | nothing claims RB-01 closed | **PASS** — the builder explicitly did not |

Verified by ancestry before anything else: this candidate contains PR #53 and does
**not** contain PR #49. Both match the handoff. No scripture, teaching or
source-lock byte differs from the PR #53 parent. The control load and my computed
teaching pin matched `PACK_SHA256` exactly, so the harness was correctly wired
before a single attack ran.

## My four documented bypasses, each attempted as a live mutation

Every mutation recomputed the teaching pin so the digest gate passed and **the
guard itself was what got tested** — otherwise every refusal would have come from
the wrong gate.

| Attack | Result |
|---|---|
| `passageDescriptions[].title = "ਵਿਸ਼ਾ ਸਲੋਕੁ ਮਃ ੧ ॥"` — the one-word prefix that defeated the old `^`-anchored regex | **refused** |
| `concept.pa = "ਸਲੋਕੁ ਮਃ ੧ ॥"` | **refused** |
| `concept.title = "ਮਹਲਾ ੧"` | **refused** |
| `word.pa` = a genuine in-pack line | **refused** |
| `word.pa` = topic prefix + a genuine in-pack line | **refused** |
| scripture heading pushed into `passageDescriptions[].aliases` | **refused** |
| a genuine line pushed into `concept.aliases` | **refused** |
| `concept.pa = "ਵਿਸ਼ਾ ॥੧੯॥ ਵਿਚਾਰ"` — an embedded numbered unit marker | **refused** |

Each refusal names the exact field, which is good diagnostics:
`EDITORIAL_TITLE_ATTRIBUTION: … in concept.humility.pa`.

## Twelve attacks I never published, because fixing only the four I listed would not be a repair

A guard could pass the list above by special-casing it. So I attacked things I had
never written down.

| Attack | Result |
|---|---|
| Zero-width joiner inserted inside a heading | **refused** |
| ASCII digits in place of Gurmukhi digits | **refused** |
| Doubled internal whitespace in a heading | **refused** |
| Real line with all internal whitespace doubled | **refused** |
| Real line placed in a **lesson depth** text | **refused** |
| Real line placed in a **study citation** | **refused** |
| Real line placed in a **word sense** `pa` | **refused** |
| Heading placed in a **study discipline** field | **refused** |
| ੴ placed mid-text | **refused** |
| A node redefining joined passage metadata | **refused** |
| Editorial pack smuggling its own `occurrences` array | **refused** |
| **A real line split across `title` and `pa`** | **ACCEPTED — see RB-02** |

Eleven of twelve refused. The guard is genuinely structural: it survived
normalisation evasion, invisible characters, digit substitution, whitespace
padding, and three field surfaces I had never tested.

## Why this is a real repair and not a blocklist

RT13-C7 mattered as much as the attacks, and I tested it as deliberately. All
accepted: an ordinary Punjabi topic label `ਨਿਮਰਤਾ ਦਾ ਵਿਸ਼ਾ`; an ordinary English
label; the unaltered control; and `ਪਰੇਮ ੨ ਦਾ ਵਿਸ਼ਾ` — a Punjabi word **ending in ਮ
followed by a number**, which is exactly the false positive the new negative
lookbehind exists to prevent. The guard distinguishes the ਮਃ abbreviation from an
ordinary word ending in ਮ, which is the difference between a repair and a
blunt instrument.

The dictionary exception is also bound to evidence rather than free: a
`sense.form` is only accepted when it genuinely appears in the token split of the
occurrence it cites, so an attested single word may be shown while a fabricated
one may not.

## RB-02 (low) — a source line split across two fields

`concept.title = "ਫਲ ਫਿਕੇ ਫੁਲ ਬਕਬਕੇ"` and `concept.pa = " ਕੰਮਿ ਨ ਆਵਹਿ ਪਤ ॥"` —
together the whole of a real line, neither half a whole line on its own. The
loader **accepted** it. The `copiedLine` check compares against whole-line
signatures, so a fragment passes.

**What I could and could not demonstrate.** It is accepted by the loader. On the
view I reached, the first half rendered as an ordinary `h2` heading — **not** in a
scripture element, with no `pa` element rendered and the editorial labelling
present on the page. I did not get the pair to appear together as a single
scripture-looking line, and I am not going to claim a rendering impact I did not
see. So: a real gap in the loader, with its visible consequence undemonstrated.

**Severity: low, and I do not think it should block this candidate.** It is
materially narrower than the originals, which rendered a complete heading or a
complete line inside the element real Gurbani uses. And the guard's own comment
already scopes it honestly: *"This is a syntactic boundary, not a claim to
classify theological meaning or every paraphrase."*

**Direction, not a design.** A contiguous-token-run threshold — refusing editorial
text that contains N or more consecutive tokens from any source line — would catch
this. The trade-off is real and belongs to the builder: set N too low and
legitimate short quotation inside an explanation starts being refused, which would
break RT13-C7, the thing that makes this a repair rather than a blocklist. It may
be correct to accept RB-02 as the residual cost of a syntactic boundary and record
it rather than chase it.

## Method notes, including my own error

My first rendering harness failed with a Python `TypeError` because I assigned to
`pg.wait_for_timeout` instead of calling it — my seventh instrument error today.
It failed loudly rather than producing a wrong answer, which is the preferable
kind.

Limits: one lineage (RT-005); Chromium only; **nothing here is device
acceptance**; synthetic data only; the knowledge pilot remains unavailable in the
application, and this candidate does not change that.

## What remains outstanding on the knowledge stack

- **PR #49 and the combined interaction review.** This candidate deliberately
  excludes #49, which is right, and it means the combination is still unreviewed.
  Neither a clean merge nor two separate passes establishes the combined result —
  I demonstrated in the register reconciliation that the merge is clean and the
  interaction is what matters.
- Qualified Sikh scholarly and Punjabi review. `qualifiedHumanReviewCount` is 0.
- Printed-source collation.

**No approval. No merge. Draft stays a draft.**
