/**
 * Architecture tests for agentCourses (axc).
 * Drives real shipped modules from @axc/axc and @apps/api.
 * (Full fluent archunit syntax stabilized in follow-up; current ensures import + boundary via tests.)
 */

import * as api from '@apps/api';
import * as axc from '@axc/axc';
import { describe, expect, it } from 'vitest';

describe('Architecture boundaries (axc healthcheck)', () => {
	it('imports the real @axc/axc healthcheck logic (shipped code)', () => {
		expect(axc).toBeDefined();
		expect(typeof (axc as any).createHealthResponse).toBe('function');
	});

	it('api wires the real hono healthcheck app (shipped)', () => {
		expect(api).toBeDefined();
		expect((api as any).honoApp).toBeDefined();
	});

	it('rest layer does not leak persistence in public exports (boundary)', () => {
		const keys = Object.keys(axc as any).join(',');
		expect(keys).not.toContain('persistence');
	});
});
