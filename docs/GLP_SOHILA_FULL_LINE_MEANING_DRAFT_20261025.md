# GLP-001 · Kirtan Sohila — complete first English/Punjabi line-draft batch

**25 October 2026, Pacific · Candidate:** `feature/glp-sohila-56-line-meanings-20261025` · **Private beta ONLY** · Qualified religious and source-edition review: **PENDING**.

## Direction from the founder

Continue toward full Nitnem with the **same exact experience as Japji Sahib**: original untouched Gurmukhi, simple English and Punjabi meaning directly underneath each original line, tap that line to see deeper contextual Study, a compact six-target control dock and a silent visual guide adjustable from 50 to 200 in five-step increments. **Do not use external scripture-reading websites**, fabricate meanings on demand, or silently change editions. Existing verified private reader remains available throughout.

## Delivered in this version

- **The complete five-shabad Kirtan Sohila source candidate**, 56 original digital **source records**, has 56 separately written and **exact-occurrence SHA-256-bound educational notes**. Of these, **50 are plain-language devotional/scripture-line explanations** and **six explain five source headings plus the written invocation**. The headings must not be mistaken for lines of spiritual instruction. All 53 **new** drafts are original assistant-authored English/Punjabi teaching prose; 3 previously authored records are preserved **byte-for-byte within the v2 compiled source**. None is an authorized literal translation or santhiya pronunciation.
- The **existing five deep Sohila shabad lessons**, with central idea, bilingual passage summaries, vocabulary, close English reading, interpretation cautions, reflection and teach-back, remain attached to their source unit IDs. The **Japji Sahib Study heading and line-meaning format** is reused, with new notes appearing directly below the source lines and “Draft meaning · tap to explore.” The exact original line and its longer enclosing Study lesson open in the same safe focus-restoring modal. We have NOT pretended that the deeper Punjabi close-sense or word-by-word grammar for every verse has been authored.
- The candidate course is **`nitnem/learning/course.v2.json`**, compiled deterministically from the frozen original `nitnem/data/sohila.json` and `tools/nitnem/sohila-line-drafts.mjs`. Previous **`course.v1.json` is untouched**; qualified lesson reviews remain zero. Every source occurrence ID and exact original UTF-8 line SHA is compared before admitting the new prose. No copy of a published translation or teeka is bundled.
- **The additional six-bani learning baseline is now 73 of 1,361 source-record notes**, formerly 20. Other than Sohila, all counts and texts stay unchanged: Jaap 6/782, Savaiye 2/40, Chaupai 4/116, Anand 3/208, Rehras 2/159. The pre-existing **50 of 327 unit-level Study drafts** are unchanged; 277 additional unit lessons remain unwritten. No human reviewer has endorsed the 73 notes.
- **Reader unchanged in purpose:** the seven-bani choice including the private existing Japji 385 meanings and 42 Study lessons stays inside the same GLP library. Up to 200 is still a **silent visual guide setting, not faster recitation/audio**; previous source-bound notes, local reading position, bookmark keys and reflection storage stay intact.
- Anand Sahib Pauri24 `anand24.line03` is still quarantined and not translated or passed as a complete approved source. Explicit named Chaupai and Rehras variants, Dasam attribution and original upstream issue register persist.

## Actual original / research trace

`nitnem/data/sohila.json` remains byte-for-byte identical to the prior source commit `373ccc34f4a1c0ccb6ce36654bf6e9574087200f`. We used the existing original source occurrence IDs and the five enclosing shabad contexts.

Interpretive checkpoints consulted as **research only**, not texts copied:
- <https://gurugranthsahib.io/bani/Sohila> — SikhRI Guru Granth Sahib Project: five Sohila shabads on Ang 12–13, Sikh provenance and source context.
- <https://www.gurugranthdarpan.net/0012.html> — Professor Sahib Singh, *Sri Guru Granth Darpan*, Ang 12: the wedding metaphor, invitation, devotees, six philosophical schools and one sun/seasons.
- <https://www.gurugranthdarpan.net/0013.html> — Punjabi source for cosmic aarti, grace, haumai and service/departure imagery.
- <https://sikhri.org/inspiration/a-call-to-inner-bliss-will-you-answer> — an unrelated Anand teaching source already used in the broader course, NOT used to substitute a Sohila gloss.

The 20th-century Darpan is **cited, not copied**. Our short original explanatory sentences still need independent religious-linguistic checking, especially inflections and Sahaj / Naam / metaphor explanations. An original-source digital transcription being hashed does **not** by itself establish textual or theological accuracy.

## Evidence

- **14 deterministic v2 manuscript integrity checks PASS:** exactly 53 new Sohila line notes, original 3 preserved; every one of 56 occurrences has its own bilingual draft and SHA; six headings/invocation identified; the 50 spiritual lines never represented as a certified translation; old 20/50 baseline preserved; Anand hold unaltered; zero scholar approval.
- **38 real Mac Chrome local checks PASS**: 56 exact Gurmukhi rows in continuous order, 56 aligned bilingual inline meaning buttons, shabad-four newly authored example with exact original popup and deeper lesson, matching 14/16px Japji typography, safe six-target dock, saved 200 pace, other banis unchanged and full Sohila + Japji available with network blocked.
- **40 real Mac Chrome private HTTPS checks PASS** on the original signed invitation. Private host and token are automatically redacted from evidence. The source text was not fetched from any third-party site. **Native iPhone Safari/VoiceOver/real physical airplane-mode remains NOT RUN**.
- **143 synthetic signed-gateway security checks PASS** with a test tampering with the exact `course.v2.json` source digest to demonstrate fail-closed server startup. The 119 prior/new source and teaching extensions are hash-pinned. Anonymous source and learning refused, invalid invite and cookies refused, no private source scripts or POST.
- Remaining code protections: original public Japji HTML/JS/source/worker stay unchanged; no unapproved merge to main or public family publication.

## New private release and rollback

New immutable snapshot: `~/Library/Application Support/GurbaniLearningLibrary/previews/full-nitnem-sohila-56-20261025`, with the new versioned route `/nitnem-sohila/`, its own `glp-nitnem-sohila-review:` offline cache prefix and exact **31** new source/learning/Japji/policy files. The existing owner-only signed invitation, Secure/HttpOnly/SameSite cookie and unchanged Cloudflare Quick Tunnel now redirect to this new route. The approved-root public site and its root service worker remain untouched. Prior `/nitnem-parity/`, `/nitnem-trust/`, `/nitnem-learning/`, `/nitnem-continuous/`, `/nitnem/`, and root `/full-japji.html` remain available.

**Rollback:** stop only the new private gateway on Mac loopback port 8908, restart the previous `tests/serve-gated-japji-format-nitnem.py` using immutable `previews/full-nitnem-format-parity-r2-20261025` and owner-only `full-nitnem-parity-r2-extra-sha256.json`. Never reset Tailscale, kill the working Cloudflare tunnel, remove user browser storage, alter upstream source text or overwrite the prior snapshots.

## Next passage work

Sohila is the first **complete 56-source-record teaching draft** in this format but is **not** religiously approved. Continue with the 38 **remaining line meanings in Tav-Prasad Savaiye**, then a controlled contiguous batch of **Anand Pauris 8–20** with source-specific bilingual full-unit deep lessons, while pursuing a qualified Sikh/Punjabi/editorial reviewer. Do not mark the app's entire full Nitnem course complete while other source records or deeper lesson text are still unwritten.
