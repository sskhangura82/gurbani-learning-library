# Round 3b · Re-test of the knowledge-registry repair (candidate PR #48)

| | |
|---|---|
| Role | Independent second reviewer. I did not write this candidate and I have not changed it. |
| Candidate | PR #48, head `94f004a842eb1bdf2da879074c2f4c701d54030e` — draft, unmerged, stacked on PR #45 at `8fa9206` |
| Findings under test | **R3-01** (Salok name collision), **R3-02** (a line has no lasting identity), **R3-03** (Gurbani and teaching share one file and one fingerprint), and the titles part of **R3-04** |
| Criteria | Frozen in round 3, before PR #45 was opened: `round3/00_BASELINE_AND_FROZEN_CRITERIA_ROUND3.md` |
| Compared with | PR #45 at `8fa9206`, and my pinned reference: Shabad OS Database 5.0.0-next.0, asset SSA2 |
| Date | 26 November 2026 (UTC) |
| How | Chromium, phone-sized windows; the reference database queried directly; the candidate's own loader used to build the pack the page sees |
| Not done | No iPhone, no Safari, no VoiceOver, no printed page, no qualified reader. Nothing here is a device result |
| Order of work | Sections 1 to 6 were committed **before** I opened the builder's tests, evidence or `docs/GLP_KNOWLEDGE_SOURCE_REGISTRY_REPAIR_20261126.md`. (I did read the changed application code — `registry.mjs`, `source-lock.mjs`, `core.mjs`, `app.mjs` — which the protocol allows at any time.) Section 7 was added afterwards |

---

## 1. The answer

**All four are fixed, and the third is fixed thoroughly.** This is the strongest piece of work I have reviewed on
this project.

| Finding | Verdict | In one line |
|---|---|---|
| **R3-01** Salok name collision | **Fixed** | Names now come from the structure of the Vaar, and I verified the structure myself against the reference |
| **R3-02** no lasting line identity | **Fixed** | Every line has a logical identity apart from its row in a file, with a complete old-to-new crosswalk |
| **R3-03** Gurbani and teaching share one file and one fingerprint | **Fixed** | Two files, two fingerprints, an independent scripture pin, and bindings that go stale when either side moves |
| **R3-04** editorial titles stand as Saloks' names | **Fixed, for the part claimed** | A passage is now named by its own first line; the editorial title is a labelled note below it |

One real gap remains inside the new machinery (section 5, RB-01): an editorial title may still be written as a line
of Gurmukhi that reads like a scripture heading. Everything else I tried was refused.

No Gurbani changed: 19 of 19 lines still equal my reference letter for letter.

## 2. R3-01 — the names are true, and I checked them myself

R3-01 said `sggs.asa.470.m1.salok01` fitted two different Saloks of Mahalla 1 on Ang 470. The candidate renames
passages by where they stand in the Vaar. Rather than accept that, I worked the structure out from the reference
database, reading the Pauri numbers **from the text itself** (each Pauri ends ॥N॥):

- Asa Ki Vaar: 24 Pauris found, numbered 1 to 24 in the text, in order.
- `sggs.asa-di-vaar.pauri014.salok01` — Guru Nanak, Ang 470, 8 body lines. In the reference it stands before
  Pauri 14 and is Salok 1 of 1 there. **The name matches where it actually is.**
- `sggs.asa-di-vaar.pauri007.salok02` — Guru Angad, Ang 466, 7 body lines. Before Pauri 7, Salok 2 of 2.
  **Matches.**
- `sggs.kabir.salok007` — in "Salok Kabeer Jee", it is group 7, and that group's own closing number is ॥੭॥,
  on Ang 1364. **Matches.**

**The collision is gone.** The four Saloks on Ang 470 now carry four different names
(`pauri013.salok01`, `pauri013.salok02`, `pauri014.salok01`, `pauri014.salok02`), and the one that collided —
ਨਾਨਕ ਮੇਰੁ ਸਰੀਰ ਕਾ, before Pauri 13 — is plainly distinct from ours. Across the whole Vaar the scheme produces 374
Salok names and **no name is used twice**.

Evidence: `evidence/k3b_01_structural_identity.json`.

## 3. R3-02 — identity, and the crosswalk

| Check | Result |
|---|---|
| A line's identity apart from its row in a file | Each line is `<passage>.line01…` or `<passage>.heading01`; the edition's own locator (Ang, path, git blob) is carried separately |
| The loader enforces it | The identity is derived from the structure and compared: a changed Pauri number with the name left alone is refused, and so is a renaming done the other way round |
| Old occurrence names | 19 of 19 map to exactly one new name; no new name is claimed by two old ones |
| The text behind each mapping | 19 of 19 old-to-new pairs hold identical text |
| Old passage names | 2 of 3 present; the third (`sggs.kabir.salok007`) is absent because **the name did not change** — see RB-02 |
| Stored fingerprints | 19 of 19 recompute |

## 4. R3-03 — the separation is real, and I tried to break it

Gurbani now lives in `knowledge/scripture.json` under its own pin in `source-lock.mjs`; teaching lives in
`knowledge/pilot.json` under its own. I made 30 edits, each the way a careless but honest editor would — **the
edited file's own digest regenerated to match**, so only a genuinely independent check could catch it.

| Group | Caught |
|---|---|
| Scripture edited, its pin regenerated | **15 of 15** |
| Teaching trying to define or restate scripture | **10 of 11** |
| Pin left alone (what the page actually ships) | 2 of 2 |
| Ordinary teaching edits that **must** be allowed (a reworded lesson sentence, a new concept) | 2 of 2 correctly allowed |

Stated as one sum, because it is easy to say loosely: of the 30 edits, **28 were unwanted and 27 of those were
caught; 1 got through (RB-01); the other 2 were edits that had to be allowed, and both were allowed.** "29 of 30"
would be wrong — it counts the two permitted edits as catches.

Worth naming, because these are the ones that matter: a single nasal sign dropped with the line's own fingerprint
recomputed is still caught by the **passage** fingerprint; recomputing the line fingerprint, the passage fingerprint
and the file pin together is still caught, because the **lesson's stored binding** goes stale. A teaching pack that
carries its own copy of the lines is refused ("Invalid editorial pack"); one that declares a passage or an author is
refused ("Editorial pack attempts to define scripture or its attribution").

**Set beside round 3:** the same 35 edits from `round3/tools/k3_cases.mjs` were put through the page's own data
check. Round 3: 14 of 35 noticed, Gurbani 1 of 11. Now: **30 of 30 that could be applied, Gurbani 11 of 11.** The
other 5 addressed items by names that no longer exist; I made the same five changes directly to the new files
instead (author changed, Ang changed, passage marked reviewed, edition marked human-collated, attribution moved) and
**all five were caught**.

Evidence: `evidence/k3b_02_separation_mutations.json`.

## 5. R3-04 — titles, and the one gap

On screen a passage is now headed by its own first line, tagged as Punjabi:

> ਸਿੰਮਲ ਰੁਖੁ ਸਰਾਇਰਾ ਅਤਿ ਦੀਰਘ ਅਤਿ ਮੁਚੁ ॥
> Library topic (editorial): Humility beyond appearances
> ਲਾਇਬ੍ਰੇਰੀ ਦਾ ਵਿਸ਼ਾ: ਅਸਲੀ ਨਿਮਰਤਾ
> Guru Nanak Dev Ji · Asa Di Vaar · Ang 470 · Raag Asa

The editorial title is still findable: searching "Humility beyond appearances" reaches the passage. So the name was
moved without being lost.

**RB-01 (medium) — an editorial title may be written as Gurbani.** Setting a passage description's title to
`ਸਲੋਕੁ ਮਃ ੧ ॥` is accepted by every check. On screen it would read "Library topic (editorial): ਸਲੋਕੁ ਮਃ ੧ ॥" — the
label is there, but a Gurmukhi heading would be sitting in it. Of all 30 edits this was the only one not refused.
Suggested: refuse Gurmukhi in an editorial title that matches a heading form, or require editorial titles to carry
their own marking.

## 6. Nothing else moved

| Check | Result |
|---|---|
| The 19 lines against my reference | 19 of 19 equal, and equal to the file the pilot cites |
| Salok boundaries | 9 / 8 / 2 rows, first and last line right in each |
| Ang, printed line, fingerprint, character inventory | 19 of 19, no odd characters |
| Search — the 582 round 3 cases, re-judged with my old names mapped through the candidate's own crosswalk | **Every group identical to round 3.** The four Ang wordings that failed then ("page 466", "p. 470", "Ank 470", "ਪੰਨਾ ੪੭੦") fail now; nothing new fails |
| The page | Loads clean, no console errors, status "Development pack verified" |

A note on method: at first glance the search looked worse (Ang 19/23 → 11/23, author filter 15/15 → 11/15). Every
one of those was my own script holding the **old** passage names. Mapped through the crosswalk, all groups match
exactly. I record it because it is the kind of mistake that could have been published as a regression.

Still open, and outside what this candidate claims: R3-05 to R3-09, and R3-11's wording — "PASSAGE · DEVELOPMENT
DRAFT" still sits directly above a line of Gurbani, and the status still reads "Development pack verified".

## 7. Comparison with the builder's tests

Added after sections 1 to 6 were committed and pushed (`e17ab63`). Only then did I open the tests, the evidence
files and `docs/GLP_KNOWLEDGE_SOURCE_REGISTRY_REPAIR_20261126.md`.

| Run by me on the candidate | Result |
|---|---|
| `tests/knowledge-contract.mjs` | Pass |
| `tests/knowledge-source-registry.mjs` (new) | Pass — 29 checks, 15 source mutations, 8 stale-editorial mutations |
| `tests/knowledge-source-witness.mjs` (new) | Pass — 4 pinned files, 19 matched occurrences, 3 passages |
| `tests/knowledge-browser.mjs` | Pass — 15 checks |
| The committed evidence against my own runs | Identical, field for field |

The gate now runs the two new suites and keeps their evidence for 90 days.

**The repair note is the most careful document the builder has written on this project.** It states its own limit
in plain words: separated custody and corruption detection, *not* authentication against someone who controls the
whole release. That is exactly what my mutations showed — every honest mistake I could invent was caught; a party
who replaced the verifier, both pins and all the fingerprints together would not be. It also says the registry is
provisional for three passages and not an approved global canon, and that reader storage keys are untouched.

**What each side covered that the other did not**

| Subject | The builder | This re-test |
|---|---|---|
| Mutations of the source with digests regenerated | 15 | 15, chosen independently |
| Stale editorial bindings | 8 | 11 teaching mutations, including two that must be allowed |
| The structure of the Vaar checked against a reference | Verified against the pinned corpus (Open Granth) | Verified against a **different** reference — Shabad OS 5.0.0-next.0 — reading the Pauri numbers from the text |
| Every Salok name in the Vaar tested for repeats | Not covered | 374 names, none repeated |
| The 582 round 3 search cases | Not covered | Rerun, mapped through the crosswalk, identical to round 3 |
| On-screen appearance of the editorial title | A browser suite of 15 checks | Headings, labels, language tags and the search route to the editorial title |
| An editorial title written as a Gurbani heading | Not covered | **RB-01 — the one edit of 30 that was accepted** |

**No verdict in sections 1 to 6 changed after reading the builder's tests.**

## 8. What I would ask for next

1. RB-01 — refuse an editorial title that reads as a scripture heading.
2. RB-02 — list every passage in the crosswalk, or say that unchanged names are left out.
3. R3-11's wording: "PASSAGE · DEVELOPMENT DRAFT" still sits directly above a line of Gurbani, and the page still
   says "Development pack verified". Neither is in this candidate's scope, and both are still worth correcting
   before anyone outside sees the pilot.
4. Then R3-05 to R3-09 (search accidents, first-letter search, the Haumai lesson's missing half-line, the Punjabi
   carrying less than the English, and no address for an item).
