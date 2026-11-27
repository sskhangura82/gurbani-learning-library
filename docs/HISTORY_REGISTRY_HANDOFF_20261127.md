# Sikh History evidence registry — builder handoff

2026-11-27. Research tooling only. No historical chapter or application route is
being published by this change. The builder criteria were committed first in
`docs/HISTORY_REGISTRY_CRITERIA_20261127.md`.

## What this makes possible

A human writer can prepare a historical chapter as a set of paragraphs linked
to individual claims. Each claim keeps its sources, exact citations,
classification, uncertainty, limitations and competing accounts. Changing any
of those linked records invalidates the recorded review of that chapter.

The real intake file, `content-intake/history/registry.json`, is intentionally
empty. There are zero real historical sources, assertions, chapters or reviews
in this increment. Invented examples live exclusively in explicitly labelled
test fixtures and are never imported by the application.

The existing Knowledge registry owns scripture and educational connections.
This tool does not copy scripture into a second history source, change its IDs,
or infer a historical event from a verse. Exact crosswalks into the existing
source registry remain a later integration step.

## Files and commands

- `tools/history/registry.mjs`: strict record validation, content-bound review
  packet, digest and a fail-closed chapter preparation gate.
- `tools/history/check.mjs`: reads only the fixed empty project intake and
  reports its actual content counts.
- `tests/history-registry.mjs`: refusal and mutation checks.
- `tests/fixtures/history/synthetic.mjs`: invented test data, not Sikh history.

Run `node --test tests/history-registry.mjs` and
`node tools/history/check.mjs`. There is no publisher, browser storage, network
client, live AI or arbitrary file input in these tools.

## Record design

| Record | What it carries | What it does not establish |
|---|---|---|
| Entity | A person, place or event identity and label | That the entity's associated accounts are true |
| Source | Creator, edition, source-date certainty, original language, optional translation metadata, archive/catalogue reference, optional digital witness and declared transmission lineage | Authenticity merely from a title, date, institution or URL |
| Claim | One assertion with its own classification, supporting/disputing/context citations, limitations, uncertainty and conflicting claim IDs | Historical truth from a majority vote or a source-category label |
| Relation | Typed person/place/event connection supported by claim IDs covering both endpoints | An unsupported travel route or encounter |
| Chapter | Named writer, project-use permission reference and narrative paragraphs tied to claim IDs | Whether the writer's statements are faithful to the cited material |
| External review | A named trusted reviewer, qualification reference, scope/role, exact packet digest, dated verdict and review evidence reference | Authentication of the person's identity or credentials by software |

Source records are **metadata only**. The schema rejects copied source text,
modern translations, manuscript images, recordings and arbitrary additional
fields. No reuse permission is inferred from public availability or from a
source's age. A human-authored chapter has a permission reference; the reviewer
and founder must inspect the actual permission before any later publication.

Classification is per claim: primary evidence, early account, corroborated
history, traditional Sakhi, disputed account, or unverified attribution.
Traditional accounts retain their category after review. Disputed accounts
must carry a competing claim or disputing citation. Unverified attributions
remain withheld by this first version.

Two different source IDs are not enough for corroboration. The schema requires
two different declared supporting transmission lineages, and the human review
must assess whether those declarations are sound. An early source is not
automatically accurate; source age is never used as an approval shortcut.

## Exact review binding

The review packet includes the chapter's narrative, writer and permission
reference, every paragraph claim, its source metadata and citation locator,
referenced entities and relations, and the complete transitive set of competing
claims. A competing account omitted from the prose still appears in the review
packet. Its alteration invalidates the chapter review.

The digest is calculated over a deterministic representation. JSON object key
order does not matter; narrative wording, source and locator changes do.
Unrelated registry additions do not invalidate an unchanged chapter.

A caller supplies the trusted reviewer roster and review receipts separately
from the content pack. A content author cannot put `approved: true` or their own
trusted roster inside the registry. A named receipt must match an exact chapter
digest and an externally supplied role. Every chapter needs historical review;
a chapter referring to a scripture source also needs a Gurbani review role.
A revision-needed or incomplete matching review cannot be outvoted by another
passing review. Stale receipts cause withholding instead of selecting whichever
one happens to pass.

These are structural checks of an **external attestation**, not a signature
system, credential verification, or proof that a human actually performed the
review. The future editorial workflow must establish the reviewer, inspect
qualification and review evidence, and supply the trusted roster independently.
No qualified reviewer is currently attached to this project.

## Three distinct statuses

1. `structuralReady` says the referenced records satisfy this data contract.
2. `humanReview` records whether sufficient content-bound external attestations
   from the supplied trusted roster are present.
3. `releaseAuthorization` always reads `NOT_GRANTED_BY_THIS_TOOL`.

Without the structural requirements or matching external review, the prepared
chapter is `null` and explicit refusal reasons are returned. A successful
synthetic test can produce `REVIEWED_DRAFT_READY`; that remains a draft object.
It is neither an approval to merge nor authorization to put a chapter in the
live family application. The result is plain structured data, never trusted
HTML. Any future renderer must escape text and retain the classifications,
uncertainties, source locators, review attribution and competing accounts.

## Kartarpur — first empty authoring work order

This is a research assignment, not a completed historical account.

- Identify the chapter's exact person, place and event records.
- Establish the historical period and distinguish exact, approximate and
  disputed dates. A source's publication date is not an event date.
- Locate original/early accounts and record a specific edition, archive or
  manuscript witness and an exact folio, page, section or document reference.
- For each intended narrative sentence, write its claim separately, cite its
  evidence and record what remains uncertain.
- Compare different transmission traditions explicitly. Do not count two
  websites reproducing one account as independent witnesses.
- Add Gurbani connections only through complete, verified source identities in
  the existing registry. Do not infer that a Shabad was composed at this place
  or in response to this event without evidence.
- Obtain original human writing and project-use permission, then a named
  historical review and Gurbani review where applicable.
- Keep present-day reflection and comparative study outside historical
  assertion records. No invented dialogue, private thoughts or eyewitness
  scenes; no synthetic images or Guru voices.

Every one of these content tasks remains open. This increment supplies the
recording and withholding machinery, not the missing historical knowledge.

## Boundaries and founder decisions

The application catalog still says History is planned. Existing readers,
Gurbani, lessons, bookmarks, private reflections, service worker and script pins
are unchanged. This work does not claim phone, Safari, VoiceOver, historian or
Punjabi-reader acceptance.

The founder paused audio and intends to provide a personalized recording later.
No audio research, permission outreach, recording import or playback work is
included. No action is needed from the founder to review this branch as code;
actual historical writing, qualified human review and release decisions remain
separate.
