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

A genuine Claude session or provider response must produce the Claude record. A second GPT agent, the author's self-review, an engineering review or passing tests do not count as Claude's semantic source inspection. The validator and fixed checker are read-only and do not invoke a provider.

## Current Kartarpur evidence

The exact PR #71 manuscript and scripture remain unchanged. ChatGPT retrieved all five source witnesses normally and inspected the cited sections. All ten claims now have qualified author assessments and no original-source checks remain incomplete. The four newly completed checks use the original Gurmukhi in BaniDB verse IDs 200334–200340; the provider heading is excluded and no modern translation is imported. These are assessments of the exact attributed claims, with the existing limits on chronology, eyewitness status, source dependence and wording retained.

The actual Claude Code CLI was invoked once in an isolated temporary directory with this exact public claim/source packet and read-only tools. It exited before any model tokens with an expired OAuth session. No Claude semantic inspection or review record resulted. The sanitized execution receipt is `evidence/history-two-reviewers/claude-authentication-attempt-20261127.json`. It records the error, CLI version, input/output digests and isolation flags, without credentials, personal paths or session identifiers. It is diagnostic evidence only and cannot satisfy the source-review validator.

The real manuscript remains `WITHHELD` solely because `MISSING_CLAUDE_CHECKER_SOURCE_REVIEW`. Renewing the existing Claude sign-in will permit the independent review to resume; authentication alone does not approve a claim. No mandatory human-authorship gate is imposed.

Snapshots bind the inspected UTF-8 text and the raw HTTP response hashes, URLs, times and source metadata. The two Encyclopaedia pages are decoded from their actual UTF-16 encoding. The BaniDB inspection snapshot contains only source metadata and original verse objects; modern translations are excluded. The sanitized retrieval receipts are `evidence/history-two-reviewers/source-retrievals-20261127.json`. Source bodies are not copied into this repository. If a source version changes later, regenerate the packet and both reviews even when its URL is unchanged.

The first-stage review and source snapshots are under `content-intake/history/reviews/`. The [Claude packet](KARTARPUR_CLAUDE_SOURCE_REVIEW_20261127.md) lists the exact claims and locators. The manifest supplies reviewer provenance and artifact hashes separately from the authored draft. The fixed read-only checker reads the actual record file, verifies its hash against that manifest, and reports the pending state.

## Verification

Run:

```sh
node --test tests/history-registry.mjs tests/history-draft.mjs tests/history-editorial.mjs
node tools/history/check.mjs
node tools/history/draft-check.mjs
node tools/history/editorial-check.mjs
```

Tests cover changed prose with an unchanged claim ID, changed claims/locators/entities, changed source bytes behind the same URL, missing or unsupported assessments, wrong/same reviewer identity or provider, missing artifact provenance, stale review dates, and substituting a code review or authentication-failure receipt. All positive two-provider records used in tests are synthetic and explicitly say so. No synthetic review is used for the real draft.
