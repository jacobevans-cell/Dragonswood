DRAGONSWOOD v28j — SNACK PASSES + FIRESTORE CLEANUP

SNACK PASS
• 2 automatic snack passes per student per school day.
• Student sees remaining passes live.
• USE SNACK PASS starts a live snack session.
• DONE WITH SNACK ends it.
• After 2 automatic passes, student gets REQUEST EXTRA SNACK PASS.
• Teacher can APPROVE or DENY.
• Approved extra passes are consumed only when used.
• Teacher sees live snack users, pending requests, and today's snack history.
• Snack history records start, end, duration, and automatic/approved-extra type.
• Teacher can MARK DONE.
• Snack activity/request produces a teacher notification sound/title alert.

FIRESTORE CLEANUP
• REMOVED the 5-second getDocs polling loop from teacher.html.
• Removed the redundant initial polling fetch.
• Removed focus/visibility polling fetches.
• bathroomStatus, bathroomRequests, snackStatus, snackRequests and pointRequests
  now use realtime onSnapshot listeners as the single source of truth.
• This dramatically reduces unnecessary Firestore document reads while keeping
  the teacher portal live.

IMPORTANT
Publish the included firestore.rules because snackStatus and snackRequests are new paths.

FILES CHANGED
• index.html
• teacher.html
• firestore.rules

All other files are the exact files from the current ZIP you supplied.
