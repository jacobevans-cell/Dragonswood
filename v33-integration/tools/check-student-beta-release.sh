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
node tools/test-teacher-portal-repair.cjs
node tools/test-teacher-portal-live-evidence.cjs
node tools/test-teacher-daily-use-repair.cjs
node tools/test-grade-evidence-hardening.cjs
node tools/test-gradebook-card-layout.cjs
node tools/test-v3-legacy-tool-migration.cjs
./tools/check-teacher-operations.sh
node ../functions-arcade-access/core-selftest.cjs
echo 'V3.3 consolidated student-beta static and inherited gates: PASS'
