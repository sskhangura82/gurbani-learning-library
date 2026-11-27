# Builder security follow-up

This is ChatGPT's implementation self-review, not independent Claude review.

## Concrete defect found and repaired

The initial grouped repeated Base64 regular expression overflowed V8's stack on a valid 7 MiB input. This could make a full Bible-sized pack impossible to unlock despite being within the advertised size limit. Reproduction returned `RangeError: Maximum call stack size exceeded`.

The decoder now uses a bounded linear character scan with constant stack space, verifies length and padding, and then requires canonical decode/re-encode equality. An actual roughly 7.5 MiB synthetic plaintext encryption/decryption is included in the passing contracts. No tolerance, normalization or dropped bytes was added.

## Boundaries checked by inspection and Node tests

- No plaintext asset, owner password, logging, browser storage or URL-based content channel is introduced by this module.
- Browser unlock results are generation-bound. A lock invalidates earlier asynchronous results; a prior completion cannot replace the new session or unlock a closed page.
- Raw password and decrypted byte buffers are overwritten where available. JavaScript strings, parsed objects and CryptoKey internals cannot be guaranteed physically erased. Documentation makes that limitation explicit.
- HTML SRI protects the only executable against script-only mutation. It does not protect against a compromised origin replacing both HTML and code or controlling a service worker.
- Source links accept HTTPS URLs only, reject embedded credentials, and use no-referrer/noopener. Text and metadata are inserted as text, not HTML.
- Every pack admits only bounded schema fields and a fixed cryptographic work factor. Public ciphertext permits offline guesses; the UI therefore requires a long password and makes no claim that browser attempt throttling would secure a weak one.
- Packing inputs are checked outside Git, including realpath symlink targets and worktree `.git` files, before reading them. Password-file permissions and no-overwrite behavior are enforced.
- Link-only references accept one fixed no-import notice and marker. They cannot admit arbitrary body paragraphs under that mode. Metadata source selection and accuracy still require editorial verification.

## Browser verification and remaining limits

The 15 browser checks subsequently passed on the authorized Mac using a fresh temporary headless Chrome profile, exact transferred candidate bytes and synthetic data only. These checks established the concurrency, history, visibility, print, source-filter and mobile-layout observations described in `browser/results.json`. The environment receipt binds the four tested source files by SHA-256. Physical iPhone/Safari and independent Claude review remain separate.
