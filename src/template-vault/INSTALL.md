# Install — Vault Starter Kit

A ready-to-run Markdown vault wired for AI-assisted engineering: project/task workflows,
reusable skills, personas, coding rules, and multi-agent workflow definitions. The core workflow
works in any editor or agent CLI. Obsidian is optional.

---

## 1. Prerequisites

| Tool | Why | Check |
| --- | --- | --- |
| **Node.js 18+** | runs the scaffolder | `node --version` |
| **Claude CLI / Codex CLI / another agent CLI** *(optional)* | drives the skills and workflows | `claude --version`, `codex --version` |
| **git** *(optional)* | branch/worktree task flow + first commit | `git --version` |
| **Obsidian** *(optional)* | graph navigation, Dataview tables, Claudian panel | [obsidian.md](https://obsidian.md) |

> **Windows:** run everything under **WSL2**. The scripts assume a POSIX shell.

---

## 2. Scaffold

```sh
npx @veams/vault-starter-kit
```

The scaffolder asks a handful of questions (name, role, email, stack, optional integrations),
then writes a personalized vault to the target folder you choose (default `./my-claudian-vault`).

Non-interactive run (accepts all defaults — handy for a quick look):

```sh
npx @veams/vault-starter-kit --target ./demo-vault --defaults
```

Fully headless with your own values (any flag skips its prompt; see `npx @veams/vault-starter-kit --help`):

```sh
npx @veams/vault-starter-kit --target ./my-vault \
  --name 'Jane Dev' --role 'Staff Engineer' --email 'jane@acme.dev' \
  --atlassian --atlassian-url 'https://acme.atlassian.net/' --github --no-figma
```

What it does:
- Copies the vault skeleton and fills in your identity everywhere (`CLAUDE.md`, `00 Context/About Me.md`, Claudian settings, git author).
- Keeps or removes optional pieces based on your answers (Atlassian / GitHub / codegraph / Figma).
- Optionally runs `git init` + the first commit.

---

## 3. Open the vault

```sh
cd ./my-claudian-vault
```

Open the folder in your editor or run your agent CLI from the vault root. Start with:

- `WALKTHROUGH.md`
- `CLAUDE.md` / `AGENTS.md` / `CODEX.md` / `GEMINI.md`
- `00 Context/About Me.md`

---

## Optional: Obsidian setup

1. Obsidian → **Open folder as vault** → pick the generated folder.
2. Trust the vault when prompted (Dataview queries and the project tables need it).

Then see **[docs/plugins.md](docs/plugins.md)** for optional Claudian, BRAT, and Dataview setup.

---

## 4. Set up MCP servers (optional)

If you enabled any integrations, see **[docs/mcp-setup.md](docs/mcp-setup.md)** for Atlassian,
GitHub, and codegraph setup.

---

## 5. Learn the system

Read **[WALKTHROUGH.md](WALKTHROUGH.md)**: the vault tour, how projects and tasks work, what each
skill does, and how the multi-agent workflow YAML works.

---

## Troubleshooting

- **`node: command not found`** → install Node 18+ first; `npx` needs it.
- **Shell errors like `GVM_ROOT not set` / profile noise** → your shell profile is sourcing a tool
  that isn't installed. It does not affect the scaffolder (Node ignores your shell init). Fix your
  `~/.zshrc`/`~/.bashrc` separately.
- **Dataview tables empty in the Demo Project** → only relevant in Obsidian. Install + enable the
  Dataview community plugin and reload the vault.
- **Paths:** inside the vault, always use paths **relative to the vault root** (e.g.
  `02 Projects/Demo Project/...`). A leading `/` or an absolute path will not resolve.
