# Public Knowledge access amendment

This implements the founder's current access decision: psychology remains
public; other religions' texts and comparative religious studies require the
separate restricted reader. It changes the current public Knowledge projection,
not historical Git objects or previous review evidence.

## Content and source custody

The current `knowledge/pilot.json` removes `study.buddhist-conceit` and its
`edge.24`. The humility deep lesson removes the religious comparison invitation
in English and replaces the general other-philosophies invitation in Punjabi
with the already retained psychology comparison. The humility lesson's
`revision` is now 2. Its route ID remains `lesson.humility.r1` so existing links
and course references remain valid; the explicit revision field identifies the
changed lesson.

The intellectual-humility study, its citation and reference, `edge.23`, its
similarity/difference wording, and all source bindings remain exact. Coverage
now explicitly reports one public psychology study and zero public comparative
religion studies. This does not expand the existing three-passage pilot or claim
new content approval.

`knowledge/scripture.json` and its independent source seal are byte-identical.
All vocabulary forms and explanations are unchanged apart from the additional
access metadata on their enclosing records. Haumai's lesson and saved-learning
binding remain at revision 1. The learning, journey and JSON modules are
byte-identical. The existing journey renderer already omits its optional
comparison when that edge is absent, so no storage migration is needed.

## Explicit public admission

The editorial pack uses `glp.knowledge.editorial.v3`. It declares public
psychology and private-only comparative religion under
`glp.knowledge.public-access.v1`. Every editorial node carries an explicit
public access label and a content class. Missing, unknown, expanded or private
labels refuse before the graph reaches search or rendering.

`knowledge/registry.mjs` holds a separate public study admission map. The
existing psychology study is the sole current admission. Its identity,
discipline and exact study metadata have an independently held fingerprint.
Changing the pack and renewing `PACK_SHA256` alone therefore cannot add another
study, restore the removed study, change its label to psychology, substitute its
content under the allowed psychology identity, or add a philosophical comparison
edge. A legitimate future public psychology study requires an explicit
admission-policy change as well as an updated pack. The existing scripture
attribution and source-binding guards still run.

This is a bounded record-access policy enforced by trusted application code.
It does not discover religious meaning in arbitrary prose, prove a source
supports a claim, protect against someone rewriting trusted code and its HTML,
or erase previously public history. Source-based ChatGPT/Claude editorial
judgement remains necessary. No new human-review gate or password credential is
introduced here. Restricted reading and encrypted content delivery belong to
the separately implemented private reader.

## Exact scope and reproducible scripts

The additional amendment record is
`evidence/public-knowledge-access/change-scope.json`. It fixes the before/after
SHA-256 of exactly four current files against
`a123b39e61c5fba94acc38ea77ab7c81e664f61d`:

- `knowledge/pilot.json`
- `knowledge/app.mjs`
- `knowledge/registry.mjs`
- `knowledge/index.html`

`tests/helpers/public-knowledge-scope.mjs` exports `publicKnowledgeScope()` and
`readBeforePublicKnowledge(name)`. The former validates the exact amendment;
the latter returns the frozen pre-amendment input for these four paths only
after that validation, and current bytes for other paths. Earlier PR57 and
Daily/Farid/Haumai/Explore preservation assertions still run against their
original inputs. The helper does not create a general exclusion from those
checks.

Knowledge's pack pin, exact module digests, generated bundle, script graph
manifest and HTML integrity pin were refreshed. All four application bundles
reproduce with 26 source inputs. The root/catalog navigation and added-page
inventory are owned by the integration branch; this amendment does not modify
them or `sw.js`. The final integrated offline manifest must be regenerated
after all amendments are combined.

## Verification

Observed local results are recorded in
`evidence/public-knowledge-access/verification.json` and the accompanying
contract reports. They include:

- 32 passing Node tests: 9 access-policy tests, 19 saved-learning tests and
  4 historical/input-scope checks.
- 14 Knowledge contracts and 11 combined Knowledge integration checks.
- 29 source-registry checks, including 15 independent-source mutations and
  8 stale/editorial source-binding mutations.
- 72 title-attribution refusals with 8 accepted ordinary editorial cases.
- 335 broad editorial refusals with 157 accepted cases across 31 field classes.
  The existing heading/source attacks still require their original attribution
  errors; ordinary mutations of the admitted study now require a deliberate
  public-admission update.
- 29 search checks, covering 17 verse-initial fixtures and 2 headings.
- 5 selected script-integrity and mutation tests for the existing 16-page,
  58-pin policy, and exact reproduction of all four application bundles.

Browser expectations now require no religious comparison in the public Haumai
journey and cover public psychology, absent religious search/deep links and a
resealed comparative-study refusal. These changed browser cases were not
executed in this worktree: the environment has a Chromium wrapper but no browser
binary. They remain CI/integration checks. Full added-page inventory and offline
shell verification also remain for the combined root branch. These builder
checks do not constitute independent Claude review or scholarly source approval.
