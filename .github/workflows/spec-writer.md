---
description: On /spec, posts a short design (API, data model, UI, tests, edge cases) for an issue.
on:
  slash_command:
    name: spec
    events: [issues, issue_comment]
permissions:
  contents: read
  issues: read
  copilot-requests: write
engine: copilot
safe-outputs:
  add-comment:
    max: 1
  add-labels:
    allowed: [spec-ready]
    max: 1
timeout-minutes: 10
---

# Spec Writer

Write an implementation spec for issue #${{ github.event.issue.number }}. Extra instructions from the commenter: "${{ steps.sanitized.outputs.text }}".

Read the issue thread and the code in `src/`, `public/`, `data/`, `test/`. Then post one comment with:

1. **Summary** (2 sentences)
2. **API changes** (routes, request/response JSON)
3. **Data model changes** (`data/foods.json`, `data/entries.json`)
4. **UI changes** (`public/index.html`)
5. **Test plan** (unit and API tests, using `node:test`, in `test/`)
6. **Edge cases and risks**
7. **Out of scope**

Keep it under 400 words, match the existing code style, add no new dependencies, and end with "Comment `/implement` to have an agent build this." Then add the `spec-ready` label.
