# RT-003 · Re-test of the linked-passage repair (candidate PR #47)

| | |
|---|---|
| Role | Independent second reviewer. I did not write this candidate and I have not changed it. |
| Candidate | PR #47, head `d8202caa1b7761c493f70eb9c13514f9b87f2801` — draft, unmerged, stacked on PR #40 at `1470477` |
| Finding under test | **R2-X-04** — following a link into Sukhmani Sahib replaced the reader's saved place |
| Criteria | Frozen on 26 November before this candidate existed: checks a–d under R2-X-04 in `RT-002_FROZEN_CRITERIA_BEFORE_SECOND_REPAIRS.md` |
| Compared with | `1470477` (the commit it sits on) and the published version `a3476ac` |
| Date | 26 November 2026 (UTC) |
| How | All three versions served from this reviewer's own machine. Chromium, phone-sized windows. Every note is made-up test text |
| Not done | No iPhone, no Safari, no VoiceOver, no WebKit engine, no real reader. Nothing here is a device result |
| Order of work | My own checks and the verdicts in sections 1 to 4 were committed **before** I opened the builder's tests, evidence or `docs/PR40_SUKHMANI_PASSAGE_VISIT_REPAIR_20261126.md`. Section 5 was added afterwards |

---

## 1. The answer

**R2-X-04 is fixed, and it is the cleanest repair of the three I have re-tested today.** All four frozen checks
pass, and so does every further situation I could think to try. Nothing in the Sukhmani reader regressed.

Arriving by a link is now a visit: the reader goes to the passage, a notice at the top names the place that is
being kept, and two buttons end the visit — **Return to saved place** and **Use this as my reading place**. Until
one of them is pressed, nothing at all is written to storage.

## 2. The four frozen checks

| # | Check | Result |
|---|---|---|
| a | Saved place Ashtpadi 3, Pauri 1; open the reader by a link to Ashtpadi 17 | **Pass.** The stored place is unchanged on arrival, and **no write to storage happens at all** |
| b | Close; open the reader the ordinary way | **Pass.** It opens at Ashtpadi 3 and offers "Saved place: Ashtpadi 3 · Pauri 1 · Ang 265 · Continue reading" |
| c | Read on after arriving by the link | **Pass.** Scrolling through four more Ashtpadis writes nothing; the notice stays on screen naming the kept place; "Return to saved place" brings it back and says so out loud |
| d | The same for a link into Japji Sahib | **Not applicable, and checked.** Japji has no working deep links: `#pauri05.line01`, `#line-100` and `#pauri-5` all leave the reader where it was, with the place untouched |

## 3. Everything else I tried

| Situation | Result |
|---|---|
| A note written during a visit | Saved, and the reading place still untouched. The visit does not block real learning |
| "Use this as my reading place" | Stored place becomes the visited one; the link leaves the address; the notice goes |
| "Return to saved place" | Back at Ashtpadi 3; link gone from the address; notice gone; says "Returned to your saved reading place." Ordinary reading saves normally again afterwards |
| Reload during a visit | Still a visit; place kept |
| Leave the page and press the browser's Back | Still a visit; place kept |
| Follow a link inside the page, then press Back | The visit ends and the reader returns to Ashtpadi 3 |
| A link to one line (`#sukhmani.a17.p03.l02`) | A visit; place kept |
| A link to a unit (`#unit-sukhmani.a17.p01`) | A visit; place kept |
| A link that does not exist | Handled well: "This passage link was not found in this reading pack", the reader stays at the saved place, and "Use this as my reading place" is disabled |
| The page's own skip link (`#sukhmani-text`) | Correctly **not** treated as a visit |
| Two tabs — one reading on, one visiting | The visiting tab's notice updates to name the place the other tab has moved to, and "Return" goes to that newer place. No tab overwrites the other |
| The notice at 320, 375 and 390 pixels wide | Inside the screen every time; both buttons at least 44 pixels and reachable; the linked line is clear of the notice; no sideways scrolling; it stays on screen while reading on |
| What a screen reader is given | A region "Linked passage visit", a status message naming the kept place, and the two buttons by name |

## 4. Nothing regressed

| Check | Result |
|---|---|
| Altered scripture refused | 21 of 21 in each of the two readers; no altered text shown; saved learning untouched 21 of 21 |
| Sukhmani reader | 2,027 lines, source verified; a note and a saved line survive a reload; export reachable |
| Gurbani and teaching files | 0 changed from `1470477` |
| Offline list | 57 entries, 57 fingerprints match; new version name `0.14.3-sukhmani-passage-visit-20261126-1` |
| Names of what the app stores | No new one |
| The quality gate | One test added for passage visits |

**One thing measured and found innocent.** Reading to a place in Sukhmani Sahib and then reopening six times moves
the stored place by one line on the first reopening and then not at all. This is identical on the candidate, on
`1470477` and on the **published version**, so it is neither new nor the drift that CI-R-11 described for Japji
(where it moved every time and kept going). Recorded, not charged against this candidate.

## 5. Two small remarks — candidate only

| # | What | Suggested |
|---|---|---|
| RT3-01 (low) | **A reader who has never used the app is told about a "saved place" they do not have.** Arriving by a link with nothing stored, the notice reads "Saved place: Ashtpadi 1 · Opening · Ang 262". And because a visit stores nothing, a first-time reader can read for an hour by that link and the app will remember none of it. | For a reader with no saved place: "You have no saved place yet. Reading here will not be saved unless you choose to use it as your reading place." |
| RT3-02 (low) | On a 320-pixel screen the visit notice is 201 pixels tall — **35 per cent of the screen**. At 390 pixels it is 19 per cent. | Let the two buttons sit side by side at narrow widths, or shorten the sentence once the reader has scrolled past it. |

Both are in `RT-003/candidate_findings.json`. Neither holds the verdict.

## 6. Comparison with the builder's tests

Added after sections 1 to 5 were committed and pushed (`fa3e3df`, 17:18 UTC). Only then did I open
`docs/PR40_SUKHMANI_PASSAGE_VISIT_REPAIR_20261126.md`, the new test file and the evidence.

| Run by me on the candidate | Result |
|---|---|
| `tests/sukhmani-passage-visit-browser.mjs` (the new suite, 9 scenarios) | 9 of 9 pass; no runtime errors — the same as the committed evidence |
| `verify.mjs`, `sukhmani-reader-core.mjs`, `shared-learning.mjs`, `japji-retained-learning.mjs`, `service-worker.mjs` | All pass. `shared-learning` has grown from 12 checks to 13 |

**We agree on every verdict.** The repair note claims nothing I did not find, and it is careful where it should be:
it says a hidden-document signal is simulated rather than tested on a device, and that the change invents no new
identity scheme.

**What each side covered that the other did not**

| Subject | The builder | This re-test |
|---|---|---|
| Offline: a cached reader opening a linked passage | Tested | Not tested |
| A hidden document (the phone's screen going off) | Simulated | Not tested |
| Encoded and out-of-range fragments | Tested | A plain non-existent fragment only |
| Links to a line and a unit, and Back across same-document changes | Tested | Tested — we agree |
| Another tab holding a newer place | Tested, with edits and export | Tested, two live tabs |
| The notice at 320 / 375 / 390 pixels, buttons measured and tap-tested | One geometry check | Three widths |
| The page's own skip link | Not covered | Correctly not a visit |
| What a screen reader is given | Not covered | Region, status and two buttons, by name |
| The 21 scripture alterations, after this change to the Sukhmani reader | Not re-run in this suite | 21 of 21 refused in each reader |

**One place where we looked at the same thing and concluded differently.** The builder's scenario "A first-time
visitor does not create a durable record until choosing a reading place" passes, and as a question about storage it
is right — nothing is written. My RT3-01 is about what that reader is *told*: the notice names a saved place
("Ashtpadi 1 · Opening · Ang 262") that does not exist, and the reader is never offered the chance to keep what
they have read. Both can be true at once; the storage behaviour is correct and the wording is not.

**No verdict in sections 1 to 5 changed after reading the builder's tests.**
