# Security follow-up deliberately separated

## INT-2: daily XP cap trusts a client-controlled date string

The current shared academic reward rule allows the daily counter to reset when `dailyXpDate` changes, while validating that value only as a string. A console user can therefore rotate the string and reset the 150-XP counter.

This should be fixed, but **not as a Math Operations-only Firestore edit**. The student reward rule is shared by Math Operations, Fraction Forge, Daily Boss, legacy Long Division, and other academic games. Adding a new required day-key field to only one client would eventually block the others when the day changes.

## Recommended system-wide fix

1. Add a shared numeric `dailyXpDayKey` based on **America/Phoenix** server time, not device time.
2. In Firestore rules, compute the current Arizona day from `request.time - duration.value(7, 'h')` and require the incoming day key to match it.
3. Rebase `dailyXpEarned` using that server-validated day key rather than `dailyXpDate`.
4. Update every academic-game reward writer to preserve/write the same key in one coordinated deployment.
5. Test with the Firestore emulator before publishing rules.

Firebase's rules reference documents that `request.time` is server time, timestamps support arithmetic with `duration.value(...)`, and timestamps expose `year()` and `dayOfYear()`. That makes an Arizona server-day key feasible without trusting a Chromebook clock.

Do not deploy this as an isolated one-game patch.
