# 08 — Do Not Do List

- Do not redesign V3.3 during functionality integration.
- Do not start from an old production ZIP when newer `main` exists.
- Do not overwrite live `index.html` or `teacher.html` early.
- Do not work directly on `main` as the integration sandbox.
- Do not replace a working production subsystem with a simplified mock.
- Do not remove existing assets/features because the tester did not include them.
- Do not change Firestore field contracts casually.
- Do not perform destructive data migrations in the initial release.
- Do not ship rule changes without testing student and teacher roles.
- Do not overwrite shared CSS/JS with incompatible versions while old live HTML may still reference them.
- Do not promote before rollback is prepared.
- Do not force-reset shared `main` as the normal rollback strategy.
- Do not debug a classroom-blocking production failure indefinitely; revert first, diagnose afterward.
- Do not claim production parity until every subsystem has been inventoried and tested.
