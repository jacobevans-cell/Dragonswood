DRAGONSWOOD v45 — COLLAPSED PASS HISTORY + PERSISTENT ARCHIVE

DISPLAY
• Bathroom history shows only the 5 newest visits.
• Snack history shows only the 5 newest visits.
• Older same-day entries are placed under a SHOW OLDER dropdown.
• Added a Stored Pass Archive card with:
  Today / Yesterday / Last 7 Days / Last 30 Days / All Stored.
• The archive itself also shows 5 first and collapses the rest.

PERSISTENT DATA
Previous versions stored visits inside each student's current status document.
Those visit arrays reset when the student starts using that pass type on a new day.
That meant yesterday's data was NOT guaranteed to survive.

v45 creates passHistory/{visitId}.
New Bathroom, Snack, Out of Seat, and Office passes are archived as separate Firestore documents
and updated when the student returns. This makes future historical reporting reliable.

OLD DATA
This cannot restore visits already overwritten before v45.
Some yesterday data may still be present in a student's status document if they have not used
that pass type again today, but only new v45 records are guaranteed to persist.

FIRESTORE
Publish the included firestore.rules. passHistory is a new collection.
