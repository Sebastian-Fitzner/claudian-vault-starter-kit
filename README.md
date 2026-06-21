# Vault Starter Kit

Scaffold a personalized engineering vault for AI-assisted project work: skills, task workflows,
project templates, personas, coding rules, and optional integrations.

The core workflow is editor-agnostic. Use the generated folder from any editor or agent CLI.
Obsidian is optional and documented separately.

## Quickstart

```sh
npx @veams/vault-starter-kit
```

The CLI asks for your name, role, email, stack, target directory, and optional integrations.
It then writes a personalized vault to the target folder.

Headless run with defaults:

```sh
npx @veams/vault-starter-kit --target ./my-vault --defaults
```

Headless run with explicit values:

```sh
npx @veams/vault-starter-kit --target ./my-vault \
  --name 'Jane Dev' \
  --role 'Staff Engineer' \
  --email 'jane@example.com' \
  --stack 'TypeScript, Node.js, Go, AWS' \
  --focus 'developer tooling' \
  --biz-lang 'English' \
  --github \
  --no-atlassian \
  --no-codegraph \
  --no-figma
```

## Requirements

- Node.js 18+
- git optional, used only when you keep the default first-commit step
- Agent CLIs optional, depending on how you want to use the vault

## CLI Options

| Option | Purpose |
| --- | --- |
| `--target DIR` | Create the vault in `DIR` |
| `--defaults`, `--yes` | Accept defaults without prompts |
| `--name NAME` | Your name |
| `--role ROLE` | Your role |
| `--email EMAIL` | Git author email |
| `--stack TEXT` | Stack or focus one-liner |
| `--focus TEXT` | Current domain focus |
| `--biz-lang LANG` | Business and strategy language |
| `--atlassian`, `--no-atlassian` | Include or remove Atlassian instructions |
| `--atlassian-url URL` | Atlassian cloud URL when Atlassian is enabled |
| `--github`, `--no-github` | Include or remove GitHub setup defaults |
| `--codegraph`, `--no-codegraph` | Include or remove codegraph skill/instructions |
| `--figma`, `--no-figma` | Include or remove Figma skills |
| `--git`, `--no-git` | Run or skip `git init` and the first commit |
| `--help`, `-h` | Show CLI help |

## After Scaffolding

```sh
cd ./my-vault
```

Start with these files:

- `WALKTHROUGH.md` for the vault tour and task lifecycle.
- `00 Context/About Me.md` for your profile.
- `CLAUDE.md`, `AGENTS.md`, `CODEX.md`, and `GEMINI.md` for agent instructions.
- `docs/mcp-setup.md` if you enabled MCP-backed integrations.

Open the folder in your editor or run your preferred agent CLI from the vault root.

## Optional Obsidian Setup

Obsidian is useful for graph navigation, Dataview tables, and the Claudian in-vault panel, but it
is not required for the workflow.

1. Install Obsidian from [obsidian.md](https://obsidian.md).
2. Open the generated folder as a vault.
3. Install optional plugins from `docs/plugins.md`.

## Package Contents

The npm package vendors `src/template-vault/`, so `npx` works without access to the source vault.
The publish pipeline runs a personal-data leak guard before publishing.

Maintainer notes live in `MAINTAINERS.md`.
