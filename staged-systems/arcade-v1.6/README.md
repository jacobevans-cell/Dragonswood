# Dragonswood Arcade

Expandable fantasy arcade shell containing Dragon Dash and Void Runner.

## Current master

**v1.5** is the current authoritative package. It preserves the verified v1.4 gameplay feature set and focuses on school-device reliability, offline/PWA readiness, identity correctness, performance, accessibility, and security hardening.

The arcade owns navigation, player identity, leaderboards, deployment, and the reward boundary. Individual games remain plug-ins and cannot directly grant Dragonswood rewards.

## Chromebook rollout
v1.6 adds Auto/Standard/Chromebook Low rendering, a `/device-check.html` diagnostic, a production preflight script, and a documented online→offline Chromebook gate. See `CHROMEBOOK-ROLLOUT-CHECKLIST.md`.
