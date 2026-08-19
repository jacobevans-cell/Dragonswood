DRAGONSWOOD v44 — PASS RETURN FIX

CAUSE
Bathroom and Snack had dedicated return/done buttons and teacher handlers.
Out of Seat and Office were being stored correctly, but the teacher live panel only displayed them.
There was no teacher-side MARK RETURNED action for those generic passes, and the student interface
made ending multiple active generic passes awkward.

FIX
• Teacher Pass Center now shows MARK RETURNED for every active Out of Seat / Office pass.
• Student Pass Center now shows a separate ACTIVE PASSES return area.
• Students can end Out of Seat and Office directly, regardless of which pass is selected in the dropdown.
• Generic pass return history stores end time and duration.
• Bathroom and Snack behavior remains unchanged.
• No Firestore rules change required.

NOTE
This version still permits a student to have more than one pass type active simultaneously.
That behavior was not changed in this fix.
