# START HERE — Grayson Mode v58.0

This package upgrades Grayson Mode from a math-only filename router into a context-aware Grade 7–10 challenge system.

## What changes

- Current-topic challenges re-detect the visible subject/problem before every Grayson question.
- Grade level cycles 7 → 8 → 9 → 10.
- Every third problem is a harder cross-subject Math/Science challenge.
- Math pages cross into Science; Science pages cross into Math; ELA/History alternate Math/Science.
- Every question still gives prerequisite teaching and a worked explanation.
- `GIVE UP / SKIP → NEXT` is always visible, immediate, and penalty-free.
- Grayson remains completely reward-free.
- Grayson is attached to Daily Quest, Curriculum Quest, Boss Battle, and current academic-game pages when those files exist.

## Install

Place/extract this package OUTSIDE the repo if possible, then from `/workspaces/Dragonswood` run:

```bash
bash /path/to/DRAGONSWOOD-GRAYSON-MODE-v58/APPLY-GRAYSON-V58.sh --push
```

The installer refuses a dirty working tree, creates a rollback branch, will not overwrite an unknown/newer Grayson implementation, runs the 371+ generator tests, verifies academic-page coverage, checks the diff, commits, and optionally pushes.
