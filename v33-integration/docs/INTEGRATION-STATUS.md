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
- Real Codespace Firebase Auth + Firestore emulator baseline gate passed at
  `87822e5`: 13/13 checks, 17/17 zero-pixel routes, and 31 protected files
  unchanged.
- Isolated manual acceptance preview passed and was approved by Jacob at the
  GitHub-backed checkpoint `9bfe2a19b730034f6919ca6c74fbff6ece531846`.
- Stage 4 Daily + Curriculum integration passed its fictional Firebase,
  browser, parser, safety, and 17-route zero-pixel gates and was committed and
  backed up at `fc6298808affc7faa642a8605cccb96fb96bce47`.
- The Academic Systems wave passed 25 fictional Firebase checks, its student
  and teacher browser gates, all 96 parser checks, and all 17 zero-pixel visual
  routes. It was committed and backed up at
  `2c0fd7457470d1abb709879473c46e02df38276f`.

## Student World Wave candidate — Codespace gate pending

- The authoritative production `daily-quest.html` and
  `curriculum-quest.html` remain the lesson, pacing, recovery, grading, and
  video engines. V3.3 does not duplicate or replace those contracts.
- Embedded lesson URLs now inherit `dw-env=emulator`, and both lesson engines
  pin Auth, Firestore, and Functions to the fictional
  `demo-dragonswood-v33` environment in that mode.
- The production-readonly inspection mode executes embedded production pages
  in a scriptless, formless sandbox.
- The V3.3 mission shell now reads today's authoritative Morning/Exit v48
  progress and receives exact Curriculum completion state from the hosted
  curriculum engine through an origin-, frame-, and date-validated bridge.
- Active lesson iframes are preserved while Firestore progress snapshots
  update, preventing a save from reloading a student mid-question.
- The fictional gate now exercises current assignment reads, Daily Quest
  in-progress-to-complete persistence, canonical Curriculum evidence writes,
  teacher evidence reads, cross-student isolation, and unauthorized denial.
- Static safety, unit, module-host, manual-preview, render-smoke, protected
  visual-file, and all 96 production parser checks pass locally.
- The V3.3 student Scribe now reads the active teacher mission, autosaves one
  deterministic owned draft, submits once, and reads the student's portfolio.
- Teacher Command now derives a live read model across Daily Quest,
  Curriculum attempts, reading/game results, and Scribe responses. Teacher
  Scribe launch, close, and review writes are enabled only in the fictional
  emulator candidate.
- The missing `gradeWriting` callable is implemented with owner checks,
  submitted-work checks, strict 0–20 structured output, prompt-injection
  boundaries, usage caps, audit records, and a teacher-review fallback.
- All 11 current Academic Game/Reader module IDs share one audited catalog;
  V3.3 keeps the six approved visible cards while every registered destination
  retains the Morning Work gate and emulator environment propagation.
- My Day reads the current `classSchedule`, `classJobs`,
  `classCalendarEvents`, and the signed-in student's deterministic weekly job
  record. Job check-off is transaction-backed and emulator-only.
- The approved Adventurer Hall summary reads the student's current RPG class,
  pet, inventory, and equipment. The full authoritative Hall and Pet Sanctuary
  retain the complete production registry and motion controller while honoring
  `dw-env=emulator` when embedded from V3.3.
- The authoritative Daily Boss retains Morning + Exit completion gating,
  capped/idempotent loot, pet animation, one chest per day, and fictional
  emulator persistence when embedded from V3.3.
- The V3.3 leaderboard uses the production best-score-per-assignment algorithm,
  weekly Phoenix reset, daily reward markers, and live signed-in score reads.
- The actual Firebase emulator process and 17-route pixel suite must pass in
  the Codespace before this combined candidate may be accepted or committed.

## Required while later stages proceed

- Re-run `./tools/run-firebase-gate.sh` after material identity, rules, or
  read-model changes.
- Require all expanded fictional identity/read/isolation/write-denial checks
  to pass.
- Preserve the 17-route zero-pixel visual result in every full gate run.
- Keep the integration line anchored to frozen production `2258a321…` unless
  a future production delta is explicitly reconciled.

## Stage 4 functional authority

Daily Missions / curriculum / pacing / video integrate from the current production set, especially:

- `curriculum-quest.html`
- `daily-quest.html`
- `q1-no-video-lessons.js`
- `q1-curriculum-interactions.js`
- `q1-curriculum-answer-policy.js`
- `q1-curriculum-enhancements.js`
- `q1-video-map.js`

The current production contract includes no-video scope locking, no-cold-guess interaction design, purpose-specific attempt limits, completed-work grandfathering, duplicate-safe review workflow, and the recovered final 14 Q1 videos.

## Still intentionally pending after this wave

Passes/rewards, remaining teacher command writes, narration wiring, final
production-rules reconciliation, launch acceptance, and production promotion
remain pending.

## Safety

- Default runtime mode is emulator-only using `demo-dragonswood-v33`.
- Production mode is explicitly read-only and opt-in.
- Academic writes fail closed unless the runtime is connected to the fictional
  `demo-dragonswood-v33` emulator.
- Production `main`, its live entry points, live Firestore rules, and live data
  remain untouched. Stage 4 edits exist only in the isolated candidate.
- The isolated recovery branch is backed up on GitHub; no fallback write to
  `main` was attempted.
- A guarded Codespace installer runs the combined wave in a detached worktree
  before copying or committing it to the isolated branch.
