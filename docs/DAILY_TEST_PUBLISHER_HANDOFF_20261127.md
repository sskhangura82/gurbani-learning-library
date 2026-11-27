# Daily Hukamnama — isolated installation and delivery connection

Status: builder candidate, not independently reviewed, not activated, not deployed. Audio remains out of scope. The source application main and the family website are unchanged.

## What this completes

The existing official capture, source comparison, signing and installation proposal now have a bounded delivery connection. It constructs a commit from the verified two-file installation proposal, updates only the isolated test repository's main branch under an exact-base lease, requests its Pages build and checks the bytes actually served by the website. A queued build or successful Git push is not reported as delivery.

The sole permitted destination is `glp001-iphone-qa/glp001-iphone-test`, branch `refs/heads/main`, public source path `https://glp001-iphone-qa.github.io/glp001-iphone-test/`. The command has no destination, endpoint or verification-key override. The family repository is refused before acquisition. Existing founder direction authorizes the isolated delivery work; independent review of this candidate is still required before activation. No additional founder permission has been requested or assumed necessary for ordinary development.

## Behaviour

- The preparation step obtains the exact requested official original and compares the complete source. A missing source or discrepancy stops the run without substituting another reading.
- An identical admitted reading keeps its exact existing event and source bytes. It is not re-signed or revised. A changed official observation requires correction review.
- A new reading is sealed with the pinned development key and passed through the existing installation proposal validator. Only its dated event and content-addressed source may enter the proposed tree; capture receipts stay outside the published tree.
- The generated commit has that tree and exactly one parent: the explicitly supplied current base. Local HEAD, index and worktree remain unchanged.
- Both effective Git remote URLs must identify the isolated repository. The remote head must still equal the expected base. The push has an explicit expected-value lease, suppresses tag following and submodule recursion, and does not bypass policy hooks.
- A durable push-intent record precedes the remote mutation. A lost acknowledgement is reconciled with an exact remote-head read; an unknown result remains unknown and is never represented as a rollback.
- The Pages build is requested even for an already-admitted repeat. This recovers the case where a previous process pushed successfully but stopped before requesting the build.
- The served event and source must be byte-identical to their immutable selected Git objects and must pass the reader decoders again. Wrong, missing or stale served bytes cannot yield a delivery success.
- A day change before installation refuses a today run. A day change during post-install verification is reported as a delivered dated reading, not today's reading.

## Installation contents for the existing isolated preview

After independent review, extend the existing preview copy; do not create a second application or overwrite its QA labels. The runtime reader files must retain their reviewed bytes.

The connection needs exactly these new runner files from the reviewed candidate:

1. `tools/ingest-hukamnama.py`
2. `tools/hukamnama-stage-contract.mjs`
3. `tools/prepare-daily-hukamnama.mjs`
4. `tools/sign-hukamnama.mjs`
5. `tools/propose-daily-install.mjs`
6. `tools/publish-daily-test.mjs`
7. `.github/workflows/hukamnama-test-publish.yml`

Their local imports resolve through the preview's existing `hukamnama/core.mjs`, `hukamnama/json.mjs`, `hukamnama/delivery.mjs` and `hukamnama/publication-key.mjs`. Check those exact bytes against the reviewed source during installation. No translation corpus, fixture, private capture body, private learning file or signing key belongs in the published checkout. The Python importer uses the standard library and reads the official source and pinned comparison/rights notices itself.

The workflow is inert in the source repository. On the isolated repository it additionally requires the main branch and `GLP_DAILY_TEST_PUBLISH_ENABLED=true`. That variable has not been set. `GLP_DAILY_TEST_SIGNING_KEY_PEM` has not been created by this change. Its pinned matching key must remain a repository secret, never a source file or artifact. The runner creates a temporary owner-only key file and removes it before uploading only the bounded status report. Do not rotate the reader's public key as part of this installation.

The schedule makes bounded attempts at 01:23, 02:23, 03:23, 05:23 and 08:23 UTC. Date selection always uses Amritsar time. Manual dispatch can specify an explicit historical date. No notification, account, private-note upload or explanation generation is added.

## Evidence and limitations

Frozen acceptance criteria are in `docs/DAILY_TEST_PUBLISHER_CRITERIA_20261127.md`. Builder test results are separate and should be read after independent findings. Synthetic tests use real temporary Git repositories, real ephemeral signatures and the real proposal/reader validators, with the remote and Pages service simulated. They do not establish successful operation on GitHub or an iPhone. No real signing secret was accessed, no remote publisher was activated, and no live daily delivery was performed with this new code.

The first live isolated run after review must verify the Pages result and exact served event/source bytes. It must retain a failed or unavailable result honestly. Existing dated content remains available through its explicit date link.

## Technical references

GitHub documents that commits pushed using `GITHUB_TOKEN` do not trigger a Pages build automatically, hence the explicit authenticated build request:

- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/rest/pages/pages#request-a-github-pages-build

Git documents explicit expected-value leases, configured tag following and submodule recursion:

- https://git-scm.com/docs/git-push

These are transport details, not evidence of religious authenticity or permission to publish an unreviewed reading.
