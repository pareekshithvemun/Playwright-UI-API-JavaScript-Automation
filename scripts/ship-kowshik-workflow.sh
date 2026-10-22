#!/usr/bin/env bash
#
# Push feature work on kowshik, raise a PR to develop, merge the PR,
# pull develop locally, merge develop into devBackup, switch back to kowshik.
#
# Requires: gh (GitHub CLI) authenticated with your GitHub Enterprise instance.
#
# This repo has no branch named "main"; the primary branch is develop (origin/HEAD).
# The three branches this script uses: kowshik, develop, devBackup.
#
# Usage:
#   npm run ship
#   SHIP_MESSAGE="feat: something" npm run ship
#
set -euo pipefail

FEATURE_BRANCH="kowshik"
PRIMARY_BRANCH="develop"
BACKUP_BRANCH="devBackup"

current="$(git branch --show-current)"

# ---------------------------------------------------------------------------
# Shortcut: already on develop — only fast-forward from remote and push.
# ---------------------------------------------------------------------------
if [[ "$current" == "$PRIMARY_BRANCH" ]]; then
  echo "== on $PRIMARY_BRANCH: sync with origin =="
  git fetch origin
  git merge --ff-only "origin/$PRIMARY_BRANCH"
  git push origin "$PRIMARY_BRANCH"
  echo "Done: $PRIMARY_BRANCH matches origin."
  exit 0
fi

# ---------------------------------------------------------------------------
# 1) See what will ship, commit, push feature branch
# ---------------------------------------------------------------------------
echo "== git status =="
git status

echo "== git add (all) =="
git add -A

if git diff --cached --quiet; then
  echo "Nothing new to commit."
else
  msg="${SHIP_MESSAGE:-chore: ship}"
  echo "== git commit: $msg =="
  git commit -m "$msg"
fi

echo "== push $FEATURE_BRANCH =="
git push -u origin "$FEATURE_BRANCH"

# ---------------------------------------------------------------------------
# 2) Raise PR from kowshik → develop and merge it
# ---------------------------------------------------------------------------
msg="${SHIP_MESSAGE:-chore: ship}"

echo "== creating PR: $FEATURE_BRANCH → $PRIMARY_BRANCH =="
pr_url=$(gh pr create \
  --base "$PRIMARY_BRANCH" \
  --head "$FEATURE_BRANCH" \
  --title "$msg" \
  --body "Auto-shipped via \`npm run ship\`" 2>&1) || {
  if echo "$pr_url" | grep -qi "already exists"; then
    echo "PR already exists, finding it..."
    pr_url=$(gh pr list --head "$FEATURE_BRANCH" --base "$PRIMARY_BRANCH" --json url --jq '.[0].url')
  else
    echo "Error creating PR: $pr_url"
    exit 1
  fi
}
echo "PR: $pr_url"

echo "== merging PR =="
gh pr merge "$pr_url" --merge --delete-branch=false
echo "PR merged into $PRIMARY_BRANCH"

# ---------------------------------------------------------------------------
# 3) Switch to develop and pull merged code from remote
# ---------------------------------------------------------------------------
echo "== checkout $PRIMARY_BRANCH and pull =="
git checkout "$PRIMARY_BRANCH"
git pull origin "$PRIMARY_BRANCH"

# ---------------------------------------------------------------------------
# 4) Merge develop → devBackup
# ---------------------------------------------------------------------------
echo "== merge $PRIMARY_BRANCH → $BACKUP_BRANCH =="
if git show-ref --verify --quiet "refs/heads/$BACKUP_BRANCH"; then
  git checkout "$BACKUP_BRANCH"
else
  git checkout -b "$BACKUP_BRANCH" "origin/$BACKUP_BRANCH"
fi
git fetch origin "$BACKUP_BRANCH"
git merge --ff-only "origin/$BACKUP_BRANCH"
git merge "$PRIMARY_BRANCH" --no-edit
git push origin "$BACKUP_BRANCH"

# ---------------------------------------------------------------------------
# 5) Back to feature branch
# ---------------------------------------------------------------------------
echo "== checkout $FEATURE_BRANCH =="
git checkout "$FEATURE_BRANCH"

# ---------------------------------------------------------------------------
# 6) Diffs (stat; empty if branches match). Exit code ignored so diffs never fail the script.
# ---------------------------------------------------------------------------
echo "== diff feature vs primary: $FEATURE_BRANCH .. $PRIMARY_BRANCH =="
git diff "$FEATURE_BRANCH".."$PRIMARY_BRANCH" --stat || true

echo ""
echo "== diff feature vs backup: $FEATURE_BRANCH .. $BACKUP_BRANCH =="
git diff "$FEATURE_BRANCH".."$BACKUP_BRANCH" --stat || true

echo ""
echo "== diff primary vs backup: $PRIMARY_BRANCH .. $BACKUP_BRANCH =="
git diff "$PRIMARY_BRANCH".."$BACKUP_BRANCH" --stat || true

echo ""
echo "Done: shipped $FEATURE_BRANCH → PR → $PRIMARY_BRANCH → $BACKUP_BRANCH; you are on $FEATURE_BRANCH."
