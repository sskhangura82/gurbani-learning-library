# Library script integrity — builder criteria, frozen before implementation

Date: 26 November 2026 (America/Los_Angeles).
Builder criteria are not the independent review seat's criteria or approval.

## Candidate baseline and scope

Start from reader reliability e0a6cff22771d42ce3a2fe91ad96863daae214ed.
Import the complete additive Knowledge delta from source main a3476ac4b9be90dde350fb35dd13ce0b672c120d to reviewed Knowledge tip b68e080043bb0b4e5cb3d17977e65c8cd62c15b3. It has 86 added paths and no modified or deleted paths; abort on a collision. Record every imported path and digest before changing any build or test infrastructure. This prepares a combined branch candidate; it does not merge or deploy the five-PR Knowledge chain.

Protect all production script occurrences in this combined candidate, including the Library, Articles and Knowledge dependency graphs. Preserve the existing reader loader/verifier contract. Explore from PR50 is a separate artifact outside this candidate; EXP-01 remains open. Rewritten HTML, service-worker authenticity, hosting-account compromise and physical-device behavior remain outside the subresource-integrity claim.

## Acceptance criteria

1. Frozen inputs: scripture, teaching packages, original Library/Article/Knowledge source modules and source contracts remain byte-identical to their reviewed inputs. Reader HTML, code and existing reader integrity helper remain unchanged. Any necessary exception must be explicit and narrow; no exception is currently planned.
2. Complete inventory: every production HTML page and ordered executable script occurrence is enumerated. Missing, extra, inline, duplicate, reordered, unapproved, external or async loaders are refused. Test-only HTML is explicitly excluded rather than silently ignored.
3. Closed graphs: each of Library, Articles and Knowledge has one same-directory generated ESM bundle. Exact source closure is enforced. Output contains no executable imports, dynamic imports, external dependencies or additional chunks. Original module URL requests can be blocked without breaking the application.
4. Reproducibility: pinned compiler and parser versions with lockfile; explicit generation only. Default checks rebuild without writing and compare bundle bytes, graph metadata and HTML pins. Stale source, stale bundles, wrong pins or changed dependency closure fail. No timestamp or machine path enters generated output.
5. Browser enforcement: altered entry/dependency code under unchanged HTML pins cannot execute a sentinel or render source content. Correctly repinned controlled fixtures provide a positive execution control. All tests use empty synthetic contexts.
6. Semantic tests remain substantive: existing editorial/content mutation tests rebuild a fixture bundle and repin fixture HTML so the semantic guard is reached. Transport blocking is never counted as a semantic rejection. Legitimate teaching edits must still succeed.
7. Functional behavior: Library navigation, Article source resolution/printing, Knowledge search and attribution work through actual bundles, including hosting under a non-root URL path. No unsupported physical Safari/iPhone/VoiceOver claim.
8. Offline delivery: generated bundles and complete Knowledge assets join the manifest after generation and pinning. Exact expected URLs and bytes are checked. A deliberately failed update leaves an independently established prior working shell and synthetic learning intact. Do not infer preservation merely from a rollback reference.
9. CI coverage: build/pin policy and dependency changes trigger the applicable checks. Replace known stale cache counts with inventory-and-byte assertions; do not remove coverage or weaken frozen scripture/teaching checks.
10. Review handoff: source baseline, complete imported unit, rollback, limitations and candidate commit are recorded. Independent acceptance criteria must be frozen before opening implementation; builder results are separate and explicitly deferred until the reviewer records findings. No merge or deployment is authorized by this work or its tests.

## Pre-existing findings kept separate

RB-02 split-fragment editorial residual; ANG-01 adjacent digital-source qualifier; EXP-01 separate Explorer cue verification; ART-P01 PDF copy fidelity; SIG-01 recall limitation; source collation, qualified review and physical phone checks. PREV-01 is withdrawn. This candidate must not claim these are repaired merely because scripts are pinned.
