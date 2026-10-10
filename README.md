# Calorie App + GitHub Agentic Workflows demo

A tiny local calorie tracker (Node 20+, zero dependencies, JSON file storage). It exists to show what
[GitHub Agentic Workflows](https://docs.github.com/en/copilot/concepts/agents/about-github-agentic-workflows)
(`gh-aw`) can do across the whole dev lifecycle.

## Run it

```bash
npm start        # http://localhost:3000
npm test
```

API: `GET /healthz`, `GET /api/metrics`, `GET /api/foods`, `GET /api/entries?date=YYYY-MM-DD`, `POST /api/entries {food, grams, date?}`, `DELETE /api/entries/:id`.
Entries are stored in `data/entries.json` (git-ignored). Seed foods are in `data/foods.json` (per 100 g).

## Agentic workflows

Sources are `.github/workflows/agentic-*.md`; compiled `*.lock.yml` files are generated, never edit them. Recompile with `gh aw compile`.
Slash commands are routed by `agentic_commands.yml` (generated).

| Workflow | Trigger | What it does |
|---|---|---|
| `agentic-issue-triage` | issue opened | labels, type, duplicates, triage report |
| `agentic-repo-assist` | 2x daily, `/repo-assist` | maintainer assistant: triage, fix issues, improvement PRs |
| `agentic-issue-monster` | schedule | dispatches ready issues to the Copilot coding agent |
| `agentic-plan` | daily | roadmap/plan issue from open work |
| `agentic-pr-fix` | `/pr-fix` | fixes failing CI on a PR and pushes to its branch |
| `agentic-ci-doctor` | CI fails | root-cause comment or issue |
| `agentic-daily-test-improver` | daily, `/test-assist` | finds coverage gaps, adds tests |
| `agentic-daily-perf-improver` | daily, `/perf-assist` | finds and benchmarks perf fixes |
| `agentic-doc-updater` | daily | keeps docs in sync with code changes |
| `agentic-repo-status` | daily | upbeat repo status report issue |
| `agentic-security-review` | PR, weekly | inline security review of PRs; weekly repo scan issue |
| `agentic-idea-suggester` | weekly, `/ideas` | proposes 3 new well-scoped feature issues |
| `agentic-deep-research` | weekly, `/research` | reads prod telemetry + repo, files `cookie` issues |
| `agentic-stale-pr-nudge` | daily, `/nudge` | diagnoses what each stale PR waits on, posts one nudge + label, digest issue |
| `agentic-cost-tracker` | after agent runs | AI credit spend report |

### Research - Assign - Observe feedback loop

```
Observe: telemetry-collect.yml (3 simulated prod envs -> /api/metrics artifacts)
   ^                                                      |
   | deploy / merge                          query telemetry
Developer <- iterates <- Copilot <- agentic-issue-monster <- (label: cookie) <- agentic-deep-research
```

1. `telemetry-collect.yml` (plain Actions, every 6h, after CI) runs the app per environment (`prod-1..3`) and uploads `telemetry-prod-N` artifacts.
2. `agentic-deep-research` downloads them, researches the repo, and opens up to 3 `[research]` issues labelled `cookie`.
3. `agentic-issue-monster` assigns `cookie` issues to the Copilot coding agent, which opens PRs; the developer reviews and iterates.
4. Merged changes show up in the next telemetry run, closing the loop. Try it: `gh workflow run telemetry-collect.yml` then `gh aw run agentic-deep-research`.

### Authentication

All workflows use `engine: copilot` with `permissions: copilot-requests: write`, so Copilot requests are
billed through the workflow's `GITHUB_TOKEN`. No `COPILOT_GITHUB_TOKEN` secret is needed.

### Setup

1. Push to a GitHub repo (the repo owner needs Copilot).
2. Create labels: `bug feature question needs-info duplicate invalid spam priority/p0 priority/p1 priority/p2 agentic automation report`.
3. Settings > Actions > General: allow Actions to create pull requests.

### Demo

1. Open an issue ("Let users track fiber") and watch `agentic-issue-triage`.
2. Run `gh aw run agentic-plan` / `agentic-repo-status` for reports.
3. Comment `/repo-assist implement this` on the issue for a PR attempt.
4. Open a PR that breaks a test: `agentic-ci-doctor` diagnoses it, `/pr-fix` repairs it.
5. `/test-assist` and `/perf-assist` for improvement PRs.

Handy: `gh aw status`, `gh aw logs <workflow>`.
