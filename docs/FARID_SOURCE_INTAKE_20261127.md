# Farid source intake and full-corpus file inventory

27 November 2026 · builder research candidate · no runtime admission or release

## What this increment does

This branch records the source evidence needed before a Farid reader can be built. It preserves the observed forward source span exactly, keeps a displaced original line in quarantine, and checks that an incomplete selection cannot be described as complete. It also records the pinned file inventory for the eventual full Sri Guru Granth Sahib Ji library. No reader, navigation, scripture package, teaching, source policy, saved learning or deployment changes.

The builder criteria were committed before implementation in `FARID_SOURCE_INTAKE_CRITERIA_20261127.md`. This follows the bounded manifest/validator/fetcher approach in separate PR 50 without importing its Kabir candidate or changing that review record. These are builder checks; independent review and qualified human review have not occurred.

## Source and inventory

Pinned original-text witness: `opengranth/open-granth` at `34d2a7cab032c8ea24d21ff20f64653bd03766f4`. The original strings are extracted without changing punctuation, spelling, Unicode or spacing. OpenGranth itself derives from Shabad OS; comparing those two does not supply independent textual lineage.

The upstream author inventory reports **326 text entries across ten candidate Angs**: 488, 794 and 1377–1384. These are not 326 compositions, nor does a candidate Ang belong wholly to one author. The manifest distinguishes Farid's numbered Salok collection from his Raag Bani. The latter remains inventory only, with no passages selected or admitted.

Twelve exact raw witnesses are pinned by byte count, SHA-256 and Git blob: the author metadata, the ten candidate Ang files and Ang 1385 as the following collection-boundary witness. Raw pages also contain modern translations and locally generated transliteration. The temporary fetcher refuses a destination inside a Git worktree; none of those reading-aid layers, page layouts or raw files is bundled here.

## Why the Farid collection cannot yet be admitted

The forward span begins at the Farid heading, Ang 1377 source row 27, and ends with the terminal 130 on Ang 1384. It contains **296 original source occurrences**, including its heading, invocation and eleven explicit Mahalla headings. Its observed numbered endings are 1, 3, 4 … 130: terminal 2 is absent.

The absent closing occurrence is present earlier in the same pinned source file, at Ang 1377 row 2, inside the raw Kabir span. The existing Kabir discrepancy research preserves Shabad OS line V41B, group G4W, section X63C and reported author FRID. Its group order links it to the preceding Farid line near the end of source 1377. Existing bounded web/page-image research places the closing occurrence at the beginning of printed Ang 1378.

This increment **does not relocate the row, assign a canonical Ang or author, or build a reordered 297-occurrence pack**. It records the existing evidence by exact repository fingerprints and explicitly labels the older observations as inherited research, not newly performed independent verification. The original source locator and open discrepancy remain intact.

A second existing discrepancy concerns the Farid collection heading's terminal danda: OpenGranth includes it and the prior SriGranth display observation does not. Both reported forms remain visible in the research record. No preferred runtime heading is selected. All explicit Mahalla headings remain source occurrences; no page or signature-based author inheritance is permitted.

## Files and verification

- `content-intake/farid/manifest.json`: author inventory, observed incomplete span, boundary occurrences, explicit headings, open discrepancies, provenance, rights references and closed review/admission gates.
- `content-intake/farid/contract.json`: immutable research pins, complete span fingerprints, preserved runtime-file pins and inherited-evidence pins. The validator pins this file independently.
- `content-intake/sggs/file-inventory.json`: all 1,430 pinned Ang paths, Git blob identities and sizes from an untruncated tree response, totalling 14,816,830 raw bytes. This is a file inventory, not a scripture search index or per-line collation. Full-corpus original lines collated: 0.
- `tools/validate-farid-intake.mjs`: static contract validation and optional reconstruction from all twelve raw witnesses. A no-witness run is explicitly labelled static-contract-only.
- `tools/fetch-farid-witnesses.mjs`: fixed, bounded, fingerprint-checked fetches into a new temporary directory outside any Git worktree. Existing directories are not overwritten.
- `tests/farid-intake.mjs`: missing-line, mutation, relocation, source/authority, metadata, file-inventory and preservation counterexamples.

The contract separates the meaningful claim made by each check: existing runtime bytes preserved; frozen source research intact; twelve exact witnesses reproduced when available; 1,430 file descriptors inventoried; no complete Farid composition admitted; no full-corpus original-text authentication or qualified approval.

## Rights and review

OpenGranth's MIT license covers code/tooling and expressly excludes its corpus and English translation. Its NOTICE records provenance. The separately pinned **Shabad OS README**, not the OpenGranth NOTICE, identifies original Gurbani/Panthic texts as public domain. That upstream statement does not license modern commentary, recordings or book layouts. The original-text and code-license references remain separate. Rights review, source-location adjudication, Gurbani scholarship and Punjabi review are unfilled fields.

All runtimeEligible, publicReady and publicationReady values remain false. A passing validator admits only a research record, not a composition, interpretation or public release.

## Reproduce

```sh
node tools/fetch-farid-witnesses.mjs --output /tmp/glp-farid-witnesses-new
GLP_FARID_WITNESS_DIR=/tmp/glp-farid-witnesses-new node --test --test-reporter=tap tests/farid-intake.mjs
node tools/validate-farid-intake.mjs --witness-dir /tmp/glp-farid-witnesses-new
```

The local check reconstructed all 296 forward occurrences, both boundaries and the displaced occurrence from twelve pinned files. It retained the missing-number finding and refused synthetic attempts to erase it, relocate it, reseal changed scripture, infer whole-page authorship, insert unreviewed content or promote approval. A second fresh fetch reproduced the same result. Evidence is under `evidence/farid-intake/`.

The proposed CI workflow is read-only and uploads results only. It was written locally but has not run on GitHub. No physical-device, printed-page, qualified-review, merge or deployment success is claimed.

## Next concrete step

Independent review should verify the research scope and refusal behavior. Then a separately reviewed selection ledger can address the displaced line and heading evidence without rewriting the frozen witness. Only after the unresolved source/admission requirements are met should an original-only Farid reader reuse the existing collection reader. The future full-corpus index also needs stable occurrence crosswalks and documented locator discrepancies; a 1,430-file inventory is only its source inventory foundation.
