# GLP-001 — Claude Four-Point Review: Decision Ledger
Date 2026-10-23. Founder approved the direction and requested a collaborative, source-controlled build.
This is a design review, not a licensed religious ruling.

1. **The page should follow Bani, not UI divisions — ACCEPT WITH ACCESSIBILITY GUARDRAILS.**
   - Remove decorative dividers/cards in Read and Understand, rely on authentic original Gurmukhi and native danda/pauri numerals, preserve headings as accessible landmarks and Jump.
   - Target intra-tuk gap ~8–10px; between pauris ~36–40px; adjustable Gurmukhi default need not be reduced below current comfortable size. Tap explanation for rich teaching with source labels.
   - No box around Gurbani. Pauri 13, line 1 independent comparison remains pending; never silently repair scripture.

2. **One quiet dock, no persistent header — ACCEPT, with accessible persistent control mode.**
   - Target slim <=56px dock plus iOS safe area; location, Play/Pause, 3 tappable depth dots, expandable controls. Optional swipe must never be the only input and must not conflict with iOS gestures.
   - Timed receding after ~4 seconds is optional only with a reliable tap/reveal mechanism and an always-visible-controls setting. Tests against focus occlusion, VoiceOver and elder legibility take precedence over an aesthetic timed rule.
   - Earlier local R5 candidate reduced chrome substantially and offers explicit Quiet; it is not yet the final single-dock design or a verified publishable update.

3. **Sikh Naam Simran practice, not generic meditation — ACCEPT AS A SEPARATE RESEARCH/PROTOTYPE LANE.**
   - Source each instructional claim to Gurbani Ang and Sikh Rehat Maryada or named tradition. Silence default, human-permitted recorded guidance only, no AI recitation, no streaks/scores. Breath cues remain gentle and optional.
   - The proposed '108-bead simrana' is not a universal Sikh requirement shown by the official Rehat Maryada; it may be examined as a tradition-specific optional method, never imposed as canonical. No mandatory counting and no false promise of spiritual measurement.
   - No production content deployment until scriptural and qualified review.

4. **A Gurdwara arrival moment rooted in a real place — ACCEPT AS A SEPARATE PROTOTYPE LANE.**
   - Official gurdwara names, sources, accurate local time (not a verified programme), rights-cleared photo with attribution and permission, minimal text, deliberate Enter, skippable fade and reduced-motion variant. Place-dependent palette is an optional art direction.
   - Default to official outbound stream links. Embed a YouTube player only if its visible playback UI, metadata, ads and platform requirements are preserved; never strip YouTube audio or claim prohibited background playback.
   - Don't imply live status without current provider evidence; no automatic sound before deliberate entry.

**Sequence:** Japji reader QA + stable release first → Simran Room design/research → Gurdwara arrival design/research. One GitHub source of truth, one release baseline, Claude PASS/FAIL screenshot review before promotion.
