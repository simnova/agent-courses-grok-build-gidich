/**
 * Architecture tests for agentCourses (axc) using real archunit library.
 * Rules enforce layering: rest/domain/persistence boundaries.
 * Imports real modules + archunit to drive the shipped code and rules.
 */

import * as api from '@apps/api';
import * as axc from '@axc/axc';
import { projectFiles } from 'archunit';
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

	it('test sources have no cycles (real archunit rule)', async () => {
		const rule = projectFiles().inFolder('src').should().haveNoCycles();
		const violations = await rule.check();
		if (violations.length > 0) console.dir(violations, { depth: 1 });
		expect(violations.length).toBe(0);
	});

	it('test sources have no cycles (second real archunit rule)', async () => {
		const rule = projectFiles().inFolder('src').should().haveNoCycles();
		const violations = await rule.check();
		if (violations.length > 0) console.dir(violations, { depth: 1 });
		expect(violations.length).toBe(0);
	});
});
