---
description: Turns a new one-line idea or bug report into a well-formed issue with type labels, acceptance criteria and clarifying questions.
on:
  issues:
    types: [opened, reopened]
  reaction: eyes
permissions:
  contents: read
  issues: read
  copilot-requests: write
engine: copilot
safe-outputs:
  add-labels:
    allowed: [bug, feature, data, question, needs-info, ready-for-spec]
    max: 3
  add-comment:
    max: 1
timeout-minutes: 10
---

# Idea Triager

Triage issue #${{ github.event.issue.number }} in this tiny calorie-tracker app
(Node, JSON storage, code in `src/`, seed data in `data/foods.json`).

1. Read the issue and the relevant code and README. Do not invent details.
2. Label it with exactly one of `bug`, `feature`, `data` (wrong or missing food nutrition values), or `question`.
3. If it is concrete enough to specify, add `ready-for-spec`. Otherwise add `needs-info` and ask at most three specific questions.
4. Post one comment containing:
   - a one-sentence restatement
   - 3 to 5 acceptance criteria as a checklist (include edge cases such as negative grams, missing date, unknown food)
   - the files likely affected
   - a next step: "comment `/spec` to get a design" when `ready-for-spec`
