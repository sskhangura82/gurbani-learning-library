# GLP-001 — shared source and presentation contract (draft)

**Only new contract code and tests. No reader, site, media, teaching or service-worker changes.** Built from R7 `254f387`, independently of draft PRs #9, #11, #12 and #13.

## Why

One previously proposed lesson used `ਚੁਪਿ` while its frozen source occurrence contains `ਚੁਪੈ`. Every string **presented as original Gurbani** must be an exact substring of an identified, sha256-matched occurrence, with its exact Ang. Quoted Gurmukhi never receives automatic normalization or spelling correction.

`tools/contracts/source-envelope.mjs` exports `indexOriginal`, `assertVerbatim`, `auditQuotationSurfaces`, `validateClaimEnvelope`. Example:

```json
{
 "role": "scripture",
 "occurrenceId": "pauri01.line02",
 "sourceSha256": "0e12e72beb1bb30783a53eb36cd5c6147ae3bf1b3200c78d48dbbfcd5a9830e6",
 "quote": "ਚੁਪੈ ਚੁਪ",
 "ang": 1
}
```

**Note:** validating a source binding does not certify a commentary, translation, pronunciation, outside URL, or a scholar's approval. Punjabi written by this app uses an explicitly `editorial` surface label, never `scripture`.

## Claim records

Each claim requires `claimId`, `subjectId`, `domain`, `lang`, `text`, `steward`, optional exact scripture `anchor`, and source `evidenceIds`.

Supported domains: `scripture`, `exegesis`, `psychology`, `institution`, `media`, `reflection`, `ux`.

Review state is **independent**, not an implicit ladder:

```json
"status": {
  "sourceChecked": false,
  "reviewerSignoffs": [],
  "founderProductAccepted": false,
  "publishedRevision": null
}
```

For claims with external evidence, source records identify an HTTPS URL, checked date and exact quote. The pure validator verifies field presence, **not the live URL's actual content**. Never set `sourceChecked` without a separate human/source-checking operation.

An exegesis needs named attribution and a Sikh/Punjabi signoff before publication. A psychology comparison needs evidence tier (A–D), a distinct explanation of where the analogy *breaks*, Sikh/Punjabi and psychology-evidence review. Institution facts need place/history review. Media needs explicit rights records and public reuse permission. Reflections are labeled **ours** and never impersonate Gurbani. Original scripture publication needs its own scripture-collation review. A founder product decision is separate from all those reviewer roles. Publication cannot bypass them and reviewer content hashes bind signoffs to the exact approved text.

## Tests and boundaries

- `tests/source-envelope.mjs`: 385 frozen original hashes, quote fidelity, negative controls for `ਚੁਪਿ`, wrong Ang/source, domain evidence, human-review and rights gates. No existing runtime is altered.
- `tests/contrast.mjs`: opaque sRGB WCAG contrast calculation for proposed day / Amrit Vela Mind inks. **Only a token smoke test**, not full UI visual QA.
- `tests/a11y-order.mjs`: synthetic browser-output contract for source-marked Gurmukhi, language, DOM/visual order and 44px touch targets. **Not physical iPhone or VoiceOver evidence**.

Run `node --test tests/source-envelope.mjs tests/contrast.mjs tests/a11y-order.mjs`.

## Integration/authority

1. Peer-review and merge the reusable helper independently. Do not turn it into a repository-wide release gate before existing claims have migrated to the contract.
2. GUR-PLACE-DATA and PSY-CONTENT can add records safely. They are not authorized to publish rooms.
3. New UI authors use exact occurrence links and evidence records. Coordinate the reader's `#occ=` logic with the **PR #11 owner**; do not patch the reader concurrently.
4. Keep qualified Sikh/Punjabi, psychology, media-rights, physical device, provider and founder release decisions as separate gates.

Blueprint basis: user-supplied Claude PSY-R §8, GUR-R §5, X-INT §§3–6 (2026-10-24). This contract does not represent formal verification of religious meaning, outside claims, media ownership or device behavior.
