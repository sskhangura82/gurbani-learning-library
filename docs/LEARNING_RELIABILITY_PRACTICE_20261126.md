# Learning reliability and separate practice tools

26 November 2026. Builder candidate, not independent approval or release.

## Scope and base

Branch: feature/learning-reliability-practice-20261126.
Base and rollback reference: frozen PR52 commit
792afa209c98bb53f257a8dfd5500bef10bfc8e3.

The frozen source branch and its worktree remain available. This candidate adds
a separate working copy; it does not move PR40, PR47, PR48, PR49, PR51, PR52 or
PR53. The live family application and isolated phone test copy are not updated.
Other review branches retain their own acceptance scope.

## User-visible behavior

1. Japji restores its occurrence and offset after returning from the library
   with Back. A transient return to the top cannot overwrite the saved place
   while the document is suspended. The visual guide returns paused.
2. A browser storage refusal now explains that existing saved learning is
   preserved, asks the learner to keep the backup and export any unsaved
   reflection, and offers a practical next step. No records are deleted to make
   room and no partial import is silently accepted.
3. The existing Simran Room hides its chosen duration during sitting and pause,
   including from the accessibility tree. Completion is a silent message. Its
   existing Gurbani anchor retains exact text and the verified Pauri attribution.
4. A separate breathing tool has a physiological data contract and dedicated
   renderer. It has only in/out phases, starts by choice, always offers Stop,
   respects reduced motion and stops when hidden. It saves no practice activity.
   The home link is in an optional personal-tools section, outside the scripture
   and Simran destinations.
5. Both practice pages and their local assets are in the verified offline shell.
   The existing reading destinations and their source checks remain available.

The breathing evidence note links primary research and its limitations.
It is not treatment, an individualized resonance measurement, clinical validation
or a spiritual instruction. No generative interpretation, sacred audio or new
Gurbani explanation was added.

## Findings and review boundary

| Finding | Candidate work | Independent status |
| --- | --- | --- |
| SF-01 | Cached-document history restoration and transient-scroll guard | OPEN pending Claude retest |
| SF-02 | Live countdown removed, selected length hidden during sitting | OPEN pending review |
| SF-03 | Unverified Ang assertion removed from UI; digital witness documented for review | OPEN; no qualified or printed-page approval |
| RT4-05 | Clear quota and other write-failure messages; native failure preserves records | OPEN for retest; RT-005 accepted the atomic-write approach and withdrew the fixed-cap proposal |
| RT4-04 | Opposing Shabad OS heading witness recorded in a separate addendum | Recorded; heading adjudication still open |

RB-01 remains on its own frozen candidate PR53. No knowledge pilot is exposed by
this branch. The article engine and Haumai journey remain subsequent work;
explanation slots must not be filled with newly generated interpretation.

## Evidence boundaries

Actual desktop Safari 26.6 reproduced the original Back defect and passed the
candidate occurrence/offset checks, with a real cached-document pageshow event.
Desktop Chromium passed the same reader scenarios. This is not iPhone testing.

Native Chromium storage accepted and exactly re-exported an 11,682,786-byte
Punjabi backup, refused the maximum valid 17,514,786-byte backup, and refused a
small valid backup in a full origin. Nonempty failure fixtures use disjoint note
IDs to reach quota rather than the conflicting-note limit. Every existing key
and value is compared before and after refusal. A second file-picker import
succeeds when test-only filler is removed.

That evidence is why a fixed UTF-8 file cap is not silently treated as the
available localStorage budget. The message repair is complete as builder work;
Claude accepted that approach in RT-005, while independent verification of the
new implementation remains open. See STORAGE_QUOTA_REPAIR_20261126.md.

Simran and breathing narrow-view checks use desktop Chromium. Their hidden-page
events are simulated and documented. Real service-worker checks disable the
desktop browser network; they are not physical airplane-mode acceptance.

All testing uses synthetic learning on new local origins. No actual reflections,
personal browser profiles or notes were read.

## Later reviewer response incorporated

Claude's RT-005 response at 1a4c525a3e0ec92e4fb9c022a5493f685340ba64
accepts the storage approach and corrects the source-lineage framing. The builder
re-read the pinned upstream README and Ang metadata: Open Granth derives from
Shabad OS. Agreement between these views establishes faithful upstream copying,
not two independent textual lineages. The Simran locator is confirmed within
that lineage; SF-03 remains open for a separate witness.

The initial hosted focused-browser job passed history restoration and native
quota checks, then stopped because the default shallow checkout omitted the
frozen Simran baseline commit. The workflow now fetches that history explicitly.
No application runtime changed for this test-environment correction. The failed
run is retained in GitHub rather than presented as a passing run.

## Reproduction

The workflow is .github/workflows/learning-practice-qa.yml. Its three jobs cover
preservation contracts, focused browser behaviors and the shared Nitnem/Salok
readers. It contains no deployment or publishing job.

Focused entry points:

~~~sh
ENGINE=safari node tests/japji-history-browser.mjs
ENGINE=chromium node tests/japji-history-browser.mjs
node tests/nitnem-storage-quota.mjs
node tests/nitnem-storage-quota-browser.mjs
node tests/simran-session-browser.mjs
node tests/breathing-browser.mjs
node tests/learning-practice-offline.mjs
~~~

Set CHROMIUM_PATH to a local Chrome executable when not using Playwright's
installed browser. Safari runs only on a configured Mac in an owned automation
session. The tests create and close their own sessions and local servers.

The existing source, storage, source-integrity and full shared-reader checks
were also run. Machine results are under evidence/learning-practice/ and the
feature-specific evidence directories. Baseline failure evidence is kept
separately from candidate results. Original source/teaching packages, frozen
selection metadata and prior runtime ledgers are unchanged; the Japji controller
change has a new linked runtime amendment record.

## Independent handoff

Freeze acceptance criteria before retesting this candidate. Record the
independent findings before reading builder tests or result files. Builder and
reviewer disagreement remains visible; neither seat approves its own work.
Passing local or hosted checks does not authorize merge or deployment.

Physical iPhone, Home Screen, VoiceOver and airplane-mode acceptance, qualified
Gurbani/Punjabi/Santhiya review, printed-page collation and audio/article rights
remain separate gates. No new founder action is needed to prepare this draft.
