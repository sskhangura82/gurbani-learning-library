# Daily Hukamnama connection and learning candidate

Builder date: 26 November 2026, America/Los_Angeles. The accepted sample is the official Amritsar reading dated 27 November 2026. This is implementation documentation, not independent review, qualified approval or release permission.

## Problem and scope

The Today screen contained an inert “not connected yet” notice. The separate dated Hukamnama foundation existed on an earlier branch but was absent from this preview. This candidate imports that foundation with provenance, replaces the inert entrance with a real reader link, and adds a separate Daily Saved destination. The ten fixed Bani readers, their original text, teaching files, storage formats and loader scripts remain unchanged.

The reader offers Original, Simple explanation, Detailed explanation and Learning. The complete original can open independently of explanations. The in-app explanatory slots are pending: no new interpretation was generated and no modern SGPC translation or commentary was copied. Static official links remain usable without the module or a verified daily record.

## Official connection

Official portal: https://hs.sgpc.net/
Official archive: https://hs.sgpc.net/archiveView.php

The portal blocks cross-site framing and provides no browser cross-origin permission. The application therefore uses a controlled original-only importer and same-origin dated records, rather than an iframe or public proxy.

The importer reads the portal’s observed structured payload, compares it with the visible original, and checks the observed official archive date response. It admits only original text and date metadata. Its observed archive endpoint is an implementation detail, not a promised public API; provider changes must fail clearly.

The complete official heading and body must equal a unique ordered sequence within the bounded source-page window in pinned Open Granth commit 34d2a7cab032c8ea24d21ff20f64653bd03766f4. Headings, Rahao, end boundaries, continuation pages and exact Unicode are checked. The comparison does not establish global corpus uniqueness, independent historical transmission or qualified authenticity.

The accepted 27 November original contains seven occurrences including its heading, spanning Ang 719–720. Loading Ang 719 alone would omit the ending. The original-only acquisition receipts and exact source pins are under evidence/daily-hukamnama/capture-2026-11-27/.

A second real acquisition for 26 November was refused. The official heading omits a trailing danda present in the pinned source, and the official body has a double space where the source has one. The source was not silently normalized or substituted. The refusal and original-only diagnostic are retained; there is no published in-app event for that date.

## Data, integrity and future daily updates

Immutable original packages, dated official events, approved lesson revisions and private notes are separate records. A complete source digest and exact occurrence identity bind them; no row, starting Ang, first-line or fuzzy fallback is used.

Dated event paths are independent of the application shell. The development reader verifies a pinned P-256 publication signature before reading the payload, then the exact source-file digest, every occurrence digest and the complete original. This is the library’s transport signature, not a signature from SGPC.

The initial signing key is development-only. Its private part is outside git, restricted to its owner, and absent from artifacts and browser assets. The signer refuses overwritten output directories and validates original-only staging metadata before emitting a new candidate.

The preparation workflow is artifact-only: manual dispatch, read-only permissions, no schedule, no signing secret, no repository write and no deployment. A production key, publisher activation, daily operational monitoring and release remain later decisions under the existing review protocol. Automatic daily refresh is not being claimed as enabled.

An approved future data update can add a dated event and content-addressed source without rebuilding the reader or service worker. Source corrections must increment the dated revision and preserve provenance. The reader refuses known revision regressions and same-revision conflicts with its saved pair; this is not an external freshness oracle.

## Explanations and rights

Each future lesson is separately bound to its complete source, language, layer and revision. It requires an explicit source-explanation kind, named qualified review, rights for display/printing/offline storage and resolving source citations. Comparison or outside-material fields cannot render as a Gurbani explanation.

These controls validate declared metadata. They cannot establish someone’s qualifications, obtain copyright permission, or decide what Gurbani means. The corresponding human and rights work remains necessary.

Original Gurbani provenance and upstream notices are recorded separately from code licensing. Open Granth’s MIT licence does not grant blanket permission for its corpus, modern translations or commentary. No recording is hosted, embedded or relayed.

## Private learning and backup

Daily learning uses its own single local key, glp001.hukamnama.learning.v1, and its own explicit Hukamnama-learning.json export. It is not silently added to the existing Japji backup, whose parser is not a universal family backup.

Every note binds the exact Harmandir morning event, date, source edition, complete source identity and optionally an exact line. The strict event ID prefix and reader schema fix the venue and ritual. Notes on another date or a replacement source remain distinct. Unavailable historical source bindings are retained.

Writes/imports take an exclusive Web Lock, reread the current record and perform one atomic key write. Concurrent edits preserve copies. Malformed stores/imports, overlong text and quota failures leave existing bytes intact. No text is silently shortened. Where Web Locks are unavailable, reading/export remain available and edits/imports safely refuse.

The UI preserves unsaved text across source completion/refusal, protects date changes and offers a separate unsaved-text recovery download. Private text is rendered as text, excluded from the printed original and never sent over the network.

## Offline and navigation

The static shell contains the new reader page, stylesheet and closed module bundle. Dynamic events and originals are deliberately excluded from that shell. A separate public-source cache stores a complete verified event/source pair for one exact date and revalidates it on use.

A missing current day never becomes an earlier reading. An explicitly opened historical reading is labelled historical. Invalid/ambiguous supplied dates refuse instead of falling back to today. Late requests cannot replace a newer requested date. The official source link remains available in every refusal state.

The new module joins the existing complete script-graph and subresource-integrity policy. The source-preservation gate admits only the frozen Today/Saved navigation changes and the planned catalogue deletion; existing reader behavior remains protected.

## Review and release boundary

Builder checks use synthetic notes and fresh desktop browser contexts. They do not establish physical iPhone, Safari, VoiceOver or human acceptance.

The existing phone preview and live family site are not updated by this candidate. No merge, deployment, qualified review, custodian contact or publisher activation is implied by passing checks. Claude’s independent review precedes a founder release decision.

Builder evidence and initial failures are retained separately from independent findings. The independent reviewer should freeze criteria before reading the implementation and record findings before opening builder outcomes.
