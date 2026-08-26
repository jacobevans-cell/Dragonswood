#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP_DIR="$(mktemp -d /tmp/dragonswood-math-grayson-stage.XXXXXX)"

cp -R "$ROOT/math-v56.27/runtime/." "$TMP_DIR/"
cp "$ROOT/tools/fixture-index.html" "$TMP_DIR/index.html"
python "$ROOT/math-v56.27/tools/verify-hardening.py" "$TMP_DIR"
mkdir -p "$TMP_DIR/tools"
cp "$ROOT/math-v56.27/tools/math-engine-test.js" "$TMP_DIR/tools/math-engine-test.cjs"
node "$TMP_DIR/tools/math-engine-test.cjs"

cp "$ROOT/grayson-v58/dragonswood-grayson-mode.js" "$TMP_DIR/dragonswood-grayson-mode.js"
cp "$ROOT/grayson-v58/grayson-mode-selftest.cjs" "$TMP_DIR/grayson-mode-selftest.cjs"
(cd "$TMP_DIR" && node grayson-mode-selftest.cjs)
for page in math-operations-quest.html fraction-forge.html decimal-deception.html elemental-laboratory.html arcane-forge.html cosmic-architect.html spelling-practice.html the_witches_pages_1_15_interactive_test.html witches-reader.html daily-quest.html curriculum-quest.html boss-battle.html long-division-quest.html long-division-custom.html; do
  cp "$ROOT/tools/fixture-academic.html" "$TMP_DIR/$page"
done
python "$ROOT/grayson-v58/tools/verify-grayson.py" "$TMP_DIR"

echo 'Unified Math v56.27 + Grayson v58 staged donor gate: PASS'
