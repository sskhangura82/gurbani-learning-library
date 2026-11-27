# RT-024 addendum — deferred evidence, C17 closed, and the gaps their criteria caught

Written after `RT-024_PR61_FINDINGS.md` was committed at `35f3387f`.

## CI

All **11** checks on `df2c62fb` are now `success`, including
`browser-learning-and-offline` and `original-source-and-learning-contracts`. The
`mergeable_state: unstable` I recorded at freeze was CI still running, not a
failure.

## RT24-C17 is now CLOSED, not merely unverified

The receipt input is committed at
`evidence/daily-hukamnama/capture-2026-11-27/receipts/2026-11-27.original.json`.
Its raw sha256 is `614206ae696e00a84a07233b38e6a4668ea61c70eacc23f6ce8e304557698240`
— **exactly** the event's `officialReceiptSha256`.

Checked for commentary: **zero** keys matching translation, meaning, teeka,
commentary, English, explanation or interpretation. The receipt holds original
Gurmukhi plus structural metadata, and records
`normalization: "NONE; original witness entries joined by one ASCII space"` with
the preceding and following original lines as boundaries. **Original-only, as
specified.**

## They recorded my RT-005 lineage finding independently — and went further

The receipt's own `limitations` field says:

> "Digital full-text comparison is not qualified scholarly or printed-page approval."
> **"The portal and its archive are one publisher, not independent historical witnesses."**
> **"Open Granth derives its original text from Shabad OS SSA2, attributed upstream to SGPC Shabadaarth."**

The second line answers the open question I posed in my findings — whether SGPC's
own digital text might be a genuine second lineage. **Their answer is no, and
they say so in the artifact itself.** The third line traces the chain one step
further than I did in RT-005: Shabad OS SSA2 is attributed upstream to SGPC
Shabadaarth, which means the portal text and Open Granth plausibly share that
ancestor too.

So the `officialOriginalSha256` equality is a **publisher-consistency check, not
a second independent witness**, and the candidate does not claim otherwise
anywhere. That is the correct posture, and it strengthens my confidence in the
candidate rather than weakening it. Printed-page collation remains the only route
to a genuinely independent lineage — unchanged, and now stated by both of us.

## The gap their criteria caught in mine, and I closed it

Their criterion 8 requires: "Cache only verified dated original records as a
single complete pair… **No silent old-date substitution on reload**."

**My criteria did not cover the cache path at all.** Given that "never substitute
an earlier reading" is the single most important constraint in this project, a
cache able to serve yesterday's reading offline would have defeated it, and every
test I wrote would have passed. I tested it after reading their criteria, with a
stubbed Cache API:

| Step | Result |
|---|---|
| online, populate the 27 Nov verified pair | `DIGITAL_TEXT_VERIFIED_PREVIEW`, `fromCache=false` |
| offline reload, **same** date | `DIGITAL_TEXT_VERIFIED_PREVIEW`, `fromCache=true`, source present — legitimate |
| offline, **next** day | **`TODAY_PENDING`, source absent** |
| offline, **earlier** day | **`DATE_UNAVAILABLE`, source absent** |

The cache cannot serve another date's reading. It passes — on their criterion,
not mine.

## Two further gaps I am recording rather than closing

Their criterion 10 also names **current-to-next-day rollover** and **late
asynchronous results**. I tested neither. Both are real: a rollover bug could
show yesterday's reading past midnight in Amritsar, and a late async result could
paint a stale reading over a newer one. Their `browser-learning-and-offline` and
`browser` jobs pass and presumably cover them; **I have not independently
verified either**, and I would rather name them than let a green check stand in
for my own testing.

## Standing

RT-024's verdict is unchanged: **PASS**, now 25 of 25 with C17 closed. Two
criteria of theirs remain untested by me, named above.

What no review can close is unchanged: printed-source collation against a second
lineage, physical iPhone / VoiceOver / airplane-mode acceptance, audio rights,
and qualified review of any explanation — which is precisely why every
explanation destination currently reads "AWAITING QUALIFIED REVIEW" rather than
holding text.
