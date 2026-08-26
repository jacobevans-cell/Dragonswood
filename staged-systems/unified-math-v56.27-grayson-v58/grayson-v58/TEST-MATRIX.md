# Grayson v58 Test Matrix

Automated generator tests cover:
- Math Operations, Division, Fractions, Decimals
- Science Chemistry and Astronomy
- ELA Language, Reading, Writing
- History / Social Studies
- Grades 7, 8, 9, 10
- Primary/current-topic and cross-subject lanes
- Four unique choices and correct-answer inclusion
- prerequisite lesson + prompt + worked explanation
- Math → Science and Science → Math crossing
- current-context detection samples for Daily Quest, Curriculum Quest, Math Operations, and Cosmic Architect
- Grade 7→8→9→10 cycle
- Give Up / Skip button
- every-third cross-subject cadence
- reward-free engine contract

Manual smoke test after deploy:
1. Daily Quest Math problem → Grayson label should match Math/current topic.
2. Daily Quest Science problem → close/reopen or press New until current-topic challenge; label should match Science.
3. Curriculum ELA/Reading activity → label should show ELA/Reading.
4. Math Operations Division selected → current-topic Grayson should show Math/Division.
5. Elemental Laboratory → current-topic should show Science/Chemistry.
6. Third Grayson challenge on Math page should be Cross-Subject Science.
7. Third Grayson challenge on Science page should be Cross-Subject Math.
8. Press GIVE UP / SKIP → NEXT: immediately loads next challenge and increments Skipped only.
9. Exit Grayson: no XP, Gold, grades, or base-game progress changes.
