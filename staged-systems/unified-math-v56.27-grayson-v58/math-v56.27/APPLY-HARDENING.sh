#!/usr/bin/env bash
set -euo pipefail
PUSH=0
[[ "${1:-}" == "--push" ]] && PUSH=1
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "$ROOT" ]] || { echo 'ERROR: Run this from inside the Dragonswood Git repository.'; exit 1; }
cd "$ROOT"
PKG="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ -z "$(git status --porcelain)" ]] || { echo 'ERROR: Working tree is not clean.'; git status --short; exit 1; }
git pull --ff-only origin main
BASE="$(git rev-parse HEAD)"
BACKUP="backup/math-operations-pre-56-27-$(date +%Y%m%d-%H%M%S)"
git branch "$BACKUP" "$BASE"
echo "Rollback branch created: $BACKUP -> $BASE"

# Accept either the pre-Claude or post-Claude Math Operations page. The final
# runtime files below already include Claude's verified debug corrections.
if grep -q 'index-v2.html#games' math-operations-quest.html; then
  echo 'Pre-Claude Math Operations runtime detected; audited debug fixes will be included in the replacement files.'
elif grep -q 'index.html#games' math-operations-quest.html; then
  echo 'Claude debug fixes already present; applying the hardening layer on top.'
else
  echo 'ERROR: Math Operations page is not in a recognized pre/post-debug state.'
  exit 1
fi

# Install hardened runtime files (includes the audited Claude debug pass).
cp "$PKG/runtime/math-operations-quest.html" math-operations-quest.html
cp "$PKG/runtime/css/math-operations-quest.css" css/math-operations-quest.css
cp "$PKG/runtime/js/math-operations-quest.js" js/math-operations-quest.js
cp "$PKG/runtime/js/math-operations-rewards.js" js/math-operations-rewards.js
cp "$PKG/runtime/js/math-operations-dragonswood-host.js" js/math-operations-dragonswood-host.js

# Bump every portal/reference link to the new Math Operations cache version.
python3 - <<'PY'
from pathlib import Path
for name in ['index.html','index-v2.html']:
    p=Path(name)
    if not p.exists(): continue
    s=p.read_text(encoding='utf-8')
    s=s.replace('math-operations-quest.html?v=56.25.0','math-operations-quest.html?v=56.27.0')
    s=s.replace('math-operations-quest.html?v=56.26.0','math-operations-quest.html?v=56.27.0')
    p.write_text(s,encoding='utf-8')
PY

# Grayson Mode is a shared asset. Bump all tracked HTML references together.
while IFS= read -r -d '' f; do
  python3 - "$f" <<'PY'
from pathlib import Path
import sys
p=Path(sys.argv[1]); s=p.read_text(encoding='utf-8')
s=s.replace('dragonswood-grayson-mode.js?v=57.0','dragonswood-grayson-mode.js?v=57.1')
p.write_text(s,encoding='utf-8')
PY
done < <(git grep -lz 'dragonswood-grayson-mode.js?v=57.0' -- '*.html' || true)

node --check js/math-operations-quest.js
node --check js/math-operations-rewards.js
node --check js/math-operations-dragonswood-host.js
python3 "$PKG/tools/verify-hardening.py" "$ROOT"
# Run the real engine tests against the installed source using a temporary adjusted test path.
tmp_test="$(mktemp)"
sed "s#path.resolve(__dirname,'../js/math-operations-quest.js')#path.resolve(process.cwd(),'js/math-operations-quest.js')#" "$PKG/tools/math-engine-test.js" > "$tmp_test"
node "$tmp_test"
rm -f "$tmp_test"
git diff --check

echo
echo 'Diff summary:'
git diff --stat

git add -u
git commit -m 'Harden Math Operations rewards, worksheet mode, and accessibility'
COMMIT="$(git rev-parse HEAD)"
echo "Created hardening commit: $COMMIT"
if (( PUSH )); then
  git push origin HEAD:main
  echo "Pushed $COMMIT to origin/main"
fi
echo "Fast rollback: git revert $COMMIT && git push origin main"
echo "Full pre-change recovery branch: $BACKUP"
