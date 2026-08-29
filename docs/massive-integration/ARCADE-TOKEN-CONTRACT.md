# Arcade Token and timed-access contract

## Locked classroom policy

- Arcade Tokens are free-time access currency, never gameplay rewards.
- A student wallet holds 0–3 tokens; all award and adjustment paths clamp at 3.
- On each Phoenix school date, the teacher may award at most one token for each criterion: Ready, Responsible, Complete.
- Token awards are **not tied to the class schedule, a period, or the current clock time**.
- Therefore a student can earn at most three criterion tokens per school day.
- Three tokens purchase one 30-minute Arcade session.
- Redemption also requires the teacher's manual **Open Arcade Time** switch.
- The class availability switch is the master gate. Individual controls may further lock a scholar but may never reopen Arcade while the class is locked.
- Opening class Arcade clears stale individual locks so "Open Arcade Time" means the class is actually open.
- Game performance never grants Tokens, Gold, XP, class points, pets, fragments, or any other Dragonswood progression reward.

## Authoritative data boundary

The browser may display state but may not authoritatively award, spend, refund, or extend time. Those operations run in callable Firebase Functions and Firestore transactions against the authenticated V3.3 uid.

- `arcadeAccess/{uid}` — token balance, individual lock, current session id/status, and update metadata.
- `arcadeSettings/classAccess` — manual class availability switch.
- `arcadeTokenPeriods/{date_daily_uid}` — the three once-daily criterion flags and audit metadata. The historical collection name is retained for compatibility; the live award bucket is always `daily`.
- `arcadeSessions/{sessionId}` — immutable purchase cost, authoritative start/end, terminal status, lock/refund metadata, and audit timestamps.

## Access enforcement

- V3.3 opens Arcade only after a fresh authorized-session read.
- `/arcade/`, Dragon Dash, and Void Runner enforce the gate; hiding a tab is not security.
- Refresh, direct URL, duplicate tab, or second device cannot reset or extend the session.
- The displayed countdown derives from server timestamps and only runs after an actual paid session exists.
- The Arcade service-worker cache is versioned whenever gate code changes so Chromebooks cannot retain a stale authorization client.
- Offline state can never create or extend an Arcade session. If current authorization cannot be verified, the Arcade stays locked.
