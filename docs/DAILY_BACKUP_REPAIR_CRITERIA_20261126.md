# Daily learning backup repair — criteria before implementation

Date: 26 November 2026, America/Los_Angeles. Builder criteria, not independent approval.

Baseline: `df2c62fb3fef3d85cab9b752772e3f3f201dd791` (draft PR #61). Claude's RT-024 is recorded at review head `d21679e75cce5fb280f69b7c5fa557d96a7142d3`; the scoped PASS does not cover this newly reproduced import edge. The baseline candidate stays unchanged.

## Problem

A synthetic original note A and an incoming different version with A's identity are both preserved on first restore. Restoring the identical backup again creates another identical conflict copy. Existing tests only repeat the combined post-merge export, so they do not exercise retrying the actual incoming backup. No text loss is alleged, but unnecessary duplicates can fill the record limit.

## Acceptance

1. First conflicting restore preserves both exact versions. Repeating the same input is `UNCHANGED`, with no record, revision, stored-byte, storage-write or identity-generation change.
2. Record equality uses the named schema fields, not JSON object key insertion order. Text and Unicode are never trimmed, normalized or rewritten.
3. Recognition of an existing preserved version is scoped to the incoming note's identity and its direct conflict copy. Same-text notes with unrelated identities remain separate. Different dates, source editions, source digests, line bindings, questions, reflection text or timestamps remain distinct versions.
4. Admit all explicit incoming identities before making any necessary conflict copies. A backup containing both an original identity and its already-preserved conflict version behaves consistently whichever record is listed first; distinct explicit identities remain present. Newly generated identities cannot collide with any existing or incoming identity.
5. Repeated restores of nested conflict exports are unchanged. Different incoming versions are preserved separately. No existing note or previous accidental duplicate is automatically deleted or rewritten.
6. The whole transaction remains under the existing exclusive Web Lock and uses at most one atomic storage write. Concurrent retries cannot append the same incoming version twice. At the record limit an already-present backup is still unchanged; a genuinely additional note refuses without changing stored bytes. Quota, malformed-import and unsupported-store refusals remain safe.
7. Demonstrate the user's import/export controls in fresh synthetic browser contexts: create, import conflicting content, retry identical backup, preserve a third version, export and restore onto a fresh synthetic origin. No real notes or browser profiles are used.
8. Change only Daily import logic and the directly necessary tests, generated bundle/integrity declarations and offline manifest version. Original scripture, dated event/source packages, explanatory slots, signing keys, source importer, existing reader stores and other application modules stay byte-identical.

No merge, deployment, automatic publisher activation, qualified-content approval or physical-phone acceptance is authorized by this repair. Independent review must precede a release decision. The previous candidate and production/test site remain available unchanged.
