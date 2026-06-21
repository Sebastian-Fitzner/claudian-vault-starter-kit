---
name: task-plan-review
description: review an approved implementation plan before coding starts. use after task-planning has produced a plan, when the user asks to review, validate, stress-test, approve, or quality-check a task plan. check the plan in depth with every assigned project-scoped persona, Coding Guidelines, acceptance criteria, specialist needs, codegraph constraints, and verification coverage. write the plan review summary to the task file; do not implement or revise the plan in this workflow.
---

# Task Plan Review

Review the implementation plan before coding starts.

Review-only boundary: this skill never implements code and never rewrites the plan. It may edit only the task note for status, timeline, and plan review summary. Plan fixes belong to [[skills/task-planning/SKILL|task-planning]] as an update-plan pass.

## Workflow

1. Read the task, especially goal, acceptance criteria, notes, implementation plan, estimate, `persona`, branch, worktree settings, and `status`.
2. If `status` is not `planned`, stop and guide the user to the missing workflow step first:
   - missing or incomplete plan -> [[skills/task-planning/SKILL|task-planning]]
   - implementation already started -> clarify whether the user wants task review instead
3. Verify the task file contains an H1 headline (`# ...`). If it is missing, stop and ask the user to provide one before continuing.
4. Update the task note while the plan review is in progress:
   - set `status: reviewing-plan`
   - determine the timeline label:
     - Use `review plan` when no prior plan review row exists in the `## Timeline` table.
     - Use `review updated plan` when a `review plan` row already exists.
   - append a new row: `| <label> | <description> | <now> | |` where:
     - `<description>` is a caveman fragment (no articles/filler, <= ~60 chars) - examples: `stress-test plan with personas`, `check risks + verification`, `review updated API plan`
     - `<now>` is the current local date-time in readable form (e.g. `2026-05-19 05:20pm`)
   - if the `## Timeline` section is missing (legacy task), create it directly after the `## Status` section using the required header (`| task state | description | started_at | finished_at |`).
5. Resolve the persona scope from the assigned project's `reference/Best Practices` or `reference/best-practices`.
6. Resolve every assigned task persona from that project scope. Support scalar and list values in the `persona` field.
7. If any assigned persona is missing from the project scope or appears to come from another project, stop and clarify before reviewing.
8. Prefer project-specific personas over generic personas from the same project scope when both are applicable.
9. Read [[00 Context/engineering/Coding Guidelines|Coding Guidelines]] and use them as a review checklist against the plan.
10. Check whether [[00 Context/Specialists/Specialists|Specialists]] should have been used during planning. If a specialist trigger matches and the plan does not mention specialist input or an explicit reason for skipping it, flag this as a plan finding.
11. Review codegraph handling without mutating the index:
   - Never run `codegraph init`, `codegraph index`, `codegraph sync`, or any index-mutating codegraph command. (Read-only queries are fine.)
   - If the project is opted in via `code_graph: true` and `<repo-path>/.codegraph/codegraph.db` exists in the main checkout, verify that the plan states whether [[skills/task-planning/SKILL|task-planning]] step 10 refreshed or intentionally skipped the index.
   - If either opt-in condition is false, treat codegraph as absent and do not read the index.
12. Consult the project LLM wiki for scope and context first: if `02 Projects/<Project>/llm-wiki/` exists, query it read-only (via [[skills/llm-wiki/SKILL|llm-wiki]] Query) for prior decisions, constraints, and risks, and flag any plan step that contradicts established project knowledge. Skip silently when no project LLM wiki exists. Then review the plan against this baseline checklist:
   - goal and acceptance criteria are fully covered
   - implementation scope is specific enough to execute
   - assumptions, alternatives, and tradeoffs are surfaced
   - plan follows KISS: simplest solution that meets the acceptance criteria, best current solution, with considered alternatives documented and their rejection reasons stated
   - sequencing avoids avoidable risk
   - changed files/modules/components are identifiable enough for implementation
   - data, API, migration, compatibility, security, and UX impacts are considered when relevant
   - verification is concrete per step and includes project-appropriate tests, linting, type checks, builds, or manual checks
   - estimate is plausible for the described scope
13. For each resolved persona, review the plan in depth:
   - apply every relevant persona rule
   - if the persona has a `## Quick Reference` section, iterate through each checklist item and verify it against the plan
   - identify blockers, risks, missing verification, over-scope, under-scope, and follow-up tasks
14. Write the final plan review summary to the task file under `## Plan Review Summary`. Include:
   - verdict: ready for implementation / needs plan revision
   - blocking findings, if any
   - persona-by-persona findings
   - risks and possible improvements
   - verification gaps
   - follow-up tasks worth creating
15. Use this exact per-persona format:

```markdown
### {Persona Title}

**{One bold verdict sentence - overall stance on the plan from this persona's lens.}**

| Type | Finding |
| --- | --- |
| PASS | {pass - short caveman fragment} |
| BLOCKER | **{critical issue title}** - {short caveman explanation. Fix: `{fix}.`} |
| RISK | **{risk title}** - {short caveman explanation.} |
| NOTE | {optional improvement or awareness item - short caveman fragment.} |
```

Rules:
- verdict sentence is bold, one line, direct
- findings are caveman-short: no articles, no filler, no hedging
- BLOCKER findings include a concrete fix in the same cell
- emit PASS rows only for notable correct patterns, not trivial compliance
- a persona with no findings writes one row: `| - | No material findings. |`
- do not duplicate findings across personas; if two personas flag the same issue, pick the most relevant persona and mention the second persona in parentheses
16. If the plan is ready:
   - set `status: planned`
   - close the open `review plan` (or `review updated plan`) row in the `## Timeline` table by writing the current local date-time into its `finished_at` column. Match the exact row opened in step 4.
   - suggest the next workflow step explicitly: `The plan review is complete. Do you want to implement the task now?`
17. If the plan needs revision:
   - set `status: planning`
   - close the open `review plan` (or `review updated plan`) row in the `## Timeline` table by writing the current local date-time into its `finished_at` column. Match the exact row opened in step 4.
   - suggest the next workflow step explicitly: `Plan review summary is in the task file. Do you want me to revise the plan via task-planning?`

## Rules

- Never implement code, edit repository source files, or run formatting/test commands that mutate the project.
- Never rewrite the plan during review, even if the fix is obvious.
- Never mark a plan ready when acceptance criteria, assigned persona rules, or required verification are materially missing.
- Use every assigned project-scoped persona as an active review lens, not only the first persona.
- Treat every active persona rule and Coding Guideline as a checklist against the plan.
- Always test the plan against KISS: flag any step more complex than the acceptance criteria require, any choice that is not the best current solution, or any plan that skips weighing alternatives.
- Consult the project LLM wiki read-only for scope and context when `02 Projects/<Project>/llm-wiki/` exists; never write to it from this review.
- Prefer project-specific persona guidance over generic persona guidance when both exist in the assigned project scope.
- Never use a persona from another project scope as a leading review lens.
- Always edit the task file's `status` and `## Timeline` before persona resolution or full review work.
- Keep findings specific enough that [[skills/task-planning/SKILL|task-planning]] can revise the plan without guessing.

## Output contract

The plan review result must clearly state:
- ready for implementation / needs plan revision
- blocking plan issues if any
- KISS verdict: whether the plan is the simplest, best current solution and whether alternatives were weighed
- whether the project LLM wiki was consulted and any contradictions it surfaced
- persona lenses used
- verification gaps
- follow-up tasks worth creating
- resulting `status`
- plan review summary in the task file

Close by suggesting [[skills/task-implementation/SKILL|task-implementation]] when ready, or [[skills/task-planning/SKILL|task-planning]] when revisions are needed.

## Linked notes

- [[skills/task-planning/SKILL|task-planning]]
- [[skills/task-implementation/SKILL|task-implementation]]
- [[00 Context/engineering/Coding Guidelines|Coding Guidelines]]
- [[00 Context/Specialists/Specialists|Specialists index]]
