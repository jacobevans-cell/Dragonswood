#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
node tools/test-student-passes.cjs
node tools/test-pass-safety-recovery.cjs
node tools/test-student-beta-release.cjs
node tools/test-reconnection-wave.cjs
node tools/test-repair-wave-03.cjs
node tools/test-curriculum-stability.cjs
node tools/test-stability-hall-profile-math.cjs
./tools/check-teacher-operations.sh
node ../functions-arcade-access/core-selftest.cjs
echo 'V3.3 consolidated student-beta static and inherited gates: PASS'
