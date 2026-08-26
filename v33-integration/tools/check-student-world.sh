#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
"$ROOT/tools/check-academic-systems.sh"
node "$ROOT/tools/test-student-world.cjs"
rg -q 'dw-env.*emulator' "$ROOT/../adventurer-hall.html"
rg -q 'connectFirestoreEmulator' "$ROOT/../adventurer-hall.html"
rg -q 'connectFirestoreEmulator' "$ROOT/../boss-battle.html"
rg -q 'checkOffJob' "$ROOT/js/integration/runtime.js"
echo 'V3.3 Student World static, persistence, RPG, boss, leaderboard, and inherited safety checks: PASS'
