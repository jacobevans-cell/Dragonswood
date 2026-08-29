#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

for file in kingdom-wars/kingdom-wars-core.js kingdom-wars/kingdom-wars-state.mjs kingdom-wars/kingdom-life.mjs kingdom-wars/kingdom-palette-engine.mjs kingdom-wars/kingdom-style-renderer.mjs kingdom-wars/kingdom-visual-renderer.mjs kingdom-wars/kingdom-wars-test-access.mjs kingdom-wars/kingdom-wars-test-app.mjs kingdom-wars/kingdom-wars-test-nav.mjs; do
  node --check "$file"
done
node tools/massive-integration/kingdom/test-v10-damage-repair.cjs
node tools/massive-integration/kingdom/test-v11-real-raids.cjs
node tools/massive-integration/kingdom/test-live-asset-routing.cjs
node tools/massive-integration/kingdom/adv-core.cjs
node tools/massive-integration/kingdom/adv-persistence.cjs
node tools/massive-integration/verify-integrated-kingdom.cjs
echo 'Integrated Kingdom Wars V11.1 gate: PASS'
