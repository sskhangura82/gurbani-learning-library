# Source reading sheets and article framework - 26 November 2026

Status: BUILD CANDIDATE. No release, deployment, merge, qualified approval or
independent article-engine verdict is claimed. The source-sheet behavior has
builder verification; PDF text-copy compatibility remains OPEN.

## Scope and parent

New branch: feature/article-source-print-20261126.
Frozen parent and rollback reference:
8917beaab7acc5770cb5a8fee682c9702a0689cb (PR54).

This extends that candidate without moving PR54 or any other frozen review
head. It does not integrate the separate knowledge-pilot stack, PR53, or the
Sukhmani linked-visit branch. RB-01 in the knowledge pilot still needs its own
independent review; this work does not close it.

Claude's RT-006 findings at review head
b122fb0d4ecfd6d9d1c278d4b70d4ebc06da1c1f independently verify the prior Japji,
storage-message and Simran presentation repairs and the separate breathing
tool on their stated environments. The underlying Ang witness question and
physical-device acceptance remain separate and open.

## What this adds

- A home entry leading to articles/index.html.
- Two source reading sheets, selected by a literal word match: Haumai and
  Dubidha. They are examples awaiting qualified topic review, not lessons.
- Exact complete Saloks from existing canonical packages:
  Salok Mahalla 9, Salok 19; and the Kabir Salok collection, Salok 25.
- Direct links to those full Saloks in the existing readers.
- Complete-word topic/alias/Gurmukhi-token search. Unrelated partial matches
  and punctuation-only queries have no results.
- A single-column screen and print format with a source register, explicit
  editorial labels and visibly empty explanation spaces.
- Root service-worker coverage for all eight new routes/assets. The complete
  offline shell has 81 entries.

The corrected Claude format proof v2 informs the layout. Its four demonstration
verses are not imported as another source package. Its whole-corpus counts are
not copied or claimed as this engine's coverage.

## Source and content boundaries

Runtime catalog data contains reference names, not duplicated verses.
Original text is obtained only from the two existing source JSON files.

articles/source-contracts.mjs pins both complete source files independently of
the editable catalog. It also defines persistent article-reference names,
explicit composition and edition IDs, complete Salok IDs, ordered occurrence
IDs and exact hashes. No array-row, Ang, first-line, fuzzy match or silent
edition migration is a fallback. Future edition changes need an explicit
reviewed crosswalk; stale references fail closed today.

The resolver checks the whole package before publishing a view: byte digest,
identity, review gates, unit and occurrence counts, unique identities,
per-occurrence hashes, complete-Salok bindings and complete source sequence.
Both sources and the whole catalog must resolve before the first passage is
inserted. Missing sources or changed identities produce an unavailable state
with printing disabled. No substitute passage is displayed.

This version accepts no article exposition. Explanations must be null and
claims arrays empty. A sourced claim is still rejected. Content cannot supply
an approval flag, reviewer, external URL, alternate layer, article body or
comparison. A future licensed or qualified-human content lane needs a
separately anchored rights and approval mechanism before it is enabled.

Topic labels and membership are fixed separately from the catalog. Replacing
an editorial label with a scripture heading is refused. The original packages
are neither resealed nor rewritten when article metadata is checked.

No Ang is exposed by the article model. The composition and Salok identify the
passage. The source register acknowledges Open Granth's derivation from Shabad
OS and does not call two views of that lineage independent corroboration.
Kabir attribution remains the collection attribution, with individual review
pending. Neither standalone Salok collection is assigned a musical Raag.

The article controller has no persistence API, no note access, no accounts and
no external asset requests. Its fetches use fixed same-origin paths, omit
credentials and reject redirects. Source text is inserted with textContent.

## Screen and paper

Both sheets use the system Gurmukhi stack and language tags on every Punjabi
element. The original complete Salok, citation, attribution, source basis and
empty explanation space share a print grouping. Navigation and controls are
removed from paper; the source and review notices remain.

The current short groups fit A4 and Letter. This is not a promise that a future
unbounded article block can never split across a page. No long exposition is
accepted by this version.

## Builder verification and its limits

- 47 source/schema/mutation tests pass.
- 25 actual desktop Chromium browser scenarios pass: source resolution,
  complete passages, source-link navigation and Back, keyboard printing,
  320/390/820/1440 widths and enlarged text, failed source/claim/title mutations,
  no Storage API use on sheet-only visits, no cookies/external assets, and
  actual service-worker navigation with the browser network disabled.
- Fifteen contract commands, including existing scripture, learning and
  offline integrity checks, pass.
- Existing scripture, teaching, readers, source decisions and practice tools
  remain byte-for-byte at the frozen parent.
- Actual A4/Letter PDFs and a pagination-boundary fixture were generated.
  All page geometry/margin checks pass. Builder visual inspection finds the
  current passage groups together and no clipped content.

These are builder checks, not Claude's independent verdict, a qualified
Gurbani review, physical printing or physical iPhone/Safari/VoiceOver acceptance.
The new article browser tests used desktop Chromium, not Safari.

The first browser run had one harness timing failure: it read source-state
immediately after navigation. The harness now waits for the explicit completed
or unavailable state. The original result remains in browser-initial.json.

## OPEN: ART-P01 - PDF text copying differs by extraction engine

The strict PyMuPDF 1.26.6 inspection fails for one conjunct in each sheet:
the extracted text duplicates a vowel mark even though the canonical source
and the displayed DOM are exact. Changing among three installed Gurmukhi
fonts did not repair it. The PDF ActualText replacement spans retain the
correct original clusters.

PDFium does not duplicate that vowel but inserts spaces within words. Apple
PDFKit returns still different text, including null characters. Poppler 25.03.0
extracts both canonical lines exactly from the unchanged initial Haumai A4 PDF,
in plain and layout modes, with only NFC and whitespace-collapse comparison.
That diagnostic has a file hash and is explicitly limited to that PDF.

These results establish an interoperability problem, not permission to
normalize away differences or edit Gurbani. There is no hidden replacement
text or PDF postprocessing workaround. A font-stack change was not made.

The strict failed reports are preserved and the print check remains a real
failing gate in environments exhibiting the problem. A successful result from
one extractor must not be reported as universal PDF-copy fidelity. The screen
and printed source register now direct readers to the reader for exact text
when copying. This limitation remains for independent review.

## Evidence and reproducible checks

Runtime: articles/.
Unit mutations: tests/article-source.mjs.
Browser behavior: tests/articles-browser.mjs.
Strict PDF inspection: tests/article-print-inspect.py.
Automation: .github/workflows/article-source-print-qa.yml.

Evidence under evidence/articles/ includes browser.json, contracts.json,
screen captures, original generated PDFs, strict inspection reports,
print-gates.json, initial failures and a print-compatibility directory.
The compatibility summaries are diagnostics, not approval records.
visual-inspection.json records the builder's actual visual scope.

Run the Node/browser commands using the existing project environment.
The print inspector requires PyMuPDF or its documented fallback; the Mac
verification used an isolated temporary environment with PyMuPDF 1.26.6.
The PDF source bytes are never altered by the inspector.

## Review protocol and remaining gates

Claude should freeze criteria and record independent findings before opening
the detailed builder tests and result files. This document and evidence belong
after that stage. Neither this builder nor passing automation approves release.

No exposition, gurbani.org content, new audio, practice history, cross-device
Sangat, live AI, new theological position or wider scripture intake is added.

The physical iPhone check, qualified reviewer, printed collation and any
outside article permission remain outstanding. No additional founder decision
is needed to review or continue bounded engineering work.
