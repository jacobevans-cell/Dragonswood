# Dragonswood v56.19.3 — Universal Reader

## Included

- Fixes the Profile modal so the Dragonswood header cannot cover it.
- Adds a persistent `READ ALOUD` launcher to every live student experience.
- Keeps Lewis, Liam, Bella, Alex, and Automatic available everywhere.
- Remembers the selected voice and speed across pages.
- Adds `Read this page` and `Read selected text` actions.
- Excludes navigation, buttons, form controls, answer choices, hidden content, and teacher-only content from whole-page reading.
- Keeps existing lesson-specific narration buttons working.
- Uses matching prerecorded MP3s when present and browser speech as a nonblocking fallback.

## GitHub deployment

Unzip at the repository root, preserving paths. Then commit every extracted file.

No Firestore, Firebase Storage, or R2 changes are required for this universal-reader patch.

## Important voice-generation note

Kokoro generated Lewis, Liam, and Bella successfully. The installed Kokoro model does not contain `em_alex`, so it cannot generate the approved Alex Spanish voice. The supplied Alex pilot remains usable. Full prerecorded Alex coverage requires a Spanish-capable local TTS generator; this patch does not mislabel another voice as Alex.

## QA

1. Open Home and Profile; confirm Profile is above the header and scrolls normally.
2. Press `READ ALOUD` on every student page.
3. Confirm five choices: Automatic plus Lewis, Liam, Bella, and Alex.
4. Change voices and pages; confirm the preference remains selected.
5. Test `Read this page` and highlighted `Read selected text`.
6. Confirm Pause, Resume, Restart, speed, and close work.
7. Confirm narration stops when leaving the page.
8. Confirm missing recordings fall back without blocking student work.
