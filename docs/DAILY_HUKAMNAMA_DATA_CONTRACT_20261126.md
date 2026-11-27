# Daily Hukamnama candidate contract

## Source package

`schema: glp.hukamnama.source.v1`

- `id`: `sggs.text.` followed by the SHA256 of every original occurrence joined with one ASCII space.
- `edition`: `opengranth-34d2a7c`.
- `textSha256`: that full joined-original digest.
- `angStart`, `angEnd`: independently witnessed digital page span.
- `occurrences`: ordered complete selection, each `{id, text, sha256, kind, ang}`.
- Occurrence `id`: unit ID + `.line.` + SHA256(text) + `.` + occurrence count of identical text within this immutable unit, beginning1. No row/Ang/fuzzy fallback is permitted.
- `kind`: heading, rahao or verse. Headings come from the exact official heading prefix; Rahao remains in its original position.
- `provenance`: `{repository, commit, pages:[{ang,url,sha256}], comparison, precedingSha256, followingSha256}`. Exact source bytes are versioned; page-level author frontmatter is not assumed valid for every unit. No retrieval timestamp in immutable source packages.
- Filename: `hukamnama/sources/<textSha256>.json`; raw file SHA256 is separately bound by the event.

## Unsigned dated event payload

`schema: glp.hukamnama.event.v1`

- `id`: `harmandir-morning.YYYY-MM-DD`.
- `date`, `timezone: Asia/Kolkata`, `venue: sri-harmandir-sahib`, `ritual: morning-mukhwak`.
- `sourceUrl: https://hs.sgpc.net/`, `archiveUrl: https://hs.sgpc.net/archiveView.php`.
- `officialPublishedDate`: exact provider date; must equal requested date.
- `officialDisplayedTime`: provider's displayed time or null; do not invent an offset.
- `checkedAtUtc`: real retrieval timestamp.
- `officialOriginalSha256`: same full heading+body digest as the canonical source.
- `officialReceiptSha256`: digest of whitelisted original-only receipt, NOT modern commentary.
- `source`: `{id, edition, textSha256, sha256, path}` with exact relative `./sources/<textSha256>.json` path.
- `verification: COMPLETE_ORDERED_TEXT_EQUALITY`.
- `status: DIGITAL_TEXT_VERIFIED_PREVIEW`, `publicationApproved: false`, `revision:1` initially.
- `lessons`: `{simple:null,detailed:null,learning:null}` initially. No empty slot authorizes generated interpretation.

## Signed envelope

`schema: glp.hukamnama.envelope.v1`, plus `keyId`, `payload`, `signature`.

Payload and signature use canonical standard base64. Payload is exact UTF8 JSON bytes. ECDSA P-256/SHA256 signature is64-byte IEEE-P1363 r||s (WebCrypto-compatible). Public JWK and key ID are in protected `hukamnama/publication-key.mjs`; private key never enters git, logs or app assets. File path is `hukamnama/events/YYYY-MM-DD.json`. Browser validates signature before parsing payload, exact requested date, canonical source raw digest before parsing, then each line/full text identity. Signature is a library transport integrity mechanism, not evidence SGPC signed the data.

## Reader/core API to implement

`hukamnama/delivery.mjs` exports:
- `decodeEvent(rawArrayBuffer, requestedDate, {now, publicKey, keyId}={})` -> validated event. Defaults import publication key and use existing core.mjs date helpers.
- `decodeSource(rawArrayBuffer, event)` -> frozen validated source.
- `loadReading(date,{now,fetchImpl,cacheStorage,baseURL,signal}={})` -> `{status,event,source,fromCache}`; meaningful refusal/pending errors, no different-date fallback. Same-origin dated fetch and complete verified-pair cache. Default baseURL is reader directory derived from import.meta.url.
- `admitLesson(candidate,{event,source,layer,language})` -> approved lesson or null/throws; pending is not an error hiding scripture. No current lessons are approved.

`hukamnama/learning.mjs` exports:
- `LEARNING_KEY`, `validateLearning`, `loadLearning`, `saveLearning`, `exportLearning`, `importLearning` (object options API, coordinated with UI implementer).
- Dedicated format `glp-hukamnama-learning`, version1; export filename `Hukamnama-learning.json`.
- Record exact event/date/unit/edition/source digest/optional line identity plus private question/reflection; private text remains unchanged. Exclusive write lock, reread-before-write, conflict-copy preservation, atomic one-key write. Unknown/bad existing stores and bad imports are preserved, not replaced. No silent length truncation or partial restore.

## UI and private learning boundary

Extend the existing hukamnama/index.html/reader.mjs/style.css rather than add a duplicate reader. Static official link remains outside all source/JavaScript gates. Four visible destinations: Original, Simple explanation, Detailed explanation, Learning. Useful pending explanations and an explicitly external official explanation link. Neutral study tools and source-bound private notes, with a Saved view under `?learning=saved`. Protect dirty note state during date changes. No live interpretation, audio embedding or practice counters.

## Publishing boundary

The importer emits unsigned source/event/receipt into a staging directory; a separate signer seals the exact verified payload. Candidate events may be read in the development reader with a visible development/update status. An enabled daily publisher remains a reviewed release decision; build its artifact-only workflow, never an auto-deploy. Stable dated data and source packages permit future approved updates without replacing the app shell.
