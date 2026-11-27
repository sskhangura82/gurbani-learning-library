# Daily isolated publisher — builder results

Read after independent findings. Criteria were committed before implementation at eea6d7e. This is builder evidence, not independent approval.

The focused publisher tests and its preparation, signing and proposal dependencies passed together: 47 checks, no failures. Fourteen of those exercise the new publisher. They use temporary synthetic repositories and ephemeral signing material; the remote mutation and Pages service are simulated. The real transport argument test intercepts Git push without a network call. Three wrong-context CLI invocations refuse before any Git call or preparation output.

The final checks cover complete capture/sign/propose/install/build/serve flow, exact source verification, unchanged local HEAD/index/worktree, repeated admitted observations, remote races, exact-base lease refusal, lost push acknowledgement, unknown outcomes, source unavailability, build refusal and stale/mismatching served bytes. A separate HTTP fake verifies the fixed Pages endpoint and bounded allowed source paths.

A bounded builder peer check identified that local Git configuration could cause tag-following or recursive submodule pushes. The implementation now explicitly disables both on the single target push. The regression enables both configurations and confirms the actual generated arguments override them while leaving policy hooks enabled. This was a pre-review hardening finding, not a reported live incident.

No real signing key was accessed. No secret or activation variable was created, no publisher workflow was dispatched and no new-code push to the test site occurred. The independently reviewed reader-only Preview 5 staging is a separate activity and must not be presented as this publisher succeeding in production.

Node on the builder Mac: 26.0.0. Hosted Node 22 results are to be recorded separately once the draft PR runs. No physical device, Safari, VoiceOver or human content review is claimed. No whole-project completion or release approval is inferred from this result.
