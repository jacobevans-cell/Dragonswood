#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

bash "$ROOT/tools/massive-integration/run-pre-gate-suite.sh"

if ! python -c 'import playwright' >/dev/null 2>&1; then
  python -m pip install --user 'playwright==1.55.0'
fi
python -m playwright install chromium

cd "$ROOT/v33-integration"
./tools/run-firebase-gate.sh

echo 'CODESPACE FIREBASE GATE: PASS'
echo "branch=$(git -C "$ROOT" branch --show-current)"
echo "head=$(git -C "$ROOT" rev-parse HEAD)"
