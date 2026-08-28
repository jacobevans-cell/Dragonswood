# START HERE NEXT — Dragonswood V57.1.7 Grade/Evidence Hardening

This is the active continuation point for the live V3.3 portal repair. Older `2258a321...` and Codespaces-only instructions are historical; do not branch from them or reinstall an old package over the current portal.

## Functional authority

- Repository: `jacobevans-cell/Dragonswood`
- Live branch: `main`
- Live base for this repair: `9127f1a3f9efc01893c7ddb0629d3fcf6e282e7d`
- Live release before this repair: `v57.1.6`
- Repair branch: `codex/v33-grade-evidence-hardening`
- Pre-repair rollback branch: `rollback/pre-v57.1.7-grade-evidence-hardening-20260828`
- Candidate release: `v57.1.7`

The V57.1.6 Teacher Command daily-use repair is already merged and deployed. Preserve it. This branch is a focused grade-integrity, reading-evidence security, CSV, and acceptance-test repair; it is not a portal rebuild.

## V57.1.7 candidate behavior

- Witches targets are stored in `readingTargetsByDate`, keyed by assignment date.
- Legacy `readingAssignedDateKeys` records are normalized to a stable target snapshot without deleting data.
- An unassigned Witches session is historical evidence only: `Recorded`, no numeric Witches score, and no total impact.
- Every assigned date contributes one score. A missing date contributes `0`.
- One complete day plus one missing day at equal targets produces Witches `50%`, `Incomplete`, `missing=1`, and `Provisional`.
- Removing the last assignment removes Witches from active weighting while retaining the `readingSessions` evidence.
- `Incomplete` can never be paired with `Complete evidence`; the total status comes from the same missing/evidence calculation.
- ELA games and the old Witches comprehension game remain excluded from Witches Time.
- CSV headers and evidence columns are corrected. Percentage export fails closed unless the hardened grade-integrity model is active and assigned evidence IDs pass integrity checks.
- Student reading writes no longer carry a student-controlled target or heartbeat timestamp.
- Firestore requires deterministic student/date document IDs, an assigned date, exact fields, immutable identity/book/date/create metadata, bounded pages, server timestamps, a minimum real-time interval, and increments of at most 20 seconds.
- A real browser gate now proves reader heartbeat → Firestore rules → teacher gradebook and proves a hidden reader stops adding time.

## Grade/report-card rules

The Witches category is named `Witches Time`. Reading status is one of `Complete`, `Incomplete`, `Recorded`, or `Not assigned`. Every numeric total has one total status: `Complete evidence`, `Provisional`, or `Evidence review required`.

Do not use or export this candidate's Witches/overall percentages as final report-card grades until the exact pull-request full gate passes. After promotion, a row marked `Provisional` or `Evidence review required` must still be reviewed before final-grade use.

## Verification

Run the fast local gate:

```bash
bash v33-integration/tools/check-student-beta-release.sh
```

Run the complete production-equivalent gate:

```bash
bash v33-integration/tools/run-student-beta-gate.sh
```

The complete gate must use the exact root `firestore.rules` and must pass:

- all grade edge-case unit tests;
- deterministic-ID, allowlist, assignment, server-time, rate, immutable-field, page-bound, spoofing, target-injection, and cross-student denial checks;
- the real reader-heartbeat browser path and hidden-reader pause;
- corrected CSV content and assignment-removal/history behavior;
- all inherited authenticated student and teacher browser gates;
- 31 protected CSS/art files unchanged;
- eight student and nine teacher visual routes at zero changed pixels;
- no production Firebase request from emulator tests.

## Promotion and rollback

Do not edit `main` directly. Promotion order:

1. Confirm remote `main` is still the recorded live base or reconcile every newer commit.
2. Run the exact pull-request full gate.
3. Show the changed-file list and gate result for explicit approval.
4. Merge through the reviewed pull request.
5. Verify GitHub Pages serves the `v57.1.7` academic/runtime/teacher cache keys.
6. Publish the exact tested `firestore.rules` separately to Firebase project `dragonswood-9289e`.
7. Run controlled signed-in student/teacher production acceptance before final-grade use.

Code rollback and rules rollback are separate. Revert the promotion commit through normal Git history and restore the immediately prior Firebase rules version. Do not force-reset shared `main`, delete reading evidence, or convert historical records.

## Remaining work at this checkpoint

- Push the candidate as one reviewable commit.
- Open the pull request and obtain a green permanent V3.3 repair gate.
- Obtain explicit merge approval.
- After merge: verify Pages, publish the exact tested rules, and run controlled production acceptance.

Until those steps are complete, `main` remains the V57.1.6 live authority.
