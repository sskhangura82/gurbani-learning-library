# Round 2 · Baseline and criteria, frozen before testing

**Reviewer:** Claude, independent second reviewer · **Written:** 25 November 2026, 23:52–00:10 UTC
**Assignment:** the owner's updated master assignment of 25 November 2026 and the detailed
version filed on PR #43 (comment 7174234036).

This file is committed **before** I open the code, tests, evidence files or PASS reports of
PR #41 and PR #43. Up to this point I have read only: the pull-request descriptions, the
builder's hand-off comment on #41, the detailed assignment, and the list of file names.

## 1. Exact state inspected

| | Head | Checks reported by GitHub at 23:53 UTC | State |
|---|---|---|---|
| `main` (published) | `a3476ac4b9be90dde350fb35dd13ce0b672c120d` | — | unchanged since the first review |
| PR #38 my review | `b98d4953f4cb293576358d6ba111c03cbcba36d1` | 3 of 3 pass | open |
| PR #39 my duplicate fix | `1cdb3f664f…` | — | closed by me in favour of #40 |
| PR #40 first repairs | `09e829efd63e99fc5c3f5f849f122a49b0dc22a9` | 4 of 4 pass | draft; **same head I re-tested in RT-001**; no reply yet |
| PR #41 Explorer, Ashtpadi 17 | `dc66da9f1e41e51408e47b7321ab5a414c44012b` | 5 of 5 pass | draft, on `main` |
| PR #42 build order | `16a48464e4d433dd12d685825c01395c90d64f7a` | 3 of 3 pass | draft, document only |
| PR #43 Daily Hukamnama reader | `fb49ef41bd890db879d7f93a861585915ef81622` | 2 of 2 pass | draft, stacked on #42 |

PR #40: the re-review asked for is RT-001 (`retests/RT-001_PR40_FIRST_REPAIRS.md`). Its head
has not moved, so there is nothing new to re-test; its four asks stand.

## 2. What PR #43 says it delivers (its promises)

1. The SGPC selections for 14 October 2025 and 25 November 2026 are the same Shabad: Gujri
   Mahalla 1, Ang 504–505, 19 occurrences (one heading, 18 lines), matching a pinned digital source.
2. A 25 November 2017 archive entry is held because of a legacy-encoding difference.
3. The limits of source verification are written in the data file.
4. Each dated event has its own identity; there is one provisional Shabad record.
5. The date is resolved for Amritsar. The data is checked and the reader refuses on failure.
6. Missing, held and future dates are stated plainly. No earlier or random reading is substituted.
7. No daily feed, no lesson, no audio, no change to the home page or offline copy, no deployment.

## 3. Criteria for PR #43 — Daily Hukamnama reader

Verdict words: **Pass · Partial · Fail · Not testable here**. Each verdict will name what was
examined and out of how many.

### Source text
| ID | Criterion |
|---|---|
| HS-01 | Every occurrence of Gurbani in the data equals the pinned reference letter for letter. I count the occurrences in the reference myself rather than accept 19. |
| HS-02 | The passage starts at the Shabad's first line and ends at its last. Nothing from a neighbouring Shabad. The final stanza is present. |
| HS-03 | The Rahao line is present, in its place, and can be recognised as Rahao on screen. |
| HS-04 | Each line carries the right Ang; the page turn from 504 to 505 falls where the reference has it. |
| HS-05 | Author, Raag and any section heading agree with the reference. |
| HS-06 | Stored hashes recompute. Identifiers are unique. The edition is named and pinned. |
| HS-07 | No legacy or stray characters; the same encoding conventions as the existing readers. |
| HS-08 | What is drawn on screen equals the data, in order, for every date that shows this Shabad. |

### Is the dated event real?
| ID | Criterion |
|---|---|
| HE-01 | For each date shown as confirmed, I try to retrieve the SGPC dated publication myself and compare the whole passage, not the first line. Where I cannot retrieve it I say so and grade the evidence I could get. |
| HE-02 | A second, independent witness (SikhNet's archive or another) for each date, where one exists. |
| HE-03 | The held 2017 entry is nowhere shown as confirmed, and its discrepancy is real (I check the two spellings). |
| HE-04 | The words on screen claim no more than the evidence: nothing says verified, approved or official beyond what was done. |
| HE-05 | The event is the morning Mukhwak at Sri Harmandir Sahib on a stated Amritsar date — not another time, place or calendar. |

### Dates
| ID | Criterion |
|---|---|
| HD-01 | "Today" is the Amritsar date whatever the device's time zone. Tested at the two instants either side of Amritsar midnight (18:29:59 and 18:30:00 UTC) with the device set to Los Angeles, UTC, India, the earliest and the latest time zones on Earth. |
| HD-02 | When the new Amritsar day has begun and no reading exists for it, the page says so. Yesterday's reading is never labelled today's. |
| HD-03 | A date with no reading, a future date, and invalid input (30 February, month 13, 29 February in a non-leap year, letters, empty, year 0001, year 9999, other formats, markup) each produce a plain statement and no Gurbani under a wrong date. No crash. |
| HD-04 | A reading shown for a past date always carries that date. It cannot be mistaken for today's. |
| HD-05 | A wrong device clock cannot make an old reading appear as today's without the date being visible. |
| HD-06 | The same Shabad on two dates is one Shabad in the data, referenced twice, not copied. |

### Refusing damaged data
| ID | Criterion |
|---|---|
| HI-01 | With the data altered on its way to the browser — a word changed; a line removed; lines reordered; the Rahao removed; the last stanza removed; an Ang changed; a date changed; an event pointed at another Shabad; a date duplicated; the Shabad duplicated; the file cut short, empty, missing or not valid — no Gurbani is shown and a clear message is. Never part of a passage. |
| HI-02 | The same when the stored line hash is recomputed to match the altered line. This asks where the expected values live: if they travel in the same file as the text, one accident or one hand can change both. |
| HI-03 | No Gurbani while the check is pending or when the browser cannot perform it. |
| HI-04 | The text cannot be changed after it has passed. |
| HI-05 | With the existing offline worker installed (published version and candidate #40), this reader's files and any date in the address are not answered from a stale copy. |

### Saved learning
| ID | Criterion |
|---|---|
| HL-01 | If the reader lets a person save anything, it survives reload, is included in a backup, and is not lost. If it offers nothing, that is recorded as absent, not as a pass. |
| HL-02 | Opening and using this reader leaves the saved learning of the other readers byte for byte unchanged. |

### Scope and rights
| ID | Criterion |
|---|---|
| HR-01 | No request leaves the device. No teaching is shown as approved. No audio. |
| HR-02 | Nothing outside the new folder changes; not linked from the home page; not in the offline copy. |
| HR-03 | The data holds no third-party translation, commentary or page text — only original Gurbani and the project's own descriptions. |
| HR-04 | The pinned source is named with its version and licence. |

### Use and access
| ID | Criterion |
|---|---|
| HA-01 | Automated accessibility scan in every state: reading, pending, missing, held, future, refused. |
| HA-02 | Date controls have names; Gurmukhi is marked as Punjabi; headings are in order; a change of state is announced; everything works by keyboard with visible focus. |
| HA-03 | No sideways scrolling at 320, 390, 768, 820, 1024, 1280 and 1440 CSS pixels; text enlarges to 200%; light and dark; reduced motion; print. |
| HA-04 | Messages are in plain words. |
| HA-05 | A first-time reader can tell what day's reading this is, where it is from, and where the Rahao is. |

## 4. Criteria for PR #41 — Explorer and Ashtpadi 17 lesson

### Scripture
| ID | Criterion |
|---|---|
| XS-01 | Every piece of Gurbani in the lesson file — cues, quoted words, headwords — equals the reference and the app's own Sukhmani text; the cues are the Salok and Pauris 1–8 in order; each Ang is right. |
| XS-02 | The link to the existing reader lands on Ashtpadi 17 after the page has finished loading. |
| XS-03 | The ਭਿ / ਭੀ note is correct against the reference. |
| XS-04 | No scripture file, published meaning or saved-learning code is changed. |

### Teaching — read by hand, all nine units
| ID | Criterion |
|---|---|
| XT-01 | Each of the nine units has what the description lists: short English, Punjabi, deeper teaching, 2–3 vocabulary entries, an interpretation boundary, a reflection question. |
| XT-02 | Each statement about a Pauri is carried by that Pauri's own lines. Where the lesson goes beyond the lines it says so. No softening; no talking about "the poet". |
| XT-03 | ਸਤਿ, ਹੁਕਮ, ਨਾਮ, ਬਿਬੇਕ and ਸੇਵਕ are not flattened into everyday English. |
| XT-04 | The Punjabi says the same as the English and reads as Punjabi. |
| XT-05 | Nothing presents Gurbani as treatment; clinical language is kept apart from interpretation. |

### Comparisons and sources
| ID | Criterion |
|---|---|
| XC-01 | Bhagavad Gita 2.16 and Dhammapada 183 are cited correctly, say what the lesson says they say, and each comparison states both the resemblance and the difference. |
| XC-02 | The psychology source exists, is what it is described as, and the lesson claims no more than it supports. |
| XC-03 | The history note on Sri Chand Ji is marked contested and is sourced. |
| XC-04 | Every listed source resolves and matches its description. No modern translation or commentary is reproduced. |

### Finding and discovering
| ID | Criterion |
|---|---|
| XQ-01 | Search answers only from written lessons. Empty, very long, markup, symbols, Gurmukhi, an Ashtpadi with no lesson, an unrelated question and a question from a person in distress each get an honest result; nothing unrelated is shown as an answer. |
| XQ-02 | The question typed is not sent anywhere and not kept. |
| XQ-03 | "Teach me something" draws only from the nine written units and says what it is. |

### Use, access, privacy, scope
| ID | Criterion |
|---|---|
| XA-01 | Automated accessibility scan in each state; keyboard; focus; headings; language marking; light and dark; reduced motion; print. |
| XA-02 | No sideways scrolling at 320, 390, 507 (tablet split view), 768, 820, 1024, 1280, 1440; Gurmukhi readable. |
| XP-01 | No request leaves the device; existing saved learning untouched. |
| XR-01 | Additive only; not linked from home; not in the offline copy; "AI-assisted, not reviewed" visible on screen. |

## 5. Criteria for PR #42 — the build order (a document)

| ID | Criterion |
|---|---|
| PB-01 | Every rule in the owner's assignment is carried: no random or earlier substitution; event separate from Shabad; no AI recitation; no invented or borrowed timings; permission before any use of a recording; no contact with custodians without authority; no live generated interpretation; free, private, no tracking. |
| PB-02 | Each phase has an exit test that can fail. |
| PB-03 | The counts the owner asked to be kept separate are separate. |
| PB-04 | Risks the plan does not name. |

## 6. Limits known before starting

- No iPhone, iPad, Android device, Safari or screen reader. Everything is emulation and will be labelled so.
- I am an AI system, not a Sikh scholar or a Santhiya teacher.
- The reference text is one digital source (Shabad OS Database v5.0.0-next.0), not print.
- Outside sites may refuse retrieval from my environment; each attempt will be recorded with its outcome.
