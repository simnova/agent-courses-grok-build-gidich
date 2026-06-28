/**
 * Hono REST adapter for healthcheck.
 * Imports the pure implementation from domain/ (source of truth) to enforce arch layering:
 * rest depends on domain; domain does not depend on rest.
 * Re-exports createHealthResponse for consumers (BDD, direct tests, archunit).
 *
 * Extension points documented in domain/healthcheck.ts
 */

import { Hono } from 'hono';
import { createHealthResponse } from '../domain/healthcheck.js';

export type { HealthResponse } from '../domain/healthcheck.js';
export { createHealthResponse } from '../domain/healthcheck.js';

/**
 * Lightweight hono route fragment for health.
 * Import and use: app.route('/health', healthRouter)
 */
export const healthRouter = new Hono();

healthRouter.get('/', (c) => {
	return c.json(createHealthResponse());
});

// Future: /health/ready , /health/live with more checks
