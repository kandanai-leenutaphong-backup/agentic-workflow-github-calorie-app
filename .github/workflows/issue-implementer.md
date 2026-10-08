---
description: On /implement, builds the feature from the issue and its spec, runs the tests and opens a draft PR.
on:
  slash_command:
    name: implement
    events: [issues, issue_comment]
permissions:
  contents: read
  issues: read
  pull-requests: read
  copilot-requests: write
engine: copilot
tools:
  bash: ["npm test", "npm run *", "node *", "git status", "git diff *", "ls *", "cat *"]
  edit:
safe-outputs:
  create-pull-request:
    title-prefix: "[agent] "
    labels: [agent-authored]
    draft: true
  add-comment:
    max: 1
timeout-minutes: 20
---

# Issue Implementer

Implement issue #${{ github.event.issue.number }}. Extra instructions: "${{ steps.sanitized.outputs.text }}".

1. Read the issue, every comment (especially a spec comment from the Spec Writer) and the code.
2. Implement the smallest change that satisfies the acceptance criteria.
   - Zero runtime dependencies. Keep the existing style (CommonJS, `'use strict'`).
   - Put nutrition logic in `src/calories.js`, validation in `src/validate.js`, routes in `src/app.js`.
3. Add or update tests in `test/` and update `README.md` if behavior changed.
4. Run `npm test` and fix failures. If you cannot make tests pass, do not open a PR; comment with what blocked you.
5. Open a draft PR whose body starts with `Closes #${{ github.event.issue.number }}` and lists what changed, how you tested, and anything uncertain.
6. Comment on the issue with a link to the PR.
