#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if command -v firebase >/dev/null 2>&1; then
  FIREBASE=(firebase)
else
  FIREBASE=(npx --yes firebase-tools@15.28.1)
fi

"${FIREBASE[@]}" emulators:exec \
  --project demo-dragonswood-v33 \
  --config firebase.integration.json \
  --only auth,firestore \
  "bash tools/run-stage-4-emulator-tests.sh"

./tools/check-stage-4.sh
python -u tools/visual-pixel-regression.py --kind student
python -u tools/visual-pixel-regression.py --kind teacher

echo 'V3.3 Stage 4 Firebase behavior, persistence, safety, parser, and 17-route visual regression: PASS'
