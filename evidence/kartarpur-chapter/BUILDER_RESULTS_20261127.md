# Builder results — read after independent findings

27 November 2026. Builder verification only; no historical or qualified human approval.

- Node v26 on the connected Mac: `node --test tests/history-registry.mjs tests/history-draft.mjs` completed with 38 passing checks and no failing checks. Hosted Node 22 remains a separate run.
- `node tools/history/check.mjs` reports five entities, five sources, ten claims, three relations, zero admitted chapters and no publication authorization.
- `node tools/history/draft-check.mjs` confirms the checked-in readable draft matches its structured source and exact evidence binding. It reports WITHHELD, NOT_PERFORMED human review, and five unverified underlying secondary-source claims.
- `git diff --check` is clean.
- Existing `tools/history/registry.mjs` is byte-unchanged from the parent candidate.

One initial failure was an old placeholder assertion that the real registry had zero claims. The assertion now compares actual research counts while retaining zero admitted chapters and no publication authorization. No admission test was relaxed to allow this AI manuscript.

The tests detect missing support, unresolved identities, stale prose/evidence bindings, copied source-body fields, false human authorship, false approval and attempts to put this AI wrapper in the human chapter slot. They do not determine historical accuracy or rights. No physical device, print rendering, Punjabi specialist or historian acceptance is claimed.
