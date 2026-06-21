---
name: llm-wiki
description: "Use when building, querying, or maintaining a project-scoped or vault-level LLM wiki. Triggers: ingesting sources into an LLM wiki, querying wiki knowledge, linting wiki quality, checking tracked sources for updates or refreshing the wiki, 'add to llm wiki', 'what do I know about', 'what changed since last ingest', or any mention of 'LLM wiki' or 'Karpathy wiki'. In project scope, consider project notes, tasks, and pr-reviews as knowledge sources. When a project has code_graph: true and a built codegraph index, also use codegraph (read-only) as a code knowledge source and prefer it for code and architecture queries. Do not use for source-backed Obsidian wiki generation; use obsidian-wiki for that."
---

# LLM Wiki

Build and maintain a personal knowledge base using LLMs. In this vault, each project can have its own LLM wiki, and the vault can also have a fallback/global LLM wiki. You manage two directories inside the selected LLM wiki root: `raw/` (immutable source material) and `wiki/` (compiled knowledge articles). Sources go into raw/, you compile them into wiki articles, and the wiki compounds over time.

Core ideas from Karpathy:
- "The LLM writes and maintains the wiki; the human reads and asks questions."
- "The wiki is a persistent, compounding artifact."

## Architecture

Three layers, all under the selected LLM wiki root:

**raw/** — Immutable source material that is **not already a vault note**: external/fetched sources (web pages, PDFs, pasted text, imported docs) and codegraph snapshots. You read, never modify. Organized by topic subdirectories (e.g., `raw/machine-learning/`, `raw/code-graph/`). Vault notes (project note, tasks, PR reviews, references, concepts, existing project wiki) are **never copied here** — they are cited live by their vault-relative path.

**wiki/** — Compiled knowledge articles. You have full ownership. Organized by topic subdirectories, one level only: `wiki/<topic>/<article>.md`. Contains two special files:
- `wiki/index.md` — Global index. One row per article, grouped by topic, with link + summary + Updated date.
- `wiki/log.md` — Append-only operation log.

**SKILL.md** (this file) — Schema layer. Defines structure and workflow rules.

Templates live in `references/` relative to this file. Read them when you need the exact format for raw files, articles, archive pages, or the index.

For project-scoped wikis, the selected root stores the LLM wiki state, but project notes, task notes, PR review notes, references, and concepts outside that root are also upstream knowledge sources — read and cited in place, never duplicated into `raw/`.

## Vault Placement

Resolve the LLM wiki root before Ingest, Query, Lint, or Archive work.

### Project Detection

Use a project-scoped LLM wiki when the project can be determined from the request or working context:

- User names a project under `02 Projects/`.
- The source path, task note, project note, or current working file is inside `02 Projects/<Project>/`.
- A task or note links to a project clearly enough to resolve `02 Projects/<Project>/`.

Project target:

```text
02 Projects/<Project>/llm-wiki/
```

If multiple projects match or no project can be determined, ask one short question about where to save or read the LLM wiki. Offer the project candidate(s) and the vault fallback:

```text
10 LLM Wiki/
```

Use `10 LLM Wiki/` without asking only when the user explicitly asks for a global/vault-level LLM wiki, chooses the fallback, or the task is clearly not project-specific.

### Project Knowledge Sources

When scope is project, inspect these project folders and files as source candidates:

```text
02 Projects/<Project>/<Project>.md
02 Projects/<Project>/tasks/
02 Projects/<Project>/task-*.md
02 Projects/<Project>/pr-reviews/
02 Projects/<Project>/reference/
02 Projects/<Project>/references/
02 Projects/<Project>/concepts/
02 Projects/<Project>/wiki/
```

Use only folders that exist. Do not create or modify these source folders during LLM wiki work unless the user explicitly asks for that separate change.

Treat `tasks/`, root-level `task-*.md`, and `pr-reviews/` as operational knowledge sources:

- Tasks capture requirements, implementation plans, decisions, acceptance criteria, and completion state.
- PR reviews capture defects, review rationale, accepted fixes, residual risks, and quality rules.
- Prefer extracting stable knowledge, decisions, patterns, constraints, and repeated risks. Do not turn transient status chatter into evergreen wiki claims.
- If a task or PR review contradicts the compiled wiki, prefer the newer dated source and annotate the conflict with source attribution.

**Do not copy vault notes into `raw/`.** The project note, `tasks/`, root-level `task-*.md`, `pr-reviews/`, `reference/` or `references/`, `concepts/`, and the project `wiki/` already live in the vault. Read them in place and cite them by their vault-relative path directly from compiled wiki articles (as a live link in the article's `Raw` source-link list — the same metadata list that points to `raw/` sources). Copying them into `raw/` only creates duplicates that must be re-synced by hand whenever the note changes.

`raw/` holds only material that is **not** already a vault note:

```text
raw/code-graph/         # codegraph snapshots (point-in-time; see below)
raw/<external-topic>/   # web pages, PDFs, pasted text, imported docs
```

Compiled articles always live in `wiki/<topic>/<article>.md`.

### Codegraph Source (opt-in)

When scope is a project that opted into codegraph, the project's code graph is an additional, authoritative knowledge source for code structure and relationships.

Gate — use codegraph only when **both** hold (per [[CLAUDE]]):

- the project note has `code_graph: true`, AND
- `<repo-path>/.codegraph/codegraph.db` exists, where `<repo-path>` is resolved from the project note's `local` property.

When either is false, treat codegraph as absent: do not read the index, do not mention it.

Rules:

- **Read-only here.** Never run `codegraph init`, `codegraph index`, or `codegraph sync` from this skill — index refresh is owned solely by [[skills/task-planning/SKILL|task-planning]] step 10. Use only the MCP tools (`codegraph_explore`, `codegraph_search`, `codegraph_callers`, `codegraph_callees`, `codegraph_impact`, `codegraph_files`, `codegraph_status`) or read-only CLI (`codegraph query`, `codegraph callers|callees|impact`, `codegraph status`, `codegraph files`).
- **Building/updating the wiki:** when the user asks to build or refresh the project LLM wiki, pull current architecture facts from the index — inventory via `codegraph_status` / `codegraph files`, key flows and module behavior via `codegraph_explore`, and important relationships via `codegraph_callers|callees|impact`. Snapshot them into `raw/code-graph/YYYY-MM-DD-<area>.md` (point-in-time, like archive pages — record the index's file/symbol/edge counts and the date), then compile into `wiki/architecture/` (or the most relevant topic) articles like any other source.
- **Querying the wiki:** for code, architecture, or impact questions, prefer the live index over compiled articles for ground-truth structure (see Query step 4). Compiled articles remain the source of rationale, decisions, and history.
- codegraph snapshots in `raw/code-graph/` are point-in-time and are never cascade-updated. Re-snapshot to refresh.

### Placement Output

Before writing files or answering from a wiki, state:

```markdown
LLM Wiki Scope:
Reason:
Target Root:
```

Use vault-relative paths in conversation output. Inside wiki files, use paths relative to the current file.

### Distinction From obsidian-wiki

Use `llm-wiki` for incremental Karpathy-style raw/wiki maintenance, querying, linting, and compounding knowledge capture.

Use `obsidian-wiki` for building source-backed Obsidian knowledge systems with frontmatter, wikilinks, MOCs, review strategy, and full vault graph integration from research reports or documentation.

### Initialization

Triggers only on the first Ingest after resolving the LLM wiki root. Check whether `raw/` and `wiki/` exist inside the selected root. Create only what is missing; never overwrite existing files:

- `raw/` directory (with `.gitkeep`)
- `wiki/` directory (with `.gitkeep`)
- `wiki/index.md` — heading `# Knowledge Base Index`, empty body
- `wiki/log.md` — heading `# Wiki Log`, empty body
- `resources.json` at the LLM wiki root — the resource manifest, initialized to `{"version":1,"updated":"<today>","pathsRelativeTo":"project-root","repoRoot":"<repo path or null>","resources":[]}`. It tracks only repo docs + the codegraph index (see "Resource Map & Update Checks"); in a vault-level wiki with no repo it stays an empty manifest.

If Query or Lint cannot find the wiki structure in the selected root, tell the user: "Run an ingest first to initialize the wiki." Do not auto-create.

---

## Ingest

Resolve the LLM wiki root. For an **external source**, fetch it into `raw/`, then compile into `wiki/`. For a **vault note** (project note, task, PR review, reference, concept, existing project wiki), skip the `raw/` copy — read it in place and compile, citing the live note by its vault-relative path. Either way, always produce or refresh a compiled article; never stop at fetching.

For project scope, also support project source ingestion. These read the live notes in place and compile articles that cite them — they never copy the notes into `raw/`:

- `ingest project tasks` or equivalent → read `tasks/` and root-level `task-*.md` in place.
- `ingest pr reviews` or equivalent → read `pr-reviews/` in place.
- `ingest project knowledge` or equivalent → read the project note plus existing project source folders listed above, in place.
- `ingest code graph` or equivalent → (opt-in only) snapshot codegraph facts into `raw/code-graph/` and compile architecture articles. See "Codegraph Source (opt-in)". Skip when the project is not opted in.
- When no source is named but the user asks to refresh or build the project LLM wiki, summarize the candidate source folders found — and, when the project is opted into codegraph, include the code graph — then ask which source set to ingest.

### Fetch (raw/)

1. Get the source content using whatever web or file tools your environment provides. If nothing can reach the source, ask the user to paste it directly.

2. The Fetch step applies **only to external sources and codegraph snapshots — never to vault notes** (those are cited live, not copied; see Project Knowledge Sources). Pick a topic directory: for codegraph snapshots use `raw/code-graph/`; for all other (external) sources, check existing `raw/` subdirectories first and reuse one if the topic is close enough. Create a new subdirectory only for genuinely distinct topics.

3. Save as `<target-root>/raw/<topic>/YYYY-MM-DD-descriptive-slug.md`.
   - Slug from source title, kebab-case, max 60 characters.
   - Published date unknown → omit the date prefix from the file name (e.g., `descriptive-slug.md`). The metadata Published field still appears; set it to `Unknown`.
   - If a file with the same name already exists, append a numeric suffix (e.g., `descriptive-slug-2.md`).
   - Include metadata header: source URL, collected date, published date.
   - Preserve original text. Clean formatting noise. Do not rewrite opinions.
   - Vault notes are not fetched here — cite them live (see Project Knowledge Sources). Only use `raw/` for sources that are not already a vault note.

   See `references/raw-template.md` for the exact format.

### Compile (wiki/)

Determine where the new content belongs:

- **Same core thesis as existing article** → Merge into that article. Add the new source to Sources/Raw. Update affected sections.
- **New concept** → Create a new article in the most relevant topic directory. Name the file after the concept, not the raw file.
- **Spans multiple topics** → Place in the most relevant directory. Add See Also cross-references to related articles elsewhere.

These are not mutually exclusive. A single source may warrant merging into one article while also creating a separate article for a distinct concept it introduces. In all cases, check for factual conflicts: if the new source contradicts existing content, annotate the disagreement with source attribution. When merging, note the conflict within the merged article. When the conflicting content lives in separate articles, note it in both and cross-link them.

See `references/article-template.md` for article format. Key points:
- Sources field: prose attribution — author, organization, or publication name + date, semicolon-separated.
- Raw field: the supporting source **links**, semicolon-separated. Use `raw/<topic>/<file>.md` paths for external sources and codegraph snapshots; use the **live vault-relative path** for vault notes (tasks, PR reviews, references, concepts, project note) — never a `raw/` copy of a vault note. One `Raw` line may mix both kinds.
- Relative paths from `wiki/<topic>/`: raw files are `../../raw/<topic>/<file>.md` (two levels up to the LLM wiki root); a live vault note is the path to the note relative to the article (e.g. `../../../tasks/<file>.md` for a project laid out as `02 Projects/<Project>/llm-wiki/wiki/<topic>/`).

### Cascade Updates

After the primary article, check for ripple effects:

1. Scan articles in the same topic directory for content affected by the new source.
2. Scan `wiki/index.md` entries in other topics for articles covering related concepts.
3. For project scope, scan the relevant live task and PR review notes (in `tasks/` and `pr-reviews/`) when a concept touches requirements, review findings, risks, or accepted implementation decisions.
4. Update every article whose content is materially affected. Each updated file gets its Updated date refreshed.

Archive pages are never cascade-updated (they are point-in-time snapshots).

### Post-Ingest

Update `wiki/index.md`: add or update entries for every touched article. When adding a new topic section, include a one-line description. The Updated date reflects when the article's knowledge content last changed, not the file system timestamp. See `references/index-template.md` for format.

Append to `wiki/log.md`:

```
## [YYYY-MM-DD] ingest | <primary article title>
- Updated: <cascade-updated article title>
- Updated: <another cascade-updated article title>
```

Omit `- Updated:` lines when no cascade updates occur.

**Update `resources.json`** when the ingested source is a tracked type (a repo doc directory/file or the codegraph index): upsert that source's entry — recompute its signal, set `lastIngested` to today, record the wiki articles it compiled into, and refresh the top-level `updated` date. Ingests of untracked sources (vault notes, external/web) do not touch the manifest. See "Resource Map & Update Checks".

---

## Query

Search the wiki and answer questions. Examples of triggers:
- "What do I know about X?"
- "Summarize everything related to Y"
- "Compare A and B based on my wiki"

### Steps

1. Resolve the LLM wiki root.
2. Read `<target-root>/wiki/index.md` to locate relevant articles.
3. Read those articles and synthesize an answer.
4. **Codegraph (opt-in, project scope).** When the project has `code_graph: true` and `<repo-path>/.codegraph/codegraph.db` exists (repo resolved from `local`), and the question concerns code structure, behavior, call relationships, or impact, query the codegraph index (read-only) before relying on memory: prefer the MCP tool `codegraph_explore` (or CLI `codegraph query` / `codegraph callers|callees|impact`). Treat the live index as ground truth for current code structure; treat compiled wiki articles as the source of rationale, decisions, and history. Never run `codegraph init/index/sync` from this skill. Skip this step when the project is not opted in.
5. In project scope, if the wiki index has weak or no coverage for the question, search the project source folders listed above, especially `tasks/` and `pr-reviews/`, then clearly label any answer based on project source notes instead of compiled wiki articles.
6. Prefer compiled wiki content over live project notes when both cover the same topic. For ground-truth code structure, prefer the codegraph index over both. Prefer live project notes over your own training knowledge for project-specific questions.
7. Cite sources with markdown links using vault-relative paths, e.g. `[Article Title](02 Projects/<Project>/llm-wiki/wiki/topic/article.md)`, `[Task](02 Projects/<Project>/tasks/task-001.md)`, or `[PR Review](02 Projects/<Project>/pr-reviews/pr-review-foo.md)`. For codegraph-derived facts, cite the index as `codegraph index (<repo>/.codegraph)` and name the symbols or files inspected.
8. Output the answer in the conversation. Do not write files unless asked.

### Archiving

When the user explicitly asks to archive or save the answer to the wiki:

1. Write the answer as a new wiki page. See `references/archive-template.md`. When converting conversation citations to the archive page, rewrite vault-relative paths (e.g., `02 Projects/<Project>/llm-wiki/wiki/topic/article.md` or `10 LLM Wiki/wiki/topic/article.md`) to file-relative paths (e.g., `../topic/article.md` or `article.md` for same-directory).
   - Sources: markdown links to the wiki articles cited in the answer.
   - No Raw field (content does not come from raw/).
   - File name reflects the query topic, e.g., `transformer-architectures-overview.md`.
   - Place in the most relevant topic directory.
2. Always create a new page. Never merge into existing articles (archive content is a synthesized answer, not raw material).
3. Update `wiki/index.md`. Prefix the Summary with `[Archived]`.
4. Append to `wiki/log.md`:
   ```
   ## [YYYY-MM-DD] query | Archived: <page title>
   ```

---

## Lint

Resolve the LLM wiki root, then run quality checks on that wiki. Two categories with different authority levels.

### Deterministic Checks (auto-fix)

Fix these automatically:

**Index consistency** — compare `wiki/index.md` against actual wiki/ files (excluding index.md and log.md):
- File exists but missing from index → add entry with `(no summary)` placeholder. For Updated, use the article's metadata Updated date if present; otherwise fall back to file's last modified date.
- Index entry points to nonexistent file → mark as `[MISSING]` in the index. Do not delete the entry; let the user decide.

**Internal links** — for every markdown link in wiki/ article files (body text and Sources metadata), excluding Raw field links (validated by Raw references below), excluding index.md/log.md (handled above), and excluding links that point to live vault notes outside the wiki (e.g. `…/tasks/…`, `…/pr-reviews/…`, `…/reference/…` — validated under Raw references / Project source coverage):
- Target does not exist → search wiki/ for a file with the same name elsewhere.
  - Exactly one match → fix the path.
  - Zero or multiple matches → report to the user.

**Raw references** — every link in a Raw field must resolve:
- `raw/` links → target must exist under `raw/`. Missing → search raw/ for a same-named file (exactly one match → fix the path; zero or multiple → report).
- live vault-note links (e.g. `…/tasks/…`, `…/pr-reviews/…`, `…/reference/…`, project note) → the note must exist at that vault path. Missing → report (do not auto-repath across the vault; the note may have moved or been deleted).

**See Also** — within each topic directory:
- Add obviously missing cross-references between related articles.
- Remove links to deleted files.

**Project source coverage** — for project scope only:
- Report task or PR review notes whose stable decisions, repeated findings, or accepted quality rules are not represented in the compiled wiki.
- Report compiled wiki articles whose Raw field cites a live vault note (task, PR review, reference, concept, project note) that no longer exists at the cited vault-relative path. Do not delete the article automatically; report the broken citation.
- Report compiled wiki articles whose sources cite stale task or PR review material without noting superseding decisions.

### Heuristic Checks (report only)

These rely on your judgment. Report findings without auto-fixing:

- Factual contradictions across articles
- Outdated claims superseded by newer sources
- Missing conflict annotations where sources disagree
- Orphan pages with no inbound links from other wiki articles
- Missing cross-topic references
- Concepts frequently mentioned but lacking a dedicated page
- Archive pages whose cited source articles have been substantially updated since archival
- Repeated task or PR review findings that should become project best-practice or risk articles
- (Codegraph opt-in only, read-only) `raw/code-graph/` snapshots that are stale versus the current index — compare counts and date via `codegraph_status`; recommend re-snapshotting. Also report architecture present in the codegraph index but absent from compiled wiki articles. Never run `codegraph init/index/sync` to check this.
- (Resource map) recompute each `resources.json` entry's signal and compare to the stored value: report entries whose signal **changed** (tracked repo doc dir/file edited/added/removed since last ingest), whose `path` is **missing**, or whose tracked path gained sources not yet reflected in any `compiledInto` article (**under-ingested**). Recommend a refresh; do not silently re-ingest during lint. Also report compiled articles whose cited repo docs are not represented by any manifest entry.

### Post-Lint

Append to `wiki/log.md`:

```
## [YYYY-MM-DD] lint | <N> issues found, <M> auto-fixed
```

---

## Resource Map & Update Checks

Local, re-checkable sources are tracked in a manifest so re-ingest is deterministic instead of guesswork. Scope is **repo documentation and the codegraph index only** — the sources whose change can be detected cheaply and reliably. Vault notes (tasks, PR reviews, references, concepts, project note) and external/web collections are **not** tracked here; they are cited live and re-checked manually.

File: `<llm-wiki-root>/resources.json`, at the LLM wiki root beside `raw/` and `wiki/` (it is plumbing, not a wiki article — never place it inside `wiki/`). Paths inside are relative to the **project root** (the folder holding the project note), matching how the repo is resolved from the project note's `local`.

### Schema

```json
{
  "version": 1,
  "updated": "YYYY-MM-DD",
  "pathsRelativeTo": "project-root",
  "repoRoot": "repo/<name>",
  "resources": [
    {
      "id": "short-stable-id",
      "type": "repo-doc-dir | repo-doc-file | codegraph",
      "path": "repo/<name>/docs/adr",
      "glob": "*.md",
      "signal": { "kind": "dir-sha256", "value": "<16 hex>", "fileCount": 27 },
      "lastIngested": "YYYY-MM-DD",
      "compiledInto": ["llm-wiki/wiki/<topic>/<article>.md"]
    }
  ]
}
```

`glob` applies to `repo-doc-dir` only. See `references/resources-map-template.md` for the full template.

### Signal (staleness fingerprint), per type

- `repo-doc-dir` → `{ "kind": "dir-sha256", "value": "<16 hex>", "fileCount": <n> }`. Compute a stable digest over content **and** filenames:

  ```sh
  find <path> -type f -name '<glob>' -print0 | sort -z | xargs -0 shasum -a 256 | shasum -a 256 | cut -c1-16
  ```

  Any add / remove / rename / edit changes the value. `fileCount` via `find <path> -type f -name '<glob>' | wc -l`.
- `repo-doc-file` → `{ "kind": "sha256", "value": "<16 hex>" }` via `shasum -a 256 <path> | cut -c1-16`.
- `codegraph` → `{ "kind": "index-counts", "files": n, "nodes": n, "edges": n, "date": "YYYY-MM-DD" }` from `codegraph_status` / `codegraph status` (read-only). Changed counts ⇒ re-snapshot (see "Codegraph Source").

Hashes are truncated to 16 hex chars — collision risk is negligible for change-detection.

### When it runs

- **Initialize:** on the first ingest, create `resources.json` with an empty `resources` array if absent (see "Initialization"). Never overwrite an existing manifest.
- **On every ingest of a tracked source:** upsert its entry — recompute signal, set `lastIngested` to today, record every wiki article it compiled into, refresh top-level `updated` (see "Post-Ingest").
- **Refresh / update-check verb** ("check for updates", "refresh sources", "what changed since last ingest"): for each entry, recompute the current signal and compare to the stored value. Classify each as `unchanged`, `changed` (signal differs), `missing` (path gone), or `under-ingested` (tracked path gained sources not yet in any `compiledInto` article). Report the diff first. Then **re-ingest the changed / new sources** (full Compile + Cascade), refresh their entries, rewrite `resources.json` with a new `updated` date, and append a log line:

  ```
  ## [YYYY-MM-DD] refresh | <N> changed, <M> re-ingested
  - Re-ingested: <source id> → <article(s)>
  ```

- **Lint** recomputes signals to report drift but never re-ingests (see "Lint").

Never run an index-mutating `codegraph` command here — status/counts are read-only, and refreshing the codegraph index itself remains task-planning's responsibility.

---

## Conventions

- Standard markdown with relative links throughout.
- wiki/ supports one level of topic subdirectories only. No deeper nesting.
- Project source folders can have their native structure. Read and cite their content in place; **never copy** project notes, tasks, PR reviews, references, concepts, or existing project wiki files into `raw/`, and do not reorganize them as part of LLM wiki work.
- `raw/` holds only external sources and codegraph snapshots. Vault notes are cited live by vault-relative path, never duplicated into `raw/`.
- Today's date for log entries, Collected dates, and Archived dates. Updated dates reflect when the article's knowledge content last changed. Published dates come from the source (use `Unknown` when unavailable).
- Inside wiki/ files, all markdown links use paths relative to the current file. In conversation output, use vault-relative paths (e.g., `02 Projects/<Project>/llm-wiki/wiki/topic/article.md` or `10 LLM Wiki/wiki/topic/article.md`).
- Ingest updates both `wiki/index.md` and `wiki/log.md`. Archive (from Query) updates both. Lint updates `wiki/log.md` (and `wiki/index.md` only when auto-fixing index entries). Plain queries do not write any files.
- `resources.json` (LLM wiki root) tracks only repo docs + the codegraph index for deterministic update-checks; it is plumbing, never placed inside `wiki/`. Vault notes and external/web sources are not tracked there. Ingesting a tracked source updates it; the refresh verb rewrites it. See "Resource Map & Update Checks".
