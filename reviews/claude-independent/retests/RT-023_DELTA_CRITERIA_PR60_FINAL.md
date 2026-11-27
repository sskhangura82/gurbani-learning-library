# RT-023 — delta criteria for PR #60's final review head

**New head:** `44401e35690322fb3dbc29c443bff86d73279fcb`
**Previously reviewed implementation:** `69e24fe4adfccbd535de2b5f8ac0bab5ed720d94` (RT-022, PASS + BUILD-01)
**Frozen before examining the delta.**

The builder states the application implementation is unchanged and the
follow-ups concern the private build lock, regression/CI contracts and review
records — i.e. this claims to fix **BUILD-01, which is my own finding.** That
makes verifying it, rather than accepting it, the whole point of this pass.

Proportionate scope: RT-022's criteria were frozen and met against
`69e24fe4`. If the application bytes are genuinely unchanged, those findings
carry forward and I need only test the delta.

| ID | Criterion | Fails if |
|---|---|---|
| RT23-C1 | Every application, scripture, bundle, HTML and worker byte is **identical** to `69e24fe4` | any moved; RT-022 would not carry forward |
| RT23-C2 | The three bundles are byte-identical, so the delivery fingerprint claim holds | any bundle changed |
| RT23-C3 | **BUILD-01 resolved:** `npm ci --prefix tools/script-integrity --ignore-scripts --no-audit --no-fund` succeeds on the committed tree | it still fails |
| RT23-C4 | With the toolchain installed, `build-app-bundles.mjs --check` **confirms the committed bundles reproduce** from the reviewed modules | it reports a mismatch, or still cannot run |
| RT23-C5 | `refresh-app-sri.mjs --check` runs and confirms the committed pins | it cannot run, or disagrees |
| RT23-C6 | The checks still **do not write** — now tested for real, which RT-022 could not do | any check mutates the tree |
| RT23-C7 | No machine path or timestamp is present in the regenerated lockfile or bundles | either reappears |
| RT23-C8 | No new deploy capability; workflows stay read-only | any gains write or deploy |
| RT23-C9 | PR #58, #59, #47 heads and `main` unchanged | any moved |

**If C3 and C4 both pass, RT-022's fidelity conclusion upgrades from
"behaviourally equivalent in the cases I tried" to "reproduces to the same
bytes," which is the stronger claim I said the candidate was entitled to.**

## Note on a builder correction

The builder corrects their own reference: the Explorer carrying EXP-01 is PR #41,
not PR #50. I checked my own records before accepting it — my register lists
EXP-01 with no PR attribution, so nothing of mine needs correcting. Recorded so
the correction is not later attributed to a fix of mine.

## Limits

Installing the toolchain means installing two third-party packages. I will do it
only in a throwaway worktree, with the exact flags the handoff specifies, and I
still audit neither package and claim nothing about their contents.
