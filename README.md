# Gurbani Learning Library — GLP-001

**An account-free family reading and learning project.** Its main focus is continuous Japji Sahib with three teaching depths: original Gurmukhi, concise English and Punjabi explanation, and deeper researched Study drafts.

[Open the existing family site](https://sskhangura82.github.io/gurbani-learning-library/) · [Read Japji Sahib directly](https://sskhangura82.github.io/gurbani-learning-library/full-japji.html)

## Sukhmani Sahib: first-twelve development preview

This branch adds `sukhmani.html` to the existing library: Ashtpadis 1–12 of 24, all twelve Saloks, 96 pauris and the Rahau, across Ang 262–279. Its 1,019 original source occurrences (including headings) are compared with a second digital source. English/Punjabi line explanations, passage studies and approximate transliteration remain clearly labeled drafts. Read, Meaning and Study share the same continuous Gurmukhi, with separate browser-local Sukhmani bookmarks, reflections and backups.

See [scope, sources and review status](docs/SUKHMANI_FIRST_TWELVE.md). This preview does not claim a complete Sukhmani Sahib, qualified human review or publication to the family site. Existing Japji source and learning are preserved.

## What is included in Revision 7

- A simple, calming **home page** (Nitnem/Japji, Visit a Gurdwara, Simran Room).
- Japji Sahib 38 Pauris plus Mool Mantar and Saloks, continuous Unicode Gurmukhi across all 385 source occurrences.
- 385 English/Punjabi educational drafts and 42 Study drafts, **none qualified human-approved**.
- Optional *silent* guided reading light. Numeric pace 50–160 illustrative tokens/min, adjustable in five-token steps. This does **not** play or synchronize to external audio.
- Day and Amrit Vela reading environments, bookmarks, reflections stored locally, export/import and an installable offline shell.
- Three Gurdwara arrival pages with verified institution summaries, IANA local time and official outgoing broadcast links. No unlicensed photos or misleading 'live now' statuses.
- Distinct Simran Room **silent preview** without AI voices, breath-control prescriptions, streaks or metrics. Religious instructional material remains pending qualified review.

## Source of truth and editorial boundaries

The scripture, lessons, connections, musical metadata and saved learning are *separate structures*. Never change Gurmukhi to conform to a translation or UI. All source text is mechanically checked against its stored hashes and the retained Open Granth/Shabad OS corpus. Qualified letter-by-letter collation, including the Pauri 13 line 1 independent comparison, is still needed. The Study drafts should not be confused with formal Sikh scholarly endorsement.

Private reflections are **not uploaded** or committed to GitHub. The public Pages URL is available to anyone who knows it; noindex is not authentication.

## How to test locally

From the repository root, serve static files on localhost (for example, `python3 -m http.server 8080 --bind 127.0.0.1`) and open `http://127.0.0.1:8080/`. Production uses GitHub Pages.

Portable Node regression tests:

```sh
node tests/verify.mjs
node tests/service-worker.mjs
node tests/shared-learning.mjs
node tests/r6-contract.mjs
node tests/r7-contract.mjs
node tests/sukhmani-content.mjs
node tests/sukhmani-reader-core.mjs
```

Mac Chrome browser and lifecycle harnesses are in `tests/r7-*.mjs` and require an explicit, disposable local fixture. They do not read personal learning from the real family site.

## Project direction

Finish Japji reader and editorial validation first; then expand Nitnem, Sukhmani Sahib and, through verified text, contextual connections and raag research, more of Sri Guru Granth Sahib Ji. See [Teaching architecture](docs/TEACHING_EXPANSION_ARCHITECTURE.md), [R7 scope/source register](docs/R7_HOME_SPEED_AND_SPACES.md) and [release candidate evidence](docs/R7_RELEASE_CANDIDATE.md).

**The unmerged concept PR #4 remains a separate design/research lane.** No unauthorized photograph, media extraction, synthetic recitation, credentials, advertising or personal learning data belongs in this repository.
