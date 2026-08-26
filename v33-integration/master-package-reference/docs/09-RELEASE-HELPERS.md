# 09 — Guarded Release Helpers

Two optional helper scripts are included. They are deliberately guarded and refuse to act without explicit variables and confirmation.

## Create immutable pre-release safety tag

Verify the current known-good production SHA first, then:

```bash
export SAFETY_SHA=<exact-known-good-sha>
export SAFETY_TAG=pre-v33-production-YYYYMMDD-HHMM
export CREATE_SAFETY_TAG_CONFIRM=YES
./tools/create_pre_release_safety_tag.sh
```

The script validates that the SHA is a commit, creates an annotated tag at that exact commit, and pushes only the tag.

## Roll back a bad promotion

Use only after identifying the exact promotion commit that introduced the production failure:

```bash
export PROMOTION_SHA=<exact-promotion-sha>
export ROLLBACK_CONFIRM=YES
./tools/rollback_promotion.sh
```

The rollback helper:

- refuses to run with a dirty working tree;
- validates the promotion SHA;
- updates local `main` using fast-forward-only pull;
- creates a normal `git revert` commit;
- pushes that rollback commit to `origin main`.

This is intentionally not a force-reset tool.
