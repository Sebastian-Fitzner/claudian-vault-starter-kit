# Install — Claudian Vault Starter Kit

A ready-to-run Obsidian vault wired for AI-assisted engineering: project/task workflows,
reusable skills, personas, and multi-agent workflow definitions. This kit ships a clean,
**personalizable** skeleton — you run one script and it becomes *your* vault.

---

## 1. Prerequisites

| Tool | Why | Check |
| --- | --- | --- |
| **Node.js 18+** | runs the scaffolder | `node --version` |
| **Obsidian** | the vault UI | [obsidian.md](https://obsidian.md) |
| **Claude CLI** *(recommended)* | the agent that drives the skills | `claude --version` |
| **Codex CLI** *(optional)* | second agent used by some workflows | `codex --version` |
| **git** *(optional)* | branch/worktree task flow + first commit | `git --version` |

> **Windows:** run everything under **WSL2**. The scripts assume a POSIX shell.

---

## 2. Unzip & scaffold

```sh
unzip claudian-starter-kit.zip -d claudian-starter-kit
cd claudian-starter-kit
node scaffold.mjs
```

The scaffolder asks a handful of questions (name, role, email, stack, optional integrations),
then writes a personalized vault to the target folder you choose (default `./my-claudian-vault`).

Non-interactive run (accepts all defaults — handy for a quick look):

```sh
node scaffold.mjs --target ./demo-vault --defaults
```

Fully headless with your own values (any flag skips its prompt; see `node scaffold.mjs --help`):

```sh
node scaffold.mjs --target ./my-vault \
  --name 'Jane Dev' --role 'Staff Engineer' --email 'jane@acme.dev' \
  --atlassian --atlassian-url 'https://acme.atlassian.net/' --github --no-figma
```

What it does:
- Copies the vault skeleton and fills in your identity everywhere (`CLAUDE.md`, `00 Context/About Me.md`, Claudian settings, git author).
- Keeps or removes optional pieces based on your answers (Atlassian / GitHub / codegraph / Figma).
- Optionally runs `git init` + the first commit.

---

## 3. Open in Obsidian

1. Obsidian → **Open folder as vault** → pick the generated folder.
2. Trust the vault when prompted (Dataview queries and the project tables need it).

---

## 4. Install plugins

See **[docs/plugins.md](docs/plugins.md)** — installs **Claudian** (the AI chat/agent panel)
and **BRAT** (for beta plugins). Dataview is also recommended for the project/task tables.

---

## 5. Set up MCP servers (optional)

If you enabled any integrations, see **[docs/mcp-setup.md](docs/mcp-setup.md)** for Atlassian,
GitHub, and codegraph setup.

---

## 6. Learn the system

Read **[WALKTHROUGH.md](WALKTHROUGH.md)**: the vault tour, how projects and tasks work, what each
skill does, and how the multi-agent workflow YAML works.

---

## Troubleshooting

- **`node: command not found`** → install Node 18+ first; the vault scaffolder needs it before Obsidian.
- **Shell errors like `GVM_ROOT not set` / profile noise** → your shell profile is sourcing a tool
  that isn't installed. It does not affect the scaffolder (Node ignores your shell init). Fix your
  `~/.zshrc`/`~/.bashrc` separately.
- **Dataview tables empty in the Demo Project** → install + enable the Dataview community plugin and
  reload the vault.
- **Paths:** inside the vault, always use paths **relative to the vault root** (e.g.
  `02 Projects/Demo Project/...`). A leading `/` or an absolute path will not resolve.
