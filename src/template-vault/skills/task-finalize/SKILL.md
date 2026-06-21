---
name: task-finalize
description: finalize a coding task by chunking changes into conventional commits, pushing the branch, and creating a pull request. use after implementation (and optionally review) is done, when the user wants to commit, push, and open a PR. works in a git worktree or in the main repo on a feature branch.
---

# Task Finalize

Commit, push, and open a pull request for a completed coding task.

## When to use

- The user says "finalize", "commit and push", "open a PR", "ship it", or similar.
- Implementation is done and the code is ready to leave the local machine.
- Works in a dedicated git worktree **or** directly on a feature branch in the main repo.

## When NOT to use

- Changes have not been implemented yet — route to [[skills/task-implementation/SKILL|task-implementation]].
- The user only wants a review without committing — route to [[skills/task-review/SKILL|task-review]].

## Workflow

1. **Read the task note** — collect `ticket`, `branch`, `assigned-project`, acceptance criteria, and the implementation plan / notes section. These feed into commit messages and the PR description.
2. **Update the task note FIRST, before any commit/push/PR work:**
   - set `status: finalizing`
   - append a new row to the `## Timeline` table: `| finalizing | <description> | <now> | |` where:
     - `<description>` is a caveman fragment (no articles/filler, ≤ ~60 chars) — examples: `chunk commits and open PR`, `commit + push + PR for state handlers`
     - `<now>` is the current local date-time in readable form (e.g. `2026-05-19 08:06pm`)
   - if the YAML `started_at` field is empty (legacy task), stamp it with the same `<now>` value.
   - if the `## Timeline` section is missing (legacy task), create it directly after the `## Status` section using the required header (`| task state | description | started_at | finished_at |`).
   - ensure the task note has a `## Key Decisions` section. If missing in a legacy task, create it before `## Notes` when that section exists; otherwise create it after `## Timeline`.
   - ensure the task note has a `## Git Commits` section. If missing in a legacy task, create it after `## Key Decisions` when that section exists; otherwise create it before `## Notes` when that section exists. Include the table header `| commit | message |`.
3. **Detect the working environment.**
   - If inside a git worktree, use it as-is.
   - If on a feature branch in the main repo, use it as-is.
   - If on the main/default branch with uncommitted changes, stop and ask the user which branch to create or switch to.
4. **Resolve the git author** from the repository:
   - Run `git config user.name` and `git config user.email` in the repo.
   - Use the result as the `--author` for every commit.
   - If the project's CLAUDE.md or vault CLAUDE.md specifies an `--author` override, prefer that.
   - Never attribute commits to an AI or bot identity.
5. **Resolve commit conventions from the repository.**
   - Always run `git log --oneline --no-merges -20` in the target repo and match the existing commit style (type prefixes, scope format, casing, ticket ID placement or absence).
   - The repo's actual history is the source of truth — not a generic default.
   - If the history is empty or inconsistent, fall back to [Conventional Commits](https://www.conventionalcommits.org/).
6. **Inventory all uncommitted changes.**
   - Run `git status` (never `-uall`) and `git diff` (staged + unstaged).
   - List every changed, added, and deleted file.
7. **Group changes into logical chunks.**
   - Each chunk must be a coherent, self-contained unit of work (one concern per commit).
   - Grouping heuristics — combine by:
     - feature / behavioral change
     - file type or layer (e.g. styles, tests, config)
     - shared intent (e.g. "rename X across codebase")
   - Prefer fewer, meaningful commits over many tiny ones. A single commit is fine when all changes serve one purpose.
   - Never mix unrelated concerns in one commit.
   - If chunking requires adapting the implementation handoff, squashing separate concerns, or splitting work in a non-obvious way, record that choice in `## Key Decisions`.
8. **Present the commit plan to the user before committing.**
   - Show a numbered list: files in each chunk and the proposed commit message.
   - Wait for approval or adjustments.
   - If the user says "just do it" or "go ahead", skip the approval wait in future steps.
   - Record approved commit-plan adjustments in `## Key Decisions` when they affect how the work is represented or reviewed.
9. **Commit each chunk** in logical order.
   - Stage only the files belonging to the current chunk (`git add <file>...`).
   - Write a conventional commit message:
     - Subject line: `<type>[optional scope]: <short imperative description>` (max ~72 chars).
     - Body (when needed): explain *why*, not *what*. Keep it concise.
   - Use the resolved `--author` flag on every `git commit`.
   - After each commit, capture the created commit hash and subject with `git log -1 --format='%H%x09%s'`.
   - Keep the captured commit list for the task note's `## Git Commits` section and final output.
10. **Push the branch** to the remote.
    - `git push -u origin <branch>` for the first push.
    - `git push` for subsequent pushes.
    - If the push is rejected, diagnose before force-pushing. Never force-push without explicit user approval.
11. **Collect PR context.**
    - From the task note: ticket ID, acceptance criteria, implementation plan, key decisions, and learnings.
    - From the diff against the base branch: summarize what changed and why.
    - Identify how a reviewer can test or verify the changes locally.
12. **Create the pull request** using `gh pr create`.
    - **Title**: short, imperative, under 72 characters. Include ticket ID when available (e.g. `FC-12345: Add company search to registration`).
    - **Body** — use this structure:

      ```
      ## Ticket
      <link or ID>

      ## Why
      <1-3 sentences: the problem or goal that motivated these changes>

      ## Changes
      <bulleted summary of what changed, grouped by concern>

      ## Architecture / Flow (optional)
      <mermaid diagram or short description when the change touches multiple components or alters a flow>

      ## How to test
      <concrete steps a reviewer can follow to verify the changes locally>
      ```

    - Omit the `Architecture / Flow` section when the change is straightforward.
    - Never add AI attribution, "Generated with", or bot footers.
    - Use a HEREDOC to pass the body to `gh pr create` for correct formatting.
13. **Update the task note at the end.**
    - Add the PR URL to the task's notes section.
    - If the task has a `pr` property, set it to the PR URL.
    - Append any finalization decisions to `## Key Decisions`, including adapted commit grouping, base branch, PR title/body strategy, review status choice, or completed-without-review confirmation.
    - Append every created commit to `## Git Commits` using the exact table format below. Use the full hash in the `commit` column and the commit subject in the `message` column.
    - Stamp YAML `finished_at` with the current local date-time in readable form (e.g. `2026-05-19 08:06pm`).
    - Close the open `finalizing` row in the `## Timeline` table by writing the same date-time into its `finished_at` column. Match the exact row opened in step 2.
    - Update `status: in-review` (or `completed` if the user confirms no further review is needed).
14. **Report the result** to the user:
    - PR URL
    - Number of commits created
    - Branch name
    - Any follow-up actions (e.g. worktree cleanup, reviewer assignment).

## Git Commits

`## Git Commits` is the durable commit ledger for the task. It must exist after finalization, and every commit created by this workflow must be listed there.

Use this exact format:

```markdown
## Git Commits

| commit | message |
| --- | --- |
| `<full-commit-hash>` | `<commit subject>` |
```

Rules:
- Append one row per commit created during this finalize run.
- Use the full commit hash from `git log -1 --format=%H`, not only the short hash.
- Use the commit subject from `git log -1 --format=%s`.
- If a commit message includes a body, the table still records the subject; the full message remains available from git history.
- Do not remove prior rows from earlier finalize runs.
- If no commit is created because the workflow stops before committing, do not add placeholder rows.

## Key Decisions

Every finalization-affecting decision made during this workflow must be recorded in the task note's `## Key Decisions` section.

Use this entry format:

```markdown
- <YYYY-MM-DD hh:mma> — task-finalize: <decision>; why: <reason>; impact: <what changed>
```

Record decisions such as:
- commit chunking that changes how the implementation is represented
- commit convention fallback or project-specific convention choice
- base branch choice when not obvious from the task note
- PR title/body framing that affects review expectations
- status choice between `in-review` and `completed`
- push, branch, or PR adjustments required by repository state

Do not record routine mechanical commits, command outputs, or status-only updates.

## Codegraph

- **Never run `codegraph init`, `codegraph index`, `codegraph sync`, or any index-mutating codegraph command during finalize.** codegraph refresh is owned exclusively by [[skills/task-planning/SKILL|task-planning]] step 10.
- **Never run an index-mutating codegraph command inside a worktree.** If the finalize is happening inside a worktree, leave any `.codegraph/` artifacts alone — do not create them, do not refresh them.
- The project note opts in via `code_graph: true`. Even then, finalize must not refresh the index.

## Rules

- Never commit as an AI or bot author. The commit author must be a real person.
- Never add AI attribution to PR descriptions.
- Never force-push without explicit user approval.
- Never commit secrets, `.env` files, or credentials — warn if any are staged.
- Always present the commit plan before executing unless the user explicitly opts out.
- Follow project-specific commit conventions when they exist; fall back to Conventional Commits.
- Keep PR descriptions precise and informative — no filler, no boilerplate.
- Use mermaid diagrams in the PR body when the change involves component interaction, data flow, or state transitions. Skip them for simple changes.
- The ticket reference is mandatory in the PR when a ticket ID is available in the task note.
- If the base branch for the PR is ambiguous, ask. Default to the project's main branch.
- Always edit the task file's `status` and `## Timeline` BEFORE any commit/push/PR work — never start the real finalize task until the task note reflects the new state.
- Always keep `## Key Decisions` current for finalization choices, so project LLM wikis can later extract how the work left the local machine and why.
- Always append created commit hashes and subjects to `## Git Commits` before reporting finalization complete.

## Output contract

The finalize result must include:
- PR URL (linked)
- commit list with messages
- confirmation that `## Git Commits` was updated with commit hashes and messages
- branch and base branch
- confirmation that no AI attribution was added
- any recommended follow-up (reviewer assignment, worktree cleanup)

## Linked notes

- [[skills/task-implementation/SKILL|task-implementation]]
- [[skills/task-review/SKILL|task-review]]
- [[00 Context/engineering/Coding Guidelines|Coding Guidelines]]
