---
name: task-planning
description: plan implementation work for an existing task before any coding starts. use when the user asks to plan a task, start working on a task, prepare implementation, or discuss how to implement a task. choose the correct project-scoped persona from the assigned project's best-practices reference, load a matching specialist first when needed, produce a stepwise plan with verification, present it for discussion, and do not implement before approval.
---

# Task Planning

Plan first. Do not implement during this workflow.

## Workflow

1. Read the task and extract the goal, acceptance criteria, notes, persona, branch, worktree settings, and `status`.
2. Verify the task file contains an H1 headline (`# …`). If it is missing, stop and ask the user to provide one before continuing.
3. If `status` already indicates later workflow work such as `implementing`, `implemented`, `reviewing`, or `completed`, stop and clarify before replanning.
4. Update the task note to `status: planning` when this workflow starts. At the same moment:
   - Determine the timeline label:
     - Use `planning` when no prior `planning` or `update plan` row exists in the `## Timeline` table.
     - Use `update plan` when a `planning` row already exists (the plan is being revised after the initial planning phase closed).
   - Append a new row: `| <label> | <description> | <now> | |` where:
     - `<label>` is `planning` or `update plan`
     - `<description>` is a caveman fragment (no articles/filler, imperative or noun fragments, ≤ ~60 chars) — examples: `initial plan for X`, `revise retry strategy`, `re-scope after spec change`
     - `<now>` is the current local date-time in readable form (e.g. `2026-05-19 05:20pm`)
   - If the YAML `started_at` field is empty, stamp it with the same `<now>` value (this captures the overall task start).
   - If the `## Timeline` section is missing (legacy task), create it directly after the `## Status` section using the required header (`| task state | description | started_at | finished_at |`).
5. Resolve the persona scope from the assigned project's `reference/Best Practices` or `reference/best-practices`.
6. Choose the assigned persona as the primary working lens only if it belongs to that project scope.
7. Prefer project-specific personas over generic personas from the same project when both are applicable.
8. If the task persona is missing from the assigned project scope or appears to come from another project, stop and clarify before planning.
9. Check whether a specialist should be loaded before planning via [[00 Context/Specialists/Specialists|Specialists]] and [[skills/specialist-investigation/SKILL|specialist-investigation]].
10. **Refresh the project code graph (opt-in).** Only run this step when **all** of the following are true:
   - the project note has `code_graph: true` in its frontmatter
   - the project note's `local` property resolves to an existing directory (relative to the project note's folder)
   - `<repo-path>/.codegraph/codegraph.db` exists in that directory (the codegraph index has been built)

   When the preconditions are met, work in the **main checkout** (the path from `local`), never inside a worktree:
   - detect the default branch via `git -C <repo-path> symbolic-ref refs/remotes/origin/HEAD` (strip the `refs/remotes/origin/` prefix). If that fails, fall back to `main`, then `master`.
   - if `git -C <repo-path> rev-parse --abbrev-ref HEAD` is not the default branch, stop and ask the user to switch — never auto-checkout.
   - if `git -C <repo-path> status --porcelain` is non-empty, stop and ask the user to clean up — never auto-stash.
   - run `git -C <repo-path> pull --ff-only origin <default-branch>`. If the pull is rejected (history diverged), stop and ask — never force, rebase, or merge.
   - then run `codegraph sync "<repo-path>"` (via [[skills/code-graph-index/SKILL|code-graph-index]]) to refresh the index incrementally.
   - report briefly: which branch was pulled, how many commits were fast-forwarded, and forward codegraph's own sync summary verbatim.

   Skip this step silently when any precondition is false. Never run it inside a worktree, even if the task uses one.
11. Consult the project LLM wiki for scope and context, then clarify assumptions or ambiguities before making the plan. If `02 Projects/<Project>/llm-wiki/` exists, query it read-only (via [[skills/llm-wiki/SKILL|llm-wiki]] Query) for prior decisions, constraints, risks, and patterns that affect this task, and fold relevant findings into the assumptions and plan; skip silently when no project LLM wiki exists. When the index was refreshed in step 10, prefer the codegraph MCP tool `codegraph_explore` (or the CLI `codegraph query` / `codegraph callers|callees|impact`) over raw grep when reasoning about cross-file relationships.
12. Produce a concrete implementation plan with verification per step. Before finalizing, run an explicit design check and capture the answers in the plan: does this follow KISS, is it the best current solution, and which alternatives were considered and why rejected? Prefer the simplest option that satisfies the acceptance criteria.
13. After drafting the plan, derive a rough time estimate:
   - Sum the expected effort across all steps.
   - Format as `Xh Ymin` (e.g. `2h 30min`). Omit the hours part when under 1h (e.g. `45min`). Omit minutes when exactly on the hour (e.g. `3h`).
   - State the estimate explicitly in the plan presentation.
14. Present the plan and estimate for discussion.
15. Once the plan is accepted or finalized for handoff, update the task note:
   - Add the plan to the file.
   - Set `estimate` to the agreed estimate (e.g. `2h 30min`).
   - Change `status: planned`.
   - Close the open `planning` (or `update plan`) row in the `## Timeline` table by writing the current local date-time into its `finished_at` column. Match the row that was opened in step 4 — not any earlier closed row.
16. Suggest the next workflow step explicitly:
   - `Do you want to review the plan with task-plan-review before implementation?`
17. Stop. Do not implement yet.

## Plan format

Use this structure:

1. Step → verify: specific check
2. Step → verify: specific check
3. Step → verify: specific check

## Rules

- Always surface assumptions.
- Always present alternatives when there are multiple valid paths.
- Prefer the simplest workable approach.
- Always run the KISS check before finalizing: confirm the plan is the simplest solution that meets the acceptance criteria, is the best current solution, and that alternatives were weighed and rejected for stated reasons.
- Consult the project LLM wiki read-only for scope and context when `02 Projects/<Project>/llm-wiki/` exists; never write to it from this workflow.
- Use testable success criteria.
- Never start implementation in the planning phase.
- Use `status` to make the current planning phase visible in the task note.
- If a specialist matches the problem, load the specialist before finalizing the plan.
- Resolve personas from the assigned project scope first.
- Prefer project-specific personas over generic personas from the same project scope.
- Never use personas from another project scope as the leading planning lens.
- The graph refresh in step 10 is **opt-in via `code_graph: true`**. Never enable it implicitly, never run it inside a worktree, and never bypass the clean-tree / fast-forward guards.
- Always edit the task file's `status` and `## Timeline` BEFORE any planning, persona resolution, or graph refresh — never start the real task until the task note reflects the new state.

## Good verification examples

- bug fix → reproduce, fix, verify reproduction is gone
- validation → add failing test, make it pass
- refactor → verify tests unchanged before and after

## Output contract

A successful plan must make it obvious:
- what will be changed
- how success will be verified
- what assumptions are in play
- whether the plan follows KISS, why it is the best current solution, and which alternatives were rejected
- whether the project LLM wiki was consulted, and which decisions or constraints it surfaced
- whether specialist input changed the plan
- whether the code graph was refreshed in step 10, and which graph queries (if any) informed the plan
- what `status` should be after planning
- the rough time estimate written to the `estimate` field
- make it obvious that the plan is added to the task file
Close by suggesting [[skills/task-plan-review/SKILL|task-plan-review]] as the next quality gate once planning is done. [[skills/task-implementation/SKILL|task-implementation]] follows after the plan review is accepted.

## Linked notes

- [[00 Context/Specialists/Specialists|Specialists index]]
- [[skills/specialist-investigation/SKILL|specialist-investigation]]
- [[skills/code-graph-index/SKILL|code-graph-index]]
- [[skills/task-plan-review/SKILL|task-plan-review]]
- [[00 Context/workflows/Task Implementation|Task Implementation]]
