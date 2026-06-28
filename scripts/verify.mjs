#!/usr/bin/env node
/**
 * Strict verify orchestrator for agentCourses.
 * Replaces the opaque shell chain in package.json#verify.
 * No || true, no --no-exit-code hacks inside the orchestrator.
 * Runs named steps; prints step + exit code; exits 1 on first failure.
 * Supports `node scripts/verify.mjs --only <step>` for incremental verification.
 *
 * Steps are designed per strategy:
 * - biome direct (centralized, covers lint + format checks via biome)
 * - analyze (e18e)
 * - scoped turbo build / test:arch / test:acceptance (only gate-required packages)
 * - knip (strict)
 * - audit (strict)
 * - snyk (clean via .snyk policy)
 */

import { execSync } from 'child_process';
import process from 'process';

const args = process.argv.slice(2);
let onlyStep = null;
if (args.includes('--only')) {
	const idx = args.indexOf('--only');
	onlyStep = args[idx + 1];
}

function runStep(name, cmd) {
	console.log(`\n=== STEP: ${name} ===`);
	console.log(`$ ${cmd}`);
	let exitCode = 0;
	try {
		execSync(cmd, { stdio: 'inherit', env: process.env });
		console.log(`STEP ${name} exited 0`);
	} catch (e) {
		exitCode = e.status || 1;
		console.log(`STEP ${name} exited ${exitCode}`);
	}
	if (exitCode !== 0) {
		console.error(`\nVERIFY FAILED at step: ${name}`);
		process.exit(exitCode);
	}
}

const allSteps = [
	{ name: 'biome', cmd: 'pnpm exec biome check .' },
	{ name: 'format:check', cmd: 'pnpm exec biome format .' },
	{ name: 'analyze', cmd: 'pnpm run analyze' },
	{ name: 'build', cmd: 'pnpm exec turbo run build' },
	{ name: 'test:arch', cmd: 'pnpm exec turbo run test:arch' },
	{ name: 'test:acceptance', cmd: 'pnpm exec turbo run test:acceptance' },
	{ name: 'knip', cmd: 'pnpm run knip' },
	{ name: 'audit', cmd: 'pnpm run audit' },
	{ name: 'snyk', cmd: 'pnpm run snyk' },
];

if (onlyStep) {
	const step = allSteps.find((s) => s.name === onlyStep);
	if (!step) {
		console.error(`Unknown step: ${onlyStep}`);
		console.error('Available:', allSteps.map((s) => s.name).join(', '));
		process.exit(1);
	}
	runStep(step.name, step.cmd);
	console.log(`\n=== ONLY ${onlyStep} PASSED ===`);
	process.exit(0);
}

// Full run
for (const step of allSteps) {
	runStep(step.name, step.cmd);
}

console.log('\n=== VERIFY PASSED (all steps exited 0) ===');
process.exit(0);
