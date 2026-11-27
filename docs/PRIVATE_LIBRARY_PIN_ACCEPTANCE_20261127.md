# Six-digit PIN policy and acceptance — 27 November 2026

Recorded before implementation against `320537b0cc4aceb2e6007b32057a3c4a36c83520`.
The owner's new instruction chooses a simple PIN for their own use now and
defers Claude review. This supersedes the earlier minimum-length passphrase
policy for new collections; it does not change source-review status.

1. New collections use exactly six ASCII digits, held as a string. Leading
   zeros are significant. Do not parse as a number, trim, pad, truncate or
   silently change a supplied PIN. New seal operations reject every other
   credential format.
2. The reader opens in PIN mode with a masked input, numeric mobile keyboard,
   six-digit browser constraints and clear validation. An explicit previous
   passphrase mode may unlock existing 24–256-character collections without
   allowing new passphrase-based sealing. The credential mode does not change
   the encrypted format or cryptographic algorithms.
3. Preserve AES-256-GCM, a fresh salt and nonce for each seal, PBKDF2-SHA-256 at
   600,000 iterations, authenticated bounded schemas, generic wrong-credential
   and tampering refusal, and constant-stack Base64 handling.
4. Preserve no browser storage, history, telemetry or credential-bearing URLs;
   plain-text DOM rendering; clearing on lock; in-flight unlock cancellation;
   five-minute inactivity, hidden/pagehide, reload/back and print protection.
5. CLI secrets remain a hidden terminal prompt or owner-only file outside all
   Git repositories. No PIN value is accepted through arguments or environment
   variables. No existing output is overwritten. Use `--pin-file` for new
   operations; an existing `--passphrase-file` spelling may remain as a
   deprecated filename alias subject to the same six-digit rule.
6. Explain the scope plainly: a six-digit PIN provides casual privacy. Anyone
   who obtains the ciphertext from a public static website can try PINs
   offline. The KDF slows each attempt but cannot create entropy or enforce
   server-side lockouts. No claim of strong protection for sensitive material
   or individual access revocation is permitted.
7. Meaningful tests must cover a leading-zero PIN round trip, malformed and
   non-string values, a wrong valid PIN, ciphertext tampering, new sealing's
   refusal of the old password format, and real legacy-format decryption if
   compatibility is retained. Browser tests must exercise PIN keyboard/form
   behavior and retain the storage, safe-rendering and lock checks.
8. Keep earlier evidence intact. Save new test evidence under a dated PIN
   directory. Regenerate the private reader's script integrity pin only after
   the runtime change. No root navigation, service worker or public collection
   changes are in this task.
9. Do not read or modify the actual owner secret, plaintext payload or
   encrypted collection. The owner/root integration performs any real reseal.
   Use synthetic fixtures only. No release or Claude approval is implied.
