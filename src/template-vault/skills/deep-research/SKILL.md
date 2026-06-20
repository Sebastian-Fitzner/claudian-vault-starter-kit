---
name: deep-research
description: Research a topic deeply using local repository context, available web search, and structured synthesis. Produces a broad, cited Markdown research artifact with findings, tradeoffs, risks, recommendation, confidence, and next steps. MCP optional. For repo-bound research on a vault project that opted into codegraph (code_graph: true), analyze the codebase through the codegraph index (read-only) instead of raw grep.
---

# Skill: Deep Research

## Purpose

Use this skill when a user asks for deep research, an evidence-backed briefing, a literature/resource review, a market/technical/strategic analysis, or any task where the final answer must be broad, well-sourced, and non-invented.

The goal is to produce a research artifact with:

- a clear table of contents
- deep content knowledge
- broad perspective across credible viewpoints
- explicit citations for factual claims
- a resources section listing what was used
- clear uncertainty where evidence is weak or incomplete

This skill is designed for agents such as Claude Code, Codex CLI, Gemini CLI, or local orchestrators that may have web search, browser, MCP, repository, and file-system tools.

---

## Non-negotiable rules

1. Never invent facts, sources, quotes, data, dates, authors, organizations, links, or conclusions.
2. Every factual claim that is not common background knowledge must be traceable to a source.
3. When evidence is missing, say so explicitly.
4. When sources disagree, present the disagreement instead of forcing false certainty.
5. Prefer primary sources over secondary sources.
6. Separate evidence from interpretation.
7. Do not cite a source unless you actually inspected it.
8. Do not rely only on search snippets for important claims.
9. Do not use AI-generated summaries as evidence unless the task is explicitly about those summaries.
10. Do not hide weak sourcing. Mark it clearly.
11. Do not pretend MCP or any tool is available if it is not. MCP is optional; fall back to local files, shell, git, and web search.
12. Do not make large code changes during research unless explicitly asked.
13. If research becomes too broad, narrow scope and state the narrowed scope.
14. Do not use caveman style, compressed wording, telegraphic fragments, or shorthand in research artifacts or user-facing summaries.
15. Be concise and informative, but never compress away evidence, caveats, citations, reasoning, or source limitations.

---

## When to use this skill

Use this skill for requests like:

- “Do deep research on …”
- “Create a comprehensive report about …”
- “Compare the best options for …”
- “Research the current state of …”
- “Find sources and summarize the evidence …”
- “Create an expert-level knowledge base on …”
- “Investigate this technology / market / policy / product / company …”

Do not use this full workflow for simple questions, quick definitions, basic coding tasks, or purely creative writing.

---

## Research quality standard

A good deep research result should be:

- **Grounded**: every important factual claim can be traced.
- **Broad**: includes multiple perspectives, not just the first matching answer.
- **Current**: checks recency when the topic can change.
- **Structured**: starts with a TOC and leads the reader from overview to details.
- **Honest**: states uncertainty, source limitations, and open questions.
- **Useful**: ends with resources, next steps, and practical implications where relevant.

---

## Recommended tool stack

Use the best available tools in this order.

### 1. Web search

Use web search to discover sources, compare perspectives, and check recency.

Prefer queries that include:

- official documentation
- primary source
- PDF
- whitepaper
- statistics
- site-specific searches
- recent year, if relevant
- opposing viewpoint terms

Example queries:

```text
<topic> official documentation
<topic> site:gov OR site:edu
<topic> whitepaper PDF
<topic> criticism limitations risks
<topic> recent developments 2026
<topic> benchmark comparison
```

### 2. Browser / page fetch

Open and inspect the actual pages. Do not rely on snippets alone.

For each relevant source, capture:

- title
- author or organization
- publication date or last updated date
- URL
- source type
- key claims
- relevant quotes or data points
- limitations

### 3. Defuddle or content extraction

Use Defuddle, Readability, browser-reader mode, or equivalent extraction tools when web pages contain clutter.

Use Defuddle especially for:

- articles with heavy navigation
- pages with ads or sidebars
- pages where the main content must be converted to clean Markdown
- web pages that will be stored as research notes

Suggested pipeline:

```text
fetch URL
extract main content with Defuddle or equivalent
save clean Markdown
compare extracted content against original page if the claim is important
record metadata and URL
```

Do not trust extraction blindly. For high-stakes claims, numbers, dates, code snippets, or quotes, verify against the rendered/original source.

### 4. PDFs and documents

When a source is a PDF or document:

- inspect the document directly
- capture title, author, date, publisher, and page numbers if possible
- cite page numbers or section names when available
- for charts/tables, verify labels, units, and timeframe

### 5. Repository or code search

For technical research, inspect repositories directly when possible.

For a vault project's own repository that opted into codegraph (`code_graph: true` + a built `<repo-path>/.codegraph/codegraph.db`), prefer querying the codegraph index (read-only — `codegraph_explore`, `codegraph_callers|callees|impact`, `codegraph_status`) over raw file scans; see Step 1b. For other or external repos, inspect directly.

Look for:

- README
- docs
- examples
- changelog
- release notes
- issues
- pull requests
- package metadata
- tests
- source code behavior

Do not infer library behavior only from marketing pages.

### 6. MCP / connected tools

If MCP tools are available, use them for:

- codegraph code index for opted-in vault projects (`codegraph_explore`, `codegraph_search`, `codegraph_callers|callees|impact`, `codegraph_files`, `codegraph_status`)
- GitHub repository inspection
- Jira context
- internal docs
- local Obsidian vaults
- issue trackers
- package registries
- source code references

Cite internal or private sources separately from public sources.

---

## Source hierarchy

Prefer sources in this order:

1. Primary sources: official docs, standards, laws, specifications, original papers, raw datasets, source code.
2. High-quality secondary sources: respected research institutions, technical blogs from maintainers, academic reviews, reputable journalism.
3. Community sources: GitHub issues, forums, Stack Overflow, Reddit, Hacker News.
4. Tertiary summaries: Wikipedia, generic blogs, AI summaries.

Community and tertiary sources can help discover leads, but they should not carry critical claims unless no better source exists.

---

## Research workflow

### Step 1: Clarify the research question internally

Identify:

- exact topic
- target project / repository (if repo-bound)
- intended audience
- required depth: **quick** / **normal** / **deep**
- output type: research note / ADR / RFC / implementation plan / comparison matrix
- timeframe
- geography or jurisdiction
- technical level
- decision to support
- constraints: stack, time, budget, compatibility, team preferences
- output format

If the user’s request is ambiguous but still researchable, make reasonable assumptions and state them in the final report.

### Step 1b: Repository-aware research (when topic is repo-bound)

MCP is optional — never require it. If the topic concerns a specific repo or codebase, inspect local context **before** external research.

Read first:

- README
- AGENTS.md / CLAUDE.md / agents.md
- package.json / lockfiles
- architecture docs, existing ADRs/RFCs
- source files related to the topic
- tests and CI config

Use targeted search, not whole-repo reads.

**Codegraph (opt-in, preferred for code analysis).** When the repo belongs to a vault project that opted into codegraph — the project note has `code_graph: true` and `<repo-path>/.codegraph/codegraph.db` exists (repo resolved from the project note's `local`) — analyze the code through the codegraph index instead of grep or whole-repo reads. Prefer the MCP tool `codegraph_explore` ("how does X work", architecture, a flow) and `codegraph_callers` / `codegraph_callees` / `codegraph_impact` for relationships and blast radius; `codegraph_status` / `codegraph_files` for inventory. CLI equivalents: `codegraph query`, `codegraph callers|callees|impact`, `codegraph status`, `codegraph files`. Treat the index as ground truth for current code structure. **Read-only:** never run `codegraph init`, `codegraph index`, or `codegraph sync` from research — index refresh is owned solely by [[skills/task-planning/SKILL|task-planning]] step 10. When the project is not opted in (or the index is absent), fall back to git + grep:

```bash
git status --short
git branch --show-current
grep -R "keyword" -n .
```

After external research, **validate the recommendation against the local project**:

- framework version, build system, deployment target
- team conventions, existing architecture, testing strategy
- performance and security constraints
- (codegraph opt-in) run `codegraph_impact` on the symbols a recommendation would touch to estimate its blast radius in the local project

Never recommend a tool only because it is popular. Always connect external findings back to the local repository.

### Step 2: Create a research plan

Write a short internal plan:

```markdown
## Research Plan

Topic:
Scope:
Timeframe:
Key questions:
Likely source categories:
Known risks:
```

Do not spend too long planning. Start collecting evidence quickly.

### Step 3: Build source map

Collect sources across categories.

Minimum target for a serious deep research task:

- 3–5 primary sources where available
- 3–7 reputable secondary sources
- 1–3 critical or opposing sources
- 1–3 practical implementation examples, if technical
- more sources if the topic is broad, controversial, or fast-moving

For each source, record:

```markdown
- ID:
- Title:
- URL:
- Author / Organization:
- Date:
- Type:
- Why it matters:
- Key evidence:
- Limitations:
```

### Step 4: Extract and verify facts

For each major claim:

1. Find at least one source.
2. Prefer a primary source.
3. Cross-check important claims with another independent source.
4. Record uncertainty if sources conflict or are incomplete.

Use this evidence table while working:

```markdown
| Claim | Source ID(s) | Confidence | Notes |
|---|---|---|---|
|  |  | High / Medium / Low |  |
```

Confidence guide:

- **High**: primary source or multiple independent reliable sources.
- **Medium**: credible secondary source, but limited corroboration.
- **Low**: single source, unclear provenance, community report, or indirect evidence.

### Step 5: Look for disagreement and missing perspectives

Actively search for:

- criticisms
- risks
- limitations
- failures
- minority viewpoints
- regional differences
- old vs new information
- vendor bias
- academic vs industry disagreement
- implementation gaps

Use queries like:

```text
<topic> limitations
<topic> criticism
<topic> risks
<topic> failed implementation
<topic> controversy
<topic> benchmark caveats
```

### Step 6: Synthesize, do not paste

The final answer should synthesize evidence, not copy large chunks.

Use direct quotes sparingly and only when exact wording matters.

Clearly separate:

- What sources say
- What can be inferred
- What remains uncertain
- What is your recommendation or interpretation

### Step 7: Produce the final research artifact

The final report must include:

1. Title
2. Date of research
3. Scope and assumptions
4. Table of contents
5. Executive summary
6. Deep research sections
7. Broad-perspective analysis
8. Evidence table or claim/source mapping
9. Resources used
10. Open questions / uncertainty
11. Suggested next steps, if useful

---

## Required final structure

Use this Markdown structure unless the user requested another format.

```markdown
# <Research Title>

Research date: <YYYY-MM-DD>

## Scope and assumptions

<What was researched, what was not, and any assumptions.>

## Table of contents

- [Executive summary](#executive-summary)
- [Key findings](#key-findings)
- [Background](#background)
- [Deep analysis](#deep-analysis)
- [Perspectives and disagreements](#perspectives-and-disagreements)
- [Evidence map](#evidence-map)
- [Risks, limitations, and unknowns](#risks-limitations-and-unknowns)
- [Resources used](#resources-used)
- [Next steps](#next-steps)

## Executive summary

<Short synthesis with citations.>

## Recommendation

<Clear, practical recommendation. For repo-bound research, state fit for the local project.>

## Confidence

High / Medium / Low — with reason (source quality, corroboration, repo context completeness).

## Key findings

1. <Finding with citation.>
2. <Finding with citation.>
3. <Finding with citation.>

## Background

<Context and definitions with citations.>

## Deep analysis

### <Section 1>

<Deep explanation with citations.>

### <Section 2>

<Deep explanation with citations.>

### <Section 3>

<Deep explanation with citations.>

## Perspectives and disagreements

<Compare competing views, incentives, and source disagreements.>

## Evidence map

| Claim | Source(s) | Confidence | Notes |
|---|---|---|---|
| <Claim> | <Source IDs or links> | High / Medium / Low | <Why> |

## Risks, limitations, and unknowns

- <Known limitation>
- <Open question>
- <Evidence gap>

## Resources used

| ID | Source | Type | Date | Why used |
|---|---|---|---|---|
| S1 | <Title + URL> | <Primary / Secondary / Community> | <Date> | <Reason> |

## Next steps

<Optional practical next actions.>
```

---

## Citation requirements

Use the citation format supported by the current environment.

If no special citation system exists, use Markdown footnotes or inline links:

```markdown
This claim is supported by the official specification.[^1]

[^1]: Source title, organization, date, URL, accessed YYYY-MM-DD.
```

For internal files, include:

- file path
- section heading
- line number if available
- commit hash if relevant

For code repositories, include:

- repository URL
- file path
- line number or commit hash
- release/tag if relevant

For PDFs, include:

- page number
- section name
- document date

---

## Anti-hallucination checklist

Before finalizing, verify:

- [ ] Every key factual claim has a source.
- [ ] No invented source titles, authors, dates, or URLs.
- [ ] No citation is attached to a claim it does not support.
- [ ] Recent claims were checked against recent sources.
- [ ] Conflicting evidence is represented fairly.
- [ ] Assumptions are stated.
- [ ] Unverified claims are removed or marked uncertain.
- [ ] Quotes are exact and short.
- [ ] Data points include units, dates, and context.
- [ ] The resources section includes all used sources.

---

## Broad-perspective checklist

Make sure the research covers:

- [ ] official / primary view
- [ ] independent expert view
- [ ] practical implementation view
- [ ] critical or skeptical view
- [ ] historical context, if relevant
- [ ] current developments, if relevant
- [ ] limitations and risks
- [ ] unknowns and open questions
- [ ] user impact or decision relevance

---

## Technical research additions

For software, frameworks, APIs, libraries, or architecture topics, also inspect:

- official docs
- API reference
- changelog
- release notes
- GitHub repository
- issues and discussions
- examples
- migration guides
- benchmarks
- security notes
- license

Add sections:

```markdown
## Technical behavior

## Integration options

## Operational risks

## Version and compatibility notes

## Recommended implementation path
```

Never claim a feature exists unless verified in docs, code, release notes, or tests.

---

## Market or product research additions

For market, vendor, or product topics, also inspect:

- pricing pages
- terms and limitations
- official docs
- customer reviews
- independent comparisons
- recent announcements
- product changelog
- support forums
- security/privacy documentation

Add sections:

```markdown
## Vendor landscape

## Pricing and constraints

## Strengths and weaknesses

## Fit by use case

## Recommendation
```

Mention pricing dates because pricing changes frequently.

---

## Policy, legal, or health research additions

For legal, policy, medical, financial, or safety-sensitive topics:

- use authoritative current sources
- state jurisdiction
- state date
- avoid overconfident advice
- include “not legal/medical/financial advice” where appropriate
- recommend consulting a qualified professional for decisions

---

## Defuddle usage pattern

When Defuddle or a similar extraction tool is available, use it like this:

```bash
# Example only; adapt to the available environment.
defuddle "https://example.com/article" > research/raw/example.md
```

Then create a note:

```markdown
# Source Note: <Title>

URL:
Fetched:
Extracted with: Defuddle / Readability / Browser
Author:
Published:
Updated:
Source type:

## Extracted summary

## Key claims

## Useful quotes

## Caveats

## Verification notes
```

Important: Defuddle helps extract readable content; it does not verify truth.

---

## File organization for local agents

Suggested local structure:

```text
research/
  README.md
  sources/
    S001-source-title.md
    S002-source-title.md
  raw/
    downloaded-pages/
    pdfs/
  notes/
    claim-map.md
    contradictions.md
    open-questions.md
  final/
    report.md
```

Source IDs should be stable:

```text
S001, S002, S003...
```

Use the same IDs in the evidence map and final resources section.

---

## Final answer style

Write clearly and directly in normal professional prose.

Output must be concise and informative, not compressed. Do not use caveman style, artificial shorthand, terse fragments, or omitted articles as a space-saving device. The reader should receive enough context to understand the evidence, caveats, and recommendation without guessing.

Avoid:

- unsupported certainty
- vague phrases like “many experts say”
- fake precision
- hidden assumptions
- source dumping without synthesis
- one-sided conclusions
- compressed wording that removes context, citations, uncertainty, or reasoning
- caveman-style fragments, shorthand, or note-only output

Prefer:

- “The strongest evidence I found is …”
- “The sources agree on …”
- “The sources disagree on …”
- “I could not verify …”
- “This appears likely, but the evidence is limited because …”
- “As of <date>, the source says …”

---

## Completion criteria

The task is complete only when the final artifact contains:

- [ ] title
- [ ] research date
- [ ] scope and assumptions
- [ ] table of contents
- [ ] executive summary
- [ ] deep content sections
- [ ] broad perspectives / disagreements
- [ ] evidence map
- [ ] risks, limitations, and unknowns
- [ ] resources used
- [ ] citations for all important claims
- [ ] explicit uncertainty where needed

If these are not present, continue researching or revise the report.
