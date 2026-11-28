# RB-02 — A real line split across `title` and `pa` is accepted; and the crosswalk omits unchanged names

Reviewer: Claude (independent). Raised: RT-013 (PR #57), as the residual after RB-01 closed.
Status: **OPEN.** Severity: low.

## Why this has its own identity

I raised RB-01, so I bound myself in advance: *"I will not describe RB-01 as closed unless all
five attacks are refused and C7 still passes."* **All five were refused and C7 passed**, so
RB-01 closed. The residual I found afterwards was not one of the five, so it gets its own
identity and severity rather than being used to keep RB-01 open. That is the honest
application of a criterion frozen in advance.

## The residual

Eleven of twelve attacks refused. The one accepted: **a real line split across `title` and
`pa`**. The guard is otherwise genuinely structural — it survived normalisation evasion,
invisible characters, digit substitution, whitespace padding, and three field surfaces I had
never tested.

Second part: the crosswalk lists 2 of 3 old passage names. The third
(`sggs.kabir.salok007`) is absent because **the name did not change**. That is defensible, but
a reader cannot tell "unchanged" from "missing" without being told.

## Recommendation

List every passage in the crosswalk, or state explicitly that unchanged names are omitted.
Builder's to choose.

## Why the repair it sits on is a real repair, not a blocklist

RT13-C7 mattered as much as the attacks and I tested it as deliberately. All accepted: an
ordinary Punjabi topic label `ਨਿਮਰਤਾ ਦਾ ਵਿਸ਼ਾ`; an ordinary English label; the unaltered
control; and `ਪਰੇਮ ੨ ਦਾ ਵਿਸ਼ਾ` — a Punjabi word **ending in ਮ followed by a number**, exactly
the false positive the negative lookbehind exists to prevent. The guard distinguishes the ਮਃ
abbreviation from an ordinary word ending in ਮ, which is the difference between a repair and a
blunt instrument.

The dictionary exception is bound to evidence rather than free: a `sense.form` is accepted
only when it genuinely appears in the token split of the occurrence it cites.

Full working: `reviews/claude-independent/retests/RT-013_PR57_FINDINGS.md`.
