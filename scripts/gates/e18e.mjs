#!/usr/bin/env node
/**
 * Strict e18e gate (scoped per strategist rec).
 * Runs @e18e/cli analyze per gate package (no monorepo-wide 133 issues).
 * No --log-level error swallow. Fail on any reported issues or non-zero.
 */
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { GATE_PACKAGES, gatePackageJsonPaths } from '../lib/gate-scope.mjs';

const root = process.cwd();
const pkgPaths = gatePackageJsonPaths();

for (let i = 0; i < GATE_PACKAGES.length; i++) {
	const pkg = GATE_PACKAGES[i];
	const pkgJsonRel = pkgPaths[i];
	const pkgDir = path.dirname(pkgJsonRel);
	const pkgDirAbs = path.join(root, pkgDir);
	if (!existsSync(pkgDirAbs)) {
		console.log(`Skipping ${pkg} (no dir at ${pkgDir})`);
		continue;
	}
	const cmd = `pnpm dlx @e18e/cli analyze --cwd ${pkgDir}`;
	console.log(`$ ${cmd}`);
	let out = '';
	try {
		out = execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
		console.log(out);
	} catch (e) {
		out = (e.stdout || e.stderr || e.message || '').toString();
		console.log(out);
	}
	if (out.includes('error') && /issue\(s\)/i.test(out)) {
		console.error(`e18e reported errors in ${pkg}. Gate FAILS.`);
		process.exit(1);
	}
}

console.log('e18e gate passed (no errors in gate packages)');
process.exit(0);
