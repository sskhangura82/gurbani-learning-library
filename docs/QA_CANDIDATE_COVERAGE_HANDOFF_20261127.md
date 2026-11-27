# Candidate workflow coverage — handoff

Claude's CI-02 found that quality workflows restricted to named pull-request bases did not execute on later stacked candidates. The known article print failure therefore disappeared from four candidates' check lists without being repaired.

This branch removes the base-branch restriction from the six affected quality workflows. Their jobs, commands, existing test expectations, extractor version, read-only permissions and artifact retention are unchanged. The Knowledge workflow's existing path filter remains in place. The artifact-only Hukamnama preparation workflow is untouched.

A small coverage guard runs in the already-unconditional script-integrity workflow. It checks the repository's explicit block-style trigger subset and refuses unsupported shapes. It is not a general YAML parser or a claim that every path will run every workflow. The exact pre-change six triggers are negative controls; each is rejected, and each repaired trigger differs only by the removed branch-filter line.

## Independent review

Freeze your own criteria before opening builder test evidence. Builder criteria were committed first. Review code is not touched; the builder makes no independent approval or release decision.

Builder evidence is under `evidence/qa-candidate-coverage/`. `node --test tests/qa-workflow-coverage.mjs` exercises the supported shape and refusal cases. The recorded delta check verifies all old workflow steps and the preparation workflow were preserved.

## The known print failure stays visible

ART-P01 remains open. PyMuPDF 1.26.6 and the existing strict text comparison are unchanged. The new triggering may expose that red check on this draft even though no PDF or source text changed. That is the intended honest signal. A passing or failing check here is not permission to merge, deploy, or release.

No application, scripture, teaching, private learning, publication key or generated bundle changed. No scheduler, deployment, branch protection or repository variable was enabled. Main and the isolated phone site remain unchanged.

## Additive integration correction: shared browser-clock test repair

The first hosted run of this CI-only candidate exposed two failures. The print failure is the unchanged ART-P01 result. The Daily browser check stopped in the two-tab scenario while using PR62's old test harness. Its raw failure log and report are retained in the separate evidence record.

To keep this candidate on the same already-corrected harness as PR64, PR65 and PR66, the two canonical test-only commits were applied: `34a413bf8e76ff374de654094c8aaf9510fff23d` and `062ae5aff9ca18b1706d6273efb43a9e806d666c`. They install the synthetic clock once per browser context and ensure a fresh historical-note test clock starts after the imported timestamps. They do not alter application clock checks, backup identities, test expectations or timeouts.

This expands the original file scope by the already-shared `tests/hukamnama-browser.mjs` dependency. It is disclosed rather than silently changing the frozen criteria. The first candidate was not all passing, and the final candidate still does not waive the print gate.
