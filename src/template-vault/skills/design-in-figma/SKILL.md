-----

## name: design-in-figma
description: implement an approved design task natively inside Figma via the Figma MCP server after planning is finished. use when the user approves a design plan and wants Figma execution to start. the deliverable is the Figma design itself (editable, design-system-linked nodes) — never generated code. add the approved plan to the task notes, work in the assigned Figma file with the project-scoped persona set, follow the Figma best practices, and do not deviate from the approved plan without flagging it. do not use for review findings; route those to address-pr-findings.

# Design in Figma

Implement design work in Figma only after planning is approved. The deliverable is the **Figma design itself**, not code.

Do not use this skill to fix findings surfaced by [[skills/task-review/SKILL|task-review]] or review notes. Use [[skills/address-pr-findings/SKILL|address-pr-findings]] for those passes.

All craft and Figma MCP operating rules live in [[04 Resources/Figma Design Best Practices|Figma Design Best Practices]]. This skill owns the workflow gate, timeline, and persona handling; that note owns how to build. Follow it throughout.

## Workflow

1. Inspect task properties before designing, especially `status`, `figma_file`, and `branch`.
1. Confirm that a design plan exists and has been approved in [[skills/task-planning/SKILL|task-planning]].
1. If the user asks to fix task-review findings or review findings, stop and route to [[skills/address-pr-findings/SKILL|address-pr-findings]] instead.
1. If `status` is not `planned`, stop and guide the user to planning first. Example: `This task is not in a planned state yet. Before implementation, we should plan the task.`
1. Update the task note before making any change in Figma:
- set `status: implementing`
- determine the timeline label:
  - Use `implementing plan` for the approved plan.
  - Do not use `implementing review findings`; [[skills/address-pr-findings/SKILL|address-pr-findings]] owns review-finding fixes.
- append a new row: `| <label> | <description> | <now> | |` where:
  - `<description>` is a caveman fragment (no articles/filler, ≤ ~60 chars) — examples: `build button variants`, `wire semantic color tokens`, `compose dashboard screen`
  - `<now>` is the current local date-time in readable form (e.g. `2026-05-18 10:15am`)
- if the YAML `started_at` field is still empty (legacy task or planning was skipped), stamp it with the same `<now>` value.
- if the `## Timeline` section is missing (legacy task), create it directly after the `## Status` section using the required header (`| task state | description | started_at | finished_at |`).
1. Add the approved plan to the task file Notes section if not given.
1. Resolve the persona scope from the assigned project’s `reference/Best Practices` or `reference/best-practices`.
1. Use the assigned persona set only if every listed persona belongs to the assigned project scope.
1. If multiple personas are assigned, use the first listed persona as the primary design lens and the rest as supporting constraints.
1. Prefer the project-specific persona when both project-specific and generic personas are applicable.
1. If any task persona appears to come from another project scope, stop and clarify before designing.
1. Resolve the Figma target before touching the canvas:

- resolve the Figma file from the task `figma_file` property; if it links to a project note, resolve from that note instead — never guess a file URL
- if `figma_file` is missing or the file is not reachable through the Figma MCP server, stop and ask the user to set the task’s `figma_file` property
- confirm the MCP server is connected and the account has a Full seat plus edit permission on the file; if write access is missing, stop and tell the user (read-only seats cannot write to canvas)
- if `branch: true` and a branch name is set, work in that Figma branch; create it from the file’s main branch if missing, attach to it if it already exists; ask only if the base branch is unclear

1. Discover the design system before building anything — inspect existing instances, bound variables, and styles first, then `search_design_system` for library assets. Never conclude “no design system exists” from local-only inspection.
2. Implement with the resolved project-scoped persona set in the correct Figma file or branch, following [[skills/design-in-figma/references/Figma Design Best Practices|Figma Design Best Practices]] throughout.
3. If a better approach or conflict appears, stop and discuss before deviating.

## Design behavior

- state assumptions when uncertain
- reuse before redraw — never draw a primitive when a published component exists
- tokens before hardcoded values — never hardcode a hex or pixel value when a variable/style exists
- auto layout by default; constraints only where auto layout cannot reach
- make surgical changes only — fix issues with targeted scripts, never rebuild a section from scratch
- match the existing design-system conventions unless persona best practices require a different direction and that change is approved
- remove only nodes created by your own changes
- support both scalar and list values in the `persona` field, but write new task files with `persona` as a list
- prefer project-specific persona guidance over generic persona guidance when both exist in the assigned project scope
- never use a persona from another project scope as the leading design lens
- if any resolved persona has a `## Quick Reference` section, use it as an active checklist while designing — verify each rule against the nodes being built
- always edit the task file’s `status` and `## Timeline` BEFORE any persona resolution, Figma target setup, or canvas change — never start the real task until the task note reflects the new state

## Figma MCP behavior

- pair `use_figma` with the `figma-use` skill (mandatory) and the relevant task skill (`figma-generate-design` for screens)
- build the page wrapper frame first, then each section directly inside it; build one section per `use_figma` call — never build top-level and reparent (cross-call `appendChild` silently orphans frames)
- bind components to semantic tokens, never to primitives
- prefer boolean / text / instance-swap / slots over variant explosion
- return all created and mutated node IDs on every call
- scripts are atomic — on error, stop, read the message, fix, and retry; nothing partial is created

## Verification

Implementation is not done until the planned verification steps have been executed or explicitly discussed.
Before completing, run the [[skills/design-in-figma/references/Figma Design Best Practices|Figma Design Best Practices]] verification checklist against the design:

- resize frames to check reflow at each breakpoint
- per-section screenshots (`get_screenshot`) — no clipped text, no overlaps, no placeholder strings, correct variants
- `get_metadata` confirms instances are linked to main components
- no stray hex/pixel values — every value resolves to a token
- contrast AA, touch target ≥ 44×44, heading order, and alt text all pass

When implementation is complete and the task is ready for review, update the task note:

- set `status: implemented`
- close the open `implementing plan` row in the `## Timeline` table by writing the current local date-time into its `finished_at` column. Match the exact row that was opened in step 5.

## Versioning

- **Never publish the Figma library during implementation.** Publishing is part of the review/handoff step, not implementation.
- Save a named version (or commit the Figma branch) only when the user explicitly asks.

## Graphify

- **Never run `graphify`, `graphify update`, or any graphify subcommand during implementation.**
- Graphify refresh is owned exclusively by [[skills/task-planning/SKILL|task-planning]] step 10 and only runs when the project note has `code_graph: true` and the existing `graphify-out/GRAPH_REPORT.md` is in the main checkout.
- A Figma design task does not produce graph artifacts; if a `graphify-out/` folder appears in any resolved path, do not touch it — mention it to the user as cleanup follow-up.

## Completion handoff

At the end of implementation, prepare for [[skills/task-review/SKILL|task-review]] instead of marking the task completed automatically.
Prompt the user with the explicit next step:

- `Implementation is done. Do you want to review the task now?`

## Linked notes

- [[skills/task-planning/SKILL|task-planning]]
- [[skills/address-pr-findings/SKILL|address-pr-findings]]
- [[skills/task-review/SKILL|task-review]]
- [[skills/design-in-figma/references/Figma Design Best Practices|Figma Design Best Practices]]