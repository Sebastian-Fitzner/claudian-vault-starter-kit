---
name: project-creation
description: create a new project note in the obsidian vault using the project template. use when the user asks to create a project, add a project, start a new project, or scaffold a project note. ask the required questions one by one, wait for each answer, confirm the summary, then scaffold the project using 08 templates/project/ and replace every placeholder.
---

# Project Creation

Create new project notes in a strict, low-assumption workflow.

## Workflow

1. Detect project-creation intent.
2. Do not create files yet.
3. Ask these questions one by one. Wait for each answer before asking the next.
   1. Name
   2. Goal (1–2 sentences)
   3. Scope
   4. Out of scope
   5. Constraints
   6. GitHub (optional)
   7. Branch strategy
   8. Local path
4. Present a short summary for confirmation.
5. Only after confirmation:
   - scaffold the note using [[08 Templates/project/Project Name|08 Templates/project/Project Name.md]]
   - replace all placeholders
   - create the following folders inside the project folder:
     - `repo/` — for the local repository
     - `reference/` — for reference material and best practices
   - explain the file operation briefly

## Rules

- Never batch all questions in one message.
- Never create the project before confirmation.
- Keep the resulting project note concrete and fully filled.
- If a field is intentionally unknown, mark it clearly instead of inventing content.
- Use vault-native wikilinks where useful.

## Output contract

The created project note must include:
- project name
- goal
- scope
- out of scope
- constraints
- github reference if provided
- branch strategy
- local repository path if provided

## Edge cases

- If the user is unsure about scope or constraints, help narrow them down before creation.
- If the template note [[08 Templates/project/Project Name|08 Templates/project/Project Name.md]] is missing, stop and report that instead of improvising a different structure.
- If a similar project already exists, point it out before creating a duplicate.

## Linked notes

- [[08 Templates/project/Project Name|Project template]]
- [[00 Context/workflows/Task and Project Management|Task & Project Workflows]]
