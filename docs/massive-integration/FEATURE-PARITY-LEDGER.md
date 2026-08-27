# V3.3 Production Feature-Parity Ledger

V3.3 is the visual and navigation authority. Frozen production is the functional and data-contract authority. No feature may disappear because the approved V3.3 mock did not represent it.

## Student destinations

| Production capability | Functional sources | V3.3 destination | Status / rule |
|---|---|---|---|
| Authentication, identity, grade/group | `index.html`; `students/{uid}`; `testerAccounts/{uid}` | Shared V3.3 student shell | Stage 2-3 candidate is read-only; emulator gate pending. |
| HP, Gold, XP, level, class, equipment, active pet | `index.html`; `dragonswood-rpg-v56.js`; `pet-registry-v5614.js`; `pet-motion-controller.js` | My Adventure and shared header | Preserve the complete registry and current 20-level thresholds. |
| Passes and restrictions | `index.html`; pass collections; current `firestore.rules` | Shared shell + My Adventure | Preserve one-pending-extra-pass total across all extra-pass types. |
| Daily Quest and Level-Up Challenge | `daily-quest.html`; question/grading engines | Daily Missions | Current module remains the behavior donor. |
| Curriculum and Recovery | `curriculum-quest.html`; Q1 data, video, interactions, answer policy, enhancements | Daily Missions | Preserve every video, pacing, attempts, no-cold-guessing, review, and recovery rule. |
| Math Operations Quest | `math-operations-quest.html`; `css/math-operations-quest.css`; `js/math-operations-*` | Academic Games | Upgrade surgically to v56.27; do not restore old Long Division cards. |
| Other academic games | Decimal Deception, Fraction Forge, Spelling Practice, Witches test, Elemental Laboratory, Cosmic Architect, Arcane Forge | Academic Games | All remain launchable within V3.3. |
| Grayson Mode | `dragonswood-grayson-mode.js` and academic-page script mounts | Academic Games / active academic surface | Upgrade surgically to v58; Grade 7-10, prerequisite-taught, optional, skip-enabled, reward-free. |
| Scribe Arena | `index.html`; writing collections; grading/teacher flow | Scribe Arena | Replace all tester-only local actions with production autosave/submission/review. |
| Schedule, calendar and current job | `classData`, `classCalendarEvents`, `studentJobWeeks` | My Day | Preserve Phoenix-date behavior and current job state. |
| Adventurer Hall and Pet Sanctuary | `adventurer-hall.html`; RPG and pet registries | Adventurer Hall | Preserve full class/equipment/pet/hatchery behavior inside V3.3. |
| Daily Boss | `boss-battle.html`; `bossLoot`; `gameResults`; profile writes | Boss Battle | Preserve question sources, one daily chest, bounded rewards, and no duplicate claims. |
| Leaderboards and recognition | production score/reward collections | Leaderboards | Preserve privacy, long-name handling, and duplicate-reward protection. |
| The Witches class reader | `witches-reader.html` | Daily Missions / curriculum module | Keep as a V3.3-hosted curriculum destination. |
| Dragonswood Arcade v1.6 | staged production Arcade package | New V3.3 Arcade route/tab | Approved visible addition. Locked by Arcade Tokens, teacher activation, and authoritative session timer. |
| Kingdom Wars V11.1 | staged V11 `current-game/` after hardening | New V3.3 Kingdom Wars route/tab | Approved visible addition, but hidden/tester-only until hardening and later live-PvP protections pass. Morning Work gate is mandatory. |

Existing eight student routes remain visually frozen. Arcade and Kingdom Wars are intentional additions using the same approved V3.3 design system; they do not authorize redesign of the original routes.

## Teacher destinations

| Production capability | Functional sources | V3.3 destination | Status / rule |
|---|---|---|---|
| Student selection, rewards, consequences, management | `teacher.html`; `dragonswood-teacher-tools.js`; transactions | Student Command | Preserve review-before-write and serious-action confirmation. |
| Gradebook and curriculum review | `teacher.html`; grading/request modules; gradebook collections | Gradebook | Preserve deterministic grading, AI rescue boundaries, inline review, and stable student IDs. |
| Scribe mission and review | `teacher.html`; writing collections | Scribe Command | Preserve live drafting/submission counts and teacher override. |
| Class goals/rewards | `teacher.html`; `classData`; rewards | Class Rewards & Goals | Preserve separate goal banks and idempotent updates. |
| Pass queues/actions | `teacher.html`; all pass collections | Pass Control | Preserve synchronized slots, one-pending-extra-pass rule, and duplicate-action protection. |
| Jobs/payroll | `teacher.html`; `studentJobWeeks`; `classData` | Guild Jobs | Preserve preview, exact student IDs, and duplicate-payroll protection. |
| Schedule/calendar | `teacher.html`; `classCalendarEvents`; `classData` | Schedule | Preserve Phoenix date/time logic. |
| Classroom/focus tools | `teacher.html`; teacher/student tools | Classroom Tools | Preserve all current controls. |
| Seating Command + Room Builder | `seating-command/`; embedded by `teacher.html` | Classroom Tools module inside V3.3 | Must remain fully available; no separate old-portal destination. |
| Production leaderboards | `teacher.html`; score/reward records | Leaderboards | Preserve review and duplicate-reward safeguards. |
| Arcade Tokens and Arcade Time | new isolated access services and teacher controls | Student Command + Class Rewards/Tools control | Teacher can award Ready/Responsible/Complete tokens, lock/unlock class or individuals, inspect sessions, and perform technical refunds. |
| Kingdom Wars tester controls | hardened tester access and future protected services | Classroom Tools / tester-only module | Explicit allowlist only; no ordinary student access. |

## Preservation classifications

- **Launch critical:** authentication, profile/progression, curriculum/recovery, grading, Scribe, Academic Games, My Day, Hall/pets, Boss, passes, rewards, jobs, teacher portal, rules/security.
- **Approved new launch surface:** Arcade, subject to the token/timer and Chromebook gates.
- **Tester-only at initial V3.3 approval:** Kingdom Wars V11.1.
- **Preserved historical/reference:** retired V2 documents and preview references; they remain non-runtime.
- **Retired by approved production commits:** seven disconnected V2 runtime files only.
