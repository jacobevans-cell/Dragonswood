# Dragonswood Student Portal V2 — Production Inventory

Baseline: GitHub `main` commit `4f40c53b8163387aa1dd90238471a4ec159a2370`.

This inventory is the Gate 0 checkpoint for the V2 visual transplant. The
existing production application remains the functional and data authority.

## Production pages

- `index.html`: signed-in student SPA, profile, passes, grades, jobs, polls,
  narration, games, Scribe, schedule, leaderboards, and Firebase integration.
- `adventurer-hall.html`: class, gear, inventory, appearances, pets, eggs,
  hatching, shop, purchases, and active companion.
- `boss-battle.html`: daily requirements, battle engine, pet animation,
  damage, cooldown/retry, loot, physical-prize drops, and daily claim limits.

## Required linked production modules

- `pet-registry-v5614.js`
- `pet-motion-controller.js`
- `dragonswood-rpg-v56.js`
- `dragonswood-gradebook-v5611.js`
- `narration-manifest.js`
- `dragonswood-narrator.js`

## Existing SPA destinations

`home`, `scribe`, `games`, `planner`, `poll`, `shop`, `quests`,
`leaderboard`, and the legacy-routed `journal` state. V2 keeps Poll inside
Daily Missions and keeps shop/profile RPG actions routed to Adventurer Hall.

## Firestore collections referenced by the student SPA

`students`, `classData`, `dailyQuestProgress`, `curriculumProgress`,
`curriculumAttempts`, `gradebookAssignments`, `gradebookGrades`, `scores`,
`leaderboardRewards`, `writingResponses`, `writingVotes`, `classPollVotes`,
`classCalendarEvents`, `studentJobWeeks`, `pointRequests`, `rewards`,
`shopItems`, `purchases`, `bathroomRequests`, `bathroomSlots`,
`bathroomStatus`, `snackRequests`, `snackStatus`, `passRequests`,
`passStatus`, `passHistory`, and `testerAccounts`.

## Locked production behaviors

- Google authentication and profile persistence.
- Transaction-safe Gold, XP, purchases, loot, and pass writes.
- Morning-work access gating and teacher overrides.
- All four passes, blackout state, blocking overlay, overdue state, and return.
- Four-voice narration preference, prerecorded-audio architecture, and fallback.
- Daily Quest, Curriculum Quest, Level-Up, Exit Quest, Reader, Poll, jobs,
  countdowns, recognition requests, and cumulative grades.
- All current academic game routes and completion reporting.
- Scribe autosave, timer, feedback, Battle, votes, and portfolio.
- Schedule/calendar computation and filters.
- Weekly/all-time leaderboard filters, de-duplication, and reward rules.
- Full RPG/pet registries, animations, interactions, prestige, eggs, and shop.
- Daily Boss requirements, battle/reward limits, and physical-prize drops.

## Migration safeguards

- Keep every production ID unique.
- Move existing live controls into the approved hierarchy; never clone them.
- Load `dragonswood-student-redesign-v2.css` after legacy styles.
- No prototype sample names, scores, pets, schedules, or rewards in live data.
- Validate each destination before replacing or packaging production files.
