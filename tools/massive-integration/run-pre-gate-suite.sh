#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

node academic-grading-v2-selftest.cjs
node bathroom-pass-sync-selftest.cjs
node curriculum-pacing-selftest.cjs
node grading-hardening-selftest.cjs
node portal-modules-selftest.cjs
node v2-retirement-selftest.cjs
node v57-improvements-selftest.cjs
node tools/check-parse.mjs
node tools/check-firestore-coverage.mjs
python seating-command/verify.py
python dragonswood-v33-test/tools/verify.py

(cd v33-integration && ./tools/check-stage-2-3.sh)
(cd staged-systems/kingdom-wars-v11.1 && bash tools/verify-deploy-stage.sh)
(cd staged-systems/arcade-v1.6 && node scripts/preflight.mjs)
(cd staged-systems/unified-math-v56.27-grayson-v58 && bash tools/verify-staged-donors.sh)
bash tools/massive-integration/run-integrated-math-grayson-gate.sh

echo 'Massive integration pre-emulator suite: PASS'
