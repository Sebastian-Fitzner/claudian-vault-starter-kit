---
tags: [project]
status: active
created: 2026-01-01
local: ./repo/demo-app
code_graph: false
# Optional: enable Figma workflows for this project (used by figma-bridge skill).
# figma_org_url: https://www.figma.com/files/org/...
# figma_library: <FILE_KEY>
# figma_workspace: <FILE_KEY>
# figma_tokens_source: ./repo/demo-app/src/styles/tokens
# figma_code_connect: false
# figma_files: []
---

# Demo Project

> This is a worked example project. Use it as a reference for the shape every project takes,
> then delete it (or archive it to `06 Archive/`) once you have created your own.

## Goal

Demonstrate the project + task + skill workflow end to end with a small, throwaway app.

## Scope

- One example task (`tasks/task-001.md`) showing the task lifecycle
- A `reference/` folder showing where project-scoped best practices live
- An `llm-wiki/` skeleton showing where curated project knowledge accumulates

## Out of Scope

- Anything real. Replace before using.

## Constraints

- MVP first, optimize later
- Ship to learn, not to perfect

## Status

In Progress

## Next Steps

- [ ] Replace this demo with a real project via the `project-creation` skill

## Tasks

### Open

```dataview
TABLE id, file.link AS task, persona, created
FROM ""
WHERE file.folder = this.file.folder + "/tasks" AND contains(tags, "task") AND status != "completed"
SORT id ASC
```

### Completed

```dataview
TABLE id, file.link AS task, persona, created
FROM ""
WHERE file.folder = this.file.folder + "/tasks" AND contains(tags, "task") AND status = "completed"
SORT id ASC
```

## Notes

- `local: ./repo/demo-app` points at where the project's code repo lives, **relative to this note**.
  Skills resolve the repo from this property — they never search the filesystem for it.
- `code_graph: false` keeps codegraph off for this project. Flip to `true` and build an index
  (see the `code-graph-index` skill) to opt in.
