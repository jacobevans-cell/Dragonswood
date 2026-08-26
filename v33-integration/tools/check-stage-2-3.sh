#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

node --check "$ROOT/js/integration/core.js"
node --check "$ROOT/js/integration/runtime.js"
node --check "$ROOT/js/integration/modules.js"
node --check "$ROOT/js/integration/kingdom-portal.js"
node --check "$ROOT/js/integration/arcade-portal.js"
node --check "$ROOT/js/integration/arcade-teacher.js"
node --check "$ROOT/js/student-app.js"
node --check "$ROOT/js/teacher-app.js"
node --check "$ROOT/tools/firebase-identity-gate.cjs"
node "$ROOT/tools/test-integration-core.cjs"
node "$ROOT/tools/test-module-host.cjs"
node "$ROOT/tools/render-smoke.cjs"
python "$ROOT/tools/verify_visual_freeze.py"

if rg -n 'setDoc|addDoc|updateDoc|deleteDoc|writeBatch|runTransaction|increment|serverTimestamp' "$ROOT/js/integration"; then
  echo 'FAIL: write primitive found in Stage 2–3 integration runtime' >&2
  exit 1
fi

if rg -n 'DWV33_VISUAL_TEST_MODE|integrationIsFixture|visual-student|visual-teacher|visual-test-only' \
  "$ROOT/student-test.html" "$ROOT/teacher-test.html" \
  "$ROOT/js/integration" "$ROOT/js/student-app.js" "$ROOT/js/teacher-app.js"; then
  echo 'FAIL: visual-test identity or bypass leaked into production-loaded files' >&2
  exit 1
fi

python - "$ROOT/js/integration/runtime.js" <<'PY'
from pathlib import Path
import re, sys
text=Path(sys.argv[1]).read_text()
m=re.search(r"const EMULATOR_FIREBASE_CONFIG=Object\.freeze\((\{.*?\})\);",text)
if not m:
    raise SystemExit('FAIL: emulator Firebase config not found')
block=m.group(1)
if 'demo-dragonswood-v33' not in block:
    raise SystemExit('FAIL: emulator config is not pinned to demo-dragonswood-v33')
if 'dragonswood-9289e' in block:
    raise SystemExit('FAIL: production project leaked into emulator Firebase config')
if "environment==='emulator'?EMULATOR_FIREBASE_CONFIG:PRODUCTION_FIREBASE_CONFIG" not in text:
    raise SystemExit('FAIL: Firebase config selection is not explicitly environment-gated')
print('Emulator project isolation check: PASS')
PY

if ! rg -q 'allow update, delete: if false' "$ROOT/firestore.gate.rules"; then
  echo 'FAIL: emulator gate rules are not explicitly read-only for seeded records' >&2
  exit 1
fi
if ! rg -q "request.auth == null && request.resource.data.__gateSeed == true" "$ROOT/firestore.gate.rules"; then
  echo 'FAIL: emulator seed exception is not limited to unauthenticated fictional gate seeding' >&2
  exit 1
fi

if rg -n 'dragonswood-9289e' "$ROOT/firestore.gate.rules" "$ROOT/firebase.integration.json" "$ROOT/tools/firebase-identity-gate.cjs"; then
  echo 'FAIL: live production project identifier leaked into the isolated Firebase gate files' >&2
  exit 1
fi

echo 'Stage 2–3 static safety checks: PASS'
