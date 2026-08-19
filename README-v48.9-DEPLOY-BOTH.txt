DRAGONSWOOD v48.9 — COSMIC + JOB CHECKOFF FIX

SCIENCE
Cosmic Architect is confirmed in the Science section between Elemental Laboratory and Arcane Forge.
cosmic-architect.html is included.

JOBS
Student checkoff now updates only checkedDays and completedCount.
The included Firestore rules support legacy weekly job records while still limiting a student to their own UID-prefixed job-week document.

DEPLOYMENT
1. Upload ALL files from this package to GitHub. index.html must be replaced, not just cosmic-architect.html.
2. Publish the included firestore.rules in Firebase.
3. After GitHub Pages finishes deploying, hard refresh the student page with Ctrl+Shift+R.
