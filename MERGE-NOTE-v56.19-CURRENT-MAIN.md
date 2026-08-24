# v56.19 Current-Main Merge Note

- Authoritative repository: `jacobevans-cell/Dragonswood`
- Authoritative base commit: `070298b`
- Claude's current `index.html` optimization/design changes were preserved.
- Every unrelated file from the current repository remains unchanged.
- The narration merge is limited to five student pages, the narration runtime/manifest/private tools/audio, and the narrow `narrationVoice` Firestore allowance.
- Repository parse check: 69 scripts checked, 0 failed.
- Narration manifest: 4 voices, 1 four-voice pilot section, no missing pilot MP3s.

## Existing Firestore audit warning

The repository's existing `tools/check-firestore-coverage.mjs` reports missing rule blocks for these pre-existing collections:

- `curriculumAttempts`
- `gradebookAssignments`
- `gradebookGrades`
- `leaderboardRewards`
- `physicalPrizeDrops`

Those unrelated rules were not invented or broadened inside this narration patch. They require a separate security/data-flow review against the actual writers before publication.

