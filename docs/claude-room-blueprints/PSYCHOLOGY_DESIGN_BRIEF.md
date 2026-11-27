# PSY-D · Psychology Room — visual identity, user journeys and implementation blueprint

**Owner:** Claude creative design lead. **Scope:** researched, testable product/interaction recommendations, NOT coding or deployment. The live library is already established; **do not propose another application**.

## Inspect real evidence first

- [PR #12](https://github.com/sskhangura82/gurbani-learning-library/pull/12) has a real `psychology.html`, responsive `css/psychology.css`, four topic controls in `js/psychology-page.js`, Gurmukhi directly from the frozen corpus, and desktop screenshots in `docs/screenshots/nitnem-mind/`. The prototype uses a muted sage/stone palette, case examples, text-based historical psychology notes, and no quizzes/scores.
- [R7 family home](https://sskhangura82.github.io/gurbani-learning-library/) has the original three doors; PR #12 adds a fourth discreet Psychology door. Inspect whether it should remain a home door or be placed within a broader Learn shelf. Other rooms must remain recognizable and the existing Japji reader unchanged.
- Existing Day/Amrit Vela and Darbar Standard: original Gurmukhi remains the primary source. Some sacred-space designs use shared visual language, but the Psychology Room should clearly **feel different** from the Simran Room without appearing clinically authoritative.

## Independent design tasks

**PSY-D1: Information architecture and purpose.** Is Psychology a distinct fourth room, a “Mind and Meaning” learning collection nested under Study, or a contextual drawer inside Gurbani study? Compare all three, weigh depth/discoverability, serenity, family use, long-term scaling to the full SGGS, continuity of reader position and accessibility. Choose one. If retaining a fourth home doorway, prove it doesn't make Home busy.

**PSY-D2: Design system with three alternatives.** Deliver three genuinely different art directions expressed as grounded moodboards or clear annotated screen descriptions—not merely different CSS colors. Candidate directions: “A quiet library study” (warm paper and ink), “Reflective garden” (sage/stone, calm texture, restrained), “Observatory of ideas” (neutral charcoal and luminous traces). Show Day/Amrit Vela relationship, page type scales, Punjabi/Gurmukhi font fallback and offline availability, contrast, motion and how conceptual imagery avoids visual confusion with sacred text. Recommend one and state the tradeoff.

**PSY-D3: User flows and screens.** Propose a complete iPhone navigation through (a) choosing a concept, (b) encountering original exact Gurbani with visible Ang/author/context, (c) reading an attributed Sikh learning panel, (d) viewing clearly separate historical/scientific explanation, (e) a short ordinary-life scenario, (f) one optional unscored reflection/teach-back, and (g) returning to precisely the previous Japji reading position. Show the *same* concept on 320, 390 CSS pixels, elder 200%-sized text, iPad and VoiceOver. Preserve controls and content order while scaling; describe reduced-motion and no-animation modes.

**PSY-D4: Editorial-state UX.** The source word must be distinguishable at a glance from explanation/psychological analogy. Avoid attention-grabbing colored approval badges; use quiet inline “draft” attribution and references. Never visually represent a research model or source disagreement as the Guru's statement. Present contested Freud-derived constructs and empirical CBT/ACT research with separate evidence/status wording.

**PSY-D5: Real-world cases and respectful choices.** Illustrate Nirbhau/Nirvair using courage with boundaries, not revenge; haumai using self-credit and humility, not narcissism diagnosis. Show how a tap to “Compare these lenses” can remain optional. No self-assessment “What personality type are you?”, no compelled sharing or surveys. A child-facing mode would need separate review before shipping.

**PSY-D6: Accessibility and error behavior.** Spell out actual button labels, keyboard/VoiceOver reading order, touch target minimums, meaning panel focus return, correct Punjabi language tagging where supported, back behavior, offline supported mode, citation failing-to-load fallback, long deep lesson pagination/continuity without scroll jumps, privacy of reflections.

## Exact deliverables

Return `PSY_D_UX_VISUAL_BLUEPRINT.md`, providing:
- A design verdict on current PR #12 **from actual files and screenshots** (PASS / CONDITIONAL PASS / FAIL plus fixes); do not claim actual iPhone testing if unseen.
- One page comparing the three information-architecture alternatives and the chosen path.
- Three clearly distinguishable visual art directions, plus one recommended design token set: backgrounds, ink/meaning colors, typography, spacing, border treatments, radiance policy, motion limits and WCAG contrast requirements.
- **At least six annotated screen states:** arrival, browse themes, deep lesson, compare lenses, source references, return-to-reader, plus overlay/motion and accessibility states.
- A component inventory (what to reuse from Home/Japji, what not to reuse) and data-to-UI contract from PSY-R. No user data should be required.
- A mobile-first prototype acceptance table: screenshots to take, actual metrics, iPhone/Safari/VoiceOver offline gates, exact testable criteria.
- A focused Work order for implementation **only after the user/creative direction is accepted**, with files to edit and non-goals.

**Gating:** No code now. No new psychological claims disguised as UI copy; coordinate with PSY-R before labeling anything final. Qualifying religious review and evidence-based psychology review are still outstanding.
