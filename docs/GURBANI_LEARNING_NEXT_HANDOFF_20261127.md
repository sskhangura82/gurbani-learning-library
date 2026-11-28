# Gurbani opening study and open psychology

Prepared 2026-11-27, America/Los_Angeles.

## Purpose and review boundary

This continuation adds usable learning material to the full SGGS reader and public psychology area. It follows the user's direction to finish Gurbani and psychology before developing private comparative summaries of the Bible, Quran, Buddhist traditions and Vedas.

The branch starts at `68f47ffba4782271651716c71a97bc1825f96f48`, the stable head of PR #75 when the user reported Claude was reviewing it. Work is isolated on `feature/gurbani-learning-next-20261127`. PR #75, its branch and production `main` are not modified by this continuation. The acceptance criteria were committed first in `946a77e`.

All newly authored explanation and psychology text is an AI-assisted draft with actual Claude review pending. ChatGPT source inspection, structural tests and peer-agent checks are builder work. They are not an independent Claude review or proof of a doctrinal conclusion. A separate human-review gate has not been introduced.

## What the reader gains

At `collections/sggs/index.html?page=1`, the two opening groups have an optional study disclosure below their complete original text. Each offers English/Punjabi and Simple/Detailed/Deep study controls, paragraph-level source-row references, named witness links, personal reflection questions and a separate optional psychology entrance.

| Group | Scope | Source identity |
| --- | --- | --- |
| DMP | Opening invocation, Jap heading, opening Salok and Pauri 1; ten rows | `lesson.sggs.dmp.r1`, revision 1 |
| LLL | Pauri 2; six rows | `lesson.sggs.lll.r1`, revision 1 |

Both belong to `shabados-5.0.0-next.0-SGGS-SSA2`. DMP is not described as only Pauri 1. Its four teaching subdivisions do not settle customary uses of the term Mool Mantar. The adjacent Pauri 3 group and all other unadmitted groups receive no inherited lesson.

The original text, its punctuation and ordering, source routing and saved-place format remain intact. Source-row buttons focus the exact original node, without replacing its text or changing the route. Level and language selections live only in the current disclosure. This increment adds prompts, not another reflection-storage format.

The older Japji reader and Knowledge pilot retain their original editions, lesson revisions, source proofs and saved-learning behavior. There is no matching by Ang, title or normalized spelling and no migration of old reflections.

## The source-to-lesson contract

`verifiedSourceIdentity()` in `collections/source-reader/core.mjs` exposes the actual manifest digest and unit digest already checked by the source verifier. Copied JSON objects cannot obtain this receipt. The receipt expresses byte identity only.

`lesson-core.mjs` has a small independent admission table: exact manifest, edition, the two unit digests, lesson identities/revision and ordered complete line IDs. It checks a closed bilingual schema, subsection boundaries, paragraph ownership and coverage at every depth, named source references, one public psychology destination and the literal draft/pending review state. Refreshing an editable lesson's own metadata cannot admit a different source.

The editorial data and renderer are compiled into the existing closed source-reader bundle. Its input hashes and HTML SRI cover their bytes. There is no extra runtime lesson fetch, cross-directory executable import or dynamic script. A failed optional lesson check produces a local unavailable message while keeping independently verified original text readable. Source failure withholds the entire reading and its attached study.

`learning.mjs` renders text with DOM text nodes. All study controls and prose are outside original source nodes. It performs no fetching, history changes or personal-data writes. Dasam continues to use the shared source-reader bundle without receiving Gurbani-opening lessons.

## Public psychology

The psychology entrance links three script-free studies:

- `psychology/intellectual-humility.html`
- `psychology/attention.html`
- `psychology/emotion-regulation.html`

Each has an original research summary, evidence limits, three optional reflection questions, a practical study example and primary research citations with page/section locators. These studies currently use English prose and a Punjabi topic heading. Their methods and findings are not treated as explanations of Gurbani.

The existing Knowledge reference, humility lesson and breathing guide remain reachable. The strict existing Knowledge study admission is unchanged. Private comparative religion is not expanded or imported into these public pages.

The three pages and their stylesheet are added to the public offline shell. This does not add the full original-text corpus or any private-library assets to that shell. Full-reader original data remains fetched on demand.

## Source records and verification

- `docs/SGGS_OPENING_EDITORIAL_SOURCES_20261127.md` records the new Gurbani explanation sources and editorial choices.
- `docs/PSYCHOLOGY_STUDY_SOURCES_20261127.md` records the four inspected author-hosted research papers and exact locators.
- `evidence/gurbani-learning/change-scope.json` records exact application changes from the stable parent, with builder/unreviewed status.
- `tests/gurbani-learning-contracts.mjs` checks actual bindings and adversarial mutations.
- `tests/gurbani-learning-inputs.mjs` checks every pre-existing application file against the parent, allowing only the declared changes and additions.
- `tests/gurbani-learning-browser.mjs` checks actual UI behavior in isolated browser contexts with synthetic saved data.

Final verification results are recorded separately alongside their exact application digests. Tests establish the stated engineering behavior; the bilingual meaning, named interpretation differences and research summaries still need Claude's source-by-source review of this new revision.

## Next editorial work

After review of this increment, continue the same exact-source learning pattern through subsequent Japji units. The older Haumai lesson's remedy-clause omission remains a separate substantive revision: do not relabel that draft as complete or attach its existing reflections to a new edition. Daily Hukamnama explanation/publication remains governed by its own source, event and review bindings.
