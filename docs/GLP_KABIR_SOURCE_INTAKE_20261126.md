# GLP-001 — Bhagat Kabir Ji intake evidence

Prepared 2026-11-26. **Planning inventory only; runtimeEligible and publicReady are false.** This work does not modify the existing scripture pack, its pin, or its nineteen occurrences. No translations, explanations, audio, or biography have been imported into the candidate manifest.

## Files for the implementation branch

- `content-intake/kabir/manifest.json`: source inventory, a first candidate, original source text fingerprints, boundary witnesses, and two quarantined discrepancies.
- This evidence note.
- `evidence/kabir-intake/validation.json`: local mechanical validation results.

The temporary `inputs/` directory contains the fetched upstream files used to construct the manifest. Do not commit it: the Markdown contains third-party English translation material that is deliberately excluded from the intake artifact. The manifest carries only selected Gurmukhi source occurrences and provenance data.

## Reproducible source snapshot

Repository: `opengranth/open-granth`

Commit: `34d2a7cab032c8ea24d21ff20f64653bd03766f4`

| Path | Git blob | SHA-256 |
|---|---|---|
| `metadata/authors.json` | `ad723a5d2cdd29e8d74ec336111e95ab387f5b2e` | `30087956844b72d15f7ffd50f27d68e6f19eaa13fd69d5464c7de348c4d88503` |
| `corpus/ang-0323.md` | `8913904f9d203b0f7c82036af9f143fd5c06a8a1` | `444f2ff55b16b4f71392cafb1f99ee49fcc76743bd0f981eab8dc24592b7cd69` |
| `corpus/ang-0324.md` | `1d5fb8624c9ddfdfef5a0801081a6cd469dcd540` | `f2e1be82dae745532602c109e2cc581a865e0ab4fe31887ab18310e2f4091bfe` |
| `corpus/ang-1377.md` | `2517993def728500a63090f00e80e4746592fbfb` | `47c2e2d5d609bc726f5813bdae03caea25accf843bd32b259fbb1f1a96598262` |

Git blob identifiers were independently recomputed from the exact fetched bytes using Git's `blob <byte length>\0` prefix. SHA-256 values are for those same raw bytes. Source-occurrence hashes are SHA-256 over each exact UTF-8 Gurmukhi text, with no normalization or final newline.

The selected-text digest is SHA-256 over the eleven candidate text strings joined by LF, without a final LF. It includes the heading and equals `24097fef481ae89a43ce1de30db725ba401320783c712360e4a8300ef0f4e66b`.

## What the inventory can and cannot establish

The upstream author record is named `Bhagat Kabeer Ji`. It lists 96 candidate Angs and `verse_count: 3057`. The latter is a text-entry count, not a verified count of complete Shabads, padas, or Saloks. All 96 Ang numbers are preserved in the JSON; there is no claimed complete-composition count.

The importer initially has author/section fields for each upstream line group, but drops those fields from individual Markdown occurrences. Page frontmatter is selected by the majority author/section. Ang323 says `author: Guru Arjan`, although the Gauri Kabir heading occurs later on that page. Whole-page author inheritance is therefore explicitly forbidden by the proposed validation inputs.

The current source-text and metadata layers descend from the same upstream database. Matching their data is not an independent attribution review. A signature word such as Kabir is also insufficient to assign an author.

Relevant pinned implementation and source policy documents:

- [Importer](https://github.com/opengranth/open-granth/blob/34d2a7cab032c8ea24d21ff20f64653bd03766f4/scripts/import_shabados.py)
- [Parser](https://github.com/opengranth/open-granth/blob/34d2a7cab032c8ea24d21ff20f64653bd03766f4/open_granth/parser.py)
- [Provenance](https://github.com/opengranth/open-granth/blob/34d2a7cab032c8ea24d21ff20f64653bd03766f4/docs/provenance.md)
- [NOTICE](https://github.com/opengranth/open-granth/blob/34d2a7cab032c8ea24d21ff20f64653bd03766f4/NOTICE)
- [LICENSE](https://github.com/opengranth/open-granth/blob/34d2a7cab032c8ea24d21ff20f64653bd03766f4/LICENSE)

## First source candidate

The first proposed Gauri Guareri chaupada is OpenGranth Ang323 ordinals30–40: one heading and ten verse occurrences. Its opening is `ਅਬ ਮੋਹਿ ਜਲਤ ਰਾਮ ਜਲੁ ਪਾਇਆ ॥`; the last occurrence ends with `॥੪॥੧॥`. The following heading occurs at ordinal41.

The candidate manifest preserves the exact occurrence texts, source printed-line/within-line coordinates, source ordinal, text hash, surrounding context, and a proposed logical identifier. The proposed identifier is not assigned as canonical, and the canonical Ang field remains null. The heading supports a candidate attribution; substantive attribution and segmentation review remain pending.

The section heading and invocation at ordinals28–29 are stored as broader context, with shared-context rendering policy pending. They are not silently counted as part of the eleven-occurrence candidate.

SriGranth's Ang323 page was inspected as a second digital witness. The heading, opening, ending, and next heading agree in the displayed sequence. The JSON retains these exact boundary-context records and URLs for re-fetching. No automated full-occurrence comparison, print collation, or qualified review was performed.

- [SriGranth Ang323](https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param=323)

## Quarantined location discrepancies

### `og-location-1377-row002`

The pinned OpenGranth Ang1377 file inserts `ਬੰਨੑਿ ਉਠਾਈ ਪੋਟਲੀ ਕਿਥੈ ਵੰਞਾ ਘਤਿ ॥੨॥` at source ordinal2, printed line1. It appears between the ending of Kabir Salok231 and the opening of Salok232. SriGranth instead displays the same text at the start of Ang1378 in the Farid Salok sequence. This disagreement blocks automatic author inclusion and publication for the disputed occurrence. The manifest preserves both source contexts, while canonical Ang and author fields remain null.

- [Pinned OpenGranth Ang1377](https://github.com/opengranth/open-granth/blob/34d2a7cab032c8ea24d21ff20f64653bd03766f4/corpus/ang-1377.md)
- [SriGranth Ang1378](https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param=1378)

### `og-location-0324-row001`

OpenGranth Ang324 ordinal1 contains `ਤੂੰ ਸਤਿਗੁਰੁ ਹਉ ਨਉਤਨੁ ਚੇਲਾ ॥`. SriGranth displays it as the final Gurbani occurrence of Ang323. Both displays then place the closing `॥੪॥੨॥` occurrence on Ang324. The complete second Shabad is a useful future cross-Ang test, but this location remains unresolved in the intake queue. No text has been moved or corrected.

- [Pinned OpenGranth Ang324](https://github.com/opengranth/open-granth/blob/34d2a7cab032c8ea24d21ff20f64653bd03766f4/corpus/ang-0324.md)
- [SriGranth Ang323](https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param=323)
- [SriGranth Ang324](https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param=324)

## Implementation gates

The validator should verify exact source-file hashes/blobs before trusting any parsed occurrence; the candidate source range, ordered selected-text digest, per-text digests, counts and boundary markers should then match. It should reject any attempt to turn this inventory into runtime or public content automatically. Open discrepancies must remain quarantined, review fields must remain honest, and the existing runtime scripture pack must remain unchanged.

Source hashes prove byte identity with this digital witness. They do not prove scriptural attribution, canonical location, completeness, or interpretive correctness. Two web displays may share upstream data; their agreement is not evidence of independent manuscripts.

The OpenGranth MIT license explicitly applies to project code/tooling and excludes scripture/third-party translation content from that code license. The presence of a public repository does not clear modern translations, commentary, audio or images for reuse.

## Implemented research-intake validator

The intended repository layout is `content-intake/kabir/manifest.json`, `tools/validate-kabir-intake.mjs`, and `tests/kabir-intake.mjs`. The validator has no package dependencies and performs no network calls. Its fixed source-file hashes, selected-occurrence fingerprints/locators, and original runtime scripture digest are independent of the editable manifest. It also reads the existing `knowledge/source-lock.mjs` pin and requires the existing nineteen-occurrence scripture file to remain byte-identical.

Run from the repository root:

```sh
node tools/validate-kabir-intake.mjs
node tests/kabir-intake.mjs
```

The first command explicitly reports `witnessFilesVerified: 0` unless original source files are supplied. To verify the downloaded pinned files, place `authors.json`, `ang-0323.md`, `ang-0324.md`, and `ang-1377.md` together in an external temporary directory and run:

```sh
node tools/validate-kabir-intake.mjs --witness-dir /path/to/pinned-witnesses
node tests/kabir-intake.mjs --witness-dir /path/to/pinned-witnesses
```

With all four original witnesses present, 45 focused tests passed, including attempted promotion of publication/human-review status, altered text with renewed local hashes, reordered lines, clipped attribution headings, whole-page author inheritance, silent locator corrections, dropped quarantine records, added audio/translations, altered runtime scripture, and changed witness bytes. Without source witnesses, the two real-witness tests are explicitly skipped; the other 43 run. Passing grants no scholar or source-location approval, and the returned runtime/public flags remain false.

The validator is specific to this frozen intake. An intentional source change or future candidate expansion requires documented review and an explicit validator update; rerunning it does not renew any source pin or silently repair data.

## Builder execution on the implementation device

The four original witness files were fetched again using the fixed source descriptors, verified before writing to a temporary directory, and checked against the manifest and existing runtime source. All 45 focused tests passed with zero failures and zero skips. The actual report is `evidence/kabir-intake/validation.json`; the test run is `evidence/kabir-intake/tests.tap`. No runtime file changed.

`tools/fetch-kabir-witnesses.mjs` downloads only the four validated fixed-commit URLs, rejects redirects, limits each response to its expected byte count, and verifies all bytes before writing. The workflow stores only validation evidence as its artifact, not the source Markdown or its translations.

This is a bounded validator for intake 001, not a parser claiming that the full Kabir corpus has been authenticated. A later intake requires explicit source/evidence updates. Human review and source-location adjudication cannot be granted by passing these engineering checks.
