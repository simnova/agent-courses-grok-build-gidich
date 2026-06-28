/**
 * Architecture tests for agentCourses (axc) using ONLY axc-project.ts (per strategy).
 * Real layer boundaries on shipped sources discovered via the package tsconfig.
 * NO bare strings, NO EmptyTestViolation tolerance. expect(violations).toHaveLength(0).
 * Preflight assertLayersResolve() fails fast if globs match 0 files.
 */
import * as api from '@apps/api';
import * as axc from '@axc/axc';
import { describe, expect, it } from 'vitest';
import { assertLayersResolve, axcFiles } from './axc-project.js';

describe('Architecture boundaries (axc healthcheck)', () => {
	it('imports the real @axc/axc healthcheck logic (shipped code)', () => {
		expect(axc).toBeDefined();
		expect(typeof (axc as any).createHealthResponse).toBe('function');
	});

	it('api wires the real hono healthcheck app (shipped)', () => {
		expect(api).toBeDefined();
		expect((api as any).honoApp).toBeDefined();
	});

	it('preflight: layers resolve to actual files (no EmptyTestViolation)', async () => {
		await assertLayersResolve();
	});

	it('axc src tree has no cycles (via axcFiles + tsconfig)', async () => {
		const violations = await axcFiles().inFolder('src').should().haveNoCycles().check();
		if (violations.length > 0) console.dir(violations, { depth: 1 });
		expect(violations).toHaveLength(0);
	});

	it('rest does not depend on persistence (real boundary via axcFiles)', async () => {
		const violations = await axcFiles()
			.inFolder('src/rest')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/persistence')
			.check();
		if (violations.length > 0) console.dir(violations, { depth: 1 });
		expect(violations).toHaveLength(0);
	});

	it('persistence does not depend on rest (real boundary via axcFiles)', async () => {
		const violations = await axcFiles()
			.inFolder('src/persistence')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/rest')
			.check();
		if (violations.length > 0) console.dir(violations, { depth: 1 });
		expect(violations).toHaveLength(0);
	});

	it('domain does not depend on rest or persistence (real core boundary via axcFiles)', async () => {
		const restV = await axcFiles().inFolder('src/domain').shouldNot().dependOnFiles().inFolder('src/rest').check();
		const persV = await axcFiles()
			.inFolder('src/domain')
			.shouldNot()
			.dependOnFiles()
			.inFolder('src/persistence')
			.check();
		const violations = [...restV, ...persV];
		if (violations.length > 0) console.dir(violations, { depth: 1 });
		expect(violations).toHaveLength(0);
	});
});
