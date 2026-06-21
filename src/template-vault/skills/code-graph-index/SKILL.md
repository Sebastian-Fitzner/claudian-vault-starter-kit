---
name: code-graph-index
description: build a queryable code knowledge graph for a project's repository using the codegraph CLI. use when the user asks to index code, create a code graph, create a code index, build or refresh a code knowledge graph, or re-index a repo. resolve the repository path from the assigned project note's `local` property, then run codegraph init/index/sync against that repo. codegraph stores its index in a `.codegraph/` directory INSIDE the repo; ensure `.codegraph/` is git-ignored.
---

# Code Graph Index

Build and refresh a queryable code knowledge graph for a project repo using the **codegraph** CLI (`codegraph`). codegraph parses the repo with tree-sitter into a local SQLite graph of symbols, files, and edges, and exposes it over the CLI and an MCP server (`codegraph serve --mcp`).

## Output location rule

codegraph stores its index in a **`.codegraph/` directory INSIDE the repo** (a local SQLite database). This is the opposite of the old sibling-folder model — do not try to relocate it.

- ✓ Correct: `<repo>/.codegraph/codegraph.db` (codegraph default; do not override)
- ✗ Wrong: a sibling `<container>/graphify-out/` (that was the old graphify model — gone)

`.codegraph/` holds `codegraph.db` (+ `*.db-wal` / `*.db-shm`), a `cache/` dir, logs, and an auto-written `.codegraph/.gitignore` that excludes the db and cache. The index is machine-local and must not be committed.

**Always ensure `.codegraph/` is git-ignored at the repo root.** codegraph writes a `.codegraph/.gitignore` that excludes the heavy db files, but the directory itself is still visible to git. Run `git -C "<repo>" check-ignore .codegraph`; if it exits non-zero, add a single line `.codegraph/` to the repo's root `.gitignore`. Never commit the index.

## When to use

- "index code", "index the code", "create code graph", "create/build code index", "build code graph", or similar phrasing.
- The user wants a queryable map of a project's repository (symbols, callers/callees, impact radius, file structure).
- A rebuild or refresh is requested for a known project (e.g. "re-index the sme-hub repo", "update the code graph").

## When NOT to use

- The user only wants to query an existing index — use the codegraph MCP tools (`codegraph_explore`, `codegraph_search`, `codegraph_callers` / `codegraph_callees` / `codegraph_impact`) or the CLI (`codegraph query`, `codegraph callers …`) directly.
- No project context exists and the user has not named a project — ask which project first.
- codegraph indexes code only. For documents, papers, or media, this skill does not apply.

## Prerequisite

- The `codegraph` CLI must be on PATH — verify with `codegraph --version`. If missing, install it (`npm i -g @colbymchenry/codegraph`, or `curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh`) and tell the user.

## Workflow

1. **Detect the indexing intent.** Do not run any commands yet.
2. **Resolve the target project.** In this order:
   1. Use the project the user named explicitly.
   2. If the user is viewing a task note, use that task's parent project folder.
   3. If the user is viewing a project note, use that note.
   4. Otherwise ask which project to index. Never guess between active projects.
3. **Read the project note's frontmatter** and extract the `local` property.
   - If `local` is missing, empty, `—`, or a placeholder, stop and ask the user to set it before continuing.
4. **Resolve the repository path.**
   - `local` is relative to the project note's folder. Resolve it into an absolute path. If `local` is already absolute, use it as-is.
   - Verify the resolved path exists and is a directory. If not, stop and ask the user to update `local` or clone the repo.
5. **Announce the plan.** Tell the user briefly: which project was resolved, the absolute repo path, that codegraph will write its index to `<repo>/.codegraph/`, and that `.codegraph/` will be git-ignored.
6. **Build or refresh the index.** Run codegraph against the repo path (codegraph resolves the project from the path argument):
   - First-time index (no `<repo>/.codegraph/codegraph.db` yet) → `codegraph init "<repo-path>"` (initializes and builds the initial index).
   - Already indexed, incremental refresh → `codegraph sync "<repo-path>"`.
   - Force a full rebuild → `codegraph index "<repo-path>" --force`.
   - Default to `init` when no index exists, `sync` otherwise — unless the user explicitly asked for a full rebuild.
7. **Ensure `.codegraph/` is git-ignored** (see Output location rule). If you add the line, tell the user which file you touched.
8. **Confirm the result** with `codegraph status "<repo-path>"` and relay its stats verbatim (Files, Nodes, Edges, DB size, Nodes-by-Kind, Files-by-Language, and the "Index is up to date" line).
9. **Suggest next steps**: query via the MCP tool `codegraph_explore "<question>"`, or the CLI (`codegraph query "<symbol>"`, `codegraph callers|callees|impact "<symbol>"`).

## Command map

| Intent | Command |
| --- | --- |
| First-time index | `codegraph init "<repo>"` |
| Incremental refresh ("update", "re-index changed") | `codegraph sync "<repo>"` |
| Full rebuild ("rebuild", "force re-index") | `codegraph index "<repo>" --force` |
| Status / stats | `codegraph status "<repo>"` |
| File structure from the index | `codegraph files -p "<repo>"` |
| Remove the index | `codegraph uninit "<repo>"` |
| Clear a stale lock blocking indexing | `codegraph unlock "<repo>"` |

Never invent flags the user did not ask for.

## Querying (no rebuild)

Once indexed, prefer the codegraph MCP tools (the MCP server is registered for both Claude and Codex):

- `codegraph_explore` — **PRIMARY**. Takes a natural-language question or a bag of symbol/file names and returns the verbatim source of the relevant symbols grouped by file. Usually the only call needed.
- `codegraph_search` — locate a symbol by name.
- `codegraph_callers` / `codegraph_callees` / `codegraph_impact` — who calls X / what X calls / blast radius of changing X.
- `codegraph_files`, `codegraph_node`, `codegraph_status` — file structure, one symbol's full source, index stats.

CLI equivalents: `codegraph query`, `codegraph callers|callees|impact`, `codegraph files`, `codegraph status`.

## Rules

- Never search the filesystem for a repo. The project note's `local` property is the only source of truth.
- Never start a build without first confirming the resolved repo path to the user.
- The index lives at `<repo>/.codegraph/`. Never relocate it; always ensure it is git-ignored.
- Never run codegraph build/index/sync inside a git worktree. The index belongs to the main checkout only; worktrees must stay free of `.codegraph/`.
- Never run on a project whose `local` is missing, blank, `—`, or an obvious placeholder.
- If two projects could match the user's phrasing, stop and ask which one.
- Do not modify the project note — this skill is read-only against vault notes (it may edit only the repo's root `.gitignore`).
- Relay codegraph's own output verbatim (status stats, query results). Do not re-summarize.

## Output contract

A successful run makes it obvious:
- which project was indexed
- the absolute repository path
- that the index lives at `<repo>/.codegraph/` and is git-ignored
- the `codegraph status` stats (files, nodes, edges, kinds, languages)
- the next-step suggestion to query the index

## Edge cases

- **`local` is absolute / outside the vault:** use it as-is, but warn the user that the repo AND its `.codegraph/` index live outside the vault.
- **Repo path exists but is empty / not yet cloned:** codegraph indexes zero files; relay its message. There is nothing to query.
- **`.codegraph/` already exists:** `codegraph init` is idempotent, but for an existing index prefer `codegraph sync` (incremental) or `codegraph index --force` (full rebuild). Mention which you chose.
- **Stale lock blocks indexing:** run `codegraph unlock "<repo>"`, then retry.
- **Monorepo / multiple packages:** codegraph indexes the whole repo path you pass — no per-package split is needed.

## Linked notes

- [[CLAUDE]] (vault codegraph governance, project `local` resolution)
- [[03 Wiki/HowTo/Code Graph Index|HowTo: Code Graph Index]]
- [[skills/task-planning/SKILL|task-planning]] (step 10 refreshes the index; same `local` resolution pattern)
