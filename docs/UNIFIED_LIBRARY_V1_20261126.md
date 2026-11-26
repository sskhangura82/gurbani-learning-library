# Unified Library v1 — implementation and review handoff

26 November 2026 · GLP-001 · Builder working document

## Status and review boundary

This document describes the separate development candidate on
`feature/unified-library-v1-20261126`, based on frozen PR55 source revision
`acfeb0a157fc2cf38ae7ccbaeb2c53d8e97d3bec`.

It is an implementation handoff, not independent acceptance or release approval.
Builder verification is recorded below; independent acceptance remains pending.
The submitted head is recorded in the pull-request handoff. No merge or deployment of this work is claimed. The retained source rollback is `rollback/unified-library-base-20261126`, pointing to the frozen parent above.

PR55 includes the reviewed PR54 reliability/practice work and the existing reader
stack. It does **not** include PR47's separate Sukhmani linked-visit repair or the
knowledge-library stack. This work does not silently integrate either.

The existing live preview is a separate staged artifact. Its earlier verification
does not establish that this new library candidate has been staged, independently
verified, approved, or tested on a physical phone.

## Problem and resulting behavior

The existing application has working reading destinations and source sheets, but
its home is a growing list of features. Saved learning belongs to several
different readers, and reaching the appropriate panel requires knowing that
reader's controls.

Unified Library v1 provides four consistent entrances:

| Entrance | Implemented behavior |
|---|---|
| Today | Existing reading shortcuts, routes to source sheets and Saved, separate Simran and physiology-tool cards, and an honest unavailable state for Daily Hukamnama. |
| Read | Ten reading destinations, a seven-member Nitnem filter, a three-member additional-reading filter, and search over declared names and spellings. |
| Explore | The existing source-sheet index, two literal-word-match sheets and the Gurdwara directory; clearly unavailable metadata for work not integrated into this candidate. |
| Saved | Ten links into the owning readers' native saved-learning panels. This is a chooser, not an aggregate notebook. |

The entrances are shareable URLs:

- `index.html?view=today`
- `index.html?view=read`
- `index.html?view=explore`
- `index.html?view=saved`

Exactly one valid `view` value is accepted. Missing, unknown, malformed or
duplicated selections default to Today. Search and filter state remain in the
Read URL. Browser navigation is expected to return to the corresponding entrance.

The directory has a visible failure state and direct reader links. A navigation
failure must not change scripture or reset saved data.

## One directory, existing source ownership

New application files:

- `library/catalog.mjs`: immutable navigation records and source bindings.
- `library/core.mjs`: view parsing, exact-token name search and lookups.
- `library/app.mjs`: directory/card rendering and URL state.
- `library/library.css`: styles for the four-entrance home.

`index.html` uses that directory. Existing readers retain responsibility for
source verification, verse rendering, source/teaching separation, reading
position, bookmarks, reflections, editing locks, recovery and backups.

The catalog contains names, declared aliases, fixed relative routes, scope
summaries, review labels, source-family metadata and exact file bindings.
Existing display titles are navigation labels, not new verse records. No new
scripture database or explanation text is placed into the registry.

Each reader binding records its exact existing source file and SHA-256;
composition and edition identifiers are included where the source format supplies
them. Catalog checks compare those bindings with files and existing manifests.
The pins identify a selected local edition. They do not establish theological
authority or qualified approval.

### Ten destinations, seven-member Nitnem group

| ID | Reader route | Scope |
|---|---|---|
| `japji` | `full-japji.html` | Japji Sahib, including opening and closing material |
| `jaap` | `nitnem/index.html?bani=jaap` | Selected 199-chhand Jaap Sahib reading |
| `savaiye` | `nitnem/index.html?bani=savaiye` | Selected ten Savaiye |
| `chaupai` | `nitnem/index.html?bani=chaupai` | Selected expanded 29-group Chaupai reading |
| `anand` | `nitnem/index.html?bani=anand` | Forty Pauris of Anand Sahib |
| `rehras` | `nitnem/index.html?bani=rehras` | Selected six-section composite Rehras reading |
| `sohila` | `nitnem/index.html?bani=sohila` | Five-Shabad Sohila reading |
| `sukhmani` | `sukhmani.html` | Twenty-four Ashtpadis of Sukhmani Sahib |
| `salok-mahalla9` | `salok-mahalla9/index.html?bani=salok-mahalla9` | Fifty-seven-Salok collection |
| `salok-kabir` | `salok-kabir/index.html?bani=salok-kabir` | 243-Salok collection; individual attribution review remains pending |

Nitnem groups the first seven existing IDs. Japji is not duplicated, and Nitnem
does not become an eleventh composition.

Jaap, Savaiye and Chaupai retain their source packages' Dasam Bani classification.
Rehras is composite; its selected Chaupai boundaries differ from the separate
expanded Chaupai reading. Some passages occur in more than one reading.
Destination, unit and line counts must not be added up and advertised as unique
Sri Guru Granth Sahib Ji coverage.

No new Ang claims or individual Kabir authorship assertions are introduced.

## Search is directory search

The field is labelled **Find a Bani or collection**. It searches only declared
titles, Gurmukhi display titles and explicit aliases. It does not search
descriptions, serialized records, property names, source bindings or private notes.

Normalization applies only to navigation labels and the query. It never changes
source text, source identifiers or saved records. Query tokens must match whole
allowed tokens. There is no substring, fuzzy, first-line or first-letter fallback.

Expected examples:

- `japji`, `JAPJI SAHIB` and `ਜਪੁਜੀ` find the existing Japji destination.
- `Salok` finds the two Salok collections.
- `salok mehla 9` and the existing Gurmukhi title find the Mahalla 9 collection.
- `NASA`, `category`, `ha` and `jap` do not create unrelated partial matches.
- An empty query shows the selected group.
- A punctuation-only query shows no matches.

This is not full-corpus search, an encyclopedia, semantic question answering, or
evidence that a topic connection has received qualified review.

## Saved opens the owning reader

A Saved link adds exactly `learning=saved` to the existing reader URL. It does
not supply a new passage or line identifier.

Native changes recognize that entry intent after normal source verification and
reader setup:

- Japji opens its existing Saved learning dialog and preserves the stored
  occurrence used on return from that dialog.
- Sukhmani opens its existing Saved learning list unless its saved record has a
  load error.
- The shared Nitnem/Salok reader opens Reading tools with Saved lines and
  reflections expanded. Its composition must be uniquely specified and valid.
  Source failure or blocked saving prevents automatic panel entry.
- Nonexact or duplicated `learning` values do not open the panel.
- The shared reader's Saved entry does not let an unrelated `unit` parameter
  replace the stored reading occurrence.
- Recovery states stay visible. An unreadable record must not appear to be an
  empty notebook.

Existing dialogs, saved lists, editing safeguards and storage managers are
reused. The directory does not move, combine, copy, export or migrate notes.

The new `library/` modules do not call storage APIs or inspect note contents.
The reused `js/home.js` retains its existing theme and continuation hints, which
read the existing Japji record for those fields. This is not a claim that the
entire home performs zero record reads. No aggregate list of private notes is
rendered. Builder verification uses synthetic records in fresh browser contexts;
no actual user reflections are inspected.

The Japji import label now accurately says it accepts Japji learning, including
earlier Japji notebooks. It no longer suggests that it accepts every reader's
format.

### Existing backup boundaries remain

- Japji exports its current/legacy Japji learning and retained material.
- Sukhmani exports its own Sukhmani learning format.
- Nitnem and Salok readers export through their per-composition, per-edition
  learning manager.

There is no new **back up everything** function. Saved explains that learning
must currently be exported from each owning reader. Existing keys, formats,
edition identities, size protections, locking and recovery paths remain.

## Content boundaries and unavailable modules

Explore links to the existing Haumai and Dubidha source sheets. Each resolves a
complete existing Salok. Both remain literal-token selections; their thematic
appropriateness is not certified. Explanation spaces and claims remain empty.
The directory does not create a definition, paraphrase or interpretation to fill
them.

The PDF-copy finding remains open. This change does not upgrade an extractor,
normalize extracted scripture to hide a difference, or establish PDFKit/PDFium
copy fidelity.

Daily Hukamnama, complete sequential Sri Guru Granth Sahib Ji reading, the
separate Knowledge Explorer, dictionary, historical library and rights-cleared
audio library are **unavailable metadata**, with no invented functioning links.
Today does not substitute an old reading or random Shabad for an official daily
selection.

Simran and optional breathing retain distinct data kinds and UI labels. No
practice sequence, audio, theological comparison, physiological claim, score,
streak, session history, account, analytics or cross-device feature is added.

## Acceptance behavior for independent review

These are promises to examine, not an independent verdict.

1. Each entrance URL opens its matching view, heading and current navigation.
   Keyboard and browser Back behavior remain usable.
2. Read exposes ten declared destinations. Nitnem filters to seven existing IDs
   and additional reading to three, without duplicate Japji.
3. Name search follows the whole-token rules, shows honest empty results and
   never claims to search the complete Granth.
4. Normal reader links preserve each reader's saved-position behavior. Saved
   links open the native saved list for the correct composition.
5. A note without a bookmark remains discoverable. Saved navigation does not
   alter its text, bookmarks, reading place or another composition's record.
6. Damaged records retain recovery behavior. Saved entry cannot bypass failed
   source verification.
7. Original source and teaching files stay byte-identical to the pinned parent.
   Source contracts, rights limitations and review labels remain intact.
8. Source sheets, places and personal tools stay distinguishable. Unavailable
   modules are not working links.
9. Actual candidate behavior is examined at narrow widths, enlarged text,
   keyboard focus, light/dark appearances and offline. Enlarging the root font
   alone does not prove that pixel-sized text has enlarged.
10. The home introduces no new learning store, note aggregation, tracking,
    automatic update, storage deletion or universal-backup claim.

The independent reviewer freezes criteria and records findings before examining
detailed builder tests. Prior exposure to builder summaries must be disclosed.
Builder checks and independent findings remain separate.

## Repeatable builder checks

Run from the source checkout with the existing test dependencies available.
Browser checks use Playwright. The Mac commands select installed Chrome.

Catalog and native Saved entry:

~~~sh
node --test tests/library-catalog.mjs
CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node tests/library-saved-entry-browser.mjs
~~~

After runtime edits, regenerate the shell and check the entrances with the actual
installed service worker:

~~~sh
node tools/build-offline.mjs
node tests/service-worker.mjs
CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node tests/library-browser.mjs --offline
~~~

Relevant existing reader/learning contracts:

~~~sh
node tests/verify.mjs
node --test tests/source-integrity.mjs
node tests/shared-learning.mjs
node tests/japji-retained-learning.mjs
node tests/sukhmani-reader-core.mjs
node tests/nitnem-learning.mjs
node tests/nitnem-ui-lifecycle.mjs
node tests/r6-contract.mjs
node tests/r7-contract.mjs
~~~

Confirm source and teaching preservation:

~~~sh
git diff --exit-code acfeb0a157fc2cf38ae7ccbaeb2c53d8e97d3bec -- \
  js/japji-full-data.js js/sukhmani-data.js js/source-integrity.js \
  js/content.js js/japji-lessons.js js/line-meanings.js js/sukhmani-teaching.js \
  nitnem/data nitnem/learning \
  salok-mahalla9/data salok-mahalla9/learning \
  salok-kabir/data salok-kabir/learning articles research
~~~

These checks do not establish physical-device or qualified content acceptance.

## Builder results and preserved failures

**This section is builder evidence, separate from the acceptance promises.
Evidence paths identify particular runs; they are not independent approval.**

At this documentation snapshot:

- The catalog suite passed its checks of source file/identity bindings, routes,
  collection membership, whole-token search, boundaries and immutable records.
- `evidence/library-saved-entry/browser.json` records desktop Chrome checks with
  synthetic data for Saved entry, note-only discovery, record/position
  preservation, empty/damaged records, source refusal, query validation and Back.
  The earlier before-label-change record remains separate.
- The initial browser run is preserved at
  `evidence/library/browser/2026-11-26T22-49-27-124Z/report.json`.
  It failed while waiting for a nonexistent QA hook. This is a test-instrument
  failure, not evidence that the target behavior passed. Offline verification
  was not run in that record.
- The subsequent run at
  `evidence/library/browser/2026-11-26T22-51-40-570Z/report.json` reports success
  on the checks it ran, including browser-emulated offline behavior. Its
  enlarged-root-text check was insufficient to establish that all text sizes
  responded to enlargement. It is not used as proof of that stronger criterion.
- Library font sizes were changed from pixel values to relative values, and the
  browser test was strengthened to measure rendered text before and after
  enlargement. The run at
  `evidence/library/browser/2026-11-26T22-59-35-435Z/report.json` retains a
  further instrument failure: it required an entire enlarged card to fit above
  the bottom navigation at once. That is not the intended action-reach
  criterion. The corrected test checks the actual visible action cue and whether
  navigation obscures it; the earlier failure remains available.
- The final strengthened browser run is
  `evidence/library/browser/2026-11-26T23-03-07-481Z/report.json`.
  It reports success for the four direct entrances, keyboard/Back navigation,
  name search, reader/Saved routes, content boundaries, synthetic-data
  preservation, and actual hashed service-worker operation with browser
  networking disabled. It records no external requests or uncaught runtime
  errors during those examined flows.
- That final run measures 32 font comparisons across all four views at widths
  320 and 390: each sampled font doubles. Its 16 normal/enlarged action-reach
  checks show the final action cue clear of the fixed navigation. Normal
  layouts were also checked at widths 820 and 1440. These are desktop Chrome
  simulations, not physical iPhone accessibility acceptance or an assertion
  about every possible browser font setting.
- The builder visually inspected the four normal entrances and the updated
  enlarged Read at 320, enlarged Today at 390, and dark Read at 390. The latter
  screenshots are retained under
  `evidence/library/browser/2026-11-26T23-01-37-773Z/`; they use the same CSS
  as the final browser run. Screenshot review is still builder evidence.
- `evidence/library/integration/service-worker-initial.log` retains the old
  expectation of 81 assets failing against 85 after four library assets were
  added. The subsequent manifest check follows the expanded asset set and
  fingerprints; the initial failure is preserved.
- `evidence/library/integration/r7-contract-initial.log` retains a literal-home
  link assertion failing when destinations moved into the registry. The
  revised check follows registered routes; its passing result is separate.
- `evidence/library/integration/r6-contract-initial.log` retains the stale
  assertion requiring Nitnem, Simran Room and Gurdwaras literal text in home
  HTML. The adjusted contract now follows the library's implemented registry
  and views; `r6-contract.log` holds the passing later run.
- `evidence/library/integration/regressions-initial.json` preserves the initial
  command outcomes. The final `regressions.json` records a successful combined
  source/catalog/article/Kabir-binding test command and nine successful
  regression commands. The named logs retain the command output.

Earlier failed or incomplete instruments have not been rewritten as successful
runs. A successful desktop check does not establish independent review, qualified
content approval, or physical-device behavior.

## Review queue and work outside this milestone

The builder's latest review-branch snapshot is
`a9f32963348e875a361c56b93dcbd2e0f1577f34`. Its state is distinct from acceptance
of this new candidate:

- Claude's RT009 completed PR52's remaining mutation-boundary and 320/390-width
  label checks. Those are desktop-width observations, not physical-phone tests.
- RT008 found further RB-01 bypasses involving prefixed headings, node fields
  and search aliases. RB-01 remains open. The knowledge pilot and its separate
  repair work are excluded from this library candidate.
- Claude's remaining PR55 runtime/workflow/PDF-copy work is in progress; this
  document supplies no independent verdict for it.

Independent review of Unified Library v1, qualified Sikh scholarly/Punjabi review,
physical iPhone/Home Screen/VoiceOver acceptance, printed-source collation and
PDF-copy interoperability retain their existing gates. Desktop browser-offline
checks are not physical airplane-mode tests.

This milestone connects existing work. It does not authenticate the full Granth,
certify draft explanations, clear recording rights, merge the knowledge pilot,
approve the separate Sukhmani linked-visit branch, or authorize public release.
