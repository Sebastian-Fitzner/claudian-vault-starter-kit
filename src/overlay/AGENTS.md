# Vault Instructions

`CLAUDE.md` is the canonical instruction source for this vault.

Before doing any work in this repository, read and follow @CLAUDE.md.

If this file conflicts with `CLAUDE.md`, `CLAUDE.md` wins.

<!-- feature:codegraph -->
## codegraph

codegraph integration is **strictly opt-in per project**. A project participates only when **both** conditions hold:

1. the project note's YAML frontmatter has `code_graph: true`, AND
2. `<repo-path>/.codegraph/codegraph.db` exists in the repository resolved from the project's `local` property (the codegraph index has been built).

When either condition is false, treat the project as if codegraph did not exist: do not read the index, do not run `codegraph` commands, do not suggest running them.

codegraph has no slash command — it is a CLI plus an MCP server (`codegraph serve --mcp`, registered for both Claude and Codex). To build or refresh an index, use [[skills/code-graph-index/SKILL|code-graph-index]]; for queries, prefer the codegraph MCP tools.

When both conditions hold (project opted in):
- Prefer the codegraph MCP tools (`codegraph_explore` first, then `codegraph_search`, `codegraph_callers`, `codegraph_callees`, `codegraph_impact`, `codegraph_files`, `codegraph_status`) or the CLI (`codegraph query`, `codegraph callers|callees|impact`, `codegraph status`) before broad grep/glob searches over that repo.
- For cross-module "how does X relate to Y" questions, prefer `codegraph_explore` naming the symbols that span the flow — or `codegraph callers|callees|impact "<symbol>"` — over grep.
- **Never run `codegraph init`, `codegraph index`, `codegraph sync`, or any index-mutating codegraph command automatically.** Refresh is owned exclusively by [[skills/task-planning/SKILL|task-planning]] step 10 (`codegraph sync`), running against the **main checkout** (`local`), not a worktree. Skills like `task-implementation`, `task-finalize`, `task-review`, and `address-pr-findings` must not refresh the index. Read-only MCP/CLI queries are always fine.
- **Never run any index-mutating `codegraph` command inside a git worktree.** Worktree directories must stay free of `.codegraph/`. If one already exists there from a prior mistake, ignore it and flag it for cleanup.
<!-- /feature:codegraph -->
