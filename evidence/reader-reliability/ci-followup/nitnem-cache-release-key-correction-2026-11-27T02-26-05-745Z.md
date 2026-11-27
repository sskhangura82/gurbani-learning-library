# Correction: declared release keys belong in the expected cache URLs

The browser run at evidence/reader-reliability/ci-followup/nitnem-browser-20261127T022148Z failed because my test omitted the worker's documented `glp_release=VERSION` query. The worker at the frozen candidate was correct. The earlier bounded manifest test did not check this cache-key contract; its PASS did not establish real cache equality. Both logs and the failing report are retained, with hashes in the accompanying JSON.

Expected URLs now start from the declared asset paths and workerVersion, including exactly one release key. No actual URL is stripped, normalized to a path, or used to choose expected query values. Full URL and response-digest equality remain required. The same comparison refuses synthetic wrong, missing, duplicate and extra query keys, and a wrong cached digest. Required-source omissions also remain refused.

The first bounded query-inspection attempt compared nested arrays from different VM realms and stopped on their prototype mismatch despite equal contents. That harness now checks query count, name and value as scalar values; the actual full URL/hash assertion was not weakened.

Bounded validation and syntax pass. The root will rerun the real browser gate; no new browser success is claimed here. Application and worker bytes are unchanged.
