# RT-011 — PR #56, Unified Library v1: frozen acceptance criteria

Committed **before** opening any changed application code, any `docs/` file or
any `evidence/` file.

- Candidate: PR #56, head `389e79baff4016a2ff61d1851908de0bd66beb8f`, draft, open,
  unmerged. Verified against the API, not taken from the handoff message.
- Base: `feature/article-source-print-20261126` — PR #55's branch, so this is
  stacked on the PR #55 candidate I verified in RT-007 and RT-010.
- The builder requests no verdict and claims no acceptance.

## Disclosed exposure, stated before anything else

The builder's handoff reached me through the notification channel and I read it
in full. So I am **not blind on scope**, and I will not pretend otherwise. From
that message I already know the claimed scope — Today / Read / Explore / Saved, a
metadata directory of the existing ten readers, a native saved-learning entry, a
larger-text layout, and existing offline-shell integration — and these claims:

- "No new scripture or exposition."
- "The new source rollback is retained. Production and Preview3 are unchanged."
- "RB-01 remains OPEN and the knowledge pilot stays out of both this candidate
  and the phone preview."

**No test results were disclosed to me.** The handoff states scope and evidence
locations without a result summary, which is the protocol working. Every claim
above is treated as a claim to verify, not a finding.

## What I read before freezing

The PR shape and the changed file **names** only. Two things in that list set the
criteria below, and both raise the risk of this candidate well above PR #55's:

1. **`nitnem/reader.js` is modified (+14/-4).** That file holds the entire pin
   set for the project — the library and learning digests, the expected source
   commit, both Salok source manifests, and the semantic sequence and
   structure/attribution pins. It is the root of trust for every reader. A change
   there is the highest-consequence change anyone can make to this repository.
2. **`js/japji-full.js` is modified again (+8/-2)**, and `js/sukhmani-reader.js`
   (+4/-0). `js/japji-full.js` is where I verified the SF-01 away-and-back repair
   in PR #54. A verified fix in a file that has since changed is not a verified
   fix.

No scripture data file appears in the list — no `*/data/*.json`,
`js/japji-full-data.js`, `js/sukhmani-data.js`, `nitnem/data`, `salok-kabir/data`
or `salok-mahalla9/data`. That is consistent with "no new scripture," and it is
criterion RT11-C1 rather than an acceptance of the claim.

I also noted `failure-4.png` and `failure-7.png` inside two of the five committed
browser-evidence runs. Preserved failures are the behaviour the standing rules
require, and they are criterion RT11-C12.

## Criteria

### The root of trust — the part that matters most here

| ID | Criterion | Fails if |
|---|---|---|
| RT11-C1 | No scripture package, teaching package or source lock changed from the PR #55 parent | any source or teaching byte differs |
| RT11-C2 | Every pin in `nitnem/reader.js` survives — library digest, learning digest, expected source commit, both Salok manifests, and both semantic pins | any pin is removed, loosened, or replaced by a computed value |
| RT11-C3 | Every page that loads a pinned script carries a matching, correct subresource integrity hash | any page's hash is stale, absent, or does not match the served bytes |
| RT11-C4 | Damaged scripture still refuses to render, reached **through the new entrances** | any new route renders unverified or altered scripture |
| RT11-C5 | An altered teaching package still refuses independently while scripture stays readable | the new layer couples them, or hides the refusal |

### Existing readers and existing users

| ID | Criterion | Fails if |
|---|---|---|
| RT11-C6 | Existing saved-learning storage keys are unchanged | any key is renamed, namespaced or migrated such that existing notes or reading place stop loading |
| RT11-C7 | Existing saved notes and reading place still load and still export/import exactly | a round trip loses or alters a record |
| RT11-C8 | The SF-01 away-and-back reading-place repair still holds in `js/japji-full.js` | the restored position regresses |
| RT11-C9 | A failed or interrupted offline update does not destroy a working previous version | the shell is left broken or empty |

### Honesty of the new surfaces

| ID | Criterion | Fails if |
|---|---|---|
| RT11-C10 | Draft, educational and awaiting-qualified-review labelling is present on **each** new entrance — Today, Read, Explore, Saved | any entrance presents content without it |
| RT11-C11 | No new exposition, paraphrase, interpretation or meaning-claim is introduced anywhere in the new layer | any explanatory sentence about what a passage teaches appears |
| RT11-C12 | The committed failure screenshots are genuine preserved failures, explained and not hidden | a failure is silently superseded, or presented as a pass |
| RT11-C13 | The knowledge pilot is genuinely absent from this candidate | any knowledge-pilot code or data is reachable from it |
| RT11-C14 | No Daily Hukamnama substitution path is introduced | any route can show a different Shabad or an earlier reading when the official selection is unavailable |

### Layout and reach

| ID | Criterion | Fails if |
|---|---|---|
| RT11-C15 | At 320 and 390 pixels, and at 200% text, no new surface clips text or overflows horizontally | content is cut off or the page scrolls sideways |
| RT11-C16 | Nothing can deploy the application; the new workflow tests and uploads only | the new workflow can publish |

## Method limits, stated in advance

- Chromium only. **Nothing here is Safari, iPhone, iPad, Home Screen or VoiceOver
  acceptance**, and a desktop width is not a physical device.
- Synthetic learning records only. No real user data is read or created.
- Every digital source check sits in **one textual lineage** (RT-005). No finding
  of mine is independent textual verification of the scripture.
- I test by anchor id and digest rather than scroll position.
- Each harness I write gets a **control case**. Five of my instruments produced a
  wrong first answer today; every one was caught by a control, and I am not
  running another without one.

Verdicts: PASS / NEEDS_REVISION / INCOMPLETE.

Frozen at this point.
