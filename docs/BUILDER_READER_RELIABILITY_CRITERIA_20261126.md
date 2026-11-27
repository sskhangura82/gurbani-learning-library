# Reader reliability — builder criteria

Prepared 26 November 2026 (America/Los_Angeles). These are builder verification criteria, not Claude's independent acceptance, qualified review, or authorization to release.

## Frozen inputs and scope

- Base: PR56 `389e79baff4016a2ff61d1851908de0bd66beb8f`.
- Existing linked-visit repair to compare/reuse: PR47 `d8202caa1b7761c493f70eb9c13514f9b87f2801`.
- Current review evidence: PR38 `18fc9a62142b47842f35e3e5ebdf23b36bf7bf2c`; SRI-01 in RT-011/RT-012, SK-01 in its corrected finding record, PR47 in RT-003.
- PR58 stays frozen at `b68e080043bb0b4e5cb3d17977e65c8cd62c15b3` during Claude's ongoing review. This work does not modify it.
- Production and isolated QA remain unchanged. Only synthetic data and fresh browser contexts are used.

The SRI scope is every external classic script in the five canonical reader pages: Japji, Sukhmani, Nitnem, Salok Mahalla 9 and Kabir. The root library module graph is outside this repair and must remain explicitly recorded as such.

The Sukhmani criteria apply to any proposed resume repair. An unproven diagnosis stays incomplete; repeated passing runs alone are not a mechanism or evidence of a fix. PR47's linked-visit behavior is a separate existing repair and must not be represented as solving SK-01 by itself.

## Script integrity

1. All in-scope script tags have correct byte digests, in the declared order. Preserve existing source/verifier and Salok pins. Reject unexpected/inline/module script sets rather than automatically trusting new entries.
2. Valid controls load the existing verified readers and synthetic-learning controls.
3. In an actual browser, a harmless marker prepended to the Nitnem, Sukhmani and Japji reader responses must not execute while the trusted HTML remains unchanged. Establish the unpinned baseline and retain the already-pinned Salok control.
4. A blocked executable must not be counted as a successful reader merely because no marker appears. Verify requested responses, browser refusal, source/DOM state and positive controls separately.
5. Synthetic notes, bookmarks, reading identity and storage keys survive refusal. A damaged update leaves the previous valid offline version usable.
6. State the trust boundary: integrity attributes compare subresource bytes against trusted HTML. They do not protect an attacker replacing both HTML and its declared digest, or establish qualified authenticity of content.
7. Existing in-memory source-corruption checks must remain meaningful after readers are pinned. A test-only initialization hook may mutate the source object, but must not weaken production pins or substitute a passing verifier.

## Sukhmani reading place

8. On the frozen base, record a bounded reproducer or event/geometry trace identifying the write that changes the saved occurrence. Preserve inconclusive runs.
9. The reported line and a later existing passage retain the exact logical occurrence through reload, reopen and Continue Reading after layout settles.
10. Restoration/layout scrolls do not overwrite the reader's chosen occurrence. Deliberate reading still updates the saved place; disabling persistence is not a repair.
11. Exercise relevant browser return and layout boundaries at representative narrow widths and enlarged text. Use targeted scheduling or geometry controls only when the mechanism warrants them.
12. If PR47 is integrated, preserve its explicit visit-versus-adopt behavior, intentional note edits, another tab advancing the saved place, return/adopt controls, and the newer native Saved entry. A first-time reader must not be told there is an existing saved place.
13. Scripture and teaching bytes remain unchanged. No new learning namespace, private profile, or real reflection is accessed. Use the existing backup and locking contracts.

## Evidence and disposition

Retain failing controls and instrument corrections alongside successful candidate runs. Desktop Chrome/WebKit simulation does not establish physical iPhone, Safari, Home Screen or VoiceOver acceptance. The independent review seat freezes its own criteria separately and records its findings before opening builder results. No source merge or deployment follows from these builder checks.
