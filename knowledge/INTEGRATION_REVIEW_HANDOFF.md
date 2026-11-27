# Knowledge search and attribution integration — review handoff

## Purpose

Combine the search and navigation repairs with the editorial attribution boundary. The two separately reviewed candidates conflict in the same rendering and search paths. Neither parent's verdict establishes the behavior of this combination.

This is a new source candidate for independent review. It is not added to the unified library, the isolated phone preview, or the live application. No source pull request is merged by this work.

## Frozen inputs

- PR49 search and routing: `1a4537edeecea070d7418e4dbc85f6b18207bbdf`.
- PR57 attribution boundary and branch base: `f720099b6181919d597e249f9ad42b9f00cabe68`.
- Review records: `cf6c895f5dbe8248e0349c8ba89291c54055b688`, especially RT-014 and RT-015.
- New candidate branch: `feature/knowledge-integrated-search-20261126`.

Current remote heads were checked through the GitHub API and explicitly fetched; the clone's narrow main-only fetch configuration was not treated as evidence of branch freshness.

## Review ordering

The reviewer should freeze the acceptance criteria against the posted candidate commit before opening the implementation. Record independent findings before opening builder test output. This document describes scope and known limits, not the builder's test verdicts.

Builder evidence is under `evidence/knowledge-integration/`, alongside the inherited search and boundary evidence. The source-preservation checks and both parent test suites remain available. The combined checks are `tests/knowledge-integration.mjs` and `tests/knowledge-integration-browser.mjs`.

## Implementation boundary

- `knowledge/app.mjs` combines reusable addresses, selected-line navigation and browser history with the existing editorial labels and source containers.
- `knowledge/core.mjs` retains the identity crosswalk and re-exports the common content classifier and search function.
- `knowledge/kinds.mjs` holds the unchanged classifier so rendering and search use one definition.
- `knowledge/search.mjs` carries the bounded search algorithm and preserves source/editorial provenance through scoring and relationship expansion.
- `knowledge/index.html` explains the search modes and the limit to exact written word forms.
- `knowledge/style.css` adds result and selection styling while preserving the distinct editorial presentation.

The source package, teaching package, source lock and registry are byte-identical to PR57. No new exposition, word senses, topics, sources, audio, morphology, or scripture spellings are introduced.

## Behavior requiring combined review

1. Complete-token searches must refuse the named NASA/category false positives while retaining legitimate topic and original-word matches.
2. Both first-letter modes and exact source quotations must retain occurrence identities through opening, Back, Forward and reload.
3. Search and navigation must preserve editorial labels and must never place editorial copy or a selection notice inside the original-scripture container.
4. The existing attribution guard must still refuse re-pinned teaching mutations. An unrecognized heading-like editorial string that the lexical guard accepts must remain structurally labelled as editorial.
5. Source verification must succeed before the browser requests the teaching package. Display still goes through the existing registry and graph validation afterward.
6. Invalid or cross-passage line addresses must refuse explicitly, without an ordinal, text or fuzzy fallback.
7. The Kabir author entrance must state that only selected passages are indexed, not the author's complete Bani.

## Author lookup and exact word matching

Builder-authored author aliases are explicitly labelled **Editorial author lookup**. They remain editorial when connected passages are returned and carry no occurrence quotation of their own. Literal words found in the source carry exact occurrence IDs and a distinct source-text match reason.

This addresses the attribution-label part of SIG-01. It does not implement inflected-form recall: searching `ਨਾਨਕ` does not infer `ਨਾਨਕੁ` or `ਨਾਨਕਾ`. The exact written forms remain searchable. No theological or linguistic inference is manufactured to increase recall. Independent review decides the finding's resulting status.

## Continuing limits

- This remains a three-Salok pilot with existing unreviewed teaching drafts, not full-Granth search.
- RB-02's split-field semantic limitation remains recorded; no claim is made that a lexical guard can detect every editorial imitation.
- Qualified Gurbani, Punjabi and Santhiya review is outstanding.
- Desktop browser and emulated viewport checks do not establish physical iPhone, Safari, Home Screen or VoiceOver acceptance.
- No accounts, external AI calls, analytics, recording, new learning storage or deployment are added.
- The workflow has read-only repository permissions and no deployment step.

The independently reviewed unified library is staged separately. Knowledge remains unavailable there until this combined candidate completes its own review and the required staging decision is made.
