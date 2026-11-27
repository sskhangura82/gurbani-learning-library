# RT-017 — PRs #50, #41, #42: findings

Criteria frozen in `RT-017_FROZEN_CRITERIA_PR50_41_42.md` before opening any
implementation. These are the remainder of the real queue from the open-PR triage.

## Verdicts

| PR | Verdict |
|---|---|
| **#50** Kabir source intake | **PASS** |
| **#41** learning Explorer | **PASS**, with one observation (EXP-01) |
| **#42** integrated build order | **PASS** |

All three: `contents: read` only on their workflows, no deploy mechanism, and
**none is present in `main`** — all three are dark and unreachable from a family
device today.

## PR #50 — the concern I froze turned out to be the wrong concern

I expected a **second, competing intake path** for Kabir, since I had already
verified that collection's scripture in PR #52. It is not that. It is a
`PLANNING_INVENTORY` with `runtimeEligible: false` and `publicReady: false`, whose
own scope line says it *"does not alter the existing three-Salok scripture"*, and
whose limitations say *"The existing nineteen runtime scripture occurrences are
outside this intake mutation scope."*

So #50 inventories the **wider** Kabir Bani — one of its quarantined items is at
Ang 324, far outside the 1364–1377 range of the Salok collection — on the
knowledge-pilot line, not the Salok-reader line. Different lane, no conflict, no
competing claim of authority. RT17-C1 and C2 dissolve rather than pass.

**The scripture pin is untouched.** My file-level check flagged
`knowledge/source-lock.mjs`, which was alarming because that file's own comment
says to change it only with documented source review. It is a **new file
addition**, and its value is **byte-identical** to the reviewed PR #48's:
`cf5b6e72…`. Nothing changed.

**Discrepancies are quarantined, not resolved.** Two of them —
`SOURCE_LOCATION_AND_SEQUENCE_CONFLICT` at Ang 1377 and `CROSS_ANG_LOCATION_CONFLICT`
at Ang 324 — each carrying `status: OPEN_QUARANTINED`, `runtimeEligible: false` and
`automaticAuthorInclusion: false`. A conflict is held open rather than settled by
picking a side, which is the behaviour RT17-C4 asked for.

**And it states the guardrail back at me, in its own data:**

> *"Two digital displays may share upstream data; agreement does not establish
> independent manuscript evidence."*
>
> *"Source hashes establish byte identity, not correct scriptural attribution,
> location, completeness, or interpretation."*

That is the single distinction I have been drawing by hand all day — byte identity
is not correctness — written into the manifest by the builder. Its `editionStatus`
is `PINNED_DIGITAL_WITNESS_NOT_AUTHENTICATED_SAROOP`, which says precisely the
right thing: a pinned digital witness is not an authenticated Saroop.

## PR #41 — correct content, and one structural observation

`explore/` is a 796-line single-lesson surface for Sukhmani Ashtpadi 17. Its own
scope line draws the right boundary: *"Source text remains in the existing
Sukhmani reader; this file is editorial teaching, **not another scripture
transcription**."* Status `AI_ASSISTED_DRAFT_NOT_QUALIFIED_HUMAN_REVIEWED`. Draft
labelling present on the page.

Each of the nine units carries a `cue` — one opening Gurbani line used to locate
the passage — with `originalReader: "../sukhmani.html#ashtpadi-17"` pointing at the
verified reader for the actual text. That is a sound division: the verified reader
owns the scripture, the lesson owns the teaching.

**I verified all nine cues against my reference: 9 of 9 identical**, with both
controls passing (an altered cue is detected, an unaltered one is found). So the
content is right.

### EXP-01 (low) — nine Gurbani lines rendered with no runtime verification

`explore/app.js` contains **no** digest, integrity or verification call of any
kind. Every other Gurmukhi surface in this project verifies its source before
rendering; this one does not. So nine cue lines of Gurbani render unchecked.

Proportionate statement of it: nine incipits, not a scripture body, and they are
currently **correct** — I checked. The exposure is that nothing would catch it if
they stopped being correct, in the one surface that departs from the project's own
pattern. Low severity, worth closing before the Explorer grows beyond one lesson,
because the pattern is easier to add now than to retrofit across many lessons.

### Worth crediting, because it is the hard part done well

The lesson's `caution` field reads: *"Similarity of the word Sat across Indian
traditions is not proof of identical metaphysical teaching. The Sri Chand
authorship/encounter story is a later tradition…"*

Two standing rules honoured in one sentence that nobody asked for: comparative
similarity is not identity of teaching, and a historical encounter story is
labelled as later tradition rather than recounted as fact. That is the
cross-tradition containment and the no-invented-history rule, applied voluntarily.

## PR #42 — one planning document, and an unusually honest one

83 lines, documentation only, no code, no scripture, no data. It is a
`nonpublishing planning record` and reads like one.

The source table is the part worth quoting, because it decides things correctly in
advance:

- *"A listing is not proof of file completeness, recording identity, ownership,
  rights, availability of its underlying endpoint or API uptime."*
- A conflicting witness — `dailyhukamnama.in` showing **Ang 704** where the primary
  source showed Ang 504 for the same date — is recorded as a **negative fixture**
  with the rule *"primary date identity and complete text win; **never majority
  vote**."* That is the standing rule against provider majority vote, implemented
  as a test case rather than a sentence.
- SikhNet is logged as *"secondary corroboration, independent transmission lineage
  not established."*
- Audio: *"do not assume HTTPS, stable historical audio or permission"*, and *"no
  production adapter until terms clarified."*

It also represents **my own** review accurately, including its limits: *"138
Dasam-source differences require named-edition review, not 138 established
errors. 342/3,773 meanings closely read, not a full scholarly audit."* Both
qualifications are correct and I did not have to ask for them.

The commit heads it cites for PRs #38 and #40 are now stale, which is expected of a
dated planning record and which the document itself pre-empts: *"Recheck exact
heads and CI before action."* Not a defect.

## The queue after this

Every open pull request in the repository now has a verdict from me **except two**:
**#44** and **#46**, which are **my own drafts** and which the standing rule forbids
me from reviewing as independent. They need the builder.

Still outstanding across the project and not closable by review: printed-source
collation, physical device acceptance, audio rights, and — as the founder has now
ruled on gating — the unread state of the teaching drafts, which remains a
recorded fact rather than a gate.

**No approval. No merge. Drafts stay drafts.**
