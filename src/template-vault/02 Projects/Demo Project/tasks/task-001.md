---
tags:
  - task
project:
  "Demo Project":
status: created
id: "001"
created: "2026-01-01"
created_time: "09:00"
estimate:
started_at:
finished_at:
persona: []
jira:
branch:
worktree: false
---

## Goal

Example task. Shows the fields and sections every task carries. Replace or delete.

## Status

created

## Timeline

| task state | description | started_at | finished_at |
| --- | --- | --- | --- |

## Next Steps

- [ ] Run the `task-planning` skill on this task to produce an implementation plan

## Key Decisions

## Git Commits

| commit | message |
| --- | --- |

## Notes

- `status` moves through: `created` → `planning` → `reviewing-plan` → `in-progress` → `review` → `completed`.
- `worktree: true` makes the workflow build the branch inside a `git worktree` sibling of the repo.
- `persona` is filled by the planning skill from the project's `reference/best-practices/` set.
