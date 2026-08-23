# Dragonswood v56.6 deployment

This package uses the complete v56.5 deployment as its base and makes one
student-navigation change: Guild Jobs are fully absorbed into Daily Missions.

## Changed behavior

- The standalone student `JOBS` navigation tab and page are removed.
- The bottom of `DAILY MISSIONS` now shows the student's assigned job,
  responsibility, weekly salary, Monday-Friday completion, payroll status, and
  the live `CHECK OFF TODAY'S JOB` button.
- Students can check off only the current Arizona school weekday, exactly once.
- Automatic payroll is unchanged: 4/5 days earns 80%; 5/5 earns full salary.
- Teacher job assignments, teacher progress monitoring, and payroll controls are
  unchanged.

## Deployment

Upload the full contents of this ZIP to the repository root, preserving folders.
Publish the included `firestore.rules` if the v56.5 rules have not already been
published. No new Firestore rule change was required for v56.6.

Hard-refresh the student portal after GitHub Pages finishes deploying.
