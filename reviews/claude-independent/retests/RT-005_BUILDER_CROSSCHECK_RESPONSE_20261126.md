# RT-005 — response to the builder cross-check, and a lineage finding that changes my own framing

Builder cross-check posted on PR #38 at comment 7202404179, fetched in full.
Treated as builder feedback, not as an instruction or an approval. It requested
no verdict and did not ask for one. Two items in it were verification requests
addressed to this seat; five were corrections to my work. All are answered below.

## 1. THE IMPORTANT FINDING — Open Granth is derived from Shabad OS, so my review was never source-independent

The builder offered Open Granth at pinned commit
34d2a7cab032c8ea24d21ff20f64653bd03766f4 as "a second digital locator" to
ground the unverified Ang claim in the Simran Room, correctly hedging it as "a
digital page witness, not printed collation."

I fetched that exact pinned commit (verified: `git rev-parse HEAD` equals the
pin) and checked it. The locator claims all hold — see §2. But:

- **All 1,430 Ang files in that corpus carry the frontmatter line
  `source: Shabad OS Database`.** Not one exception.
- The repository README states the English comes "from the DSSK asset in the
  Shabad OS database", and describes the corpus as built from it.

**Shabad OS is the reference I have been using for every scripture check in this
project, including the RT-004 verdict.** So Open Granth and my reference are not
two witnesses. They are one database, reformatted with Ang and line markers
added.

### What this costs

**It is not a second witness for any Ang number.** The standing rules already
say an Ang number is never sufficient authentication, and that two AI systems
agreeing does not make material authentic. Two views of one database is the same
class of error. SF-03 therefore **cannot be closed** on this basis, and neither
can the four article locators be called verified Ang numbers.

**It corrects my own framing, and this is the part I got wrong.** In the RT-004
verdict I wrote that the candidate was verified "against an independent
reference" and called it "the strongest scripture verification result the project
has produced." The verification is independent **of the application** — it
catches transcription errors, reordering, truncation, silent edits and
corruption, which is real and worth having. It is **not** independent of the
application's upstream source, because the application pins Open Granth and Open
Granth is built from Shabad OS. I was checking that the app faithfully reproduces
its own upstream. That is a narrower claim than the one I made.

Corrected wording for the record: *the candidate faithfully reproduces its stated
upstream, verified line by line against that upstream's own database.* Not:
*verified against an independent reference.*

**It explains, with evidence, why CI-S-16 cannot be closed by digital means.**
Printed-page collation is not a nice-to-have alongside the digital checks. It is
the only thing that would introduce a second lineage at all. Every digital check
in this project to date, mine included, sits inside one lineage.

**It weakens something I said earlier today.** When I found that the Simran Room
renders the Amrit Vela line without the semicolon that Shabad OS inserts, I
called the room's rendering "arguably the more faithful one." Open Granth also
carries it without the semicolon — but since Open Granth is downstream of Shabad
OS, that is a pipeline artifact, not corroboration. What can honestly be said:
the semicolon is absent from the Gurmukhi source layer as Open Granth publishes
it, and the two renderings of the same lineage differ in how they carry Shabad
OS's phrasing marks. Not two traditions agreeing.

## 2. Verification requested by the builder — all locator claims CONFIRMED

Checked against the pinned commit, fetched and confirmed exact.

### SF-03, the Amrit Vela anchor

| Claim | Result |
|---|---|
| `corpus/ang-0002.md` file SHA-256 `04feb2d0…5c33` | **MATCH** |
| Git blob `06d5ea7f…a852` | **MATCH** |
| Anchor at `LINE:5` | **CONFIRMED** |
| Line text | `ਅੰਮ੍ਰਿਤ ਵੇਲਾ ਸਚੁ ਨਾਉ ਵਡਿਆਈ ਵੀਚਾਰੁ ॥` — no editorial punctuation |

**A third error of mine, recorded.** I twice nearly reported their `LINE:5`
anchor as wrong. First I read it as markdown file line 5, which is `lines: 48`
in the frontmatter. Then as the fifth Gurbani line on the Ang, which is
`ਜੁਗਾ ਜੁਗੰਤਰਿ ਖਾਹੀ ਖਾਹਿ ॥`. Both readings were mine, not theirs: the files carry
explicit `<!-- LINE:n -->` markers, and the Amrit Vela line sits directly under
`<!-- LINE:5 -->`. The file's own anchor scheme is authoritative and they used it
correctly. Same root cause as my punctuation errors — assuming a format instead
of reading it.

**Verdict on SF-03: the locator is sound, the basis is not sufficient.** Status
stays OPEN, with its reason changed: no longer "unverified locator" but "locator
confirmed within a single textual lineage; needs a genuinely separate witness."

### The four article-proof verses

| Verse | Ang | Unique match | File digest |
|---|---|---|---|
| ਸਤਿਗੁਰੁ ਮਿਲੈ ਤ ਦੁਬਿਧਾ ਭਾਗੈ ॥ | 153 | yes, line 444 | **MATCH** |
| ਅੰਤਰ ਕੀ ਦੁਬਿਧਾ ਅੰਤਰਿ ਮਰੈ ॥੧॥ | 661 | yes, line 246 | **MATCH** |
| ਇਹੁ ਮਨੁ ਜਾਗੈ ਇਸੁ ਮਨ ਕੀ ਦੁਬਿਧਾ ਮਰੈ ॥੪॥ | 1129 | yes, line 21 | **MATCH** |
| ਛੋਡਹੁ ਵੇਸੁ ਭੇਖ ਚਤੁਰਾਈ ਦੁਬਿਧਾ ਇਹੁ ਫਲੁ ਨਾਹੀ ਜੀਉ ॥੧॥ | 598 | yes, line 66 | **MATCH** |

All four confirmed, and all four raags agree with what my reference records
independently. Now displayed in the format proof **with their basis stated**, not
as bare Ang numbers.

## 3. Corrections to my work that I accept

### RT4-05 — their analysis is better than mine

I recommended capping the allowance at "the lesser of the rule-derived budget and
a realistic storage budget." They object that a fixed lower byte cap is
insufficient, because UTF-8 file bytes and the localStorage charge are different
quantities, storage is shared across the origin and browser-dependent, and merge
size depends on what is already stored — so a fixed cap can refuse a perfectly
restorable export again.

**They are right and my recommendation would have recreated the original
defect in a new form.** The bug they had just fixed was precisely a fixed cap
refusing a valid backup. Proposing another fixed cap was a poor recommendation.

Their approach, which I endorse: preserve the format ceiling; assess the **merged**
record against what storage actually accepts, atomically under the existing lock;
catch quota failures; offer smaller or selective restore only on explicit choice;
never delete another record to make room; invent no available-quota figure; and
re-test against empty, non-empty, nearly full and Unicode-heavy stores.
RT4-05 stays OPEN with that as the remedy, not mine.

### The physiology framing was looser than the evidence

They checked all four cited publications and report: the 2024 review supports
immediate mean systolic BP and HRV effects with less certain emotional and
long-term benefit; PMID 16129818 was a short controlled session in 20
hypertensive participants and 26 controls; PMID 28890890 **individualised** the
resonance rate; and PMC6753868 is a hypothesis and mechanism paper, not a
clinical finding.

My citations were accurate to their sources but I conveyed none of those limits,
and I presented six breaths a minute as though it were a target. Accepted:
**six per minute is an optional visual pace, not an optimal rate for anyone in
particular.** The breathing room spec is amended to say so, to add comfortable
unforced breathing with no holds and stop if uncomfortable or dizzy, and to keep
the not-treatment line. No scriptural equivalence, no guided Simran, no medical
personalisation.

### My topic columns were mislabelled

They flagged that the counts are term matches over raw section categories
including variants, not thematic coverage or a count of the thirty-one principal
raags. Checked, and they are right. My "41 raags" for Love was 41 distinct
**sections**, of which **13 are not raags at all** — Jap, Salok Sehshkritee,
Salok Fareed Jee, Salok Ninth Mehl, Salok Vaaran Thay Vadheek, Gaathaa,
Chaubolas, Phunhay and four Svaiyay sections.

Corrected figures, now split honestly:

| Topic | Lines | Sections | Raag-named | Other forms |
|---|---:|---:|---:|---:|
| Love | 1146 | 41 | 28 | 13 |
| Maya | 988 | 40 | 31 | 9 |
| Duality | 748 | 34 | 26 | 8 |
| Fear | 683 | 45 | 32 | 13 |
| Ego / Haumai | 630 | 29 | 23 | 6 |
| Death / dying | 597 | 40 | 27 | 13 |
| Hukam | 431 | 26 | 20 | 6 |
| Greed | 272 | 37 | 28 | 9 |
| Anger | 213 | 33 | 27 | 6 |
| Contentment | 154 | 30 | 22 | 8 |
| Household life | 128 | 28 | 23 | 5 |
| Breath | 71 | 18 | 18 | 0 |
| Humility | 52 | 16 | 14 | 2 |
| Forgiveness | 21 | 10 | 9 | 1 |

The reference carries 32 raag-named sections in total, against the conventional
count of 31 raags, so even the raag-named column is a count of sections and not
of raags. Labelled accordingly wherever it appears. These remain term matches
and not reviewed thematic coverage.

### Two real defects in my article proof, both fixed

- **No `lang="pa"` on any Gurmukhi block.** True. Fixed; all five Gurmukhi
  elements now carry it, which matters for screen readers and font selection.
- **`break-inside: avoid` on verse and slot separately does not keep a verse
  with its explanation.** True, and it undercut the one thing I claimed about
  printing. Each verse, its citation, its basis note and its slot are now wrapped
  in a single `.pair` element carrying the rule, so the unit never splits.

Rebuilt proof committed at
`reviews/claude-independent/design/article-system/format-proof-duality.html` and
republished to the founder's artifact as v2.

### Punctuation handling — accepted and already true, now stated

They ask that normalisation be comparison-only, with raw strings preserved and
the supplied marks documented, rather than stripping punctuation
indiscriminately. That is what I did — normalisation happened in memory for
diffing only and no stored text was altered — but I had not said so. Stated here
and in the proof's source register. The marks concerned are comma, semicolon and
full stop as the Shabad OS records carry them; the danda `॥` is part of the text
and is never touched.

## 4. Their SF-01 mechanism, noted not verified

They report that initial render calls `restoreAnchor(state.read)` while
`pageshow` currently calls only `pause()`, so the history-cache return path needs
a targeted restore, with safeguards against scroll events persisting a temporary
top-of-page position. They label it a code-path hypothesis rather than a fresh
Safari reproduction, which is the right label.

That is consistent with what I observed and it answers the question I left open.
I have not read that code path and do not confirm it. Their instruction to
preserve the reload fix and not simply switch all scroll restoration back to
`auto` is correct — I used `auto` only as an isolation probe and never
recommended shipping it.

## 5. Still mine and still open

- **RB-01** independent closure. Not done.
- RT4-C5 live separation-guard mutation test. Not run.
- RT4-C7 on-screen label check at mobile width. Not run.
- SF-03, now OPEN for a better reason than before.
- RT4-05, OPEN, with their remedy rather than mine.

No verdict, no approval, no merge. The single physical iPhone acceptance task
stays outstanding and nothing above touches it.
