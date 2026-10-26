# GLP-001 · Independent assessment of Claude's Market Review and Feature Blueprint v1
**Date:** October 25, 2026 · **Role:** independent technical/product/source-truth review · **Disposition:** accept the operating principles, correct evidence, implement narrowly scoped NOW packet without expanding religious authority.

## Executive decision

**Adopt the thesis but not the marketing absolutes.** The product should be a quiet, internally readable, source-aware place for Gurbani learning. We are building because it is useful to families and respects the teachings; market share is not the objective. The main differentiator is not that no other Sikh project teaches scripture: serious projects exist. The value is making original Gurmukhi, honest editorial provenance, thoughtful bilingual learning, and bounded private/offline technology work in one calm flow.

We should not add 50 features. Do the few things that make current learning trustworthy, finish authored lessons, and obtain independent Sikh/Punjabi/source and mobile accessibility acceptance. A hashed page means byte integrity, **not** textual accuracy or source entitlement. Current original-text source models still have real digital discrepancies, and 50 of 327 additional source units have drafted bilingual lessons with **zero qualified-review approvals**.

## Claim audit — research status and correction

| Claude claim | Independent finding | What we should say / do |
| --- | --- | --- |
| Mozilla flagged **29 of 32** mental-health and prayer apps (2022) | **CORRECT THE NUMBER**. Mozilla's official May 2022 report says **28 of 32** | Quote 28 of 32 with the year; the warning is a survey, not proof that every app in this category behaves identically |
| Median app retention at 30 days **3.3%**, 15 days **3.9%** | **SUPPORTED**, Baumel et al. JMIR 2019, observational panel of **93** Android mental-health apps | It is not a causal test of streaks or scripture-app retention. We choose no streaks on ethical/experience grounds, not because the paper proved they fail |
| Cyclic sighing trial showed better short-term mood than mindfulness | **SUPPORTED but bounded** by 2023 remote randomized trial, 108 enrolled; intervention and population specific | General optional relaxation ONLY, no respiratory disease treatment, breath-holding or hyperventilation prescribed by our app, no impersonation of Sikh Naam practice. Separate Sikh instructor review required |
| SimranLock sells mood-matched shabads, streaks and paid plans, quoted annual $49.99 | **FEATURES SUPPORTED** by the App Store description; price not invariant. Stores list multiple plans and different regional prices. Developer description says data stays on-device but its Apple privacy label declares some potentially linked data | Describe as product self-claims/labels as of observed locale, not verified behavior. Never assert a fixed global price or accuse the developer of actual privacy wrongdoing solely from these labels |
| All serious scripture resources except our model lack teaching | **UNSUPPORTED EXCLUSIVITY**. SikhRI, Shabad OS, Khalis/BaniDB, existing granthis and regional teachers have substantial work | Respect scholarship and provenance. Study integration is an opportunity; do not use “only serious” or “first” claims |
| No data collected | **INACCURATE AS AN ABSOLUTE**. Current source-mode JS stores reflections/bookmarks locally; the temporary Cloudflare proxy and browser hosting can process IP/User-Agent/timestamps. The Mac gateway suppresses app request logs | Say “no account, no in-app advertising/analytics SDK and no upload endpoint for reflections in this version”; explicitly state provider and external-link limits |
| 44px targets = WCAG 2.2 AA requirement | **CORRECTION**. WCAG 2.2 AA has a **24×24 CSS px minimum with exceptions**; 44px is a useful stricter design target. AA also includes 200% text resize and 4.5:1 normal-text contrast | State 44px as OUR design bar, not official AA minimum. No AA conformance claim before actual audit and physical VoiceOver checks |
| Professor Sahib Singh died in 1977; Darpan likely under Indian rights through 2037 | **LEGAL TERM RULE VERIFIED**, 60 years from calendar year after death for a typical work published in author's life. Biographical and edition-specific rights must separately be documented | Use cite-and-link, not copied text, until original work and specific publication rights are signed off. Assuming 1977 date, the general Indian term ends December 31, 2037 |
| Mahan Kosh and Faridkot Teeka can be bundled as public domain | **POSSIBLE BUT NOT AUTOMATIC**. Original author dates are relevant, but modern edition/transliteration, scanning, annotations and database rights can differ | Create a rights matrix per specific edition and jurisdiction. No automatically imported web teeka, modern translator, sound file or performance |
| SGPC has a daily official Hukamnama page | **VERIFIED** at `https://sgpc.net/hukamnama/`. The page is dynamic and search results sometimes expose previous days' text | Provide a **labeled outbound handoff only**. Do not scrape, embed, cache as today's verified Hukamnama or generate a random “personal Hukam” |
| Most Sikh apps disclose no accessibility | App Store labels often mark accessibility “developer has not indicated.” This is NOT evidence every such app is inaccessible | Benchmark features and actual VoiceOver results. Never claim GLP is the first accessible Sikh reader |
| No gamification anywhere | Current old `nitnem-today.html` fallback still has OPTIONAL date-scoped completion marks (historical private build), even though new integrated app has no streak mechanic | Be specific. For the current integrated version, no streaks/badges/paywall. Keep old preview unchanged for rollback; remove or redesign its completion marks only under a separate scoped work order |
| No AI inside reader | A reasonable policy **if “inside” means live chat/provider calls**. Our current source-anchored English/Punjabi Meaning drafts ARE AI-assisted at build time | Say no runtime chatbot or unreviewed on-click improvisation. Authored AI drafts are visibly labeled and still need human religious/linguistic review |
| Free forever already ruled | We have a **free private current release** and a strong mission preference, but an irrevocable founder/public price covenant is not substantiated by this blueprint alone | The draft states free today and no paywall; long-term legal promise remains a founder policy decision |
| Live stream rights and word-timed recitation | **HIGH-RISK / VALID CAUTION**. A source-linked recording's synchronization must be assessed against that exact master, offset, tempo and version. A broadcaster's public stream is not permission to relay it | Human consent and per-recording alignment, no hidden clips or synthetic santhiya. Add only after existing Listen gate is green |

### Evidence to retain (checked during this independent review)

1. [Mozilla Foundation 2022 mental-health/prayer app privacy review](https://www.mozillafoundation.org/en/research/library/top-mental-health-and-prayer-apps-fail-spectacularly-at-privacy-security/) — **28/32**, not 29.
2. [Baumel et al., JMIR 2019](https://www.jmir.org/2019/9/e14567/) — 93 apps and 3.9% / 3.3% median retention.
3. [Balban et al., Cell Reports Medicine 2023, full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC9873947/) — remote randomized breathwork study, no claim to cure a clinical condition.
4. [FTC final BetterHelp order 2023](https://www.ftc.gov/news-events/news/press-releases/2023/07/ftc-gives-final-approval-order-banning-betterhelp-sharing-sensitive-health-data-advertising) — documented allegations and settlement; reason for careful privacy claims.
5. [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) — actual AA standards, including resize, contrast and 24px target-size minimum/exceptions.
6. [Shabad OS database source policy](https://www.shabados.com/docs/database/sources/) — separate physical source provenance and digital representation.
7. [India Copyright Act, Section 22](https://copyright.gov.in/Copyright_Act_1957/chapter_v.html) — general lifetime+60 term, not conclusive rights for a specific scanned edition.
8. [SGPC official Hukamnama](https://sgpc.net/hukamnama/) — handoff only, page freshness not inferred by GLP.
9. [SimranLock Canadian App Store record](https://apps.apple.com/ca/app/simranlock-sikh-prayer-focus/id6761207518) — stated features, region-specific pricing, self-reported data/privacy categories, not an independently tested install.

## Decisions by phase — retain the existing product and its real bottlenecks

**NOW and tested in this packet** (trust and evidence only, no public merger): PL-1 privacy charter, PL-2 honest CURRENT free/no-ads statement with founder-reserved permanent policy, RD-11 source correction/questions register, RD-9 / PL-6 measured accessibility statement, RD-8 optional official Hukamnama handoff. These are **static, no-JS, local-first pages** inside the existing reader; all outbound links are optional and labeled.

**Immediately NEXT within the existing teaching mission:** write source-anchored distinct bilingual lessons for the next original units (Anand Pauri 8–20, Jaap Chhand 8 onward, remaining Chaupai and Rehras), develop a reviewed grammar/glossary on a short handful of words rather than importing a whole copyrighted teeka, implement local line-deep-links and a trackable independent lesson-review registry, then obtain qualified textual/linguistic review. The present 50/327 coverage is not a completed course. **Do not** substitute “features built” for finished learning depth.

**NEXT after current gate:** user-controlled vishraam and larivaar must rely on named santhiya-reviewed data; consented recordings with human-reviewed timing maps; Gurmukhi pronunciation and optional word help only with rights-checked lexicon and grammar. Do not let AI guess pronunciation from glyphs. Respect no-score learning; silent guide remains **unsynchronized**.

**REVIEW / FOUNDER reserved:** authentic Naam Simran human teacher, local-only general breath relaxation as a separate clearly labeled wellness option, copy/license of Faridkot/Mahan Kosh modern editions and any recordings, live broadcast/outbound institutional media rights, current calendar authority, public-domain/CC license choice for original editorial layers, family public release. A “free forever” policy belongs in this reserved set.

**LATER / keep out of present main lane:** psychology interventions, diagnosis/chat, emotion tracking, AI personal shabad matching, children’s assessment, public printable/sharing of private notes, broad local place/tour collections. The separate `ਮਨ` research should remain gated; do not distract the current text and learning goal.

## Institutional product design principles accepted

The design should have **one source of scripture bytes**, separately signed meaning and lesson layers, family-controlled local notes, source-related issue history, named editions/variants, and source/proof/reviewer identity on any material claim. The current private project is not a scripture authority: a human reviewer signs religious accuracy, human rights-holder signs reuse, and the founder reserves family/public deployment.

No streaks, badges, advertising, mental-health profiling, microphone/cloud voice checking, synthetic religious teachers, paywalled original Gurbani, unauthorized broadcast relays or unapproved machine-generated alternative translations.

The “NOW” trust pages live at `nitnem/trust/index.html` and `nitnem/trust/corrections.html` in this branch; both are ordinary local HTML, without external scripts, trackers or direct user-data storage. Official SGPC outbound Hukamnama appears **only as a clearly labeled, user-triggered optional action**, not a replacement for seven internally readable banis. The trust pages are **private release candidates**, not yet public policy or verified WCAG certification.

## Work packet acceptance and rollback

- Source: same frozen six digital original models, same root Japji original and local learning. No modifications to accepted `full-japji.html`, `sw.js`, any user note or Gurmukhi data file.
- Surface: one minimal footer link on the quiet seven-bani collection; legal/trust explanation never visually competes with scripture.
- Claims: conservative, testable privacy, price and accessibility wording; a visible, non-self-approved correction register with named OPEN questions.
- Security: 17 hash-allowlisted source/learning/trust assets in the new versioned `/nitnem-trust/` app, which cannot access other GitHub docs/test scripts. Separate cache prefix; old private paths and root Japji remain.
- Testing: static trust/source contract, real Mac Chrome phone-sized navigation, synthetic signed-cookie gateway defence and tamper checks, offline trust pages with network blocked; real iOS Safari/VoiceOver and founder public acceptance remain NOT RUN.
- Rollback: restore only prior gateway on port 8908 using `previews/full-nitnem-learning-20261025` and `full-nitnem-learning-extra-sha256.json`, not touching old cached data or unrelated services.
