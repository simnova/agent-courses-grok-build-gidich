# agentCourses (axc)

**agentCourses exists to quantify how harness engineering, agentic coding harnesses, and model selection affect software quality and delivery efficiency.**

## Primary Goal

Create a scaffold for a "dark software factory" where coding agents build functionality in isolated git worktrees. All output is exhaustively checked by automated quality, architecture, security, and BDD validation gates before integration.

The initial scaffold establishes:

- Monorepo architecture (pnpm + Turborepo)
- Local developer workflow
- Agent workflow
- Quality gates (biome, typescript, knip, e18e, archunit, serenity BDD, pnpm audit, snyk)
- Minimal healthcheck feature with full validation
- Clear extension points (no over-building of domain for courses/experiments/runs/metrics yet)

## Non-goals (initial)

- Full domain models for experiments, runs, agents, metrics
- Complete docs site / MADRs
- Full CI / deploy bundles

## Directory Layout

```
apps/
  api/                 # Hono + @marplex/hono-azurefunc-adapter (azure compat)
  docs/                # Docusaurus skeleton
packages/
  axc/                 # core "dark factory" logic
    rest/              # hono routes + healthcheck
    domain/
    application-services/
    persistence/
    service-mongoose/
  domain/              # shared domain seedwork
  axc-verification/
    acceptance-api/    # Serenity + Cucumber BDD
    archunit-tests/    # arch rules
  cellix/*             # selective reimplemented configs/seedworks
```

## Getting Started (Local)

Requires: Node 24 (see .nvmrc), pnpm (locked via packageManager).

```bash
nvm use
pnpm install
pnpm build
pnpm verify
```

### Dev (with portless isolation)

```bash
pnpm dev
# or worktree-isolated (multi-agent)
WORKTREE_NAME=my-agent pnpm dev:worktree
```

The healthcheck is at `https://api.axc.localhost/health` (or per WORKTREE_NAME).

## Agent / Worktree Workflow

- Use `WORKTREE_NAME=agent-foo` to get isolated ports/hostnames via portless + turbo pass-through.
- All changes in worktree must pass the full verify on pre-commit (husky).
- Serenity acceptance tests run the *real* code under the env var (parallel safe).
- Mongo memory server isolates per worktree.

## Quality Gates (Husky + verify)

Pre-commit runs:
- `format:staged` (biome)
- `verify`

`pnpm verify` (and CI) executes:
- biome format:check + lint
- e18e analyze (`pnpm analyze`)
- TypeScript compilation (tsc via turbo build)
- knip (unused code/deps)
- archunit
- serenity acceptance (BDD healthcheck)
- pnpm audit (prod high + dev critical)
- snyk (test)

All must pass with zero failures.

## Healthcheck Feature (Minimal + Validated)

Standard endpoint implemented in `@axc/axc/rest/healthcheck.ts` (pure + importable):

```ts
import { createHealthResponse } from '@axc/axc/rest/healthcheck';
import { honoApp } from '@apps/api';

const res = await honoApp.request('/health');
```

Validated by:
- Direct unit/BDD (ships the code)
- Arch rules
- Worktree simulation
- Azure adapter wiring

### Extension Points (for future metrics)

See comments in:
- `packages/axc/src/rest/healthcheck.ts`
- `packages/axc/src/domain/...`
- `packages/axc/src/application-services/...`
- `packages/axc/src/persistence/...`

Planned (not implemented):
- experiment / run / model identifiers in health/details
- harness version + quality score reporting
- real dependency liveness (db, queues)

## Supply Chain Policy (Non-negotiable)

- pnpm only (no npm/yarn)
- `packageManager: "pnpm@11.9.0"`
- `pnpm-lock.yaml` committed
- `allowBuilds: {}` (zero by default in pnpm-workspace.yaml)
- Only `mongodb-memory-server-core` (avoids hooks); document + justify any future exceptions in readme + workspace
- `--ignore-scripts` used on adds where possible
- All runtime in Node 24+

## Agentic Tooling (Scaffolded)

- `.agents/skills/` (turborepo, portless, mongodb/*, serenity-js placeholder)
- `skills-lock.json`
- `.vscode/mcp.json` (e18e + mongodb)
- `pnpm dlx skills add ...` used

## Scripts (key)

- `pnpm build` (runs `turbo run build`)
- `pnpm verify`
- `turbo run test:acceptance --filter=@axc-verification/acceptance-api`
- `turbo run test:arch --filter=@axc-verification/archunit-tests`
- `WORKTREE_NAME=foo turbo run build --filter=@apps/api`

## License

MIT (see LICENSE)

## Inspiration

Architecture and guardrail patterns inspired by CellixJs/cellixjs (reimplemented; modernized to Node 24, hono, strict zero-build default policy, no GraphQL).

Contributions welcome for harness experiments.
