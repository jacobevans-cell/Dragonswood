#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

"$ROOT/tools/check-stage-2-3.sh"
node "$ROOT/tools/test-stage-4-contract.cjs"
(cd "$ROOT/.." && node tools/check-parse.mjs)

echo 'V3.3 Stage 4 static, production-parser, and inherited safety checks: PASS'
