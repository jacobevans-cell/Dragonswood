# Architecture — v1.5

```text
Dragonswood Arcade shell
  ├─ game registry
  ├─ shared profile / comfort preference
  ├─ leaderboard service
  ├─ Dragon Dash iframe
  ├─ Void Runner iframe
  └─ future games

Game → performance event → Arcade → best-score document
                                  ↓
                           leaderboard ranking
                                  ↓
                    reward eligibility (scheduled)
                                  ↓
                         teacher review only
```

## Game isolation

Games communicate to the parent through same-origin `postMessage` events on the `dragonswood-arcade` channel. The parent validates both message origin and iframe source before accepting score events.

## Progress

- Dragon Dash local/editor progress remains inside Dragon Dash.
- Void Runner keeps active progress in memory, persists it locally on a debounce, and optionally syncs owner-only progress to `voidRunnerPlayers/{uid}`.
- Game progress is deliberately separate from leaderboard data and reward eligibility.

## Leaderboards

Each player has at most one score document per board + period + period key. Firestore rules allow a student to replace that document only with an equal or better score. Daily, weekly, and all-time writes are submitted in parallel.

Scheduled functions:
- finalize weekday Top-N placements into one teacher-review eligibility record per student/day;
- archive weekly rankings;
- prune stale daily/weekly raw score rows while retaining all-time and archive/reward history.

## Offline / Three.js

The PWA caches the complete application shell and game modules. Void Runner requires Three.js; hosted builds vendor pinned `three@0.185.1` into the site's own `games/void-runner/vendor/` directory before publication. CDN imports remain emergency fallback only.
