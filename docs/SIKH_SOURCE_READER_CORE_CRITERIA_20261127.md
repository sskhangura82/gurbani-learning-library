# Shared Sikh source-reader core — acceptance before implementation

Base: `320537b0cc4aceb2e6007b32057a3c4a36c83520`.
Founder scope is recorded by root in
`54f1a53f09acdf47e2b308412c9a07a608da333f`,
`docs/PIN_AND_COLLECTIONS_CRITERIA_20261127.md`.

This increment implements pure validation, navigation and reading-place
functions for two newly admitted named digital original-text editions. Root
owns the UI, source-lock bindings and integration; the source agent owns the
original-only SQLite importer and provenance records. Existing reader text,
teaching, storage keys, public Knowledge source custody and private reading
remain unchanged.

1. A raw manifest requires its separately trusted exact byte count, SHA-256,
   collection and edition binding. A valid-looking unverified object is never
   accepted by navigation or chunk validation.
2. `glp.sikh-reader.manifest.v1` is closed: fixed original-only and
   source-reported status; explicit source provenance; exact original name
   metadata; complete ordered sections, authors, units and chunks. Counts,
   membership, ownership and references must agree without duplicate IDs.
3. Each 128 KiB bounded chunk requires its manifest descriptor's exact bytes,
   raw digest and identity. All complete owning units, exact occurrence order,
   page labels and nullable printed-line locators are verified before returning
   any original text. Every unit's canonical body digest is independently bound
   in the manifest. No unit is clipped at a source-page or chunk boundary.
4. Text and metadata are preserved as decoded original strings. There is no
   normalization, correction, translation, generated transliteration, inferred
   author, inferred page or inferred Shabad boundary. Package metadata's
   `reportedGitHead` is not presented as an independently resolved Git commit.
5. Selecting a source page returns all its complete owning unit descriptors.
   The empty route means the first source page; malformed, duplicate, unknown,
   unsupported, cross-edition or non-owning routes refuse explicitly. A line
   focus requires its exact verified group and actual selected page.
6. Reading-place records have a separate per-collection/per-edition namespace.
   Structural preflight may identify the chunk to fetch. Complete resume proof
   additionally requires the verified unit, exact line and page. Unknown or
   damaged records are rejected without modifying or deleting storage.
7. Meaningful contracts exercise wrong digest/size/identity, malformed encoding,
   unknown fields, duplicate and reordered sections/units/occurrences, missing
   or foreign ownership, unit digest changes, page-boundary completeness,
   navigation round trips, malformed links, copied line IDs and stale editions.
8. Synthetic fixtures are explicitly synthetic. Actual generated manifests and
   every chunk are verified when the importer output is available, with known
   multi-page groups checked in full. These checks establish fidelity to the
   selected digital edition, not independent printed collation or historical
   truth. Browser acceptance belongs to root's combined UI test.

No network, live AI, secrets, source rewriting, implicit migration or publishing
operation belongs to the core. No new human-review gate is introduced.
