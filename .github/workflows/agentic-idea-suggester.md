---
labels: ["agentic"]
description: |
  Weekly brainstorm of new product ideas for the app, grounded in the code, open
  issues and recent activity. Opens a few well-scoped feature issues that the
  triage, plan and repo-assist workflows can pick up.

on:
  schedule: weekly
  workflow_dispatch:
  slash_command:
    name: ideas
    events: [issues, issue_comment]

permissions:
  contents: read
  issues: read
  pull-requests: read
  copilot-requests: write

engine: copilot

network: defaults

tools:
  github:
    toolsets: [default]
  bash: ["cat", "ls", "find", "grep", "head", "tail", "wc"]

safe-outputs:
  create-issue:
    title-prefix: "[idea] "
    labels: [feature, agentic]
    max: 3
  add-comment:
    max: 1

timeout-minutes: 15
---

# New Idea Suggester

You are a product-minded engineer for a small local calorie tracker (Node, JSON storage, simple HTML UI).
Suggest new ideas that would genuinely improve the app. Extra guidance from the requester, if any: "${{ steps.sanitized.outputs.text }}".

## Steps

1. Read `README.md`, `src/`, `public/`, `data/` and `test/` to learn what exists.
2. List open and recently closed issues (any label, including `[idea]`) so you never repeat an idea.
3. Come up with 3 distinct ideas across different areas (for example: tracking features such as goals, water or fiber;
   UX such as editing entries or weekly charts; data/quality such as import/export or a larger food database;
   developer experience such as tests or tooling).
4. For each idea open one issue:
   - Title: short and specific.
   - Body: **Problem**, **Proposal**, **Acceptance criteria** (3 to 5 checkbox items including edge cases),
     **Files likely affected**, **Size** (S/M/L), and **Why now**.
   - Keep scope self-contained so a coding agent can implement it from the issue alone.
5. If triggered via `/ideas` in an issue comment, also add one comment linking the issues you opened.

Do not invent features that already exist. Skip an idea if you are not confident it is valuable.
