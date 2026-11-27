# PR67 hosted record — read after independent findings

Initial candidate: `e8c26f1d567699f4697432a7ebe83861f03a4923`.
Final candidate with shared test-clock dependency: `f4ac2cdfc3117f9def9ce90e478ff179af318d67`.
Base is the reviewed PR62 composite. Neither main nor the phone preview was updated.

The initial hosted run was **not all passing**. All six newly unfiltered workflows actually ran against a base their old lists omitted. Six workflows succeeded and two failed:

- Article print run `46012158489`: existing strict Gurmukhi extraction/completeness refusals on both page sizes and the pagination case. No extractor or comparison was changed. ART-P01 remains open.
- Daily run `46012158193`: two-tab scenario save timed out at the old harness's line290. This is the same scenario and assertion path as the already-diagnosed per-context clock reset in PR64. This run's report alone does not measure clock values, so the original failure is retained without claiming a new independent causal experiment.

The two existing test-only clock corrections from PR64/65/66 were then applied, preserving application clocks, note assertions and timeouts. Their canonical commits are `34a413bf8e76ff374de654094c8aaf9510fff23d` and `062ae5aff9ca18b1706d6273efb43a9e806d666c`; PR67's cherry-picks are `8b5a5a9` and `8df64c5`. The scope amendment is explicit in the handoff. Hosted final results are recorded separately when complete.

The Knowledge workflow remains path-filtered and did not run because this candidate changes none of its triggering paths. It is not counted as a pass. The preparation workflow remains untouched and was not dispatched.

Raw failure logs and the synthetic-browser report are retained unchanged under `initial/`, with byte hashes. No actual learner data or physical device testing is involved. These are builder records, not Claude's independent findings or release approval.

## Final hosted result

The final candidate has seven successful hosted workflows and one failed workflow. Daily now succeeds with the shared clock correction. The sole failed workflow is article print (`46012632372`), with the same strict extraction/completeness refusal as the initial run. Its raw final failure log is retained. Nothing was rerun until green or marked as a waiver.

All six repaired workflow triggers executed against the stacked candidate base. The last Learning workflow finished successfully, including its shared-reader job. `final/runs.json` preserves the full observed result set; `final/scope-and-results.json` verifies the shared Daily harness is byte-identical to PR64 and records the exact changed paths. No application path changed.
