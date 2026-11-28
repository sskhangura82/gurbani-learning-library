# RT-028 — #73 Daily Hukamnama test publisher: findings

Reviewer: Claude (independent). Date: 2026-11-27.
Criteria frozen at commit `4d412c0` **before** examination. Candidate head `43b0a37ec310`.

> **Written before I opened any builder test or evidence file for #73, #69 or #64.**
> I did read the candidate's own frozen-criteria doc, which is scope rather than test
> evidence; an addendum follows once I open the tests.

## Verdict: PASS on all fourteen hard criteria, with one rights question for the founder

My falsifier was: *"If the candidate fails closed on an unavailable source, leaves the
previous version intact through an interrupted update, and genuinely activates nothing, then
its core safety property holds and I will say so."* **It holds on all three.**

One finding is raised, and it is **not a code defect** — it is a rights decision that
belongs to the founder before activation. Details below.

| # | Criterion | Result |
|---|---|---|
| C1 | Fail closed, never substitute another reading | **PASS** |
| C2 | Authentication not by HTTP status / Ang / first line / snippet / provider vote | **PASS** |
| C3 | Failed or interrupted update preserves the working version | **PASS** |
| C4 | Incomplete package does not render as complete | **PASS** |
| C5 | Nothing deploys; automatic delivery inactive | **PASS** (static; see limits) |
| C6 | No custodian contacted, no cost, no agreement by this candidate | **PASS** |
| C7 | Public availability not treated as permission to host | **PASS as written — see the finding** |
| C8 | No AI interpretation introduced | **PASS** |
| C9 | Synthetic records only | **PASS** |
| C10 | No credential committed | **PASS** |
| C11 | No workflow performs a live mutation on `main` | **PASS** |
| C12 | Date integrity, rollover, timezone | **PASS** |
| C13 | No Kirtan stream relay | **PASS** |
| C14 | Cached reading not presented as today's | **PASS** |

## C5 / C11 — four independent layers, each verified by reading

1. **Workflow job gate** (`hukamnama-test-publish.yml` line 20):
   `if: github.repository == 'glp001-iphone-qa/glp001-iphone-test' && github.ref ==
   'refs/heads/main' && vars.GLP_DAILY_TEST_PUBLISH_ENABLED == 'true'`.
   In this repository the first clause is false, so the job never runs.
2. **CLI activation gate** (`publish-daily-test.mjs` line 125): `--publish-to-isolated-test`
   requires `GITHUB_REPOSITORY===TARGET && GLP_DAILY_TEST_PUBLISH_ENABLED==='true' &&
   GITHUB_REF===REF`, else `ACTIVATION_REQUIRED`. This check runs **before**
   `publishDailyTest` is called, so no acquisition or network occurs on refusal.
3. **Network off by default**: `enableNetwork` is false unless `--publish` is passed, and
   `env()` sets `GIT_ALLOW_PROTOCOL: network?'https':''` — with network off, git protocols are
   disabled outright.
4. **Remote identity check**: `checkedTarget()` reads **both** fetch and push URLs for
   `origin` and requires a single URL equal to the isolated repo, else `WRONG_TARGET`.

The workflow-level default is `permissions: contents: read`; `contents: write` and
`pages: write` exist only on the gated job. The signing key arrives from a secret, is written
to `RUNNER_TEMP` with mode `0o600`, and is removed in a step with `if: always()`.

**Limit, stated rather than glossed:** I intended to confirm layer 2 behaviourally by
invoking the CLI with `--publish-to-isolated-test` in this repository, expecting
`ACTIVATION_REQUIRED`. **My environment's safety classifier declined to run a tool named
"publish" with a publish flag, and I did not work around it.** That was the right call by the
classifier. So C5 rests on static reading of four layers rather than on a behavioural
refusal I triggered. `node --check` passes on both the tool and its test.

## C1 — fail closed, with no substitution path

`publishDailyTest` requires `prepared.status` to be `CANDIDATE_PREPARED` or
`ALREADY_ADMITTED`, else it refuses with `SOURCE_NOT_READY` (or
`CORRECTION_REVIEW_REQUIRED`). There is **no branch that selects a different date or a
previous reading**. The event is read at a path built from the requested date
(`hukamnama/events/<date>.json`) and decoded with that same date passed in, so a mismatched
event cannot satisfy it.

Terminal statuses are explicit and distinguishable: `READY_NOT_INSTALLED`,
`ALREADY_ADMITTED_NOT_PUBLISHED`, `PUSH_REFUSED`, `REMOTE_CHANGED`,
`PUSH_OUTCOME_UNKNOWN`, `INSTALLED_BUILD_NOT_REQUESTED`,
`BUILD_REQUESTED_READING_NOT_CONFIRMED`, `DELIVERED_EXACT_DATE`,
`DELIVERED_DATED_AFTER_ROLLOVER`. An unavailable source leaves a visible unavailable date,
which is what the constraint requires.

## C2 — delivery is confirmed by bytes and signature, not by a status code

After requesting the Pages build, the tool fetches the served event and source and requires
`Buffer.from(servedEvent).equals(eventBytes)` — **byte equality against bytes re-read from
immutable git objects** — and then re-runs `decodeEvent` / `decodeSource` on the *served*
bytes with the pinned public key. An HTTP 200 proves nothing here; `boundedResponse` treats
`response.ok && !response.redirected` as a precondition only, `redirect:'error'` is set on
both fetches, and `served()` restricts the path by regex to
`hukamnama/events/YYYY-MM-DD.json` or `hukamnama/sources/<64-hex>.json`, else `SERVED_PATH`.

This is the opposite of the failure mode the standing constraint names. Good.

## C3 — the previous version cannot be clobbered

- `requireThat(await io.head()===baseCommit,'REMOTE_CHANGED')` before any push.
- The push uses `--force-with-lease=refs/heads/main:<expected>`, so it fails rather than
  overwriting if the remote moved.
- The commit is built with `commit-tree` whose **sole parent is the recorded base**, and the
  header is then re-read and checked to contain exactly `parent <baseCommit>` and the expected
  tree, else `COMMIT_INVALID`. It appends; it does not rewrite.
- On push failure the tool re-reads the remote head and distinguishes three outcomes:
  reconciled (`UPDATED_AFTER_RECONCILIATION`), unchanged (`PUSH_REFUSED`), or moved elsewhere
  (`REMOTE_CHANGED`); if the head cannot be read it reports `PUSH_OUTCOME_UNKNOWN` rather
  than guessing.
- Local state is protected too: `DIRTY_CHECKOUT` refuses a dirty tree, and `OUTPUT_PATH`
  refuses an output directory inside the repository or its git common dir.

The run record is written with `flag:'wx'` and then renamed, so a status file is never
partially overwritten.

## C12 — date handling is correct

`amritsarDate` uses `Intl.DateTimeFormat` with an explicit `timeZone: "Asia/Kolkata"`,
`calendar:"gregory"` and `numberingSystem:"latn"`, so it is immune to the runner's local
timezone and to locale defaults — the right way to do this. A requested date must satisfy
`date <= amritsarDate(now)`, so **no future date**. If the date was taken as "today", the
tool re-asserts `amritsarDate(now)===date` before publishing, else `DATE_ROLLED_OVER`; and a
delivery completing after midnight is reported as `DELIVERED_DATED_AFTER_ROLLOVER` rather
than silently as today's. `cache:'no-store'` is set on the served fetch, covering C14.

## The finding — RIGHTS-01: activation would host custodian content at a public URL

The publish target is `https://glp001-iphone-qa.github.io/glp001-iphone-test/`, and the
schedule is `cron: '23 1,2,3,5,8 * * *'` — **five runs a day**.

What lands there is the official dated reading, acquired from the custodian. The standing
constraint is explicit:

> "Public availability does not establish permission to redistribute, host, embed, cache
> offline, create excerpts or reuse timing data."

The candidate is scrupulous about everything adjacent: the fixture contract requires
`publicationApproved:false`, `lessonApproved:false`, `recordingPermission:false` and
`dailyAdapterActive:false`; the run record carries `mode:'DEVELOPMENT_PREVIEW'` and
`publicationApproved:false`. **But a status of "not approved" is not a permission, and an
isolated test site is still a public URL.** A `github.io` address is publicly reachable
unless the repository is private with Pages access control, which is a paid feature.

So: nothing is hosted today, and this candidate **publishes nothing** — C7 passes as written.
The finding is that **activation is the moment a rights question becomes live**, and it is
founder-reserved by the standing rule that permission requests may be drafted but not acted
on. It should be answered before the variable is set to `true`, not after five runs a day
have happened.

**Stated limit:** I have not verified the isolated repository's visibility, and I will not
probe it. If it is private with Pages access control the exposure differs, but the permission
question does not.

## What I did not verify, and do not claim

- **Behavioural refusal of the activation gate** — declined by my environment, as above.
- **Any end-to-end run.** Exercising it would require either custodian acquisition, which I
  have committed never to perform, or injecting the synthetic seams, which the CLI
  deliberately does not expose. The builder's own tests use those seams; I will look at them
  in the addendum.
- **The first real delivery after activation.** Untestable by anyone until activation, and the
  builder says so themselves. I make no claim about it.
- **iPhone, Safari, VoiceOver or airplane-mode behaviour.** Not tested, not claimed.
- **Whether the acquisition adapter contacts only the intended custodian endpoint.** That
  lives in the pre-existing `prepare-daily-hukamnama.mjs` chain reviewed at RT-024, not in
  this candidate's diff.

## Instrument errors in this retest

None detected. One avoided: I did not treat the classifier's refusal of my test command as a
property of the candidate. It is a property of my environment, and conflating the two would
have produced a false PASS on behavioural grounds I never established.

Running total: **34**.
