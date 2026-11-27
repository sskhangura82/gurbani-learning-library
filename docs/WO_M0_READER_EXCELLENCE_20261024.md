# GLP-001 Work Order — M0 Japji Reader Excellence

**2026-10-24 · Work implementation packet · Design/engineering only.** This is a Work order recorded in the existing coordination PR because GitHub Issues are disabled in the repository. It does not approve production deployment, source modifications, consent, provider actions or spending.

**Source of truth:** https://github.com/sskhangura82/gurbani-learning-library
**Accepted family reader:** https://sskhangura82.github.io/gurbani-learning-library/
**Canonical R7 production runtime:** 57d0acdf43b6f4935e159468128ec9a503b5aaa1, release tag japji-v1-0.9-r7; latest accepted main documentation commit at authoring: 254f3871b785b756208379138dcc17472a3733ff. **Check main again when Work begins.**

## Main problem

Claude reviewed PR #9 and #10 CONDITIONAL PASS with repairs now submitted on their respective review branches. **M0 is the next user-visible engineering task.** The Japji reader is powerful but retains crowded controls and has not passed real iPhone/Safari acceptance. Make the experience almost entirely about the Gurbani—not an accumulation of feature panels.

## Exact build scope

1. One original continuous Japji document: preserve the exact 385 Gurmukhi occurrences, 385 original English/Punjabi short meaning drafts, 42 Study drafts, source hashes, local reflections and Web Locks. Never edit canonical scripture as a UI repair.
2. A genuinely compact, accessible reading dock targeting **≤56 CSS px excluding iOS safe area** with Play/Pause, current pauri, three depth choices and one expanded-menu affordance. Keep controls discoverable, 44px tappable, labeled for VoiceOver and focus-visible. An optional receding state must offer an accessible keep-controls-visible preference.
3. Simplify the Reading popup into short grouped actions rather than ten stacked rows. The grouped-menu experiment in **draft PR #7** may be reused selectively, but **do not merge YouTube playback/search/player changes** as part of M0. That is a separate rights/physical-iPhone acceptance lane.
4. No decorative box/card around Gurmukhi. Meaning appears directly beneath its matching tuk and expands into richer Study without shifting the reading place. Approximate spacing guidance: 8–10px within pauri and 36–40px between pauris; maintain full matra clearance under larger scripture sizes.
5. Read and Understand visual guide continues across all Pauris without artificial new-page boundaries. Radiance stays warm and optional. Visual pace remains 50–160 illustrative tokens/min and plainly **unsynchronized** with external recordings.
6. Retain optional Gurdwara/Simran room navigation and the calm R7 home without redesigning them. Do not build another application or repository.

## Acceptance certificate

- Full existing portable checks, source hashes, learning locks and exact 385/385/42 coverage unchanged.
- 320px/390px viewport screens, normal plus up to **200% text**, Day and Amrit Vela, Read/Understand/Study, immersive mode; measured dock and section spacing, zero matra clipping/focus occlusion.
- Real versioned R7→M0→R7 rollback→M0 upgrade in isolated Chrome with synthetic bookmarks and notes. No user data used in tests.
- **Actual iPhone** Safari/standalone Home Screen, VoiceOver, large text, reduced motion and actual airplane mode, using the complete test checklist in **PR #10**, are required for an unqualified acceptance claim. If the hardware cannot be used from Work, mark all as **NOT RUN**; do not fabricate device results.
- Independent Claude **PASS / CONDITIONAL PASS / FAIL** on iPhone screenshots or clearly labeled browser approximations, Darbar Standard and restoration of reading position.
- Pauri 13 line 1 independent comparison remains OPEN; no silent source correction.
- Retain previous R7 runtime and worker pin for rollback. No private notes, source voice, credentials or images added to public GitHub.

## Handoff and release boundary

Work implements from latest verified main in **one focused candidate PR** (do not force-push or take Work from a stale R8 branch). Work returns source diff, screenshot names, test counts, exact unchanged source hashes, limitations and rollback plan. Claude reviews meaningful complete candidates once, with named fixes. The founder retains release/rights authority; do not deploy or merge blocked candidates by assuming Claude's design endorsement is a religious approval.

**Parallel separate lanes:** PR #9 is manuscript correction/qualified-review pending; PR #10 is synthetic timing study and actual iPhone checklist; PR #7 is consented YouTube player research. None should be merged into M0 simply because it exists. J-1 recording selection and permission remain pending; no audio ingest or outside outreach.

**Next output:** the actual R0→M0 reading-excellence candidate, not another planning memo.
