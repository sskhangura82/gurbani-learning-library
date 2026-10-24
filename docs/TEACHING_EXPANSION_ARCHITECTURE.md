# GLP-001: Depth of teaching as an expanding library

Date: 2026-10-23 · Editorial architecture, not a claim of approved translations.

## The founder's teaching reference
The earliest ChatGPT Japji Sahib lessons covered the Mool Mantar, opening Salok, and Pauri 1–2. They worked because the learner was shown **unchanged Gurmukhi**, approximate pronunciation, key Punjabi vocabulary, close English/Punjabi meanings, *why the line matters in the pauri*, historical and grammatical context, a clear account of alternate respected interpretations, practical reflection, then a teach-back question. The goal is to produce this quality beyond Pauri 2, not merely lengthen generic summaries.

## Four distinct learning dimensions
| Role | User interface | Editorial payload | Review requirement |
| --- | --- | --- | --- |
| 1. Read — ਪਾਠ | Continuous original Gurmukhi, optional silent guide | Unicode source text with immutable occurrence IDs, Ang, authorship, title and source-text hash | Independent text collation; Pauri 13 line 1 remains OPEN |
| 2. Understand — ਸਰਲ ਅਰਥ | 1–2-line English + Punjabi beneath every tuk; tap to expand | Faithful, concise modern bilingual explanation without overstating final certainty | Source checks; qualified Punjabi/Gurbani review |
| 3. Study — ਵਿਸਥਾਰ | Structured meaningful deep lessons; stable draft, not runtime AI improvisation | Word/grammar parsing, approximate pronunciation note, context and movement of passage, alternative interpretations with named scholarship, application clearly separate from scripture, reflection and teach-back | Expert editorial/religious approval or prominently labeled draft |
| 4. Connected teaching / Raag | Optional doors from highlighted concept (not fourth text-depth toggle) | Topic+Ang links with enclosing shabad/salok and reason for connection, alternative readings, author/raag metadata and documented music tradition. Japji is not prescribed a raag. | Human review for relevance; raga and recording metadata independently checked |

## Data contracts
Maintain six separate, stable structures:
1. `scripture/{composition}/{occurrence}`: original text bytes, Ang, Gurmukhi title, place in enclosing shabad/salok, speaker/author and exact hash. No mutation from translation or UI.
2. `meanings/{occurrence}/{locale}/{revision}`: concise explanation and terminology with precise sources, `status=draft|source_checked|human_reviewed` and contributor/reviewer.
3. `lessons/{composition-or-unit}/{revision}`: English/Punjabi paragraphs, word tokens, pronunciation notes (never certified santhiya unless reviewed), interpretative questions, teach-back, editorial reasons/source IDs.
4. `themes/{id}` plus `relationships`: evidence-backed concepts such as Hukam, Haumai, Naam, Suniai, Mannai. Each edge records passage, **why** it connects, enclosing context, scope and review status. Mere common word search never proves the same teaching.
5. `raag/{composition-or-shabad}` separate from `performance/{recording}`: printed heading from scripture versus historical musical theory versus particular human performance; no inferred raag for Japji and no fake clock-to-music claims.
6. `learning/local`: bookmarks, reflections and positions remain separate browser-owned data, never stored in public content code or sent to GitHub.

## Expansion sequence
- **Japji Sahib first:** review Pauri 1 and Pauri 2 at the founder's original lesson quality, then work through Pauris 3–38 in contiguous, source-linked tranches. The 385 and 42 AI-assisted Work drafts are a scaffold, **not finished or approved teaching**.
- **Nitnem next:** document which tradition/SGPC Rehat Maryada list is represented. Jaap Sahib, Tav-Prasad Savaiye, Rehras Sahib, Kirtan Sohila, and other taught daily compositions require their own exact texts, provenance, structure and applicable musical headings; don't call a choice universal.
- **Then Sukhmani Sahib and selected Gurbani:** long-form lessons, recurring topic connections with explicit surrounding shabad contexts.
- **Eventually Sri Guru Granth Sahib Ji widely:** structured browse by Ang and raag, versioned source-backed editorial layers, controlled cross-reference graph; completion percentage for authored/reviewed explanations must remain separate from source-text coverage.

## Acceptance examples
- The Pauri 1 opening `ਸੋਚੈ ਸੋਚਿ ਨ ਹੋਵਈ` must explicitly note the well-known thinking/purification interpretive difference with proper attributed sources; not pretend a single unequivocal English meaning.
- Pauri 2 Hukam and Haumai connections must link to verified enclosing contexts on Angs 466, 472, and 394 with *reason* and qualification; no orphan quotations.
- A line's simple meaning opens deeper teaching **without replacing or mispositioning the original Gurbani** or interrupting any external recording.
- A reader can read the whole Japji in Read and Understand, with the glowing guide at a selected *illustrative* pace. True recording alignment belongs to a separate later capability and requires provider-permitted playback and human timing checks.

## Research and sources
- Sri Guru Granth Darpan (Professor Sahib Singh): https://www.gurugranthdarpan.net/0001.html
- SikhRI Guru Granth Sahib Project methodology: https://gurugranthsahib.io/info/english/methodology
- SGPC Sikh Rehat Maryada: https://sgpc.net/sikh-rehat-maryada-in-english/
- Open Granth/Shabad OS original Gurmukhi provenance: https://github.com/opengranth/open-granth
- GLP Library v0.1–v0.6 and Revision 4/6 release evidence are the historical source register; do not discard prior documented disagreements or checks.

This document scopes future research; it does not authorize public acceptance of unreviewed Sikh instructions or copying proprietary audio/modern translations.
