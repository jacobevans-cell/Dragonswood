# Dragonswood Student Portal V2 — Integration QA

This checklist separates automated/static verification from the Firebase-backed
student tests that must be run with a real test account before deployment.

## Completed static gates

- [x] Started from GitHub `main` commit `4f40c53` after the teacher rollback.
- [x] Work is isolated on `codex/student-portal-v2-integration`.
- [x] Production inventory created before the visual transplant.
- [x] Approved V2 CSS copied as a late-loading stylesheet rather than recreated.
- [x] Mock asset aliases overridden with current production paths.
- [x] Fixed desktop sidebar and mobile drawer hierarchy installed.
- [x] Existing live pass controls moved into the new top bar; no duplicate IDs.
- [x] Persistent Read Aloud, Profile, and Sign Out actions remain reachable.
- [x] My Adventure uses the approved greeting, title, two-column hierarchy,
  dominant Next Step, live hero/trophy display, class goals, and fast paths.
- [x] Daily Missions, Games, Scribe, My Day, and Leaderboards use the approved
  page-title and card/grid language while keeping production IDs.
- [x] Leaderboards retain live weekly/all-time/filter/reward behavior and now
  render an approved ranked board, personal-rank card, and shout-outs.
- [x] Adventurer Hall and Boss Battle share the V2 navigation/top-bar language.
- [x] Current game routes and query-bearing production links remain present.
- [x] Hall and Boss production scripts, registries, Firebase logic, and IDs are
  unchanged; only the shared presentation shell was added.
- [x] All mapped production hooks from the handoff remain present.
- [x] HTML ID audit: zero duplicate IDs in all three student pages.
- [x] Static asset audit: zero missing local references.
- [x] JavaScript syntax check passes for the new shared shell.
- [x] CSS brace/integrity check passes.
- [x] `git diff --check` passes.

## Required Firebase-backed live tests

- [ ] Google sign-in, profile open/save, narration voice save, and sign out.
- [ ] Pass popover, each pass type, blackout, active lock, timer, overdue, return.
- [ ] Home character/pet/background, stats, XP, goals, and Next Step live state.
- [ ] Locked, unlocked, and teacher-override Daily Mission states without flash.
- [ ] Daily Quest, Curriculum Quest, Level-Up, Exit, Reader, Poll, jobs,
  countdowns, recognition throttling, and grade summary.
- [ ] Every academic game route and completion/XP report.
- [ ] Scribe waiting/active, autosave, timer, submit, AI feedback, Battle/vote,
  portfolio, and teacher-review disclaimer.
- [ ] My Day current/next/timeline/event filters and school-day boundaries.
- [ ] Hall class lock, appearance, gear, inventory, purchases, eggs, pets,
  interaction states, active companion, and transaction-safe Gold deduction.
- [ ] Boss gate/reveal/battle/defeat/victory, pet states, daily claim limit, loot,
  rare physical prize, and duplicate-reward prevention.
- [ ] Weekly/all-time and all subject filters; one row per student; Top 5 reward.

## Required responsive/visual proof

- [ ] Compare directly with the approved V2 reference at 1440px.
- [ ] Test 1180px small desktop.
- [ ] Test 1024px Chromebook/tablet landscape.
- [ ] Test 768px tablet portrait.
- [ ] Test 390px phone.
- [ ] Confirm no clipping, overlap, inaccessible popovers, or horizontal scroll.
- [ ] Keyboard-only navigation and visible focus.
- [ ] Reduced-motion mode.

Do not call the integration production-finished until every unchecked live and
responsive item has been exercised against the test account.
