DRAGONSWOOD v28f — ONE BOY + ONE GIRL BATHROOM LIMIT

NEW RULE
• Maximum 1 student in the Boys group out at a time.
• Maximum 1 student in the Girls group out at a time.
• Therefore maximum 2 students can be out through Dragonswood at once: one boy + one girl.

HOW IT WORKS
• Firestore has two tiny live slot documents:
    /bathroomSlots/boy
    /bathroomSlots/girl
• A student activates a pass with a Firestore TRANSACTION.
• The transaction checks the group's slot and claims it atomically.
• If another student from that same group already owns the slot, the transaction fails.
• Their bathroom pass is NOT consumed.
• Student sees:
  "Another boy/girl is already out. Your bathroom pass was NOT used."
• When the student taps I AM BACK IN CLASS, their slot is released.
• Teacher MARK RETURNED also releases the correct slot.
• Girls and boys have independent slots, so one of each may be out simultaneously.

IMPORTANT
This version DOES require the included firestore.rules to be published because
/bathroomSlots is a new Firestore path with security rules.

FILES CHANGED
• index.html
• teacher.html
• firestore.rules

Everything from v28e is preserved:
• checkbox student selection
• positive/negative sounds
• automatic bathroom teacher alert
• recognition requests
• bathroom history
• class goal wiring
• eReader improvements
