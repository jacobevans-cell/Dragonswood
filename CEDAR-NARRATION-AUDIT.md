# Cedar Narration Audit and Pilot

## Current narration surfaces

- `daily-quest.html`: one reusable dynamic academic-question Read Aloud surface. Pilot now routes through Cedar when a matching prerecorded manifest clip exists and otherwise uses browser speech.
- `witches-reader.html`: page-by-page reading narration and read-along controls. Full rollout target; not changed by the pilot.
- `spelling-practice.html`: spelling word and direction speech. Full rollout target.
- `fraction-forge.html`: math-coach speech. Full rollout target.
- `index.html`: pass reminders use speech for safety/behavior messaging. Excluded from Cedar academic narration.
- `q1-curriculum-data.js`: contains fixed academic lesson/read-aloud text but no shared audio player yet. This is the main source for the eventual fixed-content batch.

## Pilot files

- `cedar-narration.js`: one accessible player, one audio stream at a time, play/pause/restart/progress, four speeds, remembered speed, no autoplay, lifecycle stopping, loading/unavailable states, and browser fallback.
- `narration-manifest.js`: stable section-to-MP3 map with source hashes.
- `narration-jobs.json`: private batch job list and approved Cedar direction.
- `tools/generate-cedar-narration.mjs`: dry-run by default; paid generation requires both `--generate` and a private `OPENAI_API_KEY` environment variable.
- `daily-quest.html`: representative pilot integration.

## Paid-call gate

The approved Cedar sample MP3 was not present in the supplied workspace, so no sample audio was copied and no paid API request was made. The current job list contains **0 clips**, estimated **0.0 minutes**. Before full generation, populate the jobs from approved fixed sections, run the script without `--generate`, and report its clip count, duration estimate, and then-current official API price/cost for approval.

Missing audio never blocks a lesson; browser speech remains the fallback.
