#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DONOR="$ROOT/staged-systems/unified-math-v56.27-grayson-v58"
TMP_DIR="$(mktemp -d /tmp/dragonswood-integrated-math.XXXXXX)"
trap 'rm -rf "$TMP_DIR"' EXIT

mkdir -p "$TMP_DIR/css" "$TMP_DIR/js" "$TMP_DIR/tools" "$TMP_DIR/v33-integration/js/integration"
cp "$ROOT/math-operations-quest.html" "$TMP_DIR/math-operations-quest.html"
cp "$ROOT/index.html" "$TMP_DIR/index.html"
cp "$ROOT/css/math-operations-quest.css" "$TMP_DIR/css/math-operations-quest.css"
cp "$ROOT/js/math-operations-quest.js" "$TMP_DIR/js/math-operations-quest.js"
cp "$ROOT/js/math-operations-rewards.js" "$TMP_DIR/js/math-operations-rewards.js"
cp "$ROOT/js/math-operations-dragonswood-host.js" "$TMP_DIR/js/math-operations-dragonswood-host.js"
cp "$ROOT/v33-integration/js/integration/modules.js" "$TMP_DIR/v33-integration/js/integration/modules.js"

# v56.27's own gate predates Grayson v58 and names the earlier v57.1 script
# tag. Normalize only the temporary test copy so all 29 underlying Math gates
# run against the installed runtime while the real page correctly stays v58.
sed -i 's/dragonswood-grayson-mode.js?v=58.0/dragonswood-grayson-mode.js?v=57.1/g' "$TMP_DIR/math-operations-quest.html"
python "$DONOR/math-v56.27/tools/verify-hardening.py" "$TMP_DIR"
cp "$DONOR/math-v56.27/tools/math-engine-test.js" "$TMP_DIR/tools/math-engine-test.cjs"
node "$TMP_DIR/tools/math-engine-test.cjs"

cp "$ROOT/dragonswood-grayson-mode.js" "$TMP_DIR/dragonswood-grayson-mode.js"
cp "$DONOR/grayson-v58/grayson-mode-selftest.cjs" "$TMP_DIR/grayson-mode-selftest.cjs"
(cd "$TMP_DIR" && node grayson-mode-selftest.cjs)
python "$DONOR/grayson-v58/tools/verify-grayson.py" "$ROOT"

echo 'Integrated Unified Math v56.27 + Grayson v58 gate: PASS'
