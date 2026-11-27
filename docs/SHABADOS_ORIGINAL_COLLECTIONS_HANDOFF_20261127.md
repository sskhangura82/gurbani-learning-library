# Full named-edition SGGS and Dasam originals

## Prepared result

The exact Shabad OS Database 5.0.0-next.0 release supplies a usable original-text source for both collections. The actual original-only payloads have been produced outside Git, preserving every supplied source record and complete source group. Their schema is shared with the new collection reader. This increment changes no existing source reader or original-research approval flag.

| Collection | Source / primary asset | Sections | Complete source groups | Original records | Reported page labels | Chunks |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| SGGS | `SGGS` / `SSA2` | 51 | 5,549 | 60,555 | 1–1,430 | 75 |
| Dasam | `SDGR` / `DGDG` | 17 | 5,470 | 67,758 | 1–1,428 | 80 |

The record totals include source headings and other source rows; they are not counts of verses or independently verified compositions. The Dasam sections include the complete supplied Charitropakhyan, Zafarnama and Hikayat, rather than only the existing Nitnem selections.

The [source notice](SHABADOS_ORIGINAL_SOURCE_NOTICE_20261127.md) records rights, source bibliography and attribution limits. The exact release README remains available with the downloaded source artifact. The safe machine ledger and counts are under `evidence/shabados-original-collections/`.

## Immutable payload bindings

| Collection | Manifest bytes | Manifest SHA-256 | Total chunk bytes |
| --- | ---: | --- | ---: |
| SGGS | 1,116,397 | `04da157b5e7ba85ce0fe35aae983baba3284bc75990be374e556ab3c52da5def` | 9,614,294 |
| Dasam | 1,101,376 | `2ba6005655429eeb07b4477d4bf9a18b4f62e86224107d72793ec5f2bd441ad6` | 10,174,590 |

The prepared payload root is `/tmp/glp-sikh-original-collections-20261127-prepared`. Each collection directory contains only `manifest.json` and `chunks/`. The parent preparation receipt is metadata only. Raw databases and README inputs are held separately at `/tmp/glp-dasam-source-20261127-nvqyzjs6`; the raw database also contains excluded modern material and is not a runtime asset.

The agreed candidate destination is `collections/source-data/{sggs|dasam}/`. Root integration owns copying those original-only directories after validating the reader. This worktree carries reproducible code and evidence, not the runtime payload.

## Reader contract

The manifest schema is `glp.sikh-reader.manifest.v1`, with status `NAMED_DIGITAL_EDITION_ORIGINAL_ONLY` and locator status `SOURCE_REPORTED`. It pins the npm package, archive, database and original-text notice independently. The registry-reported Git head is qualified because its old repository README URL returned 404.

The source name is a provider object with `Latn` and `Guru` keys. Section names have `Latn`; author names have `Guru` and `Latn`. These are identification metadata only. English section descriptions, translations, notes and transliterations are not projected.

Units preserve upstream source-group IDs. Each unit has `id`, `sectionId`, `sectionOrder`, `authorId`, and ordered `lines`. Each line has `id`, `order`, `page`, `printedLine`, and exact `text`. Missing printed-line metadata remains `null`. IDs belong to the collection and pinned edition namespace and do not overwrite existing reader identities.

Unit SHA-256 values cover compact UTF-8 `JSON.stringify(unit)` with the specified property order and no newline. Chunk and manifest file hashes cover compact UTF-8 JSON followed by one LF. Chunk IDs are sequential `c0001` style identifiers, and paths are relative to the manifest, such as `chunks/c0001.json`.

Chunks are at most 128 KiB and never split a source group. SGGS has 1,120 groups spanning page labels; Dasam has 1,132. The largest groups have 399 SGGS lines and 426 Dasam lines. Page selection must return the whole owning source group; a page boundary is not a composition boundary.

Source metadata anomalies remain visible. Dasam `9QK` has fourteen within-group page-label decreases. SGGS `G4W` retains the known printed-line decrease on reported page 1377. Ordering follows section/group/line order, without sorting or repairing those locators. The upstream Raagmala author field and the blanket Dasam author metadata remain source-reported attributions, not independently adjudicated historical claims.

## Reproduction and verification

Obtain the exact npm archive linked in the source notice, verify its published SHA-1/SHA-512 and recorded SHA-256, and extract only the named database and README members to a directory outside Git. Then run:

```sh
python3 tools/build-shabados-original-collections.py \
  --database /tmp/source-input/master.sqlite \
  --notice /tmp/source-input/README.md \
  --output /tmp/new-original-collections
python3 tests/shabados-original-importer.py
```

The destination must not exist. The importer verifies exact source and notice digests, database integrity, complete source/asset coverage, unique identities, contiguous section/group/line order, all reported page labels, exact original fields, and bounded whole-group chunks. It reloads every generated chunk and compares all originals with the database result. It strips no punctuation and performs no normalization.

The actual output passed a separate Node verification of all manifest, chunk and unit hashes, establishing Python/JavaScript serialization agreement for 11,019 groups. Eleven synthetic importer tests cover missing/duplicate originals, changed pins, omitted orders, source-label decreases, protected-layer exclusion, unknown metadata, chunk boundaries, oversized groups, and Git-environment bypass attempts. Synthetic tests establish behavior, not source authenticity.

Original-text rights and the named edition are sufficiently documented for this source-only candidate. No modern translation permission is inferred. No Claude call, independent printed collation, historical authorship adjudication, release or deployment is performed by this increment.
