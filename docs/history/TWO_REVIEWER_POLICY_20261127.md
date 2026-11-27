# Historical source review: ChatGPT prepares, Claude checks

The owner authorized this policy on 27 November 2026: authentic sources are central; ChatGPT prepares each historical claim and actual Claude double-checks it. Human authorship and qualified human review are not prerequisites for this editorial workflow. AI assistance remains visible. The optional legacy human-attestation API remains available for old records and does not control this workflow.

## What the implementation does

`prepareResearchDraft(registry, draft, evidence)` validates the exact draft and source-review records. Its source status is `AI_SOURCE_REVIEWED_DRAFT` only when both the ChatGPT/OpenAI author role and Claude/Anthropic checking role have complete current records. Otherwise it returns `WITHHELD` with concrete reasons. Human review remains `NOT_PERFORMED`; publication authorization is not granted by a research validator.

The draft's source status remains immutable authored input. Adding a boolean or changing that status cannot manufacture review. A derived reviewed object retains all original claims, uncertainty, citations, conflicts, source metadata and paragraph text.

Every source-review record binds:

- The full draft packet, including title, narrative and editorial questions, every linked claim, entity, relationship and conflict.
- Each exact claim and citation locator, with a source-support assessment rather than a chapter-wide pass alone.
- Each paragraph, its claim IDs and a paragraph assessment. New invented prose cannot reuse a source-approved claim ID.
- Source metadata and the SHA-256 of the inspected retrieval snapshot. A URL alone is not a source snapshot.
- A distinct producer identity/provider, producer reference and separately supplied review-artifact reference/hash.

`SUPPORTED` and `QUALIFIED` claim outcomes are usable only with complete exact source checks and paragraph checks. `DISPUTED`, `UNSUPPORTED` and `INCOMPLETE` outcomes remain pending. This is a limitation on recorded support, not an instruction to erase disputed history: preserve the competing accounts and qualify the prose, then review that precise statement. Editorial questions are labeled separately and require an `EDITORIAL_ONLY` assessment.

## What the validator cannot establish

The validator checks records and bindings. It cannot establish historical truth, authenticate a provider from a JSON string, establish scholarly qualifications, prove that a source was read, or grant copyright permission. A caller must verify producer and artifact provenance before supplying the roster and references. A forged newly fabricated set of mutually consistent records is outside this validator's authentication scope. Claiming that SHA-256 prevents fabricated reviewers would be false.

A genuine Claude session or provider response must produce the Claude record. A second GPT agent, the author's self-review, an engineering review or passing tests do not count as Claude's semantic source inspection. This change does not invoke a provider or send a message.

## Current Kartarpur evidence

The exact PR #71 manuscript and scripture remain unchanged. ChatGPT reopened four source pages and inspected the cited sections. Six claims are qualified as faithful attributions to the sources. Four remain incomplete because this session could not retrieve the exact BaniDB Gurmukhi witness. The prior builder receipt is retained as earlier evidence and is not promoted into a fresh inspection.

No actual Claude source-review record exists. The real manuscript remains pending for that reason and the incomplete original-source checks, not because an AI wrote it.

Snapshots record hashes of the UTF-8 JSON retrieval responses and their tool-reference/URL locators. A failed retrieval is explicitly `UNAVAILABLE`; its hash identifies the failure observation and does not assert that source content was inspected. Source bodies and modern translations are not copied into this repository. A complete source version changing later requires a new observation and both reviews, even if the URL is the same.

The first-stage review and source snapshots are under `content-intake/history/reviews/`. The [Claude packet](KARTARPUR_CLAUDE_SOURCE_REVIEW_20261127.md) lists the exact claims and locators. The manifest supplies reviewer provenance and artifact hashes separately from the authored draft. The fixed read-only checker reads the actual record file, verifies its hash against that manifest, and reports the pending state.

## Verification

Run:

```sh
node --test tests/history-registry.mjs tests/history-draft.mjs tests/history-editorial.mjs
node tools/history/check.mjs
node tools/history/draft-check.mjs
node tools/history/editorial-check.mjs
```

Tests cover changed prose with an unchanged claim ID, changed claims/locators/entities, changed source bytes behind the same URL, missing or unsupported assessments, wrong/same reviewer identity or provider, missing artifact provenance, stale review dates, and substituting a code review. All positive records used in tests are synthetic and explicitly say so. No synthetic review is used for the real draft.
