# Dragonswood v55 Deployment Audit

Audit date: 2026-08-22

## Scope

This is a continuation of the v54 candidate. It does not redesign the portal or replace the stable-ID question engine. The work implements the supplied `CHATGPT-WORK-ORDERS.md` against the v54 source and preserves the existing 2× video playback rule while requiring complete content coverage.

## Implemented

- Migrated curriculum evidence to one canonical `curriculumProgress/{uid}_{itemId}` record per student and item.
- Added safe legacy migration; legacy `verified` values are never trusted or promoted.
- Restricted teacher verification to teacher writes and added a teacher scholar selector.
- Added standards mastery reporting by student and standard.
- Closed score ownership, progress-shape, and test-account rule gaps.
- Added teacher-managed `testerAccounts/{uid}` access without broadening normal student access.
- Replaced raw pacing-guide prose with student-facing task directions and stronger written-evidence checks.
- Added Video Check and Practice grouping for video missions.
- Expanded Morning Work to 35 real questions, retry-once skill remediation, next-day reteach weighting, active/idle timing, and per-skill mastery evidence.
- Added numeric free response, short text response, and accessible ordering interactions alongside multiple choice.

## Automated verification results

| Check | Result |
|---|---:|
| Curriculum items | 743 |
| Curriculum items mapped | 743 |
| Items with explicit standards | 680 |
| Auto-generated curriculum questions | 3,972 |
| Invalid generated curriculum questions | 0 |
| Legacy curriculum fallbacks | 0 |
| Teacher-verification items | 387 |
| Unexpected items with no valid completion path | 0 |
| Baseline shipped question walk | 5,040 |
| Baseline repeats | 42 (0.83%) |
| 35-question Grade 4 walk | 7,740 |
| 35-question Grade 4 repeats | 2 (0.03%) |
| Independently recomputed math in 35-question walk | 1,073 / 1,073 correct |
| HTML inline-script parse failures | 0 |
| External JS parse failures | 0 |
| Missing literal local assets | 0 |
| Firestore rule delimiter mismatches | 0 |
| Uploaded DOCX ZIP-integrity failures | 0 / 9 |

Dynamic template URLs reported by the static reference scanner were reviewed and are not missing local files.

## Security notes

- The Firebase web configuration in client HTML is intentionally public client configuration, not an administrative credential.
- No OpenAI secret value, service-account JSON, or private key was found in the deployment source.
- Firebase Emulator rule tests were not run in this workspace because the Firebase CLI is not installed. Rules received structural and manual path/ownership review; emulator tests remain a required pre-live gate.

## Live deployment gate

No GitHub or Firebase mutation is included in this audit. Before live release:

1. Run Firestore emulator allow/deny tests for student, teacher, tester, and unauthenticated roles.
2. Deploy rules, then hosting, to the intended Firebase project.
3. Smoke-test one student curriculum item, one teacher verification, one tester login, and one 35-question Morning Work session.
4. Tag or preserve the preceding production version for rollback.

