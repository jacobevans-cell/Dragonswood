# Locked Arcade Leaderboard / Reward Rules

- Daily reward eligibility runs **Monday–Friday only**.
- Daily leaderboard processing uses configured `leaderboard.topN` (default **Top 5**).
- A student receives **one eligibility record per day**, even if they place on multiple boards.
- **Champion's Choice is per-board first place:** finishing #1 on any arcade board marks that student's single daily eligibility record `CHAMPIONS_CHOICE`. If one student wins multiple boards, it is still one eligibility record. If different students win different boards, each can be Champion's Choice eligible that day.
- Actual fulfillment remains teacher-controlled outside the games.
- Each student has one best entry per board / period. Replays and reloads do not create duplicate placements.
- Daily eligibility uses deterministic IDs.
- Weekly boards roll by Monday `periodKey`; final rankings archive Saturday.
- All-time uses permanent key `all` and never resets.
- Old raw daily/weekly `arcadeScores` are retention-pruned; archives, all-time scores, and reward eligibility are preserved.
- Teacher/admin may approve, replace, or revoke eligibility.
- Students cannot write eligibility records, archives, class totals, or reward totals.
- The games themselves never grant Dragonswood rewards.
