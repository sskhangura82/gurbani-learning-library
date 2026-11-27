# Contract corrections after the initial hosted failure

The initial hosted Library job stopped at an obsolete R6 expectation that the home loaded library/app.mjs. The candidate now intentionally loads the closed, pinned library/app.bundle.mjs. This note records test-contract corrections, not a claim that the replacement hosted jobs have passed.

## Corrections

- R6 now independently computes SHA-384 from the actual Library bundle, requires exactly one module entry, checks its full pinned tag and anonymous fetch, and refuses the original app/core/catalog module loaders. Its existing navigation, reader and preserved-content checks remain.
- The first corrected local R6 run then exposed a second obsolete assumption: the historical R5 digest for pauri-2-lesson.html included its old unpinned script tags. The historical fixture digest is unchanged. R6 now independently checks all five new script pins, exact script order and scheduling, reverses only those exact attribute additions in memory, and compares the resulting HTML against the original digest. Any other HTML change still fails.
- R7 retains all of its behavior checks and additionally requires the three generated module bundle paths in the offline manifest.
- Kabir content verification retains exact source, teaching, line and script checks. The stale fixed offline count is replaced by an independent required reader/executable inventory, scoped unique manifest URLs, valid SHA-256 declarations and comparison against every actual disk file.
- Kabir browser verification retains its complete reading, learning, preservation and offline interaction suite. It now compares the exact cache name, every versioned cache URL, and every cached response SHA-256 with the declared release, while independently requiring its source and executable assets.
- The Nitnem browser fixture now serves .mjs files as JavaScript. That fixture-only MIME correction was syntax-checked here. No additional claim is made that this change's effect on the Nitnem suite's home navigation was exercised.

No application, scripture, teaching or historical digest fixture was changed by these corrections.

## Retained before and after evidence

- r6-r7-20261127T031539Z: R6's second failure, caused by its unchanged historical HTML digest; R7 and the root verification passed.
- kabir-before-20261127T031648Z: unchanged Kabir contracts failed on 93 versus 81. The complete desktop Chrome browser suite passed 39 checks and failed only that fixed-count assertion.
- contracts-after-20261127T031927Z: R6, R7, root verification and Kabir content all passed. Nitnem fixture syntax passed.
- kabir-after-20261127T031936Z: the complete Kabir browser suite passed all 40 checks, including exact versioned cache URLs and cached response hashes. Chrome 158.0.8127.37 was launched from /Applications/Google Chrome.app/Contents/MacOS/Google Chrome. The run took approximately 73 seconds.

The per-test .log files and summary.json files are the current verdict records. Original evidence files were restored after each run.

### Evidence provenance

Each correction folder contains manifest.json, mapping every command to the log and reports it actually produced. Browser manifests also map screenshot paths in the unchanged report to the archived screenshot files.

The wrappers initially copied unchanged historical verdicts along with fresh browser output. Those misleading copies have now been removed from these new correction folders: the failed R6 run's inherited r6-contract.json, and the inherited content.json and portable-gates.json in each Kabir browser folder. Their actual failure logs, browser reports and screenshots are retained. No original committed evidence was removed or edited.

## Remaining literal references audited

No further obsolete runtime app.mjs expectation or fixed current-release 81/85 count was found in active test files. Remaining app.mjs references inspect the preserved source modules, record their provenance, or require files deliberately retained in the cache. The 85-asset assertion in the new offline mutation suite refers to the frozen previous release and is intentional. Other numeric occurrences concern pace preferences or scripture line counts.

The Article and Nitnem browser suites retain older source-module entries in their required asset lists. Those files are still deliberately cached, so these are not failing path assertions. The new closed-module browser and offline suites separately cover the executed bundles.

All browser results above use fresh synthetic desktop contexts and emulated offline conditions. They do not establish physical iPhone, Safari, VoiceOver, qualified content review or release approval.
