#!/usr/bin/env bash
# sync-public.sh — Pre-sync checklist before pushing to aicalc GitHub
# Usage: ./scripts/sync-public.sh [--push]
#   --push  Actually push to GitHub after checks pass (dry-run by default)

set -uo pipefail
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
  echo "❌ Must run from main branch (current: $BRANCH)"
  exit 1
fi

ERRORS=0
WARNINGS=0

# 1. Check working tree is clean (ignore untracked)
echo "=== 1. Working tree ==="
DIRTY=$(git status --short 2>/dev/null | grep -v '^??' || true)
if [ -n "$DIRTY" ]; then
  echo "❌ Uncommitted changes:"
  echo "$DIRTY"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ Clean"
fi

# 2. Files that should NOT be in public repo
echo "=== 2. Internal file exclusion ==="
LEAKED=$(git ls-tree -r --name-only HEAD 2>/dev/null | grep -iE '^(qa-.*\.cjs|llm-pricing-test\.cjs|scripts/gsc-|scripts/fetch-gsc|scripts/submit-gsc|data/gsc-export/|\.context/|\.vite/|docs/designs/)' || true)
if [ -n "$LEAKED" ]; then
  echo "⚠️  Internal files tracked in main (excluded by public-release .gitignore):"
  echo "$LEAKED"
  WARNINGS=$((WARNINGS + 1))
else
  echo "✅ No internal files tracked"
fi

# 3. Secret scan (real keys only, not sample patterns)
echo "=== 3. Secret scan ==="
SECRETS=""
while IFS= read -r f; do
  case "$f" in dist/*|*.png|*.jpg|*.svg|*.ico|*.woff*|node_modules/*|src/env-scanner/*|src/pii-redactor/*|src/ai-agent-security/*|src/csp-generator/*) continue ;; esac
  FOUND=$(git show "HEAD:$f" 2>/dev/null | grep -cE '(sk-proj-[a-zA-Z0-9]{40,}|ghp_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36})' 2>/dev/null || true)
  if [ "$FOUND" -gt 0 ] 2>/dev/null; then
    SECRETS="$SECRETS $f"
  fi
done < <(git ls-tree -r --name-only HEAD 2>/dev/null)
if [ -n "$SECRETS" ]; then
  echo "❌ Real API keys detected in:$SECRETS"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ No real secrets (sample patterns OK)"
fi

# 4. .gitignore sync check
echo "=== 4. .gitignore coverage ==="
GITIGNORE_PUBLIC=$(git show public-release:.gitignore 2>/dev/null | grep -cE '(gsc-|qa-|\.vite|\.context|llm-pricing-test)' || true)
if [ "${GITIGNORE_PUBLIC:-0}" -lt 3 ]; then
  echo "❌ public-release .gitignore missing exclusions (${GITIGNORE_PUBLIC:-0} rules found)"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ ${GITIGNORE_PUBLIC:-0} exclusion rules in public-release .gitignore"
fi

# 5. README tool count
echo "=== 5. README accuracy ==="
README_TOOLS=$(git show main:README.md 2>/dev/null | grep -c 'aicalc.cloud/' || true)
if [ "${README_TOOLS:-0}" -lt 20 ]; then
  echo "❌ README only lists ${README_TOOLS:-0} tool links (expected 21+)"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ README has ${README_TOOLS:-0} tool links"
fi

# 6. public-release vs main gap
echo "=== 6. Sync gap ==="
GAP=$(git log public-release..main --oneline 2>/dev/null | wc -l | tr -d ' ')
if [ "${GAP:-0}" -eq 0 ]; then
  echo "✅ public-release is up to date"
else
  echo "⚠️  $GAP commits on main not yet synced to public-release"
fi

# Summary
echo ""
echo "=== SUMMARY ==="
if [ "$ERRORS" -gt 0 ]; then
  echo "❌ $ERRORS errors, $WARNINGS warnings — fix before syncing"
  exit 1
elif [ "$WARNINGS" -gt 0 ]; then
  echo "⚠️  $WARNINGS warnings — review recommended"
else
  echo "✅ All checks passed"
fi

# Dry run or push
if [ "${1:-}" = "--push" ]; then
  echo ""
  echo "=== Syncing to GitHub ==="
  git checkout public-release

  # Copy all files from main, preserving .gitignore
  find . -maxdepth 1 -not -name '.git' -not -name '.' -exec rm -rf {} + 2>/dev/null || true
  git checkout main -- .
  # Restore public-release .gitignore (has extra exclusions)
  git checkout public-release -- .gitignore 2>/dev/null || true

  # Remove internal files from tracking
  git rm --cached -r \
    qa-*.cjs \
    data/gsc-export/ \
    scripts/gsc-*.cjs \
    scripts/fetch-gsc-data.cjs \
    scripts/submit-gsc-index.cjs \
    .vite/ \
    .context/ \
    docs/designs/ \
    llm-pricing-test.cjs \
    2>/dev/null || true

  git add -A

  STAGED=$(git diff --cached --stat 2>/dev/null | tail -1 || echo "no changes")
  echo "Changes: $STAGED"
  echo ""
  read -rp "Commit message (enter for default): " MSG
  git commit -m "${MSG:-chore: sync latest changes to public release}"
  git push aicalc public-release:main
  git checkout main
  echo "✅ Synced and pushed to aicalc/main"
else
  echo ""
  echo "Dry run complete. Run with --push to sync:"
  echo "  ./scripts/sync-public.sh --push"
fi
