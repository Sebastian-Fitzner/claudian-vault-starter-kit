#!/usr/bin/env bash
#
# build-kit.sh — assemble the Claudian Vault Starter Kit zip from the live vault.
#
# Layer 1 of 2. You run this. It copies the reusable, portable parts of the vault,
# lays the hand-authored overlay on top, scrubs personal data, verifies nothing leaked,
# and zips the result into dist/claudian-starter-kit.zip.
#
# Usage:  bash starter-kit/build-kit.sh
#
set -euo pipefail

KIT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VAULT_ROOT="$(cd "$KIT_ROOT/.." && pwd)"
SRC="$KIT_ROOT/src"
DIST="$KIT_ROOT/dist"
STAGING="$DIST/staging"
TV="$STAGING/template-vault"
ZIP="$DIST/claudian-starter-kit.zip"

# Personal tokens that must NEVER appear in the kit. Single source of truth for the guard.
# Note: the personal Atlassian org is caught by `fincompare`; we do NOT guard bare `atlassian.net`
# because docs/scaffold legitimately ship example URLs (acme.atlassian.net, your-org.atlassian.net).
LEAK_REGEX='sebastianfitzner|Sebbo|fincompare|fynbiz|FC-MacBook|Axel Springer|SEBBO_SPACE'

say()  { printf '\033[36m▸\033[0m %s\n' "$*"; }
ok()   { printf '\033[32m✓\033[0m %s\n' "$*"; }
die()  { printf '\033[31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

command -v rsync >/dev/null || die "rsync is required"
command -v perl  >/dev/null || die "perl is required (used for the scrub pass)"
command -v zip   >/dev/null || die "zip is required"

# ---------------------------------------------------------------------------
say "Cleaning staging"
rm -rf "$STAGING"
mkdir -p "$TV"

# ---------------------------------------------------------------------------
say "Copying deliverables (scaffolder + docs)"
rsync -a \
  --exclude '.DS_Store' \
  --exclude 'overlay/' \
  "$SRC"/ "$STAGING"/

# ---------------------------------------------------------------------------
say "Copying portable vault assets from the live vault"

# Skills (all of them — feature gating happens at scaffold time)
rsync -a --exclude '.DS_Store' "$VAULT_ROOT/skills"/ "$TV/skills"/

# Templates
rsync -a --exclude '.DS_Store' "$VAULT_ROOT/08 Templates"/ "$TV/08 Templates"/

# 00 Context — everything EXCEPT the deeply personal profile files (overlay re-adds clean stubs)
mkdir -p "$TV/00 Context"
rsync -a --exclude '.DS_Store' \
  --exclude 'About Me.md' \
  --exclude 'ICP.md' \
  --exclude 'Offer.md' \
  --exclude 'Branding.md' \
  --exclude 'Specalists.md' \
  "$VAULT_ROOT/00 Context"/ "$TV/00 Context"/

# ---------------------------------------------------------------------------
say "Creating empty vault folders"
declare -a EMPTY_FOLDERS=(
  "01 Inbox" "03 Wiki" "04 Resources" "05 Daily Notes"
  "06 Archive" "07 Attachments" "09 Raw Data" "10 LLM Wiki"
)
for f in "${EMPTY_FOLDERS[@]}"; do
  mkdir -p "$TV/$f"
  : > "$TV/$f/.gitkeep"
  printf '# %s\n\nEmpty by design — see CLAUDE.md for what belongs here.\n' "$f" > "$TV/$f/_README.md"
done

# ---------------------------------------------------------------------------
say "Applying hand-authored overlay"
# Overlay provides CLAUDE.md.tmpl, AGENTS/CODEX/GEMINI, profile stubs, .claude, .claudian,
# the Demo Project, and the vault .gitignore. It overrides anything copied above.
rsync -a --exclude '.DS_Store' "$SRC/overlay"/ "$TV"/

# ---------------------------------------------------------------------------
say "Scrubbing residual personal tokens"
# Bounded scrub: the only residual token in portable assets is the vault owner's name in a
# skill heading. Map it to the scaffolder placeholder so it gets personalized at install time.
find "$TV" -type f \( -name '*.md' -o -name '*.tmpl' -o -name '*.yaml' -o -name '*.yml' -o -name '*.json' \) \
  -exec perl -0777 -pi -e 's/Sebbo/{{DEV_NAME}}/g' {} +

# ---------------------------------------------------------------------------
say "Removing OS noise"
find "$STAGING" -name '.DS_Store' -delete 2>/dev/null || true

# ---------------------------------------------------------------------------
say "Leak guard — scanning staging for personal data"
if LEAKS="$(grep -rIEl "$LEAK_REGEX" "$STAGING" 2>/dev/null)"; then
  printf '\033[31m✗ Personal data leaked into the kit:\033[0m\n' >&2
  printf '   %s\n' $LEAKS >&2
  echo "   (matched: $LEAK_REGEX)" >&2
  die "Build aborted. Fix the scrub/exclude rules before shipping."
fi
ok "No personal tokens found"

# ---------------------------------------------------------------------------
say "Validating scaffolder syntax"
if command -v node >/dev/null; then
  node --check "$STAGING/scaffold.mjs" && ok "scaffold.mjs parses"
else
  printf '\033[33m! node not found — skipping scaffold.mjs syntax check\033[0m\n'
fi

# ---------------------------------------------------------------------------
say "Zipping"
rm -f "$ZIP"
( cd "$STAGING" && zip -rq "$ZIP" . -x '*.DS_Store' )

FILES="$(find "$STAGING" -type f | wc -l | tr -d ' ')"
SKILLS="$(find "$TV/skills" -maxdepth 1 -mindepth 1 -type d | wc -l | tr -d ' ')"
SIZE="$(du -h "$ZIP" | cut -f1 | tr -d ' ')"

echo
ok "Built $ZIP"
echo "    files:  $FILES"
echo "    skills: $SKILLS"
echo "    size:   $SIZE"
echo
echo "Test it:"
echo "    rm -rf /tmp/kit-test && unzip -q $ZIP -d /tmp/kit-test"
echo "    cd /tmp/kit-test && node scaffold.mjs --target ./out --defaults"
