# Codespace one-command handoff

This is only needed because the connected GitHub integration refuses branch writes with HTTP 403.

From a Dragonswood Codespace, extract this candidate somewhere outside the repository (recommended: `/tmp/dwv33`) and run:

```bash
bash /tmp/dwv33/dragonswood-v33-integration-candidate/tools/install-into-dragonswood-repo.sh /workspaces/Dragonswood
```

The installer is intentionally guarded. It will:

1. refuse tracked/unrelated working-tree changes,
2. fetch and fast-forward `main`,
3. abort if `main` is not exactly `2258a321077a39ca71e36409d9bc6a1fb5bb3ecc`,
4. create `massive-v33-integration-safe-2258a321` from that exact production commit,
5. copy this candidate only into `v33-integration/`,
6. add a branch-only GitHub Actions gate,
7. run the Firebase Auth/Firestore emulator identity matrix,
8. run static, smoke, visual-freeze, and all 17 pixel checks,
9. commit only after every local gate passes,
10. push only `massive-v33-integration-safe-2258a321`.

It never commits to or pushes `main`.
