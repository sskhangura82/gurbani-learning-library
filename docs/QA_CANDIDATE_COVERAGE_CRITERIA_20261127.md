# Candidate workflow coverage — builder criteria frozen before implementation

Base: `7f36c3039ca95fac6e69ca28f631b9e3734c70e9` (reviewed Daily/reader composite).
Finding: Claude CI-02, recorded on review branch `539aff478cbe5f90892de274b7f1518ce0a6ddfd`.

## Problem and bounded scope

Six quality workflows select pull-request base branches. Stacked candidates based on any other branch consequently omit those checks, including a known failing print check. This patch removes that omission. It does not repair or waive the print result, change application files, or alter release authority.

## Acceptance criteria

1. Every current quality workflow (`*-qa.yml`) accepts pull requests to any base branch. No restrictive base-branch list or ignored-base list remains in its pull-request trigger.
2. Existing path filters, manual dispatch, read-only permissions, jobs, commands, versions, timeouts, failure handling and artifact retention remain unchanged, apart from one new coverage check in the already-unconditional script-integrity workflow.
3. The preparation workflow remains artifact-only and unchanged. No scheduler, secret, deployment, main-branch protection or publishing permission is created or enabled.
4. A focused regression check rejects branch filtering in the supported workflow block shape, whether expressed as a list, an ignored list or a quoted key. It rejects unsupported trigger shapes rather than quietly treating them as covered. Existing path-only triggers remain accepted.
5. Negative controls demonstrate that the six original workflows fail the coverage check. The changed versions pass. This is workflow-shape validation, not a claim to have reimplemented GitHub Actions' YAML/event engine.
6. Scripture, teaching, application scripts, generated bundles, private data and existing test expectations are untouched. The print extractor pin and strict text matcher are untouched; ART-P01 remains open.
7. Hosted checks are reported by result, including existing failures newly exposed by broader triggering. An absent, queued or pending check is not reported as passing.
8. Work stays on a draft branch. No merge, deployment or review verdict is made by the builder. Claude's independent criteria and findings remain his own work.
