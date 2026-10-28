# Full Nitnem V9 — continuation and release handoff

**Date:** October 28, 2026
**Branch:** `feature/glp-nitnem-continuation-20261028`
**Status:** Locally verified private educational candidate. Browser acceptance and deployment receipt are pending. This document does not certify publication or a successful live deployment.

## Recovered baseline

The active Mac reader already contained the Anand opening batch in `course.v8.json`. The exact recovered V8 SHA-256 is:

`b2fefd5aa5a76e7d47fe21ceae72bf987b35c49f507de89f119f3cf87bc2e8c5`

V8 contains **422/1,361 source-record explanations and 104/327 Study lessons**, including Anand **202/208** explanations and **39/40** Study lessons. Its 33 opening explanations were recovered and preserved; they are not counted as new V9 work. Course versions V1–V8, their original manuscripts and the prior private snapshots remain available.

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

**Anand Pauri 24 remains withheld:** its six explanations and its Study lesson remain absent while the disputed source record awaits adjudication. No correction to that original text is inferred or silently applied.

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

These suites overlap and are not a count of distinct clinical, linguistic or device acceptance claims. The private worker also fixes its activation callback to call the supplied event’s `waitUntil`; the generator requires an explicit matching previous-worker SHA when advancing an existing worker.

**Browser QA is pending.** The managed local preview was served over HTTP and did not expose `crypto.subtle`, so the reader could not complete its required source-integrity initialization there. This limitation was not bypassed. No successful V9 browser, physical iPhone Safari, VoiceOver or real offline acceptance is claimed by this handoff.

## Mac deployment outline

1. Retain the current V8 snapshot, gateway launch configuration and complete prior extra-manifest. Create an additive candidate snapshot from that baseline; preserve all old routes and assets.
2. Build a new, empty `nitnem-learning-v9` directory with `tools/nitnem/build-full-nitnem-v9-reader.py --output <candidate-directory>`, then repeat with `--verify`. Extend the candidate extra-manifest with the 38 V9 asset hashes. The package route is `/nitnem-learning-v9/`; its cache namespace is `glp-nitnem-learning-v9-review:`.
3. Start `tests/serve-gated-nitnem-v9.py` against the candidate snapshot and manifest on a disposable loopback port. Reuse the existing private access configuration with owner-only file permissions. Keep invitation values and signing material outside source, commands recorded in receipts and logs.
4. Complete secure-context browser QA through the existing private HTTPS gateway or trusted loopback: check Read/Meaning/Study, Rehras context labels and reuse provenance, source text, Pauri 24 withholding, pace, saved learning, updates and offline behavior. Retain actual results rather than importing earlier-version browser claims.
5. When ready to switch, replace only the identified reader gateway process on its existing loopback port. Keep the existing tunnel and public Japji deployment intact. Record the deployed commit, immutable snapshot, manifest/package hashes and actual browser/deployment outcome in a separate release receipt.

The invitation remains a private bearer capability exchanged for a signed session; it is not named-user authentication. This handoff contains no invitation, credential or private hostname.

## Rollback and next work

For rollback, stop only the V9 reader gateway and restore `tests/serve-gated-anand-202-nitnem.py` with the retained exact V8 snapshot, previous extra-manifest and existing private access configuration. Restore the invitation destination to `/nitnem-anand-202/`. Preserve all browser notes, bookmarks, saved-learning keys, old caches, source files, public Japji assets and tunnel configuration. Do not overwrite an immutable snapshot or force-push history.

The next substantial content gap is **Jaap Sahib Chhands 16–199**: **720 source records and 184 Study lessons** remain. Anand Pauri 24 accounts for the other six records and one lesson. Continue with source-specific drafts and explicit uncertainties; Rehras’s complete record coverage does not remove its human review or finer-grained tuk-teaching needs.

**Deployment receipt:** to be completed separately after an actual switch and verification.
