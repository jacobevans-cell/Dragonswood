# 04 — Rollback Within Minutes

## Goal

A bad V3.3 production promotion must be reversible without reconstructing old files manually.

## Before promotion

Record the exact known-good production SHA:

`PRE_RELEASE_SHA=<current known-good main SHA>`

Create an annotated safety tag from that exact commit, for example:

`pre-v33-production-2026-08-25`

Verify the tag points to the intended SHA before promoting.

## Preferred rollback model

Structure the production promotion as a clear commit or merge commit whose SHA can be reverted.

Once the promotion commit exists, record:

`PROMOTION_SHA=<exact promotion commit SHA>`

If release-blocking regression occurs:

```bash
set -e

git checkout main
git pull --ff-only origin main

git revert "$PROMOTION_SHA" --no-edit
git push origin main
```

This creates a normal history-preserving rollback commit. GitHub Pages then redeploys the restored state.

## Why revert instead of force-reset

A normal revert:

- preserves the audit trail;
- avoids rewriting shared branch history;
- is safer when multiple people/tools may have touched `main`;
- makes the release failure and recovery explicit.

## Emergency caveat

If commits landed on `main` after the promotion, do not blindly revert a range or reset the branch. Inspect the exact changes and revert only the release change(s) that caused the failure.

## Data rollback warning

Code rollback does not automatically reverse Firestore data mutations. Therefore production migration design must avoid destructive data migrations during the initial release.

Prefer:

- additive fields;
- backward-compatible reads;
- no field deletion during initial promotion;
- no mass rewrite required just to load V3.3.

## Live rollback verification

After pushing the rollback:

1. wait for GitHub Pages deployment to complete;
2. hard-refresh / use a private window;
3. open student production root;
4. open teacher production root;
5. verify login/data load;
6. verify one critical student route and one critical teacher route;
7. confirm no missing asset/JS errors.

## Do not debug broken production indefinitely

If the release is clearly classroom-blocking, rollback first. Diagnose the candidate afterward in isolation.
