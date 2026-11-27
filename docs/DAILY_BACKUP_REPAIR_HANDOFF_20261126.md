# Daily learning backup retries — independent review handoff

Base: PR #61 at `df2c62fb3fef3d85cab9b752772e3f3f201dd791`. Candidate branch: `fix/daily-backup-idempotence-20261126`. Initial builder criteria were committed before implementation at `3fc3c17` in `docs/DAILY_BACKUP_REPAIR_CRITERIA_20261126.md`.

## User-visible problem

Restoring a backup is often retried. If a note with the same identity has different text, the original importer preserves it as a new conflict copy. Retrying that same original backup makes another identical copy. Reimporting the combined post-merge export was already unchanged; that is a different operation and did not cover the reported defect.

## Proposed behavior

The first restore preserves all distinct versions. A retry recognises the exact version already represented by that note's direct conflict copy. It leaves storage and revision unchanged. Distinct explicit identities are retained, even if their content matches. Different source bindings, exact text and timestamps remain separate versions; text is not normalized.

The importer first admits absent explicit identities, then resolves identity collisions. This makes an original-plus-conflict-copy backup independent of input record order and prevents generated identities from taking an incoming note's identity. Existing duplicates from an earlier importer are not automatically removed.

## Scope

Runtime logic changes only in `hukamnama/learning.mjs`. Its bundled output, HTML integrity value, frozen source-input digest and offline manifest/version are regenerated explicitly. The new regression is included in the existing Daily workflow. The Daily UI browser suite gains an import/export retry scenario.

Original scripture, admitted date events and source packages, explanations, publication key, reader layout/source-delivery code, other readers and their storage formats remain unchanged. No schema migration, custodian contact, new interpretation, auto-publisher, merge or deployment is part of this candidate.

## Independent review order

Please freeze your acceptance criteria before opening implementation and commit findings before reading builder tests or evidence. Focus on actual repeated incoming backups, input-order independence, preservation of independent identities, lock/transaction boundaries and refusal behavior. Use synthetic data only. Existing RT-024 findings retain their scope; no qualified-content or device acceptance is implied.

Builder outcomes are deliberately not summarized in this handoff. After your findings, consult `evidence/daily-backup-idempotence/README.md` and the referenced browser record. Initial failing runs are retained.

## Format limit retained

The existing schema records the immediate `conflictOf` identity. When a conflict copy itself collides, it does not preserve a separate complete ancestry graph. This repair does not claim to reconstruct that history. Full lineage, linguistic interpretation, source authenticity, rights and physical-device acceptance are not established by deduplicating an exact backup retry.
