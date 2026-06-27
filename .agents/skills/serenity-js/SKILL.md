# Serenity JS

Serenity/JS is a framework for writing high-quality acceptance tests and living documentation.

## When to use
- Defining acceptance tests with Gherkin/Cucumber features
- End-to-end BDD scenarios for API healthchecks, user journeys
- Integrating with Cucumber for step definitions, Screenplay pattern
- In packages/axc-verification/acceptance-api

## Key commands in this monorepo
- pnpm --filter @axc-verification/acceptance-api run test:acceptance
- See cucumber.js and serenity config in verification packages

## Extension for agentCourses
Supports verifying the healthcheck endpoint and future experiment flows in parallel worktrees.

This skill was intended via `pnpm dlx skills add serenity-js/serenity-js` (repo reported no SKILL.md at top level at time of scaffold; placeholder added for project config).
