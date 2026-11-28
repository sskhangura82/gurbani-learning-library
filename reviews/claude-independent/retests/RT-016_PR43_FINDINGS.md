# RT-016 — PR #43, Daily Hukamnama dated reader: findings

Candidate `fb49ef41bd890db879d7f93a861585915ef81622`. Criteria frozen in
`RT-016_FROZEN_CRITERIA_PR43.md` before I opened the implementation.

## Verdict: PASS on every criterion, and this is the most carefully fenced code I have reviewed on this project

| ID | Criterion | Result |
|---|---|---|
| RT16-C1 | unavailable date shows nothing and says why | **PASS** |
| RT16-C2 | never falls back to an earlier date | **PASS** |
| RT16-C3 | never presents the fixture Shabad as a dated reading | **PASS** |
| RT16-C4 | a future date refuses | **PASS** |
| RT16-C5 | a held entry stays held | **PASS** |
| RT16-C6 | Amritsar day boundary, not the device's | **PASS** |
| RT16-C7 | malformed dates refuse explicitly | **PASS** |
| RT16-C8 | Gurmukhi identical to my reference | **PASS** |
| RT16-C9 | legacy encoding preserved, not normalised | **PASS** |
| RT16-C10 | fixture decode fail-closed | **PASS** |
| RT16-C11 | no overclaimed authentication | **PASS** |
| RT16-C12 | missing approval visible to a reader | **PASS** |
| RT16-C13 | no claim of review, audio rights or device acceptance | **PASS** |

## The rule, provoked rather than read

Six date classes, with a control:

| Date | Lines rendered | What the reader is told |
|---|---|---|
| 2026-11-25 — matched | **19** | "Dated development example only · digital source match, not a released or scholar-approved daily reading." |
| 2025-10-14 — matched | **19** | same |
| 2017-11-25 — **held** | **0** | "Historical event held: a legacy encoding difference must be reviewed. No Scripture is rendered from this event." |
| 2026-11-20 — no event | **0** | "This date is not in our verified development examples. **No reading is substituted.**" |
| 2027-01-01 — future | **0** | "This date has not yet arrived in Amritsar." |
| 1500-01-01 | **0** | "No reading is substituted." |

No Gurmukhi in the document at all on any refusal, and the reading element stays
hidden. The resolver does an **exact** date match — `events.find(e => e.date ===
date)` — and returns a result object with **no `shabad` field** on every path but
a matched one; the reader returns early before rendering anything unless the
status is the matched one. There is no fallback to write.

Nineteen malformed inputs — wrong formats, impossible dates like `2026-02-30`,
whitespace padding, single-digit months, and type-coercion attempts (`0`, `{}`,
`[]`, `undefined`) — **all** returned `INVALID_DATE` with no Shabad.

**And the strongest single line in this candidate:** `publishedReading()` returns
`{status: "REVIEW_PENDING", …}` on a **matched** date — no `shabad` field at all.
The publish path is structurally incapable of emitting scripture, with the comment
*"Production publisher absent. Refuse every draft without substitution."* That is
the standing rule written into the type of the return value rather than into a
document.

## Scripture, verified to its exact boundaries

All 19 occurrences appear as **exactly one contiguous window** in the 60,555-line
ordered reference, at row 22586. One window, not several.

The boundaries are right, and that is the part worth stating. The reference line
immediately before the window ends `॥੮॥੩॥` — the close of the *third* Shabad — and
the fixture's last line ends `॥੮॥੪॥`. The line immediately after is a new heading,
`ਗੂਜਰੀ ਮਹਲਾ ੧ ਘਰੁ ੪ ॥`. So the fixture captures Shabad **4** complete and nothing
adjacent, which independently corroborates the `shabad04` in its own identifier.

Three controls passed: line-by-line identity across the window, an altered line
breaking the match, and the preceding reference line not belonging to it.

**My ordering was wrong twice before this worked.** I first sorted the reference by
line id, which is not scripture order, and got "longest run: 1 of 19" — a result
that would have read as a catastrophic scripture mismatch. Correct ordering is
section source order, then group order within section, then line order within
group. Recorded because the wrong answer was alarming and entirely mine.

## The held encoding variant is handled better than "held"

`validateFixture` rejects any occurrence whose text matches `/[<>@�-]/u`.
So the legacy `ਜਿਨ@` form is **structurally barred from the scripture array** — it
cannot be loaded, not merely not displayed. The canonical text uses the proper
`ਜਿਨੑ`, and the 2017 event records the discrepancy as data
(`expected: "ਜਿਨੑ", observed: "ਜਿਨ@"`) with status `HOLD_ENCODING_VARIANT`.

That is the right shape: the difference is **recorded** rather than silently
reconciled, and the legacy form is barred from ever rendering as scripture.

## Fixture integrity and the rest

Damaged one character in the fixture: digest mismatch, **0 lines, every button
disabled**, and *"The pinned source fixture could not be verified. No reading will
be shown."* Decode checks the digest before parsing, caps the payload at 64 KB,
and uses a fatal UTF-8 decoder.

`validateFixture` also hardcodes the whole structure: 19 occurrences, the exact
heading `ਗੂਜਰੀ ਮਹਲਾ ੧ ॥`, occurrence 4 ending `॥੧॥ ਰਹਾਉ ॥`, occurrence 18 ending
`॥੮॥੪॥`, per-occurrence Ang (504 for the first four, 505 after), kind, stanza
arithmetic, and a required closing `॥`.

**Timezone, tested across the maximum possible spread.** Pacific/Honolulu (UTC−10)
through Pacific/Kiritimati (UTC+14) — a 24-hour range — all reported the same
*"Amritsar date: 2026-11-27"*. The day boundary is genuinely computed in
`Asia/Kolkata` via `Intl`, so a viewer's device cannot change which day's selection
they are offered.

## What a reader is told, in the page's own words

> "Historical source examples only. No live retrieval, approved commentary, or
> authorized in-app recordings yet." · "**No source substitution is permitted.**" ·
> "This fixture deliberately does not publish unapproved teaching." · "Simple ·
> pending  Detailed · pending  Deep study · pending" · "In-app audio is unavailable
> until permission and recording identity are verified."

And the SGPC listening link is labelled *"(current provider content, **not a
date-matched archive**)"* — a precise distinction most products would not bother
to draw.

## Relationship to PR #56 — parallel, and not a conflict

`hukamnama/` exists in **neither `main` nor PR #56's tree**, and is in no offline
manifest. #43 is parallel to everything I have reviewed — no containment in either
direction.

So the later PR #56's Explore entry, *"The verified daily selection is not
connected to this library yet,"* is **literally accurate**: this reader exists on
its own branch and is unreachable from the library or from a family member's
device. The two statements are both true at once and there is no contradiction to
resolve. When Hukamnama is eventually connected, this is the foundation to connect,
and its refusal behaviour is the part worth keeping.

## One observation, not a finding

The reader loads `EXAMPLE_DATE = "2026-11-25"` by default, so the first thing a
visitor sees is a rendered Shabad for a date that is **not today**, labelled as a
development example. That is defensible for a development preview and the label is
honest. But the whole point of a Hukamnama is *today's* reading, so when this
becomes real the default should be today — and today's honest state, until an
adapter exists, is the refusal. Worth deciding deliberately rather than inheriting
the example default.

## The limit that no amount of this work closes

I verified that each displayed line matches the pinned corpus to the character, and
that the Shabad's boundaries are exact. **I did not verify, and cannot, that this
was the selection actually read at Sri Darbar Sahib on those dates.** That needs
the official record.

The candidate says so itself rather than leaving me to find it: the 2025-10-14
event records *"direct capture pending"*, the 2026-11-26 event *"direct capture
blocked/timed out"*, and the canonical comparison carries
`qualifiedHumanApproved: false` with `identityStatus: PROVISIONAL_LOCAL_ID`. The
fixture's own status is `DEVELOPMENT_FIXTURE_NOT_RELEASE_APPROVED` and its policy
sets `dailyAdapterActive`, `lessonApproved`, `recordingPermission` and
`publicationApproved` all to `false`.

So: internal consistency and refusal behaviour, verified. Authenticity of a daily
selection, outstanding — and correctly declared outstanding by the code itself.

## My own errors in this review

Two more, taking today's running total to **thirteen**: the reference-ordering
mistake above, and a probe script that crashed because `JSON.stringify(undefined)`
is not a string. Both failed loudly rather than quietly, which is the preferable
kind — but the ordering one produced a plausible-looking catastrophic result first,
and only the control caught it.

**No approval. No merge. Draft stays a draft.**
