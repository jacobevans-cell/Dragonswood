# Dragonswood Massive Integration Baseline

## Frozen production authority

- Repository: `https://github.com/jacobevans-cell/Dragonswood`
- Branch: `main`
- Frozen SHA: `2258a321077a39ca71e36409d9bc6a1fb5bb3ecc`
- Commit: `Retire disconnected V2 portal runtime`
- Integration branch: `massive-v33-integration-safe-2258a321`
- Uploaded ZIP: byte-for-byte identical to the Git checkout at the frozen SHA, excluding `.git` history.

The earlier package authority `1043751adba008d4d1babfdd57546b2c6457a71a` is historical only.

## Post-handoff production delta reconciled

1. `a681d60422524645c64d2a644ac9ce5b3e2beb2e` removed student dependencies on retired V2 destinations.
2. `c156c1e3b18e7b83c24ad45e9a4dcb113a806fb6` integrated large standalone features into the current portal module shell.
3. `452ee8fcc9856e4f22477a024dfba3c6c3992d61` removed duplicate module headings and technical presentation remnants.
4. `2258a321077a39ca71e36409d9bc6a1fb5bb3ecc` retired seven disconnected V2 runtime files and added a regression test.

These changes are part of the functional authority and must survive V3.3 transplantation.

## Baseline verification

Passed at the frozen SHA:

- academic grading and AI-rescue self-test;
- bathroom-pass synchronization self-test;
- curriculum pacing self-test;
- grading hardening self-test;
- current portal module self-test;
- V2 retirement self-test;
- V57 improvements self-test;
- 96 JavaScript/script-block parser checks;
- Firestore collection/rule coverage check;
- Seating Command verifier;
- V3.3 static tester verifier;
- V3.3 8-student-route and 9-teacher-route render smoke test.

The bundled Stage 2-3 candidate additionally passed its integration-core, route smoke, 31-file visual freeze, and emulator-isolation static checks.

## Pending process gate

The real Firebase Auth + Firestore emulator suite could not start in this environment because the official Firestore emulator JAR is hosted on a blocked download domain. The Firebase CLI itself installed successfully. No production Firebase project, data, rules, or account was used.

Per the controlling V3.3 rules, Stage 4 production-behavior wiring remains blocked until `tools/run-firebase-gate.sh` passes with fictional project `demo-dragonswood-v33`.

## Rollback authority

- Current production rollback branch supplied by Jacob: `rollback/pre-v2-runtime-retirement-20260826-051814`
- It points to: `452ee8fcc9856e4f22477a024dfba3c6c3992d61`
- No production branch, tag, deployment, Firestore rule, or live data was changed by this integration branch.
