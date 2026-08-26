# v56.27 decision log

## Applied now

1. Claude debug fixes: navigation, mode-aware copy, custom/random wording, hint lifecycle, operation-aware Core Habit, mobile header, cache bump.
2. INT-1: worksheet next-problem replay closed.
3. DATA-3: trivial Normal/Hard worksheet problems rejected; Easy remains permissive.
4. DATA-4: custom coaching capped at 18 tasks.
5. DATA-1: saved problem counts use actual event data.
6. DATA-2: Random Division remainders appear in later rounds.
7. UX-1: focus advances to the next action after completion.
8. UX-2: place-value labels remain visible on phones.
9. UX-4: active step announced with `aria-current`.
10. UX-5: Mixed selection restored after Custom.
11. INT-3: stable run/round claim IDs reduce accidental double rewards and detect prior saved claims.
12. Custom Mode account rewards disabled by design.
13. Round setup locks after work starts so students cannot change mode to alter reward eligibility mid-round.

## Deferred

- UX-3 round resume after refresh. Worth building, but it deserves its own state/recovery test pass.
- INT-2 server-enforced daily XP day. System-wide Firestore migration required.
