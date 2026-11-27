# Final hosted verification — separate evidence branch

Candidate: `44401e35690322fb3dbc29c443bff86d73279fcb`, draft PR60.

All nine hosted checks across four workflows completed successfully on this exact candidate. `checks.json` records the individual jobs; `runs.json` records their exact head and workflow URLs. This evidence commit does not modify the review candidate.

The new browser delivery and worker-update checks ran in Linux Chromium 151.0.7922.34, Node v22.23.5. This is distinct from the local macOS Chrome 158.0.8127.37 evidence. Only reports newly generated during the final run were selected from the uploaded artifact; `artifact-selection.json` identifies their paths, timestamps and digests. Older committed reports also present inside that upload are not counted as fresh results.

The selected reports verify module transport controls, actual failed-update preservation, Article behavior and practice offline behavior. The full Knowledge and reader suites have their own successful workflow/job records. No physical iPhone, Safari, VoiceOver, print-copy acceptance or qualified content review follows from those desktop/hosted checks.

`delivery-equivalence.json` records byte comparison of all 152 fingerprinted files across the original application implementation, the tool/test correction and the final documentation correction. The fingerprint is `../inputs/delivery-manifest.json`. Application bytes remained identical across those commits. The first failed hosted run and local harness corrections remain in the candidate's earlier evidence directories.

`release-state.json` records that source main and QA main remained at their prior references. Both branches' protection settings remain a founder decision. No merge, QA staging or production deployment occurred. Independent review and the founder's decision remain required.
