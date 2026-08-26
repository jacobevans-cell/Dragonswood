# Dragonswood Arcade v1.5 — Reliability, Accessibility, and Inspection Repair Pass

This pass implements the full actionable repair list from Claude's v1.4 critical inspection without changing the core game reward boundary.

## Deployment and offline reliability
- GitHub Pages and Firebase predeploy now automatically vendor pinned `three@0.185.1` into Void Runner.
- The vendor step copies both `three.module.js` and `three.core.js`; CDN fallbacks remain only as emergency fallback.
- Service-worker cache bumped to `dragonswood-arcade-v6` and expanded to include all static module dependencies, admin assets, game icons, PWA icons, runtime config, cloud sync, and game assets.
- Service-worker install tolerates an absent optional local Three.js copy before the vendor step, avoiding a broken worker install.
- Added valid 192×192 and 512×512 PNG PWA icons plus a separately padded 512×512 maskable icon.
- Firebase Functions runtime moved from Node 20 to Node 22.
- Removed Void Runner's dead game-local service-worker registration.

## Identity and leaderboard correctness
- URL-supplied student names are capped to 32 characters before persistence/submission.
- URL-supplied `studentId`/`uid` is now persisted and capped to 100 characters.
- Legitimate score `0` is accepted.
- Cloud score writes are submitted in parallel without redundant pre-read round trips; server rules remain the authority for best-score-only enforcement.
- Configured `leaderboard.topN` is now honored by the shell.
- Local leaderboard data prunes old daily and weekly periods.
- New scheduled Firestore retention prunes stale daily/weekly score documents while preserving all-time records, reward eligibility, and weekly archives.
- Champion's Choice semantics are now explicit: first place on any board makes that student Champion's Choice eligible for the day, while multiple placements still collapse into one teacher-reviewed eligibility record per student/day.

## Performance
- Void Runner progress now lives in memory during play.
- localStorage writes are debounced and flushed on page hide/visibility changes rather than running on every shard pickup.
- Cloud sync debounce now snapshots only when it actually flushes instead of serializing the entire progress object on every pickup.

## Accessibility and classroom comfort
- Added visible `:focus-visible` outlines across the shell, teacher review, Dragon Dash, and Void Runner.
- Added shared Arcade Comfort Mode, persisted per browser and passed into games.
- Both games honor the device's `prefers-reduced-motion` preference when no explicit setting exists.
- Dragon Dash Comfort Mode disables screen shake and reduces parallax, pulsing, portal motion, and fast wing motion.
- Void Runner Comfort Mode slows tunnel rotation and removes rapid fragile-panel wobble and low-power flicker.
- Added a dedicated Void Runner Settings screen with Comfort Mode.

## Security / hardening
- Dragon Dash custom music now requires a valid HTTPS URL and supports an optional host allowlist in `arcade-config.js`.
- Editor metadata lengths are bounded and level card metadata is HTML-escaped before rendering.
- Custom-music UI explicitly states that only owned/licensed audio should be used.
- Teacher auth now uses redirect-based Google sign-in rather than popup auth.
- Teacher replacement notes now use an accessible dialog instead of `prompt()`.
- Removed the global `_arcadeAuth` leak.

## Preserved
- Both games' core mechanics and controls.
- Performance-only game → arcade messaging boundary.
- No direct game rewards or class-point writes.
- Firestore best-score monotonic rule.
- Teacher approval / replacement / revocation workflow.
- v1.2 → v1.3 Void Runner progress migration and existing player saves.
