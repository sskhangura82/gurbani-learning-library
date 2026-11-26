# Draft lessons for Daily Hukamnama Shabads — not for publication

**Everything in this folder is an AI-assisted draft.** It has not been reviewed by a Sikh scholar, a Punjabi reader or anyone qualified in the traditions it compares. The reader does not load it. Nothing here may be shown to the public until qualified people approve it, level by level.

**Do not merge this folder to `main`.** Any file on `main` is served to the public, linked or not.

## What is here

| File | What it is |
|---|---|
| `sggs.gujri.m1.ang504.shabad04.lesson.draft.json` | The lesson: three levels, English and Punjabi, for the Shabad Gujri Mahalla 1 on Ang 504–505 (the Shabad in `hukamnama/fixture.json`). This is the single source. |
| `sggs.gujri.m1.ang504.shabad04.lesson.draft.md` | A reading copy for reviewers, made from the JSON by `tools/hukamnama/render-lesson-draft.mjs`. |
| `../../tests/hukamnama-lesson-draft.mjs` | 14 checks of form, coverage and binding to the source. |

## How it is built

- **The Shabad's Gurmukhi is not copied into the lesson.** Each of the 19 occurrences is named by its identifier and the fingerprint of its text. The reading copy draws the Gurmukhi from the checked source file. If the source changes by one letter, the fingerprint no longer matches and the lesson must be re-reviewed.
- **Every occurrence is covered:** 19 of 19, each with a literal meaning in English and Punjabi and two or three headwords that are words of that very line (56 headwords).
- **Layers are kept apart and labelled:** scripture · literal meaning · teaching · comparison with other traditions · human sciences · reflection.
- **The Rahao is its own unit** and the rest is read from it: devotion comes through the Guru's grace, by the True Guru's word in the heart.
- **Eight comparisons** (Bhagavad Gita, Upanishads, early Buddhism, Christianity, Judaism, Islam and Sufism, Taoism, Stoicism). Each gives a resemblance, a difference and the other tradition's own text by its standard reference. No translation of those texts is quoted.
- **No published translation or commentary of Gurbani was copied.** Every sentence was written for this draft.
- **Nine lines of Gurbani from elsewhere** are cited with their Ang. Each was found letter for letter in the reference used for the independent review. They should be drawn from the Shabad registry once it exists.

## Length, measured

| Level | Owner's target | This draft, English | Punjabi |
|---|---|---|---|
| Simple | 2–3 minutes | 232 words | 222 words |
| Detailed | 10–15 minutes | 1,496 words + the 19 lines | 1,386 words |
| Deep | 20–45 minutes | 1,976 words: about 10–13 minutes | 1,954 words |

The Deep level is a complete first pass at about half the intended length. What would take it further: word-by-word grammar; the place of this Shabad among the other Gujri Ashtpadis; how classical commentators read the seven uncertain points; more of Gurbani's own cross-references once the registry exists.

## What the writer is unsure of

Nine points are listed at the end of the lesson for qualified reviewers: seven readings of particular words (ਕੇਵਲ, ਜਮ ਕਾਣਿ, ਸਹਜਿ ਹਰੀ, ਮੇਕ ਘਰੀ, ਰੋਸੁ ਕਰੈ, ਰਵਿਆ, ਭਾਈ), the Punjabi throughout, and the fairness of the comparisons.

The Roman spellings are plain and approximate. They are not Santhiya guidance.

## What the tests do and do not show

`node tests/hukamnama-lesson-draft.mjs` — 14 of 14 pass. Nine deliberate faults were each caught (a line without teaching, a headword not in its line, a line of the Shabad copied in, "approved" set, missing Punjabi, a comparison with no difference, a wrong fingerprint, Gurmukhi quoted that is not in the Shabad, lines out of order).

The tests check that the lesson is complete, bilingual, bound to its source and labelled a draft. **They cannot check that the teaching is right.** That needs a qualified human reader.
