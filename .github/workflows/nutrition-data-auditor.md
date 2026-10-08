---
description: Daily audit of seed nutrition data for impossible values, mismatched macros and duplicates; opens one grouped issue.
on:
  schedule: daily
  workflow_dispatch:
permissions:
  contents: read
  issues: read
  copilot-requests: write
engine: copilot
tools:
  bash: ["node *", "cat *"]
safe-outputs:
  create-issue:
    title-prefix: "[data-audit] "
    labels: [data, agent-authored]
    max: 1
    close-older-issues: true
timeout-minutes: 10
---

# Nutrition Data Auditor

Audit `data/foods.json` (per-100g values).

Check each food for:

- kcal differing from `4*protein + 4*carbs + 9*fat` by more than 10% (small foods under 30 kcal may differ by 5 kcal)
- impossible values: negative numbers, macros summing to over 100 g per 100 g, kcal over 900 per 100 g
- duplicate or near-duplicate names (case, plurals)
- missing fields or non-numeric values
- values that look implausible against common nutrition knowledge (say so as "suspicious", with low confidence)

You may use a small `node` script to compute the math. If you find nothing, do not create an issue. Otherwise open one issue containing a table (food, field, found, expected, severity) and a suggested corrected JSON snippet. Do not modify files.
