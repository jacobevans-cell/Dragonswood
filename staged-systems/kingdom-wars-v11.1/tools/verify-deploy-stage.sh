#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

for file in kingdom-wars/kingdom-wars-core.js kingdom-wars/kingdom-wars-state.mjs kingdom-wars/kingdom-life.mjs kingdom-wars/kingdom-palette-engine.mjs kingdom-wars/kingdom-style-renderer.mjs kingdom-wars/kingdom-visual-renderer.mjs kingdom-wars/kingdom-wars-test-access.mjs kingdom-wars/kingdom-wars-test-app.mjs kingdom-wars/kingdom-wars-test-nav.mjs; do
  node --check "$file"
done

node tools/test-realistic-production.cjs
node tools/test-v10-damage-repair.cjs
node tools/test-v11-real-raids.cjs
node tools/test-live-asset-routing.cjs
node tools/adv-core.cjs
node tools/adv-persistence.cjs

echo 'Kingdom Wars V11.1 deploy-stage gate: PASS'
