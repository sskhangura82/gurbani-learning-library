# RT-030 — Frozen criteria for #74 (Explore: connect complete source passages to readers)

Reviewer: Claude (independent). Frozen: 2026-11-27, **before examining the implementation.**
Candidate: #74, head `6b574e55e991`, branch `feature/explore-complete-passages-20261127`,
base `feature/sggs-original-search-research-20261127` (#70). Chain: #62 → #65 → #70 → #74.
87 files changed against its base; 120 paths against #62.

## Conflict of interest, declared

**EXP-01 is my own finding.** I raised it: `explore/app.js` carried no digest, integrity or
verification call of any kind, so nine Gurbani cue lines rendered unverified.

A reviewer grading the response to his own finding has an obvious bias in both directions —
toward declaring it fixed to feel vindicated, or toward keeping it open to stay right. I
state the test for closure **in advance** so neither is available to me:

> **EXP-01 closes if, and only if, every Gurmukhi character this surface renders is verified
> against a pinned digest before display, demonstrated by a tamper test that I run and that
> refuses.** Partial verification, verification of some paths, or a verification call that
> exists but is not reached does not close it.

If it closes, I say so. If it does not, I say which path is unverified rather than restating
the original finding.

## Disclosure of prior exposure

Builder's founder update: *"Explore now connects 302 distinct complete passages to their
existing readers. It supports original Gurmukhi searches and both first-letter forms, with
search restored after Back or reload,"* and *"The full research index is larger; it is not yet
all available through the reader."* I have also raised **SIG-01** (signature treated as
authorship in search), which is directly adjacent to a search candidate. I have **not** opened
any file in #74 or #70, nor any builder test or evidence.

## Criteria

### Hard — any failure blocks

| # | Criterion |
|---|---|
| C1 | Every Gurmukhi character rendered by this surface is verified against a pinned digest before display. **This is the EXP-01 closure test above.** |
| C2 | Passage text is faithful to the pinned source; no silent divergence, no modernized spelling. |
| C3 | Search returns results on the basis stated to the reader. A literal word match is not presented as authorship, and an author match is not presented as an occurrence (the SIG-01 class). |
| C4 | First-letter search does not fabricate matches: a returned passage genuinely begins with the letters searched, under a stated normalization. |
| C5 | No answer, meaning or lesson is supplied where no source-linked lesson exists. An empty result says so. |
| C6 | The count claim ("302 distinct complete passages") is exactly true of what ships, or explicitly reconciled. |
| C7 | A passage presented as "complete" is complete; no truncated unit renders as whole. |
| C8 | No copyrighted translation, commentary or layout reproduced. |
| C9 | Navigation restoration after Back or reload does not resurrect stale or wrong results, and does not lose the reader's place. |
| C10 | Synthetic records only; no real reader reflection accessed or exposed. |
| C11 | New assets are in the offline manifest if offline is claimed, and the manifest is generated rather than hand-edited. |
| C12 | Nothing deployed, merged or published by this candidate. |

### Soft — recorded, cannot block

| # | Criterion |
|---|---|
| S1 | The gap between the research index and what the reader exposes is stated to the reader, not only in the PR description. |
| S2 | Search performance is acceptable at the shipped index size (observation only). |
| S3 | Attribution shown alongside a passage follows the #72 posture: no authorship asserted beyond what the source declares. |

## Method commitments, binding on me

- Findings recorded **before** opening any builder test or evidence for #74/#70.
- EXP-01 closure requires a **tamper test I run myself** that refuses. Reading a verification
  call is not sufficient — the RT-027 lesson that a guard can exist and fire for the wrong
  reason, and the error-34 lesson that absence of markers is not evidence.
- Text comparison against the candidate's **own pinned source**, stated explicitly, after the
  RT-029 wrong-yardstick near-miss.
- I will confirm which guard refused and why, not merely that something refused.
- No device, Safari, VoiceOver or airplane-mode claim.

## Falsifier

If every rendered Gurmukhi path refuses tampered data, the passage text matches the pin, and
the count is exact or reconciled, then this candidate closes EXP-01 and I will record it
closed — including in the findings index, not only in prose.
