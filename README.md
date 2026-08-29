# Dragonswood

Dragonswood is the live Explore Academy student and teacher portal.

## Current production entries

- Student: `index.html`
- Teacher: `teacher.html`
- Gradebook: `teacher.html#gradebook`
- Firebase rules: `firestore.rules`

Both entry pages load the V3.3 application from `v33-integration/`. V3 is the
only supported portal; retired V2 pages and duplicate donor/test packages are
kept in Git history and the pre-release rollback branch instead of production.

## Current Gradebook

V57.1.8 brings the former portal's readable wide scholar cards and expandable
assignment rows into the live V3 Teacher Command. The underlying V57.1.7 model
still controls evidence-safe Witches grading, provisional statuses, date-specific
targets, and guarded percentage export.

See `v33-integration/docs/CURRENT-SYSTEM.md` for the authoritative file map,
testing commands, and cleanup boundary.

## Verification

Fast current-system checks:

```bash
bash v33-integration/tools/check-student-beta-release.sh
```

Cross-system pre-gate:

```bash
bash tools/massive-integration/run-pre-gate-suite.sh
```

Complete Firebase emulator, authenticated browser, parser, security, and visual
release gate:

```bash
bash v33-integration/tools/run-student-beta-gate.sh
```

Production promotion must use a reviewed pull request and preserve the named
rollback branch. Do not deploy a historical ZIP or restore a second portal.
