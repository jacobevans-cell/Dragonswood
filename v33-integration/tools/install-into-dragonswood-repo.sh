#!/usr/bin/env bash
set -euo pipefail

EXPECTED_MAIN="2258a321077a39ca71e36409d9bc6a1fb5bb3ecc"
BRANCH="massive-v33-integration-safe-2258a321"
REPO="${1:-/workspaces/Dragonswood}"
SOURCE="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$REPO/v33-integration"
WORKFLOW="$REPO/.github/workflows/v33-integration-gate.yml"

fail(){ echo "V3.3 INSTALL ABORTED: $*" >&2; exit 1; }
[ -d "$REPO/.git" ] || fail "$REPO is not a Git repository."
cd "$REPO"

# Tracked changes are never safe to absorb into a migration branch implicitly.
if git status --porcelain | grep -qE '^[ MARCUD?!]{1,2} ' ; then
  # Permit unrelated untracked zip/checksum handoff files, but nothing tracked.
  tracked_dirty="$(git status --porcelain | grep -vE '^\?\? .*\.(zip|sha256)$' || true)"
  [ -z "$tracked_dirty" ] || { echo "$tracked_dirty" >&2; fail 'working tree has tracked or non-package changes'; }
fi

git fetch origin main --quiet
git switch main >/dev/null
git pull --ff-only origin main >/dev/null
ACTUAL="$(git rev-parse HEAD)"
[ "$ACTUAL" = "$EXPECTED_MAIN" ] || fail "main moved to $ACTUAL; expected $EXPECTED_MAIN. Reconcile the new production delta before installing."

if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  fail "local branch $BRANCH already exists; do not overwrite an earlier safety run"
fi
if git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
  fail "remote branch $BRANCH already exists; inspect it before continuing"
fi

git switch -c "$BRANCH" "$EXPECTED_MAIN" >/dev/null
trap 'echo "Installer stopped on branch '"$BRANCH"'. Production main was not changed." >&2' ERR

[ ! -e "$DEST" ] || fail "$DEST already exists"
mkdir -p "$DEST" "$(dirname "$WORKFLOW")"
(
  cd "$SOURCE"
  tar --exclude='./.git' -cf - .
) | (
  cd "$DEST"
  tar -xf -
)
cp "$SOURCE/tools/v33-integration-gate.workflow.yml" "$WORKFLOW"

cd "$DEST"
./tools/run-firebase-gate.sh

cd "$REPO"
git add v33-integration .github/workflows/v33-integration-gate.yml
git diff --cached --check
git commit -m "Add isolated V3.3 integration safety branch"
git push -u origin "$BRANCH"

trap - ERR
echo "V3.3 SAFETY BRANCH PUSHED"
echo "branch=$BRANCH"
echo "sha=$(git rev-parse HEAD)"
echo "main remains=$EXPECTED_MAIN"
