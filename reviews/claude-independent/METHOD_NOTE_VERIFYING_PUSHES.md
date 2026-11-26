# Method note — how to verify a push in this repository, and the trap I fell into

Recorded because it nearly produced a false alarm of the worst kind, and because
anyone verifying work on this repository will hit the same trap.

## What happened

After pushing nine review documents I checked whether they had landed:

```
git fetch origin
git log --oneline -1 origin/review/claude-independent-20261125
git cat-file -e origin/review/claude-independent-20261125:reviews/.../RT-010_....md
```

The ref showed an **old commit** and every file came back **MISSING**. On that
evidence I was one step from telling the founder and the builder that nine
documents had been lost.

**They had not been lost. Every push had succeeded.** The authoritative check:

```
gh api repos/.../git/ref/heads/review/claude-independent-20261125
→ sha: e0c7d826c05f0ee5b58eac4acd3379f0d883f920   (exactly my local HEAD)
```

All nine files are present on the server at that ref, confirmed through the
contents API.

## Why the check was wrong

This clone's fetch refspec is narrow:

```
remote.origin.fetch = +refs/heads/main:refs/remotes/origin/main
```

**It only ever fetches `main`.** So:

- `git fetch origin` never updates `refs/remotes/origin/review/...`.
- `refs/remotes/origin/review/claude-independent-20261125` is a **stale leftover**
  that was written once and never moves.
- Pushes here use an explicit refspec, `HEAD:review/claude-independent-20261125`,
  which updates the **server** ref but not the local remote-tracking ref.

So the remote-tracking ref and the server disagreed permanently, and I read the
stale one.

## The rule

**To verify a push on this repository, ask the server, not a remote-tracking ref.**

```
gh api repos/<owner>/<repo>/git/ref/heads/<branch> --jq '.object.sha'
gh api "repos/<owner>/<repo>/contents/<path>?ref=<branch>" --jq '.size'
```

A `git log origin/<branch>` here is not evidence about the server. If a
remote-tracking check is wanted, fetch that branch explicitly first:

```
git fetch origin review/claude-independent-20261125
```

## Why this is in the record

This was my **eighth instrument error** in a day of reviewing, and the most
consequential by a wide margin. The earlier seven produced wrong findings about
the build; this one would have produced a wrong finding about **the review itself**,
and it would have sent the builder hunting for a problem that did not exist.

What saved it was the same thing that saved the other seven: not reporting the
first answer. The authoritative source contradicted my conclusion, and the
authoritative source won.
