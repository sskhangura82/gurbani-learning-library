# RT-031 — Frozen criteria for #66 (source-bound Haumai reading and private reflection mechanics)

Reviewer: Claude (independent). Frozen: 2026-11-27, **before examining the implementation.**
Candidate: #66, head `ebc190509759`, branch `feature/haumai-learning-journey-20261127`,
base `fix/daily-backup-idempotence-20261126` (#62). Last candidate in the queue.

## Why privacy is the centre of this one

This candidate handles **what a person writes down about their own ego** — the most private
material the application will ever hold. Two standing constraints bind it absolutely:

> "Use synthetic data only. Never access or expose private reflections belonging to actual users."
> "Preserve private learning on the user's device."

And one more, because Haumai is a specific Gurbani concept rather than a general idea:

> "Do not imitate another religion's theology or impose another tradition's practices on Gurbani."

## Disclosure of prior exposure

Builder's founder update: *"I confirmed that the existing Haumai candidate already contains
the reviewed reader and Daily work. Its private questions, reflections, return date and saved
learning therefore need no separate integration branch. The new Haumai journey awaits
independent review before joining it."*

I carry knowledge of this chain: the Haumai source sheet from RT-022 (#55), the knowledge
pilot's Humility/Haumai registry from #45, the editorial-attribution guards RB-01/RB-02, the
Web Locks dependency I recorded in RT-025, and the fact that `articles/catalog.json` marks the
Haumai sheet `AWAITING_QUALIFIED_REVIEW` with `semanticReviewed: false`. I have **not** opened
any file in #66, nor any builder test or evidence for it.

I also know from INT-01 that this candidate touches `knowledge/journey.mjs`,
`knowledge/learning.mjs` and `knowledge/json.mjs`, because those appeared in the merge
conflict analysis. That is topology, not content.

## Criteria

### Hard — any failure blocks

| # | Criterion |
|---|---|
| C1 | A reflection never leaves the device: no network send, no analytics, no telemetry, no third-party call carrying reflection content. |
| C2 | No real reader reflection is accessed, read, or present in any committed file or evidence artifact. Test fixtures are synthetic. |
| C3 | Reflection storage fails **closed**, not open: if the storage or lock mechanism is unavailable, the app refuses rather than silently discarding or silently storing unsafely. |
| C4 | A failed or interrupted save does not destroy a previously saved reflection. |
| C5 | The Haumai reading is digest-verified against its pinned source before display. |
| C6 | No explanation, meaning or answer is presented as authoritative. The `AWAITING_QUALIFIED_REVIEW` / `semanticReviewed: false` posture is preserved and visible. |
| C7 | No answer or lesson is supplied where no source-linked lesson exists; a question with no written lesson says so rather than generating one. |
| C8 | No invented spiritual instruction, practice, ritual or prescription. The app may ask a question; it may not tell the reader what Haumai means for them. |
| C9 | No imitation of another tradition's theology, and no treatment of comparative similarity as identity of teaching. |
| C10 | No spiritual ranking, streak, score, progress-shaming or engagement manipulation of any kind. |
| C11 | No account, login, tracking identifier or unnecessary persistent id is introduced. |
| C12 | The editorial/scripture boundary holds: a reflection or question is never rendered as, or attributed to, scripture. |
| C13 | Nothing deployed, merged or published by this candidate. |

### Soft — recorded, cannot block

| # | Criterion |
|---|---|
| S1 | The "return date" mechanic is a reminder, not a streak or obligation. |
| S2 | Reflection export/import keeps the reader in control of their own data. |
| S3 | The Web Locks dependency recorded in RT-025 is either handled or restated, not newly introduced elsewhere. |
| S4 | A reader can delete their own reflection. |

## Method commitments, binding on me

- Findings recorded **before** opening any builder test or evidence for #66.
- **I will not create, read or inspect any real reflection.** Any storage test I run uses
  values I invent in the moment and are plainly synthetic.
- Where a guard refuses, I confirm **which** guard and why (RT-027 T6).
- A tamper test or an actual run, never absence of markers (error 34).
- When a test returns the answer I expected, I check I measured the right thing before
  recording it (the error-35 lesson, now explicit).
- No device, Safari, VoiceOver or airplane-mode claim.

## Falsifier

If reflections stay on the device, storage fails closed, the reading is digest-verified, and
no explanation is presented as authoritative, then this candidate's privacy and
non-authority properties hold and I will say so plainly — and the review queue closes with
it.
