# Full Nitnem V9 — continuation and release handoff

**Date:** October 28, 2026
**Branch:** `feature/glp-nitnem-continuation-20261028`
**Status:** Active private educational preview. Source, rendering, cache, access and authenticated HTTPS delivery checks passed. Browser walkthrough and physical-device acceptance remain unverified; qualified religious review remains pending.

## Recovered baseline

The active Mac reader already contained the Anand opening batch in `course.v8.json`. The exact recovered V8 SHA-256 is:

`b2fefd5aa5a76e7d47fe21ceae72bf987b35c49f507de89f119f3cf87bc2e8c5`

V8 contains **422/1,361 source-record explanations and 104/327 Study lessons**, including Anand **202/208** explanations and **39/40** Study lessons. Its 33 opening explanations were recovered and preserved; they are not counted as new V9 work. Course versions V1–V8, their original Gurmukhi source files and the prior private snapshots remain available.

## V9 coverage and accounting

`nitnem/learning/course.v9.json` provides **635/1,361 source-record explanations and 142/327 Study lessons** across the six additional banis. Original Japji teaching remains a separate preserved body of work.

| Addition to V8 | Source-record explanations | Study lessons |
| --- | ---: | ---: |
| Exact-source reuse in Rehras | 130 | 28 |
| Newly admitted Rehras passage contexts | 27 | 2 |
| Newly admitted Jaap Chhands 1–15 drafts | 56 | 8 |
| **Total increase** | **213** | **38** |

Reuse requires matching original text, source family and source hashes. Rehras keeps its own occurrence IDs, reading positions and provenance. These counts measure covered source occurrences, not the number of independently written translations.

| Bani | Explained source records | Study drafts |
| --- | ---: | ---: |
| Jaap Sahib | 62/782 | 15/199 |
| Tav-Prasad Savaiye | 40/40 | 10/10 |
| Benti Chaupai Sahib | 116/116 | 29/29 |
| Anand Sahib | 202/208 | 39/40 |
| Sodar Rehras Sahib | 159/159 | 44/44 |
| Kirtan Sohila | 56/56 | 5/5 |

Some Rehras records contain several original tuks. The 27 new explanations are therefore labelled **passage context** in the reader and detail view; they are not represented as individual literal translations of every internal tuk. Evening Pae Gahe Savaiya and Sagal Duar Dohira remain distinct from the morning Savaiye. SGGS and Dasam source boundaries remain explicit.

## Editorial custody and retained limits

V9 records **23 editorial amendment entries** with exact before/after objects, reasons and consulted source URLs: six Anand line entries, fourteen Jaap line/Study entries, and three Rehras record/Study entries. The compiler checks every expected previous value before applying a change. The full ledger is `course.v9.json` → `editorialAmendments`; source reuse evidence is retained separately in the same file.

The amendments clarify grammar and documented word senses. They also remove the unsupported lotus reading from the Rehras muddy-pool hymn and correct the Pae Gahe closing attribution. Original Gurmukhi, original source hashes and immutable prior course files are unchanged. Recovered V8 had no replacement-character corruption; no encoding repair is claimed.

**Anand Pauri 24 remains withheld:** its six explanations and its Study lesson remain absent while the disputed source record awaits correction and review. No correction to that original text is inferred or silently applied.

All explanations remain `DRAFT_AI_UNREVIEWED`, with **zero qualified reviewed lines or lessons**, no named reviewer and `publicationAllowed: false`. Mechanical checks and assistant editorial comparisons do not establish qualified Sikh/Punjabi review or source correctness. The existing Read, Meaning and Study structure, continuous reader, local learning and silent visual pace up to 200 remain the intended experience.

## Verification completed for this candidate

| Verification | Result |
| --- | --- |
| V9 source, coverage, reuse and amendment contract | 13 checks passed |
| Private worker lifecycle contract | 7 checks passed |
| Original reader/data regression | 27 checks passed |
| Shared learning regression | 12 checks passed |
| Original service-worker regression | 8 checks passed |
| Rehras source-reuse contract | 14 checks passed |
| Jaap early-draft contract | 12 checks passed |
| Private gateway synthetic contract | 388 checks passed |
| Separate V9 package | 38 assets built and hash-verified |

These suites overlap; their totals are not a count of independently reviewed religious or linguistic claims. The private worker also fixes its activation callback to call the supplied event’s `waitUntil`; the generator requires an explicit matching previous-worker SHA when advancing an existing worker.

**Browser QA was not completed.** The managed local preview was served over HTTP and did not expose `crypto.subtle`, so the reader could not complete its required source-integrity initialization there. This limitation was not bypassed. No successful V9 browser, physical iPhone Safari, VoiceOver or real offline acceptance is claimed by this handoff.

## Mac deployment outline

1. Retain the current V8 snapshot, gateway launch configuration and complete prior extra-manifest. Create an additive candidate snapshot from that baseline; preserve all old routes and assets.
2. Build a new, empty `nitnem-learning-v9` directory with `tools/nitnem/build-full-nitnem-v9-reader.py --output <candidate-directory>`, then repeat with `--verify`. Extend the candidate extra-manifest with the 38 V9 asset hashes. The package route is `/nitnem-learning-v9/`; its cache namespace is `glp-nitnem-learning-v9-review:`.
3. Start `tests/serve-gated-nitnem-v9.py` against the candidate snapshot and manifest on a disposable loopback port. Reuse the existing private access configuration with owner-only file permissions. Keep invitation values and signing material outside source, commands recorded in receipts and logs.
4. Attempt secure-context browser QA through the existing private HTTPS gateway or trusted loopback: check Read/Meaning/Study, Rehras context labels and reuse provenance, source text, Pauri 24 withholding, pace, saved learning, updates and offline behavior. Record any environment block explicitly; retain actual results rather than importing earlier-version browser claims.
5. When ready to switch, replace only the identified reader gateway process on its existing loopback port. Keep the existing tunnel and public Japji deployment intact. Record the deployed commit, immutable snapshot, manifest/package hashes and actual browser/deployment outcome in a separate release receipt.

The invitation remains a private bearer capability exchanged for a signed session; it is not named-user authentication. This handoff contains no invitation, credential or private hostname.

## Rollback and next work

For rollback, stop only the V9 reader gateway and restore `tests/serve-gated-anand-202-nitnem.py` with the retained exact V8 snapshot, previous extra-manifest and existing private access configuration. Restore the invitation destination to `/nitnem-anand-202/`. Preserve all browser notes, bookmarks, saved-learning keys, old caches, source files, public Japji assets and tunnel configuration. Do not overwrite an immutable snapshot or force-push history.

The next substantial content gap is **Jaap Sahib Chhands 16–199**: **720 source records and 184 Study lessons** remain. Anand Pauri 24 accounts for the other six records and one lesson. Continue with source-specific drafts and explicit uncertainties; Rehras’s complete record coverage does not remove its human review or finer-grained tuk-teaching needs.

## Private deployment receipt

At **2026-10-28 16:52 UTC**, source commit `a8b3d476a285497ca7b507779edac0dc92b02b66` became the active private reader at `/nitnem-learning-v9/index.html`. The existing invitation now redirects there. The existing authentication configuration, access duration, signed-cookie protections and tunnel remain in use. The public Japji deployment was not changed.

Before activation, all **359 historical snapshot files** were compared byte for byte, including the **326 prior extra routes** and **33 root-manifest assets**. All **364 extra routes** returned their exact expected bytes through the authenticated staging gateway. The live loopback gateway and the existing HTTPS tunnel then passed authenticated checks for the new index, reader, V9 course, scoped worker and retained V8 course. Anonymous requests still return 401; invitation exchange returns 303 with the intended V9 destination.

The prior snapshot remains available for rollback. Its original workspace and files were not overwritten.

**Visual verification limit:** the managed local preview uses HTTP, where this reader cannot perform its Web Crypto checks. The cloud browser returned a generic blocked message for the private HTTPS address. A completed browser walkthrough and physical-device/offline test are therefore not claimed. Source preservation, exact coverage, real learning-renderer behavior, service-worker lifecycle, private gateway behavior and authenticated delivery were verified by the recorded automated checks.

See `evidence/glp-nitnem-v9-validation.json` for the sanitized receipt and the independent contract/lifecycle JSON files beside it.

GitHub Actions run `40730009721` also completed successfully for deployed source commit `a8b3d476a285497ca7b507779edac0dc92b02b66` using the nondeploying V9 workflow.
