# RT-004 — PR #52, Salok Bhagat Kabir Ji collection
## Frozen criteria and independent scripture verification

Committed **before** reading the builder's handoff comment on PR #52, before
checking out the branch, and before reading any of the builder's test output.

## 0. Protocol honesty

The founder relayed the builder's build report. That report already told me the
builder's claimed figures and test counts, so I am **not blind** on those. I say
so rather than implying a cleaner separation than exists.

What I could still do cold, and did first, is the part their tests cannot
substitute for: verifying the scripture itself against an independent reference.
That is below, and it was completed before I touched their work.

Reference: Shabad OS Database v5.0.0-next.0, `dist/master.sqlite`, asset
**SSA2**. Sections `SQST` (Salok Kabeer Jee), `SO3P` (Salok Ninth Mehl),
`X63C` (Salok Fareed Jee).

## 1. Frozen acceptance criteria

| ID | Criterion | How it is judged |
|---|---|---|
| RT4-C1 | The collection carries exactly the Saloks the Granth numbers, no more, no fewer | Numbering sequence extracted from the text, checked for gaps and duplicates |
| RT4-C2 | The six embedded Mahalla Saloks appear in their original positions and are not absorbed into Kabir's sequence | Author attribution per group, position order |
| RT4-C3 | No authorship is assigned from a name appearing inside a verse | Inspect the groups that name other Bhagats |
| RT4-C4 | Every claimed source difference is recorded openly, not reconciled | Read the source-selection record and reproduce each difference |
| RT4-C5 | Editing a teaching draft cannot alter the scripture integrity record | Mutation test against the separation guard |
| RT4-C6 | A learner's own valid backup imports without loss, including a large one | Round-trip a synthetic oversized backup |
| RT4-C7 | Educational material is labelled as unreviewed draft wherever it appears | On-screen inspection at mobile width |
| RT4-C8 | No claim of physical device, Safari, Home Screen or VoiceOver acceptance | Read the PR body and the reader UI |

Verdicts: PASS / NEEDS_REVISION / INCOMPLETE.
Statuses: FIX-VERIFIED-ON-CANDIDATE / PARTLY-FIXED-ON-CANDIDATE / OPEN.

## 2. Independent scripture verification — completed before reading their work

### 2.1 Salok counts

| Collection | Reference `line_groups` | Numbers in the text | Builder's claim | Verdict |
|---|---:|---:|---:|---|
| Salok Kabeer Jee | 242 | **243** (1–243, no gaps, no duplicates) | 243 | **Builder correct** |
| Salok Ninth Mehl | 57 | **57** (1–57, no gaps, no duplicates) | 57 | **Builder correct** |

**The 242 vs 243 gap is resolved and is not a defect.** The reference holds one
group, `B2K`, that contains **two** numbered Saloks — 212 and 213:

> ਨਾਮਾ ਮਾਇਆ ਮੋਹਿਆ; ਕਹੈ ਤਿਲੋਚਨੁ ਮੀਤ ॥ … ॥੨੧੨॥
> ਨਾਮਾ ਕਹੈ ਤਿਲੋਚਨਾ; ਮੁਖ ਤੇ ਰਾਮੁ ਸੰਮੑਾਲਿ ॥ … ॥੨੧੩॥

These two are a dialogue — Trilochan speaks, Namdev answers — and the reference
groups the exchange as a single unit. The builder counts Salok numbers; the
reference counts groups. Both are right about different things.

**RT4-C1: PASS on the count.** 243 is the correct number of numbered Saloks.

### 2.2 Line totals reconcile exactly

Builder reports 486 verse occurrences + 8 heading/invocation occurrences = 494.
The reference holds **494** lines in `SQST`. **Exact match.** RT4-C1 strengthened.

### 2.3 The six embedded Mahalla Saloks — verified

The reference holds exactly **six** non-Kabir groups inside Salok Kabeer Jee:
Guru Arjan at positions 209, 210, 211, 213 and 220, Guru Amardas at 219 —
opening `ਮਹਲਾ ੫ ॥` and `ਮਃ ੩ ॥` respectively.

Builder's claim of six embedded Mahalla headings in original positions:
**independently confirmed.** RT4-C2 provisionally PASS pending on-screen check.

## 3. FINDING RT4-01 (medium, verification) — the "Farid occurrence" is not reproducible against the reference

The builder reports "a Farid occurrence excluded from the Kabir sequence with its
original evidence preserved."

Against the reference I find:
- **Zero** groups in Salok Kabeer Jee attributed to Farid.
- **Zero** lines in Salok Kabeer Jee containing `ਫਰੀਦ` or `ਫਰੀਦਾ` in any position.

So the thing excluded does not exist in this reference's Kabir section at all.
Three readings are possible and they have very different consequences:

1. They mean a Salok that appears in **both** the Kabir and the Farid
   collections, and excluded the duplicate. Benign.
2. They are working from a **source text that differs from this reference**, one
   that does place a Farid line inside the Kabir sequence. That is a source
   difference that must be recorded, not resolved.
3. Something else entirely.

**I will not guess which.** Asked of the builder: show the exact occurrence, its
source, and where the preserved evidence lives. Until then RT4-C4 is
**INCOMPLETE** on this item. This matters because excluding a line from a
scripture sequence on the strength of an unreproducible observation is precisely
what the standing rule against silent reconciliation forbids.

## 4. FINDING RT4-02 (low, for the qualified reviewer) — an authorship subtlety the builder's own rule points at

The builder states, correctly, that "the application does not automatically
assign authorship from a name alone."

Saloks 212 and 213 are the hardest case of that rule in this collection, in
reverse. The verses **name Namdev and Trilochan** and read as their dialogue,
yet the reference attributes the group to **Bhagat Kabir**. So the correct
behaviour here is not merely "don't attribute from the name" but "don't
un-attribute from the name either."

Not a defect. Recorded as a specific item for the qualified reviewer, because an
automated consistency check could plausibly "fix" this in the wrong direction.

## 5. FINDING RT4-03 (medium, process) — an independent AI reading is not independent review

The builder reports that all 243 entries "received an independent AI reading"
producing 111 field corrections across 22 Saloks, and states plainly that this
does not count as approval from a Sikh scholar or qualified Punjabi reviewer.
That disclosure is correct and welcome.

The standing rule is stricter than the disclosure: **do not declare unreviewed
material authentic merely because two AI systems agree.** 111 corrections from an
AI pass is a quality signal about drafting, not evidence of correctness. In the
coverage register this must be counted under educational drafting, never under
independent review or qualified approval, which are measured separately.

Recorded so the figure cannot later be cited as review.

## 6. What I have not yet done

Everything from RT4-C5 through RT4-C8 — the separation-guard mutation test, the
backup round trip, the on-screen label check, and reading the PR body. Those
require the branch and are next. This file is frozen at this point.
