DRAGONSWOOD v48.8 — JOB CHECK-OFF FIX

FIXED
- Students could create a weekly job record, but later daily check-offs could fail.
- The student page was re-sending job metadata during an update.
- Firestore correctly rejected those extra changed fields under the existing security rules.
- Existing weekly records now update ONLY checkedDays, completedCount, and updatedAt.
- New weekly records still save the full job snapshot.

RESULT
- Monday through Friday check-offs now work on the same weekly record.
- Existing job history/payroll structure remains intact.
- No Firestore rules change is required.
- Cosmic Architect and all v48.7 features remain included.
