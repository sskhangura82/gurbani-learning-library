# Scripture discrepancy register

**Reviewer:** Claude, independent second reviewer (AI system; not a Sikh scholar). **Date:** 26 November 2026.
**Asked for by:** the builder's note relayed by the owner on 25 November 2026: list every exception, the passage, the source compared with, the difference and its disposition.

This file adds **no new comparison**. It gathers into one place every comparison already recorded in this review (round 1, addendum S-A1, rounds 2 and 3) and gives each exception a disposition. It is built by script from those records: `tools/build_discrepancy_register.py`, `tools/render_discrepancy_register.py`. The full list, one row per exception with both texts, is `SCRIPTURE_DISCREPANCY_REGISTER_20261126.csv` (359 rows).

## 1. The sentence this replaces

In my plain-language summary to the owner I wrote that Gurbani "matches the digital source almost everywhere I checked". That was too loose. The exact statement is:

- **Sri Guru Granth Sahib Ji, in the three published readers:** 2,735 lines compared. **No letter differs in any of them.** 31 are laid out or marked differently (27 divided or run together differently, 4 with a closing mark or number that differs).
- **Dasam Bani, in the Nitnem reader:** 1,074 lines compared. **138 differ in at least one letter — about one line in eight.** 74 more differ only in a closing mark or number, in layout, or in where a word is divided.
- **Gurbani quoted outside the readers:** 31 lines compared. 2 differ, in three words (an encoding fault).
- **In all, in the published app:** 3,840 lines compared, 3,595 the same in every respect, **245 exceptions**.

"The same" means the same as one digital source. It does not mean checked against print, and it does not mean approved by a qualified reader. No line in this project has been compared with a printed page.

## 2. What was compared with what

| Text in the app | Compared with |
|---|---|
| Japji Sahib, Sukhmani Sahib, Anand Sahib, Sohila, the Shabads of Rehras, and every other line from Sri Guru Granth Sahib Ji | Shabad OS Database 5.0.0-next.0, its text named "Shabadaarth". The database gives the origin of that text as SGPC, Sri Amritsar, 2009–2012, four volumes. |
| Jaap Sahib, Tav-Prasad Savaiye, Benti Chaupai, and the Dasam Bani in Rehras | The same database, its text named "Das Granthi". The database gives its origin as SGPC, Sri Amritsar, July 2014. |

Both are digital transcriptions. I have not seen either printed book, so I cannot say the transcriptions are faithful to them. The pause marks the database adds were removed before comparing; nothing else was changed. The app's own Sri Guru Granth Sahib text comes from Open Granth, which is derived from the same database: **one digital family**, so agreement shows faithful copying, not independent confirmation.

## 3. Every exception in the published app, by kind

| Kind | Exceptions | What it is | Disposition | Who decides |
|---|---|---|---|---|
| **Layout only** | 39 | App layout fault, not a difference of text | Same letters. Lines are run together or divided differently in the app. Repair the layout; the words do not change. | Builder repairs; reviewer compares again |
| **Word division** | 21 | Undetermined; editions are known to differ on word division | Same letters. A word is joined or split differently from the reference. Leave as it is until a named printed edition is chosen. | Qualified reader with the named edition |
| **Closing mark or verse number** | 45 | Difference of convention, or a small omission; undetermined | Letters agree. A closing mark or a verse number differs. Follow the named printed edition once chosen. | Owner names the edition; qualified reader confirms |
| **Reading undecided** | 119 | The two sources differ (established). Slip or accepted reading: undetermined | The app's source and the reference read differently. It may be a slip on either side or a real difference between printed traditions. Needs one named printed edition and a qualified reader. Do not change before that. | Qualified reader with the named edition |
| **Probable slip** | 19 | Probable error carried in from the app's source; unconfirmed | The app contradicts its own pattern or stores the word in an invalid order. Confirm against print, then correct with a before-and-after record. | Qualified reader confirms; builder corrects; owner signs off |
| **Encoding fault** | 2 | App encoding error | The app stores a doubled sign where the reference has one; an extra letter is drawn in the test font. Correct with a before-and-after record. | Builder corrects; owner signs off because displayed Gurbani changes |
| **Total** | **245** | | | |

The builder asked that each difference be recorded as an error, a textual tradition, or a mismatch of sources. For the 138 lines of Dasam Bani that differ in a letter, what is **established** is that the app's source and the reference are different sources and read differently. Whether a given reading is a slip or an accepted reading is **not established**, and I cannot establish it: digital copies of Dasam Bani disagree with one another, and only a named printed edition read by a qualified person can settle it. I have marked as "probable slip" only the 19 where the app contradicts itself, stores a word in an invalid order, or runs its opening words together.

## 4. By composition (published readers)

| Composition | Lines | Same | Layout only | Word division | Closing mark or verse number | Reading undecided | Probable slip |
|---|---|---|---|---|---|---|---|
| Japji Sahib | 385 | 385 | – | – | – | – | – |
| Sukhmani Sahib | 2,027 | 2,027 | – | – | – | – | – |
| Anand Sahib | 210 | 209 | – | – | 1 | – | – |
| Sohila | 56 | 51 | 4 | – | 1 | – | – |
| Jaap Sahib | 808 | 750 | 8 | 11 | 5 | 19 | 15 |
| Tav-Prasad Savaiye | 43 | 21 | 1 | 1 | 8 | 10 | 2 |
| Benti Chaupai | 121 | 49 | 1 | 5 | 16 | 48 | 2 |
| Rehras Sahib, the nine Shabads | 23 | 0 | 23 | – | – | – | – |
| Rehras Sahib, Chaupai | 100 | 42 | – | 4 | 14 | 40 | – |
| Rehras Sahib, Swaiya and Dohra | 2 | 0 | – | – | – | 2 | – |
| Rehras Sahib, Anand | 32 | 32 | – | – | – | – | – |
| Rehras Sahib, Mundavani and Salok | 2 | 0 | 2 | – | – | – | – |
| **All** | **3,809** | **3,566** | **39** | **21** | **45** | **119** | **19** |

## 5. Every exception, listed

Each line gives the place in the app's data, the page of the reference, and the words that differ: **app → reference**. Where only layout differs, the app's line is given. Both full lines are in the CSV.

### CI-S-16 — Three words drawn with a doubled sign, outside the readers (2)

*Encoding fault: 2.*

- `js/content.js related[1].context[4]` · p. 472 · ਜਿਨ੍ਹ੍ਹੀ → ਜਿਨੑੀ; ਤਿਨ੍ਹ੍ਹਾ → ਤਿਨੑਾ
- `js/content.js related[2].context[4]` · p. 394 · ਸਮ੍ਹ੍ਹਾਲੇ → ਸਮੑਾਲੇ

### CI-S-02 — Jaap Sahib 96–98: one word stored two ways (12)

*Probable slip: 12.*

- `jaap096.line01` · p. 6 · ਚੱਤ੍ਰੁ → ਚੱਤ੍ਰ
- `jaap096.line02` · p. 6 · ਚੱਤ੍ਰੁ → ਚੱਤ੍ਰ
- `jaap096.line03` · p. 6 · ਚੱਤ੍ਰੁ → ਚੱਤ੍ਰ
- `jaap096.line04` · p. 6 · ਚੱਤ੍ਰੁ → ਚੱਤ੍ਰ
- `jaap097.line01` · p. 6 · ਚੱਤੁ੍ਰ → ਚੱਤ੍ਰ
- `jaap097.line02` · p. 6 · ਚੱਤੁ੍ਰ → ਚੱਤ੍ਰ
- `jaap097.line03` · p. 6 · ਚੱਤੁ੍ਰ → ਚੱਤ੍ਰ
- `jaap097.line04` · p. 6 · ਚੱਤੁ੍ਰ → ਚੱਤ੍ਰ
- `jaap098.line01` · p. 6 · ਚੱਤੁ੍ਰ → ਚੱਤ੍ਰ
- `jaap098.line02` · p. 6 · ਚੱਤੁ੍ਰ → ਚੱਤ੍ਰ
- `jaap098.line03` · p. 6 · ਚੱਤੁ੍ਰ → ਚੱਤ੍ਰ; ਮਾਨ੍ਯੈ → ਮਾਨਯੈ
- `jaap098.line04` · p. 6 · ਚੱਤ੍ਰੁ → ਚੱਤ੍ਰ; ਦਾਨ੍ਯੈ → ਦਾਨਯੈ

### CI-S-03 — Jaap Sahib: four places where the text contradicts its own pattern (4)

*Probable slip: 3; Layout only: 1.*

- `jaap108.line04` · p. 6 · ਗੈਬੁਲ → ਗ਼ੈਬੁਲ
- `jaap122.line04` · p. 7 · ਜ਼ਮੀਨਲ → ਜ਼ਮੀਨੁਲ
- `jaap179.line04` · p. 9 · ਅਮ੍ਰਿਤਾ ਮ੍ਰਿਤ ਹੈਂ॥੧੭੯॥
- `jaap198.line04` · p. 10 · ਕਰੀਮਲੁ → ਕਰੀਮੁਲ

### CI-S-05 — Openings of Savaiye and Chaupai run together (6)

*Layout only: 2; Probable slip: 4.*

- `savaiye.preface01` · p. 11 · ੴ
- `savaiye.preface02` · p. 11 · ਸ੍ਰੀ ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਹ → ਪਾਤਿਸਾਹੀ ੧੦
- `savaiye.preface03` · p. 12 · ਪਾਤਿਸਾਹੀ੧੦ → ਤ੍ਵ ਪ੍ਰਸਾਦਿ; ਤ੍ਵਪ੍ਰਸਾਦਿ ਸ੍ਵਯੇ → ਸਵੱਯੇ; ॥ → (nothing)
- `chaupai.preface01` · p. 809 · ੴ
- `chaupai.preface02` · p. 809 · ਸ੍ਰੀ → (nothing)
- `chaupai.preface03` · p. 809 1386 · ਪਾਤਿਸਾਹੀ੧੦ → ਪਾਤਿਸਾਹੀ ੧੦; ਕਬਯੋ → ਕਬਿਯੋ

### CI-S-04 — Jaap Sahib: readings that differ from the reference (19)

*Reading undecided: 19.*

- `jaap.preface01` · p. 1 · ਸ੍ਰੀ ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਹ → (nothing); ॥ → (nothing)
- `jaap.preface02` · p. 1 · ਸ੍ਰੀ ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਹ → (nothing); ॥ → (nothing)
- `jaap001.line02` · p. 1 · ਸਕਤਿ → ਸਕਤ
- `jaap079.line04` · p. 5 · ਜੱਤ੍ਰ ਤੱਤ੍ਰ → ਜਤ੍ਰੱ ਤਤ੍ਰੱ; ਰਿਸਾਲ → ਰਸਾਲ
- `jaap080.line04` · p. 5 · ਜੱਤ੍ਰ ਤੱਤ੍ਰ → ਜਤ੍ਰੱ ਤਤ੍ਰੱ
- `jaap081.line02` · p. 5 · ਸਰਬੱਤ੍ਰ → ਸਰਬਤ੍ਰ
- `jaap081.line04` · p. 5 · ਖੇਲਿ → ਖੇਲ
- `jaap086.line03` · p. 5 · ਜਾਕਹਿ ਨੇਤਿ → ਜਾ ਕਹਿ ਨੇਤ
- `jaap092.line02` · p. 6 · ਨ੍ਰਿਕਾਮ → ਨਿਕਾਮ
- `jaap093.line01` · p. 6 · ਆਲਿਸ੍ਯ → ਆਲਿਸਯ
- `jaap093.line02` · p. 6 · ਆਦ੍ਰਿਸ੍ਯ → ਆਦ੍ਰਿਸਯ
- `jaap093.line03` · p. 6 · ਭਰਣਾਢ੍ਯ → ਭਰਣਾਢਯ
- `jaap093.line04` · p. 6 · ਬਾਢ੍ਯ → ਬਾਢਯ
- `jaap125.line02` · p. 7 · ਬਿਭੂਤਿ → ਬਿਭੂਤ
- `jaap128.line02` · p. 7 · ਸਰੂਪੇ → ਸਰੂਪੈ
- `jaap141.line04` · p. 8 · ਅਜਾਦਿ → ਅਜਾਦ
- `jaap148.line01` · p. 8 · ਪੁਤ੍ਰੈ → ਪੁੱਤ੍ਰੈ
- `jaap179.line01` · p. 9 · ਅਮਿਤੇਸ੍ਵਰ → ਅਮ੍ਰਿਤੇਸ੍ਵਰ
- `jaap197.line01` · p. 10 · ਪ੍ਰਨਾਮੇ → ਪ੍ਰਣਾਮੇ

### CI-S-06 — Benti Chaupai (and the same text stored again in Rehras): readings that differ (88)

*Reading undecided: 88.*

- `chaupai-rehras01.line02` · p. 1386 · ਚਿੱਤ → ਚਿਤ
- `chaupai-rehras02.line04` · p. 1386 · ਸਿੱਖਯ → ਸਿੱਖ; ॥੨॥ → ॥੩੭੮॥
- `chaupai-rehras03.line01` · p. 1386 · ਨਿਜੁ → ਨਿਜ
- `chaupai-rehras03.line02` · p. 1386 · ਬੈਰਿਨ ਕੌ → ਬੈਰਨ ਕੋ
- `chaupai-rehras03.line04` · p. 1386 · ਤੋਰਿ → ਤੋਰ; ਪਿਯਾਸਾ → ਪਿਆਸਾ; ॥੩॥ → ॥੩੭੯॥
- `chaupai-rehras04.line01` · p. 1386 · ਧਯਾਊਂ → ਧਿਯਾਊਂ
- `chaupai-rehras04.line03` · p. 1386 · ਸਿੱਖਯ → ਸਿੱਖ; ਤਾਰਿਯਹਿ → ਤਾਰੀਅਹਿ
- `chaupai-rehras04.line04` · p. 1386 · ਚੁਨ ਚੁਨ ਸੱਤ੍ਰੁ → ਚੁਨਿ ਚੁਨਿ ਸਤ੍ਰ; ਮਾਰਿਯਹਿ ਆਪੁ → ਮਾਰੀਅਹਿ ਆਪ; ॥੪॥ → ॥੩੮੦॥
- `chaupai-rehras05.line01` · p. 1386 · ਮਾਰਿਯਹਿ ਆਪੁ → ਮਾਰੀਅਹਿ ਆਪ; ॥੪॥ → ॥੩੮੦॥
- `chaupai-rehras07.line03` · p. 1386 · ਕਰਿ ਬਿਸਨ → ਕਰ ਬਿਸਨੁ
- `chaupai-rehras07.line04` · p. 1386 · ਕੀਯਾ → ਕੀਆ; ॥੭॥ → ॥੩੮੩॥
- `chaupai-rehras08.line01` · p. 1386 · ਕੀਯੋ → ਕੀਓ
- `chaupai-rehras08.line02` · p. 1386 · ਥੀਯੋ → ਥੀਓ
- `chaupai-rehras10.line03` · p. 1386 · ਦੀਯੋ → ਦੀਓ
- `chaupai-rehras10.line04` · p. 1386 · ਕੀਯੋ → ਕੀਓ; ॥੧੦॥ → ॥੩੮੬॥
- `chaupai-rehras12.line02` · p. 1387 · ਸਾਧਨ → ਸਾਧੁਨ
- `chaupai-rehras12.line03` · p. 1387 · ਪਛਾਨੈ → ਪਛਾਨੈਂ
- `chaupai-rehras12.line04` · p. 1387 · ਜਾਨੈ → ਜਾਨੈਂ; ॥੧੨॥ → ॥੩੮੮॥
- `chaupai-rehras14.line02` · p. 1387 · ਆਪੁਨੀ ਬੂਝਿ → ਆਪਨੀ ਬੂਝ
- `chaupai-rehras14.line04` · p. 1387 · ਅਰੁ → ਅਰ; ॥੧੪॥ → ॥੩੯੦॥
- `chaupai-rehras15.line01` · p. 1387 · ਨ੍ਰਿਲੰਭ → ਨਿਰਲੰਭ
- `chaupai-rehras15.line04` · p. 1387 · ਜਾਕੋ → ਜਾ ਕੋ; ਤਾਕੌ → ਤਾ ਕੋ; ॥੧੫॥ → ॥੩੯੧॥
- `chaupai-rehras16.line01` · p. 1387 · ਤਾਕੌ → ਤਾ ਕੋ; ॥੧੫॥ → ॥੩੯੧॥
- `chaupai-rehras16.line02` · p. 1387 · ਮਹਾਂ → ਮਹਾ
- `chaupai-rehras16.line03` · p. 1387 · ਮਹਾਂਦੇਵ ਕੌ → ਮਹਾਦੇਵ ਕੋ
- `chaupai-rehras17.line01` · p. 1387 · ਆਪੁਨੀ → ਆਪਨੀ
- `chaupai-rehras18.line02` · p. 1387 · ਕਹੀਂ → ਕਹੀ
- `chaupai-rehras18.line04` · p. 1387 · ਬਹੁਰਿ → ਬਹੁਰ; ॥੧੮॥ → ॥੩੯੪॥
- `chaupai-rehras19.line02` · p. 1387 · ਭਯੋ → ਭਿਯੋ
- `chaupai-rehras19.line03` · p. 1387 · ਸਿਗਰੀ → ਸਗਰੀ
- `chaupai-rehras20.line02` · p. 1387 · ਸਿੱਖਯ → ਸਿੱਖ; ਅਸਿੱਖਯ → ਅਸਿੱਖ
- `chaupai-rehras20.line03` · p. 1387 · ਦੁਸਟ → ਦੁਸ਼ਟ
- `chaupai-rehras21.line03` · p. 1387 · ਪਗੁ → ਪਗ
- `chaupai-rehras22.line01` · p. 1387 · ਕੌ → ਕੋ
- `chaupai-rehras22.line04` · p. 1387 · ਟਰੇ → ਟਰੇਂ; ॥੨੨॥ → ॥੩੯੮॥
- `chaupai-rehras23.line02` · p. 1388 · ਤਾਕੇ → ਤਾ ਕੇ; ਮਹਿ → ਮੋ
- `chaupai-rehras23.line03` · p. 1388 · ਮੋਂ → ਮੋ
- `chaupai-rehras23.line04` · p. 1388 · ਦੁਸਟ → ਦੁਸ਼ਟ; ॥੨੩॥ → ॥੩੯੯॥
- `chaupai-rehras24.line01` · p. 1388 · ਤੁਮੈਂ → ਤੁਮੈ
- `chaupai-rehras25.line01` · p. 1388 · ਮੈਂ ਸਰਨਿ → ਮੈ ਸਰਣਿ
- `chaupai-long26.line03` · p. 1388 · ਦੇਹ → ਦੇਖ
- `chaupai-long27.line03` · p. 1388 · ਬਾਂਛਤ → ਬਾਛਤ
- `chaupai-long27.line04` · p. 1388 · ਅੜਿੱਲ → ਅੜਿਲ; ॥੨੭॥ → ॥੪੦੩॥
- `chaupai-long28.heading01` · p. 1388 · ਅੜਿੱਲ → ਅੜਿਲ; ॥੨੭॥ → ॥੪੦੩॥
- `chaupai-long28.line02` · p. 1388 · ਮੂੜ੍ਹ → ਮੂੜ
- `chaupai-long29.line01` · p. 1388 · ਸੱਤ੍ਰਹ → ਸਤ੍ਰਹ; ਭਣਿੱਜੈ → ਭਣਿਜੈ
- `chaupai-long29.line02` · p. 1388 · ਕਹਿੱਜੈ → ਕਹਿਜੈ
- `chaupai-long29.line04` · p. 1388 · ਸਤੁੱਦ੍ਰਵ → ਸਤੁਦ੍ਰਵ; ॥੨੯॥ → ॥੪੦੫॥
- `rehras.chaupai-rehras01.line02` · p. 1386 · ਚਿੱਤ → ਚਿਤ
- `rehras.chaupai-rehras02.line04` · p. 1386 · ਸਿੱਖਯ → ਸਿੱਖ; ॥੨॥ → ॥੩੭੮॥
- `rehras.chaupai-rehras03.line01` · p. 1386 · ਨਿਜੁ → ਨਿਜ
- `rehras.chaupai-rehras03.line02` · p. 1386 · ਬੈਰਿਨ ਕੌ → ਬੈਰਨ ਕੋ
- `rehras.chaupai-rehras03.line04` · p. 1386 · ਤੋਰਿ → ਤੋਰ; ਪਿਯਾਸਾ → ਪਿਆਸਾ; ॥੩॥ → ॥੩੭੯॥
- `rehras.chaupai-rehras04.line01` · p. 1386 · ਧਯਾਊਂ → ਧਿਯਾਊਂ
- `rehras.chaupai-rehras04.line03` · p. 1386 · ਸਿੱਖਯ → ਸਿੱਖ; ਤਾਰਿਯਹਿ → ਤਾਰੀਅਹਿ
- `rehras.chaupai-rehras04.line04` · p. 1386 · ਚੁਨ ਚੁਨ ਸੱਤ੍ਰੁ → ਚੁਨਿ ਚੁਨਿ ਸਤ੍ਰ; ਮਾਰਿਯਹਿ ਆਪੁ → ਮਾਰੀਅਹਿ ਆਪ; ॥੪॥ → ॥੩੮੦॥
- `rehras.chaupai-rehras05.line01` · p. 1386 · ਮਾਰਿਯਹਿ ਆਪੁ → ਮਾਰੀਅਹਿ ਆਪ; ॥੪॥ → ॥੩੮੦॥
- `rehras.chaupai-rehras07.line03` · p. 1386 · ਕਰਿ ਬਿਸਨ → ਕਰ ਬਿਸਨੁ
- `rehras.chaupai-rehras07.line04` · p. 1386 · ਕੀਯਾ → ਕੀਆ; ॥੭॥ → ॥੩੮੩॥
- `rehras.chaupai-rehras08.line01` · p. 1386 · ਕੀਯੋ → ਕੀਓ
- `rehras.chaupai-rehras08.line02` · p. 1386 · ਥੀਯੋ → ਥੀਓ
- `rehras.chaupai-rehras10.line03` · p. 1386 · ਦੀਯੋ → ਦੀਓ
- `rehras.chaupai-rehras10.line04` · p. 1386 · ਕੀਯੋ → ਕੀਓ; ॥੧੦॥ → ॥੩੮੬॥
- `rehras.chaupai-rehras12.line02` · p. 1387 · ਸਾਧਨ → ਸਾਧੁਨ
- `rehras.chaupai-rehras12.line03` · p. 1387 · ਪਛਾਨੈ → ਪਛਾਨੈਂ
- `rehras.chaupai-rehras12.line04` · p. 1387 · ਜਾਨੈ → ਜਾਨੈਂ; ॥੧੨॥ → ॥੩੮੮॥
- `rehras.chaupai-rehras14.line02` · p. 1387 · ਆਪੁਨੀ ਬੂਝਿ → ਆਪਨੀ ਬੂਝ
- `rehras.chaupai-rehras14.line04` · p. 1387 · ਅਰੁ → ਅਰ; ॥੧੪॥ → ॥੩੯੦॥
- `rehras.chaupai-rehras15.line01` · p. 1387 · ਨ੍ਰਿਲੰਭ → ਨਿਰਲੰਭ
- `rehras.chaupai-rehras15.line04` · p. 1387 · ਜਾਕੋ → ਜਾ ਕੋ; ਤਾਕੌ → ਤਾ ਕੋ; ॥੧੫॥ → ॥੩੯੧॥
- `rehras.chaupai-rehras16.line01` · p. 1387 · ਤਾਕੌ → ਤਾ ਕੋ; ॥੧੫॥ → ॥੩੯੧॥
- `rehras.chaupai-rehras16.line02` · p. 1387 · ਮਹਾਂ → ਮਹਾ
- `rehras.chaupai-rehras16.line03` · p. 1387 · ਮਹਾਂਦੇਵ ਕੌ → ਮਹਾਦੇਵ ਕੋ
- `rehras.chaupai-rehras17.line01` · p. 1387 · ਆਪੁਨੀ → ਆਪਨੀ
- `rehras.chaupai-rehras18.line02` · p. 1387 · ਕਹੀਂ → ਕਹੀ
- `rehras.chaupai-rehras18.line04` · p. 1387 · ਬਹੁਰਿ → ਬਹੁਰ; ॥੧੮॥ → ॥੩੯੪॥
- `rehras.chaupai-rehras19.line02` · p. 1387 · ਭਯੋ → ਭਿਯੋ
- `rehras.chaupai-rehras19.line03` · p. 1387 · ਸਿਗਰੀ → ਸਗਰੀ
- `rehras.chaupai-rehras20.line02` · p. 1387 · ਸਿੱਖਯ → ਸਿੱਖ; ਅਸਿੱਖਯ → ਅਸਿੱਖ
- `rehras.chaupai-rehras20.line03` · p. 1387 · ਦੁਸਟ → ਦੁਸ਼ਟ
- `rehras.chaupai-rehras21.line03` · p. 1387 · ਪਗੁ → ਪਗ
- `rehras.chaupai-rehras22.line01` · p. 1387 · ਕੌ → ਕੋ
- `rehras.chaupai-rehras22.line04` · p. 1387 · ਟਰੇ → ਟਰੇਂ; ॥੨੨॥ → ॥੩੯੮॥
- `rehras.chaupai-rehras23.line02` · p. 1388 · ਤਾਕੇ → ਤਾ ਕੇ; ਮਹਿ → ਮੋ
- `rehras.chaupai-rehras23.line03` · p. 1388 · ਮੋਂ → ਮੋ
- `rehras.chaupai-rehras23.line04` · p. 1388 · ਦੁਸਟ → ਦੁਸ਼ਟ; ॥੨੩॥ → ॥੩੯੯॥
- `rehras.chaupai-rehras24.line01` · p. 1388 · ਤੁਮੈਂ → ਤੁਮੈ
- `rehras.chaupai-rehras25.line01` · p. 1388 · ਮੈਂ ਸਰਨਿ → ਮੈ ਸਰਣਿ

### CI-S-07 — Tav-Prasad Savaiye: readings that differ (10)

*Reading undecided: 10.*

- `savaiye02.line02` · p. 12 · ਕਉ → ਕੋ
- `savaiye02.line04` · p. 12 · ਕੌ → ਕੋ; ॥੨॥ → ॥੨॥੨੨॥
- `savaiye05.line03` · p. 13 · ਮਤੰਗਨ → ਮਤੰਗਨਿ
- `savaiye07.line01` · p. 13 · ਭਵਿੱਖ → ਭਵਿਖ
- `savaiye08.line02` · p. 13 · ਸਾਜ → ਸਾਜਿ
- `savaiye08.line03` · p. 13 · ਫਾਸਿ → ਫਾਸ
- `savaiye09.line01` · p. 13 · ਦੋਉ → ਦੋਊ
- `savaiye09.line03` · p. 13 · ਸੋ → ਸੋਂ
- `savaiye09.line04` · p. 13 · ਪ੍ਰਭ → ਪ੍ਰਭੁ; ॥੯॥ → ॥੯॥੨੯॥
- `savaiye10.line03` · p. 13 · ਕੋਉ → ਕੋਊ; ਕੋਉ → ਕੋਊ

### CI-S-11 — Rehras: Swaiya and Dohra (2)

*Reading undecided: 2.*

- `rehras.savaiya01.line01` · p. 290 · ਨਹੀ → ਨਹੀਂ; ਸਿੰਮ੍ਰਿਤਿ → ਸਿੰਮ੍ਰਿਤ; ਕਹੈ → ਕਹੈਂ; ॥੧॥ → ॥੮੬੩॥
- `rehras.dohira01.line01` · p. 290 · ਗਹਯੋ → ਗਹਿਓ; ਅਸਿ → ਅਸ; ॥ → ॥੮੬੪॥

### CI-S-08 — Verse numbers follow a different convention (38)

*Closing mark or verse number: 38.*

- `savaiye01.line04` · p. 12 · ॥੧॥ → ॥੧॥੨੧॥
- `savaiye03.line04` · p. 13 · ॥੩॥ → ॥੩॥੨੩॥
- `savaiye04.line04` · p. 13 · ॥੪॥ → ॥੪॥੨੪॥
- `savaiye05.line04` · p. 13 · ॥੫॥ → ॥੫॥੨੫॥
- `savaiye06.line04` · p. 13 · ਸਿਰਨਾਇਕ → ਸਿਰ ਨਾਇਕ; ॥੬॥ → ॥੬॥੨੬॥
- `savaiye07.line04` · p. 13 · ॥੭॥ → ॥੭॥੨੭॥
- `savaiye08.line04` · p. 13 · ॥੮॥ → ॥੮॥੨੮॥
- `savaiye10.line04` · p. 13 · ॥੧੦॥ → ॥੧੦॥੩੦॥
- `chaupai-rehras01.line04` · p. 1386 · ॥੧॥ → ॥੩੭੭॥
- `chaupai-rehras05.line04` · p. 1386 · ॥੫॥ → ॥੩੮੧॥
- `chaupai-rehras06.line04` · p. 1386 · ਤੁਮਹੋ → ਤੁਮ ਹੋ; ॥੬॥ → ॥੩੮੨॥
- `chaupai-rehras08.line04` · p. 1386 · ॥੮॥ → ॥੩੮੪॥
- `chaupai-rehras09.line04` · p. 1386 · ॥੯॥ → ॥੩੮੫॥
- `chaupai-rehras11.line04` · p. 1387 · ॥੧੧॥ → ॥੩੮੭॥
- `chaupai-rehras13.line04` · p. 1387 · ॥੧੩॥ → ॥੩੮੯॥
- `chaupai-rehras16.line04` · p. 1387 · ॥੧੬॥ → ॥੩੯੨॥
- `chaupai-rehras17.line04` · p. 1387 · ॥੧੭॥ → ॥੩੯੩॥
- `chaupai-rehras19.line04` · p. 1387 · ॥੧੯॥ → ॥੩੯੫॥
- `chaupai-rehras20.line04` · p. 1387 · ॥੨੦॥ → ॥੩੯੬॥
- `chaupai-rehras21.line04` · p. 1387 · ॥੨੧॥ → ॥੩੯੭॥
- `chaupai-rehras24.line04` · p. 1388 · ॥੨੪॥ → ॥੪੦੦॥
- `chaupai-rehras25.line04` · p. 1388 · ॥੨੫॥ → ॥੪੦੧॥
- `chaupai-long26.line04` · p. 1388 · ॥੨੬॥ → ॥੪੦੨॥
- `chaupai-long28.line04` · p. 1388 · ਯਾਕੀ → ਯਾ ਕੀ; ॥੨੮॥ → ॥੪੦੪॥
- `rehras.chaupai-rehras01.line04` · p. 1386 · ॥੧॥ → ॥੩੭੭॥
- `rehras.chaupai-rehras05.line04` · p. 1386 · ॥੫॥ → ॥੩੮੧॥
- `rehras.chaupai-rehras06.line04` · p. 1386 · ਤੁਮਹੋ → ਤੁਮ ਹੋ; ॥੬॥ → ॥੩੮੨॥
- `rehras.chaupai-rehras08.line04` · p. 1386 · ॥੮॥ → ॥੩੮੪॥
- `rehras.chaupai-rehras09.line04` · p. 1386 · ॥੯॥ → ॥੩੮੫॥
- `rehras.chaupai-rehras11.line04` · p. 1387 · ॥੧੧॥ → ॥੩੮੭॥
- `rehras.chaupai-rehras13.line04` · p. 1387 · ॥੧੩॥ → ॥੩੮੯॥
- `rehras.chaupai-rehras16.line04` · p. 1387 · ॥੧੬॥ → ॥੩੯੨॥
- `rehras.chaupai-rehras17.line04` · p. 1387 · ॥੧੭॥ → ॥੩੯੩॥
- `rehras.chaupai-rehras19.line04` · p. 1387 · ॥੧੯॥ → ॥੩੯੫॥
- `rehras.chaupai-rehras20.line04` · p. 1387 · ॥੨੦॥ → ॥੩੯੬॥
- `rehras.chaupai-rehras21.line04` · p. 1387 · ॥੨੧॥ → ॥੩੯੭॥
- `rehras.chaupai-rehras24.line04` · p. 1388 · ॥੨੪॥ → ॥੪੦੦॥
- `rehras.chaupai-rehras25.line04` · p. 1388 · ॥੨੫॥ → ॥੪੦੧॥

### CI-S-10 — Rehras: Shabads stored as run-on blocks (25)

*Layout only: 25.*

- `rehras.sggs01.line01` · p. 8 · ਸੋ ਦਰੁ ਰਾਗੁ ਆਸਾ ਮਹਲਾ ੧ ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ ॥
- `rehras.sggs01.line02` · p. 8 · ਸੋ ਦਰੁ ਤੇਰਾ ਕੇਹਾ ਸੋ ਘਰੁ ਕੇਹਾ ਜਿਤੁ ਬਹਿ ਸਰਬ ਸਮਾਲੇ ॥ਵਾਜੇ ਤੇਰੇ ਨਾਦ ਅਨੇਕ…
- `rehras.sggs01.line03` · p. 8 · ਗਾਵਨਿ ਤੁਧਨੋ ਚਿਤੁ ਗੁਪਤੁ ਲਿਖਿ ਜਾਣਨਿ ਲਿਖਿ ਲਿਖਿ ਧਰਮੁ ਬੀਚਾਰੇ ॥ਗਾਵਨਿ ਤੁਧਨ…
- `rehras.sggs01.line04` · p. 9 · ਗਾਵਨਿ ਤੁਧਨੋ ਜਤੀ ਸਤੀ ਸੰਤੋਖੀ ਗਾਵਨਿ ਤੁਧਨੋ ਵੀਰ ਕਰਾਰੇ ॥ਗਾਵਨਿ ਤੁਧਨੋ ਪੰਡਿਤ…
- `rehras.sggs01.line05` · p. 9 · ਗਾਵਨਿ ਤੁਧਨੋ ਜੋਧ ਮਹਾਬਲ ਸੂਰਾ ਗਾਵਨਿ ਤੁਧਨੋ ਖਾਣੀ ਚਾਰੇ ॥ਗਾਵਨਿ ਤੁਧਨੋ ਖੰਡ ਮ…
- `rehras.sggs01.line06` · p. 9 · ਹੈ ਭੀ ਹੋਸੀ ਜਾਇ ਨ ਜਾਸੀ ਰਚਨਾ ਜਿਨਿ ਰਚਾਈ ॥ਰੰਗੀ ਰੰਗੀ ਭਾਤੀ ਕਰਿ ਕਰਿ ਜਿਨਸੀ …
- `rehras.sggs02.line01` · p. 9 · ਆਸਾ ਮਹਲਾ ੧ ॥ਸੁਣਿ ਵਡਾ ਆਖੈ ਸਭੁ ਕੋਇ ॥ ਕੇਵਡੁ ਵਡਾ ਡੀਠਾ ਹੋਇ ॥ਕੀਮਤਿ ਪਾਇ ਨ …
- `rehras.sggs02.line02` · p. 9 · ਸਭਿ ਸੁਰਤੀ ਮਿਲਿ ਸੁਰਤਿ ਕਮਾਈ ॥ ਸਭ ਕੀਮਤਿ ਮਿਲਿ ਕੀਮਤਿ ਪਾਈ ॥ਗਿਆਨੀ ਧਿਆਨੀ ਗੁ…
- `rehras.sggs03.line01` · p. 9 · ਆਸਾ ਮਹਲਾ ੧ ॥ਆਖਾ ਜੀਵਾ ਵਿਸਰੈ ਮਰਿ ਜਾਉ ॥ ਆਖਣਿ ਅਉਖਾ ਸਾਚਾ ਨਾਉ ॥ਸਾਚੇ ਨਾਮ ਕ…
- `rehras.sggs03.line02` · p. 9 10 · ਨਾ ਓਹੁ ਮਰੈ ਨ ਹੋਵੈ ਸੋਗੁ ॥ ਦੇਦਾ ਰਹੈ ਨ ਚੂਕੈ ਭੋਗੁ ॥ਗੁਣੁ ਏਹੋ ਹੋਰੁ ਨਾਹੀ ਕ…
- `rehras.sggs04.line01` · p. 10 · ਰਾਗੁ ਗੂਜਰੀ ਮਹਲਾ ੪ ॥ਹਰਿ ਕੇ ਜਨ ਸਤਿਗੁਰ ਸਤਪੁਰਖਾ ਬਿਨਉ ਕਰਉ ਗੁਰ ਪਾਸਿ ॥ਹਮ ਕ…
- `rehras.sggs04.line02` · p. 10 · ਹਰਿ ਜਨ ਕੇ ਵਡ ਭਾਗ ਵਡੇਰੇ ਜਿਨ ਹਰਿ ਹਰਿ ਸਰਧਾ ਹਰਿ ਪਿਆਸ ॥ਹਰਿ ਹਰਿ ਨਾਮੁ ਮਿਲੈ…
- `rehras.sggs05.line01` · p. 10 · ਰਾਗੁ ਗੂਜਰੀ ਮਹਲਾ ੫ ॥ਕਾਹੇ ਰੇ ਮਨ ਚਿਤਵਹਿ ਉਦਮੁ ਜਾ ਆਹਰਿ ਹਰਿ ਜੀਉ ਪਰਿਆ ॥ਸੈਲ…
- `rehras.sggs05.line02` · p. 10 · ਜਨਨਿ ਪਿਤਾ ਲੋਕ ਸੁਤ ਬਨਿਤਾ ਕੋਇ ਨ ਕਿਸ ਕੀ ਧਰਿਆ ॥ਸਿਰਿ ਸਿਰਿ ਰਿਜਕੁ ਸੰਬਾਹੇ ਠ…
- `rehras.sggs06.line01` · p. 10 · ਰਾਗੁ ਆਸਾ ਮਹਲਾ ੪ ਸੋ ਪੁਰਖੁ ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ ॥ਸੋ ਪੁਰਖੁ ਨਿਰੰਜਨੁ ਹਰਿ ਪੁਰ…
- `rehras.sggs06.line02` · p. 11 · ਤੂੰ ਘਟ ਘਟ ਅੰਤਰਿ ਸਰਬ ਨਿਰੰਤਰਿ ਜੀ ਹਰਿ ਏਕੋ ਪੁਰਖੁ ਸਮਾਣਾ ॥ਇਕਿ ਦਾਤੇ ਇਕਿ ਭੇ…
- `rehras.sggs06.line03` · p. 11 · ਹਰਿ ਧਿਆਵਹਿ ਹਰਿ ਧਿਆਵਹਿ ਤੁਧੁ ਜੀ ਸੇ ਜਨ ਜੁਗ ਮਹਿ ਸੁਖਵਾਸੀ ॥ਸੇ ਮੁਕਤੁ ਸੇ ਮੁ…
- `rehras.sggs06.line04` · p. 11 · ਤੇਰੀ ਭਗਤਿ ਤੇਰੀ ਭਗਤਿ ਭੰਡਾਰ ਜੀ ਭਰੇ ਬਿਅੰਤ ਬੇਅੰਤਾ ॥ਤੇਰੇ ਭਗਤ ਤੇਰੇ ਭਗਤ ਸਲ…
- `rehras.sggs06.line05` · p. 11 · ਤੂੰ ਆਦਿ ਪੁਰਖੁ ਅਪਰੰਪਰੁ ਕਰਤਾ ਜੀ ਤੁਧੁ ਜੇਵਡੁ ਅਵਰੁ ਨ ਕੋਈ ॥ਤੂੰ ਜੁਗੁ ਜੁਗੁ …
- `rehras.sggs07.line01` · p. 11 · ਆਸਾ ਮਹਲਾ ੪ ॥ਤੂੰ ਕਰਤਾ ਸਚਿਆਰੁ ਮੈਡਾ ਸਾਂਈ ॥ ਜੋ ਤਉ ਭਾਵੈ ਸੋਈ ਥੀਸੀ ਜੋ ਤੂੰ …
- `rehras.sggs07.line02` · p. 11 12 · ਜਿਸ ਨੋ ਤੂ ਜਾਣਾਇਹਿ ਸੋਈ ਜਨੁ ਜਾਣੈ ॥ ਹਰਿ ਗੁਣ ਸਦ ਹੀ ਆਖਿ ਵਖਾਣੈ ॥ਜਿਨਿ ਹਰਿ …
- `rehras.sggs08.line01` · p. 12 · ਆਸਾ ਮਹਲਾ ੧ ॥ਤਿਤੁ ਸਰਵਰੜੈ ਭਈਲੇ ਨਿਵਾਸਾ ਪਾਣੀ ਪਾਵਕੁ ਤਿਨਹਿ ਕੀਆ ॥ਪੰਕਜੁ ਮੋਹ…
- `rehras.sggs09.line01` · p. 12 · ਆਸਾ ਮਹਲਾ ੫ ॥ਭਈ ਪਰਾਪਤਿ ਮਾਨੁਖ ਦੇਹੁਰੀਆ ॥ ਗੋਬਿੰਦ ਮਿਲਣ ਕੀ ਇਹ ਤੇਰੀ ਬਰੀਆ ॥…
- `rehras.mundawani.line01` · p. 1429 · ਮੁੰਦਾਵਣੀ ਮਹਲਾ ੫ ॥ਥਾਲ ਵਿਚਿ ਤਿੰਨਿ ਵਸਤੂ ਪਈਓ ਸਤੁ ਸੰਤੋਖੁ ਵੀਚਾਰੋ ॥ਅੰਮ੍ਰਿਤ…
- `rehras.slok.line01` · p. 1429 · ਸਲੋਕ ਮਹਲਾ ੫ ॥ਤੇਰਾ ਕੀਤਾ ਜਾਤੋ ਨਾਹੀ ਮੈਨੋ ਜੋਗੁ ਕੀਤੋਈ ॥ਮੈ ਨਿਰਗੁਣਿਆਰੇ ਕੋ …

### CI-S-01 — Jaap Sahib 62: an invocation stored as a verse line (2)

*Layout only: 2.*

- `jaap062.line01` · p. 4 · ਤੇਰਾ ਜੋਰੁ ॥
- `jaap062.heading01` · p. 4 · ਚਾਚਰੀ ਛੰਦ ॥

### CI-S-14 — Small points: headings without a closing mark; Jaap 55, 56 and 73 (12)

*Closing mark or verse number: 7; Layout only: 5.*

- `anand.preface01` · p. 917 · (nothing) → ॥
- `sohila01.line01` · p. 12 · (nothing) → ॥
- `jaap055.line01` · p. 4 · ॥ → (nothing)
- `jaap055.line02` · p. 4 · ਨਮੋ ਰਾਗ ਰੂਪੇ ॥
- `jaap055.line03` · p. 4 · ॥ → (nothing)
- `jaap055.line04` · p. 4 · ਨਮੋ ਭੂਪ ਭੂਪੇ ॥੫੫॥
- `jaap056.line01` · p. 4 · ॥ → (nothing)
- `jaap056.line02` · p. 4 · ਨਮੋ ਮਾਨ ਮਾਨੇ ॥
- `jaap056.line03` · p. 4 · ॥ → (nothing)
- `jaap056.line04` · p. 4 · ਨਮਸਤੰ ਸਨਾਨੇ ॥੫੬॥
- `jaap073.line01` · p. 4 · ॥ → (nothing)
- `jaap073.line02` · p. 4 · ਕੁਕਰਮੰ ਪ੍ਰਣਾਸੀ ॥

### No separate finding — Counted in round 1 but given no finding of their own: word division, and four lines of Sohila (25)

*Layout only: 4; Word division: 21.*

- `sohila02.line07` · p. 12 · ਸੂਰਜੁ ਏਕੋ ਰੁਤਿ ਅਨੇਕ ॥
- `sohila02.line08` · p. 12 · ਨਾਨਕ ਕਰਤੇ ਕੇ ਕੇਤੇ ਵੇਸ ॥੨॥੨॥
- `sohila03.line04` · p. 13 · ਕੈਸੀ ਆਰਤੀ ਹੋਇ ॥
- `sohila03.line05` · p. 13 · ਭਵ ਖੰਡਨਾ ਤੇਰੀ ਆਰਤੀ ॥
- `jaap059.line01` · p. 4 · ਸਿਧਦਾ ਬੁਧਦਾ → ਸਿਧ ਦਾ ਬੁਧ ਦਾ
- `jaap060.line02` · p. 4 · ਸਰਬਦਾ → ਸਰਬ ਦਾ
- `jaap073.line03` · p. 4 · ਸਰਬਦਾ → ਸਰਬ ਦਾ
- `jaap080.line01` · p. 5 · ਜਾਕਰ → ਜਾ ਕਰ
- `jaap080.line03` · p. 5 · ਜਾਕਰ → ਜਾ ਕਰ
- `jaap082.line03` · p. 5 · ਜਾਕਰ → ਜਾ ਕਰ
- `jaap084.line03` · p. 5 · ਜਾਕਹਿ → ਜਾ ਕਹਿ
- `jaap113.line03` · p. 6 · ਜਾਹੋ → ਜਾ ਹੋ
- `jaap113.line04` · p. 6 · ਭਾਹੋ → ਭਾ ਹੋ
- `jaap126.line03` · p. 7 · ਸਮਸਤੋਪਰਾਜ → ਸਮਸਤੋ ਪਰਾਜ
- `jaap199.line02` · p. 10 · ਸਰਬਦਾ → ਸਰਬ ਦਾ
- `savaiye04.line03` · p. 13 · ਹਜਾਰਕ → ਹਜਾਰ ਕ
- `chaupai-rehras04.line02` · p. 1386 · ਤੁਮਤੇ → ਤੁਮ ਤੇ
- `chaupai-rehras06.line03` · p. 1386 · ਦੀਨਬੰਧੁ → ਦੀਨ ਬੰਧੁ
- `chaupai-rehras07.line02` · p. 1386 · ਸਿਵਜੂ → ਸਿਵ ਜੂ
- `chaupai-rehras15.line03` · p. 1387 · ਤਾਕਾ → ਤਾ ਕਾ
- `chaupai-long26.line02` · p. 1388 · ਸੁਭ ਰਾਤਾ → ਸੁਭਰਾਤਾ
- `rehras.chaupai-rehras04.line02` · p. 1386 · ਤੁਮਤੇ → ਤੁਮ ਤੇ
- `rehras.chaupai-rehras06.line03` · p. 1386 · ਦੀਨਬੰਧੁ → ਦੀਨ ਬੰਧੁ
- `rehras.chaupai-rehras07.line02` · p. 1386 · ਸਿਵਜੂ → ਸਿਵ ਜੂ
- `rehras.chaupai-rehras15.line03` · p. 1387 · ਤਾਕਾ → ਤਾ ਕਾ

## 6. Material that is not published

| Material | Lines compared | Same | Exceptions |
|---|---|---|---|
| Daily Hukamnama fixture, PR #43 (Gujri Mahalla 1, Ang 504–505) | 19 | 19 | 0 |
| Explorer lesson, PR #41 (opening lines of Sukhmani Ashtpadi 17) | 9 | 9 | 0 — but its nine lines and 27 headwords are a second, unchecked copy (R2-X-05), and 2 of 27 headwords sit under a unit where they do not occur (R2-X-07) |
| Knowledge pilot, PR #45 (three Saloks) | 19 | 19 | 0 |
| Draft lesson, PR #44 (mine) | holds no Gurbani; points to the 19 lines of PR #43 by fingerprint | – | – |
| Recovered draft of Salok Mahalla 9 (never merged) | 117 | 3 | **114** rows carry 204 pause marks inside the line; all 117 are the same once the marks are removed (R2-K-01). Listed in the CSV. |

## 7. Recorded, but not differences from the reference

- **Anand Sahib 24.3, ਕਚਂੀ (CI-S-13).** Same as the reference, which keeps an unusual order of signs. Open question is how an iPhone draws it. Needs a look on a real phone.
- **Ang numbers.** 2,733 checked; 2,732 agree; the one difference is at a page turn where the app is right.
- **The reference is not infallible.** Its ready-made list for Sukhmani Sahib omits one line that the app has (CI-S-15). In Benti Chaupai 26.3 the reference reads ਦੇਖ where the app reads ਦੇਹ; that row is among the undecided ones.
- **Which Rehras and which Chaupai (CI-S-09).** A choice of tradition, for the owner. Not a textual difference.
- **No composition names a printed edition (CI-S-12).** This is why so many rows above end in "undecided".

## 8. Corrections to my own earlier wording

1. "Almost everywhere" (my summary of 25 November) is replaced by section 1.
2. Round 1 said Dasam Bani was compared with the database's "Dasam Granth text". Precisely, it was the database's **"Das Granthi"** text (SGPC, 2014, as the database records it). The comparison itself is unchanged.
3. Finding CI-S-02 says the word in Jaap Sahib 96–98 occurs in "eleven places". The register has **12** (5 in one spelling, 7 in the other). The list of places in the finding was already complete; the count in its sentence was wrong.

## 9. What would close each kind

| Kind | Closed when |
|---|---|
| Layout only | The app divides the lines as the reference does, headings are headings, and a fresh comparison shows 0 of this kind. Saved places on the old rows still open. |
| Encoding fault | The three words are stored with the single sign; before-and-after record kept; the owner has signed it off. |
| Probable slip · Reading undecided · Word division · Closing mark or number | The owner has named one printed edition for Dasam Bani; a qualified reader has gone through the list against it and written keep or change, with the page, beside every row; each change is made with a before-and-after record and compared again by someone who did not make it. |
| Unpublished draft | The pause marks are removed or kept as a separate labelled layer, and a fresh comparison shows 117 of 117. |

The list for a qualified reader already exists for the 138 lines that differ in a letter: `scholar-packet/DASAM_BANI_DIFFERENCES_FOR_PRINT_COLLATION.md`, with an empty decision column.
