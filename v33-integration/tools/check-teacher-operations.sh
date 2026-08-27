#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
"$ROOT/tools/check-student-world.sh"
node "$ROOT/tools/test-teacher-operations.cjs"
node --check "$ROOT/js/integration/operations.js"
node --check "$ROOT/js/integration/narration.js"
node --check "$ROOT/tools/firebase-identity-gate.cjs"
rg -q 'hasNoOtherPendingExtraPass' "$ROOT/firestore.gate.rules"
rg -q 'reviewPass' "$ROOT/js/integration/runtime.js"
rg -q 'runPayroll' "$ROOT/js/integration/runtime.js"
rg -q 'DWNarrator' "$ROOT/js/integration/narration.js"
rg -q 'narration-manifest[.]js' "$ROOT/js/integration/narration.js"
if rg -n 'dragonswood-9289e' "$ROOT/firestore.gate.rules" "$ROOT/tools/teacher-operations-browser-gate.py" "$ROOT/js/integration/operations.js" "$ROOT/js/integration/narration.js"; then
  echo 'FAIL: production Firebase identifier leaked into the Teacher Operations gate files' >&2
  exit 1
fi
echo 'V3.3 Teacher Operations + Cedar static, dedupe, rewards, payroll, schedule, and inherited safety checks: PASS'
