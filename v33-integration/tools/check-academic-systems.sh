#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
"$ROOT/tools/check-stage-4.sh"
node "$ROOT/tools/test-academic-systems.cjs"
echo 'V3.3 Academic Systems static, grading, Scribe, gradebook, games, and inherited safety checks: PASS'
