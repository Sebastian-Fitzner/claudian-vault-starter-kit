# Plugins

This vault relies on a few Obsidian plugins. **Claudian** is the one that makes it an AI workspace;
the rest are quality-of-life.

---

## Required: Claudian

Claudian is the in-vault AI panel that runs Claude (and optionally Codex) against your notes and
the skills in this vault.

**Install via Community Plugins (try this first):**
1. Obsidian → **Settings → Community plugins** → turn off *Restricted mode* if needed.
2. **Browse** → search **"Claudian"** → **Install** → **Enable**.

**Install via BRAT (if Claudian is distributed as a beta):**
1. Install **BRAT** first (see below).
2. BRAT → **Add beta plugin** → paste the **Claudian GitHub repository URL**
   (from the plugin's official page/README) → **Add Plugin**.
3. Enable **Claudian** in Community plugins.

**After install:**
- Open the Claudian panel (right sidebar by default — set in `.claudian/claudian-settings.json`).
- Point it at your installed **Claude CLI** if it doesn't auto-detect (`Settings → CLI path`).
- The scaffolder already wrote a sensible `.claudian/claudian-settings.json` (model, effort, media
  folder `07 Attachments`, your name). Adjust to taste.

---

## Recommended: BRAT (Beta Reviewers Auto-update Tool)

BRAT installs and auto-updates plugins that aren't in the public Community list yet.

1. **Settings → Community plugins → Browse** → search **"BRAT"** → **Install** → **Enable**.
2. Use **BRAT → Add beta plugin** with a GitHub repo URL to install any beta plugin (including
   Claudian if it's beta-only).
3. BRAT keeps those plugins updated automatically.

---

## Recommended: Dataview

The project notes use Dataview tables to list their Open/Completed tasks. Without it those code
blocks show as plain text.

1. **Settings → Community plugins → Browse** → search **"Dataview"** → **Install** → **Enable**.
2. Reload the vault. The Demo Project's task tables should now render.

---

## Optional

- **Templater** — if you want dynamic template expansion beyond what the skills do.
- **Excalidraw** — for diagrams (the source vault uses it).

> All plugin data lives under `.obsidian/`. It is intentionally **not** shipped in this kit, so you
> start from a clean Obsidian config.
