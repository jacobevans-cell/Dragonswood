#!/usr/bin/env bash
set -euo pipefail
PUSH=0
[[ "${1:-}" == "--push" ]] && PUSH=1
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "$ROOT" ]] || { echo 'ERROR: Run inside the Dragonswood git repository.'; exit 1; }
cd "$ROOT"
[[ -z "$(git status --porcelain)" ]] || { echo 'ERROR: Working tree is not clean. Commit/stash/move untracked files first.'; git status --short; exit 1; }
PKG="$(cd "$(dirname "$0")" && pwd)"
[[ -f dragonswood-grayson-mode.js ]] || { echo 'ERROR: dragonswood-grayson-mode.js not found in repo.'; exit 1; }
# Refuse to overwrite a future/newer Grayson engine silently.
if grep -q "VERSION='58.0'" dragonswood-grayson-mode.js; then echo 'Grayson v58.0 already installed.'; exit 0; fi
if ! grep -q 'Optional, reward-free extreme academic challenge shared by every math game' dragonswood-grayson-mode.js; then
  echo 'ERROR: Current Grayson engine no longer matches the known pre-v58 implementation. Re-audit before applying.'; exit 1
fi
BASE="$(git rev-parse HEAD)"; STAMP="$(date +%Y%m%d-%H%M%S)"; BACKUP="backup/grayson-pre-v58-$STAMP"
git branch "$BACKUP" "$BASE"
echo "Rollback branch created: $BACKUP -> $BASE"
cp "$PKG/dragonswood-grayson-mode.js" dragonswood-grayson-mode.js
cp "$PKG/GRAYSON-MODE-ACADEMIC-BASIS.md" GRAYSON-MODE-ACADEMIC-BASIS.md
python3 - <<'PY'
from pathlib import Path
import re
root=Path('.')
targets=[
'math-operations-quest.html','fraction-forge.html','decimal-deception.html','elemental-laboratory.html','arcane-forge.html','cosmic-architect.html','spelling-practice.html','the_witches_pages_1_15_interactive_test.html','witches-reader.html','daily-quest.html','curriculum-quest.html','boss-battle.html','long-division-quest.html','long-division-custom.html']
tag='<script src="dragonswood-grayson-mode.js?v=58.0"></script>'
for name in targets:
    p=root/name
    if not p.exists():
        print('SKIP missing:',name); continue
    s=p.read_text(encoding='utf-8')
    # Normalize an existing ref of any version.
    s2,n=re.subn(r'<script\s+src=["\']dragonswood-grayson-mode\.js\?v=[^"\']+["\']\s*></script>',tag,s,flags=re.I)
    if n==0:
        if '</body>' in s2: s2=s2.replace('</body>',tag+'\n</body>',1)
        elif '</html>' in s2: s2=s2.replace('</html>',tag+'\n</html>',1)
        else: s2+='\n'+tag+'\n'
    # De-duplicate if a page somehow had multiple refs.
    first=s2.find(tag)
    head=s2[:first+len(tag)]
    tail=s2[first+len(tag):].replace(tag,'')
    s2=head+tail
    p.write_text(s2,encoding='utf-8')
    print(('UPDATED' if n else 'ADDED'),name)
PY
node --check dragonswood-grayson-mode.js
# Self-test against the exact file now installed.
cp "$PKG/grayson-mode-selftest.cjs" /tmp/grayson-mode-selftest.cjs
cp dragonswood-grayson-mode.js /tmp/dragonswood-grayson-mode.js
(cd /tmp && node grayson-mode-selftest.cjs)
python3 "$PKG/verify-grayson.py" "$ROOT"
git diff --check
# Protect unrelated high-risk surfaces.
git diff --name-only | grep -E '^(teacher|firestore\.rules|index\.html|index-v2\.html)' && { echo 'ERROR: Unexpected unrelated file changed.'; exit 1; } || true

git add dragonswood-grayson-mode.js GRAYSON-MODE-ACADEMIC-BASIS.md
for f in math-operations-quest.html fraction-forge.html decimal-deception.html elemental-laboratory.html arcane-forge.html cosmic-architect.html spelling-practice.html the_witches_pages_1_15_interactive_test.html witches-reader.html daily-quest.html curriculum-quest.html boss-battle.html long-division-quest.html long-division-custom.html; do [[ -f "$f" ]] && git add "$f"; done
git commit -m "Expand Grayson Mode to Grade 7-10 contextual challenges"
COMMIT="$(git rev-parse HEAD)"
echo "Created: $COMMIT"
if [[ $PUSH -eq 1 ]]; then git push origin HEAD:main; echo "Pushed $COMMIT to main"; fi
echo "Rollback: git revert $COMMIT && git push origin HEAD"
