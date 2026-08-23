# Dragonswood v56.11 — Tier 1 security and grade integrity

This cumulative patch is built on the undeployed v56.10 audit patch. It does not assume that v56.9 or v56.10 was deployed first.

## Locked decisions

- All audited security holes are closed rather than merely monitored.
- Missing work is a zero only when it is assigned, visible, past due, counted, and not excused.
- Retake grade: `(first attempt + best attempt) / 2`. One attempt remains unchanged.
- The same grade engine is used by the student and teacher portals.

## Security fixes

- Leaderboard rewards use one Firestore transaction for the ledger and Gold increment.
- Reading scores require a valid 0–100 accuracy consistent with correct/total.
- RPG purchases require the exact catalog price and the purchased item must match the inventory change and chosen class.
- Equipped RPG items must be owned.
- Hatches add exactly one valid new pet; prestige pets require Level 10 (`3600 XP`).
- Rare +25 boss finds are pending until the teacher approves them in Student Management.
- Leaderboard reward history is readable only by the teacher and receiving student.

## Gradebook fixes

- Added `dragonswood-gradebook-v5611.js` as the shared grading policy.
- Daily Quest uses individual records in `scores` so replays remain separate attempts.
- Curriculum Quest writes immutable attempt records to `curriculumAttempts`.
- Witches reading tests continue to use `scores` and now pass stronger rules validation.
- Teacher overrides and assignment settings are visible to the affected student grade summary.
- Future, hidden, unassigned, uncounted, and excused activities are excluded.
- Phoenix weekly keys no longer depend on the browser's local timezone.

## Required deployment

1. Upload the files from the GitHub package, preserving paths.
2. Publish the supplied `firestore.rules` separately in Firebase.
3. Hard-refresh and run the test checklist.

No Firebase Storage or R2 upload is required for v56.11.
