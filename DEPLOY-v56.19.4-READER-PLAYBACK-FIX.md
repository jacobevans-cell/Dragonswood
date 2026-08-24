# Dragonswood v56.19.4 — Reader Playback Fix

## Fixed

- `Read this page` no longer sends one oversized block to browser speech.
- Long content is read as a continuous queue of short sentence-sized chunks.
- The reader reliably starts, continues, pauses, resumes, and replays long text.
- On The Witches eReader, the universal reader now reads only the selected book page.
- The Witches header, toolbar, footer, and other interface labels are no longer substituted for the book text.
- The existing page-specific `Read Page` control remains available.

## Deploy

Unzip at the GitHub repository root and commit the two changed code files plus this note.

No Firestore, Firebase Storage, or R2 changes are required.

## Test

1. Hard-refresh after GitHub Pages finishes deploying.
2. Open The Witches eReader and choose a page.
3. Open `READ ALOUD`, choose Lewis, and press `Read this page`.
4. Confirm narration starts with the selected page's book text, not interface headings.
5. Confirm it continues beyond the first sentence.
6. Test Pause, Resume, Restart, and a different voice.
7. Test `Read this page` on Home or another student page.
