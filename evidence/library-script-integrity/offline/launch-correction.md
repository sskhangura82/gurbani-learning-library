# Initial launch correction

The first combined regeneration/check command used relative Node paths without changing the shell's working directory. Desktop Commander started in its installation directory; Node returned MODULE_NOT_FOUND for tools/build-offline.mjs and the three test paths. No worker regeneration or test executed in that attempt. The source edits used absolute paths and were applied correctly.

Correction: run the same commands after an explicit cd to the candidate worktree. This is a harness-launch error, not an application or service-worker result. Subsequent timestamped reports retain their actual browser and input identities.
