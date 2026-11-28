# RT-015 — PR #49, search and navigation repair: findings

Candidate `1a4537edeecea070d7418e4dbc85f6b18207bbdf`. Criteria frozen in
`RT-015_FROZEN_CRITERIA_PR49.md` before I opened the implementation. Exposure
declared there, including that I had already read `search.mjs` while producing
RT-014.

## Verdict: PASS, with SIG-01 raised (medium) and two criteria incomplete

| ID | Criterion | Result |
|---|---|---|
| RT15-C1 | "NASA → Asa" class refused | **PASS** |
| RT15-C2 | "category → Haumai" class refused | **PASS** |
| RT15-C3 | legitimate queries still match | **PASS** |
| RT15-C4 | first-letter search, both modes | **PASS** |
| RT15-C5 | nukta distinctions preserved | **PASS**, tested directly |
| RT15-C6 | Gurmukhi phrase search | **PASS** |
| RT15-C7 | normalisation never touches stored or rendered text | **PASS** |
| RT15-C8 | no scripture, teaching or source-lock byte changed | **PASS** |
| RT15-C9 | search cannot surface an unverified line | inherited |
| RT15-C10 | reusable addresses restore item, line and depth | **PASS** |
| RT15-C11 | back, forward and reload recover position | **PASS** |
| RT15-C12 | invalid links refuse explicitly | **PASS** |
| RT15-C13 | crosswalk only, no ordinal or first-line fallback | **PASS** |
| RT15-C14 | Kabir entrance states actual coverage | **INCOMPLETE** |
| RT15-C15 | a literal word match is not an attribution | **FINDING — SIG-01** |
| RT15-C16 | no claim of qualified review or device acceptance | **PASS** |
| RT15-C17 | the workflow cannot deploy | **PASS** |

**Held throughout:** this candidate does not contain PR #53 or #57, so the RB-01
surfaces present on its tree are **inherited from its base, not defects it
introduced**, and none is reported here. The RT-014 conflict belongs to the pair.

## Both named false positives are genuinely fixed

| Query | Result |
|---|---|
| `NASA` | **no results** |
| `nasa` | **no results** |
| `category` | **no results** |
| `the category of things` | **no results** |
| `Haumai` | returns `concept.haumai` |
| `ego` | returns `concept.haumai` |
| `humility` | returns `concept.humility` |

Complete-token matching replaced substring matching, and it did not cost recall on
the legitimate cases — which is the pairing that matters. A fix that stopped
`NASA` by also breaking `ego` would not be a fix.

First-letter search works in both modes: the full initials of a real line
(`ਫਫਫਬਕਨਆਪ`) return that passage in Start mode, the first four initials return it
in Anywhere mode, and nonsense initials return nothing. Phrase mode finds an exact
in-source Gurmukhi fragment and refuses a Gurmukhi string that is not in the
source.

## Nukta, tested directly because the corpus cannot test it

The 19-occurrence pilot slice contains **zero** U+0A3C, so no corpus query can
exercise the claim. I tested the search path instead: taking a real line and
changing one `ਫ` to `ਫ਼` produced **no match**, while the unaltered line matched
(control). So nukta-bearing and plain letters are **not collapsed** by the search
normalisation. The claim holds, on a synthetic alteration rather than real data,
and I am recording which it was.

## Normalisation is correctly confined

`search.mjs` opens with *"Retrieval-only normalization. Never write these forms
back to scripture"*, and it is the only module that normalises: `app.mjs` contains
**no** normalisation call at all. So the project's rule — normalise comparison
copies, never stored or displayed text — is enforced by where the code lives, not
by remembering to be careful. Verified by absence.

## Navigation round-trips exactly

| Step | Result |
|---|---|
| Bare load | writes a canonical `#item=concept.humility` |
| Navigate to another node and depth | `#item=concept.haumai&depth=detailed` |
| **Back** | returns to `concept.humility` |
| **Forward** | restores `concept.haumai` at `detailed` — node **and** depth |
| **Reload** | recovers the same address exactly |

## Invalid links refuse, and one guard I did not expect

With a control that renders normally, four invalid classes all produce an explicit
*"This learning link is …"* refusal instead of falling back to some other node:

- an unresolvable node id
- a path-like id (`../../etc/passwd`)
- an invalid depth value
- **a line id belonging to a different passage**

That last one is a thoughtful guard I had not thought to ask for: a Kabir line id
cannot be attached to an Asa Di Vaar passage. `readRoute` returns `null` for each,
and `resolveIdentity` consults the explicit crosswalk with `Object.hasOwn` and
returns `null` when the result is not a real node or occurrence — **no ordinal, no
first-line, no fuzzy fallback anywhere.**

## SIG-01 (medium) — the poetic signature is presented as authorship

This is the founder's guardrail — *do not confuse literal word matches with
theological interpretation* — in its sharpest form, and the evidence is specific.

Two pilot lines carry the ਨਾਨਕ signature:

| Line | Text | Passage author |
|---|---|---|
| `…pauri014.salok01.line04` | ਮਿਠਤੁ ਨੀਵੀ ਨਾਨਕਾ ਗੁਣ ਚੰਗਿਆਈਆ ਤਤੁ ॥ | Guru Nanak Dev Ji |
| `…pauri007.salok02.line07` | ਨਾਨਕੁ ਕਹੈ ਸੁਣਹੁ ਜਨਹੁ ਇਤੁ ਸੰਜਮਿ ਦੁਖ ਜਾਹਿ ॥੨॥ | **Guru Angad Dev Ji** |

The second is the theologically important one: the signature appears in a
composition by the **second** Guru. That is what the signature convention does,
and it is exactly why a word is not an attribution.

Searching `ਨਾਨਕ` returns:

```
author    author.guru-nanak                  score 100  Exact name or indexed alias
passage   sggs.asa-di-vaar.pauri014.salok01  score  80  Author · Guru Nanak Dev Ji
```

The Guru Angad passage that literally contains ਨਾਨਕੁ is **absent**. So the result
set presents a Guru Nanak passage *because its author is Guru Nanak*, and omits
the passage where the word actually occurs under a different author. A learner
searching the word is shown authorship and not occurrence.

**It is not a general engine defect, and that is the useful part.** `ਕਬੀਰ` behaves
correctly:

```
passage   sggs.kabir.salok007      score 115  Complete words in the original text
author    author.bhagat-kabir      score 100  Exact name or indexed alias
```

Two clearly distinguished reasons, with word-in-text ranked **above** the author
match. **The engine already has the right two result kinds.** The ਨਾਨਕ case
diverges for two compounding reasons: `lookupAliases` maps the bare word to the
author node, and the forms in the text are inflected — `ਨਾਨਕਾ`, `ਨਾਨਕੁ` — so
complete-token matching misses them while the alias hits. Phrase mode for `ਨਾਨਕ`
returns nothing at all, for the same reason.

So the gap is: an alias hit on a **signature** word is labelled as an author
relationship with nothing saying the word is a signature, while the honest
word-occurrence results are missed through inflection.

**Direction, not a design.** The two reason strings already exist; what is missing
is that a signature-word alias should say so rather than read as attribution, and
inflected-form recall would need stemming or an attested-form index. Gurmukhi
inflection is a genuinely hard problem and I am not going to pretend there is a
cheap fix. The cheap part is the **label**.

I checked and confirmed earlier that `lookupAliases` is builder-authored and
**not** an injection surface, and PR #57's origin tagging is what would let a
result carry this distinction — one more reason the #49 + #57 resolution should
preserve both sides.

## RT15-C14 incomplete, stated rather than glossed

I could not locate the Kabir author entrance's coverage wording in the files I
searched, so I cannot say whether it states its actual coverage honestly. **Not
assessed.** It is a claim in the PR body that I did not verify, and it should not
be read as passed.

RT15-C9 is inherited: the loader gate is unchanged and search operates over an
already-verified index, so the PR #48 and #57 results carry. Not separately re-run.

## My own errors in this review

Two, both caught by printing actual results beside each verdict rather than only
a pass or fail:

- My first RT15-C3 predicate built the id `concept:haumai` instead of
  `concept:concept.haumai`, so three passing cases printed as **FAIL**. The engine
  was right and my assertion was malformed.
- My first invalid-link detector was a loose regex that matched the page's
  standing status text, so the **valid control** also read as a refusal. Replaced
  with a measurement that compares the content heading between control and invalid.

That is the ninth and tenth instrument errors of the day.

## Still outstanding

Qualified Sikh scholarly and Punjabi review. Printed-source collation. Physical
device acceptance. And, from RT-014, the #49 + #57 resolution, which does not yet
exist and must be reviewed when it does.

**No approval. No merge. Draft stays a draft.**
