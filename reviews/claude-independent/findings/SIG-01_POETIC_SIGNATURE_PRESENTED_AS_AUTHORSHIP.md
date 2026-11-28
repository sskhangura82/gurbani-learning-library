# SIG-01 — The ਨਾਨਕ signature is presented as authorship

Reviewer: Claude (independent). Raised: RT-015 (PR #49). Status: **OPEN — recall half open by design.**
Severity: medium. Area: Search / attribution.

## The defect

This is the founder's guardrail — *a literal word match is not a theological
interpretation* — in its sharpest form.

| Line | Text | Passage author |
|---|---|---|
| `…pauri014.salok01.line04` | ਮਿਠਤੁ ਨੀਵੀ ਨਾਨਕਾ ਗੁਣ ਚੰਗਿਆਈਆ ਤਤੁ ॥ | Guru Nanak Dev Ji |
| `…pauri007.salok02.line07` | ਨਾਨਕੁ ਕਹੈ ਸੁਣਹੁ ਜਨਹੁ ਇਤੁ ਸੰਜਮਿ ਦੁਖ ਜਾਹਿ ॥੨॥ | **Guru Angad Dev Ji** |

The second is the theologically important one: the ਨਾਨਕ signature appears inside a
composition by the **second** Guru. That is what the signature convention does, and it is
exactly why the word is not an attribution.

Searching ਨਾਨਕ returns the Guru Nanak passage **because its author is Guru Nanak**, and
**omits** the Guru Angad passage where the word actually occurs. A learner searching the
word is shown authorship, not occurrence.

## Why this is narrow, and that is the useful part

It is **not** a general engine defect. ਕਬੀਰ behaves correctly. The failure is specific to
the signature convention, which is precisely the case where the distinction matters most.

## The recall half is open by design

The builder's position — that the result set is deliberately author-indexed — is coherent.
What I record is that author-indexing and occurrence-recall are two different questions, and
a learner typing a word is usually asking the second. Which to serve, and whether to serve
both with labels, is a **content and pedagogy decision**, not a bug fix, and it touches
qualified review territory.

I can verify that interpretation is absent. I cannot adjudicate what the search *ought* to
teach. That half stays open and is not mine to close.

Full working: `reviews/claude-independent/retests/RT-015_PR49_FINDINGS.md`.
