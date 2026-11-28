# RT-018 — Independent findings, PR #58 (combined Knowledge candidate)

**Candidate:** `b68e080043bb0b4e5cb3d17977e65c8cd62c15b3`
**Base:** `fix/knowledge-editorial-boundary-20261126` (`f720099b6181`)
**`main` at review time:** `a3476ac4b9be90dde350fb35dd13ce0b672c120d`, `protected: false`
**Criteria frozen at:** `18fc9a62142b47842f35e3e5ebdf23b36bf7bf2c`, before any candidate code was opened
**Verdict: PASS** on 20 of 21 criteria. RT18-C18 deferred by protocol (below).

## Disclosed exposure

While this review was in progress the founder relayed, in chat, the builder's
five-point summary of what this candidate does. My criteria were frozen and
committed **before** that message arrived, so the freeze is unaffected. I had
not opened `evidence/knowledge-integration/BUILDER_EVIDENCE.md` or any report
under `evidence/knowledge-integration/` when the findings below were recorded.

## Results

| ID | Verdict | Evidence |
|---|---|---|
| C1 | PASS | exactly one `contentKind`, in `knowledge/kinds.mjs`, re-exported by `core.mjs`, imported by `app.mjs` and `search.mjs` |
| C2 | PASS | every Punjabi string on a passage page resolves to a classified container with a visible kind label; see the criterion defect below |
| C3 | PASS | result rows carry `data-match-origin` / `data-match-basis` and a distinct reason line |
| C4 | PASS | 4 scripture containers, **0** editorial descendants |
| C5 | PASS | the "Selected line is highlighted below" label is a sibling of the scripture container, **0** inside it |
| C6 | PASS | four forgeries refused **with both digests re-pinned** |
| C7 | PASS | an accepted heading-like string loads and still renders `data-content-kind="editorial"` |
| C8 | PASS | `scripture.json` **response completes** before `pilot.json` is requested |
| C9–C12 | PASS | author alias labelled editorial; literal match carries an occurrence id; alias result carries no quotation; `ਨਾਨਕ` in phrase mode returns **0** results |
| C13 | PASS | occurrence identity survives open, Back, Forward and reload |
| C14 | PASS | the two first-letter modes genuinely differ; see below |
| C15 | PASS | a cross-passage line yields "This learning link is unavailable", 0 panktis |
| C16 | PASS | NASA / category refused; Haumai / ego / humility return 3 / 2 / 3 |
| C17 | PASS | "1 selected passage in this pilot. This is not the complete Bani of this author." **This closes RT17-C14, which I left INCOMPLETE.** |
| C18 | **DEFERRED** | an assessment of builder evidence; cannot precede committing these findings |
| C19 | PASS | the only such strings are denials |
| C20 | PASS | both workflows are `pull_request` with `permissions: contents: read` |
| C21 | PASS | Knowledge absent from `main` **and** from the phone-preview branch |

## RT18-C6 — what the mutation battery actually proves

Seven served variants, each a full copy of the candidate:

| Variant | Loaded |
|---|---|
| unmodified control | **yes** |
| copied source line in `title`, digest not re-pinned | no |
| copied source line in `title`, **both digests re-pinned** | no |
| scripture heading `ਸਲੋਕੁ ਮਹਲਾ ੯`, re-pinned | no |
| numbered unit `ਵਿਚਾਰ ॥੪॥`, re-pinned | no |
| copied source line in `pa`, re-pinned | no |
| heading-**like** `ਸਲੋਕ ਵਿਚਾਰ`, re-pinned | **yes**, labelled editorial |

The guard in `registry.mjs` runs **after** both digests verify, so it is a
content guard, not a digest check. An automated rebuild that regenerates every
derived digest still cannot move scripture text or a structural heading into an
editorial field.

**Scope limit, stated plainly:** this proves the guard defeats *digest
regeneration*. It does not prove it defeats *file tampering*. See SRI-01 below.

## RT18-C14 — the modes were not distinguished by my first attempt

My first test strings returned identical results in both first-letter modes,
which demonstrates nothing. Using initials taken from words 3–6 of a line:

| Query | start-of-line mode | anywhere mode |
|---|---|---|
| `ਨਗਚਤ` (mid-line) | 0 results | 1, basis `source-first-letter` |
| `ਸਅਦਅ` (mid-line) | 0 results | 1, basis `source-first-letter` |
| `ਮਨਨਗ` (line start) | 1 | 1 |

Both modes return **source** origin. Neither regresses.

## SIG-01

**The attribution half is closed.** Searching the written form `ਨਾਨਕੁ` returns
`sggs.asa-di-vaar.pauri007.salok02` with origin **source**, its occurrence id,
and the correct attribution **Guru Angad Dev Ji** — the passage that was absent
from results in RT-015. Searching `ਨਾਨਕ` returns only **editorial** author-lookup
rows, carrying no quotation. The two are no longer confusable.

**The recall half remains open, by design.** `ਨਾਨਕ` in complete-word mode returns
0 results; no rule infers `ਨਾਨਕੁ` or `ਨਾਨਕਾ` from it. The handoff states this and
the search help text states it to the reader. Manufacturing that inference would
be a linguistic claim the pilot has no basis to make, so I am recording the limit
rather than asking for it to be closed.

## SRI-01 now demonstrated on the Knowledge Explorer

`knowledge/index.html` loads `app.mjs` with **no `integrity` attribute**, the same
exposure as `nitnem/index.html`. By editing only unpinned JavaScript — neutralising
`validateEditorialText` in `registry.mjs` and re-pinning both digests — the forged
heading `ਸਲੋਕੁ ਮਹਲਾ ੯` loads and displays while the page reports its normal
"Source files checked …" status.

Two qualifications I will not leave out:

1. Even in that compromised build the forged string is still enclosed with
   `data-content-kind="editorial"`. The display separation holds when the guard
   is removed, which is a real residual protection.
2. This is **pre-existing and not introduced by PR #58**, and it requires write
   access to the served files. It is not a remote exploit.

The consequence for integration order: the layered pin chain is only as strong as
the served HTML, and this page pins nothing.

## My own instrument errors in this review

Recorded because a review is only worth what its instrument is worth. These bring
the disclosed total for this review line to **eighteen**.

15. Assumed the search input was `#q`; it is `#query`. 30-second timeout, no result.
16. Left `pg.wait_for_timeout=0` in a script — assigning to a method instead of
    calling it. **Same class as error 8.** Recurrence, not a new kind.
17. Queried `.result-quote` as a child of `.result`. `row()` returns a wrapper
    `div` in which the quote is a **sibling** of the button. This made a passing
    criterion print as empty, and I nearly recorded C2/C3 as unverified.
18. A crude claim-scanning regex matched `scholar-approved` inside the sentence
    "not a translation or scholar-approved lesson" — a **denial**. Reporting that
    as a claim would have been a false finding against the candidate.

Also two defects in my own frozen criteria, which I am recording rather than
quietly reinterpreting:

- **C2 as written** says `lang="pa"` on scripture only. That is wrong: editorial
  Punjabi legitimately carries `lang="pa"` for screen readers. I verified the
  substance instead — every Punjabi string sits in a classified, visibly labelled
  container.
- My containment probe tested "in scripture **or** labelled editorial", which
  treats the third kind, `source-index` (author, composition and Raag names), as
  a failure. It is not one.

## First bypass attempt failed for a harness reason

My first attempt to defeat the pin chain replaced `loadKnowledge` wholesale and
returned the wrong index shape, so it threw into the catch and the page refused.
That was **my harness failing, not the page protecting itself**, and I record it
so the refusal is not later read as evidence of protection.

## Still outstanding, unchanged by this candidate

Open for the builder: RB-02, ANG-01, SRI-01 (now demonstrated here), SK-01, EXP-01,
ART-P01, and the SIG-01 recall half.

Not closable by review at all: printed-source collation against a second textual
lineage, physical iPhone / iPad / VoiceOver / airplane-mode acceptance, audio
rights, and the unsent gurbani.org permission letter. Desktop browser testing is
not a substitute for any of these and I am not offering it as one.
