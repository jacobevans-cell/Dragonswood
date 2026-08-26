# Massive V3.3 integration checkpoint

## Repository safety

- Frozen production authority: `2258a321077a39ca71e36409d9bc6a1fb5bb3ecc`.
- Safety branch: `massive-v33-integration-safe-2258a321`.
- Current implementation checkpoint: `79ada5d` plus this documentation commit.
- Production `main` has not been changed, pushed, or deployed.
- No integration branch has been pushed from this environment.
- Every major integration step is a separate commit and can be reviewed independently.

## Completed integration milestones

1. `0b448ee` records the successful Codespace Firebase Auth + Firestore identity gate against fictional project `demo-dragonswood-v33`.
2. `c88bf0a` places all 16 current production modules inside the V3.3 student shell while preserving the Morning Work gate.
3. `e12680e` installs Unified Math v56.27 and Grayson v58 into the current academic pages without replacing their current portal behavior.
4. `0d5af98` installs Arcade v1.6 under `/arcade/` with server-authoritative Arcade Tokens and timed access.
5. `79ada5d` installs hardened Kingdom Wars V11.1 under `/kingdom-wars/` and adds its V3.3 route behind Morning Work plus tester/admin authorization.

## Arcade contract implemented

- Wallet is clamped to 0–3 Tokens.
- Ready, Responsible and Complete may each award once per Phoenix date/period.
- Spending 3 Tokens atomically creates one exact 30-minute server session.
- Concurrent starts reuse the same active session instead of charging twice.
- Class and individual teacher locks are supported; a lock terminates active access.
- Direct Arcade and direct game URLs revalidate every 15 seconds and fail closed offline.
- Arcade scores and Void Runner progress require a live authorized session in Firestore rules.
- Gameplay cannot grant Tokens, Gold, XP, class points or Dragonswood progression.
- Technical refunds are capped, one-time and audited.
- Teacher writes appear only in emulator mode with exact URL opt-in `dw-arcade-writes=EMULATOR_ONLY`.

## Kingdom Wars contract implemented

- Hardened V11.1 donor runtime is installed with all 902/902 live renderer assets.
- The V3.3 Kingdom Wars tab redirects to Daily Missions until Morning Work or the current teacher override unlocks it.
- The direct Kingdom URL enforces the same Morning Work condition for tester students.
- The exact teacher account may enter for testing; ordinary students remain excluded during the tester-only phase.
- Default Firebase target is fictional `demo-dragonswood-v33`; production requires an explicit live confirmation parameter.
- Kingdom state remains local tester state. V12 server-authoritative live PvP remains intentionally deferred.

## Verification completed locally

- Massive pre-emulator suite passes.
- 96 production scripts parse with zero failures.
- Unified Math: 29/29 hardening and engine gates.
- Grayson: 371/371 generator cases and 14/14 academic page mounts.
- Arcade access core and integrated static safety gates pass.
- Kingdom V10/V11/V11.1 adversarial gates pass, including loot conservation, persistence migration, damage/repair, ticket expiry and async action protection.
- Kingdom live art routing: 902/902 assets.
- Original V3.3 rendered markup is byte-identical on 8/8 student and 9/9 teacher routes.
- All 31 protected V3.3 CSS/art files remain unchanged.

## Remaining executable gate

The Arcade callable Functions and new Firestore rules still require the real emulator process in a normal Dragonswood Codespace. Run from this safety branch:

```bash
bash tools/massive-integration/run-codespace-firebase-gate.sh
```

That command reruns the entire local suite, the original Auth/Firestore identity matrix, visual pixel regression, and the new adversarial Arcade Auth + Firestore + Functions matrix against only `demo-dragonswood-v33`.

## Still not done

- V3.3 has not replaced root `index.html` or `teacher.html`.
- The candidate has not been deployed, pushed, merged, or promoted to `main`.
- The actual browser-based 17-route pixel test has not been rerun in this restricted container because Chromium is unavailable; the Codespace command above includes it.
- Chromebook Arcade performance/offline/cold-open acceptance is not complete.
- Arcade callable Functions and Firestore rules are not deployed.
- Kingdom Wars remains tester-only and local; V12 live PvP is not authorized.
- Final root-home promotion, production Firebase configuration, rollback tag/branch, and deployment require Jacob's explicit approval after acceptance testing.
