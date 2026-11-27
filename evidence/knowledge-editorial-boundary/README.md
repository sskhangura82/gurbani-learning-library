# Knowledge editorial boundary follow-up

Engineering candidate only. Not an independent verdict, qualified content approval, merge, staging instruction or release.

## Scope and provenance

- Worktree: `/tmp/glp001-iphoneqa-20261126/knowledge-boundary-followup`
- Branch: `fix/knowledge-editorial-boundary-20261126`
- Frozen base: `83acf3f9e4c69c346f2be16d02f407838a137cf9` (PR53)
- Inputs read first: Claude's RT-008 frozen criteria and findings at review head `a9f32963348e875a361c56b93dcbd2e0f1577f34`.
- Separate from Unified Library. No Unified Library files were changed for this task.
- The actual `scripture.json`, `pilot.json`, source lock and all source digests are unchanged.

## Repair

1. `registry.mjs` now checks prefixed structural heading forms, copied complete source lines and numbered-unit syntax in every authored text field consumed by the current page or search. It checks node titles, Punjabi labels, aliases, all lesson depths and languages, vocabulary explanations, study citation/discipline, passage-description titles/Punjabi/aliases and edge explanation fields.
2. Format controls and default-ignorable code points are removed only for comparison. Canonical bytes are never rewritten. The short `ਮ` heading abbreviation requires a token boundary so ordinary words ending with that letter are retained.
3. Dictionary forms remain exact, source-bound individual tokens. An attested vocabulary word can be used as an editorial entry title; a whole verse cannot become a dictionary form. Unexpected joined-passage fields in authored nodes are rejected rather than creating an alternate search path.
4. Passage aliases are joined as `editorialAliases`, separate from the source title and source aliases. Search results carry both result kind and match provenance; a passage found through an editorial association is identified as such.
5. The page visibly distinguishes original Gurbani, source indexes, library topics, dictionary entries, lesson drafts, learning pathways and comparative drafts. Editorial Punjabi and scripture have different classes/DOM semantics. Editorial explanations and comparisons are outside scripture containers. Markup remains literal text.

## Builder checks

All commands run from the repair worktree on the authorized Mac. Browser commands launched installed Chrome in fresh synthetic contexts.

| Command | Observed result |
|---|---|
| `node tests/knowledge-editorial-title.mjs` | Existing 72 rejected edits and 8 permitted edits passed. |
| `node tests/knowledge-contract.mjs` | Existing 14 contracts passed. |
| `node tests/knowledge-source-registry.mjs` | Existing 29 checks passed, including 15 source mutations and 8 stale editorial mutations. |
| `node tests/knowledge-editorial-boundary.mjs` | 305 rejected mutations, 187 permitted controls, 31 text-field classes. Each editorial mutation is genuinely re-digested; the independent source stays unchanged. |
| `node tests/knowledge-editorial-boundary-browser.mjs` | The initial 14 browser checks covered: untouched controls at three widths, accepted edits, nine blocked re-digested fixtures, source-bound dictionary allowance, visible result/match provenance, literal markup and unchanged source lines. |
| `CHROMIUM_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/knowledge-browser.mjs` | Existing 17 browser checks passed. |
| `git diff --check` | Clean. |

The earlier focused browser run had 12 checks. The 14-check run additionally covered a whole verse posed as a dictionary form (blocked) and a valid source-bound dictionary word (allowed). No failed test was hidden or replaced by an extractor/version change. The mobile-width screenshot was visually inspected; it is Chrome viewport emulation.

Evidence: `contracts.json`, `browser.json`, `provenance-390.png`, `provenance-820.png`, `provenance-1440.png`, and `literal-editorial-label-390.png` in this directory. Existing browser and source-registry scripts also wrote their usual evidence.

## Limits

- This is a syntactic boundary and a visible provenance boundary, not a theological classifier or a determination that draft teaching is correct.
- Existing NASA/category substring-search behavior was not changed; this repair does not close the separate search findings.
- No physical phone, Safari, VoiceOver, human-participant or qualified Gurbani review is claimed.
- No source or teaching content was revised.
- Implementation-agent work stopped before commit or publication. The final candidate head and handoff are recorded on its draft pull request; this record does not approve a release.

## Structural-control and portability follow-up

The root added the accepted imitation `ਵਿਸ਼ਾ ਮ\u0300ਃ ੧ ॥` as a browser fixture after the separate builder audit. It carries a combining grave accent that the lexical guard does not classify. The required behavior is that it remains visibly and programmatically editorial in the page and search, and never enters the original-scripture region. This is not represented as a rejected attack or theological classification. The browser launcher now uses installed Chrome on macOS and Playwright Chromium on Linux, and records the actual environment. The previous 14-check result is retained as `browser-before-structural-control.json`; the final `browser.json` records the updated run.

The updated local browser run completed successfully with 15 checks. It remains builder desktop evidence. The root also inspected the 390-pixel provenance screenshot. The retained source rollback is `rollback/knowledge-boundary-base-20261126`, pointing to the frozen PR53 base.
