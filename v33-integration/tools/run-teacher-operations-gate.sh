#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
for command in rg node python npx; do
  command -v "$command" >/dev/null 2>&1 || { echo "MISSING DEPENDENCY: $command" >&2; exit 2; }
done
python - <<'PY'
from PIL import Image
from playwright.sync_api import sync_playwright
print('Teacher Operations Python dependencies: READY')
PY
if ! test -x /usr/bin/chromium && ! python -m playwright install --dry-run chromium >/dev/null 2>&1; then
  echo 'MISSING DEPENDENCY: Chromium. Run: python -m playwright install --with-deps chromium' >&2
  exit 2
fi
FIREBASE=(npx --yes firebase-tools@15.28.1)
"${FIREBASE[@]}" emulators:exec --project demo-dragonswood-v33 --config firebase.integration.json --only auth,firestore "bash tools/run-teacher-operations-emulator-tests.sh"
./tools/check-teacher-operations.sh
python -u tools/visual-pixel-regression.py --kind student
python -u tools/visual-pixel-regression.py --kind teacher
echo 'V3.3 TEACHER OPERATIONS + CEDAR WAVE: PASS (Firebase + controls + narration + 0-pixel visuals)'
