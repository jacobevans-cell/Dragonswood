# Production Rollback Plan

## Current known-good production reference

`PRE_RELEASE_SHA=2258a321077a39ca71e36409d9bc6a1fb5bb3ecc`

This replaces the earlier `1043751…` reference because production advanced by four more protected commits. The current production root remains intentionally untouched by the V3.3 candidate.

## Required release tag before promotion

Planned annotated tag immediately before the eventual V3.3 production promotion:

`pre-v33-production-2026-08-26`

No remote branch/tag is created by this local candidate. Production promotion remains separately permission-gated and is never permission to work directly on `main`.

## Promotion shape

Promotion must be a discrete reviewed merge/commit whose exact `PROMOTION_SHA` is recorded. It must not contain unrelated work. Immediately before promotion, re-query `main`; if it has moved beyond the recorded `PRE_RELEASE_SHA`, reconcile the new delta first and update the rollback reference.

## Rollback

On a release-blocking regression:

```bash
set -e
git checkout main
git pull --ff-only origin main
git revert "$PROMOTION_SHA" --no-edit
git push origin main
```

Do not force-reset shared history. Code rollback does not undo Firestore mutations, which is why V3.3 migration work must remain additive/backward-compatible and avoid destructive mass writes.

## Release blockers

Rollback rather than debug on broken production if student login fails, teacher controls fail, curriculum does not load, data maps to the wrong student, critical Firestore permissions fail, passes/rewards/jobs write incorrectly, grading/verification disappears, the one-pending-extra-pass guard regresses, major assets/scripts 404, an error loop appears, or the portal becomes unusable on student devices.
