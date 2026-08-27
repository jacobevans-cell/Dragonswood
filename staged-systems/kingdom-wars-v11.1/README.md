# Kingdom Wars V11.1 — deploy-stage bundle

This directory is an isolated, tester-only staging bundle. It is not linked from V3.3 and is not deployed.

It contains the hardened runtime and exactly the live art families used by the renderer. The archive-only PNG masters, dead `style-assets` tree, previews, references, and manifests remain preserved in the four-system master source package and are intentionally excluded from the future web payload.

The bundle expects its contents to be installed at the repository web root later (`kingdom-test.html` and `kingdom-wars/`). It must not be copied there until the V3.3 Firebase gate passes and the integration branch is ready for the Kingdom Wars route.

Run:

```bash
bash tools/verify-deploy-stage.sh
```

This checks JavaScript syntax, production behavior, V10 repair behavior, V11 real raids, all 902 live renderer asset paths, and the V11.1 adversarial core/persistence/access/runtime invariants.
