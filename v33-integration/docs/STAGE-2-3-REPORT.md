# Stage 2–3 Integration Report — Identity + Student Progression Shell

## Functional authority reconciled

- Current production authority: `jacobevans-cell/Dragonswood@2258a321077a39ca71e36409d9bc6a1fb5bb3ecc`.
- Original Stage 2–3 audit authority: `beb1f5968268bf168c3d43b82bd79c69bc71ca0c`.
- Production first moved by 19 commits / 42 changed files, then by four additional commits that integrated standalone modules and retired disconnected V2 runtime files. The ledgers are in the two dated production-delta documents.
- Both deltas preserve the Stage 2 identity contracts while adding later-stage curriculum, request, pass, math, classroom-control, boss, seating, video and module-host behavior that must be carried forward.

## Integration status

Implemented in the isolated candidate only. No production write path has been added and no production file has been changed.

### Student identity

- Emulator mode now initializes only the fictional Firebase project `demo-dragonswood-v33` and then connects Auth/Firestore to localhost.
- The live Firebase project configuration is selected only by the explicit `production-readonly` environment gate.
- Google Auth flow mirrors production for the browser candidate.
- Authorization mirrors current student production: `@explore.academy`, exact teacher account, or the user's own `testerAccounts/{uid}` document.
- Eligibility functions are centralized in the pure integration core so the emulator gate and browser runtime test the same domain/email decisions.
- Student profile is read from exactly `students/{uid}`.
- Missing profile is shown as missing/neutral state; this milestone does not create one.
- Daily progress reads are scoped by `studentId == auth.uid`.

### Teacher identity

- Uses a separately named Firebase app to preserve production's student/teacher session isolation.
- Uses session persistence.
- Teacher Command accepts only the current exact authorized teacher email.
- Live roster reads retain Firestore document IDs as the selection key. First names are display labels only.

### Progression

- HP, Gold, XP, grade/group, class, active pet, RPG inventory and equipped state come from the production student profile.
- Level calculation uses the exact current 20-level production thresholds.
- XP progress uses current-level floor/next-threshold math.
- Production has no persisted `streak` field. The V3.3 streak element is derived read-only from consecutive completed Morning Quest school dates using production `_v48` / `complete` / `morning` records. No new field is written.
- Class/pet changes and Daily Mission reward writes remain locked in the real Stage 2–3 application. Visual fixtures are external test inputs only; no visual-test identity/bypass flag remains in production-loaded JavaScript.

## Isolated Firebase gate harness added

`tools/firebase-identity-gate.cjs` + `firestore.gate.rules` + `tools/run-firebase-gate.sh` now provide a one-command emulator gate using only fictional accounts and the `demo-dragonswood-v33` project.

The gate tests:

- normal Explore grade 4 student
- normal Explore grade 5 student
- tester account
- unauthorized outside account
- authorized teacher
- wrong teacher account
- missing profile
- class chosen / class unchosen
- active pet / no active pet
- own student profile read
- cross-student profile denial
- student-scoped Daily Quest progress query
- teacher roster read with stable Firestore document IDs
- wrong-teacher roster denial
- authenticated write denial under the read-only gate rules

The gate rules deliberately allow only unauthenticated creation of records marked `__gateSeed=true` so the harness can seed fictional emulator data. Authenticated candidate-stage writes are denied. These are test-only safety rules, not a replacement for current production `firestore.rules`.

## Local validation completed in this environment

- JS syntax checks for integration core/runtime, student app, teacher app and emulator gate.
- Pure integration tests for eligibility policy, level thresholds, title formatting, pet ID display normalization, school-day streak calculation, profile mapping and stable teacher roster IDs.
- Authenticated fixture route smoke: 8/8 student + 9/9 teacher routes render without exceptions.
- Static write audit: `js/integration/` contains no `setDoc`, `updateDoc`, `addDoc`, `deleteDoc`, `writeBatch`, `runTransaction`, `increment`, or `serverTimestamp` write path.
- Emulator project isolation check: emulator config is pinned to `demo-dragonswood-v33`; live project ID is absent from emulator config/gate files.
- Visual-test leakage audit: no visual-test identity/bypass remains in `student-test.html`, `teacher-test.html`, `js/integration`, `js/student-app.js`, or `js/teacher-app.js`.
- Visual-freeze hash verification: all 31 protected CSS/art files unchanged.
- Fresh 1440×1000 pixel regression: 8/8 student routes and 9/9 teacher routes each produced **0 changed pixels** against the frozen `f8f9acd` V3.3 visual baseline.

## Codespace gate result

The actual Firebase Auth + Firestore emulator process was executed after this
candidate was installed in the Dragonswood Codespace. At branch checkpoint
`87822e5`, all 13 original fictional identity/security checks passed, all 17
approved routes rendered at zero changed pixels, and all 31 protected visual
files remained unchanged. See
`docs/CODESPACE-ACCEPTANCE-GATE-2026-08-26.md`.

The gate remains reproducible with:

```bash
./tools/run-firebase-gate.sh
```

The script uses installed `firebase` when present, otherwise `npx --yes firebase-tools@15.28.1`, launches Auth + Firestore emulators for `demo-dragonswood-v33`, runs the fictional identity matrix, then reruns static and all 17 pixel checks. Expanded later-stage read/write contracts still require their own adversarial emulator coverage.
