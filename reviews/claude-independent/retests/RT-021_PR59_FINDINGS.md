# RT-021 — independent findings, PR #59

**Candidate:** `b69d6b31941adc025a1159ab0826d39a3fb58bc3`, draft, open, unmerged
**Base:** `389e79baff4016a2ff61d1851908de0bd66beb8f` (PR #56, the Preview 4 build)
**Criteria frozen at:** `3352b36063d4e42ea94da2e2ff1075a912bb25bd`, before any candidate code was opened
**Verdict: PASS. 25 of 26 criteria met; C24 untested by me and reported as such.**

This candidate repairs two of my own findings, so I wrote the criteria to try to
break it. It survived them.

## The trap it had to clear, and did

My published SK-01 reproduction dispatches a **script** scroll event. A fix that
ignored synthetic events would have passed my own test while leaving the defect
and breaking assistive-technology, keyboard and scrollbar scrolling. The handoff
claimed "There is no input whitelist for ongoing saving." Tested from three input
paths, after initialization:

| Input path | Saves a new place? |
|---|---|
| script-dispatched `Event('scroll')` | **yes** |
| programmatic `window.scrollTo` | **yes** |
| keyboard `PageDown` ×12 | **yes** |

No whitelist. The claim holds.

## SK-01 is fixed, and the fix found what I could not

My finding said the restored line landed at **−103px** while `capture()` anchors
at **+28px**, and that the unexplained ~123px "belongs to whoever owns the
reader." They found it. Base `jump()` hid the in-flow resume notice **after**
aligning; the new one hides it **first**, with the comment:

> Removing this in-flow notice after aligning moves the chosen line offscreen.

The notice's own height was the missing offset. Measured on this candidate, the
restored line now lands at a consistent **+34px** against the +28px anchor, so
alignment and capture agree — achieved by fixing layout ordering rather than by
moving the anchor. **My "anchor disagreement" framing was imprecise:** the anchor
was fine; the layout shifted underneath it after alignment.

Hardening alongside it: `cancelCapture()` clears the pending timer (the missing
`clearTimeout` I flagged), a `scrollGeneration` counter stops a stale callback or
a timer queued before a jump from replacing a newer place, and `behavior:'instant'`
replaces `'auto'`.

Zero-movement control, four seeded positions, one dispatched scroll event each:

| Seeded | Stored after | Top after resume |
|---|---|---|
| `a03.p01.l01` | unchanged | +34px |
| `a03.p01.l02` | unchanged | +34px |
| `a05.p02.l04` | unchanged | +34px |
| `a12.p01.l01` | unchanged | +34px |

With 300px of genuine movement the place correctly changes, so saving still works.

**C5–C8 also pass:** Resume restores the exact seeded occurrence; a reload leaves
the stored record **byte-identical** while aligning correctly; a user scroll to
top during pending restoration wins; and version, key set, note text, bookmark,
guide and appearance are all preserved unchanged.

## SRI-01 reader-page subset — all twelve criteria pass

| Page | Before | Now |
|---|---|---|
| `nitnem/index.html` | 0 / 6 | **6 / 6** |
| `sukhmani.html` | 2 / 7 | **7 / 7** |
| `full-japji.html` | 2 / 11 | **11 / 11** |
| the two Salok pages | 6 / 6 | unchanged |

**36 of 36 pins recomputed against real file bytes: all valid, zero mismatches**
(sha384 ×24, sha256 ×12). A wrong pin fails closed, so this mattered.

Altered scripts are refused — `Failed to find a valid digest in the 'integrity'
attribute` — and with one altered the page renders **no scripture**: sukhmani
2027 lines → 0; nitnem 2475 Gurmukhi leaf nodes → 13, which is static page
chrome, and 1564 line elements → 0. The existing synthetic note and bookmark
survived every tampered load.

Most importantly for my own finding, the blocked page makes **no false
verification claim**. It says:

> The original scripture could not be verified, so it has not been displayed.
> Your saved learning has not been changed.

and warns against clearing website data, noting a normal reload may still use a
damaged offline copy. That is better than the criterion asked for: it withholds
scripture, states the failure, protects the learning, and anticipates the
service-worker interaction I had intended to raise.

## The new pin tool, tested rather than read

| Check | Result |
|---|---|
| default mode | **check only**; `--write` required |
| tampered verifier, `--check` | refuses: "Frozen source/verifier bytes changed: js/source-integrity.js" |
| tampered verifier, **`--write`** | **still refuses**, and modifies no page |
| inline script injected | refused |
| extra external script | refused |
| two scripts reordered | refused: "unexpected, inline, module or reordered script at 1" |
| module script | refused |
| workflow invocation | `reader-qa.yml` calls it with an explicit `--check` |

So CI cannot silently re-pin tampered code, and the tool cannot be used to
launder a changed verifier even when asked to write.

## Containment

- **C22 PASS** — no scripture, teaching or data file changed; storage key and
  schema version untouched.
- **C23 PASS** — cache identity moves `0.19-unified-library-v1-20261126-1` →
  `0.20-reader-reliability-20261126-1`, and regenerating the manifest produces a
  **byte-identical** `sw.js`, so it is reproducible in fact.
- **C25 PASS** — no deploy action and no `pages: write`; all six workflows are
  `pull_request` with `contents: read`.
- **C26 PASS** — #58 still `b68e080043bb0b4e5cb3d17977e65c8cd62c15b3`, #47 still
  `d8202caa1b7761c493f70eb9c13514f9b87f2801`.
- **C24 NOT TESTED BY ME.** I did not exercise update-failure rollback. The
  rollback branch `rollback/reader-reliability-base-20261126` is verified to sit
  at the parent, and the cache identity is distinct, but I am not asserting the
  founder's "a failed update must not destroy a working previous version" rule
  from that.

## My own errors in this review — four new, and two repeats of errors I had already written down

The repeats are the part that should count against me.

20. **C1, first attempt.** I scrolled 90px and then read the resulting save as
    drift, reporting "STILL DRIFTS." Scrolling 90px *should* save a new place.
    Caught only by rerunning with the zero-movement control.
21. **PREV-01** — withdrawn separately; instrument unfit for the question.
22. Mistyped #58's hash in two throwaway shell commands. Contained: the short
    prefix resolved and no published document carries the wrong value, which I
    verified rather than assumed.
23. **HTTP cache across probes.** Reusing one browser context meant the control
    run cached `sukhmani-reader.js`; the tampered run was served the cached
    original, so a correctly refused script appeared to execute and I nearly
    filed a pin failure. Fresh contexts plus cache bypass reversed it.

Repeats:

- **A crude regex matched a denial, again.** `/verified|checked/` matched "could
  not be verified". I made this exact error in RT-018 on "not scholar-approved",
  wrote it down, and repeated it. The method is unfit: read the matched sentence,
  always.
- **I measured the nitnem landing page, again.** My selectors returned zero on
  nitnem because `nitnem/index.html` is a landing page; scripture appears after
  opening a bani. This is instrument error 1 from RT-009, documented, repeated.

## Method limits

Desktop Chromium at 390×844, synthetic records only, service workers blocked in
the resume tests. The handoff excludes the rapid-exit case inside the 200 ms save
debounce and I make no claim about it. No BFCache claim: I observed no
`pageshow.persisted` evidence and did not test for it. Not Safari, not a physical
device, and nothing here substitutes for either.

No approval. No merge. No application code changed by me; the candidate worktree
was restored after every mutation and verified clean.
