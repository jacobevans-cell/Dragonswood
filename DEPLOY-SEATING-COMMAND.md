# Dragonswood Seating Command deployment

Built from GitHub main commit `0fc853f`.

## Files

- Replace `teacher.html` with the included version.
- Add the entire `seating-command/` folder.
- Replace `firestore.rules` with the included version.

## Deploy

```bash
firebase deploy --only firestore:rules
git add teacher.html firestore.rules seating-command DEPLOY-SEATING-COMMAND.md
git commit -m "Add teacher Seating Command"
git pull --rebase origin main
git push origin main
```

The Firestore rules deployment is required. Without it, the page can load the roster but cannot load or save seating plans.

## Verify live

1. Sign in at `teacher.html` with the authorized teacher account.
2. Open **Seating Command**.
3. Confirm the live roster appears.
4. Move two students, add a temporary rule, and use Undo.
5. Generate Smart Arrange candidates; preview must not alter the working plan.
6. Save an approved plan and reload the page.
7. Open Student View and verify that grades, locks, rules, and private details are absent.
8. Check desktop/Chromebook, tablet, print preview, and a touch device.

## Data paths

- Active plan: `classrooms/evans-4-5/seatingPlans/current`
- Rollback snapshots: `classrooms/evans-4-5/seatingHistory/{historyId}`

Both paths are teacher-only under `firestore.rules`.
