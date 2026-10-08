---
description: When CI fails, investigates the logs, finds the root cause and comments on the PR or opens an issue.
on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]
    branches: ["**"]
permissions:
  contents: read
  actions: read
  pull-requests: read
  issues: read
  copilot-requests: write
engine: copilot
if: ${{ github.event.workflow_run.conclusion == 'failure' }}
tools:
  github:
    toolsets: [default, actions]
safe-outputs:
  add-comment:
    target: "*"
    max: 1
  create-issue:
    title-prefix: "[ci-doctor] "
    labels: [ci, agent-authored]
    max: 1
timeout-minutes: 10
---

# CI Failure Doctor

CI run ${{ github.event.workflow_run.html_url }} failed (commit `${{ github.event.workflow_run.head_sha }}`).

1. Fetch the failed jobs and their logs. Find the first real error, not the cascade.
2. Compare against the commit diff and the code to identify the root cause. Classify it: `code bug`, `test bug`, `data issue`, `flaky/infra`.
3. If the run belongs to a pull request, comment there with: root cause, evidence (log excerpt, 10 lines max), and a concrete suggested patch.
4. If there is no pull request (for example a push to `main`), open one issue with the same content.
5. Never open duplicate issues: search for an existing open `[ci-doctor]` issue about the same failure first and skip if present.
