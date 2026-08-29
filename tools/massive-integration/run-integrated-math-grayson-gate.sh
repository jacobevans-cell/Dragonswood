#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TMP_DIR="$(mktemp -d /tmp/dragonswood-integrated-math.XXXXXX)"
trap 'rm -rf "$TMP_DIR"' EXIT

mkdir -p "$TMP_DIR/css" "$TMP_DIR/js" "$TMP_DIR/tools"
python "$ROOT/tools/massive-integration/math/verify-hardening.py" "$ROOT"
cp "$ROOT/js/math-operations-quest.js" "$TMP_DIR/js/math-operations-quest.js"
cp "$ROOT/tools/massive-integration/math/math-engine-test.cjs" "$TMP_DIR/tools/math-engine-test.cjs"
node "$TMP_DIR/tools/math-engine-test.cjs"

cp "$ROOT/dragonswood-grayson-mode.js" "$TMP_DIR/dragonswood-grayson-mode.js"
cp "$ROOT/tools/massive-integration/math/grayson-mode-selftest.cjs" "$TMP_DIR/grayson-mode-selftest.cjs"
(cd "$TMP_DIR" && node grayson-mode-selftest.cjs)
python "$ROOT/tools/massive-integration/math/verify-grayson.py" "$ROOT"

echo 'Integrated Math v56.27.1 + Grayson v58 gate: PASS (production runtime only; no donor clone)'
