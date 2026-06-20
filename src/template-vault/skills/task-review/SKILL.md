---
name: task-review
description: review finished task work before completion. use when implementation is done, when the user asks for a review, or before marking a task as completed. review the work with the assigned project-scoped persona set, write the review summary to the task file, and only allow completed status when the task satisfies the completion rules. do not fix findings; route fixes to address-pr-findings.
---

# Task Review

Review implementation before completion.

Review-only boundary: this skill never fixes findings. It may edit only the task note for status, timeline, and review summary. Code changes and finding fixes belong to [[skills/address-pr-findings/SKILL|address-pr-findings]].

## Workflow

1. Read the task, especially `persona`, acceptance criteria, notes, current status, and `status`.
2. If `status` is not `implemented`, stop and guide the user to the missing workflow step first.
3. Update the task note while the review is in progress:
   - set `status: reviewing`
   - determine the timeline label:
     - Use `review initial implementation` when no prior review row exists in the `## Timeline` table.
     - Use `review fixes` when a `review initial implementation` row already exists (this is a follow-up review after fixes were applied).
   - append a new row: `| <label> | <description> | <now> | |` where:
     - `<description>` is a caveman fragment (no articles/filler, ≤ ~60 chars) — examples: `check persona rules + acceptance criteria`, `verify CSS var fix landed`, `confirm tests cover regression`
     - `<now>` is the current local date-time in readable form (e.g. `2026-05-18 10:15am`)
   - if the `## Timeline` section is missing (legacy task), create it directly after the `## Status` section using the required header (`| task state | description | started_at | finished_at |`).
4. Resolve the persona scope from the assigned project's `reference/Best Practices` or `reference/best-practices`.
5. Review the implemented work with the assigned persona set only if every listed persona belongs to that project scope.
6. If multiple personas are assigned, use the first listed persona as the primary review lens and the rest as supporting constraints.
7. Prefer the project-specific persona when both project-specific and generic personas are applicable.
8. If any task persona appears to come from another project scope, stop and clarify before reviewing.
9. Review the task note's `## Key Decisions` section before reviewing code:
   - verify the section exists
   - verify entries are real decision records, not placeholders or generic status text
   - compare the implementation diff, plan, review fixes, and task notes against `## Key Decisions`
   - flag missing, stale, or misleading decision entries when implementation-affecting choices are visible in the work but not recorded
   - if no implementation-affecting choices were made beyond the approved plan, say that explicitly in the review summary
10. Review the implemented work with the resolved project-scoped persona set and [[00 Context/engineering/Coding Guidelines|Coding Guidelines]].
11. If any resolved persona has a `## Quick Reference` section, iterate through each checklist item and verify it against the changed code before writing the review summary.
12. Highlight:
   - issues
   - risks
   - possible improvements
   - possible follow-up tasks
12a. For each persona, write a dedicated sub-section in this exact format:

```markdown
### {emoji} {Persona Title}

**{One bold verdict sentence — overall stance on the implementation from this persona's lens.}**

|     | Finding |
| --- | ------- |
| ✅  | {pass — short caveman fragment} |
| 🔴  | **{critical issue title}** — {short caveman explanation. Fix: `{fix}.`} |
| ⚠️  | **{warning title}** — {short caveman explanation.} |
| 💡  | {note/suggestion — short caveman fragment.} |
```

Emoji key:
- ✅ — correct / pass / approved behavior
- 🔴 — blocking or high-severity issue
- ⚠️ — risk or should-fix concern
- 💡 — note, optional improvement, or awareness item

Rules:
- verdict sentence is bold, one line, direct — states the persona's overall stance
- findings are caveman-short: no articles, no filler, no hedging
- 🔴 findings include a concrete fix in the same cell
- emit ✅ rows for notable correct patterns — do not fill with trivial passes
- a persona may omit ✅ rows if nothing is worth calling out positively
- a persona with no findings writes one row: `| — | No material findings. |`
- do not duplicate findings across personas; if two personas flag the same issue, pick the most relevant one and note the second persona in parentheses

13. Write the final review summary to the task file under `## Review Summary` before any completion handoff. Include:
   - verdict: ready to complete / not ready to complete
   - blocking findings, if any
   - risks and possible improvements
   - follow-up tasks worth creating
   - verification performed or still missing
   - changes, potential follow-ups, and learnings
   - Key Decisions audit: whether `## Key Decisions` is present, whether it is complete, and any missing/stale/misleading decision entries
14. Validate completion rules.
15. When the task is ready and the user did not explicitly ask to complete/close it:
   - set `status: implemented`
   - close the open `review initial implementation` (or `review fixes`) row in the `## Timeline` table by writing the current local date-time into its `finished_at` column. Match the exact row opened in step 3.
16. Only when the task is ready and the user explicitly asked to complete/close it, update the task note:
   - set `status: completed`
   - close the open `review initial implementation` (or `review fixes`) row in the `## Timeline` table by writing the current local date-time into its `finished_at` column. Match the exact row opened in step 3.
   - if the YAML `finished_at` field is empty, stamp it with the same value.
17. When the task is ready but not explicitly completed, suggest the next workflow step explicitly:
   - `The review is complete. Do you want me to mark the task as completed?`
18. When the task is not ready:
   - set `status: implemented`
   - close the open review row (`review initial implementation` or `review fixes`) in the `## Timeline` table by writing the current local date-time into its `finished_at` column.
   - do not append an implementation row.
   - suggest the next workflow step explicitly:
     - `Review summary is in the task file. Do you want me to address the findings via address-pr-findings?`

## Completion rules

Before completed status is allowed:
1. Acceptance Criteria must be fully checked.
2. `## Key Decisions` must exist and must accurately record every implementation-affecting decision visible in the work, including implementation choices, review-fix decisions, and finalization choices when applicable.
3. Notes must describe:
   - what changed
   - important learnings

Always add the final review summary to the task file, including changes, potential follow-ups, and learnings.

## Codegraph

- **Never run `codegraph init`, `codegraph index`, `codegraph sync`, or any index-mutating codegraph command during review.** (Read-only codegraph queries are fine.) Refresh is owned exclusively by [[skills/task-planning/SKILL|task-planning]] step 10.
- **Never run an index-mutating codegraph command inside a worktree.** If the review happens inside a worktree, treat any local `.codegraph/` as out-of-scope artifacts.

## Rules

- Never silently mark a task completed when criteria are incomplete OR review summary is not written to the task file.
- Never modify repository source code, tests, generated assets, or project files while reviewing. Only the task file may be edited.
- Never fix review findings in this workflow, even if the fix is obvious. Route fixes through [[skills/address-pr-findings/SKILL|address-pr-findings]].
- Never set `status: implementing` or append `implementing review findings` from this skill.
- **Treat every active persona rule and Coding Guideline as a checklist against the changed code** — do not read changed files and still miss rule violations. Catching issues proactively is the review's job; waiting for the user to surface a violation is a review failure.
- Be specific about review findings.
- Separate blocking issues from nice-to-have improvements.
- Use the resolved project-scoped persona’s quality bar during review.
- Use `status` to make review readiness and follow-up action obvious.
- Treat missing, empty, placeholder-only, stale, or misleading `## Key Decisions` as a review finding. It is blocking when the implementation clearly made decisions that are not recorded.
- Support both scalar and list values in the `persona` field, but write new task files with `persona` as a list.
- Prefer project-specific personas over generic personas from the same project scope.
- Never use a persona from another project scope as the leading review lens.
- Always edit the task file's `status` and `## Timeline` BEFORE any persona resolution or review work — never start the real task until the task note reflects the new state.

## Output contract

The review result must clearly state:
- ready to complete / not ready to complete
- blocking issues if any
- whether `## Key Decisions` is present and complete
- follow-up tasks worth creating
- the resulting `status`
- review summary in task file
Close by suggesting completion when ready, or [[skills/address-pr-findings/SKILL|address-pr-findings]] when fixes are needed. Do not implement fixes during review.

## Linked notes

- [[skills/task-implementation/SKILL|task-implementation]]
- [[skills/task-finalize/SKILL|task-finalize]]
- [[00 Context/engineering/Coding Guidelines|Coding Guidelines]]
