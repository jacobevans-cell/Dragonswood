#!/usr/bin/env bash
set -euo pipefail
node scripts/vendor-three.mjs
node scripts/preflight.mjs --strict
firebase deploy --only hosting,firestore,functions
