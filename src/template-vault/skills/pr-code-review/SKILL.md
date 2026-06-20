---
name: pr-code-review
description: Review pull request code changes by checking out a branch in a git worktree, running the assigned project's generic and project-specific personas from its best-practices reference plus the principal architect as reviewers, and writing all findings into a structured project note.
tags: [review, pr, code-review, git, worktree, personas, architecture]
version: 1.3.0
---

# PR Code Review

## Purpose

This skill performs a structured multi-persona review of code changes on a given branch.

It is designed to:
- check out the review target in a git worktree
- read the PR title and description before reviewing the diff
- extract stated scope, validation notes, and linked context from the PR description
- follow relevant PR-description links such as Jira tickets, issues, specs, or design docs
- inspect code changes against the relevant base branch
- check the PR's own commit messages for Conventional Commits compliance
- run each existing project persona as an explicit reviewer
- always include the principal architect as an additional reviewer
- collect findings in a structured way
- write the final review into a project note using a review template
- render each file-specific finding as a `pr-comment` block that can be posted later with the `github-pr-comments` Obsidian plugin

This skill is for review and documentation. It does not implement fixes unless explicitly asked later.

---

## When to use this skill

Use this skill when the user asks to:
- review a PR
- review a branch
- do a multi-persona code review
- perform an architectural/code-quality review
- create a review note for code changes

Typical triggers:
- "review this PR"
- "run a code review for branch X"
- "do a persona-based review"
- "review the changes and save findings"
- "check this branch with all personas"

---

## When not to use this skill

Do not use this skill when:
- the user wants implementation rather than review
- the user wants only a diff summary
- there is no branch, PR, or change target to review
- the repository is unavailable
- project personas cannot be found and the user only wants persona-based review specifically

If personas are missing, do not fail silently. State that clearly and continue with the principal architect review if appropriate.

---

## Review scope

This skill reviews:
- PR description intent, stated scope, and linked reference material where available
- changed files
- changed behavior implied by the diff
- architecture and design impact
- code simplicity and maintainability
- whether the change follows KISS, is the best current solution, and whether simpler alternatives exist
- consistency with project conventions
- possible regressions or risk areas
- commit message quality and Conventional Commits compliance across the PR's commits
- test impact
- documentation impact where relevant

This skill does not:
- rewrite code automatically
- create fix commits
- approve correctness with certainty if code cannot be run
- invent findings where evidence is missing

---

## Inputs required

Before starting the review, resolve these inputs:

1. **Project**
   - Which project does the review belong to?

2. **Branch**
   - Which branch should be reviewed?

3. **Base branch**
   - Which branch should it be compared against?
   - Default to the project default branch if not provided.

4. **Repository**
   - Resolve the GitHub repository in `owner/name` form.
   - Prefer the canonical remote or project metadata; do not guess.

5. **Pull request number**
   - Resolve the numeric PR id for the reviewed branch when the review is for a PR.
   - Prefer explicit user input, project metadata, or a verified branch-to-PR lookup.
   - If the requested output must be postable via `github-pr-comments`, this value is mandatory.

6. **Pull request description**
   - Resolve the current PR title and body when the review target is a PR.
   - Extract scope, non-goals, test plan, rollout notes, and referenced links.

7. **Review note name**
   - Determine the review note path and title according to project conventions.

8. **Persona source**
   - Resolve personas from the assigned project's `reference/Best Practices` or `reference/best-practices`.
   - Use the generic and project-specific personas defined for that project scope.
   - Do not lead with personas from another project.

If some inputs are missing, gather them before executing destructive or file-writing actions.

---

## Preconditions

Before review begins, verify:
- the project folder exists
- the repository exists
- the GitHub repository slug is resolved in `owner/name` form
- the branch exists locally or remotely
- a git worktree can be created or reused safely
- the PR number is resolved if the review is expected to produce postable `pr-comment` cards
- the PR title/body can be fetched via `skills/pr-code-review/scripts/fetch-pr-description.sh` when the review target is a PR
- personas can be resolved from the project context
- each resolved persona's review checklist can be extracted from its best-practices source; if a persona has no explicit checklist, derive a short checklist from its required rules and state that it was derived
- the review note destination can be determined
- **`skills/pr-code-review/references/card-comment-style.md` has been read** — this is mandatory before drafting any `pr-comment` body

If any precondition fails, stop and report the issue clearly.

---

## High-level workflow

1. Resolve project, branch, base branch, repository slug, PR number, and PR description.
2. Extract stated scope, validation notes, and linked references from the PR description, and consult the project LLM wiki for prior scope and context (read-only via [[skills/llm-wiki/SKILL|llm-wiki]] Query) when `02 Projects/<Project>/llm-wiki/` exists.
3. Follow relevant PR-description links and summarize accessible context.
4. Locate all personas from the assigned project scope.
5. Extract the review checklist for every resolved persona, plus a principal architect checklist.
6. Add the principal architect as a mandatory reviewer.
7. Create or reuse a dedicated git worktree for review.
8. Check out the target branch in that worktree.
9. Compute the diff against the base branch.
10. Inspect changed files and summarize scope, and check the PR's commit messages (`<base>..HEAD`) for Conventional Commits compliance.
11. Read `references/card-comment-style.md` — required before drafting any `pr-comment` body.
12. Run review passes:
   - one pass per persona
   - one pass by the principal architect
   - check off every checklist item with evidence, a finding reference, or a clear "not applicable" reason
13. Consolidate findings.
14. Deduplicate overlapping findings.
15. Assign severity and evidence.
16. Render `pr-comment` blocks with the resolved `repo` and `pr` values.
17. Write the final review note into the project.
18. Include summary, PR context, reviewer checklist audit, findings, risks, and recommended next steps.

---

## Worktree rules

Use a dedicated git worktree for review to avoid polluting the main working copy.

### Rules
- Never disrupt the user's current working tree.
- Prefer a predictable review worktree path.
- Reuse an existing matching clean review worktree if safe.
- If a matching worktree exists but is dirty, report it and avoid destructive actions.
- Do not delete existing worktrees unless explicitly asked.
- **Always place the review worktree as a sibling next to the main repo folder, never nested inside it.** The worktree path must start with `../` relative to the repo root.

### Suggested naming
Use a deterministic pattern like:

```text
../<repo-name>-review-<branch-name>
```

The `../` is mandatory — this places the worktree next to the main repo folder, not inside it.

### Branch checkout behavior
- If the branch exists locally, check it out in the review worktree.
- If only remote exists, create a local tracking branch in the worktree.
- Confirm that HEAD matches the intended branch before review begins.

---

## PR Description and Linked Context

Read the PR title and description before reviewing the diff.

### Extract from the PR description

- problem statement and intended behavior
- explicit scope and non-goals
- test plan or manual validation steps
- rollout, migration, or risk notes
- linked tickets, issues, specs, docs, designs, or incident notes

### Follow relevant links

- follow links from the PR description when they help determine expected behavior, acceptance criteria, or rollout constraints
- prioritize Jira, Linear, GitHub issues, specs, runbooks, design docs, and test plans
- ignore unrelated links that do not materially affect the review
- if a link is inaccessible, record that explicitly and continue with reduced confidence instead of pretending it was reviewed
- if linked context conflicts with the PR description or the diff, call out the mismatch as a finding or open question
- treat linked material as context, not proof that the implementation is correct

---

## Commit Message Review

Inspect the PR's **own** commits (the range `base..HEAD`, not the whole branch history) for Conventional Commits compliance. List them with:

```bash
git -C <worktree> log <base_branch>..HEAD --pretty=format:'%h | %s'
```

Check each subject against Conventional Commits:

- it must start with a type — `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`, `build`, `ci`, `style`, `revert` — optionally with a scope `type(scope):` and an optional `!` for breaking changes.
- a subject with **no type prefix** is a finding — e.g. an auto-generated `Potential fix for pull request finding`, a bare `WIP`, or `Update handler.go`.
- a typed but capitalized or vague subject (e.g. `fix(api): Fix pointer helpers`) is a minor style `note`, not a blocker.

**Why it matters:** depending on the merge strategy, non-compliant commit subjects can reach the base branch and break changelog/semver automation. Squash-merge with a conventional PR title masks it, but the merge strategy is not guaranteed.

**Severity guidance:**

- non-compliant subject that can land on the base branch → `low` (raise to `medium` if the repo enforces commit linting or cuts releases from commit history).
- typed-but-stylistically-weak subject → `note`.

**Rendering:** commit messages are not tied to a diff line, so emit a general PR comment card (`kind: issue`). Quote the offending `hash | subject` in the finding metadata, and recommend either a reword to a conventional subject or a squash-merge so the conventional PR title is what lands. Do not flag anything when every commit is already compliant — say so in the Notes section instead.

---

## Persona review loop

Resolve all personas from the assigned project's `reference/Best Practices` or `reference/best-practices`.

Use both:
- generic personas defined for that project
- project-specific personas defined for that project

If the project scope does not define the needed persona clearly, only then fall back to `00 Context/Personas`.
Do not use personas from another project scope as leading reviewers.

Each persona should review the changes from its own perspective.

In addition, always run:

- **Principal Architect**

The principal architect review is mandatory, even if not listed among project personas.

### Mandatory checklist audit

For every resolved persona:
- copy the persona's explicit checklist items from its project best-practices source into the review note
- if the source has no explicit checklist, derive concise checklist items from that persona's required rules and label them `derived`
- evaluate every checklist item against the PR diff, nearby context, and linked PR context
- mark every item with one of:
  - `[x]` — checked and no finding needed
  - `[!]` — checked and produced or supports a finding; include the finding number/title
  - `[n/a]` — not applicable to this PR; include a short reason
- include one short evidence note for each item, such as file path, diff area, command, linked context, or "no touched API/state surface"
- do not collapse a persona into a vague "no material findings" statement until every checklist item has been evaluated
- if a checklist item cannot be evaluated because context is missing, mark it `[!]` and add an Open Question or Finding; do not silently skip it

The review is incomplete until every persona checklist item and every principal architect checklist item appears in the review note and is checked off item by item.

### Persona review instruction
For each persona:
- review only the actual changed code and relevant nearby context
- avoid speculative feature ideas
- focus on evidence-backed findings
- match the persona’s discipline and concerns
- ask whether the change follows KISS, is the best current solution, and whether simpler alternatives exist; raise a finding when it does not
- call out uncertainty when present

### Architect review instruction
The principal architect focuses on:
- system fit
- design quality
- boundaries and responsibilities
- simplicity vs overengineering
- KISS: is this the simplest, best current solution, or do simpler alternatives exist?
- coupling/cohesion
- long-term maintainability
- consistency with project direction

---

## Review standards

Each reviewer must:
- **Tone Mandate**: Follow the "casual, direct, and to the point" style defined in `00 Context/Writing Style.md` and `references/card-comment-style.md`.
- **Address**: Use informal you. Avoid formal or report-like language.
- **Brevity**: Keep findings tied to evidence; avoid stylistic nitpicks unless they affect maintainability.
- **Structure**: Put the main ask in the first sentence. Use a conversational, question-led opening (e.g., "Why not...", "Can we...", "I would...") whenever natural.
- **Voice**: Write each `pr-comment` body in a natural reviewer voice, as if speaking directly to the author.
- **Focus**: Keep the GitHub comment body focused on one issue and one suggested direction.
- **Clarity**: Distinguish facts from suggestions and avoid duplicate findings.
- **Value**: Prefer fewer high-signal findings over noisy review spam.

### Finding format
```text
(Rest of the finding format remains the same...)
```

---

## Finding format

Every finding should contain review metadata plus a GitHub-postable comment card.

### Review metadata

Every finding should capture:

- reviewer
- supporting reviewers (if multiple reviewers found the same issue)
- category
- severity
- file
- line or area
- title
- evidence
- why it matters
- recommendation
- confidence

### Severity levels
Use:
- critical
- high
- medium
- low
- note

### Confidence levels
Use:
- high
- medium
- low

### Categories
Use one of:
- correctness
- architecture
- maintainability
- complexity
- performance
- security
- accessibility
- testing
- developer-experience
- documentation
- consistency

### PR comment card requirement

Every actionable file-specific finding must include a fenced `pr-comment` block in this exact shape so the `github-pr-comments` plugin can render it as a card and post it to GitHub later:

~~~~text
~~~pr-comment
repo: owner/repo
pr: 123
kind: review
author: Reviewer Name
path: path/to/file.ts
line: 42
side: RIGHT
---
Direct, GitHub-ready review comment body.
```suggestion
replacement();
```
---
@@ -1,3 +1,3 @@
 context diff hunk
~~~
~~~~

Rules:
- use `kind: review` for diff comments tied to `path` and `line`
- use `kind: issue` for general PR comments that should be posted to the PR conversation instead of a diff line
- keep the comment body ready to post as-is to GitHub; do not rely on extra prose outside the block to make it understandable
- keep the comment body short, precise, and actionable
- write the body like a human reviewer talking to the author, not like a detached report
- **you MUST read `references/card-comment-style.md` before drafting any comment body** — it is a required precondition, not an optional reference
- prefer one clear action or question in natural language, ideally within the first sentence
- opener-led phrasing is encouraged when it sounds natural, for example `Why not use...`, `Can we move...`, `I think we could...`, or `I would just...`
- prefer short reviewer voice over explanatory report voice; keep detailed rationale in the finding metadata above the card, not inside the card body

#### Inline style examples (from card-comment-style.md)

Good — short, direct, one issue:
```text
Why not use `setErrors` + inline display here like `CreditEditForm` does? Shows a toast for the same validation, which makes the UX inconsistent.
```

```text
I would add tests for the `<1000` and `>=1000` paths here as well. This guard changes submission behavior and only one flow is covered right now.
```

Bad — report voice, too long:
```text
This change introduces an inconsistency in the validation approach between the leasing and credit forms. The current implementation should likely be revisited to align both patterns.
```

The card body carries only what GitHub needs. All rationale goes in the finding metadata above the block.
- include a `suggestion` block only when the fix is small, concrete, and safe
- include the diff hunk in the second `---` section when available; it gives the card context in Obsidian, but it is not posted to GitHub
- if a finding is not tied to a specific file/line, do not force it into a fake card; keep it under `Cross-Cutting Risks` or `Open Questions`
- `author` is display metadata for the card; the actual GitHub author will be the token owner used by the plugin
- `kind` is descriptive metadata for the note; the plugin decides whether to call the review-comment or issue-comment API based on whether `path` and `line` are present
- never leave `repo` or `pr` blank in a `pr-comment` block
- if the repository slug or PR number cannot be verified, do not emit postable `pr-comment` blocks; stop and report the blocker instead of inventing placeholders
- always emit `side` for line comments
- use `side: RIGHT` for comments about the current/new version of the file, including added lines and unchanged context shown on the current diff side
- use `side: LEFT` only when the finding is explicitly about removed code on the old diff side

### Card field rules

- `repo` must be `owner/name`
- `pr` must be the numeric pull request id
- `path` must match the GitHub diff path exactly
- `line` must point to the changed line on the current diff side
- `side` must be set explicitly for line comments so GitHub can anchor the comment correctly
- `startLine`, `side`, `startSide`, and `commitId` may be included when multi-line comments or explicit commit pinning are needed
- omit optional fields instead of inventing values

### General PR comment rules

- when a finding is about untouched files, dead code outside the diff, or a broader design concern that cannot be anchored to a valid changed line, emit a general PR comment card instead of fabricating `path`/`line`
- general PR comment cards must still include verified `repo` and `pr`
- for general PR comment cards:
  - omit `path`, `line`, `side`, `startLine`, and `startSide`
  - mention the relevant file path or code area explicitly in the comment body
  - keep `kind: issue` so the note communicates that this is intended for the PR conversation thread

Example:

~~~~text
~~~pr-comment
repo: owner/repo
pr: 123
kind: issue
author: Principal Architect
---
The PR does not modify `src/legacy/footer.ts`, but the new composition continues to depend on dead code in that module. If we keep this as-is, the new footer path will inherit an obsolete dependency boundary. Consider removing the dead code in a follow-up or explain why it still has to exist.
~~~
~~~~

### Repository and PR resolution rules

- always carry one canonical `repository` value through the whole review note and reuse it for every `pr-comment` block
- always carry one canonical `pr_number` value through the whole review note and reuse it for every `pr-comment` block
- when reviewing a branch that is not tied to a PR, either:
  - ask the user whether they want a branch review note without postable comment cards, or
  - wait until the PR number is known
- never use example placeholders like `owner/repo` or `123` in an actual review note

---

## Good finding example

~~~~text
Severity: medium
Category: architecture
Reviewers: Principal Architect
Confidence: high

~~~pr-comment
repo: owner/repo
pr: 123
kind: review
author: Principal Architect
path: src/features/review/runReview.ts
line: 87
side: RIGHT
---
Can we extract note persistence behind a dedicated boundary here? This flow currently resolves reviewers, executes the review, and writes the note in one place.
---
@@ -80,7 +80,9 @@
relevant diff hunk
~~~
~~~~

---

## Bad finding example

```text
This feels a bit messy. Maybe refactor later.
```

Do not write vague findings like this.

---

## Consolidation rules

After all persona reviews:
- merge exact duplicates
- keep the strongest evidence wording
- preserve reviewer attribution
- note when multiple reviewers independently found the same issue

When multiple reviewers report the same problem:
- combine into one finding
- add a `reviewers:` field listing all supporting reviewers

---

## Output note

Write the final review into a project note in the folder "pr-reviews".

The note should follow a pattern similar to the task template, but adapted for PR/code review.

### Suggested file name
```text
pr-review-{branch-slug}.md
```

or, if IDs exist in the project:
```text
review-{id}.md
```

Place it in the relevant project folder according to project conventions.

### Frontmatter
Include:
- title
- status
- date
- project
- branch
- base_branch
- pr_number
- reviewers
- repository
- worktree
- related_task (if known)
- related_jira (if known)
- tags

---

## Review note structure

The note should contain these sections:

1. Summary
2. PR Context
3. Review Scope
4. Files Changed
5. Reviewer Lineup
6. Reviewer Checklist Audit
7. Findings
8. PR Actions
9. Cross-Cutting Risks
10. Recommended Actions
11. Open Questions
12. Review Metadata
13. Notes

---

## Review note content rules

### Summary
Include:
- what branch was reviewed
- which PR was reviewed when applicable
- what it was compared against
- how many files changed
- how many findings were collected
- top risk areas

### PR Context
Include:
- PR title and number when applicable
- a short summary of the PR description
- linked references that were reviewed
- blocked or inaccessible links
- important acceptance criteria, rollout notes, or constraints from Jira/docs

### Review Scope
Describe what was actually reviewed:
- PR description and linked context where available
- diff against base branch
- nearby impacted code where needed
- architectural implications where visible

### Files Changed
List changed files, preferably grouped by area if there are many.

### Reviewer Lineup
List:
- all project personas used
- principal architect

### Reviewer Checklist Audit

This section is mandatory.

For each reviewer, include the checklist used and check it off item by item before Findings. Use this compact format:

```markdown
### React Expert

- [x] Prefer existing project components over raw HTML — checked changed TSX call sites; no new raw native button introduced.
- [!] Props stay lean and intentional — Finding 2, Button API exposes an ambiguous `lg` size.
- [n/a] State handler boundaries — no state handler or query state touched in this PR.
```

Rules:
- include every explicit checklist item from each resolved persona's best-practices source
- include a principal architect checklist covering system fit, boundaries/responsibilities, KISS, coupling/cohesion, maintainability, consistency with project direction, and simpler alternatives
- when a best-practices file has no explicit checklist, derive concise items from the persona's required rules and label the reviewer heading with `(derived checklist)`
- every item must include a short evidence note after the dash text
- `[!]` items must reference a Finding, Open Question, or Cross-Cutting Risk
- `[n/a]` items must include a reason; do not use `[n/a]` to avoid checking an applicable rule
- do not omit low-level rules such as naming, spacing units, token usage, or test helper placement when they belong to the resolved persona checklist
- the review note is incomplete if this section is missing or if any item is unchecked

### Findings
Group by severity first, then file or category.

Each finding should be concise but complete.
Each actionable file-specific finding must include a `pr-comment` block.
Keep any supporting severity/category/confidence metadata immediately above the block so the note remains skimmable without polluting the GitHub comment body.
Every `pr-comment` block must repeat the resolved `repository` and `pr_number` values from the review metadata.
When a finding references untouched files or dead code outside the diff, emit it as a general PR comment card without `path`/`line`.

### PR Actions

After the findings, add one `pr-actions` block so the note renders an approval action beneath the review cards:

~~~~text
~~~pr-actions
repo: owner/repo
pr: 123
---
Optional approval summary that can be posted with the approval review.
~~~
~~~~

Rules:
- place this block once per review note, after all finding cards
- keep the body short and suitable as an approval note if the reviewer chooses to use it
- do not treat the existence of the block as an approval; it is only a manual action affordance

### Cross-Cutting Risks
Call out broader concerns that do not belong to one file only.

### Recommended Actions
Render as a single Markdown table with columns:

| Priority | File | Title | Action |
|---|---|---|---|

- **Priority**: one of `must fix`, `should fix`, `optional`
- **File**: the affected file path, formatted as inline code (`` `path/to/file.ts` ``)
- **Title**: short label matching the related finding title
- **Action**: one-sentence description of what needs to be done

Sort rows by priority: `must fix` first, then `should fix`, then `optional`.
If an action spans multiple files, add one row per file.
If no file applies (e.g. a process concern), use `—` in the File column.


### Open Questions
Include genuine uncertainties only.

### Review Metadata
Include:
- review timestamp
- repository
- PR number
- PR URL if available
- branch
- base branch
- worktree path
- compared commit range if available

### Notes
Freeform supporting notes.

---

## Note-writing rules

- Always write the review note after findings are consolidated.
- Do not mark the review as approved automatically.
- Do not mark issues as fixed.
- Do not rewrite task notes unless explicitly requested.
- If the review is linked to an existing task, reference it rather than replacing it.
- Preserve project naming and formatting conventions where known.
- Record which PR-description links were reviewed and which remained inaccessible.
- Do not dump large ticket or spec excerpts into the note; summarize only the constraints that matter for the review.
- If a finding should be posted to GitHub later, ensure the note already contains the exact `pr-comment` block for it rather than requiring manual reformatting later.
- Do not emit placeholder repo or PR values in review notes. Missing review metadata is a blocker, not a fill-in-later field.
- If a finding cannot be mapped to a valid diff line, downgrade it to a general PR comment card instead of inventing line metadata.
- **Always use fenced code blocks with the correct language identifier for any code, diffs, shell commands, or config snippets.** Never use plain/untyped fences. Examples:
  - `typescript` / `javascript` / `go` / `python` for source code
  - `diff` for inline diff excerpts
  - `bash` / `sh` for shell commands
  - `json` / `yaml` / `toml` for config files
  - `text` only as a last resort when no language applies
  This applies everywhere in the review note: findings, evidence blocks, examples, and metadata snippets.

---

## Review process detail

### Step 1: Resolve project context
- locate project folder
- locate repository
- resolve repository slug in `owner/name` form
- resolve PR number for the branch when postable comment cards are expected
- fetch the PR title and description when reviewing a PR using the helper script at `skills/pr-code-review/scripts/fetch-pr-description.sh <owner/repo> <pr_number>`; this script reads the GitHub token from the `github-pr-comments` plugin's `data.json` and works with private repositories
- extract referenced URLs and issue keys from the PR description
- consult the project LLM wiki read-only for scope and context when `02 Projects/<Project>/llm-wiki/` exists (via [[skills/llm-wiki/SKILL|llm-wiki]] Query) — use it to inform, never replace, diff-based findings
- locate personas
- locate template

### Step 2: Resolve PR context
- summarize the PR description into scope, validation notes, and constraints
- follow relevant linked tickets/docs from the PR description
- record inaccessible links and any resulting confidence reduction
- identify acceptance criteria or rollout assumptions that should shape the review

### Step 3: Prepare worktree
- determine review worktree path
- create or reuse safely
- check out branch
- verify branch and HEAD

### Step 4: Compute review scope
- determine base branch
- generate file list and diff summary
- list the PR's commits (`<base>..HEAD`) and check each subject for Conventional Commits compliance
- identify hotspots by file size, churn, and sensitive areas

### Step 5: Run persona reviews
Before drafting any `pr-comment` body, read `skills/pr-code-review/references/card-comment-style.md`. This is mandatory — not optional.

For each persona:
- extract the persona checklist from project best practices
- evaluate every checklist item against the PR
- record the checklist result for the review note using `[x]`, `[!]`, or `[n/a]`
- produce findings only where warranted

### Step 6: Run architect review
- inspect overall design fit
- identify architectural issues and simplification opportunities
- evaluate and record the principal architect checklist item by item

### Step 7: Consolidate
- deduplicate
- assign severities
- collect supporting reviewers
- decide whether each finding is a diff comment or a general PR comment
- extract cross-cutting risks

### Step 8: Write review note
- fill template
- include summary, PR context, and metadata
- include the `pr-actions` block after the findings
- save in project

---

## Guardrails

- Do not invent personas.
- Do not fabricate file paths, line numbers, or code behavior.
- Do not call something a bug unless there is evidence.
- Do not produce empty boilerplate findings just to satisfy each persona.
- It is acceptable for a persona to report “no material findings.”
- Prefer honesty over forced completeness.

---

## Minimal success criteria

A successful review must:
- use all existing project personas that can be resolved
- include the principal architect
- review the target branch in a git worktree
- inspect the PR description for stated scope, test plan, and referenced context when the review target is a PR
- follow or explicitly account for relevant links from the PR description
- compare against a defined base branch
- check the PR's commit messages for Conventional Commits compliance and flag any non-compliant subjects
- consult the project LLM wiki for scope and context when one exists, and reflect relevant constraints in the review
- evaluate whether the change follows KISS, is the best current solution, and whether simpler alternatives exist
- include a `Reviewer Checklist Audit` section in the review note
- copy or derive every resolved persona checklist into that section
- check off every checklist item-by-item with `[x]`, `[!]`, or `[n/a]`, and include evidence or a reason
- include a completed principal architect checklist
- produce structured findings with evidence
- render each actionable file-specific finding as a valid `pr-comment` block
- use general PR comment cards for findings that cannot be anchored to touched diff lines
- include verified `repository` and `pr_number` metadata in the note and in every `pr-comment` block
- write the final review note into the project

If any of these are missing, the review is incomplete.

---

## Failure handling

If review cannot proceed:
- explain exactly what is missing or blocked
- do not partially pretend the review was complete
- if possible, still write a short blocked-review note with the blocker clearly stated

Examples of blockers:
- branch does not exist
- repository unavailable
- repository slug cannot be verified
- PR number cannot be resolved for a postable review
- PR description cannot be resolved for a PR-targeted review
- required linked context is inaccessible and the user asked for a context-aware PR review
- personas missing
- worktree cannot be created safely
- no diff can be computed

---

## Final instruction

When this skill is active, optimize for:
- low noise
- high signal
- concise, actionable GitHub-ready comments
- natural, personal reviewer voice
- evidence-backed findings
- persona-specific perspective
- architectural judgment
- durable written documentation
