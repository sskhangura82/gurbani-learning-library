# Next actual Claude review — PIN and complete source readers

This is a review request to paste into an actual Claude session. It is **not** a
review receipt, approval, or release instruction.

## Target and working boundaries

Repository: `sskhangura82/gurbani-learning-library`.
Associated [draft PR #75](https://github.com/sskhangura82/gurbani-learning-library/pull/75).
Review exact runtime **`c3a4cc027b48c246027b545d9120dfb72d7ebe6f`**; compare the new
increment with **`320537b0cc4aceb2e6007b32057a3c4a36c83520`**. Confirm the available
Git object and report its SHA; do not assume the mutable PR head is this target.
If subsequent browser fixes change runtime, the builder must update this target
and identify the new evidence before an exact-head verdict.

Perform the engineering/source-admission review and the historical source review
below as **two separate tasks and verdicts**. Return findings first. Do not merge,
deploy, activate a publisher, change source text, or manufacture review records.
Use an isolated checkout and synthetic browser/storage fixtures. Do not obtain
the owner's PIN, read private plaintext or personal browser state, or attempt to
unlock the owner's collection. Source hashes and sanitized receipts are enough
for this review; public test credentials are fixtures, not owner credentials.

Read [the owner's acceptance criteria](PIN_AND_COLLECTIONS_CRITERIA_20261127.md)
before builder result summaries. The owner selected a six-digit PIN and a
ChatGPT-prepares/actual-Claude-checks historical workflow. Do not reintroduce a
mandatory qualified-human gate from older handoff language.

## Task A — review the development candidate

### 1. PIN behavior and public/private boundaries

Review `private-library/app.mjs`, its HTML, `tools/private-library/seal.mjs`, and
the [PIN handoff](PRIVATE_LIBRARY_PIN_HANDOFF_20261127.md). The six ASCII digits
are a string: leading zeroes must survive. New sealing and the product form use
the PIN; any legacy passphrase support is decode compatibility only. Check
authenticated encryption, KDF parameters, random salt/nonce, strict schemas,
script integrity, generic failure, automatic locks and in-flight cancellation.
Private text must not enter persistent browser storage, URLs, telemetry, public
search or the public service-worker cache. Psychology and Sikh reading remain
open. The interface must accurately describe this owner-selected setting as
casual privacy: public ciphertext permits offline PIN guessing; encryption does
not create individual accounts, revocation or server-enforced retry limits.

Use the synthetic contract/browser fixtures. The owner collection receipt is
metadata, not authorization to inspect the secret or plaintext.

### 2. Original-text rights, edition identity and complete ordering

Inspect the [source notice](SHABADOS_ORIGINAL_SOURCE_NOTICE_20261127.md),
[collection handoff](SHABADOS_ORIGINAL_COLLECTIONS_HANDOFF_20261127.md),
`evidence/shabados-original-collections/`, and
`tools/build-shabados-original-collections.py`. Independently inspect the exact
`package/README.md` in the [5.0.0-next.0 npm archive](https://registry.npmjs.org/@shabados/database/-/database-5.0.0-next.0.tgz).
Verify the archive, database and README hashes from the ledger. The separate
original-text notice is the asserted reuse basis; the software MIT license is
not blanket permission for modern translations, commentary, scans or audio.
Keep any raw database outside Git: it contains excluded material too.

| Named source asset | Sections | Complete source groups | Original records | Reported pages | Chunks |
| --- | ---: | ---: | ---: | ---: | ---: |
| `SGGS` / `SSA2` | 51 | 5,549 | 60,555 | 1–1,430 | 75 |
| `SDGR` / `DGDG` | 17 | 5,470 | 67,758 | 1–1,428 | 80 |

These are records and groups of the named digital edition, not independently
established verse counts or manuscript completeness. SGGS uses the release's
Shabadaarth bibliography. Dasam has mixed composition-level bibliography; the
coarse `DGDG` reference does not make every composition one SGPC print edition.
`reportedGitHead` is unresolved registry metadata, not a verified Git object.

Check that only selected `primary` originals and identification metadata enter
`collections/source-data/`. Preserve Unicode, punctuation, headings, source IDs
and section/group/line order exactly; do not sort by page or silently repair
locators. Missing printed-line values stay `null`. Retain the fourteen page
decreases in Dasam `9QK`, the SGGS `G4W` printed-line anomaly, and source-reported
attributions, including Raagmala `ALAM` and the blanket Dasam `GGSN` label.
Extraction does not adjudicate authorship. The older OpenGranth research packet
must not be promoted by changing its eligibility flag.

### 3. Reader integrity, navigation and saved places

Review `collections/source-reader/{core,reader,source-lock}.mjs`, the closed
bundle, `collections/sggs/index.html`, `collections/dasam/read.html`, and the
[core contract](SIKH_SOURCE_READER_CORE_CONTRACT_20261127.md). Check the entire
chain: code-pinned manifest bytes, bounded chunk bytes, unit digests, complete
membership and order. Tampering, duplicate JSON keys, unknown fields, missing
lines or incorrect identity must refuse before any partial source renders.

Selecting a page must show **every owning group in full**, including adjacent
pages. Exercise `ZKH`, `SKD`, the 399-line `TNM`, final SGGS `FD3`, and 426-line
Dasam `4TJ`. Test page entry, previous/next, Back/Forward, reload and
`?page=…&unit=…&line=…`. A focused line must belong to both its unit and selected
reported page. Invalid routes refuse explicitly; Dasam labels must not become
SGGS Ang claims.

Saving is explicit and uses only
`glp001.sikh-source-place.v1:<collectionId>:<editionId>`. Resume requires the
verified unit, exact unit digest, actual line and page; reading and Resume leave
malformed/stale records unchanged. Exercise the `c3a4cc0` race repair: delay an evicted saved chunk,
save a newer place or navigate elsewhere, then resolve or reject the old Resume
request. It must neither navigate back nor clear the newer saved state. Check
320-pixel layout and same-origin closed-bundle delivery. Report actual browser
and device coverage; desktop emulation is not iPhone/Safari/VoiceOver evidence.

### 4. Preserve the existing application

Verify the original ten-reader catalog and existing Nitnem selections, source
packs, reader behavior and saved-learning bindings. New complete editions are
additional routes. Inspect `tests/helpers/source-reader-navigation-scope.mjs`
and its exact amendment record; previous Daily, Farid, Knowledge and Explore
scope proofs must remain enforceable. Check complete HTML/script inventory,
bundle pins and generated offline assets. The public Knowledge projection keeps
psychology open and excludes comparative-religion study content by its explicit
access policy; do not weaken that policy by merely repinning a pack.

## Focused verification

Run in a disposable checkout, record exact source and fixture hashes, and inspect
the diff afterwards: some existing fixtures regenerate integrity pins. A changed
checkout is not evidence that the starting runtime passed unchanged.

```sh
python3 tests/shabados-original-importer.py
node tests/sikh-source-reader-core.mjs
node tests/private-library-contract.mjs
node --test tests/library-script-integrity-inputs.mjs tests/library-script-integrity.mjs tests/library-catalog.mjs
node tests/source-reader-browser.mjs
node tests/private-library-browser.mjs
```

Use the browser fixture's documented executable/module environment overrides
where needed. If unavailable, report that check as not run. Do not treat earlier
green CI on `320537b` or builder reports from another runtime as a pass for this
target. Inspect retained failures before accepting later results.

## Task B — actual Claude semantic review of Kartarpur

Follow [the claim-by-claim source packet](history/KARTARPUR_CLAUDE_SOURCE_REVIEW_20261127.md)
and [two-reviewer policy](history/TWO_REVIEWER_POLICY_20261127.md), reading the
exact [draft](history/KARTARPUR_DRAFT_20261127.md) and underlying intake records.

- Draft binding: `bd4169a62517d75951d95a1da7be5234fa55bddb9a06a7ea0ccd46df260febe6`.
- Editorial packet: `0d663e0b8f772c8a35aeb4c6bfbfc64d54ce57a2225257df14cc695397d4680e`.

Independently inspect all ten claims, seven narrative paragraphs and three
editorial questions. Read the original Gurmukhi witness of Vaar 1, Pauri 38
(BaniDB shabad 40038, verse IDs 200334–200340), the two Encyclopaedia entries,
Macauliffe Volume I chapter XV at printed pages 180–181 and its footnote, and the
identified SikhRI paragraph. Exact URLs and locators are in the packet. Check
what each witness actually supports, source dependence, edition/manuscript
limits, inferred chronology and attributed versus established assertions.
Preserve the Aarti/Sohila wording difference; do not invent a timetable,
conversation, eyewitness status or precise date. A digital transcription is not
an authenticated early manuscript. Unreadable or changed source snapshots need
explicit incomplete findings or renewed bindings, not assumed support.

ChatGPT's ten qualified author assessments are the first review. The earlier
Claude authentication attempt performed **zero semantic reviews** and is only a
diagnostic receipt. Engineering tests, another GPT agent, or matching JSON
hashes cannot stand in for your actual source inspection. Produce a genuine
Claude review artifact only after doing that work, with claim and paragraph
assessments, exact source snapshots and verifiable provider/artifact provenance.
Do not fill a synthetic checker record into the real draft. Current readiness is
`WITHHELD` for `MISSING_CLAUDE_CHECKER_SOURCE_REVIEW`; no human review is claimed
or made mandatory. Changed prose or sources require a new exact review binding.

Useful checks are `node --test tests/history-registry.mjs tests/history-draft.mjs tests/history-editorial.mjs`
and `node tools/history/editorial-check.mjs`. The latter's current withheld
result is expected until a genuine supported second review exists.

## Daily reading and final report

Daily Hukamnama remains a separate publication path. Review the latest
[preparation](DAILY_AUTOMATIC_PREPARATION_HANDOFF_20261127.md) and
[test-publisher](DAILY_TEST_PUBLISHER_HANDOFF_20261127.md) contracts against code:
official dated original, Amritsar date, complete comparison, honest unavailable
states, preserved admitted bytes, signing and exact served-byte checks. Public
availability does not grant blanket reuse rights over modern explanation or
audio. Full source-only SGGS browsing does not supply reviewed explanations for
every daily passage. Preparation is not publication; configured schedule code
does not prove enabled variables, signing credentials or successful delivery.
Do not enable any of them during review. Use
`node --test tests/hukamnama-preparation.mjs tests/hukamnama-test-publisher.mjs`
for a focused check without live activation.

Return severity-ranked findings with path/line or source locator, reproducible
evidence, expected versus observed behavior, and a bounded proposed correction.
Then give separate engineering and historical verdicts, exact inspected SHA,
commands/results, source coverage and unresolved limits. Cite authentic sources
near historical conclusions. A clean finding list is not permission to merge or
release, and incomplete review must remain plainly identified.
