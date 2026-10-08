# Calorie App + GitHub Agentic Workflows demo

A tiny local calorie tracker (Node 20+, zero dependencies, JSON file storage). It exists to show what
[GitHub Agentic Workflows](https://docs.github.com/en/copilot/concepts/agents/about-github-agentic-workflows)
(`gh-aw`) can do across the whole dev lifecycle.

## Run it

```bash
npm start        # http://localhost:3000
npm test
```

API: `GET /api/foods`, `GET /api/entries?date=YYYY-MM-DD`, `POST /api/entries {food, grams, date?}`, `DELETE /api/entries/:id`.
Entries are stored in `data/entries.json` (git-ignored). Seed foods are in `data/foods.json` (per 100 g).
Each food's `per100g` may include a `fiber` value (grams); entries and daily totals include a scaled
`fiber` field alongside kcal/protein/carbs/fat, with missing/legacy fiber treated as `0`.

## Agentic workflows

Sources are `.github/workflows/*.md`; compiled `*.lock.yml` files are generated, never edit them. Recompile with `gh aw compile`.

| Stage | Workflow | Trigger | Output |
|---|---|---|---|
| Idea | `idea-triager` | issue opened | labels + acceptance criteria comment |
| Design | `spec-writer` | `/spec` comment | spec comment, `spec-ready` label |
| Build | `issue-implementer` | `/implement` comment | draft PR with code, tests, docs |
| Review | `calorie-math-reviewer` | PR opened/updated | inline review on kcal math, units, rounding, validation |
| Data | `nutrition-data-auditor` | daily | one grouped issue of bad nutrition data |
| Ops | `ci-doctor` | CI fails | root-cause comment or issue |
| Docs/Report | `docs-and-weekly-report` | weekly | README-sync PR + weekly report issue |

### Authentication

All workflows use `engine: copilot` with `permissions: copilot-requests: write`, so Copilot requests are
billed through the workflow's `GITHUB_TOKEN`. No `COPILOT_GITHUB_TOKEN` secret is needed.

### Setup

1. Push to a GitHub repo (the repo owner needs Copilot).
2. Create labels: `bug feature data question needs-info ready-for-spec spec-ready agent-authored ci documentation report`.
3. Settings > Actions > General: allow Actions to create pull requests.

### End-to-end demo (about 15 min)

1. Open an issue: "Let users track fiber".  `idea-triager` labels it and writes acceptance criteria.
2. Comment `/spec`.  A design appears.
3. Comment `/implement`.  A draft PR appears with tests.
4. `calorie-math-reviewer` reviews the PR. Try a PR that changes fat to 4 kcal/g to see it flag the formula.
5. Push a failing test.  `ci-doctor` diagnoses the red build.
6. Add `{"name":"Mystery bar","per100g":{"kcal":50,"protein":30,"carbs":30,"fat":30}}` to `data/foods.json`, then run `gh aw run nutrition-data-auditor`.
7. `gh aw run docs-and-weekly-report` for the README sync and weekly report.

Handy: `gh aw status`, `gh aw logs <workflow>`.
