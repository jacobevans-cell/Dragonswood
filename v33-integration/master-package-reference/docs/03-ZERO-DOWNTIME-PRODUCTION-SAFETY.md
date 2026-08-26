# 03 — Production Safety / Seamless Update Plan

## Core principle

The live root remains usable while integration happens elsewhere.

## Recommended workflow

### 1. Never use production root as the development surface

Build the real integration candidate on a dedicated branch and/or isolated path. Keep live `index.html` and `teacher.html` stable until the candidate is complete.

### 2. Integrate additive dependencies before the final switch when safe

Where architecture permits, new versioned assets can be added before the root entry-point switch because unused new files do not affect students.

### 3. Avoid mixed-version cache failures

A common static-site failure is old HTML loading new incompatible JS/CSS or new HTML loading stale assets.

For promotion:

- prefer versioned asset filenames for materially changed production JS/CSS, or use deliberate cache-busting references;
- do not overwrite a shared asset with an incompatible implementation while live HTML may still reference it;
- ensure every file referenced by the promoted HTML exists in the same release state.

### 4. Keep data migrations backward-compatible

If Firestore fields/contracts change:

- prefer additive fields first;
- keep old readers working during transition;
- do not delete/rename fields until the new client is proven and the old client no longer depends on them;
- use safe defaults for missing new fields;
- never require an all-students-at-once migration merely to render the new portal.

### 5. Security-rule changes are release-critical

Rule changes can break the entire classroom even if the UI is perfect. Test every relevant read/write role before promotion.

### 6. Promotion should be atomic from the user's perspective

The final production switch should be a controlled commit/merge containing the exact root entry-point and dependency changes required for the candidate. Avoid a sequence where production is knowingly broken between commits.

### 7. Keep old state recoverable

Before promotion record:

- pre-release `main` SHA;
- safety tag name;
- promotion commit SHA once created;
- GitHub Pages production URL;
- known-good smoke-test routes.

## Release-blocking conditions

Rollback rather than “fix forward on broken production” if any of these occur:

- students cannot load/login;
- teacher cannot access required controls;
- curriculum or assignment data fails to load;
- student progress displays/writes to wrong records;
- critical Firestore permissions fail;
- passes/rewards/jobs write incorrectly;
- grading/teacher verification becomes unavailable;
- major assets/scripts 404;
- page enters an error loop;
- a broad visual/layout regression makes the portal unusable on student devices.
