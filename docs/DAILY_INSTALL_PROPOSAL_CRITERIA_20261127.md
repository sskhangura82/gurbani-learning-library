# Daily installation proposal — builder criteria frozen before code

The next step after acquisition and development sealing is a reviewable exact-base installation proposal. This is not an active publisher or permission to deploy. Audio is on hold at the founder's direction; a personal recording will be supplied later.

## Required behavior

1. Read one existing sealed candidate through an exact original-only manifest allowlist. Validate raw file hashes, duplicate-free JSON, signature, full source and original receipt with the existing decoder and staging contracts. Read each input into memory once; never copy an unchecked input directory.
2. Require the exact requested Amritsar date (default today, explicitly dated history supported), a full base commit and its current named reference. Record both. Refuse a stale reference, future date or today-mode midnight rollover. A proposal does not assert that the reference will remain unchanged until a later deployment.
3. Read base files from Git objects, not the user's working tree or private storage. Require regular JSON blobs and the expected pinned publication-key module. Refuse symlinks, trees masquerading as files, mismatched source bytes or invalid admitted records.
4. Reuse the existing preparation comparison. A repeat observation of an admitted date produces a no-op and retains its exact event bytes/revision. Corrections, damaged records, equal-revision changes and missing sources do not get replaced. A new date starts at revision 1.
5. Form a proposed Git tree using a separate temporary index. The only possible runtime changes are one new dated event and its exact source, with identical existing source reuse permitted. Preserve every other tree entry. Do not update any reference, existing index, working-tree file or served directory. Do not read a private key, sign, push, merge or deploy.
6. Produce an exclusive new review directory with a bounded status record, exact patch, file identities and the original-only receipt kept outside the runtime patch. A ready record is written only after all validations and a final reference/date check. Failed or interrupted work must not masquerade as a ready proposal or overwrite an earlier run.
7. Tests use temporary Git repositories and ephemeral signing keys. Demonstrate the existing signer-to-proposal-to-reader chain, same-day no-op, same-digest source conflict, tampering, extra/escaping/symlink files, corrupt admitted record, stale base, partial failure, repeated/concurrent output and midnight behavior. Compare Git ref, index, working-tree and unrelated content before/after. No actual learner data is read.

## Honest limits

The signature is the library's development transport seal, not an SGPC signature, qualified interpretation, rights grant or release approval. Captured evidence agreement does not independently prove the remote server said it. There is no automatic schedule activation or delivery to a phone in this increment. The later publisher must independently re-check the exact base and proposal before it may install anything. Existing physical-device and print-copying findings remain open. A missing explanation remains empty.
