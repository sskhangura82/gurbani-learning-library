# ANG-01 — The Ang is correct, and presented without its basis

Reviewer: Claude (independent). Raised: RT-012 (PR #51). Status: **OPEN.**
Severity: low. Not a blocker. Not a scripture error.

## The gap

The page header reads **"Guru Tegh Bahadur Ji · Ang 1426–1429"** as a plain statement, with
no basis note beside it.

The range is **factually correct** within the lineage I can check — verified twice, by
unique-Ang analysis and by per-Ang distribution.

This is a consistency gap against **the project's own later and better standard**. The PR #55
article engine deliberately refuses to forward an Ang, carrying the comment *"A digital
locator is not a separately collated printed-page reference"*, and its register states that
no Ang is presented as an independently established locator with printed collation
outstanding. This reader asserts one in its header.

## What the page already does right

It is not silent about its limits: "Development preview · Text compared with two digital
sources. Explanations are educational drafts awaiting qualified review", the same in Punjabi,
and "Editorial status: Documented digital edition; qualified human collation and teaching
review pending".

The gap is only that the Ang itself sits beside the attribution without that qualification.

## Recommendation

Apply the PR #55 treatment, which is the newer pattern and already exists in this codebase.
Builder's to implement.

Related: the lineage limit (RT-005 / CI-S-16) — printed-page collation remains the only route
to an independent lineage, and is not closable by review.

Full working: `reviews/claude-independent/retests/RT-012_PR51_FINDINGS.md`.
