#!/usr/bin/env bash
set -euo pipefail
node tools/firebase-identity-gate.cjs
python -u tools/stage-4-browser-gate.py
python -u tools/academic-systems-browser-gate.py
python -u tools/student-world-browser-gate.py
