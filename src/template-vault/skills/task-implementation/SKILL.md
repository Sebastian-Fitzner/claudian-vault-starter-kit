---
name: task-implementation
description: implement an approved task in a controlled way after planning is finished. use when the user approves a plan and wants execution to start. add the approved plan to the task notes, prepare or reuse a git worktree when required, implement with the assigned project-scoped persona set, follow coding guidelines, and do not deviate from the approved plan without flagging it. do not use for review findings; route those to address-pr-findings.
---

# Task Implementation

Implement only after planning is approved.

Do not use this skill to fix findings surfaced by [[skills/task-review/SKILL|task-review]] or PR review notes. Use [[skills/address-pr-findings/SKILL|address-pr-findings]] for those implementation passes.

## Workflow

1. Inspect task properties before coding, especially `status`, `branch`, and `worktree`.
2. Confirm that an implementation plan exists and has been approved in [[skills/task-planning/SKILL|task-planning]].
3. If the user asks to fix task-review findings or PR-review findings, stop and route to [[skills/address-pr-findings/SKILL|address-pr-findings]] instead.
4. If `status` is not `planned`, stop and guide the user to planning first. Example: `This task is not in a planned state yet. Before implementation, we should plan the task.`
5. Update the task note before making any code changes:
   - set `status: implementing`
   - determine the timeline label:
     - Use `implementing plan` for the approved plan.
     - Do not use `implementing review findings`; [[skills/address-pr-findings/SKILL|address-pr-findings]] owns review-finding fixes.
   - append a new row: `| <label> | <description> | <now> | |` where:
     - `<description>` is a caveman fragment (no articles/filler, ≤ ~60 chars) — examples: `scaffold base + tests`, `wire dataview query`
     - `<now>` is the current local date-time in readable form (e.g. `2026-05-18 10:15am`)
   - if the YAML `started_at` field is still empty (legacy task or planning was skipped), stamp it with the same `<now>` value.
   - if the `## Timeline` section is missing (legacy task), create it directly after the `## Status` section using the required header (`| task state | description | started_at | finished_at |`).
6. Add the approved plan to the task file Notes section if not given.
7. Ensure the task note has a `## Key Decisions` section. If missing in a legacy task, create it before `## Notes` when that section exists; otherwise create it after `## Timeline`.
8. Resolve the persona scope from the assigned project's `reference/Best Practices` or `reference/best-practices`.
9. Use the assigned persona set only if every listed persona belongs to the assigned project scope.
10. If multiple personas are assigned, use the first listed persona as the primary implementation lens and the rest as supporting constraints.
11. Prefer the project-specific persona when both project-specific and generic personas are applicable.
12. If any task persona appears to come from another project scope, stop and clarify before implementing.
13. If `worktree: true` and `branch` is set:
   - resolve the repository path from the linked project note `local` property — the path is relative to the project note's location, never search the filesystem for the repo
   - if `local` is missing or the resolved path does not exist, stop and ask the user to update the project note's `local` property
   - create or reuse a dedicated git worktree
   - create it as a sibling folder of the main checkout
   - use folder pattern `<repo-name>-<branch-slug>`
   - use branch-slug = lowercase branch name with `/` replaced by `-`
   - attach to existing branch if it already exists
   - create the branch from the project main branch if missing
   - ask only if the base branch is unclear
14. Implement with the resolved project-scoped persona set in the correct repository or worktree.
15. Follow [[00 Context/engineering/Coding Guidelines|Coding Guidelines]] throughout.
16. If a better approach or conflict appears, stop and discuss before deviating. When the user approves the decision, append it to `## Key Decisions` before continuing.

## Key Decisions

Every implementation-affecting decision made during this workflow must be recorded in the task note's `## Key Decisions` section.

Use this entry format:

```markdown
- <YYYY-MM-DD hh:mma> — task-implementation: <decision>; why: <reason>; impact: <what changed>
```

Record decisions such as:
- approved deviations from the implementation plan
- architecture, API, data-flow, state, dependency, or persistence choices
- scope tradeoffs, fallback behavior, compatibility choices, or migration choices
- testing strategy changes that affect confidence or coverage
- project-specific persona or Coding Guideline tradeoffs

Do not record routine mechanical edits, command outputs, or status-only updates. If no implementation-affecting decision was made beyond the approved plan, do not add a placeholder entry.

## Coding behavior

- state assumptions when uncertain
- prefer minimal code
- make surgical changes only
- match existing style unless persona best practices require a different direction and that change is approved
- remove only unused code created by your own changes
- support both scalar and list values in the `persona` field, but write new task files with `persona` as a list
- prefer project-specific persona guidance over generic persona guidance when both exist in the assigned project scope
- never use a persona from another project scope as the leading implementation lens
- if any resolved persona has a `## Quick Reference` section, use it as an active checklist while implementing — verify each rule against the code being written
- always edit the task file's `status` and `## Timeline` BEFORE any persona resolution, worktree setup, or code change — never start the real task until the task note reflects the new state
- always keep `## Key Decisions` current when implementation choices are made, so project LLM wikis can later extract what was done and why

## Verification

Implementation is not done until the planned verification steps have been executed or explicitly discussed.
Before completing the implementation, run project-specific type checks, linters, tests, and builds to ensure no regressions were introduced.
When implementation is complete and the task is ready for review, update the task note:
- set `status: implemented`
- close the open `implementing plan` row in the `## Timeline` table by writing the current local date-time into its `finished_at` column. Match the exact row that was opened in step 5.
- ensure every implementation-affecting decision made during the work is present in `## Key Decisions`, including any approved plan deviation, tradeoff, or fallback choice

## Git

- **Never create a git commit during implementation.** Committing is part of the review/handoff step, not implementation.
- Stage and commit only when the user explicitly asks.

## Codegraph

- **Never run `codegraph init`, `codegraph index`, `codegraph sync`, or any index-mutating codegraph command during implementation.** (Read-only codegraph queries are fine.)
- codegraph refresh is owned exclusively by [[skills/task-planning/SKILL|task-planning]] step 10 and only runs when the project note has `code_graph: true` and the existing `.codegraph/codegraph.db` index is in the main checkout.
- **Never run an index-mutating codegraph command inside a worktree**, even if the project has `code_graph: true`. Worktree paths must stay free of `.codegraph/` directories.
- If a `.codegraph/` folder appears inside the current worktree, do not touch it; mention it to the user as cleanup follow-up — do not delete it on your own.

## Completion handoff

At the end of implementation, prepare for [[skills/task-review/SKILL|task-review]] instead of marking the task completed automatically.
Prompt the user with the explicit next step:
- `Implementation is done. Do you want to review the task now?`

## Linked notes

- [[skills/task-planning/SKILL|task-planning]]
- [[skills/address-pr-findings/SKILL|address-pr-findings]]
- [[skills/task-review/SKILL|task-review]]
- [[00 Context/engineering/Coding Guidelines|Coding Guidelines]]
