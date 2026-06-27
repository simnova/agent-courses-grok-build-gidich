/**
 * Domain primitives for health (extension point).
 * Future: value objects for HealthStatus, dependency checks etc.
 */
export type HealthStatus = 'ok' | 'degraded' | 'unhealthy';
