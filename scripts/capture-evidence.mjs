#!/usr/bin/env node
/**
 * Capture-evidence for the plan's ## Verification plan.
 * Runs the exact commands listed in the plan and tees raw stdout/stderr to scratch.
 * Never summarizes — raw output only.
 * Usage: node scripts/capture-evidence.mjs
 * All output goes to /var/folders/sy/ycs0d4hj4552t2dn87x96x780000gn/T/grok-goal-1c5d1bb4bffc/implementer/
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SCRATCH = '/var/folders/sy/ycs0d4hj4552t2dn87x96x780000gn/T/grok-goal-1c5d1bb4bffc/implementer';
fs.mkdirSync(SCRATCH, { recursive: true });
console.log('SCRATCH:', SCRATCH);

function runAndCapture(name, cmd) {
	const logFile = path.join(SCRATCH, `${name}.log`);
	console.log(`\n=== CAPTURING ${name} ===`);
	console.log(`$ ${cmd}`);
	let output = '';
	try {
		output = execSync(cmd, {
			encoding: 'utf8',
			stdio: ['pipe', 'pipe', 'pipe'],
			env: { ...process.env, WORKTREE_NAME: process.env.WORKTREE_NAME || '' },
		});
		fs.writeFileSync(logFile, `$ ${cmd}\n${output}\n`);
		console.log(`Saved to ${logFile}`);
		return 0;
	} catch (e) {
		output = (e.stdout || '') + (e.stderr || '');
		fs.writeFileSync(logFile, `$ ${cmd}\n${output}\nEXIT_CODE: ${e.status || 1}\n`);
		console.error(`Saved (non-zero) to ${logFile}`);
		return e.status || 1;
	}
}

let overall = 0;

// 1. gating
overall |= runAndCapture('gating-1-nvmrc', 'cat .nvmrc');
overall |= runAndCapture('gating-2-node-version', 'node --version');
overall |= runAndCapture(
	'gating-3-packageManager',
	"node -e \"console.log(JSON.parse(require('fs').readFileSync('package.json')).packageManager)\"",
);
overall |= runAndCapture('gating-4-workspace', 'cat pnpm-workspace.yaml');
overall |= runAndCapture('gating-5-lock', 'ls -1 pnpm-lock.yaml');

// 2. build twice
runAndCapture('build-1', 'pnpm install');
overall |= runAndCapture('build-2', 'pnpm run build');
overall |= runAndCapture('build-3', 'pnpm run build');

// 3. verify twice (use orchestrator)
overall |= runAndCapture('verify-1', 'node scripts/verify.mjs');
overall |= runAndCapture('verify-2', 'node scripts/verify.mjs');

// 4. serenity
overall |= runAndCapture('serenity', 'pnpm --filter @axc-verification/acceptance-api run test:acceptance');
runAndCapture(
	'serenity-reports-ls',
	'ls -R packages/axc-verification/acceptance-api/target/reports || echo "NO REPORTS DIR"',
);

// 5. worktree sim — plain prefix + inner echo of $WORKTREE_NAME so output trace proves var reached subprocess
overall |= runAndCapture(
	'worktree-api-build',
	'WORKTREE_NAME=test-agent sh -c \'echo "WORKTREE_NAME=$WORKTREE_NAME"; pnpm --filter @apps/api run build\'',
);
overall |= runAndCapture(
	'worktree-acceptance',
	'WORKTREE_NAME=test-agent sh -c \'echo "WORKTREE_NAME=$WORKTREE_NAME"; pnpm --filter @axc-verification/acceptance-api run test:acceptance\'',
);

// 6. direct healthcheck (tsx to import real src shipped logic directly per plan step 6)
const directCmd =
	'pnpm exec tsx --eval \'import { createHealthResponse } from "./packages/axc/src/rest/healthcheck.ts"; import { honoApp } from "./apps/api/src/index.ts"; (async () => { const pure = createHealthResponse(); console.log("PURE:", JSON.stringify(pure)); const res = await honoApp.request("/health"); const body = await res.json(); console.log("HANDLER:", JSON.stringify(body)); const ok = res.status === 200 && body.status === "ok"; console.log("DIRECT_OK:", ok ? "PASS" : "FAIL"); if (!ok) process.exit(1); })();\'';
overall |= runAndCapture('direct-healthcheck', directCmd);

// 7. structure reads (raw)
runAndCapture('structure-ls', 'ls -R apps packages | head -100');
runAndCapture('structure-readme', 'cat readme.md | head -30');
runAndCapture('structure-license', 'cat LICENSE | head -5');
runAndCapture('structure-portless', 'cat portless.config.cjs');
runAndCapture('structure-features', 'find . -name "*.feature" | grep -v node_modules | head -5');
runAndCapture('structure-biome', 'cat biome.json | head -20');
runAndCapture('structure-turbo', "node -e \"console.dir(require('./turbo.json').tasks?.['dev:worktree'] || {})\"");

// 8. audit + policy
runAndCapture(
	'audit-policy',
	'pnpm audit --audit-level=high --prod --filter @apps/api --filter @axc/axc --filter @axc-verification/* || true',
);
runAndCapture('snyk-policy-check', 'cat .snyk | head -20');

console.log(`\n=== EVIDENCE CAPTURE COMPLETE (overall non-zero bits: ${overall}) ===`);
process.exit(overall === 0 ? 0 : 1);
