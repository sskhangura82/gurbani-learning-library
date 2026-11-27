# Hosted-run corrections — builder evidence

The first hosted run on application candidate `69e24fe4adfccbd535de2b5f8ac0bab5ed720d94` failed. The original job logs and status are retained in `69e24fe-initial-failures/`; they are not replaced by later passes.

## Actual failures

1. The new delivery-contract job and Knowledge browser job stopped at `npm ci`: dependency records in the private lockfile were indexed under machine-specific paths, so clean installation correctly refused them.
2. The reader contract job stopped at the old service-worker assertion `93 !== 85`.
3. The Library contract job stopped at the old home-loader expectation for `library/app.mjs`.

The initial Knowledge source-contract job and three reader browser jobs completed successfully. The new browser-enforcement/update job was skipped because its required installation/contract job failed; no result is attributed to that skipped job.

## Repairs, without changing the delivered application

The lock was regenerated from the unchanged package manifest in a physical temporary path. A controlled experiment reproduced the npm alias behavior: a `/tmp` prefix produced file locators and noncanonical package keys; `/private/tmp` produced canonical keys. Both test directories lacked a shared parent installation, so shared Playwright dependencies are not necessary to cause the fault. All 28 registry package records retain the exact versions, URLs, integrity values and platform metadata. No dependency version was upgraded. A new built-in-only gate rejects corrupt or incomplete locks before installation. An empty clean source copy completed the exact installation command and reproduced all bundles and pins.

The service-worker test now independently enumerates the prior 85 URLs plus eight explicit additions, verifies actual source bytes and cached response bytes, and retains corrupted-install/activation controls. The cache mock now clones responses on storage/read, matching the behavior it models. An initial consumed-response failure and its correction are recorded rather than assigned to the application.

The home contract now verifies the actual closed bundle and its SHA-384 pin. The historical Pauri lesson digest remains unchanged: the test first verifies all five current script pins, then reverses only that exact tag transformation before comparing historical bytes. Navigation and reader behavior assertions remain. The separate practice contract requires all three executed bundles offline.

The two Kabir cache checks also contained the older 81 assumption. Their before failures are retained. They now verify required assets, URL/release-query sets and cached body hashes. The complete Kabir browser check went from 39 passing plus the single stale-count failure to all 40 passing. The Nitnem fixture gained the correct JavaScript MIME for `.mjs`; that fixture correction does not add a physical-device or homepage-acceptance claim.

## Verification and evidence

All 24 distinct pure-contract and syntax commands in the active Reader/Unified Library workflows passed locally after correction. The original application delivery fingerprint remains unchanged for all 152 files. Original reports written by historical tests are copied into the new correction evidence before the tracked earlier reports are restored.

- `69e24fe-initial-failures/`: original hosted logs, old lock, controlled alias experiment and clean-install proof.
- `69e24fe-service-worker-correction/`: expanded cache checks and mock correction.
- `corrections/r6-r7-20261127T031539Z/`: first revised home check reaching the historical Pauri tag mismatch.
- `corrections/contracts-after-20261127T031927Z/`: corrected local contract results.
- `corrections/kabir-before-20261127T031648Z/` and `corrections/kabir-after-20261127T031936Z/`: retained complete browser runs.
- `corrections/active-contract-gates-20261127T032028Z/`: all active pure contracts.

Hosted results on the follow-up commit must be read from that exact commit's runs. Local corrections and unchanged runtime bytes do not substitute for those runs. This report does not authorize merging, staging or release.
