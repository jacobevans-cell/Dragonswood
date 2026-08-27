# Production Delta Ledger — post-V3.3 checkpoint

## Current functional authority

- Repository: `jacobevans-cell/Dragonswood`
- Branch: `main`
- Current production SHA: `1043751adba008d4d1babfdd57546b2c6457a71a`
- Current commit: `Lock students to one pending extra pass`
- Previous V3.3 audit SHA: `beb1f5968268bf168c3d43b82bd79c69bc71ca0c`
- GitHub compare state: current production is **19 commits ahead, 0 behind** the old audit checkpoint.
- Compare surface: **42 files changed**.

The old V3.3 candidate remains the visual/integration starting point, but `beb1f596…` is no longer allowed to act as functional authority. Every item below must survive the V3.3 migration.

## The 19 production commits that arrived after the original audit

1. `dbb3b6b6` — Upgrade no-video curriculum lessons only
2. `7dc9bccf` — Add interactive curriculum practice across Q1
3. `36de8f5c` — Harden curriculum answer attempts and progress checks
4. `83164b56` — Replace Long Division cards with Math Operations Quest
5. `82f3c923` — Replace live Long Division cards with Math Operations Quest
6. `c3ef8fd9` — Add Seating Command Room Builder
7. `7452fb7f` — Add Dragonswood classroom controls, boss variety, and Grayson mode
8. `c31e4010` — Improve Room Builder selection and alignment
9. `7b644353` — Tighten curriculum copied-prompt validation
10. `d89d16f6` — Add inline teacher approval actions
11. `0a1949f4` — Remove system text from curriculum answers
12. `d12a106c` — Bind bathroom slots after student group loads
13. `1f842588` — Clear system-authored curriculum attempts
14. `91358297` — Add teacher student request workflow
15. `85855af6` — Mount Grayson Mode in current math games
16. `a2581a03` — Prevent duplicate student approval requests
17. `860dd7fe` — Auto-grade Math without teacher approval
18. `30b13bc9` — Connect final 14 recovered Q1 videos
19. `1043751a` — Lock students to one pending extra pass

## Changed-file inventory grouped by migration stage

### Identity / student shell / global classroom behavior

- `index.html`, `index-v2.html`, `Tester1111.html`, `index-live-welcome-test.html`
- `dragonswood-student-tools.js`
- `dragonswood-subpage-shell-v2.js`
- `GOGUARDIAN-DRAGONSWOOD-SETUP.md`

Current production still uses Firebase Web SDK 12.1.0, project `dragonswood-9289e`, the Explore Academy student domain, and the exact teacher email. The student shell additionally gained pending-extra-pass tracking, classroom/focus helpers, and updated subpage shell behavior. V3.3 may not regress any of those.

### Stage 4 — Daily Missions / curriculum / pacing / video

- `curriculum-quest.html`
- `daily-quest.html`
- `q1-no-video-lessons.js`
- `q1-curriculum-interactions.js`
- `q1-curriculum-answer-policy.js`
- `q1-curriculum-enhancements.js`
- `q1-video-map.js`

New production curriculum law to preserve:

- The no-video engine is explicitly forbidden from changing missions classified as video missions.
- No-video lessons now distinguish self-contained lessons, progress/assessment checks, fluency, writing performance, and publish/share performance.
- Interaction work replaces repetitive multiple-choice volume rather than merely adding more work.
- Morphology uses taught/current Q1 word families, not cold distractor vocabulary.
- Drag interactions have click/tap and keyboard fallbacks for Chromebooks/accessibility.
- Previously completed missions are grandfathered and never reopened by the new interaction layer.
- Answer policy is purpose-specific: ordinary practice gets two submitted tries; progress checks get one locked submission; assessments get one locked submission with correctness deferred until the set is submitted.
- Failed checks may begin a fresh reviewed round while retaining first-round evidence/history.
- Required-video playback/watch tracking/R2 media remain separate and must not be weakened by the answer-policy layer.
- The final 14 recovered Q1 videos are now connected in the authoritative `q1-video-map.js` and must be carried forward.
- Current `q1-curriculum-enhancements.js` layers the no-video engine, interaction engine, answer-integrity policy, then Math auto-grading using versioned script loaders. Preserve that dependency order unless a later verified production commit changes it.

### Stage 5 — grading / teacher verification / recovery

- `dragonswood-math-autograding.js`
- `dragonswood-request-center.js`
- `dragonswood-teacher-tools.js`
- curriculum request changes in `curriculum-quest.html`, `daily-quest.html`, `teacher.html`, and `firestore.rules`

New production behavior to preserve:

- Routine Math can auto-grade without requiring teacher approval.
- Student teacher-review requests use deterministic/reusable records so repeated clicks do not create duplicate queues.
- System-authored prompt text is not accepted as student evidence and old system-authored attempts are cleared.
- Teacher inline approval/request workflows exist and must map into V3.3 Teacher Command rather than reverting to mock buttons.

### Stage 7 — Academic Games

- `math-operations-quest.html`
- `css/math-operations-quest.css`
- `js/math-operations-quest.js`
- `js/math-operations-audio.js`
- `js/math-operations-dragonswood-host.js`
- `js/math-operations-rewards.js`
- `long-division-quest.html`, `long-division-custom.html`
- `fraction-forge.html`, `decimal-deception.html`, `elemental-laboratory.html`, `arcane-forge.html`
- `dragonswood-grayson-mode.js`
- `GRAYSON-MODE-ACADEMIC-BASIS.md`

Math Operations Quest supersedes the older Long Division cards as the general operations surface. Its host/reward bridge includes live-profile checks, knocked-out reward blocking, bounded/daily-capped rewards, and completion reporting. Grayson Mode is mounted into current math games and is production behavior, not a tester-only novelty.

### Stage 9–11 — Hall / Boss / subpages

- `adventurer-hall.html`
- `boss-battle.html`
- `dragonswood-subpage-shell-v2.js`

The Hall and Boss now use the shared production subpage shell, and Boss received additional variety. V3.3 must preserve those behavior changes even though the final visual destination is the V3.3 Hall/Boss design.

### Stage 13 — Passes / rewards / classroom requests

- `index.html` and mirrors
- `teacher.html`
- `firestore.rules`

The latest production contract is stronger than the earlier V3 audit: a student may have **only one pending extra-pass request across Water & Bathroom, Snack, Out of Seat, and Emergency Office**. Production enforces this both in UI state/listeners and in Firestore rules through `hasNoOtherPendingExtraPass(...)`. This is non-negotiable when V3.3 Pass Control is integrated.

Bathroom slot binding also now waits for the student group to be known, preventing a race that could synchronize the wrong slot/group.

### Stage 15 — full teacher / Seating Command

- `teacher.html`, `teacher-v2.html`
- `dragonswood-teacher-tools.js`
- `seating-command/ROOM-BUILDER.md`
- `seating-command/css/seating-command.css`
- `seating-command/js/app.js`
- `seating-command/js/optimizer.js`
- `seating-command/assets/evans-room-reference.png`

Seating Command now includes Room Builder and alignment/selection improvements. There is still no approved distinct V3.3 Seating route, so it remains a preserved teacher-only subsystem until a visual home is explicitly approved.

### Security / regression

- `firestore.rules` gained 110 lines and removed 7 compared with the original V3.3 audit checkpoint.
- `v57-improvements-selftest.cjs` was added.

The current ruleset, not the old package copy, is the security authority for eventual Stage 17 validation.

## Stage 2–3 impact assessment

The 19-commit delta does **not** invalidate the existing V3.3 identity mapping model:

- Firebase SDK remains 12.1.0.
- Student project/domain and teacher email remain unchanged.
- Student profiles remain keyed by `students/{uid}`.
- Teacher authority remains exact-email based.
- Student own-profile reads and teacher roster reads remain the relevant Stage 2 contracts.

However, Stage 2–3 documentation and safety tests have been updated to name `1043751…` as functional authority. The emulator candidate also now uses project `demo-dragonswood-v33` rather than initializing the live project config before connecting to localhost.

## Gate consequence

Stage 4 must use the curriculum files and behavior at `1043751…`, not the versions audited at `beb1f596…`.
