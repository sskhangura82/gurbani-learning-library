# RT-033 — FROZEN CRITERIA: #75 Task A, sections 1–4 (engineering / source admission)

Reviewer: Claude (independent). Frozen 2026-11-27, **before** reading any of the
implementation files for these four sections.

## Prior-exposure disclosure

What I have already seen of this candidate, and nothing else:
- The review request text pasted by the founder.
- sha256 of nine target files (hashes only, contents unread).
- Test **outcomes** (RT-032): 11 / exit-0 / 24 / 28 / 31 / 18.
- `tools/script-integrity/package.json` dependency pins and the CI install line —
  infrastructure, not application logic.
- The committed `evidence/private-library/browser/pin-20261127/results.json`
  environment fields, read while checking what the fixture rewrote.

**Not yet read:** `private-library/app.mjs`, `tools/private-library/seal.mjs`, the
private-library HTML, `collections/source-reader/{core,reader,source-lock,reader.bundle}.mjs`,
`tools/build-shabados-original-collections.py`, either manifest, the evidence ledger, or
`package/README.md` of the npm archive.

**Builder tests for these sections are not to be examined until my own findings for the
section are recorded.** Test *outcomes* above are already known and are not criteria.

## Standing method commitments for this task

- Synthetic fixtures only. Every seal/unseal I exercise uses a PIN **I** generate.
- **I will not obtain, request, guess or brute-force the owner's PIN, read private
  plaintext, read personal browser state, or attempt to unlock the owner's collection.**
  A falsifier that could only fire by doing so is struck, not worked around.
- Raw database stays outside Git.
- I do not repair builder code, approve, merge, deploy or activate any publisher.
- I audit no third-party package I install.
- A finding is recorded whether or not it is comfortable; near-misses of my own are
  recorded as instrument errors, not as findings.

---

## §1 — PIN behaviour and cryptography

Each falsifier states the condition that would make it **fire**, and the instrument.

| id | fires if | instrument |
|---|---|---|
| **F1.1** | Confidentiality without integrity: a tampered ciphertext byte unlocks, or decrypts to garbage that is then accepted. | Synthetic seal, flip one byte in the ciphertext, unlock with the correct synthetic PIN. Must refuse. |
| **F1.2** | No KDF work factor, or one too low for a six-digit PIN: raw hash of the PIN, PBKDF2 under 100,000 iterations, or any construction whose cost per guess makes the 10⁶ space cheap to exhaust. | Read the KDF construction and parameters; state the implied cost to exhaust 10⁶ guesses on commodity hardware. |
| **F1.3** | Salt is absent, constant, or derived from the PIN; or the nonce/IV repeats across seals. | Seal identical plaintext twice with the same synthetic PIN; compare salt and nonce bytes. Both must differ. |
| **F1.4** | A leading-zero PIN is corrupted — `"012345"` coerced to a number, trimmed, or treated as equal to `"12345"`. | Seal with `"012345"`; unlock with `"12345"` must fail, with `"012345"` must succeed. Also test `"000000"`. |
| **F1.5** | Failure messages distinguish wrong-PIN from corrupt-data from no-record, giving an oracle. | Compare thrown error identity and message across all three cases. Must be indistinguishable. |
| **F1.6** | Post-decryption content is accepted without a strict schema — unexpected fields, wrong types, or prototype-polluting keys survive into application state. | Build a *correctly encrypted* blob whose plaintext violates the schema; attempt load. Must refuse. |
| **F1.7** | After lock, reload, or idle expiry, the derived key or plaintext remains reachable — in storage, in a module-scope variable, or in a cached object. | Lock, then inspect storage and any retained references in the harness. |
| **F1.8** | Cancelling an in-flight seal/unseal leaves a partially written record, or destroys the prior good record. | Cancel mid-operation; prior state must be intact and readable. Covers the standing "a failed update must not destroy a working previous version". |
| **F1.9** | User-facing wording claims protection beyond what the actual KDF and a six-digit PIN provide — "secure", "encrypted" without qualification, or any phrasing a reader would take as resisting a determined offline attacker. | Read the user-facing strings; compare against the measured F1.2 cost. |
| **F1.10** | Private plaintext can leave the device — any fetch/XHR/beacon/form post/URL parameter on a path reachable with plaintext in hand. | Static search of the private-library path for network primitives, plus harness network capture during a synthetic unlock. |

**Not closable by me in §1:** whether the owner's real collection behaves as the synthetic
one does. I will say so rather than generalise.

---

## §2 — Original-text rights and edition identity

| id | fires if | instrument |
|---|---|---|
| **F2.1** | The asserted reuse basis does not actually say what the candidate claims it says. | Independently read `package/README.md` inside the 5.0.0-next.0 npm archive; compare its own words to the candidate's assertion. |
| **F2.2** | Any recorded archive / database / README hash in the evidence ledger does not match the real artifact. | Recompute sha256 of each from the archive I fetched independently. |
| **F2.3** | The MIT software licence is treated as covering the scripture text, or the two are merged into one permission claim. | Read the notice handling and the manifests for conflation. Standing constraint: public availability establishes no redistribution right. |
| **F2.4** | A specific printed edition is asserted as the source without a basis that could identify it, or edition identity is implied by Ang number / first line alone. | Check what the manifests claim and what supports it. Standing constraint: Ang number or first line is never sufficient authentication. |
| **F2.5** | Declared counts disagree with the database: SGGS/SSA2 51 sections, 5,549 groups, 60,555 records, pages 1–1,430, 75 chunks; SDGR/DGDG 17 / 5,470 / 67,758 / 1–1,428 / 80. | Re-derive each count directly from `master.sqlite` with my own query, not theirs. |
| **F2.6** | Any retained anomaly has been silently normalised: the fourteen Dasam 9QK page decreases, the SGGS G4W printed-line anomaly, the Raagmala ALAM label, the blanket Dasam GGSN label. | Confirm each is still present **and still labelled as an anomaly**, not quietly smoothed. |
| **F2.7** | Excluded material has entered Git, or the raw database is tracked. | Check the tracked tree for database and excluded content. |
| **F2.8** | The OpenGranth research-packet eligibility flag has changed. | Compare against the recorded prior value. |

---

## §3 — Reader integrity and navigation

| id | fires if | instrument |
|---|---|---|
| **F3.1** | A corrupted or incomplete package renders as a complete, valid composition. | Tamper the package; confirm the reader refuses rather than displays. Standing constraint. |
| **F3.2** | Per-line verification is **not reached** on the real entry path for the named units, even though a tamper test appears to pass. | **Instrument-error 35 applies.** Identify the real entry point first, prove the tamper is observed there, and only then report. A test that returns the expected answer is the moment to check the instrument. |
| **F3.3** | Position is lost or misplaced on page entry, prev/next, Back/Forward, reload, or `?page=&unit=&line=` deep links. | Exercise each, synthetic storage. |
| **F3.4** | Saved-place keys collide across collections or editions. | Inspect `glp001.sikh-source-place.v1:<collectionId>:<editionId>` construction; attempt a cross-collection collision. |
| **F3.5** | The `c3a4cc0` repair does not actually prevent a newer saved-place action being discarded by an in-flight resume. | Reproduce the race against the parent commit, then against the target. The repair must change the outcome. |
| **F3.6** | Line counts for ZKH, SKD, the 399-line TNM, final SGGS FD3, or the 426-line Dasam 4TJ disagree with the source. | Re-derive from the pinned source. |
| **F3.7** | Layout breaks at 320 px. | Browser fixture at 320 px width. |

---

## §4 — Preservation of the existing application

| id | fires if | instrument |
|---|---|---|
| **F4.1** | Any of the ten existing readers is removed, regressed, or silently altered. | Compare the reader catalog against the pre-#75 state. |
| **F4.2** | The `tests/helpers/source-reader-navigation-scope.mjs` amendment weakens a proof that previously held. | Read the amendment record; re-run the prior proof under the new helper. |
| **F4.3** | The Knowledge projection access policy changed without a record. | Compare policy and record. |

---

## Explicitly outstanding regardless of outcome

Physical iPhone / iPad / VoiceOver / airplane-mode acceptance · printed-source collation ·
audio rights and permission · qualified Sikh scholarly review. **A clean finding list in
this task closes none of these and is not permission to merge or release.**
