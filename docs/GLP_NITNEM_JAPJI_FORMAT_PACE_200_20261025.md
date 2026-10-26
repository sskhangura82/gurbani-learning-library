# GLP-001 · One Japji-consistent Nitnem reader · Pace 200
**Date:** October 25, 2026 · **Scope:** `feature/glp-japji-format-parity-pace-200-20261025` · **Status:** DRAFT private review only, original scripture and public family assets unchanged.

## Founder request and implementation

The founder noticed that the new other-bani **Meaning and deeper explanations looked different from Japji Sahib**, and asked for a faithful match plus **visual pace adjustable from 50 to 200** in both readers, without slowing work.

We audited the **actual accepted `full-japji.html` source**, its `css/japji-full.css` and `css/reader-serenity.css`, `js/japji-full.js`, `js/line-meanings.js`, and `js/japji-lessons.js`. The exact desired reading pattern is original Gurmukhi on top, 14px English/16px Punjabi short meaning **directly below the exact line**, tap to expand a modal with the Gurmukhi excerpt, and a deeper structured Study lesson, with a compact always-visible six-control bottom dock and non-dominant passage title.

The previous Full Nitnem integration showed larger passage-summary cards and different headings in a separate Learn mode. **This revision aligns the reader's visual and interaction structure to actual Japji—not by claiming more translations exist.**

### Exact behavioral agreement

- **Read:** continuous Gurmukhi, underlined active word, source wording unchanged, passage label subordinate to the scripture; One Passage fallback remains available.
- **Meaning:** where a **specific original line** has an authored bilingual note (20 selected source occurrences across six additional banis), it appears **immediately beneath the original line** as English 14px, Punjabi 16px and “Draft meaning · tap to explore,” with a real accessible button. Tapping opens the verified original Gurmukhi plus deeper meaning without losing place. Authored **passage-level summaries (50 across six banis)** are visibly marked “PASSAGE SUMMARY — NOT THE MEANING OF A SINGLE LINE” and cannot be mistaken for a literal line translation. No blanket per-verse content was invented.
- **Study:** same section order as Japji: **Passage meaning · summary, not word-for-word translation → Close sense → Place in this bani → Words & grammar → Pronunciation support → Interpretation & open questions → Practical reflection · application, not translation → Teach it back → Sources, passage anchors & review**. Both readers maintain explicit original/teaching boundary and draft labels. The newly adapted source lessons **do not yet contain reviewed Punjabi close-sense, morphology or santhiya**, so those missing aspects are visibly noted as pending rather than fabricated.
- **Controls:** the same calm six-target layout and labels **Read · Meaning · Study**, with source size 24–60px, default 30px, appropriate Gurmukhi locale tags and exact original line hashes; access to bookmarks/reflections remains source-edition specific. The attached trust/privacy/correction pages are unchanged except the truthful Gurmukhi size statement.
- **Guide pace:** range **50–200 in steps of five** in the new Nitnem reader and in the private, same-site copy of Japji. Both save 200 and restore it after browser reload. The new Nitnem import accepts the new 200 value rather than truncating at the old `continuous-core` 160 normalization. The guide is **silent** and **not synchronized to any recording**; faster visual pace is not a playback speed or approved fast recitation.

### Same origin, same original Japji (no second product)

`/nitnem-parity/index.html` remains the seven-choice collection. Its Japji entry now opens `/nitnem-parity/japji.html` **within the same library**. That HTML is a mechanistically generated copy of the accepted Japji reading shell with corrected same-origin relative scripts and the pace slider updated to 200. `tools/nitnem/build-japji-parity.py` copies:
- **byte-for-byte identical accepted Japji source text** `japji-full-data.js`, all existing `line-meanings.js` (385 short meanings), all 42 `japji-lessons.js` Study lessons, and untouched original CSS;
- source-identical runtime except the exact pace cap, settings cap and same-origin Pauri2 notebook path in its private `japji-full.js` clone, and exact 160→200 normalization in cloned `continuous-core.js` and `learning.js`;
- the **same canonical private learning key `glp001.continuous.v2`** (does not migrate/delete notes or bookmarks). No independent public Japji application or new scripture edition is authored.

The **existing public family** `/full-japji.html`, root `js/*`, canonical learning, and root `sw.js` remain completely unchanged and still have their earlier 160 pace cap. It is the **new private Full Nitnem library version** that offers 200 across seven banis. When approved through further gates, a future public root pace upgrade can be considered, but **not silently deployed**.

### Release custody and rollback

The previous private `/nitnem-trust/` reader and every older private route stay unchanged. The new private branch contains a reproducible `/nitnem-parity/` child app with **30 versioned assets** (including its own source- and lesson-frozen Japji alias and a private scope worker), **29 SHA-pinned precache entries**, and a dedicated `glp-nitnem-format-parity-review:` cache prefix. That prefix is different from the old `glp-nitnem-trust-review:`, `glp-nitnem-learning-review:`, `glp-nitnem-continuous-review:`, `glp-nitnem-source-review:` and accepted root Japji `glp-static:` caches.

Immutable owner-only Mac snapshot `~/Library/Application Support/GurbaniLearningLibrary/previews/full-nitnem-format-parity-r2-20261025`, with exact **88 previous/new file hash extensions** in owner-only `previews/serenity-invite-20261025/full-nitnem-parity-r2-extra-sha256.json`. The existing owner invitation redirects to this version on the same temporary Cloudflare HTTPS tunnel. The gateway runs only on loopback port 8908 behind that unchanged tunnel and serves each allowlisted original file only after a signed Secure/HttpOnly/SameSite cookie. No invitation/token/hostname or private notes appear in the repository.

**Rollback:** stop only the new `serve-gated-japji-format-nitnem.py` on port 8908 and restore prior `serve-gated-trust-nitnem.py` against original `previews/full-nitnem-trust-20261025` and `full-nitnem-trust-extra-sha256.json`. Keep the Cloudflare tunnel, public GitHub Pages, root Japji files, original six source packs, both versions' caches and all personal learning untouched. Do not reset Tailscale or change GitHub main.

### Mechanical evidence (not religious/editorial approval)

- **32 isolated Mac Chrome checks** for original Japji 385/42, 200 save/reload, Nitnem default 30px/6-control dock, accurate authored line Meaning and context modal, Study matching eight headings, Jaap unwritten hold, Anand Pauri24 quarantine, offline 385 Japji + 56 Sohila with network blocked, no outside calls or browser errors.
- **34 live Chrome checks on actual existing signed private HTTPS invitation**, also verifying secure/HttpOnly/SameSite cookie, 200 persisted, word/source rendering and offline after network disabled. The screenshot evidence `evidence/glp-format-gated-inline-meaning-390.png` and `evidence/glp-format-gated-deep-study-390.png` is screenshot-only with no user private notes.
- **111 synthetic signed-gateway defense tests:** 88 exact extension allowlist, deliberately tampered Japji UI JS hash refuses startup, forged cookie/anonymous requests rejected, old versions all still signed/allowlisted, no personal/engineering paths or POST allowed.
- **16 Japji format parity/source integrity contracts** plus existing six-original source, lesson and correction/privacy contracts. Frozen sources, 50 authored units/20 selective line meanings, **0 qualified scholar-reviewed new lessons** all preserved.

**Unfinished:** writing line-by-line meaningful Punjabi/English for the other 1,341 original source records not among the 20 selective notes; completing 277 more unit-level source-specific lesson drafts; independent source and interpretation review; correcting Anand Pauri 24 via a human-approved new edition; physical iPhone Safari, VoiceOver, actual airplane-mode acceptance; and founder-approved family public release. This is an actively usable **private review candidate**, not a certified completed Gutka.
