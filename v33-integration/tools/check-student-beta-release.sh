#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
node tools/test-student-passes.cjs
node tools/test-student-beta-release.cjs
./tools/check-teacher-operations.sh
node ../functions-arcade-access/core-selftest.cjs
echo 'V3.3 consolidated student-beta static and inherited gates: PASS'
