#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PORT="${1:-4173}"
PID_FILE="/tmp/dragonswood-v33-manual-preview-${PORT}.pid"
LOG_FILE="/tmp/dragonswood-v33-manual-preview-${PORT}.log"

cd "$REPO_ROOT"
BRANCH="$(git branch --show-current)"
if [[ "$BRANCH" == "main" ]]; then
  echo "PREVIEW ABORTED: switch back to the isolated integration branch. This preview never runs from main."
  exit 1
fi

if [[ -f "$PID_FILE" ]]; then
  OLD_PID="$(tr -cd '0-9' < "$PID_FILE")"
  if [[ -n "$OLD_PID" ]] && kill -0 "$OLD_PID" 2>/dev/null; then
    echo "Preview server is already running on port $PORT (PID $OLD_PID)."
    echo "Open the Codespace Ports tab and open port $PORT."
    echo "Path: /v33-integration/manual-preview.html"
    exit 0
  fi
fi

python3 v33-integration/tools/manual_preview_server.py --port "$PORT" >"$LOG_FILE" 2>&1 &
PREVIEW_PID=$!
echo "$PREVIEW_PID" > "$PID_FILE"

READY=false
for _ in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fsS "http://127.0.0.1:${PORT}/v33-integration/manual-preview.html" >/dev/null 2>&1; then
    READY=true
    break
  fi
  sleep 0.25
done
if [[ "$READY" != "true" ]]; then
  echo "PREVIEW FAILED TO START. Read $LOG_FILE for the local error."
  exit 1
fi

echo "DRAGONSWOOD V3.3 MANUAL PREVIEW: READY"
echo "Branch: $BRANCH"
echo "Port: $PORT"
echo "Open the Codespace Ports tab, keep port $PORT Private, and click its browser icon."
echo "Then open: /v33-integration/manual-preview.html"
echo "No Firebase connection, GitHub push, deployment, or main-branch change was made."
