---
name: figma-bridge
description: route Figma-related work (create concept, build components, sync tokens, map Code Connect) to the right `figma:*` skill while resolving project context, frontmatter, and project-scoped Figma Expert best practices. use when the user asks to create a Figma concept, build Figma components, sync design tokens, map code to Figma, or pull Figma context into code work for an Obsidian project.
---

# Figma Bridge

Thin router. Resolves the active project, reads the `figma:` frontmatter block, loads the project-scoped Figma Expert best practices, then dispatches to the right specialized `figma:*` skill. Never reimplements what `figma-generate-design`, `figma-generate-library`, `figma-code-connect`, `figma-use`, or `figma-create-new-file` already do.

## Workflow

1. **Detect intent.** Match user request to one of:
   - create / draft a Figma concept frame for a feature → concept flow
   - create / update Figma components (variants, props, states) → library flow
   - sync tokens code → Figma variables → tokens flow
   - map React component to Figma node (`.figma.ts`) → code-connect flow
   - pull current Figma selection / metadata into code work → read flow
2. **Resolve project context.**
   - If a project note is the current note, use it.
   - Else, if a task note is current, walk up to the project note in the same folder.
   - Else, ask the user which project this belongs to. Do not guess.
3. **Read project frontmatter.** Extract these flat properties (Obsidian property UI does not render nested objects well, so the schema is flat):
   - `figma_org_url`
   - `figma_library` (file key)
   - `figma_workspace` (file key)
   - `figma_tokens_source` (repo-relative path)
   - `figma_code_connect` (bool)
   - `figma_files` (list of file references — see shape below)
4. **Validate frontmatter for the chosen flow.**
   - Concept flow needs `figma_workspace` (or asks to create a new file via `figma:figma-create-new-file`).
   - Library flow needs `figma_library` and `figma_tokens_source`.
   - Tokens flow needs `figma_library` and `figma_tokens_source`.
   - Code-Connect flow needs `figma_code_connect: true`, `figma_library`, and the repo `local` path.
   - Read flow needs no project frontmatter; only requires Figma desktop app open.
   - If any required field is missing, stop and ask the user to fill the project frontmatter. Do not proceed.
5. **Load best practices.** Read `<project>/reference/best-practices/Figma Expert.md`. If missing, fall back to global [[00 Context/Personas#Persona 8 Figma Expert|Persona 8]] and tell the user the project file is missing.
6. **Confirm plan.** Restate to the user:
   - which flow
   - which Figma file (key + name)
   - which downstream skill will run
   - what frontmatter values were used
7. **Dispatch.** Invoke the chosen downstream skill with resolved values:
   - concept → [[skills/figma:figma-generate-design/SKILL|figma:figma-generate-design]] (and `figma:figma-create-new-file` if no `workspace` key exists yet)
   - library → [[skills/figma:figma-generate-library/SKILL|figma:figma-generate-library]]
   - tokens → [[skills/figma:figma-generate-library/SKILL|figma:figma-generate-library]] (variables-only mode)
   - code-connect → [[skills/figma:figma-code-connect/SKILL|figma:figma-code-connect]]
   - read → call `mcp__figma-desktop__get_design_context` / `get_metadata` / `get_variable_defs` directly
8. **Post-dispatch.** Suggest the next step:
   - after concept → suggest library flow if components are missing
   - after library → suggest code-connect flow if `code_connect: true`
   - after tokens → suggest a code-side check

## Required Project Frontmatter Shape

Flat keys (Obsidian property UI renders these as native properties; nested objects display as raw JSON and are not editable in the UI):

```yaml
figma_org_url: https://www.figma.com/files/team/...
figma_library: <FILE_KEY>          # design system file
figma_workspace: <FILE_KEY>        # active feature work file
figma_tokens_source: ./path/to/tokens
figma_code_connect: false
figma_files:                       # list of file references
  - "Concept Name|<FILE_KEY>|1234:5678"   # pipe-delimited: name|key|node(optional)
```

`figma_files` uses pipe-delimited strings so each entry stays a single property line. If a project needs richer file metadata, move the structured list out of frontmatter into a body section under `## Figma Files` and reference it from there.

## Task-Level Override

A task note may pin a specific file or node:

```yaml
figma_target: workspace            # or "library" or a name from figma_files
figma_node: 1234:5678
```

When present, task-level values win over project defaults for that task only.

## Rules

- Never invent Figma file keys or node ids. Always read from frontmatter or ask.
- Never run a Figma write (`use_figma`, `create_new_file`, `generate_*`) without first invoking its prerequisite skill (`figma:figma-use`, `figma:figma-create-new-file`, `figma:figma-generate-*`). The prerequisites are mandatory; this skill must not bypass them.
- Never edit Figma variables when a `tokens_source` exists — sync from code, do not write Figma directly.
- Project-scoped `Figma Expert.md` wins over global Persona 8 (per [[CLAUDE]] persona priority rule).
- Stop and ask when frontmatter is incomplete. Do not infer.
- Caveman style applies to chat replies during the flow; the actual Figma writes follow normal code/diagram quality.

## Linked Skills

- [[skills/figma:figma-use/SKILL|figma-use]] — prerequisite for any write
- [[skills/figma:figma-create-new-file/SKILL|figma-create-new-file]] — new blank file
- [[skills/figma:figma-generate-design/SKILL|figma-generate-design]] — concept / screen from code
- [[skills/figma:figma-generate-library/SKILL|figma-generate-library]] — components, variants, variables
- [[skills/figma:figma-code-connect/SKILL|figma-code-connect]] — `.figma.ts` mappings
- [[skills/figma:figma-use-figjam/SKILL|figma-use-figjam]] — FigJam context
- [[skills/figma:figma-use-slides/SKILL|figma-use-slides]] — Slides context

## Linked Notes

- [[00 Context/Personas#Persona 8 Figma Expert|Global Figma Expert Persona]]
- [[02 Projects/SME Hub/reference/best-practices/Figma Expert|SME Hub Figma Expert best practices (example)]]
- [[CLAUDE]] — persona priority rules
