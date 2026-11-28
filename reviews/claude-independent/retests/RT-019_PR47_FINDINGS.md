# RT-019 — independent findings, PR #47

**Candidate:** `d8202caa1b7761c493f70eb9c13514f9b87f2801`, draft, open, unmerged
**Base:** `fix/claude-review-first-repairs-20261125` at `1470477b5a27a8f975f1efce74443a0e136aa94e`
**Criteria frozen at:** `2bd5db23d57634ec09d56ada9f58e9486967f39c`, before any of this candidate was opened
**Verdict: PASS on what it claims. It does not address SK-01, and it does not claim to.**

## RT19-C3 — what #47 actually repairs, read from the code

Arriving at the Sukhmani reader through a URL fragment silently replaced the
reader's saved place. #47 makes a fragment a **visit** instead. It adds a sticky
notice — "Visiting a linked passage. Saved place: … It will stay unchanged unless
you choose to use this as your reading place." — with two explicit choices,
"Return to saved place" and "Use this as my reading place".

The comment in the code states the principle exactly: *"A URL fragment is a
visit, not consent to replace persistent learning."* `readLatestPosition()` also
declines to repair a record it cannot parse, keeping the last known position in
memory rather than overwriting the original.

This is a **consent and persistence** repair, and it is deterministic.

## RT19-C4 / C5 / C6 — it does not touch SK-01's path

| Question | Answer |
|---|---|
| Does the resume path change? | **No.** `$('resume-reading')` still calls `jump(initialRead,true)`, and `jump()` is byte-unchanged from base |
| Is the new hardened `alignLine()` used by resume? | **No.** `alignLine` is new in this PR and is called only from the visit paths |
| Do #47's tests cover reload-and-resume? | **No.** Every `page.reload()` in the new test happens *inside* a linked visit and waits for the visit notice. The plain path — reload with no fragment, click resume, assert the restored line equals the saved line — is not covered |
| Does #47 claim to close SK-01? | **No.** The strings "SK-01", "intermittent", "flake" and "race" appear nowhere in the diff |

**RT19-C7 — do-not-close note.** SK-01 must not be closed by merging #47. The
title "preserve saved Sukhmani reading place during linked visits" is accurate
for linked visits and would be easy to misread as covering the saved place
generally. The builder's own statement that the intermittent Sukhmani
reading-place issue still needs repair is **correct**.

## The useful part: SK-01 is deterministically reproducible, and I had it wrong

Running the reader directly, I isolated it with controls:

| Trial | Stored place |
|---|---|
| load only, no click, no scroll event | unchanged |
| load + resume click, **no** scroll event | unchanged — correct |
| load + resume click + **one** scroll event | **moves forward** |
| load, no click, scroll event only | unchanged |

It needs the resume click **and** a later scroll event. Neither alone does it.
Four seeded positions, four drifts:

| Seeded place | After one scroll event | scrollY before → after |
|---|---|---|
| `a03.p01.l01` | `a03.p01.l03` | 21071 → 21071 |
| `a03.p01.l02` | `a03.p01.l03` | 21137 → 21137 |
| `a05.p02.l04` | `a05.p02.l06` | 40356 → 40356 |
| `a12.p01.l01` | `a12.p01.l03` | 102185 → 102185 |

**The scroll offset is identical before and after. The page never moves.** The
second row, `l02 → l03`, is precisely the CI failure recorded in SK-01.

### Mechanism

`capture()` chooses the row whose top is nearest **+28px**:

    const d=Math.abs(r.top-28-visitAnchorTop());

After the resume restore, the restored line's top measures **−103px**, and the
row nearest +28px is two rows further on (+86px). So `capture()` and the restore
disagree about which line is current *at the same scroll position*. `jump()` then
clears its `internalScroll` guard after a single `requestAnimationFrame` and
never calls `clearTimeout(scrollTimer)`, so one scroll event slipping through is
enough for `capture(); current(a.id); save()` to make the disagreement permanent.

I did **not** isolate why the restored line lands at −103px when `.sk-line`
carries `scroll-margin-top:20px`. That remaining ~123px is unexplained by me and
belongs to whoever owns the reader.

### #47 already contains the shape of the answer

In visit mode the builder kept the two in agreement **deliberately and on both
sides**: the CSS adds
`.sk-visiting .sk-line{scroll-margin-top:calc(var(--sk-visit-height,0px) + 20px)}`
and `capture()` adds `visitAnchorTop()` to its own anchor. `alignLine()` also
calls `clearTimeout(scrollTimer)`, uses `behavior:'instant'`, and clears its
guard after two frames rather than one.

In my control the visit path preserved the saved place at every delay I tried,
while the resume path drifted at every delay. I will not overclaim from that:
visit mode also suppresses the save deliberately, so it is not a clean isolation
of the alignment fix. What it does show is that the pairing of alignment with
capture anchor exists in this candidate for visits and is absent for resume.

## Correcting SK-01

SK-01 says the defect is "a race in the reload-and-resume path" and that this "is
precisely why an off-by-one hunt would not have found it." **The second half was
wrong, and it was my own worst steer on this finding.**

There is a deterministic off-by-N sitting inside the race: a fixed disagreement
between the restore alignment and the capture anchor. An off-by-one hunt
comparing those two numbers would have found it. What is random is only the
*trigger* — whether a scroll event arrives inside the one-frame window — which is
why CI saw it roughly 1 run in 60.

The practical consequence matters more than the correction. SK-01 told the
builder that "a fix attempt that passes twenty runs has demonstrated very little"
and implied roughly sixty runs per expected failure. **That is no longer true.**
The defect reproduces on demand, 4 of 4, with one dispatched scroll event and no
flake experiment at all.

## RT19-C2, C9, C10

- **C2 PASS.** No data file changed outside `evidence/`. The only digests altered
  in `sw.js` are the three files this PR edits. `sukhmani-data.js`,
  `sukhmani-teaching.js`, `nitnem/reader.js` and every `nitnem/data/*.json`
  digest are unchanged.
- **C9 PASS.** The reader workflow is `pull_request` with `permissions: contents: read`.
- **C10 partial.** The cache identity is bumped from
  `0.14.2-claude-review-repairs-20261126-2` to
  `0.14.3-sukhmani-passage-visit-20261126-1`, which is a distinct cache rather
  than a mutation of the old one, and the candidate's own tests include a
  cached-offline linked-passage scenario. I did **not** test update-failure
  rollback myself, so I am not asserting the founder's "a failed update must not
  destroy a working previous version" rule holds here; I am recording that the
  cache identity changes correctly and the rest is untested by me.

## Method limits

Desktop Chromium at 390×844, reduced motion, service workers blocked, synthetic
records only — a fabricated note and bookmark written through `localStorage`
under the reader's own key. No real reader data was read or written at any point.
My scroll events are dispatched deliberately to open the window; that demonstrates
the window exists and is sufficient, and it does **not** reproduce the natural
1-in-60 arrival rate. Not Safari, not a physical phone, and no substitute for
either.

No approval. No merge. No application code changed by me.
