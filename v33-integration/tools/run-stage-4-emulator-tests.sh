#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

node tools/firebase-identity-gate.cjs
python -u tools/stage-4-browser-gate.py
