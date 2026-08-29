#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

node academic-grading-selftest.cjs
node curriculum-pacing-selftest.cjs
node grading-hardening-selftest.cjs
node legacy-retirement-selftest.cjs
node v57-improvements-selftest.cjs
node tools/check-parse.mjs
node tools/check-firestore-coverage.mjs
python seating-command/verify.py
(cd v33-integration && ./tools/check-stage-2-3.sh)
bash tools/massive-integration/run-integrated-kingdom-gate.sh
bash tools/massive-integration/run-integrated-math-grayson-gate.sh
node functions-arcade-access/core-selftest.cjs
node tools/massive-integration/verify-integrated-arcade.cjs

echo 'Massive integration pre-emulator suite: PASS'
