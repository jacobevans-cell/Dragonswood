# Integration Status

## Completed

- Gate 0 original read-only production inventory/dependency map.
- Current production reconciliation to `2258a321077a39ca71e36409d9bc6a1fb5bb3ecc`.
- Full post-checkpoint delta ledgers: 19 earlier commits plus four newer module-integration/V2-retirement commits.
- Stage 1 local safety setup and rollback plan updated to current production.
- Approved V3.3 visual freeze baseline established and verified.
- Stage 2 identity/data plumbing implementation, read-only.
- Stage 3 student progression shell implementation, read-only.
- Emulator-mode safety hardening to fictional project `demo-dragonswood-v33`.
- External-only visual fixture separation; no visual bypass in production-loaded application code.
- Firebase Auth/Firestore identity gate harness created with fictional data and read-only gate rules.
- Static/unit/smoke validation for Stage 2–3.
- Fresh pixel regression: 8/8 student + 9/9 teacher routes at 0 changed pixels.

## Required before Stage 4

- Actually execute `./tools/run-firebase-gate.sh` in an environment able to obtain/use Firebase Emulator Suite.
- Require all fictional identity/read/isolation/write-denial checks to pass.
- Preserve the 17-route zero-pixel visual result in that same gate run.
- Re-query GitHub `main` immediately before beginning Stage 4. If production moves again, reconcile the delta first.

## Stage 4 functional authority already mapped

Once the Firebase gate passes, Daily Missions / curriculum / pacing / video must integrate from the current production set, especially:

- `curriculum-quest.html`
- `daily-quest.html`
- `q1-no-video-lessons.js`
- `q1-curriculum-interactions.js`
- `q1-curriculum-answer-policy.js`
- `q1-curriculum-enhancements.js`
- `q1-video-map.js`

The current production contract includes no-video scope locking, no-cold-guess interaction design, purpose-specific attempt limits, completed-work grandfathering, duplicate-safe review workflow, and the recovered final 14 Q1 videos.

## Still intentionally mock / not promoted

Daily Missions/curriculum/pacing/video, grading/recovery, Scribe, Academic Games, My Day, Adventurer Hall writes, full pet registry/animation integration, Boss writes, leaderboards, passes/rewards/jobs, teacher command writes, narration wiring, and production rules changes remain pending in the mandated order.

## Safety

- Default runtime mode is emulator-only using `demo-dragonswood-v33`.
- Production mode is explicitly read-only and opt-in.
- The Stage 2–3 integration runtime contains no Firestore write methods.
- Root production files and live Firestore rules/data remain untouched.
- Remote `v33-integration-safe` creation was retried from current production and still failed with GitHub integration HTTP 403. No fallback write to `main` was attempted.
- A guarded Codespace installer and branch-only GitHub Actions workflow are bundled so the remaining branch/emulator gate can be completed without any direct `main` write.
