# 01 — Integration Master Plan

## Objective

Transplant the newest verified Dragonswood production behavior into the approved V3.3 presentation layer while keeping the live classroom stable and preserving rollback capability.

## Operating model

Use three distinct states:

### Production
Current live root experience used by students/teacher. Protect it.

### Integration candidate
A separate integration branch and/or isolated hosted path where real production behavior is wired into V3.3.

### Approved V3.3 visual baseline
The bundled `v33-approved-visual-model/dragonswood-v33-test/` package. This is the reference model for appearance.

Do not collapse these three states prematurely.

## Stage 0 — Read-only production inventory

Before changes, map the newest production system:

- entry points and route/subpage files
- CSS hierarchy
- shared JS
- Firebase configuration and auth flow
- Firestore reads/writes
- collections, documents, field names, expected defaults
- security rules
- curriculum data and question engines
- video/media mappings
- gradebook/grading logic
- AI grading client/teacher flow
- recovery sequencing
- RPG/progression logic
- pet registry and animation control
- passes/rewards/jobs
- boss logic
- narration
- teacher actions
- existing test/self-test files

Output a matrix: production subsystem → source files → data contracts → V3.3 destination → integration risk → test required.

## Stage 1 — Safety setup

Before functional integration:

- resolve newest `main` SHA;
- record it;
- create a dedicated integration branch from that exact SHA;
- record the approved V3.3 CSS/art hashes;
- identify files that must remain untouched until promotion;
- define the production rollback reference strategy;
- ensure integration candidate can be deployed without replacing the live root entry points.

## Stage 2 — Identity and data plumbing

Replace V3.3 mock student identity/state with production identity/auth/data without changing presentation.

Verify:

- correct logged-in student/teacher resolution;
- correct grade/group;
- no data writes to incorrect student records;
- tester fallback/mock behavior is removed from the real integration candidate.

## Stage 3 — Student progression shell

Wire:

- level
- XP
- gold
- HP
- streak
- class
- active pet
- equipment/progression state

Do not alter V3.3 card geometry while doing so.

## Stage 4 — Daily Missions / curriculum

Integrate all real curriculum behavior, including current pacing contracts and video behavior.

Preserve production rules such as sequential unlocks, teacher verification/override where applicable, recovery behavior, and required media behavior.

## Stage 5 — Grading and recovery

Wire the production grading stack and recovery logic. Test both normal and edge-case student states.

No production grading functionality may silently downgrade to a cosmetic V3.3 mock.

## Stage 6 — Scribe

Replace tester writing state with production writing/submission/review behavior while keeping the screenshot-matched V3.3 composition.

## Stage 7 — Academic Games

Map every current academic game and launch behavior into the V3.3 game surface. Preserve existing game URLs, progression/reward logic, and access controls.

## Stage 8 — My Day

Integrate the real schedule/calendar/day-state source into the approved My Day composition.

## Stage 9 — Adventurer Hall

Integrate production classes, equipment, appearance/progression systems and their restrictions.

## Stage 10 — Pets

Integrate the complete current pet registry, active-pet logic, hatchery/sanctuary/shop behavior, animations and all approved assets. Do not regress to the limited mock pet set.

## Stage 11 — Boss Battle

Wire current production boss logic, question sources, HP/damage/rewards and daily state into the V3.3 boss composition.

## Stage 12 — Leaderboards

Wire real leaderboard data and privacy/display rules.

## Stage 13 — Passes, rewards and jobs

Integrate student-facing state and teacher controls together so the two sides remain synchronized.

## Stage 14 — Teacher portal

Integrate every current working teacher command. No button should remain mock-only in the production candidate unless explicitly documented and approved.

## Stage 15 — Narration/media

Integrate current narration architecture and media references. Preserve client performance constraints and the approved narration model/asset delivery architecture documented in current production.

## Stage 16 — Rules/security

Integrate Firestore/security changes conservatively. Rule changes require explicit audit against every production read/write path.

## Stage 17 — Full regression

Run student + teacher route tests, data-contract tests, visual regression, responsive tests and production parity audit.

## Stage 18 — Controlled promotion

Promotion should be a known, reviewable release event. Prepare the rollback reference before the promotion commit is merged/pushed.

## Stage 19 — Immediate live verification

After GitHub Pages deploys:

- open production student portal;
- open production teacher portal;
- verify auth;
- verify key data reads;
- verify one safe write path if appropriate;
- verify curriculum route;
- verify key teacher control;
- verify assets and cache versions;
- inspect browser console/network for release-blocking failures.

If a release-blocking issue appears, revert the promotion commit promptly rather than debugging indefinitely on broken production.
