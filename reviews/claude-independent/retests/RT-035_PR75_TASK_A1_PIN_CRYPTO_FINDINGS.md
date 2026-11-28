# RT-035 — #75 Task A §1: PIN behaviour and cryptography — independent findings

Reviewer: Claude (independent). 2026-11-27. Criteria frozen in **RT-033** before reading
any implementation file. Target `c3a4cc027b48c246027b545d9120dfb72d7ebe6f`.

**Recorded before examining the builder's `tests/private-library-*.mjs` content.** I knew
only their pass *counts* (24 and 18) from RT-032, which are not criteria.

**Owner-privacy boundary held.** The owner's real sealed collection
(`private-library/collection.enc.json`, 4.97 MiB of ciphertext) is committed. I did **not**
attempt to unlock it, derive a key against it, or seek the owner's PIN. The only operation I
ran on it is `validateEnvelope`, which parses structure and base64 and produces no plaintext.
Every seal/unseal test used synthetic collections and PINs I generated.

## Verdict for §1

**Nine of ten falsifiers did not fire. One (F1.7) needs a browser and is deferred, not
closed.** No defect found in the cryptographic core.

| id | result |
|---|---|
| F1.1 authenticated encryption | **did not fire** |
| F1.2 KDF work factor | **did not fire as a defect** — measured, and disclosed; see below |
| F1.3 salt / nonce freshness | **did not fire** |
| F1.4 leading-zero PIN | **did not fire** |
| F1.5 failure-message oracle | **did not fire** |
| F1.6 post-decryption schema | **did not fire** |
| F1.7 automatic locks / key retention | **DEFERRED** — browser required |
| F1.8 cancellation / prior version | **did not fire** |
| F1.9 wording accuracy | **did not fire** — one nit only |
| F1.10 plaintext exfiltration | **did not fire** |

## F1.1 — authenticated encryption: holds

AES-GCM-256, 128-bit tag, with `additionalData` bound to the format string. All five tamper
variants were refused: a flipped ciphertext byte, a flipped IV byte, a flipped salt byte, a
truncated ciphertext, and format/AAD substitution.

## F1.2 — KDF work factor: measured, and the number matters

Declared and enforced: **PBKDF2-HMAC-SHA256, 600,000 iterations** — equal to current OWASP
guidance for that primitive. `validateEnvelope` pins the parameters exactly, so a downgraded
envelope (fewer iterations, different hash, different cipher) is refused rather than honoured.

**Measured on this machine:** one unlock attempt costs **154 ms** on a single CPU core →
6.5 guesses/s → **≈43 CPU-core-hours to exhaust all 10⁶ PINs.**

A six-digit PIN carries ~20 bits; 600,000 iterations adds ~19 bits of work. That is the whole
protection, and GPU attack is far cheaper than the CPU figure above. **I did not measure a
GPU**, so I give no GPU number — only that published benchmarks for this primitive and
iteration count put a single high-end consumer card in the thousands of guesses per second,
which would move exhaustion from core-hours to the minutes-to-hours range.

**Why this is not filed as a defect:** the application says so itself, in the user-facing
page, in these words — *a six-digit PIN provides casual privacy; on a public website someone
can download the encrypted collection and try every PIN; anyone who unlocks it can copy what
they read.* That is precisely the attack, named precisely, including the public-download
vector. The iteration count is not covering for a weak disclosure.

**What the founder should nonetheless see plainly, because it is his decision and not a
review finding:** the sealed collection is **committed to the public repository**, so the
ciphertext is already in the hands of anyone who clones it, and the 10⁶ search space is the
only thing between that file and its contents. A static site must be able to fetch the
envelope, so publishing it is the design, not an accident — but *disclosed* is not the same
as *acceptable*, and whether casual privacy is the right trade for his own reading is his
call, not mine. If he wants more, the lever is PIN length, not iterations: each added digit
multiplies the attack by ten, while iterations are already at the guideline ceiling.

## F1.3 — salt and nonce: holds

Fresh `getRandomValues` 16-byte salt and 12-byte IV per seal. Two seals of identical
plaintext under the same PIN produced different salt, different IV and different ciphertext.
Lengths are enforced exactly on load.

## F1.4 — leading-zero PIN: holds, all eight cases

`"012345"` seals and unlocks itself; `"12345"` and `"123450"` are refused; `"000000"` works.
The PIN is never coerced to a number: `validatePin` requires a string of exactly six
characters matching `[0-9]{6}`, and the numeric `12345`, the string `"0"` and `" 12345"` are
all refused. The input element carries `pattern="[0-9]{6}"` with min/max length 6, and the
help text says to keep leading zeros.

Sealing is **PIN-only** while unlocking also accepts a legacy 24–256 character passphrase.
Verified: a long passphrase cannot create a new seal, and a 7-digit or 23-character
credential is refused on unlock. The asymmetry is deliberate and correctly implemented —
decode compatibility that cannot be used to weaken new seals.

## F1.5 — no oracle: holds

All five distinguishable failure classes — wrong PIN, tampered ciphertext, malformed
envelope, valid crypto with a bad schema, valid crypto with non-JSON — return the **single
identical string** *"Unable to unlock this collection. Check your PIN and collection file."*
`unlockCollection` wraps the whole operation and discards the internal cause.

## F1.6 — post-decryption schema: holds, 32 of 32

The important part is that these payloads were **correctly encrypted under the right PIN** —
this tests the gate *after* decryption, which is where a malformed or substituted collection
would land. A well-formed control payload still opens, so the gate discriminates rather than
refusing everything.

Refused: extra or missing top-level key; extra key inside a work or its source;
`__proto__` and `constructor` keys; array, string and null payloads; wrong schema id; NUL in
text; over-length title; empty works; duplicate work id; unknown `tradition`; unknown
`rights`; `http://`, credentialed and `javascript:` source URLs; `permission-recorded`
without a permission reference; the impossible date `2026-02-30`; a non-ISO date; an
out-of-charset `editionId`; non-array paragraphs; a numeric paragraph; and more than 200
works. Exact-key-set matching is what does the work — unknown fields are refused, not ignored
— and `Object.getPrototypeOf(v) === Object.prototype` blocks prototype-polluting and
class-instance payloads.

**Two structural guarantees worth naming, because they enforce standing constraints in code
rather than in prose:**

1. **`link-only` cannot smuggle text.** A work marked `link-only` must carry a permission
   reference of exactly `NO_TEXT_IMPORTED_LINK_ONLY` and **exactly one** paragraph which must
   be **byte-identical** to the fixed notice. I tested it four ways: imported chapter text,
   the notice plus one extra paragraph, the notice with one trailing space, and the notice
   without the permission reference. All four refused. So the rights category that asserts
   "no text imported" cannot be used as cover for importing text.
2. **The private library structurally cannot hold Gurbani.** `tradition` is a closed
   enumeration of `bible`, `early-buddhist`, `tibetan-buddhist`, `other-religious`. I tried
   `gurbani` and it was refused. Gurbani therefore cannot enter the comparative-reading
   library at all; it stays in the verified scripture reader. That keeps the standing
   constraint against imposing another tradition's framing on Gurbani enforced by the data
   model, in both directions.

## F1.8 — a failed update does not destroy a working version: holds

`fs.writeFile` with `flag:'wx'` and mode `0600`, plus a pre-check. The second seal to an
existing path was refused and the existing file was left **byte-identical**. Six refused
attempts created **zero** files.

Input and credential guards all refused correctly: input inside a Git working tree; a PIN
file at mode 0644; a non-digit PIN; a five-digit PIN; both PIN options at once; and a PIN
passed as a command-line argument. The sealed output contains no plaintext marker and no PIN.

`assertOutsideGit` is more careful than it needs to be, and that is to its credit: it walks
every parent directory for `.git`, **then** runs `git rev-parse` with all `GIT_*` environment
variables stripped, and treats an inconclusive result as refusal. So the "private input stays
outside Git" rule cannot be bypassed by environment manipulation.

## F1.9 — wording: holds, with one nit

The page states the real limitation in plain language, quoted under F1.2, and adds that the
view locks when the tab is left and that neither the PIN nor reading history is saved. This
is accurate and, if anything, under-claims.

**Nit (not a finding):** the transient status line reads *"Preparing secure reading…"* and
the unsupported-browser message *"Secure reading is unavailable…"*. Both refer to secure
*context* (HTTPS), which is technically what they test, but "secure" unqualified is the one
word on the page a reader could over-read. The accurate privacy note sits directly below it,
so the net impression is correct. Mentioning it only so the choice is deliberate.

## F1.10 — plaintext cannot leave the device: holds

- CSP on the page: `default-src 'none'; script-src 'self'; style-src 'self'; connect-src
  'self'; base-uri 'none'; form-action 'none'; object-src 'none'`. `connect-src 'self'` and
  `form-action 'none'` mean that even a code path that tried to post plaintext outward would
  be blocked by the browser, not merely absent.
- One network call exists in the whole module: a `GET` of the envelope with `cache:'no-store'`,
  `credentials:'omit'`, `redirect:'error'`, `referrerPolicy:'no-referrer'`.
- Zero occurrences of `localStorage`, `sessionStorage`, `indexedDB`, `innerHTML`,
  `XMLHttpRequest`, `sendBeacon`, `document.cookie`, `eval` or dynamic `import()` in the
  private-library path. Passages render via `textContent`.
- External links carry `rel="noopener noreferrer"` and `referrerPolicy="no-referrer"`;
  the page is `noindex,nofollow,noarchive` with `referrer: no-referrer`.
- **The committed SRI digest matches the served module.** I recomputed it:
  `sha384-Jh+8TwmitiLxZa8E7HQvFDgNbBep1hus6rxAiwSLEyHjOFZr6hmPFDnraiWXMACl`, identical to the
  `integrity` attribute. So a substituted `app.mjs` would fail to execute rather than run.

## A bug class they had already found, verified fixed

A comment in `unb64` records that a grouped repeated regex could overflow the engine stack on
a full-book pack, and the validation was rewritten as a constant-stack character loop with a
canonical decode/re-encode check. I exercised that path at the real size:
`validateEnvelope` on the 4.97 MiB envelope completed in 809 ms with the canonical re-encode
check passing, and non-canonical base64 was still refused at full size. The fix holds at the
size that broke it.

## Deferred, not closed

- **F1.7** — automatic locks on tab-hide, `pagehide`, back/forward cache restore, print, and
  five-minute idle; and whether the derived key or plaintext remains reachable after lock.
  The code shows handlers for all six and a non-extractable `CryptoKey` that is never stored,
  with `plain.fill(0)` on every exit path and `collection=null` on lock. **Reading that is not
  testing it.** It needs a real browser and will be exercised in the same browser pass as the
  §3 navigation cases, which need one too.
- Whether the owner's real collection behaves as the synthetic ones do. Not testable without
  his PIN, which I will not seek. **I do not generalise from synthetic to owner.**
