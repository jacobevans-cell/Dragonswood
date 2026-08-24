# Dragonswood v56.21 Student Portal V2 — Deployment

## Status

GitHub-ready integration candidate. Static checks pass. Complete the live
Firebase-account and responsive checklist in
`QA-STUDENT-PORTAL-v2-INTEGRATION.md` before treating it as production-finished.

## GitHub files

Upload/commit these files at repository root, preserving names:

- `index.html`
- `adventurer-hall.html`
- `boss-battle.html`
- `dragonswood-student-redesign-v2.css`
- `dragonswood-subpage-shell-v2.js`
- `STUDENT-PORTAL-v2-MIGRATION-INVENTORY.md`
- `QA-STUDENT-PORTAL-v2-INTEGRATION.md`
- `DEPLOY-v56.21-STUDENT-PORTAL-V2.md`

Suggested Codespaces commands after extracting the ZIP at repository root:

```bash
git add index.html adventurer-hall.html boss-battle.html \
  dragonswood-student-redesign-v2.css dragonswood-subpage-shell-v2.js \
  STUDENT-PORTAL-v2-MIGRATION-INVENTORY.md \
  QA-STUDENT-PORTAL-v2-INTEGRATION.md \
  DEPLOY-v56.21-STUDENT-PORTAL-V2.md

git commit -m "Integrate approved V2 student portal layout"
git pull --rebase origin main
git push origin main
```

## Firebase / R2 / Storage

- Firestore rules: **no change in this package**.
- Firebase Storage rules/files: **no change**.
- Cloudflare R2: **no change**.
- Firebase Hosting configuration: **no change**.

This is a presentation-layer transplant using existing production data,
transactions, asset paths, and narration files. Only GitHub files are included.

## Rollback

The functional baseline before this migration is GitHub commit
`4f40c53b8163387aa1dd90238471a4ec159a2370`.

Do not restore the entire repository to that commit if newer work exists.
Instead, revert the single v56.21 commit or restore only the eight files listed
above from the immediately previous commit.
