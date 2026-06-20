# Walkthrough — Working with the Claudian Vault

This vault is a **second brain wired for AI-assisted engineering**. You talk to Claude (via the
Claudian panel or the Claude CLI) inside the vault; it follows the rules in `CLAUDE.md`, picks the
right **skill** for your intent, and reads/writes notes as it works.

---

## 1. The vault at a glance

| Folder | Purpose |
| --- | --- |
| `00 Context/` | Who you are + how the agent should behave. Profile, personas, specialists, writing style, coding guidelines, session routine, workflow YAML. **Always referenced.** |
| `01 Inbox/` | Unsorted capture. Default home for notes with no obvious place. |
| `02 Projects/` | Active, goal-driven work. One folder per project. Tasks live inside. |
| `03 Wiki/` | Evergreen, reusable knowledge. |
| `04 Resources/` | Reference material. |
| `05 Daily Notes/` | Daily continuity. |
| `06 Archive/` | Completed / inactive. |
| `07 Attachments/` | Media. |
| `08 Templates/` | Blueprints the skills stamp out (project, task). |
| `09 Raw Data/` | Unprocessed input. |
| `10 LLM Wiki/` | Global fallback LLM wiki when no project wiki applies. |

Root files `CLAUDE.md` / `AGENTS.md` / `CODEX.md` / `GEMINI.md` are the agent instructions.
`CLAUDE.md` is canonical; the others defer to it.

**Golden rules** (full list in `CLAUDE.md`):
- Projects = goal-oriented. Wiki = reusable knowledge. Keep notes atomic.
- Use `[[Wikilinks]]` to connect notes.
- The agent never deletes/overwrites without asking.
- Persona best-practices are the leading system; project `reference/best-practices/` overrides the global personas.

---

## 2. Personas & specialists

- **Personas** (`00 Context/Personas.md`) — reusable engineering "hats" (architect, frontend,
  backend, etc.). Skills load the relevant persona so reviews and plans apply the right rules.
- **Specialists** (`00 Context/Specialists/`) — deep, trigger-based experts (e.g. the CSS bug-fixing
  expert) loaded by the `specialist-investigation` skill for hard domain problems.
- **Project overrides** — a project's `reference/best-practices/<Persona>.md` **wins** over the global
  persona when they conflict. This is how per-project conventions stay authoritative.

---

## 3. Create a project

Tell the agent: *"create a project"* → it runs the **`project-creation`** skill. It asks a few
questions, then stamps `08 Templates/project/` into `02 Projects/<Name>/`.

The project note's **frontmatter is the control panel**:

```yaml
---
tags: [project]
status: active
created: 2026-01-01
local: ./repo/demo-app      # path to the code repo, RELATIVE TO THIS NOTE
code_graph: false           # opt into codegraph for this project
---
```

- **`local`** is how every skill finds your code. It is resolved relative to the project note —
  the agent **never searches the filesystem** for the repo. If `local` is missing or wrong, the
  agent stops and asks you to fix it.
- **`code_graph: true`** + a built index opts the project into codegraph (see the skills table).

A project folder grows these parts (see the bundled **`02 Projects/Demo Project/`**):

```
Demo Project/
├─ Demo Project.md            # the project note (goal, scope, task tables)
├─ tasks/                     # one file per task
├─ reference/                 # project-scoped best practices + GitHub conventions
│  └─ best-practices/         # one file per persona — these override global personas
├─ llm-wiki/                  # curated, compounding project knowledge (raw/ + wiki/)
└─ session-logs/              # `compress` writes session state here
```

---

## 4. Create a task

Tell the agent: *"create a task"* → the **`task-creation`** skill stamps `08 Templates/task/task.md`
into `02 Projects/<Project>/tasks/task-NNN.md`. Key frontmatter:

```yaml
---
tags: [task]
project: { "Demo Project": }
status: created
id: "001"
persona: []          # filled by planning from the project's best-practices set
jira:                # optional Jira key
branch:              # feature branch name
worktree: false      # true → work happens in a git worktree sibling of the repo
---
```

The project note auto-lists its tasks via two Dataview tables (Open / Completed).

---

## 5. The task lifecycle

Each stage is a skill. Trigger them by intent in plain language; the agent routes via the
**Workflow Routing** table in `CLAUDE.md`.

```
created → plan → review plan → implement → review → finalize (commit + PR)
```

| Say this | Skill | What happens | `status` |
| --- | --- | --- | --- |
| "plan this task" | `task-planning` | Picks the project persona, writes a stepwise plan into the task. **No code yet.** | `planning` |
| "review the plan" | `task-plan-review` | Stress-tests the plan against personas, guidelines, acceptance criteria. | `reviewing-plan` |
| "implement the task" | `task-implementation` | Executes the **approved** plan; prepares a worktree if `worktree: true`. Does **not** commit. | `in-progress` |
| "review the work" | `task-review` | Reviews the diff against every active persona rule + coding guidelines. | `review` |
| "finalize / ship it" | `task-finalize` | Chunks changes into conventional commits, pushes, opens a PR. | `completed` |
| "address PR findings" | `address-pr-findings` | Implements fixes from a PR review summary. | — |

Guardrails baked into the rules: planning needs approval before implementation; implementation
never commits; review applies persona rules proactively (it won't wait for you to spot a violation).

---

## 6. The skills (what each one is for)

| Skill | Use it when you want to… |
| --- | --- |
| `project-creation` | scaffold a new project note + folders |
| `task-creation` | add a task to a project |
| `task-planning` | produce an implementation plan for a task (no code) |
| `task-plan-review` | validate / stress-test a plan before coding |
| `task-implementation` | execute an approved plan |
| `task-review` | review finished work before completion |
| `task-finalize` | commit, push, open a PR |
| `address-pr-findings` | implement fixes from a PR/review summary |
| `specialist-investigation` | debug hard domain problems (e.g. CSS/browser) with a strict discovery pattern |
| `pr-code-review` | review a PR branch in a worktree with project personas |
| `deep-research` | produce a broad, cited research report |
| `obsidian-wiki` | turn research/docs into a source-backed Obsidian wiki |
| `llm-wiki` | build/query a compounding project knowledge base (Karpathy-style) |
| `code-graph-index` | build/refresh a codegraph index for a repo *(codegraph feature)* |
| `figma-bridge` | route Figma work (concept, components, tokens, Code Connect) *(figma feature)* |
| `design-in-figma` | generate/sync designs in Figma *(figma feature)* |

> Skills tied to an integration you turned **off** at scaffold time are not in your vault.

`skills/` is the **source of truth** for skills. When you add a new skill there, `CLAUDE.md` tells
the agent to sync it into the agent-specific skill folders (`.claude/`, `.codex/`, `.agents/`) —
**add/update only, never delete** (some skills are installed by the Obsidian plugin).

---

## 7. How workflows work (the YAML)

Beyond single skills, `00 Context/workflows/*.yaml` defines **multi-agent pipelines** — chains of
steps where different CLIs/models run different skills in sequence. The runner reads the YAML and
drives Claude and/or Codex through it.

Look at `00 Context/workflows/plan.yaml`:

```yaml
version: 1

defaults:
  cwd: .
  timeoutMs: 1800000

task:
  statusField: workflowStatus       # which task field the runner updates

completion:                          # how the runner knows a step finished
  strategy: taskTimeline             # read the task's "## Timeline" table
  heading: "## Timeline"
  finishedColumn: "finished_at"      # a non-empty finished_at = step done
  requireTaskFileChanged: true
  stateMapping:
    planning: "planning"
    review-planning: "reviewing-plan"

agents:                              # the CLIs the runner can call
  codex:
    command: codex
    args: [exec, --json, --dangerously-bypass-approvals-and-sandbox]
    models:
      gpt-5.5-high: { args: [--model, gpt-5.5, -c, reasoning_effort=high] }
  claude:
    command: claude
    args: [--print, --output-format, stream-json, ...]
    models:
      opus-max:    { args: [--model, opus, --effort, max] }
      sonnet-high: { args: [--model, sonnet, --effort, high] }

steps:                               # the pipeline, in order
  - id: planning
    agent: claude
    model: opus-max
    skill: /task-planning/SKILL.md
  - id: review-planning
    agent: codex
    model: gpt-5.5-high
    skill: /task-plan-review/SKILL.md

limits:
  maxReviewFixCycles: 2              # plan ↔ review loop cap
  stopOnStepFailure: true
```

Read it as: **"run `task-planning` on Claude/opus-max, then `task-plan-review` on Codex/gpt-5.5;
a step is done when its row in the task's Timeline table gets a `finished_at`; loop the
plan/review at most twice; stop on failure."**

To build your own pipeline: copy `plan.yaml`, swap the `steps` (each = an `id`, an `agent`, a
`model`, and a `skill`), and adjust `agents`/`models` to the CLIs you have installed. The other
bundled examples — `implement-code.yaml`, `wiki.yaml`, `ingest.yml` — follow the same shape for
implementation, wiki-building, and ingestion.

---

## 8. Memory & session commands

From `CLAUDE.md`:
- **`remember` / `save`** → the agent classifies the memory (writing preference → Writing Style;
  project memory → project note; technical → `04 Resources`; vault rule → `CLAUDE.md`).
- **`compress`** → writes a session log to the project's `session-logs/`.
- **`resume`** → reviews the last 3 session logs before continuing.

---

## 9. A typical day

1. *"create a project for X"* → fill in `local` repo path.
2. *"add a task to build feature Y"*.
3. *"plan the task"* → review the plan → approve.
4. *"implement it"* → *"review the work"* → *"ship it"*.
5. *"add what we learned to the llm wiki"* so the next task starts smarter.
