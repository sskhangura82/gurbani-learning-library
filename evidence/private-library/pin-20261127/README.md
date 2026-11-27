# Six-digit PIN verification

## Results

- **24 contract/CLI checks: PASS.** See `contract-results.json`.
- **18 browser checks: PASS.** See `../browser/pin-20261127/results.json`.
- The private reader's SRI pin matches its closed runtime.
- Syntax and whitespace checks passed.
- Three synthetic screenshots were inspected: locked at 320 and 390 CSS
  pixels, and unlocked at 390 pixels. No horizontal overflow was observed.

The contract tests include exact six-digit string admission, leading zeros,
malformed and numeric values, wrong PINs, ciphertext tampering, unchanged
KDF/cipher/schema boundaries, fresh salt/nonce, a multi-megabyte pack,
pre-PIN decoding, PIN-only new sealing, CLI arguments and file boundaries,
permission checks and diagnostic redaction. The old decoding fixture was
created by the implementation at
`320537b0cc4aceb2e6007b32057a3c4a36c83520` using synthetic content and a public
test passphrase before modifying the runtime.

The browser tests retain the safe-rendering, storage/network/URL isolation,
filtering, lock race, manual/hidden/print/reload/back/inactivity locks and
changed-script SRI refusal checks. New checks cover masked entry, the numeric
keyboard hint, browser constraints, application validation after bypassing
browser constraints, and a successful leading-zero PIN.

## Environment and receipts

The browser run used Chrome 158.0.8127.37, Node v22.15.0 and the existing
Playwright 1.62.1 installation on the authorized Mac. It took 3.05 seconds.
Only the private runtime, HTML, CSS and browser fixture were transferred into
the new temporary folder:

`/var/folders/hk/7t90scbj1wbd5q1wh0ztvxz80000gn/T/glp-pin-browser-bwhokbdj`

The test launched a fresh headless profile. It did not use an existing browser
profile. The source SHA-256 hashes in `../browser/pin-20261127/results.json`
and `run-receipt.json` match the local files. `browser-run.log` records the
successful exit. No owner credential, plaintext collection or actual
ciphertext was transferred, opened or modified.

## Preserved initial failure

The first browser run passed the first fifteen checks and timed out in the
inactivity fixture. The existing fixture installed Playwright's clock after
navigation, after the reader had already created its native interval. The
[Playwright clock documentation](https://playwright.dev/docs/clock) requires
clock installation before clock-related calls and recommends installation
before navigation.

The test now installs its clock before the first page navigation. It also
checks both sides of the inactivity boundary: still unlocked after four
minutes, then locked after five. The unchanged application timer passed this
corrected check. The first failed report, receipt and log remain under
`../browser/pin-20261127/first-clock-fixture-failure/`; the successful rerun did
not overwrite them.

## Scope

This is builder verification using synthetic data. It is not a physical
iPhone, Safari or VoiceOver check, independent Claude review, real-collection
reseal, or deployment. The PIN policy is the owner's explicit choice for
casual privacy; these results do not make a six-digit PIN resistant to offline
exhaustive guessing. Root integration owns the real PIN and unchanged payload
reseal, plus public navigation wording.
