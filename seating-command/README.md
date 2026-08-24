# Dragonswood Seating Command

Production teacher-only seating workspace integrated into Dragonswood Teacher Command.

## What works in this prototype

- V3 teacher-command visual shell, with the seating tool positioned under Classroom Tools.
- Four room arrangements: Pods of 4, Groups of 3, Focus Rows, and Horseshoe.
- Live roster loaded from the Dragonswood `students` collection.
- Drag-and-drop seating plus click-two-seats-to-swap interaction for Chromebook/touch friendliness.
- Teacher-only rules: Keep Apart, Prefer Together, Front Zone, Door Side, and Lock Current Seat.
- Hard vs soft rules.
- Local Smart Arrange engine that generates and scores three candidate plans without sending student information to an external service.
- Quick Shuffle that preserves locked seats.
- Grade-balance, hard-rule, fresh-neighbor, and geometry insights.
- Student View that strips teacher rules/grades/private metadata and can flip orientation.
- Teacher-only Firestore save with an archived rollback snapshot.
- Six instructional-purpose presets, undo history, responsive UI, print styling, and reduced-motion support.

## Important safety boundary

This is a live-data teacher tool. It requires the authorized Dragonswood teacher account and the accompanying `firestore.rules` deployment. Saving changes the active seating plan and writes a history snapshot. Draft rearrangements remain local until **Save Plan** is confirmed.

## Run

Open it from the **Seating Command** tab in `teacher.html`. It may also be opened directly after signing in to Teacher Command.

Example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Firestore contract

- `classrooms/evans-4-5/seatingPlans/current`
- `classrooms/evans-4-5/seatingHistory/{historyId}`

Both paths are teacher-only. Student presentation mode is generated in the authenticated teacher browser and intentionally omits rule metadata.
