# RT-036 — #75 Task A §2: original-text rights and edition identity — independent findings

Reviewer: Claude (independent). 2026-11-27. Criteria frozen in **RT-033**.
Target `c3a4cc027b48c246027b545d9120dfb72d7ebe6f`.

**Method note that matters for this section:** I computed the archive, database and notice
digests from **my own independently obtained npm archive first**, and only then opened the
builder's ledger to compare. My numbers were not anchored to theirs. The raw database stayed
outside Git throughout and was opened read-only.

## Verdict for §2

**All eight falsifiers did not fire.** No defect found. One item is raised for the founder
that no engineering review can close, and one of my own earlier findings needs narrowing.

| id | result |
|---|---|
| F2.1 asserted basis does not say what is claimed | **did not fire** |
| F2.2 ledger hashes wrong | **did not fire** — three of three verified independently |
| F2.3 MIT treated as text permission | **did not fire** — explicitly disclaimed in data |
| F2.4 edition identity without basis | **did not fire** |
| F2.5 declared counts wrong | **did not fire** — ten of ten re-derived and matched |
| F2.6 anomalies silently normalised | **did not fire** |
| F2.7 excluded material in Git | **did not fire** |
| F2.8 research-packet eligibility flag | **did not fire** — value verified; see caveat |

## F2.2 — the three hashes, computed independently then compared

| artifact | my independent sha256 | ledger / manifest | |
|---|---|---|---|
| `shabados-database-5.0.0-next.0.tgz` | `839fa798…1b902b2` | `839fa798…1b902b2` | **match** |
| `package/dist/master.sqlite` | `517890c7…5ff16aeb` | `517890c7…5ff16aeb` | **match** |
| `package/README.md` | `cacf8c7e…613f795` | `cacf8c7e…613f795` | **match** |

Byte counts also match: archive 47,643,787; database 151,965,696. The manifest pins the
notice by digest, so if upstream rewords the notice the pin breaks rather than drifting
silently. That is the right mechanism.

## F2.1 and F2.3 — the reuse basis is the right document, and MIT is not being stretched

The upstream `README.md` carries **two separate licence sections**, and this is the crux:
one applies to code and to content *outside* the data folder and grants MIT; a second applies
to the texts *inside* the data folder, to generated build output, **and to releases, naming
GitHub and npm explicitly**. So the content notice covers the npm artifact actually in use —
the asserted basis is not borrowed from a document about something else.

The ledger names that section by title and pins it:
`basis: PUBLISHER_ORIGINAL_TEXT_PUBLIC_DOMAIN_NOTICE`,
`noticeSection: "Gurbani and Panthic Compositions"`, `noticeMember: package/README.md`,
`noticeSha256` as above. The software licence is recorded **separately**, with its own member
path and its own digest, under a field that says in as many words that it is not the content
permission: **`softwareLicenseUsedAsContentPermission: false`**. That is F2.3 answered in the
data rather than in prose.

The exclusion list is explicit and matches what the request warned about: modern translation,
commentary, transliteration, audio, English section description, scan, book layout.

**And the exclusion is enforced structurally, not by intention.** I checked the database
directly: the two admitted assets contain **only** `primary` rows — SSA2 has 60,555 and
nothing else; DGDG has 67,758 and nothing else. Every translation and commentary in that
database lives under *different* asset ids entirely (SBMS 120,973 translation rows; RSJD
67,720; DSSK 60,555; SNST Spanish 60,489; PSST 56,580 plus 49,265 notes; NKFT Faridkot Teeka
55,369; DSKO 33,704). Because the admitted assets have zero non-primary rows, selecting them
cannot pull in a translation even by accident.

The importer then asserts it three independent ways: the join is restricted with
`a.asset_id=? AND a.type='primary'`; each row is re-checked with
`row["type"]=="primary" and row["priority"]==1`; and the locator metadata is re-checked with
`additional["type"]=="primary"`. The pinned notice is a **required** command-line input, and
the output must be a fresh destination outside every Git tree.

## F2.5 — ten of ten figures re-derived independently

I wrote my own query against `master.sqlite` (joining `asset_lines → lines → line_groups →
sections`, primary rows only, ordered by source, section and line-group order) rather than
reusing theirs:

| | sections | groups | records | pages |
|---|---|---|---|---|
| SGGS / SSA2 derived | 51 | 5,549 | 60,555 | 1–1,430 |
| SGGS / SSA2 declared | 51 | 5,549 | 60,555 | 1–1,430 |
| SDGR / DGDG derived | 17 | 5,470 | 67,758 | 1–1,428 |
| SDGR / DGDG declared | 17 | 5,470 | 67,758 | 1–1,428 |

Chunk counts also match: 75 and 80.

**One instrument error of mine, corrected before it reached a finding.** My first derivation
read page numbers from the `data` column and produced `None`, which presented as a
discrepancy against the declared `1–1430`. `data` holds the Gurmukhi text; the locator lives
in `additional`. I had the wrong column, not they the wrong number. I re-derived and
everything matched. **Instrument-error 33 was this exact shape** — nearly asserting a
discrepancy that was my own misreading — and the rule held this time: an unexpected result is
the moment to check the instrument, not to publish.

## F2.6 — anomalies preserved and labelled, verified against my own derivation

`locator-anomalies.json` records, and I independently reproduced:

- **Dasam 9QK: exactly fourteen** within-group page-label decreases. Not merely the count —
  the page pairs match what I derived: eleven transitions 158→155 and three 159→155.
- **SGGS G4W: one** within-same-page printed-line decrease, at page 1377, where the printed
  line label goes 19→1.
- `sourceOrderPreserved: true` and **`locatorsRepaired: false`** for both collections, and
  `textNormalizationPerformed: false` in the ledger. So nothing was smoothed, renumbered or
  modernised. That satisfies the standing constraints against silent modification of Gurbani
  and against silently modernising spelling.

The file's own `scope` field is epistemically careful in a way worth naming: it says these are
observed numeric label decreases, **not an exhaustive collation and not an adjudication that
any label is wrong**. It reports what it saw without claiming the source is in error.

**Raagmala and the blanket Dasam author label — the two I expected to find trouble in, and
did not.** SGGS section 51 is Raagmala, one unit, `authorId: ALAM`. Every one of the 5,470
Dasam units carries `authorId: GGSN`. Both are contested matters, and I was forming a finding
in the shape of my existing **SIG-01** — attribution presented as settled. Three things
closed it:

1. The notice document names **both** specifically and labels them provider metadata, stating
   that source groups and author names do not settle individual attribution and that no
   canonical attribution is silently applied. For Dasam it says the upstream `GGSN` label is
   to be preserved **as source-reported attribution**, without claiming the extraction
   adjudicates historical authorship of any composition.
2. The reader **qualifies it at the point of display**. `reader.mjs` renders the author inside
   a collapsed "Source attribution" element reading: the name, then *"— as recorded by this
   digital source. This metadata is not a separate historical authorship finding."* The
   qualifier travels with the claim; it is not parked in a document the runtime never reads.
3. The Dasam entry page names Charitropakhyan, Zafarnama and Hikayat explicitly rather than
   burying them, and says this is complete coverage of that asset and **not** a critically
   collated canonical edition.

## F2.4 — edition identity is labelled honestly at every entry point

`status: NAMED_DIGITAL_EDITION_ORIGINAL_ONLY`, `locatorStatus: SOURCE_REPORTED`,
`editionId: shabados-5.0.0-next.0-SGGS-SSA2` / `-SDGR-DGDG`. The entry pages say it in plain
language: the library page offers *"1,430 source-reported Angs in the named digital edition"*
and states this is not independent printed-Ang authentication; the SGGS page says digital
source matching is complete while independent printed collation and editorial review remain
pending; and the Dasam page states that its page numbers follow that digital edition and
**are not Ang references in Sri Guru Granth Sahib Ji** — a distinction that would be easy to
blur and is not blurred.

Inside the reading view the per-line badge is a bare locator, with no qualifier repeated. I
considered filing that and decided not to: the basis is stated on the page a reader passes
through to get there, the machine-readable flag is in the manifest, and repeating
"source-reported" on 60,555 line badges would degrade the reading rather than inform it.

## Honesty in their own evidence, recorded because it counts in their favour

- **They found a real provenance gap upstream and published it.** The ledger records
  `reportedGitHeadStatus: REGISTRY_REPORTED_GITHUB_OBJECT_NOT_RESOLVED` with the probe that
  produced it — a 404 for the README at the git head the registry reports. So the archive
  cannot be tied back to a resolvable public source commit, and they say so instead of
  implying provenance they do not have.
- `registrySignatureCryptographicallyVerified: false`, while
  `publishedSha1AndSha512Matched: true` — the distinction between "the registry's own
  integrity values agree" and "a signature was verified" is kept.
- `independentPrintedCollationPerformed: false` — printed-source collation stays openly
  outstanding, as the standing constraints require.
- **`reviewScope: "Builder extraction and source-notice inspection only. No actual Claude
  review was invoked or claimed."`** They did not manufacture a review record in my name.

## F2.7 and F2.8

Zero `.sqlite` files and zero archives are tracked in Git. Both `vendor/opengranth` files are
byte-unchanged from `main`. `existingReaderSourcesModified: false` is independently confirmed:
**zero** files under `collections/source-data/` outside the two new collections differ from
`main`, and the only pre-existing collection file touched anywhere is `collections.css`.

**Caveat on F2.8, stated rather than glossed:** the files carrying `runtimeEligible` do not
exist on `main`, so "unchanged" is not a checkable proposition against that baseline. What I
can verify is the **value**: `runtimeEligible: false` at the target in every instance found.
That is the safe state, but it is a value check, not a no-change proof.

## Correction to one of my own earlier findings

**ANG-01 — "Ang asserted without its basis" — is narrowed, not withdrawn.** For these two
collections the candidate does disclose the basis: `locatorStatus: SOURCE_REPORTED` in the
data, "source-reported Angs" and "not independent printed-Ang authentication" on the entry
pages, and the explicit statement that Dasam page numbers are not SGGS Angs. ANG-01 stands
only where that disclosure is absent; it does not stand against `sggs` or `dasam` here. I am
recording this rather than letting a stale finding sit, the same way EXP-01 was corrected.

## The one thing in §2 that review cannot close — for the founder

The content notice is **not a bare public-domain dedication**. It asserts the texts are free
of known copyright restrictions, and then attaches conditions: the honour and reputation of
the original works are to be maintained, and derogatory treatment is forbidden — the notice's
own operative list is *"adding to, deleting from, altering of, or adapting"* the words in a
way that distorts or mutilates.

The project complies with the **mechanical** half of that, and I verified each part: no text
normalisation, no locator repair, exact primary records only, provider punctuation and
headings preserved, and complete source groups never split at a page or chunk boundary.

**The other half is not an engineering test.** Whether a presentation maintains the honour and
reputation of the original works, and whether any editorial choice amounts to adapting or
distorting, is a judgment of Sikh practice and scholarship. I cannot settle it, the builder
cannot settle it, and two AI systems agreeing on it settles nothing. The clearest instance is
that this collection includes **Charitropakhyan** — the most contested portion of the Dasam
Granth. Including it in a learning library is a decision with real weight, and it is the
founder's with qualified scholarly counsel, not a review item.

So: **the permission basis for the original text is sound and verified. The notice's
judgment-bearing conditions remain open, and qualified Sikh scholarly review stays explicitly
outstanding.** A clean §2 does not touch that.
