# Private source importer boundary repair

Read-only inspection reproduced a privacy defect: `outside_git()` refused the actual repository normally, but admitted the same destination when `GIT_DIR` pointed at an unavailable location. The initial code treated every Git exit128 as evidence of being outside a repository. No private content or destination was written during reproduction.

The importer now resolves paths and symlink ancestors, rejects `.git` markers including linked-worktree files and dangling symlinks, removes Git environment overrides, checks bare repositories, and admits only the expected nonrepository result. Unknown128 errors and unavailable Git fail closed. Source input and optional retrieval-receipt locations are also checked before reading. The repair does not alter source parsing, source text, encryption or the real prepared collection.

`python -B tests/private-source-import-boundaries.py` passed twelve synthetic boundary checks. The tests use temporary files containing only synthetic text, never inspect private-access, and never open the owner's real source payload or password.

A separate `tests/private-library-navigation-smoke.mjs` is ready for the final combined candidate. It checks root Read/Explore entrances, all three Dasam links and their source verification, open Psychology, locked private reading, no external requests or script errors, and 320-pixel layout. Its server forcibly refuses the actual ciphertext path before any file read. It does not test service-worker behavior beyond manifest exclusion, and it does not unlock a real collection. Run this fixture only after final bundle, SRI and offline-manifest regeneration.
