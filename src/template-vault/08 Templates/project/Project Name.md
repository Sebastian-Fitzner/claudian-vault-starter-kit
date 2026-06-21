---
tags: [project]
status: active
created: {{date}}
local: {{local_path}}
# Optional: enable Figma workflows for this project (used by figma-bridge skill).
# Flat properties — Obsidian property UI does not render nested objects well.
# figma_org_url: https://www.figma.com/files/org/...   # org URL (or team URL if team exists)
# figma_library: <FILE_KEY>          # design system / component library file
# figma_workspace: <FILE_KEY>        # active feature work file
# figma_tokens_source: ./path/to/tokens   # repo-relative path to token source
# figma_code_connect: false          # true if .figma.ts mappings used
# figma_files: []                    # list of { name, key, node? } entries; keep flat strings or move to body if structured
---

# {{project_name}}

## Goal

{{goal}}

## Scope

- {{scope_item}}

## Out of Scope

- {{out_of_scope_item}}

## Constraints

- {{constraint}}

## Status

In Progress

## Next Steps

- [ ] 

## Tasks

### Open

```dataview
TABLE id, file.link AS task, persona, created
FROM ""
WHERE file.folder = this.file.folder AND contains(tags, "task") AND status != "completed"
SORT id ASC
```

### Completed

```dataview
TABLE id, file.link AS task, persona, created
FROM ""
WHERE file.folder = this.file.folder AND contains(tags, "task") AND status = "completed"
SORT id ASC
```

## Notes
