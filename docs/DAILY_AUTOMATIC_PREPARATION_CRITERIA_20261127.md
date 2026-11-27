# Daily automatic preparation — builder criteria

Frozen before implementation, 27 November 2026. Builder acceptance criteria, not the independent review seat's findings or release approval.

Base: reviewed Daily/reader composite `7f36c3039ca95fac6e69ca28f631b9e3734c70e9`. The current reader already consumes exact-date development records; the existing importer prepares original-only candidates. Extend these, without a second importer or a live publisher.

## Intended behavior

1. Select today's date in Asia/Kolkata once at run start. An explicit historical request stays historical. Reject invalid/future dates; never use an earlier day to fill today's slot.
2. Use the existing official-source importer and exact full-text comparison unchanged. No normalization, new source, generated explanation, commentary, audio or fallback.
3. Write a bounded, structured run record for success, official unavailability, source discrepancy, midnight rollover, and local failure. Do not expose arbitrary exception text, raw portal responses, keys or private learning.
4. Validate the resulting manifest, every raw artifact digest, existing stage contract and exact requested date before marking a candidate ready for review.
5. Inspect the existing dated development record through the same signature and source decoder as the reader. A repeated observation of the same selection retains the admitted envelope and source bytes unchanged. A correction, source change or corrupt existing pair requires review; no automatic overwriting or revision bump.
6. An attempt crossing an Amritsar day boundary may retain dated research evidence, but cannot announce it as today's ready reading.
7. New output directories only; atomic final report replacement within that new run directory; an interruption remains visibly unfinished. Existing source files, readers, notes and other runs are not modified.
8. Extend the existing preparation workflow. Scheduled probes are bounded and disabled unless an explicit repository variable enables preparation after review. Permissions remain contents:read. No secrets, signing, commits, deployment, notifications or automatic activation. Preserve failed-run reports with an always-run artifact upload.
9. Useful new tests exercise date rollover, unavailable/stale/mismatched sources, repeated capture, proposed correction, damaged existing records, input/output confinement and interruption. Use synthetic transport and temporary files only; no learner data.
10. Independently reviewed and qualified-approved status, rights clearance and actual publication remain separate. A successfully prepared artifact is not automatic delivery to a phone.

## Known constraints preserved

The importer issues revision 1 with fresh receipt timestamps on every capture. Replacing a same-day envelope would conflict with the reader's existing revision guard. This candidate must detect that rather than refresh the admitted event in place.

HTTP failures currently share SOURCE_UNAVAILABLE; report that limitation without claiming every failure is transient. Each scheduled invocation makes one bounded capture; no retry loop or sleep is introduced.

The known printed Gurmukhi extraction finding remains open. No changes to its test or extractor belong to this work.

## Founder/review gates

No merge, live-family release, scheduler activation, publisher credential, permission contact or test-site deployment is included in this candidate. Claude freezes and records independent findings under the established protocol. The founder retains the release decision.
