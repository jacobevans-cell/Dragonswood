#!/usr/bin/env bash
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"
node --test v33-integration/tools/test-learning-gradebook.mjs v33-integration/tools/test-learning-entrypoints.mjs v33-integration/tools/test-single-portal.mjs v33-integration/tools/test-hall-restoration.mjs
node --test v33-integration/tools/test-writing-topic-student.mjs v33-integration/tools/test-battle-art-load.mjs v33-integration/tools/test-submission-recovery.mjs v33-integration/tools/test-student-work-recovery.mjs v33-integration/tools/test-science-availability.mjs
node v33-integration/tools/test-integration-core.cjs
node v33-integration/tools/test-student-passes.cjs
node v33-integration/tools/test-substitute-mode.cjs
npx --yes firebase-tools@15.28.1 emulators:exec --project demo-dragonswood-v33 --config firebase.v33-production-gate.json --only auth,firestore "DW_PRODUCTION_RULES_GATE=1 node v33-integration/tools/firebase-identity-gate.cjs"
echo 'LEARNING RELEASE GATE: PASS — routes, new actors, schedule, gradebook, passes, identity and exact production rules'
