#!/usr/bin/env bash
# Fetch the title and body of a GitHub pull request.
#
# Reads the GitHub token from the github-pr-comments Obsidian plugin's
# data.json so no separate token configuration is needed.
#
# Usage:
#   ./fetch-pr-description.sh <owner/repo> <pr_number>
#
# Output:
#   Prints the PR title as a Markdown h1, followed by the PR body.
#   Exits non-zero on any error.

set -euo pipefail

REPO="${1:-}"
PR_NUMBER="${2:-}"

if [[ -z "$REPO" || -z "$PR_NUMBER" ]]; then
  echo "Usage: $0 <owner/repo> <pr_number>" >&2
  exit 1
fi

VAULT_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
DATA_JSON="$VAULT_ROOT/.obsidian/plugins/github-pr-comments/data.json"

if [[ ! -f "$DATA_JSON" ]]; then
  echo "Error: plugin data.json not found at $DATA_JSON" >&2
  exit 1
fi

TOKEN=$(python3 -c "
import json, sys
with open(sys.argv[1]) as f:
    d = json.load(f)
token = d.get('githubToken', '').strip()
if not token:
    print('', end='')
    sys.exit(0)
print(token, end='')
" "$DATA_JSON")

if [[ -z "$TOKEN" ]]; then
  echo "Error: no GitHub token found in plugin settings." >&2
  exit 1
fi

OWNER="${REPO%%/*}"
NAME="${REPO#*/}"

RESPONSE=$(curl -sf \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/repos/$OWNER/$NAME/pulls/$PR_NUMBER")

python3 -c "
import json, sys
d = json.load(sys.stdin)
title = d.get('title', '').strip()
body  = (d.get('body') or '').strip()
print(f'# {title}')
if body:
    print()
    print(body)
" <<< "$RESPONSE"
