# Gurbani learning continuation — verification

Prepared 2026-11-27 (America/Los_Angeles). Browser report timestamps use UTC.

The runtime tested is `90b232c39742ef64d817f3273ee4a98218f89486`, based on PR #75's stable `68f47ffba4782271651716c71a97bc1825f96f48`. Subsequent evidence/documentation packaging must leave these application bytes unchanged. `runtime-digests.json` records every tracked application path and its SHA-256; `summary.json` records report and fixture digests, counts and limits.

## Results

| Suite | Retained evidence | Result |
| --- | --- | --- |
| Lesson, preservation, script integrity and existing access contracts | `integration-contracts.tap` | 50 passed |
| Complete original-source verification | `source-core.tap` | 16 checks passed; 155 chunks, 11,019 groups, 128,313 records |
| Service-worker simulation | `service-worker.json` | 9 passed |
| New learning UI | `../browser/90b232c/report.json` | 25 passed |
| Existing full-source reader | `../source-browser/90b232c/report.json` | 35 passed |
| Combined library navigation | `../navigation-browser/90b232c/results.json` | 10 passed |
| Actual service-worker update/offline | `../../library-script-integrity/offline/2026-11-28T00-34-17-105Z/report.json` | 7 passed |

Counts overlap. The offline run tested the same runtime: the run controller records commit `90b232c`, and the report's entire 121-asset candidate inventory is checked against that commit. The new learning fixture reports `sourceCommitMatchesAllReadFiles: true` for its 14 loaded public inputs. All source hashes retained by the three browser suites are independently checked when assembling this summary. Navigation provenance comes from the run controller and matching input hashes; its older report does not itself embed a commit or fixture hash.

The browser run uses actual Chrome 158.0.8127.37, Node 22.15.0 and macOS. It covers English and Punjabi at all three depths, exact original-row preservation and focus, unadmitted neighbors, route changes, malformed source and teaching, native SRI refusal, keyboard controls, narrow/large-text/dark views, script-free psychology, and synthetic storage preservation. The separate offline suite checks corrupt and missing updates, valid activation, prior saved-learning preservation and all three new psychology pages without network access. Original-text corpus chunks remain on demand and outside precaching.

Screenshots are retained alongside reports. Visual inspection covered selected viewports of the desktop study, narrow Punjabi study and psychology pages without JavaScript; it was not a complete-page visual audit. Narrow desktop widths and network emulation do not establish physical iPhone, Safari, VoiceOver or airplane-mode acceptance.

## Interpretation and review limits

These are builder engineering records. They do not certify religious meaning, research efficacy, independent printed collation or actual Claude review. All new editorial text remains an AI-assisted draft with Claude review pending. No actual owner PIN or personal reflections were used; browser contexts used synthetic data.

The acceptance criteria, source ledgers and focused review packet are in `docs/`. The independent change-scope fixture checks preservation from the stable parent. Exact-head GitHub CI is reported by the separate stacked draft PR's Checks. No production merge or deployment forms part of this evidence.
