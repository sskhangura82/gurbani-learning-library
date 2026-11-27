# Daily installation proposal — candidate handoff

## What this adds

The reader, official original-only acquisition and development sealer already exist. This increment connects a sealed candidate to a reproducible, exact-base change proposal. It can prepare the two runtime files needed for a new day without installing them or changing an existing reading.

The founder has paused audio. A personalized recording will be supplied later; recording research, permission requests and playback development are outside this increment.

## Review ordering

Please freeze independent acceptance criteria before opening the implementation or builder evidence. Builder criteria were committed separately before implementation. Builder peer inspection is not the independent review seat, qualified religious review or release approval.

## Interface and resulting artifact

`tools/propose-daily-install.mjs` requires a sealed candidate directory, a repository, a full base commit, its current full named reference, a new output directory and the explicit development-candidate flag. Omitting the date means today's Amritsar date; a supplied historical date remains historical.

The output is a bounded `proposal.json`, an exact Git patch when an update is proposed, and the original-only receipt outside that patch. A proposed Git tree is content-addressed evidence in the local object database, not a new branch. The patch is replayed into a second isolated index, and its resulting tree must equal the proposed tree. Thus the saved artifact remains reconstructable from its exact base even if an unreachable local tree is later garbage-collected.

A matching repeat produces `ALREADY_ADMITTED`, no patch and the exact original base tree. A failed or interrupted run cannot claim readiness. The output directory is exclusively claimed; a crash may leave a visibly incomplete RUNNING report. A bounded final refusal never copies arbitrary child-process errors or input strings into its message.

## Boundaries

- The input manifest permits exactly one dated envelope, its complete source and its original-only receipt. Raw bytes, signature, strict JSON and the existing source/receipt contracts are checked. The implementation retains checked bytes in memory and does not copy an unchecked input directory.
- The existing preparation comparison decides whether a day is already admitted. A later retrieval time does not force a new signature or same-revision replacement. Source/publication-time corrections remain held for review.
- A new date begins at revision 1. Missing or corrupt admitted sources, a different blob at the same source-digest path, incompatible publication-key code, unexpected file modes and a stale base refuse.
- The only runtime additions allowed in the proposed tree are the dated event and its exact source. A byte-identical source already in the base is reused. All unrelated tree entries remain unchanged.
- Git reads use the committed object tree, never unstaged files or browser storage. Separate temporary indexes keep the user's actual index intact. Replace references and lazy fetches are disabled; all Git transport protocols are refused. No signing key, secret, commit, reference update, network request, push, merge, deployment or schedule activation occurs.
- Both the date and named base reference are checked again before the final ready record. This is a current snapshot check, not a promise about the later deployment moment. The eventual publisher must revalidate the artifact and perform its own expected-base check immediately before an authorized installation.
- The signature is the library's development transport seal. It is not an SGPC signature, evidence of theological authority or permission to release. Agreement among receipt fields does not independently prove what a remote publisher said.

## Deliberate limits

No phone receives a new reading from this tool by itself. The test-site deployment connection and its activation still require the agreed independent-review and founder-decision sequence. This candidate creates no new explanation, changes no scripture, reads no learner notes and leaves the existing site untouched. The known print-copying and physical-device gaps are unchanged.

## Builder verification entry points — read after recording independent findings

- `node --test tests/hukamnama-install-proposal.mjs`
- Existing preparation, signer, staging and delivery contract tests.
- Existing Daily CI now includes the new contract checks and still runs its browser learning checks.

The fixture suite uses temporary repositories, ephemeral in-memory keys and synthetic staged/unstaged/untracked content. It exercises signer-to-proposal-to-reader behavior, same-source reuse, repeated observation, tampering, incomplete source, correction refusal, reference movement, midnight rollover, private-index preservation and patch replay under altered local Git display settings. Injection of a test verification key is a programmatic test seam; the command-line interface uses the pinned development publication key only.
