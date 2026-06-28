#!/usr/bin/env node
/**
 * Strict audit gate.
 * Calls pnpm audit directly with && (no ||, no ;, no forced exit 0).
 * Scope limited to gate packages so docs transitive vulns don't force swallows.
 */
import { execSync } from 'child_process';
import { TURBO_FILTER_ARGS } from '../lib/gate-scope.mjs';

const filter = TURBO_FILTER_ARGS.replace(/--filter=/g, '--filter '); // pnpm audit uses space or repeated --filter pkg

try {
	// Prod high on gate packages only
	execSync(
		`pnpm audit --audit-level=high --prod --filter @apps/api --filter @axc/axc --filter @axc/domain --filter @axc-verification/acceptance-api --filter @axc-verification/archunit-tests`,
		{ stdio: 'inherit' },
	);
	// Dev critical on gate packages
	execSync(
		`pnpm audit --audit-level=critical --dev --filter @apps/api --filter @axc/axc --filter @axc/domain --filter @axc-verification/acceptance-api --filter @axc-verification/archunit-tests`,
		{ stdio: 'inherit' },
	);
	console.log('AUDIT gate passed (0 high in prod gate pkgs, 0 critical in dev gate pkgs)');
	process.exit(0);
} catch (e) {
	console.error('AUDIT findings reported (see above). Gate FAILS on high/critical in scoped packages.');
	process.exit(1);
}
