# V3.3 Consolidated Student-Beta Launch

## Approved scope

The final V3.3 student and teacher preview is approved. This launch promotes
that shell for Explore Academy students while keeping critical data behavior
behind production Firestore rules and authoritative Firebase Functions.

Students may help find minor wording, spacing, navigation, or game-flow issues.
Authentication, identity isolation, grading, passes, reward caps, payroll
deduplication, and data loss are release blockers and are tested before the
root cutover.

## Cutover

- `index.html` becomes the V3.3 student portal.
- `teacher.html` becomes the V3.3 teacher portal.
- `student-v2.html` and `teacher-v2.html` preserve the pre-launch portals.
- Firebase Academic AI and Arcade Access Functions are deployed from their
  named codebases.
- The exact root `firestore.rules` and Arcade indexes are deployed; emulator
  gate rules are never referenced by the release config.
- Kingdom Wars is a clearly labeled, browser-local student beta gated by
  Explore Academy authentication and completed Morning Work.

## Automatic safeguards

The installer refuses a wrong branch, moved checkpoint, changed `main`, dirty
tree, wrong payload checksum, missing dependency, failed production-rules
test, changed preview pixel, failed backend deployment, or failed GitHub push.
It creates and pushes a rollback tag before promotion. If GitHub Pages does not
show the V3.3 release marker after the main-branch push, it reverts the single
promotion merge and pushes the rollback automatically.

## Manual rollback after a successful launch

The launch output records the promotion merge SHA and rollback tag. To restore
the previous root later, revert that one merge on `main` and push it. Do not
reset or force-push `main`.
