# Dragonswood Current System

## Production authority

- Student portal: `/index.html` → V3.3 application
- Teacher portal: `/teacher.html` → V3.3 Teacher Command
- Teacher Gradebook: `/teacher.html#gradebook`
- Academic model: `js/integration/academic.js`
- Production controller: `js/integration/runtime.js`
- Teacher interface: `js/teacher-app.js`
- Current Gradebook presentation: `styles/gradebook-v57.1.8.css`
- Firestore policy: `/firestore.rules`

V3 is the only supported portal. The old V2 entry pages, duplicate tester package,
staged donor systems, and pre-launch package reference were removed in V57.1.8.
Recovery is through Git history and the named pre-release rollback branch, not by
shipping a second portal beside production.

## Gradebook contract

The V57.1.8 Gradebook uses the wide collapsible scholar-card presentation from
the former portal while retaining the V57.1.7 evidence-safe V3 model. It supports
name search, grade/group filters, category sorting, per-scholar assignment detail,
date-specific Witches targets, evidence status, and guarded CSV export.

The removed V2 score/status override editor was not copied into V3 because it
could bypass the current evidence-integrity calculation. Witches percentages and
statuses remain derived from verified reader evidence.

## Test surfaces

- Local/manual preview: `/v33-integration/manual-preview.html`
- Isolated student fixture: `/v33-integration/student-test.html`
- Isolated teacher fixture: `/v33-integration/teacher-test.html`
- Complete release gate: `bash v33-integration/tools/run-student-beta-gate.sh`
- Fast static gate: `bash v33-integration/tools/check-student-beta-release.sh`
- Cross-system pre-gate: `bash tools/massive-integration/run-pre-gate-suite.sh`

The Kingdom, Math/Grayson, and Arcade gates execute against their production
runtime directories. No staged donor clone is required.

## Protected files

The 31 approved V3 CSS/art files remain hash-frozen by
`tools/verify_visual_freeze.py`. The Gradebook redesign is isolated in the
non-frozen `styles/` directory and does not change the approved visual fixtures.
