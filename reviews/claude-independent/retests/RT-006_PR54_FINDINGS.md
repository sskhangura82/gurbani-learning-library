# RT-006 — PR #54 findings

Criteria were frozen first in RT-006_FROZEN_CRITERIA_PR54.md, committed before
any diff, `docs/` file or `evidence/` file on this candidate was opened. Only the
PR shape and changed file **names** were read first, and that is stated there.

- Candidate: PR #54, head `8917beaab7acc5770cb5a8fee682c9702a0689cb`, draft.
- Base: frozen PR #52 at `792afa209c98bb53f257a8dfd5500bef10bfc8e3`.
- This candidate repairs four defects **I** raised. A reviewer checking fixes to
  his own findings is biased toward confirming them, so each criterion was
  written to try to break the repair.

## Verdict: every criterion I could test PASSES. Four repairs verified.

## SF-01 — the Japji reading place. FIX-VERIFIED-ON-CANDIDATE

Real Safari **26.6** on macOS, candidate served from the founder's own Mac over
localhost and driven with safaridriver. Chromium could not have settled this.

| Criterion | Before (build 1470477) | On this candidate |
|---|---|---|
| RT6-C1 go to library, press Back | **0 of 3** — top of page every time | **3 of 3 exact** at y=11168 |
| RT6-C3 reload | 3 of 3 | **3 of 3 exact** |
| RT6-C3 same-URL navigation | 3 of 3 | **3 of 3 exact** |
| RT6-C3 fresh cache-busted URL | 3 of 3 | **3 of 3 exact** |
| RT6-C2 `history.scrollRestoration` | `manual` | **`manual`** — reload fix preserved, not reverted to `auto` |
| RT6-C4 stored place after a departure and return | — | no zero-ish offset persisted |
| RT6-C5 guide state on return | — | `pause()` runs first on `pageshow` |

**The defect is closed and nothing regressed.** This is the first repair in the
project verified in the engine where the defect was found.

Reading the repair: a `pageSuspended` flag now guards `rememberVisible()` and the
scroll listener, so transient history scroll events cannot overwrite the saved
occurrence during departure or return. `pagehide` clears the scroll timer and the
return frame, captures the anchor, sets the flag, pauses and persists. `pageshow`
pauses, takes a **copy** of `state.read`, restores it immediately and again on the
next animation frame, then reasserts it and clears the flag. Copying the point
before restoring is the detail that makes it safe, and the double restore handles
layout settling. Careful work.

This matches the mechanism the builder described in their cross-check, which they
had labelled a code-path hypothesis. It is now observed behaviour, not hypothesis.

## RT4-05 — the storage refusal. FIX-VERIFIED-ON-CANDIDATE

Verified at runtime in Chromium against the shipped code and shipped data, with
the incoming notes placed on **non-overlapping** line ids so the merge guard
could not fire first and mask the storage path.

| Criterion | Result |
|---|---|
| RT6-C6 plain preservation message on quota failure | **PASS** |
| RT6-C7 existing work survives | **PASS** — notes 2→2 byte-intact, bookmarks 1→1, revision 1→1 **not advanced**, reading position unchanged, export still works |
| RT6-C8 no fixed lower cap introduced | **PASS** — a 17,446,663-byte backup still passes the format guard; `maxBackupBytes` arithmetic untouched |
| RT6-C9 no clearing, eviction, probing or invented quota | **PASS** — no `removeItem`, no storage `clear`, no `navigator.storage.estimate`, no trial write. The code comment states "Never remove an old record to make room" |
| RT6-C10 no silent partial import | **PASS** — none of the 484 incoming ids present afterwards |
| RT6-C11 per-note limit and format ceiling unchanged | **PASS** — `NOTE_LIMIT` and the budget arithmetic are not in the diff |

The error is now typed — `LearningStorageError`, code `LEARNING_STORAGE_FULL` —
and the message reads:

> There is not enough space in this browser to save this change. Your existing
> saved learning is preserved. Keep your backup file, and export any unsaved
> reflection before leaving. You can try restoring in a browser or device with
> more available space.

That ends with reassurance and an action, like every other refusal in the
importer, which was the whole of my complaint. A non-quota write failure gets a
parallel message.

**Recorded against myself:** my original remedy was a fixed lower cap. The
builder rejected it because it would have recreated the very defect just fixed,
and they were right. The implemented mechanism — one write, under the existing
lock, with useful failure handling and no probing — is theirs, and it is what I
verified. Design agreement was not verification; this is the verification.

## SF-02 and SF-03 — the Simran Room. FIX-VERIFIED-ON-CANDIDATE

| Criterion | Result |
|---|---|
| RT6-C12 no live countdown | **PASS** — the `show()` function that rendered `MM:SS` is removed outright; `tick()` now only checks for completion |
| RT6-C13 selected length hidden while sitting and while paused | **PASS** — no clock and no length visible in either state, and nothing changed between two samples two seconds apart |
| RT6-C14 UI no longer asserts an established Ang | **PASS** — the label is now "GURBANI ANCHOR · JAPJI SAHIB · PAURI 4", and the link reads "Guru Granth Darpan reference" rather than "See source Ang 2" |
| RT6-C15 anchor Gurmukhi byte-unchanged | **PASS** — `ਅੰਮ੍ਰਿਤ ਵੇਲਾ ਸਚੁ ਨਾਉ ਵਡਿਆਈ ਵੀਚਾਰੁ ॥` identical to the base, confirmed by extraction and set comparison |

The room's own copy now states "The clock stays out of view", which is the
design intent written where a user can read it.

**SF-03 remains OPEN, as it must.** The UI no longer asserts the Ang, which is
what SF-03 asked for, so the *presentation* defect is fixed. The underlying
question — whether Ang 2 is established — cannot be closed by me on digital
evidence of any kind, because the application pins Open Granth and Open Granth
declares Shabad OS as its source (RT-005). One lineage.

**A lead worth following, not a finding.** The attributed link points at
`gurugranthdarpan.net`, which is a different source family from
Shabad OS and Open Granth. If its text were collated independently it could be
the separate witness SF-03 needs. I have not fetched or assessed it, and a
website is not printed collation either. Offered as a lead for the founder or a
qualified reviewer to judge.

## The new breathing tool. PASS on every criterion

| Criterion | Result |
|---|---|
| RT6-C16 two phases, **no holds anywhere** | **PASS** — the only matches for "hold" are negations: "with no holding", "Gently, without holding". No kumbhak, retention or pranayama anywhere in the page, scripts or CSS |
| RT6-C17 no sacred text, no Simran data, no shared key | **PASS** — **zero** Gurmukhi characters across `breathing.html`, `js/breathing.js`, `js/breathing-core.js`; no `glp001.` key, no reference to Simran data |
| RT6-C18 no persistence | **PASS** — no `localStorage`, `sessionStorage` or `indexedDB` reference exists |
| RT6-C19 explicitly optional, carries a not-treatment line | **PASS** — "OPTIONAL BREATHING EXERCISE", "Follow only while it feels comfortable", "Begin whenever you choose", and "Stop if you feel dizzy, short of breath or uncomfortable. This is not treatment and does not replace medical care." |
| RT6-C20 reduced motion respected; stops when hidden | **PASS** — `matchMedia('(prefers-reduced-motion: reduce)')` disables the toggle and holds the circle still with a visible note; the guide refuses to start while `document.hidden`; `visibilitychange` stops it with "Stopped when this page was hidden" |
| RT6-C21 no optimality claim, no scriptural equivalence | **PASS**, and beyond what I asked |

On RT6-C21 specifically, the copy now reads: *"One small study compared breathing
at 6 and 15 breaths per minute. Other research used a personally measured
resonance rate. **This guide does not measure yours, and six breaths per minute
will not suit everyone.** A review found short-term physiological effects across
studies; longer-term…"* and *"It contains no spiritual instruction."*

**That corrects my error, properly.** I had presented six per minute as though it
were a target and conveyed none of the sources' limits. The shipped copy flags
the small sample, acknowledges that resonance rate is individual, states plainly
that the pace will not suit everyone, and keeps physiology separate from
practice. Better than my own framing was.

## RT6-C22 — nothing touched that should not be. PASS

No scripture package, teaching file, source selection or source lock differs
from the frozen base. The only changes to `salok-kabir/index.html` and
`salok-mahalla9/index.html` are the subresource integrity hash for
`nitnem/local-learning.js`, which must change because that file changed —
verified by reading the diff, which alters nothing else on those lines. The Kabir
opposing-heading witness is recorded in a separate new file under `research/`,
changing no selection, exactly as stated.

## RT6-C23 and C24. PASS

No new exposition, interpretation or licensed content. The Simran Room still
says the fuller teaching is "being developed… with specialist review still
ahead", and the explanation slots elsewhere remain empty. No device, VoiceOver or
airplane-mode success is claimed anywhere in the PR body or the UI; the Safari
evidence in this file is labelled desktop macOS throughout.

## What this does not close, and cannot

- **Physical iPhone, iPad, Home Screen, VoiceOver and airplane-mode acceptance.**
  Desktop Safari and iOS Safari differ precisely where SF-01 lives — navigation,
  memory pressure and tab eviction. The repair is verified on desktop WebKit. The
  ten-minute physical script remains unrun and remains the only thing that can
  settle iPhone behaviour.
- **Qualified Gurbani review.** Unchanged. The theological question of whether a
  visual pacer may sit beside Naam at all stays blocked, and nothing in this
  candidate claims otherwise.
- **SF-03's underlying witness question**, per above.
- **RB-01 on PR #53.** Still mine, still not done.
- RT4-C5 live separation-guard mutation test and RT4-C7 mobile label check on
  PR #52. Still not run.

## Overall

Four defects I raised are repaired, and all four repairs verified — SF-01 in the
engine where it was found. No regressions detected against any criterion. I have
not read the builder's `docs/` or `evidence/` files; comparing their results
against these findings is the next step and belongs after this file is committed.

**No verdict of acceptance is offered and none was requested. I do not approve
and I do not merge. The candidate stays a draft.**
