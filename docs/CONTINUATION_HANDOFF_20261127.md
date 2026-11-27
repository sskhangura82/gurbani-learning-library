# Gurbani continuation — integrated candidate

> Historical handoff for the first candidate. The founder subsequently selected
> a six-digit PIN and the full named-edition original readers were built. Current
> coverage, access and review status are in `PIN_SOURCE_READERS_HANDOFF_20261127.md`.

## Result

This candidate combines the latest reviewed reader work and the founder's new
access and historical-review decisions. It is a development candidate for a
single draft PR against `main`; it is not a family-site deployment.

The application bytes exercised in the final combined Mac browser run are
commit `da9fe489921addc33591f25204a9bbf07d40ef6f`. Subsequent changes complete
historical source-review receipts, correct the navigation fixture's own path
normalization and Explore test's clock assumption, and record evidence and this
handoff. Those changes do not alter
the browser-tested runtime. The final runtime digest inventory records that
relationship explicitly.

## What is available in the candidate

| Area | Access | Actual scope |
| --- | --- | --- |
| Existing Gurbani readers | Open | Current source packs and saved-learning behavior preserved |
| Sri Dasam Granth entrance | Open | Existing Jaap Sahib, Tav-Prasad Savaiye, and Chaupai Sahib readers; full Dasam Granth is explicitly pending |
| Psychology entrance | Open | Public intellectual-humility study and existing related learning routes |
| Comparative religious reading | Shared strong passphrase | Locally decrypted Bible and Dhammapada, plus a Tibetan publisher link |
| Daily Hukamnama | Existing development candidate | Latest reviewed official-source selection/delivery work preserved; automatic publishing remains inactive |
| Kartarpur history | Withheld draft | ChatGPT has inspected all five witnesses for ten qualified claims; actual Claude review is pending authentication |

The Dasam entrance keeps the compositions' existing source identities. It does
not relabel Nitnem as a single source family or claim that three selections are
the complete Granth. The new source-only Farid reader also has a visible
collection entrance without changing the ten-reader catalog's storage identity.

The current public Knowledge projection removes its prior Buddhist study and
comparison edge. Psychology remains public. Its admission policy rejects
restoring, relabeling, or substituting a religious study even after renewing the
editable pack digest. Original Gurbani bytes and saved Haumai lesson bindings
remain exact. Prior public Git history is not erased by this projection change.

## Initial private collection and source preservation

The encrypted envelope is **6,953,017 bytes** and decrypts to **84 entries / 1,433
paragraphs**. The entries contain:

- World English Bible Classic's publisher-selected **81-book ecumenical
  read-aloud edition**, with all **1,402 supplied chapter files** and a separate
  publisher-notices entry. The source format itself excludes footnotes,
  introductions and verse numbers; those limitations are disclosed.
- Project Gutenberg's **Dhammapada**, F. Max Müller's historical English
  translation: **26 chapters**, every source verse number **1–423**, all supplied
  front matter, and the complete Gutenberg notice/license. The source's omission
  of introduction, notes and index is disclosed. Its nine combined verse pairs
  remain combined.
- An **84000 Tibetan reading-room link**. No Tibetan translation is imported.

The importer preserves all supplied chapter characters and line endings, removing
only a UTF-8 BOM. The Dhammapada paragraphs concatenate back to the exact decoded
source. Full encryption/decryption round-trip equality passed. Source metadata
and URLs are encrypted together with the text. A safe source/count/digest receipt
is committed under `evidence/private-library/collection-receipt.json`; the full
plaintext payload, detailed receipt and owner passphrase remain outside Git.

The owner receives the passphrase in a separate private access file. There is no
password, recovery key or private preview in the PR, repository, workflow,
browser evidence or URL.

## Access behavior

The collection uses AES-256-GCM and PBKDF2-HMAC-SHA-256 at 600,000 iterations,
with fresh random salt and nonce. A strong random owner passphrase was generated;
a short numeric PIN would not protect a downloadable encrypted file adequately.

The reader clears its password input after submission and renders source text
as text. It keeps decrypted reading state in memory and clears it on manual
lock, tab hiding, page exit, reload, Back restoration, printing and five minutes
of inactivity. No private content is added to local storage, IndexedDB, public
search, learning backups or URL parameters. Private paths explicitly bypass the
public service worker; offline generation refuses inherited private entries.

The shared password authorizes everyone who possesses it. It cannot individually
revoke a recipient or revoke material already copied. The trusted site's HTML
and script delivery remain part of the security boundary; SRI is not a defense
against a fully compromised origin. No stronger claim is made.

## History and Daily decisions

The new history policy follows the founder's instruction: ChatGPT prepares and
checks exact source-supported claims; actual Claude independently checks them.
Human authorship or a qualified-human signature is not imposed as a mandatory
gate. Unsupported claims, inadequate citations, changed paragraphs, changed
source witnesses, wrong reviewer identities and stale review records still
refuse admission. Two models agreeing does not establish historical truth.

For Kartarpur, all five sources were retrieved and inspected, including the exact
original Gurmukhi passage. Ten claims are qualified, with zero incomplete first
stage checks. The manuscript and registry remain byte-identical to #71. The
actual Claude Code 2.1.266 invocation stopped before any model tokens because its
OAuth session had expired. That failed invocation is recorded and explicitly
cannot stand in for a source review. The only remaining editorial reason is
`MISSING_CLAUDE_CHECKER_SOURCE_REVIEW`.

Daily uses the official Harmandir Sahib / SGPC published selection and Amritsar
date. Explanations are separately authored and checked against the complete
selected source; a missing observation is not replaced with a random Shabad.
Modern custodian translations, explanations, PDFs and recordings are not treated
as freely licensed merely because they are public. This continuation preserves
the isolated Daily publisher and does not activate its schedule or transfer keys.

## Verification

| Verification | Observed result |
| --- | --- |
| Combined Node contracts | **109/109**, zero failures or skips |
| Private crypto, schema, file and SRI contracts | **19/19** |
| Importer Git-boundary regression checks | **12/12** |
| Public service-worker simulation | **9/9**, including private route bypass |
| Private reader in real Chrome | **15/15** |
| Combined browser navigation | **10/10**, at 320 CSS pixels |
| Combined browser script protection | **13/13** |
| Combined browser public Knowledge integration | **10/10** |
| Real browser offline/update preservation | **6/6**, including failed candidate installs and retained synthetic learning |
| Generated delivery | Four reproducible closed bundles, 26 inputs, 59 script pins on 19 pages, 112 public offline assets |
| Actual private collection | Exact plaintext-to-encrypted-to-plaintext round trip; repository scan contains no owner passphrase |

These suites overlap in scope; their counts are not presented as a sum of unique
requirements. The private-reader tests used synthetic texts and passwords. The
combined browser fixture forcibly refuses the actual ciphertext route before a
file read, and no owner password was transferred to the Mac. All browser contexts
were fresh and temporary; no family reflections or existing browser profile were
opened. Desktop Chrome results do not claim physical iPhone/Safari or VoiceOver
acceptance.

Evidence preserves initial failures: unavailable local Chromium, the multi-MiB
Base64 decoder defect, the importer environment-override loophole, and a trailing
slash error in the navigation test's own fixture. The first GitHub run also
found an Explore test that assumed a daytime initial theme. Its corrected
transition explicitly establishes and verifies Day before switching to Amrit
Vela; the source, layout, and saved-state assertions are retained. Final GitHub
results belong to the PR's exact head. Claude authentication remains explicitly
unresolved.

## Branch and review state

The combined tree retains the reviewed heads of Daily #73, Farid #72, Haumai #66,
Explore #74, QA #67 and history #71, on the reviewed #63 composite. Exact amendment
records preserve the older source and script-scope checks through the new
navigation and public Knowledge changes; no historical guard was broadly waived.

Superseded PRs **#41, #45, #48, #49, #53, #57 and #58** were closed without merging.
Their evidence and branches remain available. Other active component PRs remain
as history for assessing this combined candidate.

The family `main` remains `a3476ac4b9be90dde350fb35dd13ce0b672c120d`. A review and
release decision applies to the final combined head, rather than assuming that
separately reviewed pieces establish integration acceptance. Claude needs a
renewed sign-in to complete the requested independent historical source review.
No additional content decision or short-PIN selection is needed from the founder
to inspect this candidate.
