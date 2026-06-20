# Resource Map Template (`resources.json`)

`resources.json` lives at the **LLM wiki root** (beside `raw/` and `wiki/`). It is plumbing maintained by the skill — not a wiki article, never placed inside `wiki/`. It tracks only **repo documentation** and the **codegraph index** so re-ingest is a deterministic diff instead of guesswork. Vault notes and external/web sources are not tracked here.

All `path` and `compiledInto` values are relative to the **project root** (the folder that holds the project note), matching how the repo is resolved from the project note's `local`.

```json
{
  "version": 1,
  "updated": "YYYY-MM-DD",
  "pathsRelativeTo": "project-root",
  "repoRoot": "repo/<name>",
  "resources": [
    {
      "id": "adr",
      "type": "repo-doc-dir",
      "path": "repo/<name>/docs/adr",
      "glob": "*.md",
      "signal": { "kind": "dir-sha256", "value": "0123456789abcdef", "fileCount": 27 },
      "lastIngested": "YYYY-MM-DD",
      "compiledInto": [
        "llm-wiki/wiki/decisions/adr-catalog.md"
      ]
    },
    {
      "id": "api-docs",
      "type": "repo-doc-dir",
      "path": "repo/<name>/apps/api/docs",
      "glob": "*.md",
      "signal": { "kind": "dir-sha256", "value": "fedcba9876543210", "fileCount": 13 },
      "lastIngested": "YYYY-MM-DD",
      "compiledInto": ["llm-wiki/wiki/architecture/<article>.md"]
    },
    {
      "id": "single-doc",
      "type": "repo-doc-file",
      "path": "repo/<name>/README.md",
      "signal": { "kind": "sha256", "value": "abcdef0123456789" },
      "lastIngested": "YYYY-MM-DD",
      "compiledInto": ["llm-wiki/wiki/architecture/<article>.md"]
    },
    {
      "id": "codegraph",
      "type": "codegraph",
      "path": "repo/<name>/.codegraph/codegraph.db",
      "signal": { "kind": "index-counts", "files": 0, "nodes": 0, "edges": 0, "date": "YYYY-MM-DD" },
      "lastIngested": "YYYY-MM-DD",
      "compiledInto": ["llm-wiki/wiki/architecture/codebase-structure.md"]
    }
  ]
}
```

## Field notes

- `id` — short, stable, unique within the manifest. Reuse the same id across refreshes so entries are upserted, not duplicated.
- `type` — `repo-doc-dir` (a directory of docs), `repo-doc-file` (one file), or `codegraph`.
- `glob` — present for `repo-doc-dir` only; the file pattern the signal covers (usually `*.md`).
- `signal` — the staleness fingerprint; recompute and compare on refresh/lint:
  - `dir-sha256`: `find <path> -type f -name '<glob>' -print0 | sort -z | xargs -0 shasum -a 256 | shasum -a 256 | cut -c1-16` (+ `fileCount` from `find … | wc -l`).
  - `sha256`: `shasum -a 256 <path> | cut -c1-16`.
  - `index-counts`: from `codegraph_status` / `codegraph status` (read-only).
- `lastIngested` — date this source was last compiled into the wiki.
- `compiledInto` — the wiki article(s) this source feeds; used by lint to detect under-ingested paths.

## Maintenance rules

- **Init:** created empty (`"resources": []`) on first ingest.
- **Ingest of a tracked source:** upsert its entry (recompute signal, stamp `lastIngested`, set `compiledInto`), refresh top-level `updated`.
- **Refresh verb:** recompute every signal, diff vs stored, re-ingest `changed`/new, rewrite the file.
- **Never** track vault notes or external/web sources here. **Never** run an index-mutating `codegraph` command to read counts.
