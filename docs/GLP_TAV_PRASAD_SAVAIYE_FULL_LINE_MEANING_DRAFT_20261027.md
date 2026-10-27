# GLP-001 · Tav-Prasad Savaiye — complete 40-line bilingual teaching draft

**October 27, 2026 · Authoring candidate:** `feature/glp-savaiye-40-line-meanings-20261027` · **Status:** private working copy, editorial draft, **no qualified Sikh/Punjabi source approval**.

## What the founder asked us to continue

Make the **entire Full Nitnem** readable inside the existing Gurbani Learning Library with the accepted Japji Sahib learning format: exact unchanged original Gurmukhi; one directly attached, simple English/Punjabi meaning per authored line; tap for a deeper, clearly labeled Study of that source and its enclosing stanza; 200 top speed for the **silent visual guide**, never a claim of approved fast paath. Do not send users to external websites to read their Nitnem or silently invent verse interpretations.

## Completed in this work packet

**Tav-Prasad Savaiye (the ten morning Sravag Sudh Savaiye)** now has **40/40 stanza verse lines with English and Punjabi educational drafts**, of which **38 are new** and **two previous exact line notes remain unchanged** (`savaiye04.line01`, `savaiye09.line04`). These ten quatrains derive from the private source candidate for Akal Ustat and are kept separate from the different evening Savaiya in Rehras Sahib. The source package has **three additional preface/source-introduction records** which are displayed and SHA-checked but are not falsely counted as numbered verse lines. Those preface records still need editorial context, if the team elects to teach each.

The existing **10/10 complete deeper stanza draft lessons** and their focus, close reading, vocabulary, cautions and reflective questions remain unchanged. The two existing Savaiye notes, all **56 Sohila** original-source record meaning drafts, all existing **50 across-bani Study units**, and all prior `course.v1`/`course.v2` teaching packages remain byte-identical. The original digital-source text in `nitnem/data/` and the private Japji alias with its original **385 line meanings and 42 deeper Study lessons** also remain unchanged.

We authored the 38 new explanations only in `tools/nitnem/savaiye-line-drafts.mjs`, then compiled `nitnem/learning/course.v3.json` reproducibly from the **frozen source edition and original SHA for every occurrence ID**. This source package preserves the prior 13 digital transcription discrepancies for independent collation. It does not invent a canonical word-by-word Sanskrit/Braj gloss or publication rights. All 40 educational verse notes remain `DRAFT_AI_UNREVIEWED`, with zero qualified religious review approvals.

### Example of the teaching structure

Savaiya 9's concluding source line `savaiye09.line04` emphasizes prem. The direct inline simple meaning is short and bilingual; the **enclosing stanza's Study** discusses outward posture, pilgrimages and the importance of loving devotion. The app labels the latter as a passage-level interpretation, not a literal translation of a single line.

For Savaiya 10, outward religious forms are discussed with special care: **the source's vigorous critique of empty ritual remains represented**, but notes caution against ridiculing present-day believers or generalizing a stanza into contempt for another faith. Some terms (`savaiye06.line01`, `savaiye07.line04`, `savaiye09.line03`) need independent Braj and philological adjudication before a specialist can approve precise glosses.

### Coverage ledger — accurate, not inflated

| Bani | Original verse/source records | Authored English/Punjabi line notes | In-depth authored unit lessons | Qualified Sikh/Punjabi approval |
|---|---:|---:|---:|---:|
| Japji Sahib (accepted private alias) | 385 | 385 historical teaching meanings | 42 | Existing editorial process; not recertified by this packet |
| Kirtan Sohila | 56 | **56** | 5 | **0** new approvals |
| Tav-Prasad Savaiye | 40 | **40** | 10 | **0** new approvals |
| Jaap Sahib | 782 | 6 | 7 | 0 |
| Benti Chaupai (labeled 29-pauri variant) | 116 | 4 | 7 | 0 |
| Anand Sahib (full 40) | 208 | 3 | 7 | 0 |
| Sodar Rehras Sahib (mixed 6-section candidate) | 159 | 2 | 14 | 0 |
| **Additional six banis** | **1,361** | **111** | **50 / 327 units** | **0** |

Unwritten extra-bani line notes: **1,250**. Unwritten deeper passage/unit-level lessons: **277**. Source accuracy, correct editions and licensing must be established independently of mechanical source hashes. **Anand Pauri 24 (`anand24.line03`) stays visibly held**, not guessed or filled in. Ardas remains a separately reviewed companion prayer; the user-facing full Nitnem home still correctly distinguishes it from the seven authored bani choices.

## External reference checks

- **Sikh Rehat Maryada, Article IV**, identifies the morning Japu, Jaapu and ten Sawayyas beginning `Sarwag sudh`: <https://www.sikhmissionarysociety.org/sms/smspublications/rehatmaryada/chapter2.html>.
- **Sikh Research and Education Center / Gurmat**, Tav Parsad Sawayye, original Braj and translated reference for independent cross-check only: <https://srec.gurmat.info/srecarticles/sridasamgranthsahib/tavparsadsawayye.html>.
- **SikhNet, Seeking True Love**, discussion of prem in Savaiya 9: <https://sikhnet.com/news/seeking-true-love>.

These links were for **off-app editorial research**. The private reading UI contains no third-party scripture-reader links or imported translations; no external translation provider is called. The draft prose was authored for our own educational layer, not copied from a modern licensed teeka.

## Build architecture and safety

- **Compiler:** `tools/nitnem/build-learning-pack-v3.mjs` asserts 40 exact unique Savaiye occurrence IDs, all original source text and SHA intact, old 73 notes unchanged and **111** total. The v1/v2 files remain physically unchanged and the compiled v3 is immutable in this candidate branch.
- **Reader:** `nitnem/reader.js` selects exact hash-pinned `course.v3.json`, separating the educational layer from original Gurmukhi source data. All ten stanza deep lessons use the already Japji-matched Read / Meaning / Study layout. The three intro/source lines are not presented as fourteenth–sixteenth prose verse translations.
- **Offline:** a **new private origin path `/nitnem-savaiye/`** has an independently SHA-pinned 32-asset bundle and unique `glp-nitnem-savaiye-review:` service-worker cache. It does not delete the old `/nitnem-sohila/`, `/nitnem-parity/`, original root Japji or local saved-learning keys.
- **Authentication:** existing temporary owner-only signed invitation, Secure/HttpOnly/SameSite cookie and Cloudflare Quick Tunnel remain unchanged. New private gateway on Mac loopback port 8908 only, with a 151-entry additive manifest. No host, private token, personal reflection or signed cookie is committed to GitHub.
- **Rollback:** stop only `serve-gated-savaiye-nitnem.py` on private port 8908; restore `tests/serve-gated-sohila-nitnem.py` against immutable previous `previews/full-nitnem-sohila-56-20261025` and owner-only `full-nitnem-sohila-56-extra-sha256.json`. Do not modify public GitHub Pages, reset Tailscale, clear caches or rewrite the user's learning.
- **No unattended spending, AI religious chatbot, live stream relay, microphone, analytics or change to the canonical public root** is introduced.

## Testing and limits

- **14 deterministic V3 content/source integrity checks PASS:** the frozen 3 preface sources, 40 uniquely SHA-bound original lines, 38 net-new original bilingual drafts, old 73 notes and 50 Study lessons unchanged, honest counts and 0 human approval.
- **49 actual Mac Chrome local browser checks PASS:** exact order + original source SHA, in-app 40 Savaiye bilingual buttons, 10 Study units, final stanza nuanced interpretation, Sohila 56 preserved, Japji 385/42/200 preserved, offline with the network blocked.
- **51 actual owner-gated private HTTPS Mac Chrome checks PASS:** same secure signed owner invitation, same teaching/source verification, unchanged 200 pace, and genuinely offline Savaiye/Sohila/Japji on tested Mac browser.
- **175 synthetic private signed-gateway checks PASS:** 151 exact old/new hashes, intentionally altered `course.v3.json` must refuse startup, anonymous 401, invalid token 403, no unlisted private files or POST/write endpoint.
- Physical iPhone Safari/Home Screen, VoiceOver, and real device Airplane Mode checks remain **NOT RUN**. Those tests plus a qualified source/translation/santhiya reviewer are **mandatory before a family-publication claim**.

## Next content sequence

Preserve the same workflow: one frozen original, exact bilingual lines, linked deep unit lesson, independent editorial review, private browser tests and discrete rollback. Practical next batch: **Anand Sahib Pauris 8–20** or **Benti Chaupai Pauris 8–29** in contiguous source order, while maintaining the special Anand Pauri 24 source hold. Jaap Sahib's 776 currently unwritten line meanings require careful specialist Braj vocabulary work; never fabricate those for a progress percentage.

**This release is a privately usable educational manuscript, not a certified authoritative Gurbani interpretation.**
