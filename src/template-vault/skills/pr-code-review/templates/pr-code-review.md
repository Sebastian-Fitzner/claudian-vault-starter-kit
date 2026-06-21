---
title: PR Review — {{branch}}
status: active
date: {{date}}
project: {{project}}
branch: {{branch}}
base_branch: {{base_branch}}
pr_number: {{pr_number}}
repository: {{repository}}
pr_url: {{pr_url}}
worktree: {{worktree}}
reviewers:
  - {{principal_architect}}
tags: [review, pr-review]
related_task: {{related_task}}
related_jira: {{related_jira}}
---

# PR Review — {{branch}}

## Summary

- **Project:** {{project}}
- **Repository:** {{repository}}
- **PR:** {{pr_reference}}
- **Branch:** {{branch}}
- **Base branch:** {{base_branch}}
- **Worktree:** {{worktree}}
- **Files changed:** {{files_changed_count}}
- **Findings:** {{findings_count}}

### Top risks
- {{top_risk_1}}
- {{top_risk_2}}
- {{top_risk_3}}

---

## PR Context

### Description Summary

{{pr_description_summary}}

### Linked References Reviewed

{{linked_references_reviewed}}

### Missing Or Inaccessible Context

{{linked_references_blocked}}

---

## Review Scope

This review covers the code changes on `{{branch}}` compared against `{{base_branch}}`, including directly affected code and relevant nearby context where needed.

---

## Files Changed

{{files_changed_list}}

---

## Reviewer Lineup

{{reviewer_lineup}}

---

## Findings

### Critical
{{findings_critical}}

### High
{{findings_high}}

### Medium
{{findings_medium}}

### Low
{{findings_low}}

### Notes
{{findings_note}}

---

## Cross-Cutting Risks

{{cross_cutting_risks}}

---

## Recommended Actions

| Priority | File | Title | Action |
|---|---|---|---|
{{recommended_actions_rows}}

---

## Open Questions

{{open_questions}}

---

## Review Metadata

- **Review date:** {{date}}
- **Repository:** {{repository}}
- **PR:** {{pr_reference}}
- **PR URL:** {{pr_url}}
- **Compared range:** {{compared_range}}
- **Review mode:** multi-persona + principal architect
- **Personas used:** {{personas_used}}

---

## Notes

{{notes}}
