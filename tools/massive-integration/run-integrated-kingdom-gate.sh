#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

for file in kingdom-wars/kingdom-wars-core.js kingdom-wars/kingdom-wars-state.mjs kingdom-wars/kingdom-life.mjs kingdom-wars/kingdom-palette-engine.mjs kingdom-wars/kingdom-style-renderer.mjs kingdom-wars/kingdom-visual-renderer.mjs kingdom-wars/kingdom-wars-test-access.mjs kingdom-wars/kingdom-wars-test-app.mjs kingdom-wars/kingdom-wars-test-nav.mjs; do
  node --check "$file"
done
node staged-systems/kingdom-wars-v11.1/tools/test-v10-damage-repair.cjs
node staged-systems/kingdom-wars-v11.1/tools/test-v11-real-raids.cjs
node staged-systems/kingdom-wars-v11.1/tools/test-live-asset-routing.cjs
node staged-systems/kingdom-wars-v11.1/tools/adv-core.cjs
node staged-systems/kingdom-wars-v11.1/tools/adv-persistence.cjs
node tools/massive-integration/verify-integrated-kingdom.cjs
echo 'Integrated Kingdom Wars V11.1 gate: PASS'
