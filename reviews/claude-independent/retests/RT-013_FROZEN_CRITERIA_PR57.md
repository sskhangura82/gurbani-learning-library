# RT-013 — PR #57, RB-01 repair: frozen acceptance criteria

Committed **before** opening the changed implementation or the builder's evidence.

- Candidate: PR #57, head `f720099b6181919d597e249f9ad42b9f00cabe68`, draft, open,
  unmerged. Verified against the API.
- Base: `fix/knowledge-editorial-title-20261126`.
- **Verified by ancestry:** it contains PR #53 (`83acf3f`) and does **not** contain
  PR #49. Both match the builder's statement.
- The builder explicitly does not declare RB-01 closed.

## Disclosed exposure

The handoff reached me in full through the notification channel. From it I know
the claimed scope — "the RT008 prefixed-heading, node-field, alias and rendering
surfaces" — and that scripture, teaching data and source locks are unchanged. **No
test results were disclosed.** Before freezing I read the PR shape and changed
file names only: `knowledge/app.mjs`, `core.mjs`, `registry.mjs`, `style.css`, two
new test files, and evidence. **No scripture or teaching data file appears**, which
is criterion RT13-C9 rather than an acceptance of the claim.

This candidate repairs a finding **I raised**. I am therefore testing my own four
documented bypasses as adversarial inputs, not re-reading the guard and forming an
opinion about whether it looks better.

## The four bypasses this must close

Taken verbatim from `RT-008_RB01_PR53_FINDINGS.md`, each becomes a criterion. Each
will be attempted as a live mutation and must be **refused by the loader**.

| ID | Criterion — the attack from RT-008 | Fails if |
|---|---|---|
| RT13-C1 | **RB-01-a** prefixed heading: `passageDescriptions[].title = "ਵਿਸ਼ਾ ਸਲੋਕੁ ਮਃ ੧ ॥"` — one word of prefix defeated the `^`-anchored regex | accepted, or rendered in the "Library topic:" note |
| RT13-C2 | **RB-01-b** node `pa`: a `concept`, `word` or `lesson` node's `pa` set to `ਸਲੋਕੁ ਮਃ ੧ ॥` | accepted, or rendered in the element real Gurbani uses |
| RT13-C3 | **RB-01-b** node `title`: a `concept` node's `title` set to `ਮਹਲਾ ੧` | accepted |
| RT13-C4 | **RB-01-c** real scripture in a node: a `word` node's `pa` set to a genuine in-pack line | accepted, or shown as a result row beside the genuine passage |
| RT13-C5 | **RB-01-d** editorial aliases: scripture-like text in `passageDescriptions[].aliases` or `nodes[].aliases` | accepted into the search index |

## Criteria beyond the four

| ID | Criterion | Fails if |
|---|---|---|
| RT13-C6 | A **control** load with nothing altered still renders the pilot normally | the control refuses, which would invalidate every refusal above |
| RT13-C7 | Legitimate editorial titles — ordinary Punjabi and English topic labels that are **not** scripture — are still accepted | the guard has become a blocklist that rejects honest content |
| RT13-C8 | Genuine scripture still renders, complete and unaltered, in its own surface | any real line is suppressed or changed by the new guard |
| RT13-C9 | No scripture, teaching or source-lock byte changed | any differs from the PR #53 parent |
| RT13-C10 | Editorial material remains visibly labelled as editorial wherever it renders | any editorial field renders bare |
| RT13-C11 | The guard refuses by **structure**, not by a list of forbidden strings | a denylist of specific words is the mechanism |
| RT13-C12 | Nothing claims RB-01 closed, qualified review, or device acceptance | any appears |

## Method limits, stated in advance

- RT13-C7 matters as much as C1–C5. A guard that refuses everything is not a
  repair, and I will test acceptance of honest content as deliberately as I test
  refusal of attacks.
- One lineage (RT-005). Chromium only; **nothing here is device acceptance.**
- Synthetic data only.
- **Every harness gets a control case.** Six of my instruments produced a wrong
  first answer today; every one was caught by a control.
- I will state plainly whether each refusal comes from the loader or merely from
  the rendering layer. A guard that accepts bad data and hides it on screen is not
  the same as one that refuses it, and RB-01 was originally a rendering finding.

Verdicts: PASS / NEEDS_REVISION / INCOMPLETE. I raised RB-01, so I will not
describe it as closed unless all five attacks are refused and C7 still passes.

Frozen at this point.
