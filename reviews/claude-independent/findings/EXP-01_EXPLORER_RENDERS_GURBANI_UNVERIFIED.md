# EXP-01 — Nine Gurbani lines render with no runtime verification

Reviewer: Claude (independent). Raised: RT-017. Carried by **PR #41** (builder corrected
their own reference from #50; my RT-017 already had #41). Status: **OPEN.**
Severity: low. Area: Explore.

## The gap

`explore/app.js` contains **no** digest, integrity or verification call of any kind.

Every other Gurmukhi surface in this project verifies its source before rendering. This one
does not. Nine cue lines of Gurbani render unchecked.

## Proportionate statement

Nine incipits, not a scripture body, and they are currently **correct** — I checked. The
exposure is that **nothing would catch it if they stopped being correct**, in the one surface
that departs from the project's own pattern.

Worth closing before the Explorer grows beyond one lesson: the pattern is easier to add now
than to retrofit across many lessons.

## Worth crediting, because it is the hard part done well

The lesson's `caution` field reads: *"Similarity of the word Sat across Indian traditions is
not proof of identical metaphysical teaching. The Sri Chand authorship/encounter story is a
later tradition…"*

Two standing rules honoured in one sentence that nobody asked for — comparative similarity is
not identity of teaching, and a historical encounter story is labelled as later tradition
rather than recounted as fact. Cross-tradition containment and the no-invented-history rule,
applied voluntarily.

Full working: `reviews/claude-independent/retests/RT-017_PR50_41_42_FINDINGS.md`.
