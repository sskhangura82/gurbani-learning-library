# Haumai learning mechanics — local candidate handoff

27 November 2026. Builder work only; independent review, qualified content review, founder approval and deployment are not claimed.

Branch: `feature/haumai-learning-journey-20261127`.
Baseline: `7f36c3039ca95fac6e69ca28f631b9e3734c70e9`.
Builder criteria were committed first in `7f62b07`.

## What changed

The existing Knowledge page now has Haumai reading/reflection and Saved Knowledge entrances. The journey resolves the existing complete Guru Angad Dev Ji Asa Di Vaar Salok through the already verified Knowledge index. Source and teaching files are unchanged; the Mahalla 9 Haumai article remains a different resource.

Qualified explanation and Gurbani practice guidance are visibly empty. The existing AI-assisted draft is optional, and its unresolved omission of the remedy clause is stated explicitly. No replacement exposition, practice prescription or new comparative claims were written. The existing comparison stays in a separate, optional, labelled panel.

A learner can save a question and first reflection, choose an optional return date, and revisit the earlier words beside a later reflection. The first question/reflection stays read-only after saving. Another first reflection gets a distinct identity. A return date is a personal reading intention, not a practice session or notification schedule. No score, streak, timer, activity log, account, network save or notification was added.

Routes inside the existing page:

- `knowledge/index.html#item=journey.haumai.v1`
- `knowledge/index.html#item=journey.haumai.v1&note=new`
- `knowledge/index.html#item=knowledge.saved`

Direct journey links focus the journey; opening a saved reflection focuses its editor. Existing Knowledge navigation and Back behavior are reused. The main library's planned/integration status is unchanged; admitting this entry there remains a separate integration/release decision.

## Private data and recovery

The new owner is `glp001.knowledge.learning.v1`, exported explicitly as `Knowledge-learning.json`. It neither reads nor changes other readers' notes. The store allows 100 records within 500,000 JSON UTF-16 units; questions allow 4,000 and each reflection 12,000 units. Limits refuse rather than truncate.

Every record binds a journey, edition, complete passage digest, lesson identity and revision. Historical unavailable bindings remain readable/exportable, but cannot move to the current source. Current source rejection still allows Saved recovery while withholding source and teaching.

Writes acquire the store's exclusive Web Lock, reread, validate and set one key once. Stale edits preserve both versions. Imports preserve explicit incoming identities before allocating conflict copies and recognize already imported versions. Repeated restoration is idempotent. Unknown fields, duplicate JSON keys/identities, invalid dates, oversized records, corrupted current storage, missing locks and quota refusal preserve existing data. Unsaved text remains in the editor after refusal, and an explicit plaintext download is available.

Private text is rendered as text, does not enter URLs or requests, and is excluded from print. Unsaved fields survive in-page navigation in memory; leaving the page requests the browser's unsaved-change prompt. Browser policies can limit such prompts, so no durable unsaved-autosave promise is made.

## Protection scope

The original Knowledge source, teaching, registry and source lock are byte-identical to the baseline. All existing reader and Daily application files are unchanged. Existing `knowledge/app.mjs`, `knowledge/index.html` and `knowledge/style.css` changes are pinned individually in `evidence/knowledge-journey/inputs/change-scope.json`; the inherited whole-application preservation check verifies those exact before/after bytes and continues checking everything else.

The closed Knowledge bundle adds three local modules: journey UI, private learning, and JSON syntax guard. The JSON guard is a byte-identical copy of the existing Daily guard, kept local because the bundling policy forbids cross-directory imports. Daily code was not altered and the bundler policy was not relaxed. All 52 script occurrences remain protected. The worker's logic and asset inventory remain unchanged; only its version and expected content hashes change.

The inherited script-integrity mutation fixture now copies the three new local modules, so its positive control contains the full reviewed candidate graph before mutations. It still rejects stale inputs, unpinned code, unexpected modules and extra HTML.

## Builder evidence

Synthetic data and fresh desktop Chrome contexts only. Current Mac runtime reported Node 26.0.0; hosted Node 22 validation is not claimed. No physical phone, Safari, VoiceOver, human participant or qualified Gurbani review occurred.

- `tests/knowledge-learning.mjs`: source/identity guards, initial-note protection, later updates, stale conflicts, exact import/export, repeated/conflicting restores, quota/format/aggregate refusal, missing locks, historical records and local calendar behavior.
- `tests/knowledge-journey-browser.mjs`: complete source; empty reviewed slots; optional draft/comparison labels; actual first/later save; reload/Back; real file controls; two-tab conflict; print privacy; 320/390/820/1440 widths; quota recovery; unavailable source recovery; missing locks; no network leakage.
- Existing Knowledge contract, source registry, editorial title/boundary, search and integration checks passed.
- Existing Knowledge pilot, editorial-boundary, search and integration browser checks passed.
- Complete script-integrity contracts, source-preservation, browser transport and offline checks passed.

Latest journey report and inspected phone-width screenshot:
`evidence/knowledge-journey/2026-11-27T13-11-12-452Z/`.

Raw combined unit/protection logs:
`evidence/knowledge-journey/regressions/`.

Independent original/teaching tests retained their old criteria. No test result constitutes independent review or approval.

## Failures retained and explained

The first browser harness attempted a second HTTP header write for a missing asset; the local test server was fixed to read bytes before sending headers. The next browser run observed the prior save confirmation while a new async save was pending. The UI now explicitly changes to a saving message; the failing report remains in `2026-11-27T13-08-49-356Z`, followed by passing reports.

The inherited whole-app freeze test initially rejected the intentional three Knowledge changes. Exact change-scope pins were added; source/reader protections were not removed. The inherited script mutation fixture omitted the new modules and therefore failed its positive control; the fixture's explicit file list was extended.

Existing search/offline browser tests initially requested an absent Playwright bundled browser. They were rerun using the installed Chrome executable through their supported `CHROMIUM_PATH` setting, without changing assertions. The offline environment failure and later passing record are retained in the corresponding timestamped evidence directories. Existing search screenshots overwritten by that test were copied into this candidate's regression evidence and their previous tracked bytes restored.

## Still incomplete

The existing Haumai explanation's remedy-clause omission and Punjabi coverage require qualified review. There is no approved Gurmat practice content. This is a usable learning-mechanics candidate, not a complete qualified learning journey. No main-branch change, push, PR, merge or deployment was performed by this workstream.
