# Private comparative library: acceptance frozen before implementation

Owner direction: other religions' texts require a password shared only with trusted readers. Psychology stays open. Dasam Granth remains a separately identified Sikh collection.

This increment is an additive, undeployed static encrypted reader. It does not import real comparative scripture or choose the owner's password.

1. No comparative plaintext or password is distributed by the default public app. A missing encrypted pack produces an honest setup-pending state.
2. Packs use authenticated encryption, fresh cryptographic salt and nonce, a bounded fixed KDF, and a strong passphrase. Wrong keys, altered ciphertext and invalid envelopes refuse access.
3. Every title, passage, source and note inside a pack is encrypted. The outer envelope contains format/algorithm information only. The payload schema distinguishes Bible, Buddhist and Tibetan collections; psychology and Sikh scripture are not accepted into this restricted payload.
4. Unlocked data is rendered as text only. Private text, keys and passwords never enter URLs, browser storage, search indexes, app backups, service-worker caches or logs. Lock, page hiding, pagehide, print and inactivity clear the reading view; an in-flight decrypt cannot undo a subsequent lock.
5. The app loads one closed executable protected by HTML SRI and has no external scripts, fonts or requests. The password is not retained after the unlock attempt.
6. Packing takes plaintext and an optional password file only from outside Git repositories, including worktrees and symlink targets. No password command-line argument or environment-variable input is accepted. Existing output cannot be overwritten.
7. Synthetic tests exercise encryption failure, stale unlock races, HTML/script-shaped text, storage/network leakage, reload/back/hidden/print locking and mobile layout.
8. Explicit limits: a shared passphrase has no individual revocation; authorized recipients can retain what they read; JavaScript cannot promise physical erasure; a compromised hosting origin can replace its HTML and scripts. SRI guards a changed script under unchanged HTML, not a malicious replacement of both. An authenticated private service is required for individual access management.

Builder tests are evidence of implementation behavior, not Claude's independent review or physical-iPhone acceptance.
