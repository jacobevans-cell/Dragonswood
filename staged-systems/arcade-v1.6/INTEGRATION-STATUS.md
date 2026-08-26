# Arcade v1.6 integration status

This is the verified Arcade donor, staged only on the massive-integration safety branch.

- Both games and the Arcade shell are present.
- Three.js 0.185.1 is vendored locally for offline Void Runner use.
- `node scripts/preflight.mjs` passes with zero failures.
- Firebase remains disabled in this donor copy by design.
- No V3.3 route, Arcade Token wallet, access session, timer, or production write path has been added yet.
- Game performance remains report-only and cannot grant Gold, XP, class points, Arcade Tokens, pets, or other Dragonswood rewards.

The staged web root will ultimately be installed under `/arcade/`, preserving service-worker scope. Direct entry to `/arcade/`, Dragon Dash, and Void Runner must all pass the same server-authoritative access-session gate.
