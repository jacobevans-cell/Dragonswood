# Dragonswood Arcade v1.6 — Chromebook Rollout Pass

This pass intentionally adds no new gameplay systems. It prepares v1.5 for classroom rollout on managed Chromebooks.

## Added
- Shared **Auto / Standard / Chromebook Low** performance setting.
- Void Runner hardware-hint selection and live FPS downgrade when Auto cannot sustain roughly 42 FPS.
- Chromebook Low reduces only render workload: pixel ratio, star count, and tunnel draw distance. Gameplay geometry, physics, scoring, levels, and leaderboard events are unchanged.
- Dragon Dash disables optional particles automatically on low-spec Auto/Chromebook Low devices.
- Friendly Void Runner WebGL/3D startup failure screen with a direct Device Check link.
- `/device-check.html` rollout diagnostic page for student Chromebooks.
- Production `scripts/preflight.mjs` validation gate.
- GitHub Pages and Firebase deployment now run preflight after Three.js vendoring.
- Service-worker cache bumped to v7 and includes Device Check.

## Rollout rule
Do not declare a classroom rollout complete until one representative managed student Chromebook passes `/device-check.html`, launches both games online, reloads once, then launches both games with Wi‑Fi disabled.
