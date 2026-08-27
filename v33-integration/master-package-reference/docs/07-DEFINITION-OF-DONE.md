# 07 — Definition of Done

The integration phase is complete only when all of the following are true.

## Functional parity

- [ ] Current production functionality has been inventoried.
- [ ] Required production functionality is present in the V3.3 candidate.
- [ ] No production feature was silently dropped because it was inconvenient to place.
- [ ] Mock-only tester actions have been replaced with real behavior where appropriate.

## Data safety

- [ ] Existing student records load correctly.
- [ ] Existing student progress is preserved.
- [ ] Existing teacher records/settings load correctly.
- [ ] New fields have safe defaults.
- [ ] No destructive migration is required for initial load.
- [ ] Writes target the correct documents and occur exactly as intended.

## Visual fidelity

- [ ] V3.3 major geometry unchanged.
- [ ] Approved materials/backgrounds/art placement unchanged.
- [ ] All 8 student pages visually reviewed.
- [ ] All 9 teacher pages visually reviewed.
- [ ] Target student device sizes reviewed.

## Security

- [ ] Auth roles correct.
- [ ] Firestore rules audited.
- [ ] Student permissions correct.
- [ ] Teacher permissions correct.

## Reliability

- [ ] No required script/asset 404s.
- [ ] No release-blocking console errors.
- [ ] Critical flows have smoke tests.
- [ ] Production cache/versioning strategy is safe.

## Release safety

- [ ] Pre-release known-good SHA recorded.
- [ ] Immutable safety tag/reference prepared.
- [ ] Promotion commit/merge is identifiable.
- [ ] Rollback command is prewritten using that exact SHA.
- [ ] Live post-release smoke-test checklist ready.

## Promotion

Only after all gates pass should V3.3 be promoted to production.
