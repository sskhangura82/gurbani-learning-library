# Sikh History claim registry — frozen builder criteria

> Policy update: mandatory human authorship/review statements in this earlier record are superseded by the owner decision in [TWO_REVIEWER_POLICY_20261127.md](history/TWO_REVIEWER_POLICY_20261127.md). The earlier work remains evidence of its original scope.

2026-11-27. Builder criteria, not independent review or release authorization.
Base: reviewed reader/Daily candidate 7f36c3039ca95fac6e69ca28f631b9e3734c70e9.

## Scope established before implementation

Create a content-free research registry and pure chapter preparation gate. Reuse
the existing strict JSON parser; keep original scripture, teaching, readers,
navigation, storage and delivery unchanged. The current architecture has source
identities and editorial relationships, but no historical claim registry.

1. The checked-in registry contains zero historical claims, narratives, sources
   or reviewer attestations. All nonempty examples are explicitly synthetic
   test fixtures. No invented history or AI-written exposition enters the app.
2. Historical entities retain separate person/place/event identities. Narrative
   paragraphs refer to claim IDs, and each claim retains its own evidence
   classification, precise citations, limitations, uncertainty and conflicts.
3. Source metadata includes edition, original language, date qualification,
   provenance and transmission lineage. A locator must name an exact reference,
   not merely a domain, work title, Ang or first line. Code cannot judge that a
   cited work actually supports a historical statement.
4. Claim classes distinguish primary evidence, early account, corroborated
   history, traditional Sakhi, disputed account and unverified attribution.
   Classification never grants human review or historical truth. Corroborated
   history needs at least two declared independent supporting lineages.
5. No protected modern source excerpt, translation, recording or image can be
   embedded in this metadata schema. Human-authored narrative requires named
   authorship and a recorded project-use permission reference.
6. A chapter is withheld unless every narrative block resolves to claims and
   every referenced claim and entity resolves to sufficient metadata. Disputes
   and limitations remain in the prepared object; they cannot be dropped.
7. Named external review receipts bind the entire chapter, its claim statements,
   source metadata, entity labels and relationship evidence to a digest. A trusted
   reviewer roster is supplied separately, never accepted from the content pack.
   A boolean, anonymous name or matching AI verdict cannot create a reviewer.
   The validator checks the attestation structure, not the person's credentials.
8. Machine structural readiness, named human review evidence and founder release
   authorization are separate statuses. This tool never authorizes publication,
   writes a live reader, sends messages or changes the main branch.
9. Mutation tests cover unsourced narrative, stale review binding, contradictory
   claims, missing cited locators, same-lineage corroboration, unknown/duplicate
   fields, absent review and untrusted reviewer identities. Existing source and
   application files remain byte-identical to the base.

## First real use

The Kartarpur chapter will begin as an empty authoring work order, with source
research and named human review pending. A machine-ready synthetic chapter is
not evidence that any real Sikh history chapter is complete or approved.

The founder paused audio on this date and plans a personalized recording later;
this increment does not change any audio register or playback behavior.
