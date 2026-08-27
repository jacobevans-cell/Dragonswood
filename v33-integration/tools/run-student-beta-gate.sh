#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "$ROOT/.." && pwd)"
cd "$REPO_ROOT"
for command in rg node python npx; do
  command -v "$command" >/dev/null 2>&1 || { echo "MISSING DEPENDENCY: $command" >&2; exit 2; }
done
python - <<'PY'
from PIL import Image
from playwright.sync_api import sync_playwright
print('Student-beta Python dependencies: READY')
PY
if ! test -x /usr/bin/chromium && ! python -m playwright install --dry-run chromium >/dev/null 2>&1; then
  echo 'MISSING DEPENDENCY: Chromium. Run: python -m playwright install --with-deps chromium' >&2
  exit 2
fi
FIREBASE=(npx --yes firebase-tools@15.28.1)
"${FIREBASE[@]}" emulators:exec --project demo-dragonswood-v33 --config firebase.v33-production-gate.json --only auth,firestore "bash v33-integration/tools/run-student-beta-emulator-tests.sh"
bash v33-integration/tools/check-student-beta-release.sh
python -u v33-integration/tools/visual-pixel-regression.py --kind student
python -u v33-integration/tools/visual-pixel-regression.py --kind teacher
echo 'V3.3 CONSOLIDATED STUDENT-BETA GATE: PASS (exact production rules + all inherited gates + 0-pixel preview visuals)'
