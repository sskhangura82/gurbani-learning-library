# Builder evidence — read only after independent findings

Date: 26 November 2026 (America/Los_Angeles). This is builder verification, not independent review, qualified content approval or permission to merge/deploy.

## What changed

The candidate retains the reader reliability base and imports the complete reviewed Knowledge additive unit. It then extends subresource integrity from the 36 reader occurrences to all 51 script occurrences across 14 production HTML pages. The additional 15 occurrences are 11 classic scripts and four module loaders. Eight nonreader HTML pages change only in their script-loading tags.

Library, Articles and Knowledge now each execute a deterministic same-directory bundle. Their 12 original source modules remain byte-identical. The frozen graph policy fixes every source digest and dependency edge. Acorn parses input and output; esbuild produces one output per app with no remaining imports, external dependencies, chunks, warnings, source maps or host-specific paths. Compiler and parser versions are exact and locked in a development-only package.

The existing five reader HTML pages and reader pin helper stay byte-identical. All original application bytes are frozen except the enumerated nonreader loader tags and generated worker manifest. The current delivery fingerprint covers 152 files. The Knowledge import provenance accounts for all 86 additive paths, including earlier review evidence; prior evidence is retained rather than overwritten by new runs.

## Local desktop evidence

Actual browser: installed Google Chrome 158.0.8127.37 on macOS, executable `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`; Node v22.15.0. All browser contexts are fresh and nonpersistent; learning data is synthetic.

- Transport/graph suite: Library, Article index, complete Haumai source sheet and Knowledge run under `/preview/` while all original-module and unexpected chunk URLs are denied. They request no such module paths. Dependency-origin changes in each of the three bundles are blocked under the unchanged HTML pin; the exact same altered bytes execute under explicit fixture repins. Ten scenarios pass.
- Existing Knowledge suites: pilot 17, editorial boundary 15 and integrated 8 checks pass. Their re-pinned semantic fixtures reach source/teaching verification. Browser SRI refusal is explicitly excluded as a substitute for semantic rejection; permitted-edit controls remain.
- Actual worker update suite: the previous e0a6cff release is installed and all 85 cached response URLs and bytes verified. A corrupt candidate Knowledge bundle and a missing candidate bundle each make the attempted worker redundant. The previous controller, every old cached response and synthetic learning remain intact; old Japji HTML is available with networking disabled. A valid 93-asset candidate waits for explicit activation, then serves Library, both Knowledge URLs and both complete article sheets offline. Six scenarios pass.
- Existing Article browser suite: 25 checks pass. Existing practice offline suite: five pass. New PDF files are generated, but not newly extraction-validated or visually approved; ART-P01 remains open.
- Reproduction checks pass for all bundles, metadata and pins. Independent expected-script inventories, malformed/missing/extra/reordered/inline/async loaders, wrong pins, changed source, unexpected dependency edges, executable output imports and extra HTML are exercised. A copied fixture passes before mutation; check mode does not silently rewrite it. Reader pin tests still pass.
- Original Knowledge contracts, source-registry, editorial-title, editorial-boundary, search and integration checks pass, along with Library catalog and Article source tests. These exercise original modules; browser suites separately exercise bundled delivery.

## Evidence locations

- `inputs/knowledge-import.json`: complete unit provenance.
- `inputs/delivery-manifest.json`: exact delivered bytes.
- `contracts/20261127T030155Z/`: original source-module regressions.
- `contracts/20261127T030251Z/`: initial build/pin/static/reader checks.
- `contracts/20261127T030436Z/`: stronger copied-fixture positive control and no-write pin checks.
- `browser/2026-11-27T03-02-39-763Z-module-transport/`.
- `browser/2026-11-27T03-02-48-414Z-knowledge-integration/`.
- `browser/2026-11-27T03-02-52-884Z-knowledge-editorial-boundary/`.
- `browser/2026-11-27T03-02-58-220Z-knowledge-pilot/`.
- `offline/2026-11-27T03-03-10-203Z/`: real worker update/preservation.
- `offline/rechecks-2026-11-27T03-03-49-444651+00-00/`: only the actual new Article/practice outputs, listed in its artifact manifest.

These local results were produced on the candidate working tree before the implementation commit; the frozen input commit is not presented as the tested application commit. The delivery manifest binds those runtime artifacts to their committed bytes. Hosted results on the exact candidate commit will be recorded separately rather than inferred.

## Harness corrections and observed limitations

The old Article and practice checks assumed 81 cached entries. They now check the complete expected URL/release-query/body-hash set and actual on-disk bytes, with required-asset assertions. The new update suite independently requires the complete prior 85 entries plus eight explicit additions, so removing a manifest asset does not satisfy it.

A probe of unchanged e0a6cff reproduced a practice test-server MIME omission for `.mjs` and selectors from the older homepage. The harness now serves JavaScript correctly and checks the current equivalent Today elements. The Article offline navigation follows the current Explore entrance. The baseline probe and an initial launch-directory error are retained; the launch error ran no test and is not called an application failure.

At 390 CSS pixels, the Library's Clear search button wraps the word in two parts. That inherited layout issue is recorded in the screenshot and browser notes, not fixed by this transport-only candidate. Chrome also reports the existing unsupported `frame-ancestors` meta directive; it is not counted as an enforced framing policy. No uncaught page errors occurred in the graph suite.

Newly copied old print/visual verdicts were removed from this run's evidence; its artifact manifest explicitly distinguishes new generated PDFs from unperformed extraction/visual approval. Original evidence files were restored exactly from the frozen baseline.

## Limits and release state

Trusted HTML remains the root of the SRI claim. Worker authenticity, rewritten HTML, hosting-account compromise, arbitrary malicious JavaScript, all possible storage/update failures and build-tool supply-chain compromise are not closed by this patch. PR41 Explorer is not in this candidate. The missing qualified reviewers, physical-device acceptance, source collation and rights decisions remain. No scripture, teaching, private learning schema or original module was altered.

Nothing in these results authorizes merging or staging. Source main and QA main remain unchanged. Independent review follows fresh frozen criteria, then the founder decides.

## Reference correction — added 26 November 2026

The separate Explorer carrying EXP-01 is PR41 (`dc66da9f1e41e51408e47b7321ab5a414c44012b`), with `explore/app.js`. PR50 (`3af5ba739cd8bf5ab2d358d12704ad9e48452b1e`) is the Kabir source-intake work. Earlier builder references calling PR50 the Explorer were mistaken. The excluded artifact and technical scope are unchanged. This was checked against both pull requests on the server; it does not revise the frozen source baseline or imply either finding is closed.
