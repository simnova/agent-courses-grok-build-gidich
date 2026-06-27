/**
 * Pure, importable healthcheck logic for agentCourses "dark software factory".
 * This is the shipped implementation exercised by:
 * - unit tests
 * - archunit architecture tests
 * - Serenity BDD steps (directly, no server)
 * - worktree-isolated acceptance runs
 *
 * Extension points:
 * - TODO: add experimentId, runId, modelId, harnessVersion metrics to details
 * - TODO: integrate real dependency health (mongoose ping, queue depth)
 * - TODO: return degraded status on partial failures for observability
 */
export interface HealthResponse {
	status: 'ok' | 'degraded';
	timestamp: string;
	service: string;
	version: string;
	details?: Record<string, unknown>;
}

export const DEFAULT_SERVICE = 'axc-api';

export function createHealthResponse(overrides?: Partial<HealthResponse>): HealthResponse {
	const now = new Date().toISOString();
	return {
		status: 'ok',
		timestamp: now,
		service: DEFAULT_SERVICE,
		version: process.env.AXC_VERSION || process.env.npm_package_version || '0.1.0',
		...(overrides?.details ? { details: overrides.details } : {}),
		...overrides,
	};
}

/**
 * Lightweight hono route fragment for health.
 * Import and use: app.route('/health', healthRouter)
 */
import { Hono } from 'hono';

export const healthRouter = new Hono();

healthRouter.get('/', (c) => {
	return c.json(createHealthResponse());
});

// Future: /health/ready , /health/live with more checks
