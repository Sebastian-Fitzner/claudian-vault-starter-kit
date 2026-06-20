---
name: task-creation
description: create a new task note inside the correct project folder in the obsidian vault. use when the user asks to create a task, add a task, open a new task, or start task tracking. ask the required questions one by one, confirm the summary, determine the next task id, then create task-{id}.md with the required yaml fields and worktree handling rules.
---

# Task Creation

Create task notes in a repeatable, approval-gated flow.

## Workflow

1. Detect task-creation intent.
2. Do not create files yet.
3. Ask these questions one by one and wait after each answer.
   1. Project
   2. Goal
   3. Tags
   4. Persona from the assigned project's `reference/Best Practices` or `reference/best-practices`
      - provide the project-scoped list when asking
      - prefer project-specific personas over generic personas when both exist
   5. Jira (optional)
   6. Branch (optional)
   7. Use worktree for this branch? Default to yes when a branch is provided.
8. Present a short summary for confirmation.
9. Only after confirmation:
   - resolve the project folder
   - determine the next available task id (zero-padded to 3 digits)
   - derive a short headline from the goal (title-case, no special characters)
   - use [[08 Templates/task/task|08 Templates/task/task.md]] as the starting template
   - create `task-{NNN} - {Headline}.md` (e.g. `task-003 - Project Scaffolding and Data Model.md`)
   - populate yaml
   - set `status: created`
   - explain the file operation briefly
6. After the task has been created successfully, suggest the next workflow step explicitly:
   - `Do you want to plan the task implementation next?`

## Required yaml fields

Always set:
- `tags`
- `status: created`
- `created` — date of creation (e.g. `2026-05-18`)
- `created_time` — time of creation as a readable 12-hour clock string (e.g. `10:15am`); get the current local time at the moment the file is written
- `estimate` — leave blank; filled during planning
- `started_at` — leave blank; stamped when the first workflow state (planning) starts
- `finished_at` — leave blank; stamped during finalize or when the task is marked completed
- `persona`
- `worktree`

Set when provided:
- `jira`
- `branch`

## Required body sections

The task file must include a `## Timeline` section directly after `## Status`, scaffolded as an empty table:

```markdown
## Timeline

| task state | description | started_at | finished_at |
| --- | --- | --- | --- |
```

The table is mandatory. Downstream skills (`task-planning`, `task-implementation`, `task-review`, `address-pr-findings`, `task-finalize`) stamp one row per workflow state transition. Use the readable 12-hour clock format `YYYY-MM-DD hh:mma|pm` (e.g. `2026-05-19 05:20pm`).

The task file must include a `## Key Decisions` section before `## Notes`:

```markdown
## Key Decisions
```

Downstream implementation, review-fix, and finalization workflows append every implementation-affecting decision here so project LLM wikis can later extract what was actually done and why.

The task file must include a `## Git Commits` section after `## Key Decisions` and before `## Notes`:

```markdown
## Git Commits

| commit | message |
| --- | --- |
```

[[skills/task-finalize/SKILL|task-finalize]] appends one row per created commit so project LLM wikis can later track exactly which commit carried which work.

### Canonical task state labels

Skills must use these exact labels in the `task state` column:

| Phase | Label |
| --- | --- |
| Initial planning | `planning` |
| Plan revision after planning is closed | `update plan` |
| Plan review before implementation | `review plan` |
| Follow-up review after plan revision | `review updated plan` |
| Code work for approved plan | `implementing plan` |
| Code work for review-surfaced issues | `implementing review findings` |
| Code work for PR review findings | `implementing pr findings` |
| First review pass after implementation | `review initial implementation` |
| Review pass after fixes were applied | `review fixes` |
| Commit, push, and PR creation | `finalizing` |

### Description column

The `description` column is mandatory. Each row must contain a short caveman-style fragment:
- no articles (a/an/the), no filler (just/really/basically), no pleasantries
- imperative or noun fragments only
- under ~60 characters when possible
- examples: `scaffold base + tests`, `fix CSS vars, drop dead code`, `address blocking comments`, `initial plan for retry logic`, `bounce from review: naming + null guards`

Each state-entering skill writes the description in the same step where it appends the row. If the user has not provided one, derive a fragment from the goal, the plan step, or the surfaced findings.

## Worktree rules

- If no branch is provided, set `worktree: false`.
- If a branch is provided and the user accepts the default, set `worktree: true`.
- If a branch is provided and the user explicitly declines, set `worktree: false`.

## Rules

- Never ask all questions at once.
- Never create the task before confirmation.
- Never guess the project when multiple active projects fit.
- Keep naming and numbering consistent with existing tasks.
- Resolve personas only from the assigned project's `reference/Best Practices` or `reference/best-practices` first.
- Prefer project-specific personas over generic personas from the same project scope.
- Do not offer or lead with personas from another project scope.
- Use the assigned persona exactly as chosen unless the user changes it.

## Output contract

The task file must include the goal, metadata, and any branch/worktree information needed for later implementation.
The task file must also make the current workflow phase explicit via `status`.
Close by suggesting [[skills/task-planning/SKILL|task-planning]] as the next step.

## Linked notes

- [[08 Templates/task/task|Task template]]
- [[00 Context/workflows/Task and Project Management|Task & Project Workflows]]
