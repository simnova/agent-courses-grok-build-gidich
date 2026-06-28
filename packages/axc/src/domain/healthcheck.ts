/**
 * Pure health response type and factory.
 * This is the source of truth for the shipped healthcheck (exercised by archunit, BDD, direct tests, worktrees).
 * Lives in domain/ to enforce layering (rest depends on domain, not vice-versa).
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
