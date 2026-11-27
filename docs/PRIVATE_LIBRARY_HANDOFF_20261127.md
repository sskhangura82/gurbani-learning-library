# Private comparative library

## Result and scope

This adds an encrypted reading room at `private-library/index.html`. Other religious texts belong here; psychology remains open and Dasam Granth belongs to the separately identified Sikh collection. Root navigation and catalog changes are integration work outside this commit.

The default tree contains no real encrypted collection and no owner passphrase. Without a configured `private-library/collection.enc.json`, an attempted unlock shows setup pending. The owner can supply the first rights-checked collection using the packing tool. Source licensing and textual accuracy remain source-specific editorial work; encryption alone does not establish permission.

## Pack format

The runtime accepts a strict `glp.private-collection.v1` object:

```json
{
  "schema": "glp.private-collection.v1",
  "title": "Name of the private collection",
  "editionId": "edition-id",
  "works": [{
    "id": "work-id",
    "tradition": "early-buddhist",
    "title": "Text title",
    "language": "English",
    "edition": "Exact edition or translation",
    "source": {
      "url": "https://example.invalid/actual-source",
      "rights": "cc0",
      "attribution": "Exact source attribution",
      "checkedOn": "2026-11-27",
      "permissionRef": ""
    },
    "paragraphs": ["Actual source paragraphs belong only in a file outside Git."]
  }]
}
```

The example above is a schema illustration, not scripture or a rights claim. Allowed traditions are `bible`, `early-buddhist`, `tibetan-buddhist`, `other-religious`. Psychology, SGGS and Dasam are deliberately excluded from this restricted payload. Allowed rights values are `public-domain`, `cc0`, `permission-recorded`, `licensed-unmodified`, `link-only`; permission-recorded and licensed-unmodified require a nonempty permission reference. All those fields are encrypted, including titles and source URLs.

For a publisher reading-room reference with no imported text, set `rights` to `link-only`, `permissionRef` to the exact marker `NO_TEXT_IMPORTED_LINK_ONLY`, and `paragraphs` to a single string exactly: `This entry opens the publisher's reading room. No text or translation has been imported into this library.` Additional paragraphs or a substituted passage refuse validation. The reader shows a visible external-source link. This records a link-only reference; it does not claim permission to import translations.

Limits: 12 MiB plaintext UTF-8, 18 MiB outer envelope, 200 works, 10,000 paragraphs per work, 100,000 paragraphs total, and 100,000 characters per paragraph. The reader renders 50 paragraphs at a time. A local title/tradition filter helps navigate large collections; it clears when locked and never enters URLs or storage. The UI does not create private notes or change existing reflection/backup formats.

## Preparing a collection

Keep the payload and any passphrase file outside **all** Git repositories and worktrees. A passphrase file must have mode 0600 on Unix. The tool never accepts a password as a command-line value or environment variable. With no passphrase file, it prompts twice in an interactive terminal without echo.

```sh
node tools/private-library/seal.mjs --input /private-outside-git/collection.json --output private-library/collection.enc.json --passphrase-file /private-outside-git/passphrase.txt
```

Use a randomly generated long password or several randomly chosen words. The tool requires 24–256 characters and at least eight distinct characters; those checks cannot measure actual entropy. Existing output is refused. For rotation, create a new encrypted output and review the replacement explicitly. Never place the real password, original payload or a plaintext preview in a commit, PR, screenshot or test log.

## Security behavior

Encryption uses Web Crypto AES-256-GCM, a newly randomized 96-bit nonce, 128-bit authentication tag, a newly randomized 128-bit salt, and PBKDF2-HMAC-SHA-256 at 600,000 iterations. Algorithm identifiers and work factor are fixed and bounded; altered ciphertext, wrong passwords and invalid formats refuse access. The single executable has no imports and is pinned by HTML SRI; `node tools/private-library/pin-sri.mjs` checks the pin and `--write` regenerates it after a reviewed code change.

Passwords are cleared from the input immediately. Content and keys remain in memory only. There is no browser storage, automatic export, private URL fragment, query string, search indexing or telemetry. The only automatic fetch is the fixed same-origin encrypted file, with no credentials, no referrer, no redirects, a streamed size limit and no-store requested. Source links require an intentional click and carry no referrer. The public service-worker inventory should omit this private reader and encrypted collection; in any event, plaintext is never passed to a worker or cache.

Locking clears the DOM and collection references, invalidates in-flight unlocks and aborts pending fetches. The view locks on page hiding, pagehide, a persisted pageshow, before printing, and five minutes of inactivity using a monotonic clock. Print CSS independently hides the page content. Rendering uses textContent, never source-supplied HTML.

## Limits that the interface must not overstate

- Public ciphertext can be downloaded and attacked offline. Password strength matters; a short PIN is unsuitable.
- A shared passphrase grants access to anyone possessing it. There is no per-person account, audit, invitation or individual revocation. Rotation protects subsequent ciphertext, not copies already obtained.
- Trusted recipients can copy or photograph what they read. The app cannot prevent that.
- JavaScript can drop references and overwrite byte buffers, but cannot guarantee physical erasure of strings, browser memory, device snapshots or password-manager choices.
- SRI detects a changed executable when its HTML remains fixed. An attacker controlling the origin can replace both HTML and scripts or a service worker and steal an entered password. Individual permissions and stronger delivery isolation require a separately authenticated service.
- No qualified content approval or Claude review is asserted by the new tests.

## Verification

`node tests/private-library-contract.mjs` runs 19 meaningful encryption, schema, file-boundary, diagnostic-redaction and script-pin checks, including an actual multi-megabyte encryption/decryption and strict link-only admission. Synthetic fixtures only.

`node tests/private-library-browser.mjs` runs fifteen checks, including ciphertext tampering, inert script-shaped text, filtering and external references, lock races, URL/storage/network leakage, reload/back/print/hidden locks, inactivity, mobile overflow and a real changed-script SRI refusal. It accepts `GLP_PLAYWRIGHT_MODULE` and `GLP_CHROMIUM_EXECUTABLE` for a separately installed test runtime. These environment variables contain executable paths, never passwords.

All **15 browser checks passed** on the authorized Mac using Chrome 158.0.8127.37, Node 22.15.0 and Playwright 1.62.1 in a fresh temporary headless profile. Only four source/fixture files were transferred; no actual private collection, owner password or existing browser profile was used. Results and exact source SHA-256 receipts are in `evidence/private-library/browser/`. Three synthetic screenshots were inspected at 390- and 320-pixel widths. The original local-browser absence and blocked download remain documented in `evidence/private-library/BROWSER_PENDING.md`, now marked resolved by the Mac run. Desktop browser verification does not establish physical iPhone/Safari or VoiceOver acceptance.

Primary implementation references checked 2026-11-27:

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html): PBKDF2-HMAC-SHA256 work-factor guidance. Using this guidance does not mean the application is FIPS-certified.
- [MDN AES-GCM parameters](https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams): unique nonce requirements and recommended 96-bit IV.
- [MDN SubtleCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto): platform cryptographic API and secure-context requirements.
