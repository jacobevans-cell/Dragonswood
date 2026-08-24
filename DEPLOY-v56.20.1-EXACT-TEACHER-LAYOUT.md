# Dragonswood v56.20.1 — Exact Teacher Layout Correction

This patch replaces the v56.20 approximation with the layout measurements and
workflow hierarchy supplied in the exact teacher-portal handoff.

## Upload to GitHub

- `teacher.html`
- `dragonswood-teacher-command-background.webp` (only if it is not already live)

No Firestore rules, Firebase Storage, R2, narration, gradebook module, RPG
module, or pet registry changes are included.

## Required live checks

1. Sign in as the authorized teacher.
2. Confirm the compact top header, 208px sidebar, attention strip, scrollable
   Step 1 roster, Step 2 command tabs, two-column reward cards, and fixed review
   dock match the supplied reference at desktop width.
3. Select several students, switch tools, and confirm the selection persists.
4. Review and apply one harmless test reward, then verify its Firestore result.
5. Open every teacher destination and confirm the newest production controls
   remain present.
6. Check Chromebook, tablet, and phone widths before classroom use.

