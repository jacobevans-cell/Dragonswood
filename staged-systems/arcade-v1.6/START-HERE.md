# START HERE — Dragonswood Arcade

## Current build

**v1.5 Reliability / Accessibility Pass** is the current authoritative build. It is based on the verified v1.4 game package and implements the full actionable repair list from `CHANGELOG-v1.5-RELIABILITY-ACCESSIBILITY-PASS.md`.

## What is inside

- `site/` — complete deployable arcade website
- `site/games/dragon-dash/` — Dragon Dash: Runestone Trials
- `site/games/void-runner/` — Void Runner: Astral Passage
- `site/js/game-registry.js` — register future games here
- `firebase/` — Firestore rules and indexes
- `functions/` — scheduled leaderboard finalization, weekly archive, and score retention
- `vendor-deps/` — pinned deploy-time Three.js dependency
- `scripts/vendor-three.mjs` — creates the local/offline Three.js copy automatically
- `cloudflare-r2/` — optional R2 public-asset architecture
- `.github/workflows/pages.yml` — GitHub Pages deployment

## Safest deploy

1. Upload the contents of this package to a repository root.
2. Push/commit to `main`.
3. GitHub Actions installs pinned Three.js locally before publishing `site/`.
4. In GitHub → Settings → Pages, choose **GitHub Actions**.
5. Test both games on a Chromebook before enabling reward processing.

### Firebase

1. Put Firebase web config in `site/js/arcade-config.js` and set `firebase.enabled: true`.
2. Enable Anonymous Auth for students and Google Auth for the teacher/admin review page.
3. Deploy Firestore rules/indexes.
4. Deploy functions only after reviewing `LEADERBOARD-REWARD-RULES.md`.
5. `firebase deploy` uses the hosting predeploy hook to vendor Three.js before upload.

## Critical reward rule

**Games never grant Dragonswood rewards.** They report performance only. Leaderboard placement creates eligibility. Scheduled functions create teacher-review records. Actual reward fulfillment remains teacher-controlled.

## v1.6 rollout gate
Before student rollout, read `CHROMEBOOK-ROLLOUT-CHECKLIST.md` and run the deployed `/device-check.html` on a managed student Chromebook. Production deployments run `scripts/preflight.mjs` after vendoring Three.js.
