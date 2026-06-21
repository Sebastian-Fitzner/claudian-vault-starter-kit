# Personalization Reference

The scaffolder (`scaffold.mjs`) replaces a fixed set of `{{PLACEHOLDER}}` tokens and gates optional
sections. This page documents what gets filled and how to change it later.

---

## Placeholders filled at scaffold time

| Placeholder | Prompt | Example | Appears in |
| --- | --- | --- | --- |
| `{{DEV_NAME}}` | Your name | `Jane Dev` | `CLAUDE.md`, `00 Context/About Me.md`, `.claudian/claudian-settings.json` |
| `{{DEV_ROLE}}` | Your role | `Senior Engineer` | `CLAUDE.md`, `About Me.md` |
| `{{DEV_EMAIL}}` | Git commit email | `jane@acme.dev` | git author |
| `{{DEV_STACK}}` | Stack/focus one-liner | `Fullstack: TS, Go, AWS.` | `CLAUDE.md`, `About Me.md` |
| `{{DOMAIN_FOCUS}}` | Current domain focus | `payments infra` | `CLAUDE.md`, `About Me.md` |
| `{{BUSINESS_LANGUAGE}}` | Business/strategy language | `German` | `CLAUDE.md`, `About Me.md` |
| `{{ATLASSIAN_CLOUD_URL}}` | Atlassian cloud URL | `https://acme.atlassian.net/` | `CLAUDE.md` (Atlassian block) |
| `{{DEV_GIT_AUTHOR}}` | derived `name <email>` | `Jane Dev <jane@acme.dev>` | `CLAUDE.md` git rule, first commit |

> Placeholders the scaffolder **deliberately leaves alone**: `{{date}}`, `{{time}}`, `{{local_path}}`,
> `{{project_name}}`, `{{task_id}}`, `{{persona_name}}`, etc. Those belong to the **templates** in
> `08 Templates/` and are filled later, at runtime, by the `project-creation` / `task-creation`
> skills. The scaffolder only resolves a known key list, so it never clobbers them.

---

## Feature gating

Optional integrations are toggled by `<!-- feature:NAME -->` … `<!-- /feature:NAME -->` markers in
`CLAUDE.md` / `AGENTS.md`, plus a skill map in `kit.manifest.json`:

| Feature | Off → removes section | Off → removes skills |
| --- | --- | --- |
| `atlassian` | Atlassian/Jira block in `CLAUDE.md` | — |
| `github` | — | — |
| `codegraph` | codegraph block in `CLAUDE.md` + `AGENTS.md` | `code-graph-index` |
| `figma` | figma routing line in `CLAUDE.md` | `figma-bridge`, `design-in-figma` |

---

## Changing things after scaffolding

- **Identity / rules** → edit `CLAUDE.md` and `00 Context/About Me.md` directly. They are plain
  Markdown now; no placeholders remain.
- **Turn a feature on later** → re-add its skill folder from a fresh scaffolded vault into `skills/`,
  and re-add the relevant `CLAUDE.md` section from the package template.
- **Claudian model/effort/panel** → `.claudian/claudian-settings.json`.

## Re-running the scaffolder

The CLI refuses to write into a non-empty target. To regenerate, point `--target` at a fresh folder
and diff against your current vault, or just edit files in place. The kit is yours after the first run.
