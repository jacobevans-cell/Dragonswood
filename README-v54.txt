DRAGONSWOOD v54 — DEPLOYMENT CANDIDATE
Built and audited: 2026-08-22

PURPOSE
This release finishes the four-level Morning Work structure and extends the
existing Curriculum Quest activity system without redesigning either page.

MORNING WORK TRACKS
  foundation  Display: FOUNDATION  Grade 3 prerequisite spiral
  4           Display: 4TH GRADE   On-level fourth-grade spiral
  5           Display: 5TH GRADE   On-level fifth-grade spiral
  challenge   Display: CHALLENGE   Early–mid sixth-grade enrichment

Foundation uses Grade 3 packet pages in this 180-day order:
August–March, all 22 lesson pages per month (176 days), then April lessons 1–4.
The source packet/month/lesson/page is stored on every generated day. The word
"struggle" is not used as a student-facing or internal track label.

CURRICULUM QUEST
Curriculum Quest remains tied to Explore Academy's Q1 pacing and video map.
Each non-observation mission now receives six deterministic, standard-linked,
auto-graded questions, followed by the existing written/application activity.
Teacher Verify is required only for Science, Writing, or observation/performance
work. No Curriculum Quest drag-and-drop type was added.

PROGRESS SAFETY
Local progress remains the immediate/offline cache. On an authenticated student
session, local and Firestore progress are merged so existing Day 14 work is not
discarded. The merged state is mirrored to curriculumQuestProgress/{studentId}.

DEPLOYMENT
Upload all files together. The new required browser assets are:
  foundation-track.js
  curriculum-question-engine.js

Firestore rules also changed. Deploy firestore.rules together with the hosting
files or Curriculum Quest will continue locally but cloud progress sync will be
denied. This ZIP has not been pushed to GitHub or deployed to Firebase.

VERIFICATION SUMMARY
  Foundation: 180 days, 7,200 questions, 33 skills, 0 legacy, 0 malformed
  4th:        5,040 questions, 0 legacy/invalid, 861/861 recomputed math
  5th:        5,760 questions, 0 legacy/invalid, 611/611 recomputed math
  Challenge:  5,760 questions, 0 legacy/invalid, 396/396 recomputed math
  Curriculum: 743 missions, 3,972 auto questions, 81 observation-only,
              0 empty non-observation, 0 legacy, 0 malformed, 0 unplanned

See V54-AUDIT.md for findings, caveats, and deployment boundaries.
