#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
DW_PRODUCTION_RULES_GATE=1 node tools/firebase-identity-gate.cjs
python -u tools/stage-4-browser-gate.py
python -u tools/academic-systems-browser-gate.py
python -u tools/student-world-browser-gate.py
python -u tools/teacher-operations-browser-gate.py
python -u tools/student-beta-browser-gate.py
python -u tools/curriculum-stability-browser-gate.py
python -u tools/hall-profile-math-browser-gate.py
