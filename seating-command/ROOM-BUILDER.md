# Dragonswood Seating Command — Room Builder V2.3

- **Assign Students** moves student names between fixed desk IDs.
- **Edit Room** moves the physical desk geometry without changing the student identity attached to a desk.
- **Use My Classroom** loads the 24-desk Evans floor plan from the teacher-provided reference image.
- Room Builder supports drag, Shift+click multi-select, rotate, duplicate, delete-empty-desk, row/column alignment, even spacing, snap-to-grid, reference overlay, Undo, and Save Room.
- `Smart Arrange` continues to optimize student-to-desk assignments against the current saved furniture geometry. It does not move desks.
- Saved room geometry is stored as `roomLayout` in `classrooms/evans-4-5/seatingPlans/current`, so the existing teacher-only Firestore rule covers it.
