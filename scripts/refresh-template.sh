#!/usr/bin/env bash
#
# Refresh the vendored template vault from the owner's live vault.
# This is an owner-only maintenance tool. npm publish uses the committed
# src/template-vault/ tree and does not need access to the live vault.
#
# Usage:
#   npm run refresh
#   VAULT_ROOT=/path/to/vault npm run refresh
#   bash scripts/refresh-template.sh /path/to/vault
#
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
kit_root="$(cd "$script_dir/.." && pwd)"
source_dir="$kit_root/src"
template_dir="$source_dir/template-vault"
vault_root_arg="${1:-}"
vault_root="${VAULT_ROOT:-$vault_root_arg}"

if [[ -z "$vault_root" ]]; then
  vault_root="$(cd "$kit_root/../../.." && pwd)"
else
  vault_root="$(cd "$vault_root" && pwd)"
fi

say() { printf '\033[36m▸\033[0m %s\n' "$*"; }
ok() { printf '\033[32m✓\033[0m %s\n' "$*"; }
die() { printf '\033[31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

command -v rsync >/dev/null || die "rsync is required"
command -v node >/dev/null || die "node is required for validation"

[[ -d "$vault_root/skills" ]] || die "missing $vault_root/skills"
[[ -d "$vault_root/08 Templates" ]] || die "missing $vault_root/08 Templates"
[[ -d "$vault_root/00 Context" ]] || die "missing $vault_root/00 Context"

say "Refreshing vendored template vault"
rm -rf "$template_dir"
mkdir -p "$template_dir"

say "Copying skills"
rsync -a --exclude '.DS_Store' "$vault_root/skills"/ "$template_dir/skills"/

say "Copying templates"
rsync -a --exclude '.DS_Store' "$vault_root/08 Templates"/ "$template_dir/08 Templates"/

say "Copying portable context"
mkdir -p "$template_dir/00 Context"
rsync -a --exclude '.DS_Store' \
  --exclude 'About Me.md' \
  --exclude 'ICP.md' \
  --exclude 'Offer.md' \
  --exclude 'Branding.md' \
  --exclude 'Specalists.md' \
  "$vault_root/00 Context"/ "$template_dir/00 Context"/

say "Creating empty vault folders"
empty_folders=(
  "01 Inbox" "03 Wiki" "04 Resources" "05 Daily Notes"
  "06 Archive" "07 Attachments" "09 Raw Data" "10 LLM Wiki"
)
for folder_name in "${empty_folders[@]}"; do
  mkdir -p "$template_dir/$folder_name"
  : > "$template_dir/$folder_name/.gitkeep"
  printf '# %s\n\nEmpty by design. See CLAUDE.md for what belongs here.\n' "$folder_name" > "$template_dir/$folder_name/_README.md"
done

say "Applying starter-kit overlay"
rsync -a --exclude '.DS_Store' "$source_dir/overlay"/ "$template_dir"/

say "Copying generated-vault docs"
rsync -a --exclude '.DS_Store' "$source_dir/docs"/ "$template_dir/docs"/
cp "$source_dir/INSTALL.md" "$template_dir/INSTALL.md"
cp "$source_dir/WALKTHROUGH.md" "$template_dir/WALKTHROUGH.md"

say "Scrubbing residual personal tokens"
node "$kit_root/scripts/scrub-tokens.mjs" "$template_dir"

say "Removing OS noise"
find "$template_dir" -name '.DS_Store' -delete 2>/dev/null || true

say "Running leak guard"
node "$kit_root/scripts/leak-guard.mjs" "$template_dir"

say "Validating scaffolder syntax"
node --check "$source_dir/scaffold.mjs" >/dev/null

file_count="$(find "$template_dir" -type f | wc -l | tr -d ' ')"
skill_count="$(find "$template_dir/skills" -maxdepth 1 -mindepth 1 -type d | wc -l | tr -d ' ')"

ok "Template refreshed"
echo "    vault root: $vault_root"
echo "    files:      $file_count"
echo "    skills:     $skill_count"
