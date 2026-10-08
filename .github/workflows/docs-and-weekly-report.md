---
description: Weekly keeps the README in sync with the code and publishes a changelog and repo health summary of what the agents and humans shipped.
on:
  schedule: weekly
  workflow_dispatch:
permissions:
  contents: read
  issues: read
  pull-requests: read
  copilot-requests: write
engine: copilot
tools:
  github:
    toolsets: [default]
  bash: ["git log *", "git diff *", "cat *", "ls *", "npm test"]
  edit:
safe-outputs:
  create-pull-request:
    title-prefix: "[docs] "
    labels: [documentation, agent-authored]
    draft: true
  create-issue:
    title-prefix: "[weekly] "
    labels: [report]
    max: 1
    close-older-issues: true
timeout-minutes: 15
---

# Docs Sync and Weekly Report

## 1. Docs sync
Compare `README.md` with the real routes in `src/app.js`, the scripts in `package.json` and the UI in `public/index.html`. If the README is wrong or missing something, fix it and open a draft PR. If it is accurate, skip the PR.

## 2. Weekly report
Open one issue titled with the date range covering the last 7 days:

- **Shipped**: merged PRs grouped as Features, Fixes, Data, Docs (link each)
- **Agent activity**: PRs labelled `agent-authored` with merged / open / closed counts, and which workflows produced them
- **Open work**: issues labelled `bug` or `ready-for-spec` that are waiting
- **Suggested changelog entry** in Keep a Changelog style

Base everything on real data from the repository. If nothing happened, say so briefly.
