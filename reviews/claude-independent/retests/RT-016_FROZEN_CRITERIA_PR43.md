# RT-016 — PR #43, Daily Hukamnama dated reader: frozen acceptance criteria

Committed **before** opening the implementation or the builder's evidence.

- Candidate: PR #43, head `fb49ef41bd890db879d7f93a861585915ef81622`, draft, open,
  unmerged. Verified against the API.
- Base: `plan/daily-hukamnama-authentic-audio-20261125` (PR #42, one document).
- Identified as unreviewed and highest-risk in `OPEN_PR_TRIAGE_20261126.md`.

## Why this is the highest-risk candidate in the repository

Daily Hukamnama is the feature the standing rules fence most tightly:

> **"Never substitute a random Shabad or an earlier reading if the official daily
> selection is unavailable."**

A dated reader that ships with a `fixture.json` is precisely the shape in which
that rule is broken by accident rather than by intent — a fixture is a convenient
thing to fall back to. So the substitution behaviour is criterion one, and I will
try to provoke it rather than read the code and form an opinion.

There is also a relationship to state. The much later **PR #56**, which I verified
today, deliberately ships Daily Hukamnama as **`available: false`** with the text
*"The verified daily selection is not connected to this library yet."* So this
candidate implements what the later work chose to defer. Whether that is a
superseded earlier attempt or a live foundation is itself something to establish,
not assume.

## Disclosed exposure

The PR body reached me and I read it. From it I know the claims: SGPC indexed
selections for 2025-10-14 and 2026-11-25 matching one 19-occurrence pinned source
across Angs 504–505; a 2017-11-25 archive body carrying a legacy encoding
discrepancy (`ਜਿਨ@` versus `ਜਿਨੑ`) that is **held**; limits recorded in the fixture
(no direct dated capture, indexed official evidence read, pinned corpus exact
match, no independent printed or human approval); separate event identities; one
provisional canonical Shabad; an Amritsar date resolver; SHA-256 fail-closed
fixture decode; and explicit missing/held/future states. **No test results were
disclosed.**

## Criteria

### The rule that governs this feature

| ID | Criterion | Fails if |
|---|---|---|
| RT16-C1 | When the official selection for a date is **unavailable**, the reader shows nothing and says why | any Shabad is displayed for that date |
| RT16-C2 | It never falls back to **an earlier date's** reading | a previous day's selection appears for a date that has none |
| RT16-C3 | It never falls back to the **fixture's** canonical Shabad as though it were that date's selection | fixture content is presented as a dated Hukamnama |
| RT16-C4 | A **future** date refuses rather than guessing | anything is shown for a date not yet read |
| RT16-C5 | A **held** entry stays held and is not rendered as a valid selection | held content displays as a complete reading |

### Dates are the attack surface

| ID | Criterion | Fails if |
|---|---|---|
| RT16-C6 | The date resolver uses the Amritsar day boundary, not the device's | a viewer's timezone changes which day's selection they are shown |
| RT16-C7 | A malformed, out-of-range or non-existent date refuses explicitly | it coerces to some nearby date |

### Scripture and encoding

| ID | Criterion | Fails if |
|---|---|---|
| RT16-C8 | Every Gurmukhi occurrence is identical to my reference for Angs 504–505 | one character differs undocumented |
| RT16-C9 | The legacy encoding discrepancy is **preserved, not normalised** | `ਜਿਨ@` is silently converted to `ਜਿਨੑ` or the reverse |
| RT16-C10 | Fixture decode is fail-closed on a digest mismatch | damaged fixture content renders |

### Honesty

| ID | Criterion | Fails if |
|---|---|---|
| RT16-C11 | No date's selection is claimed as officially authenticated beyond the evidence actually held | an indexed reading reads as a direct official capture |
| RT16-C12 | The absence of printed and human approval is stated where a reader can see it | only the data records it |
| RT16-C13 | Nothing claims qualified review, audio rights or device acceptance | any appears |

## Method limits, stated in advance

- One lineage (RT-005). Chromium only; **nothing here is device acceptance.**
- I can verify that a displayed line matches the pinned corpus. I **cannot** verify
  that it was the selection actually read at Sri Darbar Sahib on a given date —
  that needs the official record, and no digital check substitutes for it. Any
  pass here is about internal consistency and refusal behaviour, never about
  authenticity of the daily selection.
- **Every harness gets a control case.** Eleven of my instruments have produced a
  wrong first answer today, including three in this triage alone.

Verdicts: PASS / NEEDS_REVISION / INCOMPLETE.

Frozen at this point.
