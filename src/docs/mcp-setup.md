# MCP Setup

MCP (Model Context Protocol) servers give the agent extra tools — Jira/Confluence, GitHub, a code
graph. Set up only the ones you enabled at scaffold time. Each agent CLI (Claude, Codex) keeps its
own MCP registry, so register with whichever CLI you drive the vault from (often both).

> Quick reference: `claude mcp list` / `codex mcp list` show what's registered. After adding a
> server, **restart the Claudian panel / CLI session** so the new tool namespace loads.

---

## Atlassian (Jira + Confluence)

Uses the Atlassian **Rovo MCP** server (OAuth login, no API token to manage).

```sh
# Codex
codex mcp add atlassian -- npx -y @atlassian/mcp-server     # exact package per Atlassian docs
codex mcp login atlassian                                    # opens an auth URL

# Claude
claude mcp add atlassian -- npx -y @atlassian/mcp-server
```

Then authorize in the browser when prompted. Verify with `codex mcp list`.

**Conventions baked into `CLAUDE.md`** (only present if you enabled Atlassian):
- The agent fetches Jira through MCP tools (e.g. `mcp__atlassian__getJiraIssue`) — not by guessing.
- It uses your **cloud URL** as the `cloudId` (the scaffolder wrote yours into `CLAUDE.md`).
- It caps Jira JQL / Confluence CQL searches at **`maxResults: 10`**.
- If the tool namespace is missing, `CLAUDE.md` has a recovery path (re-login, or a narrow
  `codex exec` session) so the agent self-heals instead of asking you to debug.

---

## GitHub

Gives the agent PR/issue/repo tools.

```sh
# Create a fine-grained Personal Access Token (repo + PR scopes) first, then:

# Claude
claude mcp add github -e GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxx -- npx -y @modelcontextprotocol/server-github

# Codex
codex mcp add github -e GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxx -- npx -y @modelcontextprotocol/server-github
```

Use the package/command from the **official GitHub MCP server** docs (a Docker image is also
offered). Keep the token in your shell env or a secrets manager — never commit it. The vault
`.gitignore` does not need to cover it because it lives in the CLI config, not the vault.

---

## codegraph

A local code knowledge graph (symbols, callers/callees, impact). **Opt-in per project** — only
projects with `code_graph: true` in their frontmatter **and** a built index participate.

1. Install the `codegraph` CLI (per its install docs).
2. Build the index for a project's repo — easiest via the **`code-graph-index`** skill
   (*"index this repo"*), which resolves the repo from the project's `local` property and runs
   `codegraph init` / `codegraph index`. The index lands in `<repo>/.codegraph/` (already git-ignored
   by this vault's `.gitignore`).
3. Register the MCP server so the agent can query it read-only:

   ```sh
   claude mcp add codegraph -- codegraph serve --mcp
   codex  mcp add codegraph -- codegraph serve --mcp
   ```

**Rules baked into `CLAUDE.md` / `AGENTS.md`** (only present if you enabled codegraph):
- Never run index-mutating commands automatically; refresh happens only in `task-planning`.
- Never write a `.codegraph/` index inside a git worktree — it belongs to the main checkout.
- Read-only queries (`codegraph_explore`, `codegraph_callers`, …) are always fine and preferred over
  broad grep on opted-in projects.

---

## Figma (not documented here)

The Figma **skills** ship if you kept them, but Figma MCP setup is out of scope for this kit. Follow
Figma's official "Dev Mode MCP" / desktop MCP instructions, then the `figma-bridge` skill will use it.
