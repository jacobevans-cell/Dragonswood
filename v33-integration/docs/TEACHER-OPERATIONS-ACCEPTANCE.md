# Teacher Operations + Cedar Acceptance

This wave begins only from the backed-up Student World checkpoint
`a3777b2e8c2addd0970865e0e4f071fa1f24e573` and its exact tree
`b6b478a8f83b1ac8b84fbd854a1d4c2a10619dff`.

## Acceptance gates

- The fictional Auth/Firestore emulator proves teacher identity and rejects a
  wrong teacher.
- A scholar may have only one pending extra pass across Bathroom, Snack,
  Out-of-Seat, and Office request types.
- Teacher Command reads a deduplicated pending queue, approves or denies one
  request, and closes one active pass with an archived history record.
- Recognition requests award at most one deterministic +1 XP transaction.
- Shared class points, universal goal transfers, Guild Job assignments,
  weekly payroll, and schedule saves are teacher-only emulator writes.
- Payroll and weekly leaderboard rewards use deterministic records and refuse
  duplicate payment.
- Teacher Command reads the live class schedule, calendar, job completion,
  leaderboard, class goals, and curriculum-override count.
- Cedar narration loads the current production narration manifest and narrator
  only after the student activates Read Aloud. Navigation, controls, answer
  choices, and teacher-only content are excluded from the reading text.
- No candidate browser may contact the production Firebase project.
- All production scripts parse, all protected visual files remain unchanged,
  and all 8 student plus 9 teacher routes retain zero changed pixels.

## Safety boundary

The installer must stop before copying or committing if any gate fails. It may
commit only to `massive-v33-integration-recovery-dd40cd4`; it must never push,
merge, deploy, edit `main`, or connect candidate writes to production.
