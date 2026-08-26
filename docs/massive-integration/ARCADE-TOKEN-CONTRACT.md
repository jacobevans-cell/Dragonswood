# Arcade Token and timed-access contract

## Locked classroom policy

- Arcade Tokens are free-time access currency, never gameplay rewards.
- A student wallet holds 0–3 tokens; all award and adjustment paths clamp at 3.
- During each configured eligible period, the teacher may award at most one token for each criterion: Ready, Responsible, Complete.
- Therefore a student can earn at most three tokens in one eligible period.
- Three tokens purchase one 30-minute Arcade session.
- Redemption also requires the teacher's Arcade Time switch to be active for that student/class.
- Arcade access is a teacher-controlled privilege like a field trip or second recess, with classwide and individual locks.
- Game performance never grants Tokens, Gold, XP, class points, pets, fragments, or any other Dragonswood progression reward.

## Authoritative data boundary

The browser may display state but may not authoritatively award, spend, refund, or extend time. Those operations must run in Firestore transactions or callable Functions against the authenticated V3.3 uid.

Suggested records:

- `arcadeAccess/{uid}` — token balance, teacher activation, current session id/status/start/end, lock reason, and update metadata.
- `arcadeTokenPeriods/{date_period_uid}` — the three criterion flags, total awarded, eligible-period id, teacher uid, and idempotency metadata.
- `arcadeSessions/{sessionId}` — immutable purchase cost, authoritative start/end, terminal status, lock/refund metadata, and audit timestamps.

Rules and server code must enforce wallet ≤ 3, criterion uniqueness per period, total awards ≤ 3 per period, a three-token atomic debit, one active session per student, and a fixed 30-minute server-time window.

## Access enforcement

- V3.3 opens Arcade only after a fresh authorized-session read.
- `/arcade/`, Dragon Dash, and Void Runner each enforce the gate; hiding a tab is not security.
- Refresh, direct URL, duplicate tab, or second device cannot reset or extend the session.
- The displayed countdown derives from server timestamps and periodically revalidates while visible.
- Offline app-shell caching may remain, but offline state can never create or extend an Arcade session. If current authorization cannot be verified, the Arcade stays locked.
- Service-worker cache names must be bumped whenever gate code changes.
- Technical refunds are explicit audited server operations; games cannot refund themselves.

## Remaining configurable choices

- Exact eligible period ids/schedule.
- Whether a teacher lock ends an active session immediately or only blocks the next session. The safer default is immediate lock with an explicit teacher refund option.

These choices are configuration, not a reason to weaken the invariants above.
