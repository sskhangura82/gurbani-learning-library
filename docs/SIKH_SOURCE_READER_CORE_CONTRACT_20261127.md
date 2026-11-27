# Original-only collection reader core

The criteria were frozen in commit `05ea89a` before implementation. The core is
isolated from the existing readers and has no fetching, rendering, storage,
normalization, translation, or teaching behavior.

## Public interface

`collections/source-reader/core.mjs` exports the following functions. Verification
is asynchronous because it uses Web Crypto SHA-256. All other functions are
synchronous. Refusals throw an `Error` whose `code` and message are `SOURCE_*`.

| Function | Contract |
| --- | --- |
| `verifyManifest(bytes, binding)` | Returns a deeply frozen verified manifest. Binding supplies trusted `collectionId`, `editionId`, `bytes`, and raw-file `sha256`. Extra binding fields used by the UI are allowed. Input is `Uint8Array` or `ArrayBuffer`; it is copied before hashing. |
| `verifyChunk(bytes, descriptor, manifest)` | Returns a deeply frozen verified chunk only after the complete chunk and every whole unit pass. Descriptor must be the actual object from the verified manifest. |
| `unitsForPage(manifest, page)` | Returns all owning unit descriptors in source order. No original line is clipped to the selected page. |
| `parseRoute(search, manifest)` | Returns `{page, unitId, lineId}`; missing optional IDs are `null`. Empty search starts at page 1. Invalid, duplicate, unknown, or unowned route parameters refuse. |
| `formatRoute(route)` | Returns `?page=…`, with optional `&unit=…&line=…`. Structural formatting does not claim source validation. |
| `lineForRoute(manifest, route, unit)` | Returns the actual verified line, or `null` for an unfocused route. A requested line must belong to the verified unit and have exactly the selected source-reported page. |
| `progressKey(manifest)` | Returns `glp001.sikh-source-place.v1:<collectionId>:<editionId>`. |
| `makeProgress(manifest, unit, line, nowISO)` | Returns a validated frozen record. Unit and line must be the actual verified objects; time must be canonical UTC ISO with milliseconds. |
| `progressUnit(record, manifest)` | Preflights the record and returns its unit descriptor so the application can fetch the owning chunk. It does **not** establish actual line membership. |
| `validateProgress(record, manifest, unit)` | Requires the verified unit and checks actual line membership and page before returning a frozen copy of the record. The application must complete this step before offering resume. |

The progress schema is exactly
`{schema, collectionId, editionId, unitId, unitSha256, lineId, page, updatedAt}`,
with schema `glp.sikh-reader.progress.v1`. The core never writes, deletes, repairs,
or replaces a malformed saved record. The application remains responsible for
preserving it and for guarding concurrent storage writes.

## Integrity and source qualifications

The manifest is bounded to 4 MiB; each whole-group chunk is bounded to 128 KiB.
All serialized manifests and chunks use compact JSON plus one LF. A canonical
round trip rejects duplicate JSON keys, including escaped aliases. The unit
digest covers compact `JSON.stringify(unit)` with no LF. No key is stripped and
no source text or Unicode sequence is normalized before this comparison.

Schema checks bind source, asset, edition, original metadata fields, section and
group order, complete unit membership, page coverage, and explicit nullable
printed-line locators. No arbitrary prose classifier claims that content is
authentic; separately code-pinned bytes and the selected source asset establish
the delivered edition. `reportedGitHead` is registry-reported metadata, not an
independently resolved Git commit. All attributions and page labels remain
source-reported.

Dasam group `9QK` contains 14 source-reported page regressions within its original
line order, including line `3NZ6` on reported page 158 followed by `TT76` on 155.
The reader retains those values and that order. It neither sorts the group by
page nor invents replacement locators. SGGS Raagmala group `FD3` retains the
source-reported `ALAM` author ID without asserting that this settles attribution.

## Verification

Run `node tests/sikh-source-reader-core.mjs` after the admitted data is present in
`collections/source-data/`. The optional `GLP_SOURCE_DATA_ROOT` environment
variable selects the same two collections outside the checkout during importer
integration. Missing files fail the test; there is no silent all-data skip.

Sixteen named acceptance checks pass against the prepared pinned payloads:
SGGS has 5,549 complete units, 60,555 lines, 1,430 pages, and 75 chunks; Dasam has
5,470 complete units, 67,758 lines, 1,428 pages, and 80 chunks. Every manifest,
chunk, and unit digest was verified. All 128,313 source line IDs are unique
within their collection. The test independently pins the exact manifests.

Adversarial fixtures cover byte tampering, renewed pins over invalid schemas,
duplicate JSON keys, UTF-8 errors, Unicode normalization, dropped lines, group
order, chunk membership, path traversal, duplicate source line IDs across
chunks, foreign routes, page-bound line focus, unverified object copies, and
malformed or future saved records. Actual boundary checks cover `ZKH`, `SKD`,
the 399-line `TNM`, the final `FD3`, and the 426-line Dasam `4TJ`.

Both new `.mjs` files pass `node --check`. Browser rendering, racing navigation,
storage locking, offline delivery, source-lock registration, and UI integration
are separate application checks owned by the root reader implementation.
