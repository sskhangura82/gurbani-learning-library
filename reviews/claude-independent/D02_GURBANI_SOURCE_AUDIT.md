# D02 · Gurbani source audit

**Scope:** every occurrence of original Gurbani the app serves at commit `a3476ac`.
**What kind of audit this is:** a complete *digital* audit — every occurrence was compared,
none sampled. It is **not** a collation against print and not a scholarly ruling. I am an AI
system. Where the app and the reference differ I cannot say which is right; I can only say
that they differ, where, and how.

## 1. Coverage register

Row-level register: [`evidence/s05_register.csv`](evidence/s05_register.csv) — one row per
occurrence, 3,809 rows.

| Check (test case) | Examined | Of | Result |
|---|---|---|---|
| Register built from shipped files (S-01) | 3,809 | 3,809 | 3,773 lines + 36 prefaces and headings; equals the app's declared counts |
| Stored hash recomputed (S-02) | 3,809 | 3,809 | all match |
| Unicode hygiene (S-03) | 3,809 | 3,809 | no stray characters; 26 Jaap lines are not stable under normalisation (CI-S-14) |
| Mark order with a text-shaping engine, 4 fonts (S-04) | 5,222 distinct words | 5,222 | no broken clusters drawn; pattern scan finds 7 lines with an invalid order (CI-S-02) and 1 unusual order kept from the source (CI-S-13) |
| Word-by-word collation with Shabad OS Database v5 (S-05) | 3,809 | 3,809 | table below |
| Second witness for each difference (S-06) | 1 | 138 | **not done** — see §5 |
| Counts and verse-number sequences (S-07) | 9 compositions | 9 | correct: 38 pauris; 199 chhands; 10; 29; 40; 24 × 8 pauris |
| Ang references (S-08) | 2,733 | 2,733 | 2,732 agree; the one difference is a page turn where the app is right |
| Headings in place, never shown as verse (S-09) | 9 | 9 | fails in Rehras (CI-S-10) and in the Savaiye and Chaupai openings (CI-S-05); one invocation typed as verse in Jaap 62 (CI-S-01) |
| Rehras and Chaupai boundaries (S-10) | 2 | 2 | match what the app says it follows; said in jargon (CI-S-09) |
| Text on screen equals data, all depths, all readers (S-11) | 11,319 line renderings + 36 headings; order checked for 1,397 Nitnem rows | same | identical |
| Named edition and licence trail (S-12) | 9 | 9 | fails: no printed edition named anywhere (CI-S-12, CI-X-03) |
| Printed edition consulted | 0 | 3,809 | **outstanding** |

## 2. Collation result

Reference: Shabad OS Database v5.0.0-next.0 — its SGPC Shabadaarth text for Sri Guru Granth
Sahib and its Dasam Granth text for Dasam Bani. Its pause marks were removed before
comparison; nothing else was normalised.

| Composition (part) | Occurrences | Exact | Danda or verse number only | Line division only | Spacing only | **Letter-level** |
|---|---|---|---|---|---|---|
| Japji Sahib | 385 | 385 | – | – | – | **0** |
| Sukhmani Sahib | 2,027 | 2,027 | – | – | – | **0** |
| Anand Sahib | 210 | 209 | 1 | – | – | **0** |
| Sohila | 56 | 51 | 1 | 4 | – | **0** |
| Rehras — nine shabads | 23 | – | 2 | 21 | – | **0** |
| Rehras — Anand pauris | 32 | 32 | – | – | – | **0** |
| Rehras — Mundavani, Salok | 2 | – | – | 2 | – | **0** |
| *Sri Guru Granth Sahib subtotal* | *2,735* | *2,704* | *4* | *27* | – | ***0*** |
| Jaap Sahib | 808 | 750 | 5 | 8 | 11 | **34** |
| Tav-Prasad Savaiye | 43 | 21 | 8 | 1 | 1 | **12** |
| Benti Chaupai | 121 | 49 | 16 | 1 | 5 | **50** |
| Rehras — Chaupai | 100 | 42 | 14 | – | 4 | **40** |
| Rehras — Swaiya, Dohra | 2 | – | – | – | – | **2** |
| *Dasam Bani subtotal* | *1,074* | *862* | *43* | *10* | *21* | ***138 (12.8%)*** |
| **All** | **3,809** | **3,566** | **47** | **37** | **21** | **138** |

Kinds of letter-level difference (256 individual records in
[`evidence/s05_differences.json`](evidence/s05_differences.json)): vowel sign 62 ·
letters or word 43 · nasal sign 18 · addak 10 · half-ਯ form 6 · dot under letter 5 ·
order of marks 3 · word only in app 2 · plus 77 danda/number and 30 spacing records.

## 3. What this does and does not establish

**Sri Guru Granth Sahib text.** No letter differs in 2,735 occurrences. This is strong
evidence of faithful copying. It is weak evidence of correctness, for one reason: Japji,
Sukhmani and Anand were taken from Open Granth, whose Gurmukhi comes from the Shabad OS
database — the same family as my reference. The builder compared Sukhmani with SriGranth
(2,027 exact) and wrote the same caveat. Two or three websites agreeing is not a printed
saroop agreeing (CI-S-12).

**Dasam Bani text.** One occurrence in eight differs. I saw two further web copies of one
line (Jaap 1.2) and they disagreed with each other — one with the app, one with the
reference. That is the general picture for Dasam Bani online: matras vary from copy to copy,
and only a named printed edition read by qualified people can settle it. The builder's
pass condition for Jaap was "equal to a BaniDB snapshot"; equality with one provider also
copies that provider's slips (CI-S-02, CI-S-03).

**No error is proven.** Nothing in this audit has been checked against print. That is why
no finding is rated critical and six are rated "critical if confirmed".

## 4. Findings

Full entries with location, evidence, correction and acceptance test are in
[`FINDINGS_REGISTER.md`](FINDINGS_REGISTER.md).

| ID | Severity | In one line |
|---|---|---|
| CI-S-02 | High (S0 cand.) | Jaap 96–98: one word stored two ways ("ਚੱਤ੍ਰੁ" / "ਚੱਤੁ੍ਰ"), the second in an invalid order; reference "ਚੱਤ੍ਰ" |
| CI-S-03 | High (S0 cand.) | Jaap 108.4 "ਗੈਬੁਲ ਗ਼ੈਬ", 122.4 "ਜ਼ਮੀਨਲ", 198.4 "ਕਰੀਮਲੁ" beside 198.2 "ਕਰੀਮੁਲ", 179.4 missing space |
| CI-S-05 | High (S0 cand.) | Savaiye and Chaupai openings fused: "ਪਾਤਿਸਾਹੀ੧੦॥ ਤ੍ਵਪ੍ਰਸਾਦਿ ॥ ਸ੍ਵਯੇ ॥"; ੴ cut off from what follows |
| CI-S-06 | High (S0 cand.) | Chaupai: 50 of 121 differ; text from an unnamed web source that the builder had to correct in six places this release |
| CI-S-07 | High (S0 cand.) | Savaiye: 12 of 43 differ; same unnamed source |
| CI-S-11 | High (S0 cand.) | Rehras Swaiya and Dohra differ in six words; Dohra number absent |
| CI-S-10 | High | Rehras: nine shabads shown as 23 run-on blocks, headings inside verse, 105 missing spaces after ॥ |
| CI-S-12 | High | No printed edition named for any composition |
| CI-S-04 | Medium | Jaap: the remaining differences among the 34, for print collation |
| CI-S-08 | Medium | Verse numbering of Chaupai and Savaiye follows a gutka convention not stated |
| CI-S-09 | Medium | Which Chaupai and which Rehras: tradition choice made, explained in jargon — **owner decision** |
| CI-S-13 | Medium | Anand 24.3 "ਕਚਂੀ": stored as in the source; must be looked at on a real iPhone |
| CI-S-01 | Low | Jaap 62: invocation typed as a verse line (my earlier "reversed order" claim was wrong and is withdrawn — see `02_COMPARISON…`) |
| CI-S-14 | Low | Two headings without ॥; extra dandas in Jaap 55–56; 26 lines fragile under normalisation |
| CI-S-15 | Low | Not an app defect: the reference database's ready-made Sukhmani list omits one line (the app has it) |

## 5. What was not done, plainly

- **Print collation: none.** I have no printed saroop, Dasam Granth or gutka.
- **Second digital witness (S-06): 1 of 138.** BaniDB and SriGranth could not be reached
  from my environment; the builder's own comparison files are not in the repository
  (CI-X-03).
- **Manuscript or edition history:** not attempted.
- **Real-device rendering of Gurmukhi:** not done (CI-A-05). Apple's text engine may draw
  the two unusual sequences differently from the engine I used.

## 6. Packet for qualified reviewers

[`scholar-packet/DASAM_BANI_DIFFERENCES_FOR_PRINT_COLLATION.md`](scholar-packet/DASAM_BANI_DIFFERENCES_FOR_PRINT_COLLATION.md)
(and `.csv`) lists all 138 occurrences: place, page, the app's line, the reference line, the
exact word that differs, and an empty "decision" column. A reviewer with one printed edition
can work through it in a sitting or two.

Questions only qualified people can answer:

1. Which printed edition should each composition follow? (Suggested for discussion, not
   decided: the SGPC standard 1430-page saroop for Sri Guru Granth Sahib; one named SGPC
   or other gutka for Nitnem Dasam Bani.)
2. For Dasam Bani, should the app follow the gutka tradition (with its own verse numbers)
   or the Dasam Granth text?
3. Are "ਤੇਰਾ ਜੋਰੁ ॥" and similar invocations to be shown as headings or as lines?
4. Which Rehras and which Chaupai (CI-S-09)?

## 7. Rules I recommend for every future scripture change

These restate the assignment and add what this audit showed is needed.

1. One named printed edition per source; photographs of the pages relied on are kept.
2. Each change records: previous reading, new reading, edition and page, who decided.
3. Evidence files cited in an audit are committed with it.
4. Saved-learning migration is tested *before* any change that alters a line ID (CI-R-03).
5. Meanings bound to a changed line are re-read by a person, not only re-hashed.
6. A second reviewer who did not make the change re-collates it.
