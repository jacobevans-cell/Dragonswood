DRAGONSWOOD v28b — FEEDBACK FIXES

RECOGNITION REQUESTS
• Teacher portal keeps realtime listeners.
• Added a 5-second polling fallback so requests still appear if a snapshot listener stalls.
• Student requests include today's Phoenix date.

BATHROOM PASSES
• Same 3 automatic passes + approved extra pass system.
• Added permanent /bathroomVisits records.
• Teacher dashboard now shows TODAY'S BATHROOM HISTORY.
• History includes student, pass type, out time, return time, and duration.
• Student Return and teacher Mark Returned both close the visit record.
• Teacher portal also has a 5-second polling fallback for bathroom data.

eREADER
• A− / A+ remain.
• Zoom step reduced from 10% to 5%.
• Maximum enlargement reduced from 180% to 125%.
• Old stored zoom values above 125% are automatically reduced.
• Removed the extra margin calculation that was making the page blow up vertically.

IMPORTANT
Publish the included firestore.rules before testing the new bathroom history collection.

MOST IMPORTANT FILES TO REPLACE
• index.html
• teacher.html
• witches-reader.html
• firestore.rules
