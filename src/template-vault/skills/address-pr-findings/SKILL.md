---
name: address-pr-findings
description: address findings from an existing task review summary or PR review by locating the relevant task-file `Review Summary`, `pr-review` note, or task-linked `PR Review`, selecting the findings that belong to the task, and implementing fixes with the relevant personas from the assigned project's best-practices scope while following the normal task workflow.
---

# Address PR Findings

Implement review follow-up only after the review source is clear. This skill owns fixing findings surfaced by [[skills/task-review/SKILL|task-review]] and PR review notes.

## Workflow

1. Read the task before coding, especially `status`, `persona`, `jira`, `branch`, `worktree`, Notes, and `## Review Summary`.
2. Confirm the task is ready for a findings implementation pass:
   - `status: planned` is valid for planned PR-review fixes.
   - `status: implemented` is valid when the task file contains an unresolved `## Review Summary` with blocking findings from [[skills/task-review/SKILL|task-review]].
   - Otherwise stop and guide the user to the missing workflow step first.
3. Update the task note FIRST, before doing any full review-source resolution or implementation work:
   - set `status: implementing`
   - determine the timeline label from the requested source:
     - Use `implementing review findings` when the user asks for task-review findings or the task file has an unresolved `## Review Summary`.
     - Use `implementing pr findings` when the user asks for PR-review findings or no task-file `## Review Summary` is in scope.
   - append a new row to the `## Timeline` table: `| <label> | <description> | <now> | |` where:
     - `<description>` is a caveman fragment summarizing the scoped findings being addressed (no articles/filler, ≤ ~60 chars) — examples: `address blocking comments on auth flow`, `fix CSS var naming + dead branch`, `tighten null guards from reviewer notes`
     - `<now>` is the current local date-time in readable form (e.g. `2026-05-19 08:06pm`)
   - if the YAML `started_at` field is empty (legacy task), stamp it with the same `<now>` value.
   - if the `## Timeline` section is missing (legacy task), create it directly after the `## Status` section using the required header (`| task state | description | started_at | finished_at |`).
4. Ensure the task note has a `## Key Decisions` section. If missing in a legacy task, create it before `## Notes` when that section exists; otherwise create it after `## Timeline`.
5. Resolve the review source in this order:
   - explicit source named by the user
   - latest task-file `## Review Summary` that contains blocking findings
   - explicit `pr_review` property or `PR Review` entry/link in the task file
   - linked note in the task Notes section that clearly points to a `pr-review-*.md` note
   - matching note in the project `pr-reviews/` folder using `branch` first, then `jira`
6. If multiple review sources match, stop and ask the user which review to use. Record the approved scope choice in `## Key Decisions` before continuing.
7. If no review source can be resolved, stop and guide the user to create or link one first via [[skills/task-review/SKILL|task-review]] or [[skills/pr-code-review/SKILL|pr-code-review]].
8. Read the selected review source summary, findings, recommended actions, and open questions.
9. Resolve the relevant personas for the scoped finding from the assigned project's `reference/Best Practices` or `reference/best-practices`:
   - prefer the reviewers or personas already listed in the selected review source for that finding
   - prefer personas defined for the project over generic personas
   - use the task `persona` field as an additional constraint only when it matches the review context
   - if any task persona and review persona conflict, stop and clarify before implementing
10. Determine the implementation scope from the task goal, user instruction, and selected review source:
   - prioritize blocking and higher-severity findings first
   - if the task names a specific finding, stay narrow
   - if the review contains multiple unrelated findings, stop and ask whether to split them into separate tasks
11. Implement with the relevant project-specific persona lens from the review. The task persona list can narrow the scope, but it must not override the project review persona without explicit clarification.
12. Add the resolved review source location, the findings being addressed, and the persona lens used to the task Notes section if they are not already documented.
13. Resolve the repository path from the linked project note's `local` property. Always use this path as the working directory for code changes — never search for the repo manually.
14. If `worktree: true` and `branch` is set:
   - create or reuse a dedicated git worktree
   - create it as a sibling folder of the main checkout
   - use folder pattern `<repo-name>-<branch-slug>`
   - use branch-slug = lowercase branch name with `/` replaced by `-`
   - attach to existing branch if it already exists
   - create the branch from the project main branch if missing
   - ask only if the base branch is unclear
15. Implement only the scoped findings in the correct repository or worktree.
16. Follow [[00 Context/engineering/Coding Guidelines|Coding Guidelines]] throughout.
17. If a finding is outdated, incorrect, or conflicts with the current codebase state, stop and discuss before deviating. When the user approves the decision, append it to `## Key Decisions` before continuing.

## Key Decisions

Every fix-affecting decision made during this workflow must be recorded in the task note's `## Key Decisions` section.

Use this entry format:

```markdown
- <YYYY-MM-DD hh:mma> — address-pr-findings: <decision>; why: <reason>; impact: <what changed>
```

Record decisions such as:
- selected review source or selected subset of findings when multiple options exist
- approved interpretation of an ambiguous finding
- outdated, incorrect, deferred, or split findings and the reason
- fix strategy choices that affect architecture, behavior, API, data flow, tests, or compatibility
- verification changes made because the review finding changed the risk profile

Do not record routine mechanical edits, command outputs, or status-only updates.

## Coding behavior

- state assumptions when uncertain
- prefer minimal code
- make surgical changes only
- preserve unrelated code paths
- close the root cause, not just the reviewer-visible symptom
- remove only unused code created by your own changes
- if any resolved persona has a `## Quick Reference` section, use it as an active checklist while implementing — verify each rule against the code being written
- keep `## Key Decisions` current for every fix strategy or scope decision, so project LLM wikis can later extract what was done and why

## Verification

Implementation is not done until:
- the targeted finding can be shown as addressed
- the planned verification steps have been executed or explicitly discussed
- the task Notes section records which findings were fixed and how they were verified

When implementation is complete and the task is ready for review, update the task note:
- set `status: implemented`
- close the open `implementing review findings` or `implementing pr findings` row in the `## Timeline` table by writing the current local date-time into its `finished_at` column. Match the exact row opened in step 3.
- ensure every fix-affecting decision made during the work is present in `## Key Decisions`, including skipped/deferred findings, approved interpretations, and fix strategy tradeoffs

## Completion handoff

At the end of implementation, prepare for [[skills/task-review/SKILL|task-review]] instead of marking the task completed automatically.
Prompt the user with the explicit next step:
- `Implementation is done. Do you want to review the task now?`

## Codegraph

- **Never run `codegraph init`, `codegraph index`, `codegraph sync`, or any index-mutating codegraph command while addressing review findings.** (Read-only codegraph queries are fine.) Refresh is owned exclusively by [[skills/task-planning/SKILL|task-planning]] step 10 (project must have `code_graph: true`).
- **Never run an index-mutating codegraph command inside a worktree.** Worktree paths must stay free of `.codegraph/`.

## Rules

- Never assume the intended review note when multiple candidates exist.
- Never expand scope to optional findings without user approval.
- Never make [[skills/task-review/SKILL|task-review]] fix findings. This workflow owns the implementation pass for task-review and PR-review findings.
- Use the relevant project-specific review persona as the primary quality bar for implementation decisions.
- Support both scalar and list values in the `persona` field, but write new task files with `persona` as a list.
- Do not replace a project-specific review persona with generic task personas unless the user explicitly wants that.
- Never use a persona from another project scope as the leading implementation lens.
- Keep the task note and the resolved review source in sync.
- Always edit the task file's `status` and `## Timeline` BEFORE any review-source resolution or implementation — never start the real task until the task note reflects the new state.
- Always keep the task file's `## Key Decisions` section in sync with review-fix decisions before handing off to review.

## Linked notes

- [[skills/pr-code-review/SKILL|pr-code-review]]
- [[skills/task-planning/SKILL|task-planning]]
- [[skills/task-review/SKILL|task-review]]
- [[00 Context/engineering/Coding Guidelines|Coding Guidelines]]
