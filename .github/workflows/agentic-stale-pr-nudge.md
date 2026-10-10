---
labels: ["agentic"]
description: |
  Finds open pull requests with no activity for a while, works out what each one is
  actually waiting on (author, reviewer, failing CI, merge conflict) and posts one
  short, specific nudge per PR. Maintainers get a single digest of what was nudged.

on:
  schedule: daily
  workflow_dispatch:
    inputs:
      stale-days:
        description: "Days without activity before a PR counts as stale"
        required: false
        default: "7"
  slash_command:
    name: nudge
    events: [pull_request, issue_comment]

permissions:
  contents: read
  issues: read
  pull-requests: read
  actions: read
  copilot-requests: write

engine: copilot

network: defaults

tools:
  github:
    toolsets: [default, actions]
    min-integrity: none
  bash: ["gh pr list *", "gh pr view *", "date *", "cat", "jq *"]

safe-outputs:
  add-comment:
    target: "*"
    max: 5
    hide-older-comments: true
  add-labels:
    allowed: [stale, needs-author, needs-review, has-conflicts]
    target: "*"
    max: 10
  create-issue:
    title-prefix: "[stale-prs] "
    labels: [report, agentic]
    max: 1
    close-older-issues: true

timeout-minutes: 15
---

# Stale PR Nudges

Keep pull requests moving. A PR is **stale** when it is open, not a draft marked `do-not-nudge`,
and its last activity (commit, comment, review) is older than `${{ github.event.inputs.stale-days }}` days
(use **7 days** when that value is empty). If this run was triggered by `/nudge` on a PR, only handle that PR
and ignore the age threshold.

## 1. Find candidates

```bash
gh pr list --repo ${{ github.repository }} --state open --json number,title,author,isDraft,updatedAt,reviewDecision,mergeable,labels,reviewRequests,statusCheckRollup --limit 100
```

Skip PRs labelled `do-not-nudge`, and PRs you already nudged in the last 7 days (look for your earlier comment).
Handle at most 5 PRs per run, oldest activity first.

## 2. Diagnose what each PR is waiting on

Read the PR, its reviews and comments, and CI status. Choose exactly one blocker:

- **needs-author**: changes requested, unanswered review comments, or failing CI the author must fix
- **needs-review**: green and complete but no review yet, or review requested and ignored
- **has-conflicts**: `mergeable` is `CONFLICTING`
- **abandoned?**: no author response to two or more prior nudges or requests

For PRs authored by Copilot or other bots, treat `/pr-fix` as the suggested next step when CI is failing.

## 3. Nudge

For each PR post **one** comment, 3 to 5 lines, friendly and specific:

- how long it has been quiet and what it is waiting on
- the single next action and who should take it (mention the author or the requested reviewer by login)
- a concrete helper when relevant: `/pr-fix` for CI failures, "rebase on main" for conflicts

Then add the matching label (`needs-author`, `needs-review`, `has-conflicts`) plus `stale`.
Never close PRs, never push code, never nudge the same PR twice in a row without new activity.

## 4. Digest

If you nudged at least one PR, open one issue with a table: PR, author, days quiet, blocker, action taken.
If no PR is stale, create nothing.
