---
name: specialist-investigation
description: investigate specialized technical problems with a strict discovery pattern before planning or fixing. use when a task needs deep domain expertise such as css/browser bugs or another specialist domain. ask boundary questions, restate the problem in your own words, search the internal wiki or specialist references first, cite relevant sources, provide first feedback and hypotheses, offer structured debug options, and only then recommend the next best step.
---

# Specialist Investigation

Use this as the default specialist workflow. Domain-specific specialist notes plug into this pattern.

## Mandatory sequence

1. Ask 2–4 boundary questions.
2. Wait for the answers.
3. Repeat the case in your own words.
4. State what is known and what is still unclear.
5. Search internal specialist references and wiki entries first.
6. Present the most relevant sources and similarities.
7. Give first feedback:
   - likely mechanism or category
   - confidence level
   - what does not fit yet
8. Offer debug options.
9. Recommend the next best step.
10. After resolution, summarize the root cause and document the learning.

## Debug option format

Provide options like:
- fastest isolation path
- mechanism validation path
- structural fix path

Each option must say what it tests and what result would confirm or reject the hypothesis.

## Rules

- Never jump straight to the fix.
- Always restate the problem before deep analysis.
- Always search the internal wiki/reference material first when it exists, starting with [[00 Context/Specialists/Specialists|Specialists]] and the relevant domain wiki.
- Always show why a source or prior case is relevant.
- Prefer minimal, falsifiable next steps over broad speculative rewrites.
- If this specialist flow is used inside task planning, finish the investigation before writing the final implementation plan.

## CSS specialization

When the specialist domain is css/browser bugs, apply these additional rules:
- use [[03 Wiki/Browser/CSS Bugs and Quirks/00-index/bug-atlas|CSS Bug Atlas]] and [[03 Wiki/Browser/CSS Bugs and Quirks/README|README]] as primary references
- classify the bug as layout, paint, compositing, timing/animation, or rounding
- ask about overflow, transform, filter, perspective, contain, will-change, and animation timing
- write the intake answers into task notes
- after solving, create or propose a wiki entry using [[03 Wiki/Browser/CSS Bugs and Quirks/templates/css-quirk-entry-template|CSS Quirk Entry Template]]

## Linked notes

- [[00 Context/Specialists/Specialists|Specialists index]]
- [[00 Context/Specialists/CSS Bug-Fixing Expert|CSS Bug-Fixing Expert]]
- [[03 Wiki/Browser/CSS Bugs and Quirks/README|CSS Bug-Fixing Wiki]]
- [[03 Wiki/Browser/CSS Bugs and Quirks/00-index/bug-atlas|CSS Bug Atlas]]
- [[03 Wiki/Browser/CSS Bugs and Quirks/templates/css-quirk-entry-template|CSS Quirk Entry Template]]
