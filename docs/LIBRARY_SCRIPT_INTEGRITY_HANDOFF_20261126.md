# Library script integrity — independent review handoff

Date: 26 November 2026 (America/Los_Angeles).

## Review scope before opening implementation

The remaining nonreader script loaders include imported verifier and contract code. This candidate extends browser subresource protection to the complete Library, Articles and Knowledge graphs, and to the remaining classic page scripts. It preserves the reviewed reader repair.

Please freeze your own acceptance criteria before opening the implementation. The builder's preimplementation criteria are in `docs/LIBRARY_SCRIPT_INTEGRITY_CRITERIA_20261126.md`, first committed at `bf744d1ac5b845d63c3324ed1f231c3fec31e40e`; they do not replace independent criteria.

Record your findings before opening `evidence/library-script-integrity/BUILDER_REPORT.md`, the new tests, or their result directories. The pull-request notification deliberately contains no builder outcomes, even in a collapsed block. If notification or other exposure affects blindness, record that honestly.

## Exact inputs and dependency order

- Reader reliability base: `e0a6cff22771d42ce3a2fe91ad96863daae214ed` (PR59).
- Complete Knowledge unit: all 86 additive paths from source main `a3476ac4b9be90dde350fb35dd13ce0b672c120d` through `b68e080043bb0b4e5cb3d17977e65c8cd62c15b3` (PR58). No path collision or older reader file was imported.
- Knowledge chain: PR45 → PR48 → PR53 → PR57 → PR58. The complete reviewed tip is included as one unit, never the obsolete pilot alone.
- Combined frozen baseline: `bf744d1ac5b845d63c3324ed1f231c3fec31e40e`.
- Import provenance: `evidence/library-script-integrity/inputs/knowledge-import.json`.
- Delivery byte fingerprint: `evidence/library-script-integrity/inputs/delivery-manifest.json`.
- Rollback branch: `rollback/library-script-integrity-base-20261126`, at the reader reliability base. A rollback reference alone is not failed-update evidence.

## Intended engineering boundary

Three same-directory ESM bundles replace executable transitive imports. Original modules remain readable and frozen. A private locked compiler/parser toolchain produces them; it is not loaded by the website. All production HTML entrypoints have an explicit script inventory. Check commands do not write; refreshing is explicit. The existing reader pin tool and reader HTML remain unchanged.

The offline release adds the generated bundles and complete Knowledge surface. The worker's installation and activation algorithm is not changed. Semantic mutation fixtures explicitly rebuild and repin their own HTML, keeping semantic guard behavior separate from browser transport refusal.

## Exclusions and unresolved items

This protects subresources under trusted HTML. It does not authenticate rewritten HTML, a replacement worker, hosting accounts, a build dependency supply chain, or arbitrary hostile JavaScript. PR41's separate Explorer and EXP-01 are outside this combined tree. No physical-device, Safari, VoiceOver, universal update-failure, storage-exhaustion, qualified Gurbani, rights or print-copy acceptance is implied.

RB-02, ANG-01, EXP-01, ART-P01 and SIG-01's recall limitation retain their existing scope. PREV-01 is withdrawn and receives no patch. No source wording, teaching text, explanation, interpretation, source contract or private learning schema is changed.

The founder still decides on landing the independently reviewed reader repair and complete Knowledge chain. This candidate is branch-only. No source-main merge, QA-main change, preview staging or production deployment is authorized by its existence or test results.

## Build and check procedure (implementation detail; no results)

Install only the locked development tools:

```sh
npm ci --prefix tools/script-integrity --ignore-scripts --no-audit --no-fund
```

Ordinary verification does not refresh artifacts:

```sh
node tools/build-app-bundles.mjs --check
node tools/refresh-app-sri.mjs --check
node tools/refresh-reader-sri.mjs --check
```

After an explicitly reviewed input/policy change, generation order is:

```sh
node tools/build-app-bundles.mjs --write
node tools/refresh-app-sri.mjs --write
node tools/build-offline.mjs
```

The first two tools check by default. Their write options do not override frozen source hashes or expand permitted dependency graphs. The existing offline generator writes a reproducible manifest; verify the resulting worker diff. Synthetic in-memory overrides are available only through the build API for deliberate tests and are marked as fixtures in their returned graph; the production CLI accepts no override option.

## Reference correction — added 26 November 2026

The separate Explorer carrying EXP-01 is PR41 (`dc66da9f1e41e51408e47b7321ab5a414c44012b`), with `explore/app.js`. PR50 (`3af5ba739cd8bf5ab2d358d12704ad9e48452b1e`) is the Kabir source-intake work. Earlier builder references calling PR50 the Explorer were mistaken. The excluded artifact and technical scope are unchanged. This was checked against both pull requests on the server; it does not revise the frozen source baseline or imply either finding is closed.
