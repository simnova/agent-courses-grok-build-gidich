#!/usr/bin/env node
/**
 * Strict snyk gate (scoped per strategist rec).
 * Per-package snyk test using GATE_PACKAGES only (no --all-projects, no docs transitive).
 * No || true, no output.includes heuristics for pass/fail.
 * Exit 1 on first non-zero from snyk CLI; .snyk policy is the only ignore mechanism.
 */
import { execSync } from 'child_process';
import { GATE_PACKAGES, gatePackageJsonPaths } from '../lib/gate-scope.mjs';

const paths = gatePackageJsonPaths();

for (const pkgPath of paths) {
	const cmd = `pnpm exec snyk test --file=${pkgPath} --policy-path=.snyk --severity-threshold=high`;
	console.log(`$ ${cmd}`);
	try {
		execSync(cmd, { stdio: 'inherit' });
	} catch (e) {
		console.error(`SNYK findings (or error) for ${pkgPath}. Gate FAILS.`);
		process.exit(1);
	}
}

console.log('SNYK gate passed (all gate packages clean per .snyk policy)');
process.exit(0);
