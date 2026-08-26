# START HERE NEXT — Dragonswood V3.3 Integration Candidate

This is the active continuation point for the master V3.3 integration thread.

## Functional authority

- Repository: `jacobevans-cell/Dragonswood`
- Branch audited: `main`
- **Current production commit:** `2258a321077a39ca71e36409d9bc6a1fb5bb3ecc`
- Current commit message: `Retire disconnected V2 portal runtime`
- Original V3.3 audit checkpoint: `beb1f5968268bf168c3d43b82bd79c69bc71ca0c`
- Production advanced 23 commits after the original audit. The latest four commits integrate large modules into the current portal shell and retire disconnected V2 runtime files.
- Read both production-delta ledgers before later-stage integration.
- Production root and live Firestore data/rules have not been changed by this candidate.

## Candidate branch

Local Git branch: `v33-integration-safe`

Original candidate commits retained in history:

1. `f8f9acd` — freeze approved V3.3 integration baseline at production `beb1f596`
2. `f43d7ea` — integrate read-only V3.3 identity and progression shell
3. `ad97307` — record Stage 2–3 verification and next gate
4. `b924ae1` — bundle controlling migration references for handoff continuity
5. `33e4fee` — reconcile V3.3 gate with current production, harden emulator isolation, add executable Firebase gate and fresh pixel regression


A matching remote branch was retried from current `main` and still failed because the connected GitHub integration returns HTTP 403 on branch creation. Do **not** compensate by committing this work directly to `main`.

## What is integrated now

- student Google Auth plumbing
- production student/tester eligibility logic centralized in integration core
- exact `students/{uid}` profile resolution
- grade/group identity
- production XP/level thresholds
- HP / Gold / XP
- class state
- active-pet state
- RPG inventory/equipment state
- read-only school-day streak derived from authoritative Morning Quest completion dates
- teacher Google Auth plumbing with a separately named Firebase app
- exact teacher-email authorization
- teacher roster reads keyed by Firestore document ID, never first name

## Safety hardening now in place

- Emulator mode initializes fictional project `demo-dragonswood-v33`, never the live project.
- Live `dragonswood-9289e` config is selected only by the explicit production-readonly gate.
- Stage 2–3 integration runtime contains no Firestore write primitives.
- Test identities live only in `tools/visual-fixture-runtime.js`, which is not loaded by the real entry pages.
- No production-loaded code contains a visual-test identity/bypass hook.
- `firestore.gate.rules` is an emulator-only, read-only identity test ruleset.

## Current verification

Run static/local checks:

```bash
./tools/check-stage-2-3.sh
```

Current local result:

- integration-core tests PASS
- 8 student authenticated route smoke renders PASS
- 9 teacher authenticated route smoke renders PASS
- 31-file V3.3 visual freeze PASS
- emulator project isolation PASS
- Stage 2–3 static safety checks PASS
- 8/8 student pixel routes: 0 changed pixels
- 9/9 teacher pixel routes: 0 changed pixels

## Required Firebase gate

Do **not** begin Stage 4 until the real emulator suite runs this command successfully:

```bash
./tools/run-firebase-gate.sh
```

It creates only fictional Auth users/data in `demo-dragonswood-v33` and verifies:

1. normal Explore student
2. tester account
3. unauthorized account
4. authorized teacher
5. wrong teacher account
6. missing student profile
7. grade 4 profile
8. grade 5 profile
9. class chosen / class not chosen
10. active pet / no active pet
11. own-profile isolation / cross-profile denial
12. scoped Daily Quest progress
13. stable teacher roster IDs
14. authenticated write denial
15. all static checks
16. all 17 visual pixel checks

The current ChatGPT sandbox cannot fetch the Firebase CLI/emulator artifacts, so this one process-level verification is still honestly pending.

Because the connected GitHub tool also cannot create the safety branch, `CODESPACE-ONE-COMMAND.md` and `tools/install-into-dragonswood-repo.sh` provide the guarded bridge: they create the branch from the exact current production SHA, run every gate, and push only that branch. A branch-only GitHub Actions workflow reruns the same gate after push.

## After the Firebase gate passes

Re-query `main`. If it is still current or any new delta has been reconciled, proceed to Stage 4 using the **current** curriculum stack named in `docs/PRODUCTION-DELTA-2026-08-25.md`, not the package-era files.

## Read before continuing

- `docs/PRODUCTION-DELTA-2026-08-25.md`
- `docs/PRODUCTION-DELTA-2026-08-26.md`
- `docs/PRODUCTION-MAP.md`
- `docs/ROLLBACK-PLAN.md`
- `docs/STAGE-2-3-REPORT.md`
- `docs/INTEGRATION-STATUS.md`

The original master-package `START-HERE.md` remains the controlling authority for the overall migration.
