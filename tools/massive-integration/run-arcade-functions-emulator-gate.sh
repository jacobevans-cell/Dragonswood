#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if [[ "$(git branch --show-current)" == "main" ]]; then
  echo 'ARCADE EMULATOR GATE ABORTED: never run integration work from main' >&2
  exit 1
fi
if [[ "${GCLOUD_PROJECT:-demo-dragonswood-v33}" != "demo-dragonswood-v33" ]]; then
  echo 'ARCADE EMULATOR GATE ABORTED: project must be demo-dragonswood-v33' >&2
  exit 1
fi

npm install --prefix functions-arcade-access --no-audit --no-fund
export GCLOUD_PROJECT=demo-dragonswood-v33
export FIREBASE_CONFIG='{"projectId":"demo-dragonswood-v33"}'
npx --yes firebase-tools@14.12.0 emulators:exec \
  --config firebase.arcade-access.json \
  --project demo-dragonswood-v33 \
  "node tools/massive-integration/arcade-functions-emulator-gate.cjs"
