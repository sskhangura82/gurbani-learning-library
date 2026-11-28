# Independent review — consolidated report

26 November 2026. Answers the five questions in the continuation order.
Nothing was approved, merged, deployed or released. No scripture was modified.

## 1. What works

- **The readers.** Japji, Sukhmani and the Nitnem set, plus the two new Salok
  collections, render complete and correct scripture and refuse to render damaged
  scripture.
- **Reading place and saved learning survive**, including the away-and-back case
  that was broken (SF-01) and is now fixed and verified live.
- **Storage failure no longer destroys saved learning** — it raises a typed error
  and keeps what was already saved.
- **The separation between scripture and teaching holds, independently.** When I
  corrupted scripture, the teaching layer refused on its own and the page said
  *"Gurbani remains readable"* while the scripture still displayed.
- **The teaching layer cannot assert meaning it has not earned.** An injected
  explanation, an injected claim, a raised review status and a forged
  "semantically reviewed" flag are all refused by frozen code.
- **An automated rebuild cannot silently ship altered scripture.** I regenerated
  every derived digest exactly as a build script would and it was still refused.
- **Nothing can deploy the application from the test pipeline.**
- **Labels stay honest on a phone.** Draft and unreviewed wording is visible at
  320 and 390 pixels, above the fold, and persists inside the reader.
- **No tracking, no accounts, no advertising, no AI recitation, no live
  generative interpretation.** Still true everywhere I looked.

## 2. What has been independently verified

By me, on named commits, with criteria frozen before I looked at the candidate,
and with my own findings recorded before reading the builder's evidence:

| Area | Result |
|---|---|
| Salok Kabir scripture, 243 Saloks | 493 of 494 lines identical to my reference; the one difference documented |
| Integrity boundaries under forgery | Refused at every level except full code rewrite |
| Mobile labels | Pass at both widths, in every reading mode |
| Four reliability repairs (PR #54) | All four verified; the builder's instrument better than mine in five respects |
| Article engine source refusal | Thirteen cases, each refused by its own distinct gate |
| Test pipeline cannot publish | Verified across all five workflows |
| Print copy fidelity | Four extraction engines on byte-identical files |
| Passage identity and boundaries | Verified against the reference database structure |

**What this does not establish.** Every digital check in this project, mine
included, sits inside **one textual lineage** — the app's source and my reference
are the same tradition. So none of it is independent textual verification of the
scripture itself. Printed-page collation remains the only route to a second
lineage.

## 3. What is still broken or unverified

**Broken or incomplete**

- **RB-01 is not closed.** The guard is strong where it applies but does not cover
  a node's own Punjabi field, which still renders unlabelled. Narrower than I
  first described it, and still open.
- ~~**RT4-05** has no remedy.~~ **Corrected — this was my error.** RT4-05 is
  **closed**. My own RT-006 record verified the fix on PR #54, with six criteria
  passing. What was not implemented was *my* suggestion (a fixed byte cap), which
  should not have been. The builder's remedy — one write under the existing lock,
  a typed error, and preservation wording — was implemented and I verified it at
  runtime. The builder caught this contradiction; **treat RT4-05 as done.**
- **ART-P01 — copying Gurbani out of a saved PDF is corrupted in three of four
  viewers**, worst in Apple's own Preview and Quick Look, which produce null
  characters and transposed letters, destroying the very word a sheet is about.
  The generated PDF is standards-correct; the fault is in the viewers, so there
  is no fix on our side. The existing on-screen warning is the right mitigation
  and is already there.
- **"Fourteen witnesses" overstates the evidence.** They are fourteen consecutive
  pages of one book at one commit. Recommend renaming.
- **Search can present a literal word match as an attribution** — searching the
  word Nanak resolves to Guru Nanak as author, though the word is the poetic
  signature used by later Gurus in thousands of lines.

**Never reviewed**

- **PR #51**, which the whole of the main stack stands on.
- **PR #49**, and separately the combination of #49 and #53, which merges cleanly
  and will therefore never prompt anyone to look at it.

**Cannot be closed by me, or by any amount of testing**

- Physical iPhone, iPad, Home Screen and VoiceOver acceptance.
- Qualified Sikh scholarly and Punjabi review. **Nothing has been approved by a
  qualified person — zero, across roughly 6% of scripture carried.**
- Printed-source collation.
- Audio rights; the gurbani.org permission letter is drafted and unsent.
- Whether a merge publishes straight to the family application.

## 4. What ChatGPT can safely integrate next

**The integration unit is not a pull request. It is the chain.** PR #55 contains
#54, which contains #52, which contains #51, which contains #40. Merging #55
merges all of them.

Recommended order:

1. **Review #51 first.** It is unreviewed and load-bearing. Everything above it
   waits on this.
2. Then the chain #40 → #51 → #52 → #54 → #55 can go together. My verdicts on
   #52, #54 and #55 were measured on trees that already contained what sits
   beneath them, so the chain has been exercised throughout.
3. **#47** is a side branch off #40 and needs rebasing onto the chain afterwards.
4. **Hold the knowledge pilot.** #48 is sound, but #53 is unrepaired, #49 is
   unreviewed, and their clean merge is unreviewed. Nothing from stack B should
   be integrated until the merged state has been looked at.

Safe to start now without any decision from the founder: review #51; repair
RB-01; rename "witnesses"; split the search result kinds; settle
the Hukamnama fail-closed design; define a history node type with mandatory
citations; bind audio timing to a named recording in the data model.

## 5. What requires the founder

**One blocking question, with my recommended answer first.**

> **Does GitHub Pages publish the family application from `main`?**
>
> **Recommended answer: assume yes and act accordingly — treat every merge to
> `main` as a public release of the family app until it is confirmed otherwise.**

Why this one and no other: I verified that nothing in the test pipeline can
deploy, but Pages is switched on, so it must be publishing from a branch. The two
settings that would tell me which branch are blocked to my access. If the answer
is `main`, then the integration chain above is a **release** and not a merge, and
it needs the release gate rather than the review gate. It takes you a few seconds
to check and it changes how everything in section 4 is handled.

**Not blocking — batched, no reply needed today**

- A qualified Sikh scholarly and Punjabi reviewer is the real bottleneck for the
  whole project. Roughly 8,000 drafts await a qualified reader, and no amount of
  engineering substitutes for it. Worth starting the search well before the
  content is ready.
- The gurbani.org permission letter is drafted and will not be sent without your
  word.
- Printed-source collation needs a physical printed source; nothing digital
  replaces it.
- The physical iPhone reader check is still outstanding and is the only thing
  that can close device acceptance.
- Sangat mode remains an open product decision.

## My own errors this session, recorded

Five instrument errors, each caught by a control case or by checking rather than
asserting: a normalizer that under-stripped the reference's punctuation twice; a
misread line-numbering convention; a mutation harness that measured the wrong
page and whose control also refused; and a harness whose own file rewriting broke
the control.

Three framing errors I corrected in public: I described the print defect as a
lost conjunct when it is a duplicated vowel sign; I expected the PDF to lack the
standard text mechanism and to be a generation defect, when it carries it
correctly and the fault is in the viewers; and I twice said a node's Punjabi
field renders identically to Gurbani when it differs in size and alignment and
merely lacks a label.

I record these because a reviewer who hides instrument errors is not a reviewer.
Every one of them would have produced a wrong finding if the control had been
left out.


---

## Addendum, later on 26 November — the blocking question is now largely answered

**The builder read the two endpoints my proxy refused.** Their report: Pages
`build_type: legacy`, source branch **`main`**, path `/`, status `built`; and
`protected: false` on the main branches of both the source and the phone-test
repositories.

**What I verified myself, rather than taking on report:**

| Claim | Status |
|---|---|
| `main` = `a3476ac4b9be90dde350fb35dd13ce0b672c120d` | **confirmed by me**, exactly |
| `protected: false` on `main` | **confirmed by me** — the branch object carries it |
| Pages serves `main` at `/` | **their read; still blocked to me** |

Two of three confirmed independently, and the third matches the inference I had
already drawn from the workflows. So, operationally:

> **Updating `main` publishes the family application, and nothing prevents it.**

**Your decision is no longer "find out." It is "what gate do you want."** My
recommendation, unchanged in substance: treat the integration chain in section 4
as a **release**, not a merge — so it needs your release authority, not just a
review pass. The cheapest protection available is a branch protection rule on
`main` requiring a pull request, which would make an accidental publish
impossible rather than merely unlikely. That is yours to set; I cannot and will
not.

**This also raises the severity of a finding from the PR #56 review.** The
primary Nitnem reader page, `nitnem/index.html`, carries **no subresource
integrity attribute on any of its six scripts** — including `reader.js`, the file
that holds every integrity pin in the project. It is pre-existing, present on
`main` and every branch I checked, and **it is live in the published application
today.** The two newer Salok pages pin all six correctly. Recorded as **SRI-01**
for the builder; it is not a defect of the new candidate.

**A correction to section 3 of this report.** The RT4-05 entry was wrong and the
builder caught it. RT4-05 is **closed** — my own RT-006 verified the fix. What was
never implemented was *my* suggestion, which should not have been. The entry above
is struck through and corrected.

**One further candidate reviewed since this report:** PR #56, Unified Library v1,
`389e79b` — **PASS**. Every pin in `reader.js` byte-identical, no scripture
changed, every existing storage key unchanged so no saved notes can be orphaned,
the new entrances fail closed on damaged scripture, and six future capabilities
ship as honestly unavailable with a reason each. It adds four new entrances and a
larger-text layout, which makes the outstanding physical-device acceptance matter
more here than on any previous candidate.