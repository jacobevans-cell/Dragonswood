# Gate 0 — Current Production Dependency Map

Functional authority: `jacobevans-cell/Dragonswood@2258a321077a39ca71e36409d9bc6a1fb5bb3ecc`.

The original read-only inventory was reconciled against the 19 commits through `1043751…`, then against four additional production commits through `2258a321…`. See both dated production-delta ledgers.

| Subsystem | Current production sources/contracts | V3.3 destination | Risk / required validation |
|---|---|---|---|
| Student entry/auth | `index.html`; Firebase 12.1.0; Google Auth; Explore domain + teacher + `testerAccounts/{uid}` eligibility | Student shell | High: wrong-user profile mapping. Test authorized, unauthorized, tester, signed-out. |
| Teacher entry/auth | `teacher.html`; separately named Firebase app; exact teacher email | Teacher shell | Critical: teacher privilege boundary. Test exact email and wrong account. |
| Student profile/progression | `students/{uid}` fields including `firstName`, `grade`, `genderGroup`, `hp`, `gold`, `xp`, `classId`, `activePet`, `rpgInventory`, `rpgEquipped`, title/voice prefs | My Adventure / Hall / global header | High: never create a competing profile schema. |
| XP/levels | Production 20-level threshold table | Header + Adventure | Medium: exact thresholds and current-level progress math. |
| Daily progress | `dailyQuestProgress` keyed to `studentId`; completed Morning Quest rows use `_v48`, `status=complete`, `session=morning`, `dateKey` | Missions + derived V3.3 streak display | High: pacing/recovery rules come later; streak is read-only derived presentation. |
| Curriculum | `daily-quest.html`, `curriculum-quest.html`, `curriculum-question-engine.js`, `foundation-track.js`, `q1-curriculum-data.js`, `q1-video-map.js`, `q1-no-video-lessons.js`, `q1-curriculum-interactions.js`, `q1-curriculum-answer-policy.js`, `q1-curriculum-enhancements.js` | Daily Missions | Critical: current pacing, no-video scope lock, interaction rules, attempt policy, completed-work grandfathering, final recovered videos, media coverage and recovery. |
| Grading / requests | `dragonswood-grading-core.js`, `dragonswood-gradebook-v5611.js`, `dragonswood-math-autograding.js`, `dragonswood-request-center.js`, `gradebookAssignments`, `gradebookGrades`, curriculum attempts/overrides | Student grades + teacher Gradebook | Critical: deterministic-first grading, current attempt policy, no copied/system-authored evidence, duplicate-safe teacher requests, Math auto-grading and exception review. |
| Narration | `narration-manifest.js`, `dragonswood-narrator.js`; stored voice preference | Read Aloud surfaces | Medium: preserve prerecorded/fallback architecture and cleanup behavior. |
| Academic Games | Current game pages plus `math-operations-quest.html` and `js/math-operations-*`; Grayson mode | Academic Games | High: current host/reward bridge, HP reward gating, daily caps, completion reporting, Grayson Mode. |
| RPG/classes/equipment | `dragonswood-rpg-v56.js`; 4 classes, items, sets, appearance packs | Adventure/Hall/Boss | High: transaction-safe inventory/equip restrictions and level gates. |
| Pets | `pet-registry-v5614.js`, `pet-motion-controller.js`; active pet field in student profile | Adventure/Hall/Boss | High: complete registry and animation metadata, not the 3-pet mock. |
| Boss | `boss-battle.html`, question engine, `bossLoot`, `gameResults`, student profile reward fields; current boss-variety/subpage-shell changes | Boss Battle | Critical: missed-skill questions, one chest/day, bounded rewards, physical prize protection. |
| Passes | Bathroom/Snack/Out-of-Seat/Office request/status/history/slot records + blackout state; cross-type pending-request lock | Student Passes + Teacher Pass Control | Critical: **one pending extra request total per student**, synchronized slots after group resolution, duplicate-safe teacher review. |
| Jobs/schedule | `classData/classJobs`, `studentJobWeeks`, `classData/classSchedule`, `classCalendarEvents` | My Day + Guild Jobs + Schedule | High: Phoenix/date correctness and idempotent payroll. |
| Teacher command | `teacher.html`, `dragonswood-teacher-tools.js`; live listeners/writes for roster, rewards, gradebook, Scribe, requests, passes, jobs, schedule, shop, leaderboards, quest controls | 9 V3.3 teacher routes | Critical: review-before-write, stable student document IDs, serious-action safeguards. |
| Seating Command | `seating-command/` including current Room Builder; `classrooms/evans-4-5/seatingPlans/current`; seating history | V3.3 Classroom Tools module | High: preserve the complete embedded teacher subsystem without restoring an old portal destination. |
| Current portal module host | `dragonswood-module-host.js`, `dragonswood-module-host.css`; embedded large-feature routes | V3.3 route/module adapters | High: preserve current feature containment and return behavior while making V3.3 the shell. |
| Classroom/focus controls | `dragonswood-student-tools.js`, teacher tools, GoGuardian setup | Existing student/teacher surfaces as appropriate | High: preserve copy/paste protections/focus helpers without claiming browser code can replace GoGuardian device controls. |
| Security | current `firestore.rules`; exact teacher guard, owner reads/writes, narrow mutations, request dedupe, one-pending-extra-pass guard, teacher-only records, AI protected paths, default deny | All integration services | Critical: Stage 17 tests must use the current ruleset, not the package-era copy. |

## Production behavior absent from the V3.3 mock

Real authentication and identity, persisted profiles, transaction-safe XP/Gold/inventory, current curriculum/pacing/videos, current attempt policy/interactions/no-video teaching, grading/recovery/AI rescue, duplicate-safe teacher requests, Math Operations Quest and Grayson Mode, production Scribe, game reward/reporting, live schedule/jobs, full RPG and pets, boss reward limits, all four pass systems with the cross-type pending lock, teacher live controls, leaderboards, narration, classroom/focus helpers, Seating Room Builder, current module-host behavior, and current Firestore security behavior.

## V3.3 mock behavior that must be replaced before promotion

Hardcoded student stats/identity, local mission completion and rewards, toast-only game launches, local Scribe submission, hardcoded My Day, local class/pet changes, simulated Boss HP, static leaderboards/passes, hardcoded teacher gradebook/rewards/payroll/schedule/pass actions and any other tester-only mutation.
