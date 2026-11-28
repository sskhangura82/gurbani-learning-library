# D03 · Translation and teaching audit

**Scope:** all 3,773 line meanings (English and Punjabi) and all 610 passage studies shipped
at commit `a3476ac`.
**Two kinds of evidence, kept apart:** scripted screens over everything, and my own reading
of a sample. The sample is a sample. I am an AI system, not a Sikh scholar; every
observation about meaning needs confirmation by qualified people.

## 1. Coverage register

| Check (test case) | Examined | Of | Result |
|---|---|---|---|
| Each line has one English and one Punjabi entry bound to it (M-01) | 3,773 | 3,773 | all present; 3,388 carry the hash of their line, none stale |
| Meaning sits on the right line (M-02) | 3,748 comparable | 3,773 | 2 flags, both false alarms on inspection |
| Language of each field; leftover working text (M-03) | 3,773 + 610 | same | no Latin in Punjabi fields; working notes do leak (CI-M-08); spelling varies (CI-M-11) |
| Repetition (M-04) | 3,773 | 3,773 | 3,503 distinct English meanings; identical English for different Gurmukhi in 35 groups (81 entries), mostly refrains |
| **Read line by line by me (M-05)** | **342** | **3,773 (9.1%)** | table in §3; row-level register [`evidence/m05_manual_reading.json`](evidence/m05_manual_reading.json) |
| Core concepts (M-06) | every occurrence of 17 terms | same | table in §4 |
| Translation / explanation / reflection kept apart and labelled (M-07) | all screen types | same | partly: see CI-M-09, CI-M-01 |
| Transliteration (M-08) | Sukhmani vocabulary | same | one mechanical scheme; not labelled approximate (CI-M-11) |
| Studies: structure, language balance, citations (M-09) | 610 | 610 | 259 cite page numbers, **0 wrong**; Punjabi thin (CI-M-10); 1 cross-reference to other Gurbani in the whole library |
| Modern ideas presented as the meaning (M-10) | 1,361 line notes + 610 studies | same | 309 line notes and 154 studies carry medical- or legal-style disclaimers (CI-M-07) |
| Similarity to published translations | 3,748 | 3,773 | 4 lines share a run of eight or more words; no sign of copying |
| Qualified human review | 0 | 3,773 | none exists (the app says so) |

## 2. The main result: two different qualities of work

**Japji Sahib and Sukhmani Sahib (2,412 lines).** Direct, careful, close to Prof. Sahib
Singh's reading, with alternatives noted in places. In 139 lines read I found no serious
error — six small points in Japji, two in Sukhmani.

**The six Nitnem banis added in the latest release (1,361 lines).** Uneven. Jaap Sahib is
mostly direct and good after its first chhand. Chaupai, Savaiye, Rehras and parts of Anand
and Sohila show four recurring problems:

1. **Distance.** The entry reports on the verse instead of giving its meaning —
   "is pictured as", "the poem says", "the poet portrays". Guru Sahib is called "the poet"
   or "the speaker"; Gurbani is called "the poem" (CI-M-01).
2. **Softening.** Categorical statements become possibilities; enemies become "forces";
   the best-known line of the Savaiye is replaced by a description of itself (CI-M-02).
3. **Disclaimers.** A caution is attached to every line because a test requires one;
   hundreds read like medical or legal small print (CI-M-07).
4. **Summaries in place of meanings.** For the nine Rehras shabads and the closing pieces,
   27 blocks each get one short summary (CI-M-03).

The cause looks the same for all four **[I]**: the drafting process was tuned to avoid
ever over-claiming, and the only reviewers were other AI agents the same day. Caution was
rewarded; faithfulness of voice was not measured.

## 3. What I read, and what I saw

| Composition | Lines read | Of | Lines with at least one observation | Character of the observations |
|---|---|---|---|---|
| Japji Sahib | 85 | 385 | 6 | minor: one reading given where two are common; a study pointer inside a meaning |
| Sukhmani Sahib | 54 | 2,027 | 2 | minor |
| Jaap Sahib | 51 | 782 | 7 | chhand 1 misreads two phrases; three doubtful word senses |
| Sohila | 37 | 56 | 10 | one invented clause; "ਸੰਤ ਟਹਲ" lost; English and Punjabi disagree twice |
| Anand Sahib | 16 | 208 | 11 | pauri 40 hedged in five of six lines |
| Benti Chaupai | 56 | 116 | 38 | 32 lines in distancing voice; two additions not in the text |
| Tav-Prasad Savaiye | 16 | 40 | 10 | softening throughout pauris 1, 9, 10 |
| Rehras blocks | 27 | 27 | 26 | summaries, not line meanings |
| **Total** | **342** | **3,773** | **110** | |

Automated screen for the distancing voice, whole library: 157 of 3,773 entries
([`evidence/m07b_reporting_voice_broadened.json`](evidence/m07b_reporting_voice_broadened.json)).
Reading found more than the screen did (Chaupai: 32 of 56 read, against 46 of 116
screened), so treat 157 as a floor.

Examples, quoted from the app:

| Gurbani | App's "meaning" | Problem |
|---|---|---|
| ਹਮਰੀ ਕਰੋ ਹਾਥ ਦੈ ਰੱਛਾ ॥ | "An opening request for Divine protection." | No meaning given |
| ਸਾਚੁ ਕਹੋਂ ਸੁਨ ਲੇਹੁ ਸਭੈ ਜਿਨ ਪ੍ਰੇਮ ਕੀਓ ਤਿਨ ਹੀ ਪ੍ਰਭ ਪਾਇਓ ॥੯॥ | "The stanza culminates in a striking affirmation that love is the way to encounter the Divine." | The line itself is withheld; "only those" is lost |
| ਦੂਖ ਰੋਗ ਸੰਤਾਪ ਉਤਰੇ ਸੁਣੀ ਸਚੀ ਬਾਣੀ ॥ | "Suffering, illness and burning distress are described as lifted by hearing the true Bani." | A statement turned into a report |
| ਚੁਨ ਚੁਨ ਸੱਤ੍ਰੁ ਹਮਾਰੇ ਮਾਰਿਯਹਿ ॥੪॥ | "The poet petitions for the defeat of every hostile force threatening his people." | "The poet"; softened |
| ਜਿਨ ਨਰ ਨਾਮ ਤਿਹਾਰੋ ਕਹਾ ॥ | "A person who speaks Your Name seeks its sustaining protection." | Second half is not in the line |
| ਖਸਮੁ ਵਿਸਾਰਹਿ ਤੇ ਕਮਜਾਤਿ ॥ | "…forgetting Naam is condemned as spiritual disregard." | The Guru's redefinition of "low caste" disappears |

## 4. Core concepts (M-06)

Source: [`evidence/m06_concepts.json`](evidence/m06_concepts.json).

| Term (lines where it occurs) | How the English renders it |
|---|---|
| Hukam (22) | "Hukam" 20 · "command" 1 · other 1 ("teaching", Anand 9.4) |
| Naam (216) | "Naam" 177 · "Name" 30 · other 9 |
| Shabad (28) | "Shabad" 22 · "sound" 6 |
| Brahm Gyani (73) | "Brahm Gyani" 72 · other 1 ("spiritual wisdom", Sohila 5.6) |
| Jot (13) | "light" 13 |
| Kirpa / Prasad (112) | "grace" 89 · "compassion" 9 · "kindness" 3 · other 11 |
| Nadar (14) | "grace" 6 · "gracious" 5 · other 3 |
| Maya (33) | "Maya" 17 · "wealth" 3 · "attachment" 3 · "world" 2 · other 8 |
| Satguru (44) | "True Guru" 39 · "Guru" 3 · other 2 |
| **Haumai (7)** | **"ego" 6** · "Haumai" 1 |
| **Sant (100)** | **"saint" 75** · "holy" 12 · "devotee" 1 · other 12 |
| **Saadh (128)** | **"holy" 121** · "saint" 1 · "disciplined" 1 · other 5 |
| **Sahaj (18)** | "natural" 7 · "peace" 4 · "ease" 2 · "poise" 1 · "Sahaj" 1 · other 3 |
| **Gurmukh (16)** | "Guru-oriented" 6 · "through the Guru" 4 · other 6 — never "Gurmukh" |
| Nirgun (8), Sargun (2) | "beyond qualities" 3, other 5; "manifest" 2 |

The Divine is "God" 143 times (Sukhmani only), "the Divine" 393, "the One" 382, "Lord" 25.
The Punjabi fields generally keep the original terms; the flattening is in English (CI-M-06).

## 5. Studies (610)

- Structure is good where full: focus, close reading, vocabulary, interpretation note,
  reflection, teach-back.
- English far outweighs Punjabi. Punjabi study fields exist for 79 of 199 Jaap passages,
  1 of 40 Anand, and none of the Savaiye, Chaupai, Sohila or Rehras passages (CI-M-10).
- Vocabulary is 2–8 chosen words per passage, marked "working gloss, not approved". There
  is no word-by-word layer (CI-E-01).
- 34 of 42 Japji studies talk about "this draft" or "the app" (CI-M-08).
- Every page reference checked is right. Only one study in 610 points to Gurbani outside
  its own composition.

## 6. Findings

| ID | Severity | In one line |
|---|---|---|
| CI-M-01 | High | Distancing voice; "the poet", "the speaker", "the poem" |
| CI-M-02 | High | Chaupai and Savaiye meanings soften or change the line |
| CI-M-03 | Medium | Rehras: 27 blocks have summaries, not line meanings; README counts them as meaning pairs |
| CI-M-04 | Medium | Six individual errors in Sohila and Anand |
| CI-M-05 | Medium | Jaap chhand 1 misreadings; three doubtful words |
| CI-M-06 | Medium | Haumai, Sant, Saadh, Sahaj flattened in English; naming of the Divine inconsistent |
| CI-M-07 | Medium | Medical- and legal-style disclaimers on hundreds of lines — **owner decision on policy** |
| CI-M-08 | Medium | Working notes and "the app / this draft" visible to readers; ਅਨਭਉ mis-glossed |
| CI-M-09 | Medium | Screen says "Meaning"; data says "paraphrase, not translation; AI, unreviewed" |
| CI-M-10 | Medium | Study text chiefly English |
| CI-M-11 | Low | Punjabi spelling not uniform; mechanical transliteration |
| CI-M-12 | Passed | One-to-one binding; originality; page references |

## 7. Recommendations

1. **A voice rule, decided by the owner with qualified teachers.** Proposed: the meaning
   field says what the line says, in the line's own person and mood. Context, alternative
   readings and pastoral notes go in a separate, labelled field. Guru Sahib is never "the
   poet".
2. **A term sheet** for the seventeen core concepts: keep the term, gloss once, link to a
   concept note written and reviewed in Punjabi first.
3. **Cautions become optional**, and the test that requires one per line is removed.
4. **Review by people.** Start with the 110 lines listed in the reading register and the
   157 screened entries; then Chaupai and Savaiye in full (156 lines); then the rest.
   Record reviewer, date and decision per line — the data already has a status field for it.
5. **English–Punjabi agreement check** added to review: the two must say the same thing.
6. **Do not import any published translation** to fix this. Prof. Sahib Singh's Darpan and
   other modern works are in copyright or of unclear status; use them as study aids and
   cite them, as the Japji and Sukhmani studies already do.
