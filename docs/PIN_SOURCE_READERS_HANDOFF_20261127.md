# Simple PIN and full original-text collection readers

This is the current continuation of draft PR #75. It supersedes the access and
collection-coverage statements in `CONTINUATION_HANDOFF_20261127.md`; that file
records the earlier candidate. The founder asked to keep building while away,
use a simple PIN for personal use, and ask actual Claude to review after the
build. No desktop action is required to implement or inspect this increment.

## Delivered in the development candidate

| Area | Access and actual coverage |
| --- | --- |
| Sri Guru Granth Sahib Ji | Open original-text reader; all 60,555 records of the named SGGS/SSA2 edition, 51 sections and source-reported Angs 1–1430 |
| Sri Dasam Granth | Open original-text reader; all 67,758 records of the named SDGR/DGDG edition, all 17 sections and reported pages 1–1428 |
| Existing Bani readers | Their selected editions, saved places, bookmarks and reflections stay separate and preserved |
| Psychology | Open, without a PIN |
| Comparative religious texts | Six-digit PIN; the unchanged Bible/Dhammapada source collection is resealed; Tibetan reading remains a publisher link |
| Historical review | ChatGPT's source checks are recorded; actual Claude's independent source review remains queued, with no invented receipt |

The implementation commit for the shared reader is
`c3a4cc027b48c246027b545d9120dfb72d7ebe6f`. Later fixture, evidence and handoff commits
are identified separately. The runtime digest inventory is
`evidence/shabados-original-collections/verification/application-digests.json`.

## PIN behavior

The private entrance is a masked six-digit field with a numeric mobile keyboard.
Leading zeros are preserved. The owner PIN and plaintext have never been put in
Git or test evidence. The existing private access file was replaced with the
current PIN and instructions; the previous long-passphrase instructions are no
longer current for this candidate.

The actual collection has been decrypted with the new PIN and compared exactly
with the prior source payload. It still contains 84 entries and 1,433 paragraphs,
including the publisher's 81-book World English Bible Classic ecumenical
read-aloud edition, F. Max Müller's Dhammapada and retained notices. No text was
changed by resealing. The new envelope is 6,953,017 bytes; its safe receipt is
`evidence/private-library/pin-20261127/owner-collection-receipt.json`.

A short PIN provides casual privacy for the current personal-use arrangement.
The encrypted file is publicly downloadable, so guessing can occur offline.
AES-GCM authentication, the existing KDF, private-cache exclusion, no persistent
decrypted browser storage and automatic locking remain in place. The old
passphrase is decode-compatible at the low-level API only; new seals and the
product interface use the six-digit PIN.

## Exact source and coverage

Both new readers use Shabad OS Database 5.0.0-next.0. The archive, SQLite database
and separate original-text notice are pinned by digest. Only the primary
original records of SGGS/SSA2 and SDGR/DGDG are projected. Modern translations,
commentary, transliteration, audio, scans and English section descriptions are
excluded. `SHABADOS_ORIGINAL_SOURCE_NOTICE_20261127.md` gives the attribution,
rights basis, exact artifact identity and printed-source bibliography.

This is complete coverage of the two named original-text assets. It does not
claim every manuscript variant, independent printed collation, completed
explanations, completed Santhiya, or an adjudication of disputed authorship.

The importer and runtime preserve all 11,019 provider source groups and 128,313
original records. The SGGS edition is distinct from the existing OpenGranth
research packet and the existing Bani editions. The old research packet's
runtime/publication flags are not promoted or rewritten.

Dasam's bibliography combines several printed sources. The coarse DGDG label
does not make the entire collection a single SGPC printed edition. Its section
coverage includes Charitropakhyan, Zafarnama and Hikayat. Provider attribution is
shown inside qualified source details. The reported Dasam page-label decreases
in group 9QK and SGGS printed-line decrease in G4W are preserved and recorded;
reading order never sorts or repairs the original lines by those labels.

## Reader and saved-place behavior

- An Ang or page opens every complete source group owning that page, in source
  order. Groups that cross boundaries stay whole, including the 399-line SGGS
  group and 426-line Dasam group used in browser fixtures.
- Section selection, direct page entry, previous/next and stable source-line
  links use the manifest's actual membership. Malformed, duplicate, foreign or
  unowned routes refuse explicitly. A line must belong to both the exact group
  and the requested source page.
- A code-pinned manifest authenticates each chunk and each complete group's
  ordered content. The full requested view appears only after every required
  group verifies. A failed chunk cannot leave a partial or stale reading visible.
- Save place is explicit. Resume verifies the same collection, edition, group
  digest, line and page. Records use a new per-edition key; existing learning keys
  are never modified. Invalid or stale records remain unchanged until an explicit
  new save. Reading does not automatically resume or write a place.
- Navigation and save generations prevent stale asynchronous work from
  replacing a newer action. A delayed Resume cannot override a newly saved place
  on success or clear it on failure.
- Original text is rendered with `textContent`. Font size and day/night controls
  affect appearance only. Raw source data loads on demand; only the small public
  reader shells enter the offline application inventory. Complete offline source
  availability has not been added.

## Verification and review

The new importer passes 11 synthetic boundary tests. The core passes 16 contract
checks, including all 155 actual chunks, every group digest and every original
record. The integrated Node run passes 59 checks with zero failures or skips.
The first integrated run omitted the required existing OpenGranth research-path
environment variable and failed that fixture; its result is retained. Rerunning
with the actual unchanged research packet passed. No source or gate was loosened.

The PIN update passes 24 contract/CLI checks and 18 real Chrome checks using
synthetic text and a public test PIN. Actual-owner resealing is checked separately
without sending the PIN to browser tests or the Mac.

Delivery now has five closed bundles, 29 declared source inputs, 21 HTML pages,
61 script pins and 117 public offline assets. New navigation is admitted through
exact before/after scope records; previous source, teaching, saved-learning and
script-scope proofs still pass. Private routes remain outside the public cache.

The actual-browser shared reader passes 35 scenarios. Combined navigation passes
10, existing script transport passes 13, and real service-worker update and
saved-learning preservation pass 6. The receipts and retained environment-only
failures accompany this handoff in the verification directory. Fresh desktop Chrome at narrow CSS widths
does not establish physical iPhone, Safari or VoiceOver acceptance. Suite counts
overlap and must not be summed as unique requirements.

## Next review and build work

Use `CLAUDE_REVIEW_NEXT_20261127.md` when the founder is ready to ask actual Claude
to review. Builder and subagent checks are not Claude evidence. A missing Claude
session does not prevent development, but historical publication still needs the
actual independent source check requested by the founder. No qualified-human
signature is substituted as an additional mandatory gate.

The next content layer is source-grounded explanation work tied to exact source
groups and editions, followed by broader original-text search. Existing Daily
Hukamnama work retains its official selection, complete-passage matching and
separate explanation status. Public availability of a modern custodian's
translation, recording or PDF is not treated as reproduction permission. Its
automatic publisher remains inactive.

PR #75 stays a reviewable development candidate. Production `main` remains
`a3476ac4b9be90dde350fb35dd13ce0b672c120d`. The superseded old Knowledge chain and
#41 remain closed without merging. This increment does not publish or deploy the
candidate and does not open existing browser profiles or family reflections.
