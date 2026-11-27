# RT-028 — Frozen criteria for #73 (Daily Hukamnama: installation, Pages build, serve check)

Reviewer: Claude (independent). Frozen: 2026-11-27, **before examining the implementation.**
Candidate: #73, head `43b0a37ec310`, branch `feature/daily-test-publisher-20261127`,
base `feature/daily-install-proposal-20261127` (#69). Chain: #62 → #64 → #69 → #73.

## Why this is the highest-consequence candidate in the queue

Everything else I have reviewed is read-only or withheld. This one is about **publishing** —
it "requests the website build" and "verifies that the website serves the exact dated
reading." A defect here can put the wrong scripture in front of a reader on a given day, or
destroy a working version, and it is the first candidate whose subject matter is a **live
effect**.

The constraint that governs it is absolute and I will treat it as pass/fail with no latitude:

> "Never substitute a random Shabad or an earlier reading if the official daily selection is
> unavailable."

## Disclosure of prior exposure

I have read the builder's founder update: *"The connection now carries a checked official
reading through installation, requests the website build, and verifies that the website serves
the exact dated reading. It handles unavailable sources, conflicting updates and interrupted
publishing without substituting another reading,"* and *"Automatic delivery is not activated
yet."* I reviewed the Daily reader itself in RT-024 (#61) and the backup idempotence in
RT-025 (#62), so I carry knowledge of that chain. I have **not** opened any file in #73, #69
or #64, nor any builder test or evidence for them.

## My own standing commitment, restated because it binds this review

I will **not** fetch from `hs.sgpc.net` or any custodian source, and I will not contact any
custodian. Drafting a permission request is permitted; contacting is not. If verifying a
claim would require me to retrieve from a custodian, I will record the claim as unverified by
me rather than retrieve it.

## Criteria

### Hard — any failure blocks

| # | Criterion |
|---|---|
| C1 | When the official source is unavailable, no other reading is served, cached or presented. Fail closed, with a named status. |
| C2 | Authentication never rests on an HTTP status, an Ang number, a first line, a search snippet, or a provider majority vote alone. |
| C3 | A failed or interrupted update does not destroy or corrupt the previously working version. |
| C4 | An incomplete or corrupted package does not render as a complete valid composition. |
| C5 | Nothing in this candidate deploys, publishes or activates automatic delivery. Automatic delivery remains inactive. |
| C6 | No custodian is contacted, no cost incurred, no agreement entered. Any permission request exists as a draft only. |
| C7 | Public availability is not treated as permission to redistribute, host, cache offline, excerpt or reuse timing data. |
| C8 | No AI-generated interpretation, translation or explanation is introduced into the reading. |
| C9 | Tests and evidence use synthetic records only; no real reader reflection is accessed or exposed. |
| C10 | No credential, token or secret is committed. |
| C11 | No workflow added or modified by this candidate performs a live publish or mutation when run on `main`. |
| C12 | A reading is served only for the date it actually belongs to; rollover and timezone handling cannot present one day's reading as another's. |
| C13 | No relaying of a live Kirtan stream. |
| C14 | A cached or previously fetched reading is not presented as today's when today's has not been authenticated. |

### Soft — recorded, cannot block

| # | Criterion |
|---|---|
| S1 | Conflicting updates are handled without data loss (builder's own claim). |
| S2 | Interrupted publishing is handled without a partial state being treated as complete (builder's own claim). |
| S3 | Statuses are distinguishable by a reader, not only in logs. |
| S4 | The first real delivery after activation remains explicitly outstanding and is not claimed as tested. |

## Method commitments, binding on me

- I will record findings **before** opening any builder test or evidence file for #73/#69/#64,
  and will say so when I do.
- I will test behaviour where I can rather than reading code and inferring, and will use
  `node --check` or an actual run rather than the absence of error markers as evidence —
  the instrument lesson from error 34.
- Where a guard refuses, I will confirm **which** guard refused and for which reason, rather
  than treating any refusal as coverage — the lesson from RT-027's T6.
- I will not claim any iPhone, Safari, VoiceOver or airplane-mode result. I cannot test those.
- Automatic delivery being inactive is a claim I will verify, not accept.

## Falsifier

If the candidate fails closed on an unavailable source, leaves the previous version intact
through an interrupted update, and genuinely activates nothing, then its core safety property
holds and I will say so even if I find smaller issues elsewhere.
