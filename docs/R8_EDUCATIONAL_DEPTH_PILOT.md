# GLP-001 — Deep Study pilot for Japji Pauris 1–4

Status: editorial build specification; **no new translation published and no human review claimed**.

## Why the current 42 Study drafts are insufficient as final teaching

A representative mechanical review of the existing Pauri 1–4 units shows that they do contain source links and explicit alternate interpretations, but their primary English meaning summaries are about 23–26 words per unit, their `directSense` around 71–81 words, their context around 32–42 words and their interpretive notes around 53–76 words. Each has 3–4 vocabulary entries and 2–4 source links; all are `status=draft, humanReviewed=false`. They are useful scaffolds, **not yet the line-by-line teaching experience originally enjoyed in chat**.

## Reconstructed founder-requested lesson standard

For each pauri, a study view should support:
1. Exact original Gurmukhi, complete Ang/pauri/line position, enclosing passage and source hash—unchanged across all modes.
2. Approximate pronunciation where useful, clearly not certified santhiya.
3. Short English explanation (1–2 lines) plus natural accessible Punjabi (1–2 lines) after each original line, not arbitrary auto-translation.
4. A deeper **line-by-line** explanation (minimum one meaningful section per key line), showing significant grammatical/lexical choices without inventing literal meanings.
5. Source-grounded interpretation comparisons with attribution; when scholars differ, show both and why. For Pauri 1, compare Sahib Singh’s purification reading of `ਸੋਚੈ ਸੋਚਿ` with Sant Singh Khalsa’s thinking reading, without replacing their words with a false consensus.
6. A thematic bridge to the preceding and following pauris. Pauri 1: `ਕਿਵ ਸਚਿਆਰਾ ਹੋਈਐ`; Pauri 2: Hukam and haumai; Pauri 3: ways the Divine is described; Pauri 4: `ਅੰਮ੍ਰਿਤ ਵੇਲਾ` and remembrance. Do not use physiological or cosmic scientific analogies as scriptural statements.
7. A small connected-teaching list pointing to verified Ang occurrences (e.g., Angs 466 and 472 for Hukam/haumai), with **the enclosing shabad/salok visible** and a documented rationale beyond matching one word.
8. Thoughtful application labeled `Reflection, not direct translation`, a teach-back question, and a clear invitation to continue the next lesson.
9. References, status badges in a scholarly record (not distracting UI), revision history and open disagreements. Qualified review separate from AI source checks.

## Pilot outline — first four pauris
- **Pauri 1**: assess ritual cleanliness vs inward cleansing, outer silence vs inner stillness, endless craving, cleverness, the question of sachiara and the answer in Hukam. Include precisely attributed interpretive difference for `ਸੋਚੈ`.
- **Pauri 2**: unpack Hukam as governing order, what it does and does not say about human responsibility, compare how haq/haumai relation appears in subsequent Gurbani; explain `ਹੁਕਮੀ ਹੋਵਨਿ ਆਕਾਰ` and `ਹਉਮੈ` with care.
- **Pauri 3**: examine descriptive voices and poetic multiplicity, avoid flattening the text into an abstract philosophical slogan.
- **Pauri 4**: distinguish the text of `ਅੰਮ੍ਰਿਤ ਵੇਲਾ ਸਚੁ ਨਾਉ ਵਡਿਆਈ ਵੀਚਾਰੁ ॥` from later interpretations about clock time and breath; do not turn it into prescriptive breath control.

## Acceptance
- The user can open Study from the same original Gurmukhi without leaving continuous Read/Understand or losing their place.
- Every significant interpretive claim has a specifically relevant cited source. If sources disagree, label the differences rather than hiding them.
- At least one Punjabi-speaking Sikh reviewer and one source-specialist/santhiya reviewer should review language and original recitation where possible. Neither Claude nor ChatGPT approval is a substitute.
- A non-approval status stays visible until reviewed. Editing a lesson does not silently mutate original scripture or existing learning.
- No user annotations, reflections, video viewing history or credentials are added to public GitHub data.

## Research anchors
- Darpan Ang 1–2: https://www.gurugranthdarpan.net/0001.html
- Guru Granth Sahib Project methodology: https://gurugranthsahib.io/info/english/methodology
- SriGranth Ang 1 source: https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param=1
- Existing `js/japji-lessons.js` original Work-generated 42 drafts, preserved under its versioned source hash.
- Pauri 13 line 1 independent comparison remains unresolved and must not be silently reconstructed or altered.

### Build independence
This teaching work is separate from the YouTube source provider and timing engine. The canonical original text and each human-reviewed lesson should work offline and without external media.
