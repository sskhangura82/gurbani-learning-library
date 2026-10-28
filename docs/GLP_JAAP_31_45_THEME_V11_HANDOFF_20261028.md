# Full Nitnem V11 — Jaap Chhands 31–45 and shared appearance

**Date:** October 28, 2026
**Source branch:** `feature/glp-jaap-31-45-theme-20261028`
**Status:** Validated educational draft candidate. Local release checks and immutable package verification passed. Private activation is pending; browser observations cover the stated surfaces only.

## Content and coverage

V11 adds **60 English/Punjabi line explanations and 15 deeper Study lessons** for Jaap Sahib Chhands 31–45. The candidate course is `nitnem/learning/course.v11.json`; its recorded coverage is:

| Coverage | V10 | V11 candidate |
| --- | ---: | ---: |
| Jaap explained source records | 122/782 | **182/782** |
| Jaap Study drafts | 30/199 | **45/199** |
| Six additional banis: explained source records | 695/1,361 | **755/1,361** |
| Six additional banis: Study drafts | 157/327 | **172/327** |

All additions are newly authored Jaap material. Overall counts remain source-occurrence counts, including existing aggregated Rehras records; they are not claims of literal translation of every internal tuk. Original Japji teaching remains separately preserved.

The content contract verified exact retention of **695 previous explanation objects and 157 previous Study objects**, immutable course versions V1–V10, and unchanged original Gurmukhi files and hashes. All twelve content and preservation checks passed.

**Anand Pauri 24 remains withheld:** six explanations and one Study lesson await resolution of its disputed source text. All teaching remains `DRAFT_AI_UNREVIEWED`; qualified reviewed coverage is zero and publication approval remains false.

## Source evidence and interpretive care

Research is recorded in `tools/nitnem/jaap-chhands31-37-research.json`, `jaap-chhands38-45-research.json` and the shared `jaap-chhands31-45-source-notes.mjs`. The combined assistant review is `evidence/glp-jaap-31-45-source-review.json`.

These records distinguish directly inspected Punjabi commentary, historical dictionary entries and modern secondary renderings. Difficult senses remain provisional, including **ਅਧੇ**, **ਅਭੇ**, **ਅਜਾਦਿ** and **ਅਭਰਨ**. The repeated **ਅਭੂਤ** line in Chhands 34 and 40 uses the same main bilingual explanation. Frozen spelling and verb-form comparison flags remain open; neither an assistant review nor matching digital witnesses constitutes authoritative textual adjudication.

## Shared Light and Dark controls

An always-visible sticky header now provides labelled **Light** and **Dark** buttons across the collection and all **seven readers**, including embedded Japji. The header remains available during Japji’s quiet reading state. Buttons expose their selected state and retain visible keyboard focus. Existing appearance choices in the reading menus stay synchronized with the header.

One preference belongs to the browser origin, shared across these pages. Before a saved choice exists, appearance follows the operating-system preference. An internal system marker prevents an automatically saved effective theme from becoming a false explicit choice on a later visit. An existing reader preference can migrate once when there is no shared choice; another bani or an older learning import cannot subsequently replace that shared choice. A deliberate selection survives reload and cross-page navigation. Same-origin storage events synchronize open views. This is local browser persistence, not an account-wide or cross-device setting. Shared appearance transfer through a Japji learning export is not claimed; its legacy exported theme field can remain older than the shared preference.

The shared controller applies the saved choice in the document head. Appearance event handlers update display state without writing notes, bookmarks or reading position. The preference’s storage is separate from learning records. Reader offsets account for the measured sticky-header height so navigation targets remain visible beneath it.

## Browser observations and remaining limits

Current browser QA used **cloud Chrome over HTTP**, covering the collection and embedded Japji. Light/Dark selection, reload persistence, cross-page behavior and storage-event synchronization were exercised. Menu synchronization and the no-learning-write paths were checked by executing the shipped handlers in the programmatic appearance suite. Native **Tab and Return** interaction remained stable after the keyboard-scroll correction.

Narrow-layout checks used iframes with outer widths of **390 and 320 pixels**. Their actual content widths were **375 and 305 pixels**, respectively, because the environment reserved 15 pixels for a scrollbar. The labelled controls were 44 pixels tall and no horizontal overflow was observed. These are browser layout approximations, not physical-phone results.

Keyboard focus initially exposed a jump associated with root scroll padding. The correction removes that root padding and reserves header clearance through scroll margins on reading targets. This keeps the sticky controls reachable without making header focus send the reader back to the page top.

The six additional bani readers could not complete their browser source-integrity initialization in this HTTP environment because `crypto.subtle` was absent. Six-bani source checks and new Jaap renderer checks are a separate form of evidence and must not be described as completed browser walkthroughs. Physical iPhone, Safari, VoiceOver and real offline behavior remain unverified.

## Release verification — local checks passed

The final local receipts record the following passing checks. GitHub and actual private delivery will be recorded separately after synchronization and activation.

| Gate | Verified count | Status |
| --- | ---: | --- |
| V11 content and preservation contract | 12 | **PASS** |
| Shared appearance contract | 14 | **PASS** |
| Private worker lifecycle | 7 | **PASS** |
| Original reader/data regression | 27 | **PASS** |
| Shared learning regression | 12 | **PASS** |
| Original service-worker regression | 8 | **PASS** |
| Synthetic private gateway contract | 471 | **PASS** |
| Separate V11 package and hash verification | 42 assets | **PASS** |

These suites overlap. None establishes qualified religious review or physical-device acceptance.

## Private deployment receipt — pending

The intended versioned route is `/nitnem-learning-v11/`. The update preserves the existing private authentication configuration and tunnel. Activation, authenticated delivery and rollback evidence must be recorded after the actual deployment.

- **Final source commit:** PENDING
- **Final course SHA-256:** `dde70081af4576620da500b712a7c8eb1c5c4ea1e35753b7ccdfb0a0bc755d69`
- **Package verification receipt:** 42 assets, `glp-nitnem-learning-v11-review:` namespace, versioned worker SHA-256 `f919b6f5c7edc3ae1d363fb47bd7b514c51a2bae2ce8dd8e9ca39b557cd0f7f0`.
- **Deployment time and authenticated delivery result:** PENDING
- **Sanitized deployment/rollback evidence:** PENDING

This document contains no credentials, private hostnames or remote process identifiers. Remaining Jaap coverage after this candidate is **600 source records and 154 Study lessons**; Anand’s held section adds six records and one lesson. The next contiguous content batch is Jaap Chhands 46–60.
